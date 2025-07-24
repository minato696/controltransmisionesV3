import React from 'react';
import { Reporte, Programa, Filial } from './types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import TransmisionTooltip from './TransmisionTooltip';

interface VistaReportesDiaSemanalStyleProps {
  fecha: Date;
  reportes: Reporte[];
  programas: Programa[];
  filiales: Filial[];
  filialSeleccionada?: number | null;
  programaSeleccionado?: number | null;
  onAbrirFormulario: (filialId: number, programaId: number, dia: string, fecha: string) => void;
}

const VistaReportesDiaSemanalStyle: React.FC<VistaReportesDiaSemanalStyleProps> = ({
  fecha,
  reportes,
  programas,
  filiales,
  filialSeleccionada,
  programaSeleccionado,
  onAbrirFormulario
}) => {
  // Formatear la fecha para mostrar
  const fechaFormateada = format(fecha, 'yyyy-MM-dd');
  const nombreDia = format(fecha, 'EEEE', { locale: es });
  const nombreDiaFormateado = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1);
  const fechaCorta = format(fecha, 'yyyy-MM-dd');

  // Filtrar reportes para el día seleccionado
  let reportesDelDia = reportes.filter(r => r.fecha === fechaFormateada);

  // Obtener el reporte específico para una filial y programa
  const getReporte = (filialId: number, programaId: number): Reporte | null => {
    return reportesDelDia.find(r => 
      r.filialId === filialId && 
      r.programaId === programaId
    ) || null;
  };

  // Mostrar solo los cuadrados para la filial y programa seleccionados, o para todos
  const filialesToShow = filialSeleccionada 
    ? filiales.filter(f => Number(f.id) === filialSeleccionada)
    : filiales;
  
  const programasToShow = programaSeleccionado
    ? programas.filter(p => Number(p.id) === programaSeleccionado)
    : programas;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-blue-600">
          {nombreDiaFormateado} {format(fecha, "dd-MM-yyyy")}
        </h2>
      </div>

      {/* Contenedor de las filas de reportes */}
      <div className="space-y-4">
        {filialesToShow.map(filial => (
          <div key={filial.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
              <h3 className="font-medium text-gray-700">{filial.nombre}</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {programasToShow.map(programa => {
                  const reporte = getReporte(Number(filial.id), Number(programa.id));
                  return (
                    <div key={programa.id} className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-800 mb-2">{filial.nombre} - {programa.nombre}</div>
                      <div className="text-xs text-gray-500 mb-3">{programa.horario || programa.horaInicio}</div>
                      <TransmisionTooltip 
                        estado={reporte?.estado || null}
                        reporte={reporte}
                        onClick={() => onAbrirFormulario(
                          Number(filial.id),
                          Number(programa.id),
                          nombreDiaFormateado,
                          fechaCorta
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VistaReportesDiaSemanalStyle;