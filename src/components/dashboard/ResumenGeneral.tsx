'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  getFiliales, 
  getProgramas, 
  getReportesPorFechas 
} from '@/services/api-client';
import { Filial, Programa, Reporte } from '@/components/transmisiones/types';
import { normalizarDiaSemana } from '@/components/transmisiones/constants';
import SelectorSemanasMejorado from '@/components/transmisiones/SelectorSemanasMejorado';
import ExportComponent from '@/components/exportacion/ExportComponent';

export default function DashboardGeneral() {
  // Estados
  const [filiales, setFiliales] = useState<Filial[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [fechaInicio, setFechaInicio] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [fechaFin, setFechaFin] = useState<Date>(endOfWeek(new Date(), { weekStartsOn: 1 }));
  const [diasSemana, setDiasSemana] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filialSeleccionada, setFilialSeleccionada] = useState<number | null>(null);
  
  // Manejar scroll en dispositivos móviles
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  // Generar días de la semana cuando cambian las fechas
  useEffect(() => {
    generarDiasSemana();
  }, [fechaInicio, fechaFin]);

  // Cargar reportes cuando cambian las fechas
  useEffect(() => {
    if (diasSemana.length > 0) {
      cargarReportes();
    }
  }, [diasSemana]);

  // Función para cargar todos los datos necesarios
  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);
      
      // Cargar filiales y programas
      const [filialesData, programasData] = await Promise.all([
        getFiliales(),
        getProgramas()
      ]);
      
      // Filtrar solo elementos activos y transformar al formato requerido
      const filialesActivas = filialesData.filter(f => f.activa || f.isActivo).map(f => ({
        ...f,
        isActivo: f.isActivo || f.activa || false // Aseguramos que isActivo sea siempre un booleano
      })) as Filial[];
      
      const programasActivos = programasData.filter(p => p.estado === 'activo' || p.isActivo).map(p => ({
        ...p,
        horario: p.horario || p.horaInicio || '00:00', // Aseguramos que horario siempre sea un string
        diasSemana: p.diasSemana || ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
        isActivo: p.isActivo || (p.estado === 'activo') || false
      })) as Programa[];
      
      setFiliales(filialesActivas);
      setProgramas(programasActivos);
      
      // Generar días de la semana para las fechas actuales
      generarDiasSemana();
      
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  // Generar array de días de la semana entre fechaInicio y fechaFin
  const generarDiasSemana = () => {
    const dias: string[] = [];
    let fechaActual = new Date(fechaInicio);
    
    while (fechaActual <= fechaFin) {
      const fechaStr = format(fechaActual, 'yyyy-MM-dd');
      dias.push(fechaStr);
      fechaActual = addDays(fechaActual, 1);
    }
    
    setDiasSemana(dias);
  };

  // Cargar reportes para el rango de fechas
  const cargarReportes = async () => {
    if (diasSemana.length === 0) return;
    
    try {
      setCargando(true);
      
      const primerDia = diasSemana[0];
      const ultimoDia = diasSemana[diasSemana.length - 1];
      
      const reportesData = await getReportesPorFechas(primerDia, ultimoDia);
      setReportes(reportesData);
      
    } catch (err) {
      console.error('Error al cargar reportes:', err);
      setError('Error al cargar los reportes. Por favor, intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  // Manejar cambio en el rango de fechas
  const handleFechasChange = (inicio: Date, fin: Date) => {
    setFechaInicio(inicio);
    setFechaFin(fin);
  };

  // Filtrar por filial específica
  const handleFilialSelect = (filialId: number) => {
    setFilialSeleccionada(filialId === filialSeleccionada ? null : filialId);
  };

  // Verificar si un programa se transmite en un día específico
  const programaTransmiteEnDia = (programa: Programa, fecha: string) => {
    if (!programa.diasSemana || programa.diasSemana.length === 0) return false;
    
    // Obtener el nombre del día a partir de la fecha
    const diaSemana = format(parseISO(fecha), 'EEEE', { locale: es }).toUpperCase();
    const diaNormalizado = normalizarDiaSemana(diaSemana);
    
    // Comprobar si el programa tiene este día en su lista de diasSemana
    return programa.diasSemana.some(d => normalizarDiaSemana(d) === diaNormalizado);
  };

  // Obtener el reporte para una combinación de filial, programa y fecha
  const getReporte = (filialId: number, programaId: number, fecha: string) => {
    return reportes.find(r => 
      Number(r.filialId) === filialId && 
      Number(r.programaId) === programaId && 
      r.fecha === fecha
    );
  };

  // Obtener el color de fondo según el estado del reporte
  const getEstadoColor = (estado?: string | null) => {
    if (!estado) return 'bg-gray-200'; // Pendiente
    
    switch (estado) {
      case 'si': return 'bg-emerald-500'; // Transmitió
      case 'no': return 'bg-red-500'; // No transmitió
      case 'tarde': return 'bg-amber-500'; // Transmitió tarde
      default: return 'bg-gray-200';
    }
  };

  // Obtener el texto según el estado
  const getEstadoTexto = (estado?: string | null) => {
    if (!estado) return 'Pendiente';
    
    switch (estado) {
      case 'si': return 'Sí transmitió';
      case 'no': return 'No transmitió';
      case 'tarde': return 'Transmitió tarde';
      default: return 'Pendiente';
    }
  };

  // Obtener programas asociados a una filial
  const getProgramasPorFilial = (filialId: number) => {
    if (!filialId) return [];
    
    return programas.filter(p => {
      // Verificar si el programa está asociado a la filial
      const estaAsociado = p.filialesIds?.includes(filialId) || 
                           Number(p.filialId) === filialId;
      
      return estaAsociado;
    });
  };

  // Calcular estadísticas
  const totalFiliales = filiales.length;
  const totalProgramas = programas.length;
  
  const totalReportes = reportes.length;
  const reportesSi = reportes.filter(r => r.estado === 'si').length;
  const reportesNo = reportes.filter(r => r.estado === 'no').length;
  const reportesTarde = reportes.filter(r => r.estado === 'tarde').length;
  const reportesPendientes = reportes.filter(r => !r.estado || r.estado === 'pendiente').length;
  const efectividad = totalReportes > 0 ? Math.round((reportesSi / totalReportes) * 100) : 0;
  
  // Renderizar estado de carga
  if (cargando && filiales.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Tarjetas de estadísticas */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Dashboard de Control de Transmisiones</h1>
          
          <div className="flex items-center gap-2">
            {/* Botón de exportación */}
<ExportComponent 
  reportes={reportes}
  filiales={filiales}
  programas={programas}
  fechaInicio={fechaInicio}
  fechaFin={fechaFin}
  filialSeleccionada={filialSeleccionada}
  modoDetallado={true}  // Forzar el modo detallado para el Dashboard
/>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Filiales</div>
            <div className="text-2xl font-bold text-gray-800">{totalFiliales}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm font-medium text-gray-500">Programas</div>
            <div className="text-2xl font-bold text-gray-800">{totalProgramas}</div>
          </div>
          
          <div className="bg-emerald-50 rounded-lg shadow p-4">
            <div className="text-sm font-medium text-emerald-600">Transmitieron</div>
            <div className="text-2xl font-bold text-emerald-700">{reportesSi}</div>
          </div>
          
          <div className="bg-red-50 rounded-lg shadow p-4">
            <div className="text-sm font-medium text-red-600">No transmitieron</div>
            <div className="text-2xl font-bold text-red-700">{reportesNo}</div>
          </div>
          
          <div className="bg-amber-50 rounded-lg shadow p-4">
            <div className="text-sm font-medium text-amber-600">Transmitieron tarde</div>
            <div className="text-2xl font-bold text-amber-700">{reportesTarde}</div>
          </div>
        </div>
      </div>

      {/* Selector de fechas */}
      <div className="container mx-auto px-4 py-2">
        <div className="bg-white rounded-lg shadow p-4">
          <SelectorSemanasMejorado 
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            onFechasChange={handleFechasChange}
            modoSeleccion="semana"
          />
        </div>
      </div>

      {/* Contenido principal: Tabla */}
      <div className="container mx-auto px-4 py-4 flex-1 overflow-hidden">
        {/* Contenido principal - Siempre muestra todas las filiales */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Leyenda */}
          <div className="p-3 bg-gray-50 border-b flex items-center space-x-4 overflow-x-auto">
            <div className="font-medium text-gray-700 whitespace-nowrap">Leyenda:</div>
            <div className="flex items-center whitespace-nowrap">
              <div className="w-4 h-4 bg-emerald-500 rounded mr-2"></div>
              <span className="text-sm">Transmitió</span>
            </div>
            <div className="flex items-center whitespace-nowrap">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-sm">No transmitió</span>
            </div>
            <div className="flex items-center whitespace-nowrap">
              <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
              <span className="text-sm">Transmitió tarde</span>
            </div>
            <div className="flex items-center whitespace-nowrap">
              <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
              <span className="text-sm">Pendiente</span>
            </div>
            <div className="flex items-center whitespace-nowrap">
              <div className="w-4 h-4 bg-white border border-gray-300 rounded mr-2"></div>
              <span className="text-sm">No programado</span>
            </div>
          </div>
          
          {/* Filtro de filiales */}
          <div className="p-3 bg-white border-b">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por filial:
            </label>
            <div className="flex flex-wrap gap-2">
              {filiales.map(filial => (
                <button
                  key={filial.id}
                  onClick={() => handleFilialSelect(Number(filial.id))}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filialSeleccionada === Number(filial.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {filial.nombre}
                </button>
              ))}
              {filialSeleccionada && (
                <button
                  onClick={() => setFilialSeleccionada(null)}
                  className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 hover:bg-red-200 flex items-center"
                >
                  <span>Limpiar filtro</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Tabla de transmisiones - Vista del resumen general */}
          <div className="overflow-x-auto overflow-y-visible custom-scrollbar">
            <table className="min-w-full border-collapse sticky-header sticky-first-column">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-b border-r">
                    Filial / Programa
                  </th>
                  {diasSemana.map((fecha, idx) => (
                    <th key={idx} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      <div>{format(parseISO(fecha), 'EEE', { locale: es }).toUpperCase()}</div>
                      <div>{format(parseISO(fecha), 'dd/MM')}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filiales
                  .filter(filial => filialSeleccionada ? Number(filial.id) === filialSeleccionada : true)
                  .map(filial => (
                  <React.Fragment key={filial.id}>
                    {/* Encabezado de la filial */}
                    <tr className="bg-gray-50">
                      <td 
                        className="px-4 py-2 font-medium text-gray-700 sticky left-0 bg-gray-50 z-10 border-r"
                      >
                        {filial.nombre}
                      </td>
                      {diasSemana.map((fecha, idx) => (
                        <td key={idx} className="border-b"></td>
                      ))}
                    </tr>
                    
                    {/* Programas de esta filial */}
                    {getProgramasPorFilial(Number(filial.id)).map(programa => (
                      <tr key={`${filial.id}-${programa.id}`} className="hover:bg-gray-50 border-b">
                        <td className="px-4 py-3 pl-8 whitespace-nowrap sticky left-0 bg-white z-10 border-r">
                          <div className="text-sm font-medium text-gray-900">
                            {programa.nombre}
                          </div>
                          <div className="text-xs text-gray-500">{programa.horario || programa.horaInicio}</div>
                        </td>
                        {diasSemana.map((fecha, idx) => {
                          // Verificar si el programa se transmite este día
                          const transmiteEnDia = programaTransmiteEnDia(programa, fecha);
                          
                          // Obtener reporte para esta combinación
                          const reporte = getReporte(Number(filial.id), Number(programa.id), fecha);
                          
                          // Determinar color según estado
                          const bgColor = transmiteEnDia 
                            ? getEstadoColor(reporte?.estado)
                            : 'bg-white border border-gray-300'; // No programado
                          
                          return (
                            <td key={idx} className="p-2 text-center">
                              <div 
                                className={`w-10 h-10 ${bgColor} rounded-md mx-auto flex items-center justify-center`}
                                title={transmiteEnDia ? getEstadoTexto(reporte?.estado) : 'No programado para este día'}
                              >
                                {reporte?.estado === 'si' && <span className="text-white">✓</span>}
                                {reporte?.estado === 'no' && <span className="text-white">✕</span>}
                                {reporte?.estado === 'tarde' && <span className="text-white">⏰</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    
                    {/* Mensaje si no hay programas */}
                    {getProgramasPorFilial(Number(filial.id)).length === 0 && (
                      <tr>
                        <td colSpan={diasSemana.length + 1} className="px-4 py-2 pl-8 text-sm italic text-gray-500">
                          No hay programas asociados
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>


    </div>
  );
}