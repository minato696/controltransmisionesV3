'use client';

import { useState } from 'react';
import { 
  ESTADOS_TRANSMISION, 
  TARGETS_NO_TRANSMISION, 
  TARGETS_RETRASO
} from './constants';
import { TransmisionEditar, Reporte } from './types';
import { guardarOActualizarReporte } from '../../services/api-client';

interface FormularioReporteProps {
  transmisionEditar: TransmisionEditar;
  reporteActual: Reporte | null;
  onClose: (actualizado?: boolean) => void;
}

export default function FormularioReporte({ 
  transmisionEditar, 
  reporteActual, 
  onClose 
}: FormularioReporteProps) {
  
  // Estados para el formulario
  const [estadoTransmision, setEstadoTransmision] = useState<string>(
    reporteActual?.estado || ESTADOS_TRANSMISION.PENDIENTE
  );
  const [horaReal, setHoraReal] = useState(
    reporteActual?.horaReal || reporteActual?.hora || transmisionEditar.hora || ''
  );
  const [horaTT, setHoraTT] = useState(reporteActual?.hora_tt || '');
  const [target, setTarget] = useState(reporteActual?.target || '');
  const [motivoPersonalizado, setMotivoPersonalizado] = useState(reporteActual?.motivo || '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guardar formulario
  const guardarFormulario = async () => {
    if (!transmisionEditar) return;
    
    try {
      setGuardando(true);
      setError(null);
      
      // Preparar datos del reporte
      const datosReporte: any = {
        filialId: transmisionEditar.filialId,
        programaId: transmisionEditar.programaId,
        fecha: transmisionEditar.fecha,
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
        transmisionEditar.filialId,
        transmisionEditar.programaId,
        transmisionEditar.fecha,
        datosReporte
      );
      
      onClose(true);
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

  // Renderizar campos para estado "Sí transmitió"
  const renderSiTransmitio = () => {
    if (estadoTransmision !== ESTADOS_TRANSMISION.SI_TRANSMITIO) return null;
    
    return (
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
    );
  };

  // Renderizar campos para estado "No transmitió"
  const renderNoTransmitio = () => {
    if (estadoTransmision !== ESTADOS_TRANSMISION.NO_TRANSMITIO) return null;
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
        <select 
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
    );
  };

  // Renderizar campos para estado "Transmitió tarde"
  const renderTransmitioTarde = () => {
    if (estadoTransmision !== ESTADOS_TRANSMISION.TRANSMITIO_TARDE) return null;
    
    return (
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
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-full mx-4 animate-fade-in-up">
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {reporteActual ? 'Actualizar' : 'Nuevo'} Reporte
          </h2>
          <button 
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={guardando}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200 mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-5">
          {/* Información de la transmisión */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-700"><span className="font-medium">Filial:</span> {transmisionEditar.filial}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Programa:</span> {transmisionEditar.programa}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Día:</span> {transmisionEditar.dia}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Fecha:</span> {transmisionEditar.fecha}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Hora programada:</span> {transmisionEditar.hora}</div>
          </div>
          
          {/* Selector de estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado de transmisión</label>
            <select 
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
          
          {/* Campos específicos según el estado */}
          {renderSiTransmitio()}
          {renderNoTransmitio()}
          {renderTransmitioTarde()}
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 mt-8">
          <button 
            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors disabled:opacity-50"
            onClick={() => onClose()}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button 
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center"
            onClick={guardarFormulario}
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
}