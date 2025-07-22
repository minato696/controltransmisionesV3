'use client';

import { ESTADOS_TRANSMISION } from './constants';

interface SelectorEstadoProps {
  estado: string;
  onChange: (estado: string) => void;
  disabled: boolean;
}

export default function SelectorEstado({
  estado,
  onChange,
  disabled
}: SelectorEstadoProps) {
  // Determinar el color del borde según el estado
  const getBorderColor = () => {
    switch (estado) {
      case ESTADOS_TRANSMISION.SI_TRANSMITIO:
        return 'focus:ring-emerald-500 focus:border-emerald-500';
      case ESTADOS_TRANSMISION.NO_TRANSMITIO:
        return 'focus:ring-red-500 focus:border-red-500';
      case ESTADOS_TRANSMISION.TRANSMITIO_TARDE:
        return 'focus:ring-amber-500 focus:border-amber-500';
      default:
        return 'focus:ring-blue-500 focus:border-blue-500';
    }
  };

  return (
    <div>
      <label htmlFor="estado-transmision" className="block text-sm font-medium text-gray-700 mb-1">
        Estado de transmisión
      </label>
      <select 
        id="estado-transmision"
        className={`w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 ${getBorderColor()} transition-all`}
        value={estado}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value={ESTADOS_TRANSMISION.PENDIENTE}>Pendiente</option>
        <option value={ESTADOS_TRANSMISION.SI_TRANSMITIO}>Sí transmitió</option>
        <option value={ESTADOS_TRANSMISION.NO_TRANSMITIO}>No transmitió</option>
        <option value={ESTADOS_TRANSMISION.TRANSMITIO_TARDE}>Transmitió tarde</option>
      </select>
    </div>
  );
}