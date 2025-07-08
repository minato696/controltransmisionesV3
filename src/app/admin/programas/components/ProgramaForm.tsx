'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Programa, ProgramaInput } from '@/app/types/programa';
import { Filial } from '@/app/types/filial';
import { getFiliales } from '@/app/api/filiales';

interface ProgramaFormProps {
  programa?: Programa;
  onSubmit: (programa: ProgramaInput) => Promise<void>;
  isEditing?: boolean;
}

export default function ProgramaForm({ programa, onSubmit, isEditing = false }: ProgramaFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFilialId = searchParams.get('filialId');
  
  // Formulario simplificado con solo los campos necesarios para el backend
  const [formData, setFormData] = useState<ProgramaInput>({
    nombre: '',
    filialId: preselectedFilialId || '',
    estado: 'activo',
    diasSemana: ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'],
    horaInicio: '08:00'
  });
  
  const [filiales, setFiliales] = useState<Filial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Días de la semana disponibles
  const diasSemanaOpciones = [
    { value: 'LUNES', label: 'Lunes' },
    { value: 'MARTES', label: 'Martes' },
    { value: 'MIÉRCOLES', label: 'Miércoles' },
    { value: 'JUEVES', label: 'Jueves' },
    { value: 'VIERNES', label: 'Viernes' },
    { value: 'SÁBADO', label: 'Sábado' },
    { value: 'DOMINGO', label: 'Domingo' }
  ];

  useEffect(() => {
    // Cargar filiales
    async function loadFiliales() {
      try {
        const data = await getFiliales();
        setFiliales(data);
      } catch (err) {
        console.error('Error al cargar filiales:', err);
        setError('No se pudieron cargar las filiales');
      }
    }

    loadFiliales();
    
    // Si estamos editando, cargamos los datos del programa
    if (programa) {
      setFormData({
        nombre: programa.nombre,
        filialId: programa.filialId,
        estado: programa.estado,
        diasSemana: programa.diasSemana || ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'],
        horaInicio: programa.horaInicio || programa.horario || '08:00'
      });
    }
  }, [programa, preselectedFilialId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Maneja los cambios en las casillas de verificación de días
  const handleDiaChange = (dia: string) => {
    setFormData(prev => {
      const diasActuales = prev.diasSemana || [];
      if (diasActuales.includes(dia)) {
        // Si ya está seleccionado, lo quitamos
        return { ...prev, diasSemana: diasActuales.filter(d => d !== dia) };
      } else {
        // Si no está seleccionado, lo añadimos
        return { ...prev, diasSemana: [...diasActuales, dia] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      router.push('/admin/programas');
    } catch (err) {
      console.error(err);
      setError('Error al guardar el programa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre*
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="filialId" className="block text-sm font-medium text-gray-700 mb-1">
            Filial*
          </label>
          <select
            id="filialId"
            name="filialId"
            value={formData.filialId}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecciona una filial</option>
            {filiales.map((filial) => (
              <option key={filial.id} value={filial.id}>
                {filial.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
            Estado*
          </label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>

        <div>
          <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700 mb-1">
            Hora de Inicio*
          </label>
          <input
            type="time"
            id="horaInicio"
            name="horaInicio"
            value={formData.horaInicio}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Días de Transmisión*
          </label>
          <div className="grid grid-cols-3 gap-2">
            {diasSemanaOpciones.map((dia) => (
              <div key={dia.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`dia-${dia.value}`}
                  checked={formData.diasSemana?.includes(dia.value) || false}
                  onChange={() => handleDiaChange(dia.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`dia-${dia.value}`} className="ml-2 block text-sm text-gray-700">
                  {dia.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}