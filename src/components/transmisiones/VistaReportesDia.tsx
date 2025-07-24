import React from 'react';
import { Reporte, Programa, Filial } from './types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import TransmisionTooltip from './TransmisionTooltip';

interface VistaReportesDiaProps {
  fecha: Date;
  reportes: Reporte[];
  programas: Programa[];
  filiales: Filial[];
  filialSeleccionada?: number | null;
  programaSeleccionado?: number | null;
  onAbrirFormulario: (filialId: number, programaId: number, dia: string, fecha: string) => void;
  onSeleccionarPrograma?: (programaId: number) => void;
}

const VistaReportesDia: React.FC<VistaReportesDiaProps> = ({
  fecha,
  reportes,
  programas,
  filiales,
  filialSeleccionada,
  programaSeleccionado,
  onAbrirFormulario,
  onSeleccionarPrograma
}) => {
  // Formatear la fecha para mostrar
  const fechaFormateada = format(fecha, 'yyyy-MM-dd');
  const nombreDia = format(fecha, 'EEEE', { locale: es });
  const nombreDiaFormateado = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1);

  // Filtrar reportes para el día seleccionado
  let reportesDelDia = reportes.filter(r => r.fecha === fechaFormateada);
  
  // Si hay una filial seleccionada, filtrar por ella
  if (filialSeleccionada) {
    reportesDelDia = reportesDelDia.filter(r => r.filialId === filialSeleccionada);
  }
  
  // Si hay un programa seleccionado, filtrar por él
  if (programaSeleccionado) {
    reportesDelDia = reportesDelDia.filter(r => r.programaId === programaSeleccionado);
  }

  // Función para obtener el nombre de una filial
  const getNombreFilial = (filialId: number) => {
    const filial = filiales.find(f => Number(f.id) === filialId);
    return filial ? filial.nombre : 'Desconocida';
  };

  // Función para obtener el nombre de un programa
  const getNombrePrograma = (programaId: number) => {
    const programa = programas.find(p => Number(p.id) === programaId);
    return programa ? programa.nombre : 'Desconocido';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Reportes del {nombreDiaFormateado}, {format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es })}
        </h2>
        
        {filialSeleccionada && programaSeleccionado && (
          <button
            onClick={() => onAbrirFormulario(
              filialSeleccionada,
              programaSeleccionado,
              nombreDiaFormateado,
              fechaFormateada
            )}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Reporte
          </button>
        )}
      </div>

      {reportesDelDia.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-600">No hay reportes para este día</p>
          <p className="text-sm text-gray-500 mt-2">Selecciona un programa y una filial para crear un reporte</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reportesDelDia.map((reporte) => (
            <div key={reporte.id_reporte} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <TransmisionTooltip 
                    estado={reporte.estado || null}
                    reporte={reporte}
                    onClick={() => onAbrirFormulario(
                      reporte.filialId,
                      reporte.programaId,
                      nombreDiaFormateado,
                      fechaFormateada
                    )}
                  />
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-xs uppercase text-gray-500 font-medium">Filial</h3>
                      <p className="text-sm font-medium text-gray-900">{getNombreFilial(reporte.filialId)}</p>
                    </div>
                    <div>
                      <h3 className="text-xs uppercase text-gray-500 font-medium">Programa</h3>
                      <p className="text-sm font-medium text-gray-900">{getNombrePrograma(reporte.programaId)}</p>
                    </div>
                    <div>
                      <h3 className="text-xs uppercase text-gray-500 font-medium">Hora</h3>
                      <p className="text-sm font-medium text-gray-900">
                        {reporte.horaReal || reporte.hora || '-'}
                        {reporte.estado === 'tarde' && reporte.hora_tt && (
                          <span className="text-xs text-gray-500 ml-2">→ {reporte.hora_tt}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {(reporte.motivo || reporte.target) && (
                    <div className="mt-3">
                      <h3 className="text-xs uppercase text-gray-500 font-medium">Motivo</h3>
                      <p className="text-sm text-gray-700">{reporte.motivo || reporte.target}</p>
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => onAbrirFormulario(
                        reporte.filialId,
                        reporte.programaId,
                        nombreDiaFormateado,
                        fechaFormateada
                      )}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VistaReportesDia;