'use client';

import React, { useState, useRef, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, isWithinInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface SelectorSemanasProps {
  fechaInicio: Date;
  fechaFin: Date;
  onFechasChange: (fechaInicio: Date, fechaFin: Date) => void;
  modoSeleccion?: 'semana' | 'dia' | 'rango';
  onModoSeleccionChange?: (modo: 'semana' | 'dia' | 'rango') => void;
}

const SelectorSemanasMejorado: React.FC<SelectorSemanasProps> = ({
  fechaInicio,
  fechaFin,
  onFechasChange,
  modoSeleccion = 'semana',
  onModoSeleccionChange
}) => {
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [seleccionandoRango, setSeleccionandoRango] = useState(false);
  const [fechaInicioTemp, setFechaInicioTemp] = useState<Date | null>(null);
  const [mesCurrent, setMesCurrent] = useState<Date>(new Date());
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const opcionesRef = useRef<HTMLDivElement>(null);

  // Formatear fechas para mostrar
  const formatoFecha = (fecha: Date) => {
    return format(fecha, 'dd/MM/yyyy', { locale: es });
  };

  const formatoFechaCorto = (fecha: Date) => {
    return format(fecha, 'dd/MM', { locale: es });
  };

  // Mostrar el texto de rango según el modo
  const obtenerTextoRango = () => {
    switch (modoSeleccion) {
      case 'semana':
        return `${formatoFecha(fechaInicio)} - ${formatoFecha(fechaFin)}`;
      case 'dia':
        return formatoFecha(fechaInicio);
      case 'rango':
        return `${formatoFecha(fechaInicio)} - ${formatoFecha(fechaFin)}`;
      default:
        return '';
    }
  };

  // Cambiar a la semana anterior o siguiente
  const cambiarSemana = (direccion: 'anterior' | 'siguiente') => {
    if (modoSeleccion === 'semana') {
      const nuevaFechaInicio = direccion === 'anterior'
        ? subWeeks(fechaInicio, 1)
        : addWeeks(fechaInicio, 1);
      const nuevaFechaFin = endOfWeek(nuevaFechaInicio, { weekStartsOn: 1 });
      onFechasChange(nuevaFechaInicio, nuevaFechaFin);
    } else if (modoSeleccion === 'dia') {
      const nuevaFecha = direccion === 'anterior'
        ? addDays(fechaInicio, -1)
        : addDays(fechaInicio, 1);
      onFechasChange(nuevaFecha, nuevaFecha);
    } else {
      // En modo rango, moverse por periodos de 7 días
      const dias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
      const nuevaFechaInicio = direccion === 'anterior'
        ? addDays(fechaInicio, -dias)
        : addDays(fechaInicio, dias);
      const nuevaFechaFin = direccion === 'anterior'
        ? addDays(fechaFin, -dias)
        : addDays(fechaFin, dias);
      onFechasChange(nuevaFechaInicio, nuevaFechaFin);
    }
  };

  // Ir al día actual
  const irAHoy = () => {
    const hoy = new Date();
    if (modoSeleccion === 'semana') {
      const inicio = startOfWeek(hoy, { weekStartsOn: 1 });
      const fin = endOfWeek(hoy, { weekStartsOn: 1 });
      onFechasChange(inicio, fin);
    } else if (modoSeleccion === 'dia') {
      onFechasChange(hoy, hoy);
    } else {
      // En modo rango, mantener la misma cantidad de días pero empezar hoy
      const dias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
      onFechasChange(hoy, addDays(hoy, dias));
    }
    setMesCurrent(hoy);
  };

  // Cambiar el modo de selección
  const cambiarModoSeleccion = (modo: 'semana' | 'dia' | 'rango') => {
    if (onModoSeleccionChange) {
      onModoSeleccionChange(modo);
      
      // Ajustar fechas según el nuevo modo
      const fechaBase = fechaInicio;
      if (modo === 'semana') {
        const inicio = startOfWeek(fechaBase, { weekStartsOn: 1 });
        const fin = endOfWeek(fechaBase, { weekStartsOn: 1 });
        onFechasChange(inicio, fin);
      } else if (modo === 'dia') {
        onFechasChange(fechaBase, fechaBase);
      } else if (modo === 'rango') {
        // Mantener el rango actual
        onFechasChange(fechaInicio, fechaFin);
      }
    }
    setMostrarOpciones(false);
  };

  // Generar días para el calendario
  const generarCalendario = () => {
    const año = mesCurrent.getFullYear();
    const mes = mesCurrent.getMonth();
    
    // Primer día del mes
    const primerDia = new Date(año, mes, 1);
    // Ajustar para que la semana empiece el lunes (1) en lugar del domingo (0)
    let diaSemana = primerDia.getDay();
    diaSemana = diaSemana === 0 ? 6 : diaSemana - 1;
    
    // Número de días en el mes
    const diasEnMes = new Date(año, mes + 1, 0).getDate();
    
    // Dias de la semana para encabezados
    const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    
    // Generar array de días
    const dias = [];
    
    // Agregar días del mes anterior para completar la primera semana
    for (let i = 0; i < diaSemana; i++) {
      const dia = new Date(año, mes, -diaSemana + i + 1);
      dias.push({
        fecha: dia,
        esMesActual: false,
        esHoy: isSameDay(dia, new Date()),
        estaSeleccionado: esSeleccionado(dia),
        estaEnRango: estaEnRangoSeleccionado(dia)
      });
    }
    
    // Agregar días del mes actual
    for (let i = 1; i <= diasEnMes; i++) {
      const dia = new Date(año, mes, i);
      dias.push({
        fecha: dia,
        esMesActual: true,
        esHoy: isSameDay(dia, new Date()),
        estaSeleccionado: esSeleccionado(dia),
        estaEnRango: estaEnRangoSeleccionado(dia)
      });
    }
    
    // Agregar días del mes siguiente para completar la última semana
    const diasRestantes = 7 - (dias.length % 7);
    if (diasRestantes < 7) {
      for (let i = 1; i <= diasRestantes; i++) {
        const dia = new Date(año, mes + 1, i);
        dias.push({
          fecha: dia,
          esMesActual: false,
          esHoy: isSameDay(dia, new Date()),
          estaSeleccionado: esSeleccionado(dia),
          estaEnRango: estaEnRangoSeleccionado(dia)
        });
      }
    }
    
    return { diasSemana, dias };
  };

  // Verificar si una fecha está seleccionada
  const esSeleccionado = (fecha: Date): boolean => {
    if (modoSeleccion === 'dia') {
      return isSameDay(fecha, fechaInicio);
    } else if (modoSeleccion === 'semana' || modoSeleccion === 'rango') {
      return isSameDay(fecha, fechaInicio) || isSameDay(fecha, fechaFin);
    }
    return false;
  };

  // Verificar si una fecha está en el rango seleccionado
  const estaEnRangoSeleccionado = (fecha: Date): boolean => {
    if (modoSeleccion === 'dia') {
      return false;
    }
    
    try {
      return isWithinInterval(fecha, { start: fechaInicio, end: fechaFin }) &&
        !isSameDay(fecha, fechaInicio) && !isSameDay(fecha, fechaFin);
    } catch (e) {
      return false;
    }
  };

  // Manejar selección de fecha en el calendario
  const seleccionarFecha = (fecha: Date) => {
    if (modoSeleccion === 'dia') {
      onFechasChange(fecha, fecha);
      setMostrarCalendario(false);
    } else if (modoSeleccion === 'semana') {
      const inicio = startOfWeek(fecha, { weekStartsOn: 1 });
      const fin = endOfWeek(fecha, { weekStartsOn: 1 });
      onFechasChange(inicio, fin);
      setMostrarCalendario(false);
    } else if (modoSeleccion === 'rango') {
      if (!seleccionandoRango || !fechaInicioTemp) {
        setFechaInicioTemp(fecha);
        setSeleccionandoRango(true);
      } else {
        // Ordenar las fechas (la menor es inicio, la mayor es fin)
        const [inicio, fin] = [fechaInicioTemp, fecha].sort((a, b) => a.getTime() - b.getTime());
        onFechasChange(inicio, fin);
        setFechaInicioTemp(null);
        setSeleccionandoRango(false);
        setMostrarCalendario(false);
      }
    }
  };

  // Cambiar mes en el calendario
  const cambiarMes = (direccion: 'anterior' | 'siguiente') => {
    const nuevoMes = new Date(mesCurrent);
    nuevoMes.setMonth(nuevoMes.getMonth() + (direccion === 'anterior' ? -1 : 1));
    setMesCurrent(nuevoMes);
  };

  // Cerrar el calendario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setMostrarCalendario(false);
        setSeleccionandoRango(false);
        setFechaInicioTemp(null);
      }
      if (opcionesRef.current && !opcionesRef.current.contains(event.target as Node)) {
        setMostrarOpciones(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generar lista de semanas para selección rápida
  const generarListaSemanas = () => {
    const semanas = [];
    const hoy = new Date();
    
    // Generar 12 semanas hacia atrás y 12 hacia adelante
    for (let i = -12; i <= 12; i++) {
      const fecha = i === 0 ? hoy : (i < 0 ? subWeeks(hoy, Math.abs(i)) : addWeeks(hoy, i));
      const inicioSem = startOfWeek(fecha, { weekStartsOn: 1 });
      const finSem = endOfWeek(fecha, { weekStartsOn: 1 });
      
      semanas.push({
        fechaInicio: inicioSem,
        fechaFin: finSem,
        texto: `${formatoFechaCorto(inicioSem)} - ${formatoFechaCorto(finSem)}`,
        esSemanaActual: i === 0,
        esSemanaSeleccionada: 
          format(fechaInicio, 'yyyy-MM-dd') === format(inicioSem, 'yyyy-MM-dd') &&
          format(fechaFin, 'yyyy-MM-dd') === format(finSem, 'yyyy-MM-dd')
      });
    }
    
    return semanas;
  };

  // Información sobre el modo actual
  const textoModo = (() => {
    switch (modoSeleccion) {
      case 'semana': return 'Semana';
      case 'dia': return 'Día';
      case 'rango': return 'Rango personalizado';
      default: return '';
    }
  })();

  const calendar = generarCalendario();

  return (
    <div className="relative">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between bg-white border rounded-lg shadow-sm p-2">
          {/* Botón de configuración */}
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
            onClick={() => setMostrarOpciones(!mostrarOpciones)}
            aria-label="Opciones de vista"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          {/* Botón anterior */}
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
            onClick={() => cambiarSemana('anterior')}
            aria-label="Anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Indicador de fecha actual y botón para abrir calendario */}
          <div 
            className="flex-1 flex flex-col items-center cursor-pointer select-none"
            onClick={() => setMostrarCalendario(!mostrarCalendario)}
          >
            <div className="font-medium text-gray-800">
              {obtenerTextoRango()}
            </div>
            <div className="text-xs text-gray-500">
              {modoSeleccion === 'semana' && `Semana del ${format(fechaInicio, "d 'de' MMMM", { locale: es })}`}
              {modoSeleccion === 'dia' && `${format(fechaInicio, "EEEE, d 'de' MMMM", { locale: es })}`}
              {modoSeleccion === 'rango' && `${Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1} días`}
            </div>
          </div>
          
          {/* Botón hoy */}
          <button 
            type="button"
            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
            onClick={irAHoy}
          >
            Hoy
          </button>
          
          {/* Botón siguiente */}
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
            onClick={() => cambiarSemana('siguiente')}
            aria-label="Siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Indicador de modo (solo visible en móviles) */}
        <div className="text-xs text-gray-500 text-center md:hidden">
          Modo: {textoModo} - Toque para cambiar
        </div>
      </div>
      
      {/* Menú de opciones */}
      {mostrarOpciones && (
        <div 
          ref={opcionesRef}
          className="absolute z-40 mt-1 bg-white border rounded-md shadow-lg p-3 w-48 right-0"
        >
          <div className="mb-2 pb-2 border-b">
            <div className="font-medium text-gray-700">Tipo de vista</div>
          </div>
          
          <div className="space-y-1">
            <div 
              className={`p-2 rounded cursor-pointer flex items-center ${modoSeleccion === 'semana' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}
              onClick={() => cambiarModoSeleccion('semana')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Semana</span>
            </div>
            
            <div 
              className={`p-2 rounded cursor-pointer flex items-center ${modoSeleccion === 'dia' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}
              onClick={() => cambiarModoSeleccion('dia')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Día</span>
            </div>
            
            <div 
              className={`p-2 rounded cursor-pointer flex items-center ${modoSeleccion === 'rango' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}
              onClick={() => cambiarModoSeleccion('rango')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Rango personalizado</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Calendario Popup */}
      {mostrarCalendario && (
        <div 
          ref={calendarRef}
          className="absolute z-30 mt-1 bg-white border rounded-lg shadow-lg p-4 w-80 max-h-[36rem] overflow-hidden"
        >
          {/* Encabezado del calendario */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              className="p-1 rounded-md hover:bg-gray-100 text-gray-700"
              onClick={() => cambiarMes('anterior')}
              aria-label="Mes anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="font-medium text-gray-800">
              {format(mesCurrent, 'MMMM yyyy', { locale: es })}
            </div>
            
            <button
              type="button"
              className="p-1 rounded-md hover:bg-gray-100 text-gray-700"
              onClick={() => cambiarMes('siguiente')}
              aria-label="Mes siguiente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {calendar.diasSemana.map((dia, idx) => (
              <div key={idx} className="text-center text-xs font-medium text-gray-500">
                {dia}
              </div>
            ))}
          </div>
          
          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {calendar.dias.map((dia, idx) => (
              <div 
                key={idx} 
                className={`
                  p-2 text-center text-sm rounded-md cursor-pointer select-none
                  ${!dia.esMesActual ? 'text-gray-400' : 'text-gray-800'}
                  ${dia.esHoy ? 'ring-2 ring-blue-200' : ''}
                  ${dia.estaSeleccionado ? 'bg-blue-600 text-white hover:bg-blue-700' : 
                    dia.estaEnRango ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                    'hover:bg-gray-100'}
                `}
                onClick={() => seleccionarFecha(dia.fecha)}
              >
                {dia.fecha.getDate()}
              </div>
            ))}
          </div>
          
          {/* Instrucciones para selección de rango */}
          {modoSeleccion === 'rango' && (
            <div className="mt-4 text-xs text-gray-500">
              {seleccionandoRango && fechaInicioTemp ? 
                'Ahora selecciona la fecha final del rango' : 
                'Selecciona la fecha inicial del rango'}
            </div>
          )}
          
          {/* Selección rápida de semanas */}
          {modoSeleccion === 'semana' && (
            <div className="mt-4 border-t pt-4 max-h-48 overflow-y-auto">
              <div className="text-xs font-medium text-gray-700 mb-2">Selección rápida</div>
              <div className="space-y-1">
                {generarListaSemanas().map((semana, idx) => (
                  <div 
                    key={idx}
                    className={`text-xs p-1.5 rounded cursor-pointer ${
                      semana.esSemanaSeleccionada ? 'bg-blue-600 text-white' : 
                      semana.esSemanaActual ? 'bg-blue-50 text-blue-700 font-medium' :
                      'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      onFechasChange(semana.fechaInicio, semana.fechaFin);
                      setMostrarCalendario(false);
                    }}
                  >
                    {semana.texto}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectorSemanasMejorado;