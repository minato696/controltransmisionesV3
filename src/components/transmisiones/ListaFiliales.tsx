'use client';

import { Filial } from './types';

interface ListaFilialesProps {
  filiales: Filial[];
  filialSeleccionada: number | null;
  onFilialClick: (filialId: number) => void;
}

export default function ListaFiliales({ filiales, filialSeleccionada, onFilialClick }: ListaFilialesProps) {
  return (
    <div className="w-64 bg-white shadow-md z-10 overflow-y-auto">
      <div className="py-4 px-6 text-lg font-bold text-gray-800 border-b border-gray-100">
        Filiales
      </div>
      <div className="py-2">
        {filiales.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <p className="text-sm">No hay filiales disponibles</p>
          </div>
        ) : (
          filiales.map((filial) => (
            <FilialItem 
              key={filial.id}
              filial={filial}
              isSelected={filialSeleccionada === Number(filial.id)}
              onClick={() => onFilialClick(Number(filial.id))}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface FilialItemProps {
  filial: Filial;
  isSelected: boolean;
  onClick: () => void;
}

function FilialItem({ filial, isSelected, onClick }: FilialItemProps) {
  return (
    <div
      className={`flex justify-between px-6 py-3 cursor-pointer hover:bg-blue-50 transition-colors ${
        isSelected ? "bg-blue-50 border-l-4 border-blue-600 font-medium" : ""
      }`}
      onClick={onClick}
    >
      <div className={isSelected ? "text-blue-700" : "text-gray-700"}>
        {filial.nombre}
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}