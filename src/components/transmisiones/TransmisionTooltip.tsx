// src/components/transmisiones/TransmisionTooltip.tsx
import React from 'react';
import { Reporte } from './types';
import { ESTADOS_TRANSMISION } from './constants';

interface TransmisionTooltipProps {
  estado: string | null;
  reporte: Reporte | null;
  onClick: () => void;
}

/**
 * Componente que renderiza el indicador de estado con un tooltip
 */
export const TransmisionTooltip: React.FC<TransmisionTooltipProps> = ({
  estado,
  reporte,
  onClick
}) => {
  let bgColor = "bg-gray-200";
  let icon = "⏱";
  let iconColor = "text-white";
  let showIcon = true;
  
  const estadoNormalizado = estado || ESTADOS_TRANSMISION.PENDIENTE;
  
  // Determinar el color y el icono según el estado
  switch (estadoNormalizado) {
    case ESTADOS_TRANSMISION.SI_TRANSMITIO:
      bgColor = "bg-emerald-500";
      icon = "✓";
      break;
    case ESTADOS_TRANSMISION.NO_TRANSMITIO:
      bgColor = "bg-red-500";
      icon = "✕";
      break;
    case ESTADOS_TRANSMISION.TRANSMITIO_TARDE:
      bgColor = "bg-amber-500";
      showIcon = false;
      break;
  }
  
  // Función para determinar qué motivo mostrar
  const getMotivoTexto = () => {
    if (!reporte) return '-';
    
    // Si hay un motivo personalizado, mostrarlo
    if (reporte.motivo) {
      return reporte.motivo;
    }
    
    // Si no, mostrar el código del target
    return reporte.target || '-';
  };
  
  return (
    <div 
      className={`${bgColor} w-16 h-16 rounded-lg shadow-md flex items-center justify-center cursor-pointer relative group transition-all duration-300 hover:shadow-lg`}
      onClick={onClick}
    >
      {showIcon && <span className={`${iconColor} text-2xl`}>{icon}</span>}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
        <div className="p-2">
          {estadoNormalizado === ESTADOS_TRANSMISION.SI_TRANSMITIO && (
            <>
              <div className="font-bold">Sí transmitió</div>
              <div>Hora: {reporte?.horaReal || reporte?.hora || '-'}</div>
            </>
          )}
          {estadoNormalizado === ESTADOS_TRANSMISION.NO_TRANSMITIO && (
            <>
              <div className="font-bold">No transmitió</div>
              <div>Motivo: {getMotivoTexto()}</div>
            </>
          )}
          {estadoNormalizado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE && (
            <>
              <div className="font-bold">Transmitió tarde</div>
              <div>Hora programada: {reporte?.horaReal || reporte?.hora || '-'}</div>
              <div>Hora real: {reporte?.hora_tt || '-'}</div>
              <div>Motivo: {getMotivoTexto()}</div>
            </>
          )}
          {estadoNormalizado === ESTADOS_TRANSMISION.PENDIENTE && (
            <div className="font-bold">Pendiente</div>
          )}
        </div>
        <div className="w-3 h-3 bg-gray-800 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
      </div>
    </div>
  );
};

export default TransmisionTooltip;