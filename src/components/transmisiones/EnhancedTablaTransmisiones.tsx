'use client';

import React from 'react';
import { ESTADOS_TRANSMISION } from './constants';
import { Reporte } from './types';
import '../../styles/tooltip.css';

interface EstadoTooltipProps {
  estado: string;
  reporte: Reporte | null;
  className?: string;
}

const EstadoTooltip: React.FC<EstadoTooltipProps> = ({ estado, reporte, className = '' }) => {
  // Calcular el texto del estado
  const getEstadoTexto = () => {
    switch (estado) {
      case ESTADOS_TRANSMISION.SI_TRANSMITIO:
        return 'Sí transmitió';
      case ESTADOS_TRANSMISION.NO_TRANSMITIO:
        return 'No transmitió';
      case ESTADOS_TRANSMISION.TRANSMITIO_TARDE:
        return 'Transmitió tarde';
      default:
        return 'Pendiente';
    }
  };

  // Calcular el color de fondo
  const getBgColor = () => {
    switch (estado) {
      case ESTADOS_TRANSMISION.SI_TRANSMITIO:
        return 'bg-emerald-900';
      case ESTADOS_TRANSMISION.NO_TRANSMITIO:
        return 'bg-red-900';
      case ESTADOS_TRANSMISION.TRANSMITIO_TARDE:
        return 'bg-amber-900';
      default:
        return 'bg-gray-900';
    }
  };

  // Calcular el motivo a mostrar
  const getMotivoTexto = () => {
    if (!reporte) return '-';
    
    if (reporte.target === 'Otros' && reporte.motivo) {
      return reporte.motivo;
    }
    
    if (reporte.motivo) {
      return reporte.motivo;
    }
    
    if (reporte.target) {
      return reporte.target;
    }
    
    return '-';
  };

  return (
    <div className={`absolute ${getBgColor()} text-white px-3 py-1.5 rounded text-sm 
                    shadow-lg z-10 transform -translate-x-1/2 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="font-semibold">{getEstadoTexto()}</div>
        {(estado === ESTADOS_TRANSMISION.NO_TRANSMITIO || estado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE) && (
          <div className="flex items-center space-x-1">
            <span className="text-gray-300">Motivo:</span>
            <span>{getMotivoTexto()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstadoTooltip;