'use client';

interface CabeceraMensajeErrorProps {
  titulo: string;
  error: string | null;
  onClose: () => void;
  disabled: boolean;
}

export default function CabeceraMensajeError({
  titulo,
  error,
  onClose,
  disabled
}: CabeceraMensajeErrorProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{titulo}</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={disabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200 mb-4">
          {error}
        </div>
      )}
    </>
  );
}