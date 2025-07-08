'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getFilial, updateFilial } from '@/app/api/filiales';
import { Filial, FilialInput } from '@/app/types/filial';
import FilialForm from '../../components/FilialForm';  // Asegúrate de que sea FilialForm

export default function EditarFilialPage() {
  const params = useParams();
  const filialId = params.id as string;
  
  const [filial, setFilial] = useState<Filial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFilial() {
      try {
        const data = await getFilial(filialId);
        setFilial(data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar la filial');
        setLoading(false);
        console.error(err);
      }
    }

    loadFilial();
  }, [filialId]);

  const handleUpdateFilial = async (filialData: FilialInput) => {
    await updateFilial(filialId, filialData);
  };

  if (loading) {
    return <div className="text-center p-8">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  if (!filial) {
    return <div className="text-center p-8">No se encontró la filial</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar Filial</h1>
        <p className="text-gray-500">Actualiza la información de la filial</p>
      </div>
      
      <FilialForm 
        filial={filial} 
        onSubmit={handleUpdateFilial} 
        isEditing={true} 
      />
    </div>
  );
}