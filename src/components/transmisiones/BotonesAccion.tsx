'use client';

interface BotonesAccionProps {
  onCancel: () => void;
  onSave: () => void;
  guardando: boolean;
}

export default function BotonesAccion({
  onCancel,
  onSave,
  guardando
}: BotonesAccionProps) {
  return (
    <div className="flex justify-end space-x-3 mt-8">
      <button 
        className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors disabled:opacity-50"
        onClick={onCancel}
        disabled={guardando}
      >
        Cancelar
      </button>
      <button 
        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center"
        onClick={onSave}
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
  );
}