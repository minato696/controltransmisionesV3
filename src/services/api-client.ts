import axios from 'axios';
import { Filial, FilialInput } from '@/app/types/filial';
import { Programa, ProgramaInput } from '@/app/types/programa';

// Configuración base
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// FILIALES API
export async function getFiliales(): Promise<Filial[]> {
  const response = await api.get<Filial[]>('/filiales');
  return response.data;
}

export async function getFilial(id: string | number): Promise<Filial> {
  const response = await api.get<Filial>(`/filiales/${id}`);
  return response.data;
}

export async function createFilial(filial: FilialInput): Promise<Filial> {
  const response = await api.post<Filial>('/filiales', filial);
  return response.data;
}

export async function updateFilial(id: string | number, filial: FilialInput): Promise<Filial> {
  const response = await api.put<Filial>(`/filiales/${id}`, filial);
  return response.data;
}

export async function deleteFilial(id: string | number): Promise<void> {
  await api.delete(`/filiales/${id}`);
}

// PROGRAMAS API
export async function getProgramas(): Promise<Programa[]> {
  const response = await api.get<Programa[]>('/programas');
  return response.data;
}

export async function getPrograma(id: string | number): Promise<Programa> {
  const response = await api.get<Programa>(`/programas/${id}`);
  return response.data;
}

export async function createPrograma(programa: ProgramaInput): Promise<Programa> {
  const response = await api.post<Programa>('/programas', programa);
  return response.data;
}

export async function updatePrograma(id: string | number, programa: ProgramaInput): Promise<Programa> {
  const response = await api.put<Programa>(`/programas/${id}`, programa);
  return response.data;
}

export async function deletePrograma(id: string | number): Promise<void> {
  await api.delete(`/programas/${id}`);
}

export async function getProgramasByFilial(filialId: string | number): Promise<Programa[]> {
  const response = await api.get<Programa[]>(`/filiales/${filialId}/programas`);
  return response.data;
}

// REPORTES API
export async function getReportesPorFechas(fechaInicio: string, fechaFin: string): Promise<any[]> {
  const response = await api.get<any[]>(`/reportes/rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
  return response.data;
}

/**
 * Guarda o actualiza un reporte de transmisión
 * @param filialId ID de la filial
 * @param programaId ID del programa
 * @param fecha Fecha del reporte (formato YYYY-MM-DD)
 * @param datosReporte Datos adicionales del reporte
 * @returns El reporte creado o actualizado
 */
export async function guardarOActualizarReporte(
  filialId: number, 
  programaId: number, 
  fecha: string, 
  datosReporte: any
): Promise<any> {
  try {
    const reporteCompleto = {
      ...datosReporte,
      filialId,
      programaId,
      fecha
    };
    
    // Comprobar si es una actualización o creación
    if (reporteCompleto.id_reporte) {
      // Es una actualización
      const response = await api.put(`/reportes/${reporteCompleto.id_reporte}`, reporteCompleto);
      return response.data;
    } else {
      // Es una creación - la API espera un array de reportes
      const response = await api.post('/reportes/add', [reporteCompleto]);
      // Devolver el primer reporte si es un array, o el reporte directamente
      return Array.isArray(response.data) ? response.data[0] : response.data;
    }
  } catch (error) {
    console.error('Error al guardar o actualizar reporte:', error);
    throw error;
  }
}

// FUNCIONES DE TRANSFORMACIÓN
export function convertirFechaASwagger(fechaInput: any): string {
  if (!fechaInput) {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }
  
  if (fechaInput instanceof Date) {
    return fechaInput.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }
  
  if (typeof fechaInput === 'string') {
    // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
    if (fechaInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return fechaInput;
    }
    
    // Si está en formato DD/MM/YYYY, convertirlo a YYYY-MM-DD
    if (fechaInput.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = fechaInput.split('/');
      return `${year}-${month}-${day}`;
    }
  }
  
  // Si no se pudo convertir, devolver la fecha actual
  return new Date().toISOString().split('T')[0];
}

export function convertirFechaDesdeSwagger(fechaSwagger: string): string {
  if (!fechaSwagger) return '';
  
  // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
  if (fechaSwagger.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return fechaSwagger;
  }
  
  // Si está en formato DD/MM/YYYY, convertirlo a YYYY-MM-DD
  if (fechaSwagger.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = fechaSwagger.split('/');
    return `${year}-${month}-${day}`;
  }
  
  return fechaSwagger;
}

// FUNCIONES INTEGRADAS PARA EL SISTEMA DE TRANSMISIONES
export async function getFilialesTransformadas() {
  return await getFiliales();
}

export async function getProgramasTransformados() {
  return await getProgramas();
}

// Función para crear programas por días
export async function createProgramasPorDias(datos: {
  nombre: string;
  diasSemana?: string[];
  horaInicio: string;
  isActivo: boolean;
  filialIds: number[];
}): Promise<any> {
  console.log('Enviando datos a la API:', datos);
  try {
    const response = await api.post<any>(`/programas/por-dias`, datos);
    console.log('Respuesta de la API:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error detallado:', error.response?.data || error.message);
    throw error;
  }
}