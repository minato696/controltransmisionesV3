'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  getFilial, 
  getPrograma, 
  getReportesPorFechas 
} from '@/services/api-client';
import { 
  ESTADOS_TRANSMISION,
  TARGETS_NO_TRANSMISION, 
  TARGETS_RETRASO
} from '@/components/transmisiones/constants';

interface ReporteData {
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

export default function ReportePorFechaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Obtener parámetros de la URL
  const fecha = searchParams.get('fecha') || '';
  const filialId = searchParams.get('filialId') || '';
  const programaId = searchParams.get('programaId') || '';
  
  // Estados para el formulario
  const [filial, setFilial] = useState<any>(null);
  const [programa, setPrograma] = useState<any>(null);
  const [reporte, setReporte] = useState<ReporteData | null>(null);
  const [estadoTransmision, setEstadoTransmision] = useState<string>(ESTADOS_TRANSMISION.PENDIENTE);
  const [horaReal, setHoraReal] = useState('');
  const [horaTT, setHoraTT] = useState('');
  const [target, setTarget] = useState('');
  const [motivoPersonalizado, setMotivoPersonalizado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  
  // Cargar datos
  useEffect(() => {
    if (fecha && filialId && programaId) {
      cargarDatos();
    } else {
      setError('Faltan parámetros necesarios para cargar el reporte');
      setCargando(false);
    }
  }, [fecha, filialId, programaId]);
  
  // Función para cargar los datos
  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar filial y programa
      const [filialData, programaData, reportesData] = await Promise.all([
        getFilial(filialId),
        getPrograma(programaId),
        getReportesPorFechas(fecha, fecha)
      ]);
      
      setFilial(filialData);
      setPrograma(programaData);
      
      // Buscar el reporte para esta combinación de filial, programa y fecha
      const reporteExistente = reportesData.find(
        (r: ReporteData) => r.filialId === Number(filialId) && 
             r.programaId === Number(programaId) && 
             r.fecha === fecha
      );
      
      setReporte(reporteExistente || null);
      
      // Inicializar formulario con los datos del reporte o valores por defecto
      if (reporteExistente) {
        setEstadoTransmision(reporteExistente.estado || ESTADOS_TRANSMISION.PENDIENTE);
        setHoraReal(reporteExistente.horaReal || reporteExistente.hora || programaData.horario || programaData.horaInicio || '');
        setHoraTT(reporteExistente.hora_tt || '');
        setTarget(reporteExistente.target || '');
        setMotivoPersonalizado(reporteExistente.motivo || '');
      } else {
        setEstadoTransmision(ESTADOS_TRANSMISION.PENDIENTE);
        setHoraReal(programaData.horario || programaData.horaInicio || '');
        setHoraTT('');
        setTarget('');
        setMotivoPersonalizado('');
      }
      
      setCargando(false);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
      setCargando(false);
    }
  };
  
  // Función para formatear una fecha en formato legible
  const formatearFecha = (fechaStr: string): string => {
    try {
      const [year, month, day] = fechaStr.split('-');
      const fecha = new Date(Number(year), Number(month) - 1, Number(day));
      return fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return fechaStr;
    }
  };
  
  // Función para obtener el día de la semana
  const getDiaSemana = (fechaStr: string): string => {
    try {
      const [year, month, day] = fechaStr.split('-');
      const fecha = new Date(Number(year), Number(month) - 1, Number(day));
      return fecha.toLocaleDateString('es-ES', { weekday: 'long' });
    } catch (err) {
      return '';
    }
  };
  
  // Guardar el reporte
  const guardarReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setGuardando(true);
      setError(null);
      setExito(null);
      
      // Preparar datos del reporte
      const datosReporte: any = {
        filialId: Number(filialId),
        programaId: Number(programaId),
        fecha: fecha,
        estadoTransmision: estadoTransmision === ESTADOS_TRANSMISION.SI_TRANSMITIO ? 'Si' :
                          estadoTransmision === ESTADOS_TRANSMISION.NO_TRANSMITIO ? 'No' :
                          estadoTransmision === ESTADOS_TRANSMISION.TRANSMITIO_TARDE ? 'Tarde' : 
                          'Pendiente',
        estado: estadoTransmision
      };
      
      // Agregar ID si es actualización
      if (reporte?.id_reporte) {
        datosReporte.id_reporte = reporte.id_reporte;
      }
      
      // Configurar datos según el estado
      if (estadoTransmision === ESTADOS_TRANSMISION.SI_TRANSMITIO) {
        datosReporte.hora = horaReal;
        datosReporte.horaReal = horaReal;
      } else if (estadoTransmision === ESTADOS_TRANSMISION.NO_TRANSMITIO) {
        datosReporte.target = target;
        if (target === 'Otros') {
          datosReporte.motivo = motivoPersonalizado;
        }
      } else if (estadoTransmision === ESTADOS_TRANSMISION.TRANSMITIO_TARDE) {
        datosReporte.hora = horaReal;
        datosReporte.horaReal = horaReal;
        datosReporte.hora_tt = horaTT;
        datosReporte.target = target;
        if (target === 'Otros') {
          datosReporte.motivo = motivoPersonalizado;
        }
      }
      
      // Guardar en la API
      await fetch('/api/reportes/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([datosReporte]),
      });
      
      setExito('El reporte se ha guardado correctamente');
      setGuardando(false);
      
      // Recargar datos después de guardar
      await cargarDatos();
      
      // Ocultar mensaje de éxito después de unos segundos
      setTimeout(() => {
        setExito(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error al guardar reporte:', err);
      setError('Error al guardar el reporte. Por favor, intente nuevamente.');
      setGuardando(false);
    }
  };
  
  // Volver a la página anterior
  const volver = () => {
    router.back();
  };
  
  // Mostrar cargando
  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }
  
  // Mostrar error si no hay parámetros válidos
  if (error && (!fecha || !filialId || !programaId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={volver}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Barra superior con navegación */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={volver}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver
          </button>
          
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Inicio
          </Link>
        </div>
        
        {/* Formulario de reporte */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {reporte ? 'Actualizar' : 'Nuevo'} Reporte
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {formatearFecha(fecha)} - {filial?.nombre} - {programa?.nombre}
            </p>
          </div>
          
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
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Filial</p>
                <p className="text-sm font-bold">{filial?.nombre}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Programa</p>
                <p className="text-sm font-bold">{programa?.nombre}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Día</p>
                <p className="text-sm font-bold">{getDiaSemana(fecha)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha</p>
                <p className="text-sm font-bold">{fecha}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Hora programada</p>
                <p className="text-sm font-bold">{programa?.horario || programa?.horaInicio || '—'}</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={guardarReporte} className="space-y-6">
            <div>
              <label htmlFor="estadoTransmision" className="block text-sm font-medium text-gray-700 mb-1">
                Estado de transmisión
              </label>
              <select 
                id="estadoTransmision"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={estadoTransmision}
                onChange={(e) => setEstadoTransmision(e.target.value)}
                disabled={guardando}
              >
                <option value={ESTADOS_TRANSMISION.PENDIENTE}>Pendiente</option>
                <option value={ESTADOS_TRANSMISION.SI_TRANSMITIO}>Sí transmitió</option>
                <option value={ESTADOS_TRANSMISION.NO_TRANSMITIO}>No transmitió</option>
                <option value={ESTADOS_TRANSMISION.TRANSMITIO_TARDE}>Transmitió tarde</option>
              </select>
            </div>
            
            {estadoTransmision === ESTADOS_TRANSMISION.SI_TRANSMITIO && (
              <div>
                <label htmlFor="horaReal" className="block text-sm font-medium text-gray-700 mb-1">
                  Hora real de transmisión
                </label>
                <input 
                  id="horaReal"
                  type="time" 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={horaReal}
                  onChange={(e) => setHoraReal(e.target.value)}
                  disabled={guardando}
                />
              </div>
            )}
            
            {estadoTransmision === ESTADOS_TRANSMISION.NO_TRANSMITIO && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo
                  </label>
                  <select 
                    id="target"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    disabled={guardando}
                  >
                    <option value="">Seleccione un motivo</option>
                    {TARGETS_NO_TRANSMISION.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                
                {target === 'Otros' && (
                  <div>
                    <label htmlFor="motivoPersonalizado" className="block text-sm font-medium text-gray-700 mb-1">
                      Especifique el motivo
                    </label>
                    <input 
                      id="motivoPersonalizado"
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={motivoPersonalizado}
                      onChange={(e) => setMotivoPersonalizado(e.target.value)}
                      placeholder="Ingrese el motivo..."
                      disabled={guardando}
                    />
                  </div>
                )}
              </div>
            )}
            
            {estadoTransmision === ESTADOS_TRANSMISION.TRANSMITIO_TARDE && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="horaReal" className="block text-sm font-medium text-gray-700 mb-1">
                    Hora programada
                  </label>
                  <input 
                    id="horaReal"
                    type="time" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={horaReal}
                    onChange={(e) => setHoraReal(e.target.value)}
                    disabled={guardando}
                  />
                </div>
                
                <div>
                  <label htmlFor="horaTT" className="block text-sm font-medium text-gray-700 mb-1">
                    Hora real de transmisión
                  </label>
                  <input 
                    id="horaTT"
                    type="time" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={horaTT}
                    onChange={(e) => setHoraTT(e.target.value)}
                    placeholder="HH:MM"
                    disabled={guardando}
                  />
                </div>
                
                <div>
                  <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo del retraso
                  </label>
                  <select 
                    id="target"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    disabled={guardando}
                  >
                    <option value="">Seleccione un motivo</option>
                    {TARGETS_RETRASO.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                
                {target === 'Otros' && (
                  <div>
                    <label htmlFor="motivoPersonalizado" className="block text-sm font-medium text-gray-700 mb-1">
                      Especifique el motivo
                    </label>
                    <input 
                      id="motivoPersonalizado"
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={motivoPersonalizado}
                      onChange={(e) => setMotivoPersonalizado(e.target.value)}
                      placeholder="Ingrese el motivo..."
                      disabled={guardando}
                    />
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={volver}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors disabled:opacity-50"
                disabled={guardando}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center"
                disabled={guardando}
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
                  'Guardar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}