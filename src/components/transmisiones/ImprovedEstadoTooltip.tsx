'use client';

import React from 'react';
import { ESTADOS_TRANSMISION } from './constants';
import { Reporte } from './types';
import '../../styles/tooltip-refined.css';

interface ImprovedEstadoTooltipProps {
  estado: string;
  reporte: Reporte | null;
  position?: 'top' | 'bottom';
}

const ImprovedEstadoTooltip: React.FC<ImprovedEstadoTooltipProps> = ({ 
  estado, 
  reporte, 
  position = 'top' 
}) => {
  // Normalizar el estado
  const estadoNormalizado = estado || ESTADOS_TRANSMISION.PENDIENTE;
  
  // Determinar las clases CSS basadas en el estado
  const getEstadoClass = () => {
    switch (estadoNormalizado) {
      case ESTADOS_TRANSMISION.SI_TRANSMITIO:
        return 'estado-tooltip-si';
      case ESTADOS_TRANSMISION.NO_TRANSMITIO:
        return 'estado-tooltip-no';
      case ESTADOS_TRANSMISION.TRANSMITIO_TARDE:
        return 'estado-tooltip-tarde';
      default:
        return 'estado-tooltip-pendiente';
    }
  };
  
  // Obtener el título del tooltip
  const getTitle = () => {
    switch (estadoNormalizado) {
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
  
  // Verificar si el motivo es largo (más de 15 caracteres)
  const isMotivoLargo = (motivo: string) => motivo && motivo.length > 15;
  
  // Obtener el motivo formateado
  const getMotivo = () => {
    if (!reporte) return '-';
    
    if (reporte.target === 'Otros' && reporte.motivo) {
      return reporte.motivo;
    }
    
    if (reporte.motivo && (!reporte.target || reporte.target !== 'Otros')) {
      return reporte.motivo;
    }
    
    if (reporte.target) {
      return reporte.target;
    }
    
    return '-';
  };
  
  const motivo = getMotivo();
  const isLargeMotivo = isMotivoLargo(motivo);
  
  return (
    <div className={`estado-tooltip estado-tooltip-${position} ${getEstadoClass()}`}>
      <div className="estado-tooltip-title">{getTitle()}</div>
      
      <div className="estado-tooltip-content">
        {estadoNormalizado === ESTADOS_TRANSMISION.SI_TRANSMITIO && (
          <div className="estado-tooltip-row">
            <span className="estado-tooltip-label">Hora:</span>
            <span className="estado-tooltip-value">{reporte?.horaReal || reporte?.hora || '-'}</span>
          </div>
        )}
        
        {estadoNormalizado === ESTADOS_TRANSMISION.NO_TRANSMITIO && (
          <div className="estado-tooltip-row">
            <span className="estado-tooltip-label">Motivo:</span>
            <span className={`estado-tooltip-value ${isLargeMotivo ? 'motivo-largo' : ''}`}>
              {motivo}
            </span>
          </div>
        )}
        
        {estadoNormalizado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE && (
          <>
            <div className="estado-tooltip-row">
              <span className="estado-tooltip-label">Hora programada:</span>
              <span className="estado-tooltip-value">{reporte?.hora || '-'}</span>
            </div>
            <div className="estado-tooltip-row">
              <span className="estado-tooltip-label">Hora real:</span>
              <span className="estado-tooltip-value">{reporte?.hora_tt || '-'}</span>
            </div>
            <div className="estado-tooltip-row">
              <span className="estado-tooltip-label">Motivo:</span>
              <span className={`estado-tooltip-value ${isLargeMotivo ? 'motivo-largo' : ''}`}>
                {motivo}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImprovedEstadoTooltip;