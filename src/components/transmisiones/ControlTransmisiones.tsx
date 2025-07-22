'use client';

// src/components/transmisiones/ControlTransmisiones.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  DIAS_SEMANA, 
  TARGETS_NO_TRANSMISION, 
  TARGETS_RETRASO, 
  ESTADOS_TRANSMISION,
  obtenerFechasSemana,
  normalizarDiaSemana
} from './constants';
import { 
  EstadoTransmision, 
  TransmisionEditar, 
  DiaSemana, 
  Filial, 
  Programa, 
  Reporte 
} from './types';
import {
  getFilialesTransformadas,
  getProgramasTransformados,
  getReportesPorFechas,
  guardarOActualizarReporte,
  convertirFechaASwagger,
  convertirFechaDesdeSwagger
} from '../../services/api-client';

export default function ControlTransmisiones() {
  // Estados principales
  const [filiales, setFiliales] = useState<Filial[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [filialSeleccionada, setFilialSeleccionada] = useState<number | null>(null);
  const [programaSeleccionado, setProgramaSeleccionado] = useState<number | null>(null);
  const [vistaActual, setVistaActual] = useState<'semana' | 'dia'>('semana');
  const [diasSemana, setDiasSemana] = useState<DiaSemana[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Actualizar días de la semana
  useEffect(() => {
    const fechasSemana = obtenerFechasSemana();
    setDiasSemana(fechasSemana);
  }, []);

  // Cargar reportes cuando cambie la selección
  useEffect(() => {
    if (filialSeleccionada && programaSeleccionado && diasSemana.length > 0) {
      cargarReportes();
    }
  }, [filialSeleccionada, programaSeleccionado, diasSemana]);

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
        }
      }
      
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  // Cargar reportes
  const cargarReportes = async () => {
    try {
      if (!diasSemana.length) return;
      
      const fechaInicio = diasSemana[0].fecha;
      const fechaFin = diasSemana[diasSemana.length - 1].fecha;
      
      const reportesData = await getReportesPorFechas(fechaInicio, fechaFin);
      setReportes(reportesData);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
    }
  };

  // Obtener programas de la filial seleccionada
   const getProgramasDeFilial = () => {
    if (!filialSeleccionada) return [];
    
    const filial = filiales.find(f => Number(f.id) === filialSeleccionada);
    if (!filial) return [];
    
    return programas.filter(p => {
      // Verificar si el programa está asociado a la filial
      // Primero verificar filialesIds (múltiples filiales)
      if (p.filialesIds && p.filialesIds.length > 0) {
        return p.filialesIds.includes(filialSeleccionada);
      }
      // Luego verificar programaIds de la filial
      if (filial.programaIds && filial.programaIds.includes(Number(p.id))) {
        return true;
      }
      // Finalmente verificar filialId único (compatibilidad)
      return Number(p.filialId) === filialSeleccionada;
    });
  };

  // Manejar cambio de filial
  const handleFilialClick = (filialId: number) => {
    setFilialSeleccionada(filialId);
    setProgramaSeleccionado(null);
    
    // Seleccionar primer programa de la filial
    const programasFilial = programas.filter(p => {
      // Verificar si el programa está asociado a la filial
      // Primero verificar filialesIds (múltiples filiales)
      if (p.filialesIds && p.filialesIds.length > 0) {
        return p.filialesIds.includes(filialId);
      }
      // Luego verificar programaIds de la filial
      const filial = filiales.find(f => Number(f.id) === filialId);
      if (filial?.programaIds?.includes(Number(p.id))) {
        return true;
      }
      // Finalmente verificar filialId único (compatibilidad)
      return Number(p.filialId) === filialId;
    });
    
    if (programasFilial.length > 0) {
      setProgramaSeleccionado(Number(programasFilial[0].id));
    }
  };

  // Obtener el reporte para una fecha específica
  const getReporte = (filialId: number, programaId: number, fecha: string): Reporte | null => {
    return reportes.find(r => 
      r.filialId === filialId && 
      r.programaId === programaId && 
      r.fecha === fecha
    ) || null;
  };

  // Abrir formulario (redirección a página separada)
  const abrirFormulario = (filialId: number, programaId: number, dia: string, fecha: string) => {
    // En lugar de mostrar un modal, redirigir a la página de reportes
    router.push(`/reportes/${filialId}/${programaId}/${fecha}`);
  };

  // Verificar si un programa se transmite en un día
  const programaTransmiteEnDia = (programa: Programa, diaNombre: string): boolean => {
    if (!programa.diasSemana || programa.diasSemana.length === 0) {
      return false;
    }
    
    // Normalizar el nombre del día para la comparación
    const diaNormalizado = normalizarDiaSemana(diaNombre);
    
    // Comprobar si el programa tiene este día en su lista de diasSemana
    return programa.diasSemana.some(d => {
      const diaProgramaNormalizado = normalizarDiaSemana(d);
      return diaProgramaNormalizado === diaNormalizado;
    });
  };

  // Renderizar indicador de estado
  const renderEstadoIndicador = (estado: string | null, reporte: Reporte | null) => {
    let bgColor = "bg-gray-200";
    let icon = "⏱";
    let iconColor = "text-white";
    let showIcon = true;
    
    const estadoNormalizado = estado || ESTADOS_TRANSMISION.PENDIENTE;
    
    switch (estadoNormalizado) {
      case ESTADOS_TRANSMISION.SI_TRANSMITIO:
        bgColor = "bg-emerald-500";
        icon = "✓";
        break;
      case ESTADOS_TRANSMISION.NO_TRANSMITIO:
        bgColor = "bg-red-500";
        icon = "✕";
        break;
      case ESTADOS_TRANSMISION.TRANSMITIO_TARDE:
        bgColor = "bg-amber-500";
        showIcon = false;
        break;
    }
    
    return (
      <div className={`${bgColor} w-16 h-16 rounded-lg shadow-md flex items-center justify-center cursor-pointer relative group transition-all duration-300 hover:shadow-lg`}>
        {showIcon && <span className={`${iconColor} text-2xl`}>{icon}</span>}
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
          <div className="p-2">
            {estadoNormalizado === ESTADOS_TRANSMISION.SI_TRANSMITIO && (
              <>
                <div className="font-bold">Sí transmitió</div>
                <div>Hora: {reporte?.horaReal || reporte?.hora || '-'}</div>
              </>
            )}
            {estadoNormalizado === ESTADOS_TRANSMISION.NO_TRANSMITIO && (
              <>
                <div className="font-bold">No transmitió</div>
                <div>Motivo: {reporte?.target || '-'}</div>
                {reporte?.motivo && <div>Detalle: {reporte.motivo}</div>}
              </>
            )}
            {estadoNormalizado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE && (
              <>
                <div className="font-bold">Transmitió tarde</div>
                <div>Hora programada: {reporte?.horaReal || reporte?.hora || '-'}</div>
                <div>Hora real: {reporte?.hora_tt || '-'}</div>
                {reporte?.motivo && <div>Motivo: {reporte.motivo}</div>}
              </>
            )}
            {estadoNormalizado === ESTADOS_TRANSMISION.PENDIENTE && (
              <div className="font-bold">Pendiente</div>
            )}
          </div>
          <div className="w-3 h-3 bg-gray-800 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
        </div>
      </div>
    );
  };

  // Renderizar estado de carga
  if (cargando) {
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
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Barra superior con opción de reportes semanales */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center text-lg font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {programaSeleccionado 
              ? programas.find(p => Number(p.id) === programaSeleccionado)?.nombre 
              : "Sistema de Control de Transmisiones"}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link 
            href="/reportes/semanales" 
            className="px-4 py-1.5 bg-white text-blue-700 rounded-md font-medium hover:bg-blue-50 transition-colors shadow-sm text-sm"
          >
            Reportes Semanales
          </Link>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
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

      {/* Leyenda */}
      <div className="bg-white border-b border-gray-200 py-2 px-4 flex items-center space-x-6 text-sm">
        <div className="font-medium">Leyenda:</div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-emerald-500 rounded mr-2"></div>
          <span>Transmitió</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span>No transmitió</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
          <span>Transmitió Tarde</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
          <span>Pendiente</span>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Menú de filiales */}
        <div className="w-64 bg-white shadow-md z-10 overflow-y-auto">
          <div className="py-4 px-6 text-lg font-bold text-gray-800 border-b border-gray-100">
            Filiales
          </div>
          <div className="py-2">
            {filiales.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <p className="text-sm">No hay filiales disponibles</p>
              </div>
            ) : (
              filiales.map((filial) => (
                <div
                  key={filial.id}
                  className={`flex justify-between px-6 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                    filialSeleccionada === Number(filial.id) ? "bg-blue-50 border-l-4 border-blue-600 font-medium" : ""
                  }`}
                  onClick={() => handleFilialClick(Number(filial.id))}
                >
                  <div className={filialSeleccionada === Number(filial.id) ? "text-blue-700" : "text-gray-700"}>
                    {filial.nombre}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Pestañas de programas */}
          {filialSeleccionada && (
            <div className="bg-white border-b border-gray-200 overflow-x-auto shadow-sm">
              <div className="flex px-4">
                {getProgramasDeFilial().map((prog) => (
                  <button
                    key={prog.id}
                    className={`px-6 py-4 whitespace-nowrap border-b-2 transition-all duration-200 ${
                      programaSeleccionado === Number(prog.id)
                        ? "text-blue-600 border-blue-600 font-medium"
                        : "text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-300"
                    }`}
                    onClick={() => setProgramaSeleccionado(Number(prog.id))}
                  >
                    <div className="text-sm">{prog.nombre}</div>
                    <div className="text-xs text-gray-500">{prog.horario || prog.horaInicio}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tabla de días y estados */}
          <div className="flex-1 overflow-auto">
            {filialSeleccionada && programaSeleccionado ? (
              <div className="p-6">
                {/* Días de la semana */}
                <div className="grid grid-cols-6 gap-4 mb-4">
                  {diasSemana.map((dia, idx) => (
                    <div key={idx} className="text-center">
                      <div className="font-medium text-gray-800">{dia.nombre}</div>
                      <div className="text-xs text-gray-500">{dia.fecha}</div>
                    </div>
                  ))}
                </div>
                
                {/* Estados de transmisión */}
                <div className="grid grid-cols-6 gap-4">
                  {diasSemana.map((dia, idx) => {
                    const programa = programas.find(p => Number(p.id) === programaSeleccionado);
                    if (!programa) return null;
                    
                    const transmiteEnDia = programaTransmiteEnDia(programa, dia.nombre);
                    
                    if (!transmiteEnDia) {
                      return (
                        <div key={idx} className="flex justify-center items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                            No programado
                          </div>
                        </div>
                      );
                    }
                    
                    const reporte = getReporte(
                      filialSeleccionada!, 
                      programaSeleccionado,
                      dia.fecha
                    );
                    
                    return (
                      <div key={idx} className="flex justify-center items-center">
                        <div 
                          onClick={() => abrirFormulario(
                            filialSeleccionada!,
                            programaSeleccionado,
                            dia.nombre,
                            dia.fecha
                          )}
                        >
                          {renderEstadoIndicador(reporte?.estado || null, reporte)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-lg">Selecciona una filial y un programa para ver su programación</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}