'use client';

import { createFilial } from '@/app/api/filiales';
import { FilialInput } from '@/app/types/filial';
import FilialForm from '../components/FilialForm';  // Asegúrate de que sea FilialForm

export default function NuevaFilialPage() {
  const handleCreateFilial = async (filial: FilialInput) => {
    await createFilial(filial);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva Filial</h1>
        <p className="text-gray-500">Crea una nueva filial en el sistema</p>
      </div>
      
      <FilialForm onSubmit={handleCreateFilial} />
    </div>
  );
}