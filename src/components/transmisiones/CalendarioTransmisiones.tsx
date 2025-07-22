// src/components/transmisiones/CalendarioTransmisiones.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  ESTADOS_TRANSMISION, 
  normalizarDiaSemana 
} from './constants';
import SelectorCalendario from './SelectorCalendario';

// Definimos el tipo para los reportes
export interface Reporte {
  id_reporte?: number;
  filialId: number;
  programaId: number;
  fecha: string;
  estado: 'si' | 'no' | 'tarde' | 'pendiente';
  estadoTransmision?: string;
  target?: string | null;
  motivo?: string | null;
  horaReal?: string | null;
  hora?: string | null;
  hora_tt?: string | null;
}

// Definimos el tipo para los programas
export interface Programa {
  id: string | number;
  nombre: string;
  diasSemana?: string[];
  horario?: string;
  horaInicio?: string;
  estado?: string;
  isActivo?: boolean;
  filialId?: string | number;
  filialesIds?: (string | number)[];
}

// Funciones de utilidad para manejo de fechas
const formatFecha = (fecha: Date): string => {
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-');
};

const formatMesAno = (fecha: Date): string => {
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long'
  });
};

const getDiaSemana = (fecha: Date): string => {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long'
  }).toUpperCase();
};

const getDiaSemanaCorto = (index: number): string => {
  const dias = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
  return dias[index];
};

const esMismoDia = (fecha1: Date, fecha2: Date): boolean => {
  return fecha1.getDate() === fecha2.getDate() &&
         fecha1.getMonth() === fecha2.getMonth() &&
         fecha1.getFullYear() === fecha2.getFullYear();
};

const esHoy = (fecha: Date): boolean => {
  const hoy = new Date();
  return esMismoDia(fecha, hoy);
};

const esMismoMes = (fecha1: Date, fecha2: Date): boolean => {
  return fecha1.getMonth() === fecha2.getMonth() &&
         fecha1.getFullYear() === fecha2.getFullYear();
};

const getInicioMes = (fecha: Date): Date => {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setDate(1);
  return nuevaFecha;
};

const getFinMes = (fecha: Date): Date => {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
  nuevaFecha.setDate(0);
  return nuevaFecha;
};

const getDiasMes = (fecha: Date): Date[] => {
  const inicioMes = getInicioMes(fecha);
  const finMes = getFinMes(fecha);
  const dias: Date[] = [];
  
  for (let d = new Date(inicioMes); d <= finMes; d.setDate(d.getDate() + 1)) {
    dias.push(new Date(d));
  }
  
  return dias;
};

const getDiasSemana = (fecha: Date): Date[] => {
  const dia = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
  const inicioSemana = new Date(fecha);
  inicioSemana.setDate(fecha.getDate() - (dia === 0 ? 6 : dia - 1)); // Ajustar para que la semana empiece en lunes
  
  const dias: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(inicioSemana);
    fecha.setDate(inicioSemana.getDate() + i);
    dias.push(fecha);
  }
  
  return dias;
};

export interface CalendarioTransmisionesProps {
  filialId: number;
  programas: Programa[];
  reportes: Reporte[];
  onFechaClick: (fecha: string, programaId: number, filialId: number) => void;
}

export default function CalendarioTransmisiones({ 
  filialId, 
  programas, 
  reportes, 
  onFechaClick 
}: CalendarioTransmisionesProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(getInicioMes(new Date()));
  const [programaSeleccionado, setProgramaSeleccionado] = useState<number | null>(null);
  const [vistaActual, setVistaActual] = useState<'mes' | 'semana' | 'dia' | 'programa'>('mes');
  
  // Cuando cambian los programas, seleccionar el primero
  useEffect(() => {
    if (programas.length > 0 && !programaSeleccionado) {
      setProgramaSeleccionado(Number(programas[0].id));
    }
  }, [programas, programaSeleccionado]);

  // Manejar cambio de vista
  const handleViewChange = (vista: 'mes' | 'semana' | 'dia' | 'programa') => {
    setVistaActual(vista);
  };
  
  // Manejar cambio de fecha
  const handleDateChange = (fecha: Date) => {
    setSelectedDate(fecha);
    setCurrentMonth(getInicioMes(fecha));
  };
  
  // Obtener días según la vista seleccionada
  const getDiasSegunVista = () => {
    switch (vistaActual) {
      case 'mes':
        return getDiasMes(currentMonth);
      case 'semana':
        return getDiasSemana(selectedDate);
      case 'dia':
        return [selectedDate];
      case 'programa':
        return getDiasMes(currentMonth);
      default:
        return getDiasMes(currentMonth);
    }
  };
  
  // Verificar si un programa transmite en un día específico
  const programaTransmiteEnDia = (programa: Programa, diaSemana: string): boolean => {
    if (!programa.diasSemana || programa.diasSemana.length === 0) {
      return false;
    }
    
    const diaNormalizado = normalizarDiaSemana(diaSemana);
    return programa.diasSemana.some(d => normalizarDiaSemana(d) === diaNormalizado);
  };
  
  // Obtener reporte para una fecha y programa específicos
  const getReporte = (fecha: string, programaId: number): Reporte | undefined => {
    return reportes.find(r => 
      r.fecha === fecha && 
      r.programaId === programaId &&
      r.filialId === filialId
    );
  };
  
  // Obtener color según el estado del reporte
  const getColorByEstado = (estado?: string): string => {
    switch (estado) {
      case ESTADOS_TRANSMISION.SI_TRANSMITIO:
        return 'bg-emerald-500';
      case ESTADOS_TRANSMISION.NO_TRANSMITIO:
        return 'bg-red-500';
      case ESTADOS_TRANSMISION.TRANSMITIO_TARDE:
        return 'bg-amber-500';
      default:
        return 'bg-gray-200';
    }
  };
  
  // Renderizar tooltip de información
  const renderTooltip = (reporte?: Reporte): React.ReactNode => {
    if (!reporte) {
      return <div className="font-bold">Pendiente</div>;
    }
    
    switch (reporte.estado) {
      case ESTADOS_TRANSMISION.SI_TRANSMITIO:
        return (
          <>
            <div className="font-bold">Sí transmitió</div>
            <div>Hora: {reporte.horaReal || reporte.hora || '-'}</div>
          </>
        );
      case ESTADOS_TRANSMISION.NO_TRANSMITIO:
        return (
          <>
            <div className="font-bold">No transmitió</div>
            <div>Motivo: {reporte.target || '-'}</div>
            {reporte.motivo && <div>Detalle: {reporte.motivo}</div>}
          </>
        );
      case ESTADOS_TRANSMISION.TRANSMITIO_TARDE:
        return (
          <>
            <div className="font-bold">Transmitió tarde</div>
            <div>Hora programada: {reporte.horaReal || reporte.hora || '-'}</div>
            <div>Hora real: {reporte.hora_tt || '-'}</div>
            {reporte.motivo && <div>Motivo: {reporte.motivo}</div>}
          </>
        );
      default:
        return <div className="font-bold">Pendiente</div>;
    }
  };

  // Renderizar vista de mes
  const renderMonthView = () => {
    const daysInMonth = getDiasMes(currentMonth);
    const weekDays = Array(7).fill(0).map((_, index) => getDiaSemanaCorto(index));
    
    return (
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-1">
          {/* Encabezados de días de la semana */}
          {weekDays.map((day, i) => (
            <div key={`header-${i}`} className="text-center font-medium text-gray-500 text-sm py-2">
              {day}
            </div>
          ))}
          
          {/* Días del mes */}
          {daysInMonth.map((day, i) => {
            const formattedDate = formatFecha(day);
            const isCurrentDay = esHoy(day);
            const isSelected = esMismoDia(day, selectedDate);
            const diaSemana = getDiaSemana(day);
            
            // Verificar si algún programa transmite este día
            const programasDelDia = programas.filter(p => programaTransmiteEnDia(p, diaSemana));
            const tieneTransmisiones = programasDelDia.length > 0;
            
            // Obtener estados de los reportes para este día
            const reportesDelDia = programasDelDia.map(programa => {
              const reporte = getReporte(formattedDate, Number(programa.id));
              return {
                programaId: programa.id,
                nombre: programa.nombre,
                estado: reporte?.estado || ESTADOS_TRANSMISION.PENDIENTE,
                reporte
              };
            });
            
            // Contar estados
            const countEstados = {
              si: reportesDelDia.filter(r => r.estado === ESTADOS_TRANSMISION.SI_TRANSMITIO).length,
              no: reportesDelDia.filter(r => r.estado === ESTADOS_TRANSMISION.NO_TRANSMITIO).length,
              tarde: reportesDelDia.filter(r => r.estado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE).length,
              pendiente: reportesDelDia.filter(r => r.estado === ESTADOS_TRANSMISION.PENDIENTE).length
            };
            
            return (
              <div
                key={`day-${i}`}
                className={`
                  min-h-16 p-1 border rounded-md relative
                  ${isCurrentDay ? 'border-blue-400' : 'border-gray-200'}
                  ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  ${!esMismoMes(day, currentMonth) ? 'text-gray-400' : ''}
                `}
                onClick={() => {
                  setSelectedDate(day);
                  if (programaSeleccionado) {
                    onFechaClick(formattedDate, programaSeleccionado, filialId);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${isCurrentDay ? 'text-blue-600' : ''}`}>
                    {day.getDate()}
                  </span>
                  {tieneTransmisiones && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {programasDelDia.length}
                    </span>
                  )}
                </div>
                
                {/* Indicadores de estado */}
                {tieneTransmisiones && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {countEstados.si > 0 && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500" title={`${countEstados.si} transmitieron`}></div>
                    )}
                    {countEstados.no > 0 && (
                      <div className="w-2 h-2 rounded-full bg-red-500" title={`${countEstados.no} no transmitieron`}></div>
                    )}
                    {countEstados.tarde > 0 && (
                      <div className="w-2 h-2 rounded-full bg-amber-500" title={`${countEstados.tarde} transmitieron tarde`}></div>
                    )}
                    {countEstados.pendiente > 0 && (
                      <div className="w-2 h-2 rounded-full bg-gray-300" title={`${countEstados.pendiente} pendientes`}></div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Renderizar vista semanal
  const renderSemanaView = () => {
    const diasSemana = getDiasSemana(selectedDate);
    
    return (
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-2">
          {/* Encabezados de días de la semana */}
          {diasSemana.map((day, i) => (
            <div key={`header-${i}`} className="text-center">
              <div className="font-medium text-gray-800">
                {day.toLocaleDateString('es-ES', { weekday: 'short' })}
              </div>
              <div className={`text-sm ${esHoy(day) ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
          
          {/* Programas y sus estados para cada día */}
          {programas.map((programa) => (
            <React.Fragment key={`programa-${programa.id}`}>
              {diasSemana.map((day, dayIndex) => {
                const formattedDate = formatFecha(day);
                const diaSemana = getDiaSemana(day);
                const transmiteEnDia = programaTransmiteEnDia(programa, diaSemana);
                
                if (!transmiteEnDia) {
                  return <div key={`prog-${programa.id}-day-${dayIndex}`} className="min-h-16"></div>;
                }
                
                const reporte = getReporte(formattedDate, Number(programa.id));
                const estadoColor = getColorByEstado(reporte?.estado);
                
                return (
                  <div 
                    key={`prog-${programa.id}-day-${dayIndex}`} 
                    className="min-h-16 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => onFechaClick(formattedDate, Number(programa.id), filialId)}
                  >
                    <div className="text-xs font-medium text-gray-500 mb-1">{programa.nombre}</div>
                    <div className={`w-full h-8 ${estadoColor} rounded-md flex items-center justify-center text-white font-medium`}>
                      {reporte?.estado === ESTADOS_TRANSMISION.SI_TRANSMITIO ? '✓' :
                       reporte?.estado === ESTADOS_TRANSMISION.NO_TRANSMITIO ? '✕' :
                       reporte?.estado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE ? '⌛' : '—'}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };
  
  // Renderizar vista por día
  const renderDiaView = () => {
    const formattedDate = formatFecha(selectedDate);
    const diaSemana = getDiaSemana(selectedDate);
    
    return (
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          {selectedDate.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
        
        <div className="space-y-4">
          {programas.map((programa) => {
            const transmiteEnDia = programaTransmiteEnDia(programa, diaSemana);
            
            if (!transmiteEnDia) {
              return null;
            }
            
            const reporte = getReporte(formattedDate, Number(programa.id));
            const estadoColor = getColorByEstado(reporte?.estado);
            
            return (
              <div 
                key={`programa-${programa.id}`}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{programa.nombre}</h4>
                  <div className="text-sm text-gray-500">{programa.horario || programa.horaInicio}</div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${estadoColor}`}></div>
                  <div className="text-sm">
                    {reporte?.estado === ESTADOS_TRANSMISION.SI_TRANSMITIO ? 'Transmitió' :
                     reporte?.estado === ESTADOS_TRANSMISION.NO_TRANSMITIO ? 'No transmitió' :
                     reporte?.estado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE ? 'Transmitió tarde' : 
                     'Pendiente'}
                  </div>
                  
                  {reporte?.horaReal && (
                    <div className="text-sm text-gray-600">
                      Hora: {reporte.horaReal}
                    </div>
                  )}
                  
                  {reporte?.target && (
                    <div className="text-sm text-gray-600">
                      Motivo: {reporte.target}
                    </div>
                  )}
                </div>
                
                <div className="mt-3">
                  <button
                    onClick={() => onFechaClick(formattedDate, Number(programa.id), filialId)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    {reporte ? 'Editar' : 'Reportar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Renderizar vista por programa
  const renderProgramaView = () => {
    if (!programaSeleccionado) return null;
    
    const programa = programas.find(p => Number(p.id) === programaSeleccionado);
    if (!programa) return null;
    
    // Obtener fechas donde el programa transmite en el mes actual
    const fechasTransmision = getDiasMes(currentMonth).filter(day => {
      const diaSemana = getDiaSemana(day);
      return programaTransmiteEnDia(programa, diaSemana);
    });
    
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {programa.nombre}
          </h2>
          <div className="text-sm text-gray-600">
            {programa.horario || programa.horaInicio || 'Sin horario definido'}
          </div>
        </div>
        
        <div className="overflow-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 border bg-gray-50 text-left">Fecha</th>
                <th className="px-4 py-2 border bg-gray-50 text-left">Día</th>
                <th className="px-4 py-2 border bg-gray-50 text-left">Estado</th>
                <th className="px-4 py-2 border bg-gray-50 text-left">Hora</th>
                <th className="px-4 py-2 border bg-gray-50 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fechasTransmision.map((day, i) => {
                const formattedDate = formatFecha(day);
                const reporte = getReporte(formattedDate, programaSeleccionado);
                const estadoColor = getColorByEstado(reporte?.estado);
                
                return (
                  <tr key={`fila-${i}`} className={esMismoDia(day, selectedDate) ? 'bg-blue-50' : ''}>
                    <td className="px-4 py-2 border">
                      {day.toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-2 border">
                      {day.toLocaleDateString('es-ES', { weekday: 'long' })}
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${estadoColor} mr-2`}></div>
                        <span>
                          {reporte?.estado === ESTADOS_TRANSMISION.SI_TRANSMITIO ? 'Transmitió' :
                           reporte?.estado === ESTADOS_TRANSMISION.NO_TRANSMITIO ? 'No transmitió' :
                           reporte?.estado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE ? 'Transmitió tarde' : 
                           'Pendiente'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 border">
                      {reporte?.estado === ESTADOS_TRANSMISION.SI_TRANSMITIO ? reporte.horaReal || reporte.hora :
                       reporte?.estado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE ? 
                       `${reporte.horaReal || reporte.hora} → ${reporte.hora_tt}` : 
                       programa.horario || programa.horaInicio || '-'}
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => onFechaClick(formattedDate, programaSeleccionado, filialId)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                      >
                        {reporte ? 'Editar' : 'Reportar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Selector de programa */}
      <div className="mb-4">
        <label htmlFor="programa" className="block text-sm font-medium text-gray-700 mb-1">
          Programa
        </label>
        <select
          id="programa"
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          value={programaSeleccionado || ''}
          onChange={(e) => setProgramaSeleccionado(Number(e.target.value))}
        >
          <option value="">Seleccionar programa</option>
          {programas.map((programa) => (
            <option key={programa.id} value={programa.id}>
              {programa.nombre}
            </option>
          ))}
        </select>
      </div>
      
      {/* Selector de fecha y vista */}
      <SelectorCalendario 
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
        vista={vistaActual}
        fechaActual={selectedDate}
      />
      
      {/* Contenido según la vista seleccionada */}
      {vistaActual === 'mes' && renderMonthView()}
      {vistaActual === 'semana' && renderSemanaView()}
      {vistaActual === 'dia' && renderDiaView()}
      {vistaActual === 'programa' && renderProgramaView()}
      
      {/* Leyenda */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Leyenda:</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
            <span className="text-sm">Transmitió</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm">No transmitió</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
            <span className="text-sm">Transmitió tarde</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-200 rounded-full mr-2"></div>
            <span className="text-sm">Pendiente</span>
          </div>
        </div>
      </div>
    </div>
  );
}