'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Programa, ProgramaInput } from '@/app/types/programa';
import { Filial } from '@/app/types/filial';
import { getFiliales } from '@/app/api/filiales';
import { createPrograma, updatePrograma } from '@/services/api-client';
import axios from 'axios';

interface ProgramaFormProps {
  programa?: Programa;
  onSubmit: (programa: ProgramaInput) => Promise<void>;
  isEditing?: boolean;
}

export default function ProgramaForm({ programa, onSubmit, isEditing = false }: ProgramaFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFilialId = searchParams.get('filialId');
  
  // Estado para verificar si los días de la semana están inicializados
  const [diasInicializados, setDiasInicializados] = useState<boolean>(true);
  
  // Formulario simplificado con solo los campos necesarios para el backend
  const [formData, setFormData] = useState<ProgramaInput>({
    nombre: '',
    filialId: preselectedFilialId || '',
    estado: 'activo',
    diasSemana: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
    horaInicio: '08:00'
  });
  
  // Estado adicional para manejar múltiples filiales
  const [filialesSeleccionadas, setFilialesSeleccionadas] = useState<number[]>([]);
  
  const [filiales, setFiliales] = useState<Filial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  // Días de la semana disponibles
  const diasSemanaOpciones = [
    { value: 'LUNES', label: 'Lunes' },
    { value: 'MARTES', label: 'Martes' },
    { value: 'MIERCOLES', label: 'Miércoles' },
    { value: 'JUEVES', label: 'Jueves' },
    { value: 'VIERNES', label: 'Viernes' },
    { value: 'SABADO', label: 'Sábado' },
    { value: 'DOMINGO', label: 'Domingo' }
  ];

  // Función para normalizar días de la semana (quitar acentos)
  const normalizarDiaSemana = (dia: string): string => {
    const mapeo: Record<string, string> = {
      'LUNES': 'LUNES',
      'MARTES': 'MARTES',
      'MIÉRCOLES': 'MIERCOLES',
      'JUEVES': 'JUEVES',
      'VIERNES': 'VIERNES',
      'SÁBADO': 'SABADO',
      'DOMINGO': 'DOMINGO'
    };
    
    return mapeo[dia] || dia;
  };

  // Verificar si los días de la semana están inicializados
  const verificarDiasInicializados = async () => {
    try {
      const response = await axios.get('/api/debug');
      const diasSemana = response.data.diasSemana || [];
      setDiasInicializados(diasSemana.length > 0);
      
      if (diasSemana.length === 0) {
        setError('La base de datos no está inicializada. Por favor, vaya al Dashboard y use la opción "Inicializar Base de Datos".');
      }
    } catch (err) {
      console.error('Error al verificar días inicializados:', err);
      setError('Error al verificar la inicialización de la base de datos.');
    }
  };

  useEffect(() => {
    // Verificar si los días de la semana están inicializados
    verificarDiasInicializados();
    
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
        diasSemana: programa.diasSemana?.map(dia => normalizarDiaSemana(dia)) || ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
        horaInicio: programa.horaInicio || programa.horario || '08:00'
      });
      
      // Cargar las filiales seleccionadas
      if (programa.filialesIds && programa.filialesIds.length > 0) {
        // Convertir todos los IDs a números
        setFilialesSeleccionadas(programa.filialesIds.map(id => Number(id)));
      } else if (programa.filialId) {
        // Si solo hay una filial, agregarla a las seleccionadas
        setFilialesSeleccionadas([Number(programa.filialId)]);
      }
    } else if (preselectedFilialId) {
      // Si hay una filial preseleccionada (desde la URL), agregarla
      setFilialesSeleccionadas([Number(preselectedFilialId)]);
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
    // Normalizar el día sin acentos
    const diaNormalizado = normalizarDiaSemana(dia);
    
    setFormData(prev => {
      const diasActuales = prev.diasSemana || [];
      if (diasActuales.includes(diaNormalizado)) {
        // Si ya está seleccionado, lo quitamos
        return { ...prev, diasSemana: diasActuales.filter(d => d !== diaNormalizado) };
      } else {
        // Si no está seleccionado, lo añadimos
        return { ...prev, diasSemana: [...diasActuales, diaNormalizado] };
      }
    });
  };

  // Maneja los cambios en las casillas de verificación de filiales
  const handleFilialChange = (filialId: number) => {
    setFilialesSeleccionadas(prev => {
      if (prev.includes(filialId)) {
        // Si ya está seleccionada, la quitamos
        return prev.filter(id => id !== filialId);
      } else {
        // Si no está seleccionada, la añadimos
        return [...prev, filialId];
      }
    });
  };

  // Redireccionar al dashboard para inicializar la BD
  const irAInicializarBD = () => {
    router.push('/admin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar si la base de datos está inicializada
    if (!diasInicializados) {
      setError('La base de datos no está inicializada. Por favor, vaya al Dashboard e inicialice la base de datos primero.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setExito(null);

    try {
      // Validar que al menos haya un día seleccionado
      if (!formData.diasSemana || formData.diasSemana.length === 0) {
        setError('Debe seleccionar al menos un día de transmisión');
        setLoading(false);
        return;
      }
      
      // Validar que haya al menos una filial seleccionada
      if (filialesSeleccionadas.length === 0) {
        setError('Debe seleccionar al menos una filial');
        setLoading(false);
        return;
      }
      
      // Log para debug
      console.log('Datos del formulario antes de enviar:', formData);
      console.log('Filiales seleccionadas:', filialesSeleccionadas);
      
      // Preparar datos para enviar (siempre modo único)
      const datosPrograma: ProgramaInput = {
        nombre: formData.nombre,
        estado: formData.estado,
        // Usar la primera filial seleccionada como filialId principal (por compatibilidad)
        filialId: filialesSeleccionadas[0].toString(),
        // Incluir todas las filiales seleccionadas como números
        filialIds: filialesSeleccionadas.map(id => Number(id)),
        // Enviar todos los días seleccionados
        diasSemana: formData.diasSemana?.map(dia => normalizarDiaSemana(dia)),
        // Asegurarnos de que horaInicio sea un string en formato HH:MM
        horaInicio: typeof formData.horaInicio === 'string' ? formData.horaInicio : '08:00'
      };
      
      console.log('Datos finales a enviar:', datosPrograma);
      
      await onSubmit(datosPrograma);
      router.push('/admin/programas');
    } catch (err: any) {
      console.error('Error al guardar programa:', err);
      
      // Mostrar mensaje de error más específico si está disponible
      if (err.response?.data?.message) {
        setError(`Error: ${err.response.data.message}`);
      } else if (err.response?.data) {
        setError(`Error: ${JSON.stringify(err.response.data)}`);
      } else {
        setError('Error al guardar el programa. Por favor, verifique los datos e intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              
              {error.includes('base de datos no está inicializada') && (
                <button
                  type="button"
                  onClick={irAInicializarBD}
                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Ir al Dashboard para inicializar la BD
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {exito && (
        <div className="bg-green-50 text-green-600 p-4 rounded border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{exito}</p>
            </div>
          </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filiales* (Selecciona al menos una)
          </label>
          <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
            {filiales.length === 0 ? (
              <p className="text-sm text-gray-500">No hay filiales disponibles</p>
            ) : (
              <div className="space-y-2">
                {filiales.map((filial) => (
                  <div key={filial.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`filial-${filial.id}`}
                      checked={filialesSeleccionadas.includes(Number(filial.id))}
                      onChange={() => handleFilialChange(Number(filial.id))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label 
                      htmlFor={`filial-${filial.id}`} 
                      className="ml-2 block text-sm text-gray-700 cursor-pointer"
                    >
                      {filial.nombre}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          {filialesSeleccionadas.length > 0 && (
            <p className="mt-1 text-sm text-gray-600">
              {filialesSeleccionadas.length} filial(es) seleccionada(s)
            </p>
          )}
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
                  checked={formData.diasSemana?.includes(normalizarDiaSemana(dia.value)) || false}
                  onChange={() => handleDiaChange(dia.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`dia-${dia.value}`} className="ml-2 block text-sm text-gray-700">
                  {dia.label}
                </label>
              </div>
            ))}
          </div>
          {formData.diasSemana && formData.diasSemana.length > 0 && (
            <p className="mt-1 text-sm text-gray-600">
              {formData.diasSemana.length} día(s) seleccionado(s)
            </p>
          )}
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
          disabled={loading || !diasInicializados}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Programa'}
        </button>
      </div>
    </form>
  );
}