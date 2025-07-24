import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Programa } from './types';

interface InfoDiaSeleccionadoProps {
  fecha: Date;
  programas: Programa[];
  onSeleccionarPrograma: (programaId: number) => void;
}

const InfoDiaSeleccionado: React.FC<InfoDiaSeleccionadoProps> = ({
  fecha,
  programas,
  onSeleccionarPrograma
}) => {
  // Obtener el nombre del día de la semana
  const nombreDia = format(fecha, 'EEEE', { locale: es });
  const nombreDiaFormateado = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1);
  
  // Formatear la fecha para mostrar
  const fechaFormateada = format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es });
  
  // Obtener el día de la semana en formato que coincida con nuestro sistema
  const diaSemana = nombreDiaFormateado.toUpperCase();
  
  // Filtrar programas que se transmiten este día
  const programasDelDia = programas.filter(programa => {
    return programa.diasSemana?.some(dia => 
      dia.toUpperCase() === diaSemana ||
      (diaSemana === 'MIÉRCOLES' && dia.toUpperCase() === 'MIERCOLES') ||
      (diaSemana === 'SÁBADO' && dia.toUpperCase() === 'SABADO')
    );
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {nombreDiaFormateado}, {fechaFormateada}
      </h2>
      
      {programasDelDia.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600">No hay programas agendados para este día</p>
        </div>
      ) : (
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">Programas agendados:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programasDelDia.map((programa) => (
              <div 
                key={programa.id} 
                className="border rounded-lg p-4 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => onSeleccionarPrograma(Number(programa.id))}
              >
                <div className="font-medium text-gray-800">{programa.nombre}</div>
                <div className="text-sm text-gray-500">
                  Hora: {programa.horario || programa.horaInicio || 'No especificada'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoDiaSeleccionado;