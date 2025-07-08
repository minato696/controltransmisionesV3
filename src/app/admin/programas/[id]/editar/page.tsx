'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPrograma, updatePrograma } from '@/app/api/programas';
import { Programa, ProgramaInput } from '@/app/types/programa';
import ProgramaForm from '../../components/ProgramaForm';

export default function EditarProgramaPage() {
  const params = useParams();
  const programaId = params.id as string;
  
  const [programa, setPrograma] = useState<Programa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrograma() {
      try {
        const data = await getPrograma(programaId);
        setPrograma(data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar el programa');
        setLoading(false);
        console.error(err);
      }
    }

    loadPrograma();
  }, [programaId]);

  const handleUpdatePrograma = async (programaData: ProgramaInput) => {
    await updatePrograma(programaId, programaData);
  };

  if (loading) {
    return <div className="text-center p-8">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  if (!programa) {
    return <div className="text-center p-8">No se encontró el programa</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar Programa</h1>
        <p className="text-gray-500">Actualiza la información del programa</p>
      </div>
      
      <ProgramaForm 
        programa={programa} 
        onSubmit={handleUpdatePrograma} 
        isEditing={true} 
      />
    </div>
  );
}