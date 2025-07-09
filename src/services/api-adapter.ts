/**
 * API Adapter para conectar con el backend real
 * Este archivo adapta la estructura del backend a la estructura esperada por el frontend
 */
import axios from 'axios';
import { Filial, FilialInput } from '@/app/types/filial';
import { Programa, ProgramaInput } from '@/app/types/programa';

// Configuración base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interfaces que representan la estructura exacta del backend
interface HoraBackend {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

interface ReporteBackend {
  id: number;
  fecha: string;
  estadoTransmision: 'Pendiente' | 'Si' | 'No' | 'Tarde';
  target?: string;
  motivo?: string;
  filialId?: number;
  programaId?: number;
  hora?: HoraBackend | string;
  hora_tt?: HoraBackend | string;
  observaciones?: string;
  createdAt?: string;
  updateAt?: string;
}

interface FilialBackend {
  id: number;
  nombre: string;
  isActivo: boolean;
  createdAt?: string;
  updateAt?: string;
  reportes?: ReporteBackend[];
  programas?: ProgramaBackend[];
}

interface ProgramaBackend {
  id: number;
  nombre: string;
  isActivo: boolean;
  diasSemana: string | string[]; // Puede ser un string "LUNES" o un array ["LUNES", "MARTES"]
  horaInicio: HoraBackend | string;
  createdAt?: string;
  updateAt?: string;
  reportes?: ReporteBackend[];
  filiales?: FilialBackend[];
}

// Funciones de transformación

/**
 * Convierte formato de hora del backend a string HH:MM
 */
function horaBackendToString(hora: HoraBackend | string | undefined): string {
  if (!hora) return '';
  
  if (typeof hora === 'string') {
    return hora;
  }
  
  const { hour, minute } = hora;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Convierte string HH:MM a formato de hora del backend
 */
function stringToHoraBackend(horaStr: string): HoraBackend {
  if (!horaStr) {
    return { hour: 0, minute: 0, second: 0, nano: 0 };
  }
  
  const [hourStr, minuteStr] = horaStr.split(':');
  return {
    hour: parseInt(hourStr, 10) || 0,
    minute: parseInt(minuteStr, 10) || 0,
    second: 0,
    nano: 0
  };
}

/**
 * Normaliza los días de la semana a un array
 */
function normalizarDiasSemana(dias: string | string[] | undefined): string[] {
  if (!dias) return [];
  
  if (typeof dias === 'string') {
    // Si es un solo día como "LUNES", lo convertimos a array
    return [dias];
  }
  
  return dias;
}

/**
 * Transforma una filial del backend al formato del frontend
 */
function transformarFilial(filialBackend: FilialBackend): Filial {
  return {
    id: filialBackend.id,
    nombre: filialBackend.nombre,
    activa: filialBackend.isActivo,
    // Campos adicionales para compatibilidad con el sistema existente
    descripcion: '',
    ubicacion: '',
    fechaCreacion: filialBackend.createdAt || new Date().toISOString(),
    isActivo: filialBackend.isActivo,
    programaIds: filialBackend.programas?.map(p => p.id) || [],
    createdAt: filialBackend.createdAt,
    updatedAt: filialBackend.updateAt
  };
}

/**
 * Transforma un programa del backend al formato del frontend
 */
function transformarPrograma(programaBackend: ProgramaBackend): Programa {
  const diasSemana = normalizarDiasSemana(programaBackend.diasSemana);
  const horaInicio = horaBackendToString(programaBackend.horaInicio);
  
  return {
    id: programaBackend.id,
    nombre: programaBackend.nombre,
    descripcion: '',
    filialId: programaBackend.filiales?.[0]?.id || 0,
    fechaInicio: programaBackend.createdAt || new Date().toISOString(),
    estado: programaBackend.isActivo ? 'activo' : 'inactivo',
    // Campos adicionales para el sistema de transmisiones
    horario: horaInicio,
    horaInicio: horaInicio,
    isActivo: programaBackend.isActivo,
    diasSemana: diasSemana,
    filialesIds: programaBackend.filiales?.map(f => f.id) || [],
    createdAt: programaBackend.createdAt,
    updatedAt: programaBackend.updateAt
  };
}

/**
 * Transforma un reporte del backend al formato del frontend
 */
function transformarReporte(reporteBackend: ReporteBackend): any {
  const estadoTransmision = reporteBackend.estadoTransmision || 'Pendiente';
  
  // Mapear estadoTransmision a estado (usado en el frontend)
  let estado: 'si' | 'no' | 'tarde' | 'pendiente' = 'pendiente';
  switch (estadoTransmision) {
    case 'Si': estado = 'si'; break;
    case 'No': estado = 'no'; break;
    case 'Tarde': estado = 'tarde'; break;
    default: estado = 'pendiente';
  }
  
  return {
    id_reporte: reporteBackend.id,
    filialId: reporteBackend.filialId || 0,
    programaId: reporteBackend.programaId || 0,
    fecha: reporteBackend.fecha,
    estado: estado,
    estadoTransmision: reporteBackend.estadoTransmision,
    target: reporteBackend.target || null,
    motivo: reporteBackend.motivo || null,
    horaReal: horaBackendToString(reporteBackend.hora),
    hora: horaBackendToString(reporteBackend.hora),
    hora_tt: horaBackendToString(reporteBackend.hora_tt),
    createdAt: reporteBackend.createdAt,
    updateAt: reporteBackend.updateAt
  };
}

/**
 * Prepara los datos de una filial para enviar al backend
 * ACTUALIZADO: Ahora solo envía los campos necesarios según el backend
 */
function prepararFilialParaBackend(filial: FilialInput): any {
  // Simplificado - sólo enviamos lo que el backend necesita
  return {
    nombre: filial.nombre,
    isActivo: filial.activa
  };
}

/**
 * Prepara los datos de un programa para enviar al backend
 * ACTUALIZADO: Convierte correctamente los datos según el formato esperado por el backend
 */
function prepararProgramaParaBackend(programa: ProgramaInput): any {
  // Convertir string de hora a objeto hora para el backend
  const [horas, minutos] = (programa.horaInicio || '08:00').split(':').map(Number);
  const horaInicio = {
    hour: horas || 8,
    minute: minutos || 0,
    second: 0,
    nano: 0
  };
  
  // Asegurarse de que diasSemana sea un array y no esté vacío
  let diasSemana = Array.isArray(programa.diasSemana) ? programa.diasSemana : ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];
  
  // Si el array está vacío, usar valores por defecto
  if (diasSemana.length === 0) {
    diasSemana = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];
  }
  
  // El objeto que espera el backend
  return {
    nombre: programa.nombre,
    isActivo: programa.estado === 'activo',
    diasSemana: diasSemana,
    horaInicio: horaInicio
  };
}

/**
 * Prepara los datos de un reporte para enviar al backend
 */
function prepararReporteParaBackend(reporte: any): any {
  // Convertir estado a estadoTransmision
  let estadoTransmision = 'Pendiente';
  switch (reporte.estado) {
    case 'si': estadoTransmision = 'Si'; break;
    case 'no': estadoTransmision = 'No'; break;
    case 'tarde': estadoTransmision = 'Tarde'; break;
    default: estadoTransmision = 'Pendiente';
  }
  
  const resultado: any = {
    fecha: reporte.fecha,
    estadoTransmision: estadoTransmision,
    filialId: reporte.filialId,
    programaId: reporte.programaId
  };
  
  // Agregar campos opcionales según el estado
  if (reporte.target) {
    resultado.target = reporte.target;
  }
  
  if (reporte.motivo) {
    resultado.motivo = reporte.motivo;
  }
  
  if (reporte.hora || reporte.horaReal) {
    resultado.hora = stringToHoraBackend(reporte.hora || reporte.horaReal || '');
  }
  
  if (reporte.hora_tt) {
    resultado.hora_tt = stringToHoraBackend(reporte.hora_tt);
  }
  
  // Si es una actualización, incluir el ID
  if (reporte.id_reporte) {
    resultado.id = reporte.id_reporte;
  }
  
  return resultado;
}

// API de Filiales
export async function getFiliales(): Promise<Filial[]> {
  try {
    const response = await api.get<FilialBackend[]>('/filial/listar');
    return response.data.map(transformarFilial);
  } catch (error) {
    console.error('Error al obtener filiales:', error);
    throw error;
  }
}

export async function getFilial(id: string | number): Promise<Filial> {
  try {
    const response = await api.get<FilialBackend>(`/filial/${id}`);
    return transformarFilial(response.data);
  } catch (error) {
    console.error(`Error al obtener filial con ID ${id}:`, error);
    throw error;
  }
}

export async function createFilial(filial: FilialInput): Promise<Filial> {
  try {
    const filialData = prepararFilialParaBackend(filial);
    const response = await api.post<FilialBackend>('/filial', filialData);
    return transformarFilial(response.data);
  } catch (error) {
    console.error('Error al crear filial:', error);
    throw error;
  }
}

export async function updateFilial(id: string | number, filial: FilialInput): Promise<Filial> {
  try {
    const filialData = prepararFilialParaBackend(filial);
    const response = await api.put<FilialBackend>(`/filial/${id}`, filialData);
    return transformarFilial(response.data);
  } catch (error) {
    console.error(`Error al actualizar filial con ID ${id}:`, error);
    throw error;
  }
}

export async function deleteFilial(id: string | number): Promise<void> {
  try {
    await api.delete(`/filial/${id}`);
  } catch (error) {
    console.error(`Error al eliminar filial con ID ${id}:`, error);
    throw error;
  }
}

// API de Programas
export async function getProgramas(): Promise<Programa[]> {
  try {
    const response = await api.get<ProgramaBackend[]>('/programa/listar');
    return response.data.map(transformarPrograma);
  } catch (error) {
    console.error('Error al obtener programas:', error);
    throw error;
  }
}

export async function getPrograma(id: string | number): Promise<Programa> {
  try {
    const response = await api.get<ProgramaBackend>(`/programa/${id}`);
    return transformarPrograma(response.data);
  } catch (error) {
    console.error(`Error al obtener programa con ID ${id}:`, error);
    throw error;
  }
}

export async function getProgramasByFilial(filialId: string | number): Promise<Programa[]> {
  try {
    // Obtener todos los programas y filtrar por filialId
    const programas = await getProgramas();
    return programas.filter(p => {
      return p.filialId === filialId || p.filialesIds?.includes(Number(filialId));
    });
  } catch (error) {
    console.error(`Error al obtener programas para filial con ID ${filialId}:`, error);
    throw error;
  }
}

export async function createPrograma(programa: ProgramaInput): Promise<Programa> {
  try {
    const programaData = prepararProgramaParaBackend(programa);
    
    // Log para debug
    console.log('Enviando programa al backend:', programaData);
    
    const response = await api.post<ProgramaBackend>('/programa', programaData);
    
    // Si hay una filial asociada, asignar el programa a esa filial
    if (programa.filialId && response.data.id) {
      try {
        await api.put(`/programa/${response.data.id}/filiales`, {
          filialIds: [Number(programa.filialId)]
        });
      } catch (err) {
        console.error('Error al asociar filial al programa:', err);
        // No lanzar error aquí, el programa ya fue creado
      }
    }
    
    return transformarPrograma(response.data);
  } catch (error: any) {
    console.error('Error al crear programa:', error);
    
    // Si hay una respuesta del servidor, mostrar más detalles
    if (error.response) {
      console.error('Detalles del error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    throw error;
  }
}

export async function updatePrograma(id: string | number, programa: ProgramaInput): Promise<Programa> {
  try {
    const programaData = prepararProgramaParaBackend(programa);
    const response = await api.put<ProgramaBackend>(`/programa/${id}`, programaData);
    
    // Si hay una filial asociada, actualizar la relación
    if (programa.filialId) {
      await api.put(`/programa/${id}/filiales`, {
        filialIds: [Number(programa.filialId)]
      });
    }
    
    return transformarPrograma(response.data);
  } catch (error) {
    console.error(`Error al actualizar programa con ID ${id}:`, error);
    throw error;
  }
}

export async function deletePrograma(id: string | number): Promise<void> {
  try {
    await api.delete(`/programa/${id}`);
  } catch (error) {
    console.error(`Error al eliminar programa con ID ${id}:`, error);
    throw error;
  }
}

// API de Reportes
export async function getReportes(): Promise<any[]> {
  try {
    const response = await api.get<ReporteBackend[]>('/reporte/listar');
    return response.data.map(transformarReporte);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function getReportesPorRango(fechaInicio: string, fechaFin: string): Promise<any[]> {
  try {
    // Convertir fechas al formato esperado por el backend (YYYY-MM-DD)
    const fechaInicioFormateada = fechaInicio;
    const fechaFinFormateada = fechaFin;
    
    const response = await api.get<ReporteBackend[]>(`/reporte/rango?fechaInicio=${fechaInicioFormateada}&fechaFin=${fechaFinFormateada}`);
    return response.data.map(transformarReporte);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function createReporte(reporteData: any): Promise<any> {
  try {
    const datosReporte = prepararReporteParaBackend(reporteData);
    // El endpoint espera un array de reportes
    const response = await api.post('/reporte/add', [datosReporte]);
    return Array.isArray(response.data) ? 
      transformarReporte(response.data[0]) : 
      transformarReporte(response.data);
  } catch (error) {
    console.error('Error al crear reporte:', error);
    throw error;
  }
}

export async function updateReporte(id: number, reporteData: any): Promise<any> {
  try {
    const datosReporte = prepararReporteParaBackend(reporteData);
    const response = await api.put(`/reporte/${id}`, datosReporte);
    return transformarReporte(response.data);
  } catch (error) {
    console.error(`Error al actualizar reporte con ID ${id}:`, error);
    throw error;
  }
}

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
    
    if (reporteCompleto.id_reporte) {
      return await updateReporte(reporteCompleto.id_reporte, reporteCompleto);
    } else {
      return await createReporte(reporteCompleto);
    }
  } catch (error) {
    console.error('Error al guardar o actualizar reporte:', error);
    throw error;
  }
}

// Funciones para transformar las fechas
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

// Funciones integradas para el sistema de transmisiones
export async function getFilialesTransformadas() {
  return await getFiliales();
}

export async function getProgramasTransformados() {
  return await getProgramas();
}

export async function getReportesPorFechas(fechaInicio: string, fechaFin: string) {
  return await getReportesPorRango(fechaInicio, fechaFin);
}

// Mapeo de targets (para reportes de transmisión)
export const convertAbbrToBackendTarget = (abbr: string | null): string | null => {
  if (!abbr) return null;
  
  const TARGET_MAPPINGS: Record<string, string> = {
    'Fta': 'Falta',
    'Enf': 'Enfermedad',
    'P.Tec': 'Problema técnico',
    'F.Serv': 'Falla de servicios',
    'Tde': 'Tarde',
    'Otros': 'Otro'
  };
  
  return TARGET_MAPPINGS[abbr] || abbr;
};

export const convertBackendTargetToAbbr = (backendTarget: string | null): string | null => {
  if (!backendTarget) return null;
  
  const TARGET_MAPPINGS_INVERSE: Record<string, string> = {
    'Falta': 'Fta',
    'Enfermedad': 'Enf',
    'Problema técnico': 'P.Tec',
    'Falla de servicios': 'F.Serv',
    'Tarde': 'Tde',
    'Otro': 'Otros'
  };
  
  return TARGET_MAPPINGS_INVERSE[backendTarget] || backendTarget;
};