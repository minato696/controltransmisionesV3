'use client';

import React, { useState } from 'react';
import { ESTADOS_TRANSMISION } from './constants';
import { Reporte } from './types';
import EstadoTooltip from './EstadoTooltip';

interface EstadoIndicadorProps {
  estado: string;
  reporte: Reporte | null;
  onClick: () => void;
}

const EstadoIndicador: React.FC<EstadoIndicadorProps> = ({ estado, reporte, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Calcular el color de fondo
  const getBgColor = () => {
    switch (estado) {
      case ESTADOS_TRANSMISION.SI_TRANSMITIO:
        return 'bg-emerald-500';
      case ESTADOS_TRANSMISION.NO_TRANSMITIO:
        return 'bg-red-500';
      case ESTADOS_TRANSMISION.TRANSMITIO_TARDE:
        return 'bg-amber-500';
      default:
        return 'bg-gray-200';
    }
  };
  
  // Calcular el icono
  const getIcon = () => {
    switch (estado) {
      case ESTADOS_TRANSMISION.SI_TRANSMITIO:
        return '✓';
      case ESTADOS_TRANSMISION.NO_TRANSMITIO:
        return '✕';
      case ESTADOS_TRANSMISION.TRANSMITIO_TARDE:
        return '';
      default:
        return '⏱';
    }
  };
  
  // Calcular si mostrar el icono
  const shouldShowIcon = () => {
    return estado !== ESTADOS_TRANSMISION.TRANSMITIO_TARDE;
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Indicador de estado */}
      <div 
        className={`${getBgColor()} w-16 h-16 rounded-lg shadow-md flex items-center justify-center cursor-pointer hover:shadow-lg transition-all duration-300`}
        onClick={onClick}
      >
        {shouldShowIcon() && <span className="text-white text-2xl">{getIcon()}</span>}
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <EstadoTooltip 
          estado={estado} 
          reporte={reporte} 
          className="bottom-full left-1/2 mb-1"
        />
      )}
    </div>
  );
};

export default EstadoIndicador;