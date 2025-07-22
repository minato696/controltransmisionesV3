'use client';

import { ReactNode } from 'react';
import { TransmisionEditar, Reporte } from './types';

interface FormularioBaseProps {
  transmisionEditar: TransmisionEditar;
  reporteActual: Reporte | null;
  error: string | null;
  guardando: boolean;
  onClose: (actualizado?: boolean) => void;
  onSubmit: () => void;
  children: ReactNode;
}

/**
 * Componente base para todos los formularios de transmisión
 * Proporciona la estructura común, cabecera, mensajes de error y botones
 */
export default function FormularioBase({
  transmisionEditar,
  reporteActual,
  error,
  guardando,
  onClose,
  onSubmit,
  children
}: FormularioBaseProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-full mx-4 animate-fade-in-up">
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {reporteActual ? 'Actualizar' : 'Nuevo'} Reporte
          </h2>
          <button 
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={guardando}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200 mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-5">
          {/* Información de la transmisión */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-700"><span className="font-medium">Filial:</span> {transmisionEditar.filial}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Programa:</span> {transmisionEditar.programa}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Día:</span> {transmisionEditar.dia}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Fecha:</span> {transmisionEditar.fecha}</div>
            <div className="text-sm text-gray-700"><span className="font-medium">Hora programada:</span> {transmisionEditar.hora}</div>
          </div>
          
          {/* Contenido específico del formulario */}
          {children}
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 mt-8">
          <button 
            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors disabled:opacity-50"
            onClick={() => onClose()}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button 
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center"
            onClick={onSubmit}
            disabled={guardando}
          >
            {guardando ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}