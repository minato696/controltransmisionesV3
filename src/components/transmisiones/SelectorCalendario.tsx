// src/components/transmisiones/SelectorCalendario.tsx
'use client';

import React from 'react';

export interface SelectorCalendarioProps {
  onViewChange: (vista: 'mes' | 'semana' | 'dia' | 'programa') => void;
  onDateChange: (fecha: Date) => void;
  vista: 'mes' | 'semana' | 'dia' | 'programa';
  fechaActual: Date;
  // Agregamos la prop onWeekChange para compatibilidad con ReporteSemanal
  onWeekChange?: (inicio: string, fin: string) => void;
}

export default function SelectorCalendario({
  onViewChange,
  onDateChange,
  vista,
  fechaActual,
  onWeekChange
}: SelectorCalendarioProps) {
  // Avanzar al mes siguiente
  const nextMonth = () => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    onDateChange(nuevaFecha);
    
    // Si se proporciona la función onWeekChange, la llamamos también
    if (onWeekChange) {
      const inicioMes = new Date(nuevaFecha.getFullYear(), nuevaFecha.getMonth(), 1);
      const finMes = new Date(nuevaFecha.getFullYear(), nuevaFecha.getMonth() + 1, 0);
      onWeekChange(
        formatDate(inicioMes),
        formatDate(finMes)
      );
    }
  };
  
  // Retroceder al mes anterior
  const prevMonth = () => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
    onDateChange(nuevaFecha);
    
    // Si se proporciona la función onWeekChange, la llamamos también
    if (onWeekChange) {
      const inicioMes = new Date(nuevaFecha.getFullYear(), nuevaFecha.getMonth(), 1);
      const finMes = new Date(nuevaFecha.getFullYear(), nuevaFecha.getMonth() + 1, 0);
      onWeekChange(
        formatDate(inicioMes),
        formatDate(finMes)
      );
    }
  };
  
  // Ir al día actual
  const irAHoy = () => {
    const hoy = new Date();
    onDateChange(hoy);
    
    // Si se proporciona la función onWeekChange, la llamamos también
    if (onWeekChange) {
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      onWeekChange(
        formatDate(inicioMes),
        formatDate(finMes)
      );
    }
  };
  
  // Formatear fecha como YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Formatear el mes y año actual
  const formatMesAno = () => {
    return fechaActual.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {formatMesAno()}
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={irAHoy}
            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Selectores de vista */}
      <div className="flex space-x-2">
        <button
          onClick={() => onViewChange('mes')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            vista === 'mes' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Vista Mes
        </button>
        <button
          onClick={() => onViewChange('semana')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            vista === 'semana' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Vista Semana
        </button>
        <button
          onClick={() => onViewChange('dia')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            vista === 'dia' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Vista Día
        </button>
        <button
          onClick={() => onViewChange('programa')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            vista === 'programa' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Vista Programa
        </button>
      </div>
    </div>
  );
}