'use client';

import React from 'react';
import { ESTADOS_TRANSMISION } from './constants';
import { Reporte } from './types';
import '../../app/styles/tooltip-compact.css';

interface CompactTooltipProps {
  estado: string;
  reporte: Reporte | null;
}

const CompactTooltip: React.FC<CompactTooltipProps> = ({ estado, reporte }) => {
  // Clase del tooltip según el estado
  const getTooltipClass = () => {
    switch (estado) {
      case ESTADOS_TRANSMISION.SI_TRANSMITIO:
        return 'si-transmitio';
      case ESTADOS_TRANSMISION.NO_TRANSMITIO:
        return 'no-transmitio';
      case ESTADOS_TRANSMISION.TRANSMITIO_TARDE:
        return 'transmitio-tarde';
      default:
        return '';
    }
  };

  // Título del tooltip
  const getTitle = () => {
    switch (estado) {
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

  // Obtener motivo
  const getMotivo = () => {
    if (!reporte) return '-';
    
    if (reporte.motivo) {
      return reporte.motivo;
    }
    
    if (reporte.target) {
      return reporte.target;
    }
    
    return '-';
  };

  return (
    <div className={`tooltip-compact ${getTooltipClass()}`}>
      <div className="tooltip-header">
        {getTitle()}
      </div>
      
      {estado === ESTADOS_TRANSMISION.SI_TRANSMITIO && (
        <div className="tooltip-info-row">
          <span className="tooltip-label">Hora:</span>
          <span className="tooltip-value">{reporte?.horaReal || reporte?.hora || '-'}</span>
        </div>
      )}
      
      {estado === ESTADOS_TRANSMISION.NO_TRANSMITIO && (
        <div className="tooltip-info-row">
          <span className="tooltip-label">Motivo:</span>
          <span className="tooltip-value">{getMotivo()}</span>
        </div>
      )}
      
      {estado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE && (
        <>
          <div className="tooltip-info-row">
            <span className="tooltip-label">Hora:</span>
            <span className="tooltip-value">{reporte?.hora || '-'}</span>
          </div>
          <div className="tooltip-info-row">
            <span className="tooltip-label">Real:</span>
            <span className="tooltip-value">{reporte?.hora_tt || '-'}</span>
          </div>
          <div className="tooltip-info-row">
            <span className="tooltip-label">Motivo:</span>
            <span className="tooltip-value">{getMotivo()}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default CompactTooltip;