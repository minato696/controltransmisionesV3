'use client';

import { createPrograma } from '@/app/api/programas';
import { ProgramaInput } from '@/app/types/programa';
import ProgramaForm from '../components/ProgramaForm';

export default function NuevoProgramaPage() {
  const handleCreatePrograma = async (programa: ProgramaInput) => {
    await createPrograma(programa);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo Programa</h1>
        <p className="text-gray-500">Crea un nuevo programa en el sistema</p>
      </div>
      
      <ProgramaForm onSubmit={handleCreatePrograma} />
    </div>
  );
}