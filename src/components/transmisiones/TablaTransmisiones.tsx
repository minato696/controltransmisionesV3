'use client';

import { ESTADOS_TRANSMISION } from './constants';
import { DiaSemana, Programa, Reporte } from './types';

interface TablaTransmisionesProps {
  filialSeleccionada: number | null;
  programaSeleccionado: number | null;
  diasSemana: DiaSemana[];
  programas: Programa[];
  programaTransmiteEnDia: (programa: Programa, diaNombre: string) => boolean;
  getReporte: (filialId: number, programaId: number, fecha: string) => Reporte | null;
  abrirFormulario: (filialId: number, programaId: number, dia: string, fecha: string) => void;
}

export default function TablaTransmisiones({
  filialSeleccionada,
  programaSeleccionado,
  diasSemana,
  programas,
  programaTransmiteEnDia,
  getReporte,
  abrirFormulario
}: TablaTransmisionesProps) {

  // Renderizar indicador de estado
  const renderEstadoIndicador = (estado: string | null, reporte: Reporte | null) => {
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
                <div>Motivo: {reporte?.target || '-'}</div>
                {reporte?.motivo && <div>Detalle: {reporte.motivo}</div>}
              </>
            )}
            {estadoNormalizado === ESTADOS_TRANSMISION.TRANSMITIO_TARDE && (
              <>
                <div className="font-bold">Transmitió tarde</div>
                <div>Hora programada: {reporte?.horaReal || reporte?.hora || '-'}</div>
                <div>Hora real: {reporte?.hora_tt || '-'}</div>
                {reporte?.motivo && <div>Motivo: {reporte.motivo}</div>}
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

  if (!filialSeleccionada || !programaSeleccionado) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg">Selecciona una filial y un programa para ver su programación</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        {/* Días de la semana */}
        <div className="grid grid-cols-6 gap-4 mb-4">
          {diasSemana.map((dia, idx) => (
            <div key={idx} className="text-center">
              <div className="font-medium text-gray-800">{dia.nombre}</div>
              <div className="text-xs text-gray-500">{dia.fecha}</div>
            </div>
          ))}
        </div>
        
        {/* Estados de transmisión */}
        <div className="grid grid-cols-6 gap-4">
          {diasSemana.map((dia, idx) => {
            const programa = programas.find(p => Number(p.id) === programaSeleccionado);
            if (!programa) return null;
            
            const transmiteEnDia = programaTransmiteEnDia(programa, dia.nombre);
            
            if (!transmiteEnDia) {
              return (
                <div key={idx} className="flex justify-center items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                    No programado
                  </div>
                </div>
              );
            }
            
            const reporte = getReporte(
              filialSeleccionada!, 
              programaSeleccionado,
              dia.fecha
            );
            
            return (
              <div key={idx} className="flex justify-center items-center">
                <div 
                  onClick={() => abrirFormulario(
                    filialSeleccionada!,
                    programaSeleccionado,
                    dia.nombre,
                    dia.fecha
                  )}
                >
                  {renderEstadoIndicador(reporte?.estado || null, reporte)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}