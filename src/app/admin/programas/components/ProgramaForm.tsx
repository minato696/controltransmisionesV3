
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Programa, ProgramaInput } from '@/app/types/programa';
import { Filial } from '@/app/types/filial';
import { getFiliales } from '@/app/api/filiales';
import { 
  createPrograma, 
  updatePrograma, 
  createProgramasPorDias 
} from '@/services/api-client';

interface ProgramaFormProps {
  programa?: Programa;
  onSubmit: (programa: ProgramaInput) => Promise<void>;
  isEditing?: boolean;
}

export default function ProgramaForm({ programa, onSubmit, isEditing = false }: ProgramaFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFilialId = searchParams.get('filialId');
  
  // Estado para el modo de creación: 'normal' o 'porDias'
  const [modoCreacion, setModoCreacion] = useState<'normal' | 'porDias'>(isEditing ? 'normal' : 'normal');
  
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
    
    // En modo porDias, permitimos selección múltiple
    if (modoCreacion === 'porDias') {
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
    } else {
      // En modo normal, solo seleccionamos un día
      setFormData(prev => ({ ...prev, diasSemana: [diaNormalizado] }));
    }
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

  // Maneja el cambio de modo de creación
  const handleModoCreacionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModoCreacion(e.target.value as 'normal' | 'porDias');
    
    // Resetear días seleccionados al cambiar de modo
    if (e.target.value === 'normal') {
      // En modo normal, solo seleccionamos un día (el primero de la lista)
      setFormData(prev => ({ 
        ...prev, 
        diasSemana: prev.diasSemana && prev.diasSemana.length > 0 ? [prev.diasSemana[0]] : ['LUNES'] 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      
      if (modoCreacion === 'normal') {
        // Modo normal: crear un solo programa
        // Preparar datos para enviar
        const datosPrograma: ProgramaInput = {
          nombre: formData.nombre,
          estado: formData.estado,
          // Usar la primera filial seleccionada como filialId principal (por compatibilidad)
          filialId: filialesSeleccionadas[0].toString(),
          // Incluir todas las filiales seleccionadas como números
          filialIds: filialesSeleccionadas.map(id => Number(id)),
          // Enviar todos los días seleccionados como array (normalizados sin acentos)
          diasSemana: formData.diasSemana?.map(dia => normalizarDiaSemana(dia)),
          // Asegurarnos de que horaInicio sea un string en formato HH:MM
          horaInicio: typeof formData.horaInicio === 'string' ? formData.horaInicio : '08:00'
        };
        
        console.log('Datos finales a enviar:', datosPrograma);
        
        await onSubmit(datosPrograma);
        router.push('/admin/programas');
      } else {
        // Modo porDias: crear múltiples programas (uno por día)
        const programasCreados = await createProgramasPorDias({
          nombre: formData.nombre,
          diasSemana: formData.diasSemana?.map(dia => normalizarDiaSemana(dia)) || [],
          horaInicio: typeof formData.horaInicio === 'string' ? formData.horaInicio : '08:00',
          isActivo: formData.estado === 'activo',
          filialIds: filialesSeleccionadas
        });
        
        console.log('Programas creados:', programasCreados);
        
        setExito(`Se han creado ${programasCreados.length} programas correctamente`);
        
        // Resetear el formulario
        setFormData({
          nombre: '',
          filialId: '',
          estado: 'activo',
          diasSemana: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
          horaInicio: '08:00'
        });
        setFilialesSeleccionadas([]);
      }
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
          {error}
        </div>
      )}
      
      {exito && (
        <div className="bg-green-50 text-green-600 p-4 rounded border border-green-200">
          {exito}
        </div>
      )}

      {!isEditing && (
        <div>
          <label htmlFor="modoCreacion" className="block text-sm font-medium text-gray-700 mb-1">
            Modo de Creación
          </label>
          <select
            id="modoCreacion"
            value={modoCreacion}
            onChange={handleModoCreacionChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="normal">Programa Individual</option>
            <option value="porDias">Múltiples Programas por Días</option>
          </select>
          {modoCreacion === 'porDias' && (
            <p className="mt-1 text-xs text-gray-500">
              En este modo se creará un programa independiente para cada día seleccionado
            </p>
          )}
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
            {modoCreacion === 'porDias' 
              ? 'Días para Crear Programas*' 
              : 'Días de Transmisión*'}
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
          {modoCreacion === 'porDias' && formData.diasSemana && formData.diasSemana.length > 0 && (
            <p className="mt-1 text-sm text-gray-600">
              Se crearán {formData.diasSemana.length} programas (uno por cada día)
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
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : isEditing ? 'Actualizar' : modoCreacion === 'porDias' ? 'Crear Programas' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
