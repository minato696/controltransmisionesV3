'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import CalendarioSelector from './CalendarioSelector';
import { 
  ESTADOS_TRANSMISION,
  normalizarDiaSemana
} from './constants';
import { 
  Filial, 
  Programa, 
  Reporte 
} from './types';
import {
  getFilialesTransformadas,
  getProgramasTransformados,
  getReportesPorFechas,
  guardarOActualizarReporte
} from '../../services/api-client';

export default function ReporteSemanal() {
  // Estados principales
  const [filiales, setFiliales] = useState<Filial[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [filialSeleccionada, setFilialSeleccionada] = useState<number | null>(null);
  const [programaSeleccionado, setProgramaSeleccionado] = useState<number | null>(null);
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  
  // Datos de reportes para la semana
  const [reportesSemana, setReportesSemana] = useState<{[key: string]: any}>({});

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cargar reportes cuando cambie la selección
  useEffect(() => {
    if (filialSeleccionada && programaSeleccionado && fechaInicio && fechaFin) {
      cargarReportes();
    }
  }, [filialSeleccionada, programaSeleccionado, fechaInicio, fechaFin]);

  // Cargar datos desde la API
  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const [filialesData, programasData] = await Promise.all([
        getFilialesTransformadas(),
        getProgramasTransformados()
      ]);
      
      // Asegurarse de que los datos tengan el formato correcto
      const filialesConvertidas: Filial[] = filialesData.map(f => ({
        ...f,
        isActivo: f.isActivo ?? f.activa
      }));
      
      const programasConvertidos: Programa[] = programasData.map(p => ({
        ...p,
        horario: p.horario || p.horaInicio || '00:00',
        // Normalizar los diasSemana para asegurarnos de que estén en formato consistente
        diasSemana: (p.diasSemana || ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']).map(
          d => normalizarDiaSemana(d)
        ),
        isActivo: p.isActivo ?? (p.estado === 'activo')
      }));
      
      setFiliales(filialesConvertidas.filter(f => f.isActivo));
      setProgramas(programasConvertidos.filter(p => p.isActivo));
      
      // Seleccionar primera filial si existe
      if (filialesConvertidas.length > 0) {
        const primeraFilialActiva = filialesConvertidas.find(f => f.isActivo);
        if (primeraFilialActiva) {
          setFilialSeleccionada(Number(primeraFilialActiva.id));
          
          // También seleccionar el primer programa de esta filial
          const programasFilial = programasConvertidos.filter(p => {
            if (p.filialesIds && p.filialesIds.length > 0) {
              return p.filialesIds.includes(Number(primeraFilialActiva.id));
            }
            return Number(p.filialId) === Number(primeraFilialActiva.id);
          });
          
          if (programasFilial.length > 0) {
            setProgramaSeleccionado(Number(programasFilial[0].id));
          }
        }
      }
      
      setCargando(false);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
      setCargando(false);
    }
  };

  // Cargar reportes para la semana seleccionada
  const cargarReportes = async () => {
    if (!filialSeleccionada || !programaSeleccionado || !fechaInicio || !fechaFin) return;
    
    try {
      setCargando(true);
      setError(null);
      
      // Obtener los reportes para el rango de fechas
      const reportesData = await getReportesPorFechas(fechaInicio, fechaFin);
      setReportes(reportesData);
      
      // Inicializar datos de reportes para la semana
      const reportesPorDia: {[key: string]: any} = {};
      
      // Recorrer desde fechaInicio hasta fechaFin
      const start = parseISO(fechaInicio);
      const end = parseISO(fechaFin);
      
      if (isValid(start) && isValid(end)) {
        // Crear estructura para cada día en el rango
        let currentDate = start;
        while (currentDate <= end) {
          const fechaStr = format(currentDate, 'yyyy-MM-dd');
          const diaSemana = format(currentDate, 'EEEE', { locale: es }).toUpperCase();
          
          // Verificar si el programa se transmite este día
          const programa = programas.find(p => Number(p.id) === programaSeleccionado);
          const transmiteEnDia = programa?.diasSemana?.includes(normalizarDiaSemana(diaSemana)) || false;
          
          // Buscar si existe un reporte para esta fecha
          const reporteExistente = reportesData.find(
            r => r.filialId === filialSeleccionada && 
                r.programaId === programaSeleccionado && 
                r.fecha === fechaStr
          );
          
          // Si el programa transmite este día, añadir a la estructura
          if (transmiteEnDia) {
            reportesPorDia[fechaStr] = {
              fecha: fechaStr,
              dia: diaSemana,
              transmite: true,
              filialId: filialSeleccionada,
              programaId: programaSeleccionado,
              // Si existe reporte, usar sus valores, sino valores por defecto
              estado: reporteExistente?.estado || ESTADOS_TRANSMISION.PENDIENTE,
              estadoTransmision: reporteExistente?.estadoTransmision || 'Pendiente',
              horaReal: reporteExistente?.horaReal || reporteExistente?.hora || programa?.horario || '',
              hora_tt: reporteExistente?.hora_tt || '',
              target: reporteExistente?.target || '',
              motivo: reporteExistente?.motivo || '',
              id_reporte: reporteExistente?.id_reporte || null
            };
          } else {
            // Si no transmite, marcarlo como no programado
            reportesPorDia[fechaStr] = {
              fecha: fechaStr,
              dia: diaSemana,
              transmite: false
            };
          }
          
          // Avanzar al siguiente día
          currentDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      
      setReportesSemana(reportesPorDia);
      setCargando(false);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
      setError('Error al cargar los reportes para la semana seleccionada.');
      setCargando(false);
    }
  };

  // Manejar cambio de filial
  const handleFilialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filialId = Number(e.target.value);
    setFilialSeleccionada(filialId);
    setProgramaSeleccionado(null);
    
    // Limpiar los reportes de la semana al cambiar de filial
    setReportesSemana({});
    
    // Seleccionar el primer programa de esta filial
    const programasFilial = programas.filter(p => {
      if (p.filialesIds && p.filialesIds.length > 0) {
        return p.filialesIds.includes(filialId);
      }
      return Number(p.filialId) === filialId;
    });
    
    if (programasFilial.length > 0) {
      setProgramaSeleccionado(Number(programasFilial[0].id));
    }
  };

  // Manejar cambio de programa
  const handleProgramaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProgramaSeleccionado(Number(e.target.value));
    // Limpiar los reportes de la semana al cambiar de programa
    setReportesSemana({});
  };

  // Manejar cambio de semana desde el calendario
  const handleWeekChange = (inicio: string, fin: string) => {
    setFechaInicio(inicio);
    setFechaFin(fin);
  };

  // Manejar cambios en los reportes
  const handleReporteChange = (fecha: string, campo: string, valor: any) => {
    setReportesSemana(prev => {
      const nuevoEstado = { ...prev };
      
      if (nuevoEstado[fecha]) {
        nuevoEstado[fecha] = {
          ...nuevoEstado[fecha],
          [campo]: valor
        };
        
        // Ajustar campos relacionados
        if (campo === 'estado') {
          // Actualizar estadoTransmision basado en estado
          nuevoEstado[fecha].estadoTransmision = 
            valor === ESTADOS_TRANSMISION.SI_TRANSMITIO ? 'Si' :
            valor === ESTADOS_TRANSMISION.NO_TRANSMITIO ? 'No' :
            valor === ESTADOS_TRANSMISION.TRANSMITIO_TARDE ? 'Tarde' : 'Pendiente';
          
          // Limpiar campos que no aplican para el nuevo estado
          if (valor === ESTADOS_TRANSMISION.PENDIENTE) {
            nuevoEstado[fecha].horaReal = '';
            nuevoEstado[fecha].hora_tt = '';
            nuevoEstado[fecha].target = '';
            nuevoEstado[fecha].motivo = '';
          } else if (valor === ESTADOS_TRANSMISION.SI_TRANSMITIO) {
            nuevoEstado[fecha].hora_tt = '';
            nuevoEstado[fecha].target = '';
            nuevoEstado[fecha].motivo = '';
          }
        }
      }
      
      return nuevoEstado;
    });
  };

  // Guardar todos los reportes
  const guardarReportes = async () => {
    try {
      setGuardando(true);
      setError(null);
      setExito(null);
      
      // Obtener solo los reportes de días que transmiten
      const reportesAGuardar = Object.values(reportesSemana)
        .filter((reporte: any) => reporte.transmite);
      
      // Guardar cada reporte
      for (const reporte of reportesAGuardar) {
        await guardarOActualizarReporte(
          reporte.filialId,
          reporte.programaId,
          reporte.fecha,
          {
            filialId: reporte.filialId,
            programaId: reporte.programaId,
            fecha: reporte.fecha,
            estado: reporte.estado,
            estadoTransmision: reporte.estadoTransmision,
            hora: reporte.horaReal,
            horaReal: reporte.horaReal,
            hora_tt: reporte.hora_tt,
            target: reporte.target,
            motivo: reporte.motivo,
            id_reporte: reporte.id_reporte
          }
        );
      }
      
      // Recargar reportes para actualizar IDs y estados
      await cargarReportes();
      
      setExito('Los reportes se han guardado correctamente.');
      setGuardando(false);
      
      // Ocultar mensaje de éxito después de unos segundos
      setTimeout(() => {
        setExito(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error al guardar reportes:', err);
      setError('Error al guardar los reportes. Por favor, intente nuevamente.');
      setGuardando(false);
    }
  };

  // Obtener programas de la filial seleccionada
  const getProgramasDeFilial = () => {
    if (!filialSeleccionada) return [];
    
    return programas.filter(p => {
      // Verificar si el programa está asociado a la filial
      if (p.filialesIds && p.filialesIds.length > 0) {
        return p.filialesIds.includes(filialSeleccionada);
      }
      return Number(p.filialId) === filialSeleccionada;
    });
  };

  // Renderizar estado de carga
  if (cargando && !Object.keys(reportesSemana).length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reportes Semanales</h1>
      
      {/* Selector de filial y programa */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="filial" className="block text-sm font-medium text-gray-700 mb-1">
              Filial
            </label>
            <select
              id="filial"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={filialSeleccionada || ''}
              onChange={handleFilialChange}
              disabled={guardando}
            >
              <option value="">Seleccionar filial</option>
              {filiales.map(filial => (
                <option key={filial.id} value={filial.id}>{filial.nombre}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="programa" className="block text-sm font-medium text-gray-700 mb-1">
              Programa
            </label>
            <select
              id="programa"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={programaSeleccionado || ''}
              onChange={handleProgramaChange}
              disabled={!filialSeleccionada || guardando}
            >
              <option value="">Seleccionar programa</option>
              {getProgramasDeFilial().map(programa => (
                <option key={programa.id} value={programa.id}>{programa.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Selector de semana */}
      <CalendarioSelector onWeekChange={handleWeekChange} />
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {exito && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{exito}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabla de reportes semanales */}
      {filialSeleccionada && programaSeleccionado && Object.keys(reportesSemana).length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Día
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(reportesSemana)
                  .sort(([fechaA], [fechaB]) => fechaA.localeCompare(fechaB))
                  .map(([fecha, reporte]: [string, any]) => {
                    // Si no transmite, mostrar como no programado
                    if (!reporte.transmite) {
                      return (
                        <tr key={fecha} className="bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                            {format(parseISO(fecha), 'EEEE', { locale: es })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(parseISO(fecha), 'dd/MM/yyyy')}
                          </td>
                          <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 italic">
                            No programado
                          </td>
                        </tr>
                      );
                    }
                    
                    // Para días que sí transmiten
                    return (
                      <tr key={fecha}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {format(parseISO(fecha), 'EEEE', { locale: es })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(parseISO(fecha), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className={`text-sm rounded-lg p-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all
                              ${reporte.estado === ESTADOS_TRANSMISION.SI_TRANSMITIO ? 'bg-green-50 border-green-200' : 
                                reporte.estado === ESTADOS_TRANSMISION.NO_TRANSMITIO ? 'bg-red-50 border-red-200' : 
                                reporte.estado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE ? 'bg-amber-50 border-amber-200' : 
                                'bg-gray-50 border-gray-200'}
                            `}
                            value={reporte.estado}
                            onChange={(e) => handleReporteChange(fecha, 'estado', e.target.value)}
                            disabled={guardando}
                          >
                            <option value={ESTADOS_TRANSMISION.PENDIENTE}>Pendiente</option>
                            <option value={ESTADOS_TRANSMISION.SI_TRANSMITIO}>Sí transmitió</option>
                            <option value={ESTADOS_TRANSMISION.NO_TRANSMITIO}>No transmitió</option>
                            <option value={ESTADOS_TRANSMISION.TRANSMITIO_TARDE}>Transmitió tarde</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(reporte.estado === ESTADOS_TRANSMISION.SI_TRANSMITIO || 
                            reporte.estado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE) && (
                            <div className="flex space-x-2">
                              <input
                                type="time"
                                className="text-sm border border-gray-200 rounded-lg p-2 w-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={reporte.horaReal || ''}
                                onChange={(e) => handleReporteChange(fecha, 'horaReal', e.target.value)}
                                disabled={guardando}
                              />
                              
                              {reporte.estado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE && (
                                <input
                                  type="time"
                                  className="text-sm border border-gray-200 rounded-lg p-2 w-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                  value={reporte.hora_tt || ''}
                                  onChange={(e) => handleReporteChange(fecha, 'hora_tt', e.target.value)}
                                  placeholder="Hora real"
                                  disabled={guardando}
                                />
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(reporte.estado === ESTADOS_TRANSMISION.NO_TRANSMITIO || 
                            reporte.estado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE) && (
                            <div className="flex space-x-2">
                              <select
                                className="text-sm border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={reporte.target || ''}
                                onChange={(e) => handleReporteChange(fecha, 'target', e.target.value)}
                                disabled={guardando}
                              >
                                <option value="">Seleccionar motivo</option>
                                {reporte.estado === ESTADOS_TRANSMISION.NO_TRANSMITIO ? (
                                  // Motivos para no transmitió
                                  <>
                                    <option value="Fta">Falta (Fta)</option>
                                    <option value="Enf">Enfermedad (Enf)</option>
                                    <option value="P.Tec">Problema técnico (P.Tec)</option>
                                    <option value="F.Serv">Falla de servicios (F.Serv)</option>
                                    <option value="Otros">Otros</option>
                                  </>
                                ) : (
                                  // Motivos para transmitió tarde
                                  <>
                                    <option value="Tde">Tarde (Tde)</option>
                                    <option value="P.Tec">Problema técnico (P.Tec)</option>
                                    <option value="F.Serv">Falla de servicios (F.Serv)</option>
                                    <option value="Otros">Otros</option>
                                  </>
                                )}
                              </select>
                              
                              {reporte.target === 'Otros' && (
                                <input
                                  type="text"
                                  className="text-sm border border-gray-200 rounded-lg p-2 flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                  value={reporte.motivo || ''}
                                  onChange={(e) => handleReporteChange(fecha, 'motivo', e.target.value)}
                                  placeholder="Especifique"
                                  disabled={guardando}
                                />
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={guardarReportes}
              disabled={guardando || !filialSeleccionada || !programaSeleccionado}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center"
            >
              {guardando ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                'Guardar todos los reportes'
              )}
            </button>
          </div>
        </div>
      ) : (
        filialSeleccionada && programaSeleccionado ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Cargando reportes para la semana seleccionada...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mt-4"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Selecciona una filial y un programa para ver los reportes de la semana.</p>
          </div>
        )
      )}
    </div>
  );
}