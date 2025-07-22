// src/components/transmisiones/SimpleTablaTransmisiones.tsx
import React from 'react';
import { ESTADOS_TRANSMISION } from './constants';
import { DiaSemana, Programa, Reporte } from './types';
import SimpleEstadoIndicador from './SimpleEstadoIndicador';

interface SimpleTablaTransmisionesProps {
  filialSeleccionada: number | null;
  programaSeleccionado: number | null;
  diasSemana: DiaSemana[];
  programas: Programa[];
  programaTransmiteEnDia: (programa: Programa, diaNombre: string) => boolean;
  getReporte: (filialId: number, programaId: number, fecha: string) => Reporte | null;
  abrirFormulario: (filialId: number, programaId: number, dia: string, fecha: string) => void;
}

const SimpleTablaTransmisiones: React.FC<SimpleTablaTransmisionesProps> = ({
  filialSeleccionada,
  programaSeleccionado,
  diasSemana,
  programas,
  programaTransmiteEnDia,
  getReporte,
  abrirFormulario
}) => {
  // Renderizar mensaje vacío cuando no hay selección
  const renderMensajeVacio = () => {
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
  };

  if (!filialSeleccionada || !programaSeleccionado) {
    return renderMensajeVacio();
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
              filialSeleccionada, 
              programaSeleccionado,
              dia.fecha
            );
            
            return (
              <div key={idx} className="flex justify-center items-center">
                <SimpleEstadoIndicador
                  estado={reporte?.estado || ESTADOS_TRANSMISION.PENDIENTE}
                  reporte={reporte}
                  onClick={() => abrirFormulario(
                    filialSeleccionada,
                    programaSeleccionado,
                    dia.nombre,
                    dia.fecha
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SimpleTablaTransmisiones;