'use client';

import { ESTADOS_TRANSMISION } from './constants';
import { Reporte } from './types';

interface EstadoIndicadorProps {
  estado: string | null;
  reporte: Reporte | null;
}

export default function EstadoIndicador({ estado, reporte }: EstadoIndicadorProps) {
  let bgColor = "bg-gray-200";
  let icon = "⏱";
  let iconColor = "text-white";
  let showIcon = true;
  
  const estadoNormalizado = estado || ESTADOS_TRANSMISION.PENDIENTE;
  
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
  
  return (
    <div className={`${bgColor} w-16 h-16 rounded-lg shadow-md flex items-center justify-center cursor-pointer relative group transition-all duration-300 hover:shadow-lg`}>
      {showIcon && <span className={`${iconColor} text-2xl`}>{icon}</span>}
      
      <TooltipEstado estado={estadoNormalizado} reporte={reporte} />
    </div>
  );
}

interface TooltipEstadoProps {
  estado: string;
  reporte: Reporte | null;
}

function TooltipEstado({ estado, reporte }: TooltipEstadoProps) {
  return (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
      <div className="p-2">
        {estado === ESTADOS_TRANSMISION.SI_TRANSMITIO && (
          <>
            <div className="font-bold">Sí transmitió</div>
            <div>Hora: {reporte?.horaReal || reporte?.hora || '-'}</div>
          </>
        )}
        {estado === ESTADOS_TRANSMISION.NO_TRANSMITIO && (
          <>
            <div className="font-bold">No transmitió</div>
            <div>Motivo: {reporte?.target || '-'}</div>
            {reporte?.motivo && <div>Detalle: {reporte.motivo}</div>}
          </>
        )}
        {estado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE && (
          <>
            <div className="font-bold">Transmitió tarde</div>
            <div>Hora programada: {reporte?.horaReal || reporte?.hora || '-'}</div>
            <div>Hora real: {reporte?.hora_tt || '-'}</div>
            {reporte?.motivo && <div>Motivo: {reporte.motivo}</div>}
          </>
        )}
        {estado === ESTADOS_TRANSMISION.PENDIENTE && (
          <div className="font-bold">Pendiente</div>
        )}
      </div>
      <div className="w-3 h-3 bg-gray-800 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
    </div>
  );
}