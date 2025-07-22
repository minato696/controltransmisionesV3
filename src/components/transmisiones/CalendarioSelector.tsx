'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarioSelectorProps {
  onWeekChange: (fechaInicio: string, fechaFin: string) => void;
}

export default function CalendarioSelector({ onWeekChange }: CalendarioSelectorProps) {
  // Estado para controlar la fecha actual seleccionada
  const [fechaActual, setFechaActual] = useState(new Date());
  
  // Calcular inicio y fin de la semana seleccionada
  const inicioSemana = startOfWeek(fechaActual, { weekStartsOn: 1 }); // Semana comienza en lunes
  const finSemana = endOfWeek(fechaActual, { weekStartsOn: 1 }); // Semana termina en domingo
  
  // Generar array con los días de la semana seleccionada
  const diasSemana = [];
  for (let i = 0; i < 7; i++) {
    diasSemana.push(addDays(inicioSemana, i));
  }
  
  // Cuando cambia la semana seleccionada, notificar al componente padre
  useEffect(() => {
    const fechaInicio = format(inicioSemana, 'yyyy-MM-dd');
    const fechaFin = format(finSemana, 'yyyy-MM-dd');
    onWeekChange(fechaInicio, fechaFin);
  }, [fechaActual, onWeekChange, inicioSemana, finSemana]);
  
  // Funciones para cambiar de semana
  const semanaAnterior = () => {
    setFechaActual(subWeeks(fechaActual, 1));
  };
  
  const semanaSiguiente = () => {
    setFechaActual(addWeeks(fechaActual, 1));
  };
  
  const semanaActual = () => {
    setFechaActual(new Date());
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Seleccionar Semana</h2>
        <div className="flex space-x-2">
          <button
            onClick={semanaAnterior}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Semana anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={semanaActual}
            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          >
            Semana actual
          </button>
          <button
            onClick={semanaSiguiente}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Semana siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="text-center mb-3 px-2 py-1 bg-gray-50 rounded-md">
        <span className="font-medium text-gray-700">
          {format(inicioSemana, "d 'de' MMMM", { locale: es })} - {format(finSemana, "d 'de' MMMM 'de' yyyy", { locale: es })}
        </span>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((dia, index) => (
          <div key={`header-${index}`} className="text-xs font-medium text-gray-500 py-1">
            {dia}
          </div>
        ))}
        
        {diasSemana.map((fecha, index) => {
          const esHoy = isToday(fecha);
          return (
            <div 
              key={`dia-${index}`} 
              className={`
                aspect-square flex items-center justify-center text-sm rounded-full
                ${esHoy ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              {format(fecha, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
}