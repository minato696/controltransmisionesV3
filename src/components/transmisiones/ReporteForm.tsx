// src/components/transmisiones/ReporteForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Reporte, TransmisionEditar } from './types';
import { ESTADOS_TRANSMISION, TARGETS_NO_TRANSMISION, TARGETS_RETRASO } from './constants';

interface ReporteFormProps {
  mostrar: boolean;
  transmisionEditar: TransmisionEditar | null;
  reporteActual: Reporte | null;
  onClose: () => void;
  onGuardar: (datos: {
    estadoTransmision: string;
    horaReal: string;
    horaTT: string;
    target: string;
    motivoPersonalizado: string;
  }) => Promise<void>;
  guardando: boolean;
  error: string | null;
}

/**
 * Componente de formulario para crear o editar reportes de transmisión
 */
const ReporteForm: React.FC<ReporteFormProps> = ({
  mostrar,
  transmisionEditar,
  reporteActual,
  onClose,
  onGuardar,
  guardando,
  error
}) => {
  // Estados para el formulario
  const [estadoTransmision, setEstadoTransmision] = useState<string>(ESTADOS_TRANSMISION.PENDIENTE);
  const [horaReal, setHoraReal] = useState('');
  const [horaTT, setHoraTT] = useState('');
  const [target, setTarget] = useState('');
  const [motivoPersonalizado, setMotivoPersonalizado] = useState('');
  
  // Debug
  useEffect(() => {
    // Solo mostrar logs en desarrollo y si está habilitado
    const DEBUG_ENABLED = false; // Cambiar a true para habilitar logs de depuración
    
    if (DEBUG_ENABLED) {
      console.log('Estado actual del formulario:', { 
        estadoTransmision, 
        horaReal, 
        horaTT, 
        target, 
        motivoPersonalizado,
        reporteActual: reporteActual ? 
          { estado: reporteActual.estado, target: reporteActual.target, motivo: reporteActual.motivo } : 
          'No hay reporte actual' 
      });
    }
  }, [estadoTransmision, horaReal, horaTT, target, motivoPersonalizado, reporteActual]);

  // Inicializar valores del formulario cuando cambia el reporte actual
  useEffect(() => {
    if (reporteActual) {
      console.log('Inicializando con reporte actual:', reporteActual);
      
      // Establecer estado de transmisión
      setEstadoTransmision(reporteActual.estado || ESTADOS_TRANSMISION.PENDIENTE);
      
      // Establecer hora y hora real
      setHoraReal(reporteActual.horaReal || reporteActual.hora || transmisionEditar?.hora || '');
      setHoraTT(reporteActual.hora_tt || '');
      
      // Manejar target y motivo personalizado
      if (reporteActual.motivo) {
        // Si hay un motivo personalizado, seleccionar "Otros"
        console.log('Encontrado motivo personalizado, estableciendo target como "Otros"');
        setTarget('Otros');
        setMotivoPersonalizado(reporteActual.motivo);
      } else if (reporteActual.target) {
        // Si hay un target pero no motivo personalizado
        console.log('Estableciendo target:', reporteActual.target);
        setTarget(reporteActual.target);
        setMotivoPersonalizado('');
      } else {
        // No hay ni target ni motivo
        setTarget('');
        setMotivoPersonalizado('');
      }
    } else if (transmisionEditar) {
      console.log('Inicializando con transmisión nueva');
      setEstadoTransmision(ESTADOS_TRANSMISION.PENDIENTE);
      setHoraReal(transmisionEditar.hora || '');
      setHoraTT('');
      setTarget('');
      setMotivoPersonalizado('');
    }
  }, [reporteActual, transmisionEditar]);

  // Efecto adicional para forzar la selección del valor correcto en los selectores
  useEffect(() => {
    const DEBUG_ENABLED = false; // Cambiar a true para habilitar logs de depuración
    
    if (reporteActual?.motivo && mostrar) {
      // Usar un pequeño timeout para asegurar que los selectores estén disponibles
      const timer = setTimeout(() => {
        // Seleccionar el valor "Otros" en el selector adecuado
        const selector = estadoTransmision === ESTADOS_TRANSMISION.TRANSMITIO_TARDE 
          ? 'tarde' 
          : (estadoTransmision === ESTADOS_TRANSMISION.NO_TRANSMITIO ? 'no' : null);
        
        if (selector) {
          const selectElement = document.querySelector(`select[data-target-select="${selector}"]`);
          if (selectElement) {
            if (DEBUG_ENABLED) console.log(`Forzando valor 'Otros' en selector ${selector}`, selectElement);
            (selectElement as HTMLSelectElement).value = 'Otros';
          }
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [reporteActual, mostrar, estadoTransmision]);

  // Manejar cambio de estado de transmisión
  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoEstado = e.target.value;
    console.log('Cambio de estado:', nuevoEstado);
    setEstadoTransmision(nuevoEstado);
    
    // Conservar valores si hay reporte actual
    if (reporteActual) {
      if (nuevoEstado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE && reporteActual.motivo) {
        // Si cambia a "Transmitió tarde" y hay un motivo personalizado, seleccionar "Otros"
        setTarget('Otros');
        setMotivoPersonalizado(reporteActual.motivo);
      } else if (nuevoEstado === ESTADOS_TRANSMISION.NO_TRANSMITIO && reporteActual.motivo) {
        // Si cambia a "No transmitió" y hay un motivo personalizado, seleccionar "Otros"
        setTarget('Otros');
        setMotivoPersonalizado(reporteActual.motivo);
      } else if (nuevoEstado !== ESTADOS_TRANSMISION.TRANSMITIO_TARDE && 
                 nuevoEstado !== ESTADOS_TRANSMISION.NO_TRANSMITIO) {
        // Resetear target y motivo si cambia a otro estado
        setTarget('');
        setMotivoPersonalizado('');
      }
    } else {
      // No hay reporte actual, resetear valores si el estado no requiere target
      if (nuevoEstado !== ESTADOS_TRANSMISION.TRANSMITIO_TARDE && 
          nuevoEstado !== ESTADOS_TRANSMISION.NO_TRANSMITIO) {
        setTarget('');
        setMotivoPersonalizado('');
      }
    }
  };

  // Efecto para restablecer los valores cuando cambia el estado de transmisión
  useEffect(() => {
    // Si el estado es "Transmitió tarde" o "No transmitió", y hay un motivo guardado,
    // mantenerlo cuando se carga un reporte existente
    if (reporteActual && 
        (estadoTransmision === ESTADOS_TRANSMISION.TRANSMITIO_TARDE || 
         estadoTransmision === ESTADOS_TRANSMISION.NO_TRANSMITIO)) {
      setTarget(reporteActual.target || '');
      setMotivoPersonalizado(reporteActual.motivo || '');
    }
  }, [estadoTransmision, reporteActual]);

  // Manejar cambio de target
  const handleTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoTarget = e.target.value;
    console.log('Cambio de target:', nuevoTarget);
    setTarget(nuevoTarget);
    
    // Si cambia a un valor diferente de "Otros", limpiar el motivo personalizado
    // Solo si no hay un motivo guardado previamente
    if (nuevoTarget !== 'Otros' && (!reporteActual || !reporteActual.motivo)) {
      setMotivoPersonalizado('');
    } else if (nuevoTarget === 'Otros' && reporteActual && reporteActual.motivo) {
      // Si cambia a "Otros" y hay un motivo guardado, recuperarlo
      setMotivoPersonalizado(reporteActual.motivo);
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    console.log('Enviando formulario con datos:', {
      estadoTransmision,
      horaReal,
      horaTT,
      target,
      motivoPersonalizado
    });
    
    await onGuardar({
      estadoTransmision,
      horaReal,
      horaTT,
      target,
      motivoPersonalizado
    });
  };

  // Determinar qué opciones de target mostrar
  const getTargetOptions = () => {
    if (estadoTransmision === ESTADOS_TRANSMISION.NO_TRANSMITIO) {
      return TARGETS_NO_TRANSMISION;
    } else if (estadoTransmision === ESTADOS_TRANSMISION.TRANSMITIO_TARDE) {
      return TARGETS_RETRASO;
    }
    return [];
  };

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-full mx-4 animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {reporteActual ? 'Actualizar' : 'Nuevo'} Reporte
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={guardando}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-5">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-700"><span className="font-medium">Filial:</span> {transmisionEditar?.filial}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Programa:</span> {transmisionEditar?.programa}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Día:</span> {transmisionEditar?.dia}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Fecha:</span> {transmisionEditar?.fecha}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Hora programada:</span> {transmisionEditar?.hora}</div>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado de transmisión</label>
            <select 
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={estadoTransmision}
              onChange={handleEstadoChange}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora real de transmisión</label>
              <input 
                type="time" 
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={horaReal}
                onChange={(e) => setHoraReal(e.target.value)}
                disabled={guardando}
              />
            </div>
          )}
          
          {estadoTransmision === ESTADOS_TRANSMISION.NO_TRANSMITIO && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <select 
                key={`no-transmitio-select-${estadoTransmision}-${reporteActual?.motivo ? 'otros' : ''}`}
                data-target-select="no"
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={target}
                onChange={handleTargetChange}
                disabled={guardando}
              >
                <option value="">Seleccione un motivo</option>
                {TARGETS_NO_TRANSMISION.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              
              {target === 'Otros' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especifique el motivo</label>
                  <input 
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
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora programada</label>
                <input 
                  type="time" 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={horaReal}
                  onChange={(e) => setHoraReal(e.target.value)}
                  disabled={guardando}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora real de transmisión</label>
                <input 
                  type="time" 
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={horaTT}
                  onChange={(e) => setHoraTT(e.target.value)}
                  placeholder="HH:MM"
                  disabled={guardando}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del retraso</label>
                <select 
                  key={`tarde-select-${estadoTransmision}-${reporteActual?.motivo ? 'otros' : ''}`} 
                  data-target-select="tarde"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={target}
                  onChange={handleTargetChange}
                  disabled={guardando}
                >
                  <option value="">Seleccione un motivo</option>
                  {getTargetOptions().map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                
                {target === 'Otros' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Especifique el motivo</label>
                    <input 
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
            </>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-8">
          <button 
            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors disabled:opacity-50"
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button 
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center"
            onClick={handleSubmit}
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
      </div>
    </div>
  );
};

export default ReporteForm;