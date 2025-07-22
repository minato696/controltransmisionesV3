// src/components/transmisiones/EnhancedEstadoIndicador.tsx
import React from 'react';
import { ESTADOS_TRANSMISION } from './constants';
import { Reporte } from './types';
import EnhancedTooltip from './EnhancedTooltip';
import '../../app/styles/tooltip-enhanced.css';

interface EnhancedEstadoIndicadorProps {
  estado: string;
  reporte: Reporte | null;
  onClick: () => void;
}

const EnhancedEstadoIndicador: React.FC<EnhancedEstadoIndicadorProps> = ({ 
  estado, 
  reporte, 
  onClick 
}) => {
  // Normalizar el estado
  const estadoNormalizado = estado || ESTADOS_TRANSMISION.PENDIENTE;
  
  // Calcular el color de fondo
  const getBgColor = () => {
    switch (estadoNormalizado) {
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
    switch (estadoNormalizado) {
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
  
  // Determinar si mostrar el icono
  const shouldShowIcon = () => {
    return estadoNormalizado !== ESTADOS_TRANSMISION.TRANSMITIO_TARDE;
  };

  return (
    <div className="relative tooltip-trigger">
      {/* Indicador de estado */}
      <div 
        className={`${getBgColor()} w-16 h-16 rounded-lg shadow-md flex items-center justify-center 
                  cursor-pointer hover:shadow-lg transition-all duration-300`}
        onClick={onClick}
      >
        {shouldShowIcon() && <span className="text-white text-2xl">{getIcon()}</span>}
      </div>
      
      {/* Tooltip mejorado */}
      <EnhancedTooltip estado={estadoNormalizado} reporte={reporte} />
    </div>
  );
};

export default EnhancedEstadoIndicador;