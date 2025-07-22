// src/components/transmisiones/FlexibleTooltip.tsx
import React from 'react';
import { ESTADOS_TRANSMISION } from './constants';
import { Reporte } from './types';
import '../../app/styles/tooltip-flexible.css';

interface FlexibleTooltipProps {
  estado: string;
  reporte: Reporte | null;
}

const FlexibleTooltip: React.FC<FlexibleTooltipProps> = ({ estado, reporte }) => {
  // Normalizar el estado
  const estadoNormalizado = estado || ESTADOS_TRANSMISION.PENDIENTE;
  
  // Obtener clase según el estado
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
  
  // Obtener título
  const getTitle = () => {
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
  
  // Obtener motivo completo sin truncar
  const getMotivo = () => {
    if (!reporte) return '-';
    
    if (reporte.motivo) return reporte.motivo;
    if (reporte.target) return reporte.target;
    
    return '-';
  };

  return (
    <div className="flexible-tooltip">
      <div className={getTooltipClass()}>
        <div className="tooltip-title">{getTitle()}</div>
        
        {/* Sí transmitió */}
        {estadoNormalizado === ESTADOS_TRANSMISION.SI_TRANSMITIO && (
          <div className="tooltip-row">
            <span className="tooltip-label">Hora:</span>
            <span className="tooltip-value">{reporte?.horaReal || reporte?.hora || '-'}</span>
          </div>
        )}
        
        {/* No transmitió */}
        {estadoNormalizado === ESTADOS_TRANSMISION.NO_TRANSMITIO && (
          <div className="tooltip-row">
            <span className="tooltip-label">Motivo:</span>
            <span className="tooltip-value">{getMotivo()}</span>
          </div>
        )}
        
        {/* Transmitió tarde */}
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
              <span className="tooltip-value">{getMotivo()}</span>
            </div>
          </>
        )}
      </div>
      <div className="tooltip-arrow"></div>
    </div>
  );
};

export default FlexibleTooltip;