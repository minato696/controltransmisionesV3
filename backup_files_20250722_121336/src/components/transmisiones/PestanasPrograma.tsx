'use client';

import { Programa } from './types';

interface PestanasProgramaProps {
  programas: Programa[];
  programaSeleccionado: number | null;
  onProgramaClick: (programaId: number) => void;
}

export default function PestanasPrograma({ 
  programas, 
  programaSeleccionado, 
  onProgramaClick 
}: PestanasProgramaProps) {
  return (
    <div className="bg-white border-b border-gray-200 overflow-x-auto shadow-sm">
      <div className="flex px-4">
        {programas.map((prog) => (
          <PestanaPrograma 
            key={prog.id}
            programa={prog}
            isSelected={programaSeleccionado === Number(prog.id)}
            onClick={() => onProgramaClick(Number(prog.id))}
          />
        ))}
      </div>
    </div>
  );
}

interface PestanaProgramaProps {
  programa: Programa;
  isSelected: boolean;
  onClick: () => void;
}

function PestanaPrograma({ programa, isSelected, onClick }: PestanaProgramaProps) {
  return (
    <button
      className={`px-6 py-4 whitespace-nowrap border-b-2 transition-all duration-200 ${
        isSelected
          ? "text-blue-600 border-blue-600 font-medium"
          : "text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-300"
      }`}
      onClick={onClick}
    >
      <div className="text-sm">{programa.nombre}</div>
      <div className="text-xs text-gray-500">{programa.horario || programa.horaInicio}</div>
    </button>
  );
}