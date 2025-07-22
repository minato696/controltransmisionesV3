'use client';

import { TARGETS_NO_TRANSMISION } from './constants';

interface FormularioNoTransmitioProps {
  target: string;
  motivoPersonalizado: string;
  onTargetChange: (target: string) => void;
  onMotivoChange: (motivo: string) => void;
  disabled: boolean;
}

/**
 * Componente de formulario para el estado "No transmitió"
 * Muestra campos para seleccionar el motivo y especificarlo en caso de "Otros"
 */
export default function FormularioNoTransmitio({
  target,
  motivoPersonalizado,
  onTargetChange,
  onMotivoChange,
  disabled
}: FormularioNoTransmitioProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
      <select 
        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        value={target}
        onChange={(e) => onTargetChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">Seleccione un motivo</option>
        {TARGETS_NO_TRANSMISION.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      
      {target === 'Otros' && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Especifique el motivo
          </label>
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
  );
}