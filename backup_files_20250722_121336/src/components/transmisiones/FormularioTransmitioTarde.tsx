'use client';

import { TARGETS_RETRASO } from './constants';

interface FormularioTransmitioTardeProps {
  horaReal: string;
  horaTT: string;
  target: string;
  motivoPersonalizado: string;
  onHoraRealChange: (hora: string) => void;
  onHoraTTChange: (hora: string) => void;
  onTargetChange: (target: string) => void;
  onMotivoChange: (motivo: string) => void;
  disabled: boolean;
}

/**
 * Componente de formulario para el estado "Transmitió tarde"
 * Muestra campos para hora programada, hora real y motivo del retraso
 */
export default function FormularioTransmitioTarde({
  horaReal,
  horaTT,
  target,
  motivoPersonalizado,
  onHoraRealChange,
  onHoraTTChange,
  onTargetChange,
  onMotivoChange,
  disabled
}: FormularioTransmitioTardeProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hora programada</label>
        <input 
          type="time" 
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          value={horaReal}
          onChange={(e) => onHoraRealChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hora real de transmisión</label>
        <input 
          type="time" 
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          value={horaTT}
          onChange={(e) => onHoraTTChange(e.target.value)}
          placeholder="HH:MM"
          disabled={disabled}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del retraso</label>
        <select 
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          value={target}
          onChange={(e) => onTargetChange(e.target.value)}
          disabled={disabled}
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
              onChange={(e) => onMotivoChange(e.target.value)}
              placeholder="Ingrese el motivo..."
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </>
  );
}