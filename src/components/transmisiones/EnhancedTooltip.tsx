// src/components/transmisiones/EnhancedTooltip.tsx
import React from 'react';
import { ESTADOS_TRANSMISION } from './constants';
import { Reporte } from './types';
import '../../app/styles/tooltip-enhanced.css';

interface EnhancedTooltipProps {
  estado: string;
  reporte: Reporte | null;
}

const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({ estado, reporte }) => {
  // Normalizar el estado
  const estadoNormalizado = estado || ESTADOS_TRANSMISION.PENDIENTE;
  
  // Obtener clase CSS según el estado
  const getTooltipClass = () => {
    switch (estadoNormalizado) {
      case ESTADOS_TRANSMISION.SI_TRANSMITIO:
        return 'tooltip-si';
      case ESTADOS_TRANSMISION.NO_TRANSMITIO:
        return 'tooltip-no';
      case ESTADOS_TRANSMISION.TRANSMITIO_TARDE:
        return 'tooltip-tarde';
      default:
        return 'tooltip-pendiente';
    }
  };
  
  // Obtener el título del tooltip según el estado
  const getTooltipTitle = () => {
    switch (estadoNormalizado) {
      case ESTADOS_TRANSMISION.SI_TRANSMITIO:
        return 'SÍ TRANSMITIÓ';
      case ESTADOS_TRANSMISION.NO_TRANSMITIO:
        return 'NO TRANSMITIÓ';
      case ESTADOS_TRANSMISION.TRANSMITIO_TARDE:
        return 'TRANSMITIÓ TARDE';
      default:
        return 'PENDIENTE';
    }
  };
  
  // Formatear el motivo correctamente
  const formatearMotivo = () => {
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
  
  const motivo = formatearMotivo();

  return (
    <div className="tooltip-enhanced">
      <div className={`tooltip-content ${getTooltipClass()}`}>
        <div className="tooltip-title">{getTooltipTitle()}</div>
        
        {/* Contenido específico según el estado */}
        {estadoNormalizado === ESTADOS_TRANSMISION.SI_TRANSMITIO && (
          <div className="tooltip-row">
            <span className="tooltip-label">Hora:</span>
            <span className="tooltip-value">{reporte?.horaReal || reporte?.hora || '-'}</span>
          </div>
        )}
        
        {estadoNormalizado === ESTADOS_TRANSMISION.NO_TRANSMITIO && (
          <div className="tooltip-row">
            <span className="tooltip-label">Motivo:</span>
            <span className="tooltip-value tooltip-motivo">{motivo}</span>
          </div>
        )}
        
        {estadoNormalizado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE && (
          <>
            <div className="tooltip-row">
              <span className="tooltip-label">Hora:</span>
              <span className="tooltip-value">{reporte?.hora || '-'}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Hora TT:</span>
              <span className="tooltip-value">{reporte?.hora_tt || '-'}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Motivo:</span>
              <span className="tooltip-value tooltip-motivo">{motivo}</span>
            </div>
          </>
        )}
      </div>
      <div className="tooltip-arrow"></div>
    </div>
  );
};

export default EnhancedTooltip;