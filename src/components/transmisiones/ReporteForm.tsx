'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TARGETS_NO_TRANSMISION, 
  TARGETS_RETRASO, 
  ESTADOS_TRANSMISION 
} from './constants';
import { Reporte, TransmisionEditar } from './types';
import { guardarOActualizarReporte } from '../../services/api-client';

interface ReporteFormProps {
  transmisionData: TransmisionEditar;
  reporteActual?: Reporte | null;
  onSuccess?: () => void;
}

export default function ReporteForm({ 
  transmisionData, 
  reporteActual = null,
  onSuccess
}: ReporteFormProps) {
  const router = useRouter();
  
  // Estados para el formulario
  const [estadoTransmision, setEstadoTransmision] = useState<string>(ESTADOS_TRANSMISION.PENDIENTE);
  const [horaReal, setHoraReal] = useState('');
  const [horaTT, setHoraTT] = useState('');
  const [target, setTarget] = useState('');
  const [motivoPersonalizado, setMotivoPersonalizado] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar valores del formulario
  useEffect(() => {
    if (reporteActual) {
      setEstadoTransmision(reporteActual.estado || ESTADOS_TRANSMISION.PENDIENTE);
      setHoraReal(reporteActual.horaReal || reporteActual.hora || transmisionData.hora || '');
      setHoraTT(reporteActual.hora_tt || '');
      setTarget(reporteActual.target || '');
      setMotivoPersonalizado(reporteActual.motivo || '');
    } else {
      setEstadoTransmision(ESTADOS_TRANSMISION.PENDIENTE);
      setHoraReal(transmisionData.hora || '');
      setHoraTT('');
      setTarget('');
      setMotivoPersonalizado('');
    }
  }, [reporteActual, transmisionData]);

  // Guardar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setGuardando(true);
      setError(null);
      
      // Preparar datos del reporte
      const datosReporte: any = {
        filialId: transmisionData.filialId,
        programaId: transmisionData.programaId,
        fecha: transmisionData.fecha,
        estadoTransmision: estadoTransmision === ESTADOS_TRANSMISION.SI_TRANSMITIO ? 'Si' :
                          estadoTransmision === ESTADOS_TRANSMISION.NO_TRANSMITIO ? 'No' :
                          estadoTransmision === ESTADOS_TRANSMISION.TRANSMITIO_TARDE ? 'Tarde' : 
                          'Pendiente',
        estado: estadoTransmision
      };
      
      // Agregar ID si es actualización
      if (reporteActual?.id_reporte) {
        datosReporte.id_reporte = reporteActual.id_reporte;
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
      await guardarOActualizarReporte(
        transmisionData.filialId,
        transmisionData.programaId,
        transmisionData.fecha,
        datosReporte
      );
      
      // Llamar al callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      }
      
      // Volver a la página anterior
      router.back();
    } catch (err: any) {
      console.error('Error al guardar:', err);
      
      // Mostrar mensaje de error detallado
      if (err.response && err.response.data && err.response.data.error) {
        setError(`Error: ${err.response.data.error}`);
      } else if (err.message) {
        setError(`Error al guardar: ${err.message}`);
      } else {
        setError('Error al guardar el reporte. Por favor, intente nuevamente.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {reporteActual ? 'Actualizar' : 'Nuevo'} Reporte
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Completa el formulario para {reporteActual ? 'actualizar' : 'crear'} el reporte
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Filial</p>
                <p className="text-sm font-bold">{transmisionData.filial}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Programa</p>
                <p className="text-sm font-bold">{transmisionData.programa}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Día</p>
                <p className="text-sm font-bold">{transmisionData.dia}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha</p>
                <p className="text-sm font-bold">{transmisionData.fecha}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Hora programada</p>
                <p className="text-sm font-bold">{transmisionData.hora}</p>
              </div>
            </div>
          </div>
          
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
              onClick={() => router.back()}
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
  );
}