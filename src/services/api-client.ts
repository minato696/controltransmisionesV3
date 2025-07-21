/**
 * API Client unificado para todas las operaciones con el backend
 * Reemplaza a los archivos api.ts y api-adapter.ts
 */
import axios from 'axios';
import { Filial, FilialInput } from '@/app/types/filial';
import { Programa, ProgramaInput } from '@/app/types/programa';

// CONFIGURACIÓN BASE
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.10.213:5886';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Definir el enum exactamente como está en Java - SIN TILDES
enum DiasSemana {
  LUNES = "LUNES",
  MARTES = "MARTES", 
  MIERCOLES = "MIERCOLES", // Sin tilde
  JUEVES = "JUEVES",
  VIERNES = "VIERNES",
  SABADO = "SABADO", // Sin tilde
  DOMINGO = "DOMINGO"
}

// Mapeo de nuestros valores a los valores del enum
const mapearDiaSemana = (dia: string): string => {
  switch (dia.toUpperCase()) {
    case 'LUNES': return DiasSemana.LUNES;
    case 'MARTES': return DiasSemana.MARTES;
    case 'MIÉRCOLES': return DiasSemana.MIERCOLES; // Nuestro frontend usa tildes
    case 'JUEVES': return DiasSemana.JUEVES;
    case 'VIERNES': return DiasSemana.VIERNES;
    case 'SÁBADO': return DiasSemana.SABADO; // Nuestro frontend usa tildes
    case 'DOMINGO': return DiasSemana.DOMINGO;
    default: return DiasSemana.LUNES; // Valor por defecto
  }
};

// Función para mapear días con tildes a días sin tildes
const normalizarDiasSinTildes = (diasConTildes: string[]): string[] => {
  return diasConTildes.map(dia => {
    switch (dia) {
      case 'MIÉRCOLES': return 'MIERCOLES';
      case 'SÁBADO': return 'SABADO';
      default: return dia;
    }
  });
};

// TIPOS DEL BACKEND
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
  diasSemana: string | string[];
  horaInicio: HoraBackend | string;
  createdAt?: string;
  updateAt?: string;
  reportes?: ReporteBackend[];
  filiales?: FilialBackend[];
}

// FUNCIONES DE TRANSFORMACIÓN

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
  
  // Extraer IDs de filiales si vienen en el programa
  const filialesIds = programaBackend.filiales?.map(f => f.id) || [];
  
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
    filialesIds: filialesIds,
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
 */
function prepararFilialParaBackend(filial: FilialInput): any {
  return {
    nombre: filial.nombre,
    isActivo: filial.activa
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
    resultado.hora = reporte.hora || reporte.horaReal;
  }
  
  if (reporte.hora_tt) {
    resultado.hora_tt = reporte.hora_tt;
  }
  
  // Si es una actualización, incluir el ID
  if (reporte.id_reporte) {
    resultado.id = reporte.id_reporte;
  }
  
  return resultado;
}

// FUNCIONES DE CONVERSIÓN DE FECHA
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

// MAPEO DE TARGETS (para reportes de transmisión)
// Mapeo de abreviaturas (frontend) a valores completos (backend)
const TARGET_MAPPINGS: Record<string, string> = {
  'Fta': 'Falta',
  'Enf': 'Enfermedad',
  'P.Tec': 'Problema técnico',
  'F.Serv': 'Falla de servicios',
  'Tde': 'Tarde',
  'Otros': 'Otro' // Nota: Frontend usa "Otros", backend usa "Otro"
};

// Mapeo inverso (backend -> frontend)
const TARGET_MAPPINGS_INVERSE: Record<string, string> = {
  'Falta': 'Fta',
  'Enfermedad': 'Enf',
  'Problema técnico': 'P.Tec',
  'Falla de servicios': 'F.Serv',
  'Tarde': 'Tde',
  'Otro': 'Otros' // Nota: Backend usa "Otro", frontend usa "Otros"
};

export const convertAbbrToBackendTarget = (abbr: string | null): string | null => {
  if (!abbr) return null;
  
  // Si es "Otros" o "Otro", siempre devolver "Otro" (backend)
  if (abbr === 'Otros' || abbr === 'Otro') {
    return 'Otro';
  }
  
  return TARGET_MAPPINGS[abbr] || abbr;
};

export const convertBackendTargetToAbbr = (backendTarget: string | null): string | null => {
  if (!backendTarget) return null;
  
  // Si es "Otro" (backend), devolver "Otros" (frontend)
  if (backendTarget === 'Otro') {
    return 'Otros';
  }
  
  return TARGET_MAPPINGS_INVERSE[backendTarget] || backendTarget;
};

// API DE FILIALES
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

// API DE PROGRAMAS
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
    // Verificar si tenemos múltiples días seleccionados
    let diasSeleccionados = Array.isArray(programa.diasSemana) ? programa.diasSemana : [programa.diasSemana || 'LUNES'];
    
    // Si no hay días seleccionados, usar un valor predeterminado
    if (diasSeleccionados.length === 0) {
      diasSeleccionados.push('LUNES');
    }
    
    // Normalizar días (quitar tildes)
    diasSeleccionados = normalizarDiasSinTildes(diasSeleccionados);
    
    console.log('Días seleccionados (sin tildes):', diasSeleccionados);
    
    // Preparar datos para enviar al backend
    const programaData = {
      nombre: programa.nombre,
      isActivo: programa.estado === 'activo',
      diasSemana: diasSeleccionados, // Ahora enviamos el array completo sin tildes
      horaInicio: programa.horaInicio || '08:00'
    };
    
    console.log('Enviando programa al backend:', programaData);
    
    // Hacer la llamada API
    const response = await api.post<ProgramaBackend>('/programa', programaData);
    const programaCreado = response.data;
    
    // Si hay filiales asociadas, asignarlas a este programa
    const filialesIds = (programa as any).filialesIds || [];
    if (filialesIds.length > 0 && programaCreado.id) {
      try {
        console.log('Asociando filiales al programa:', filialesIds);
        // Asegurarse de que todos los IDs sean números
        const filialIdsAsNumbers = filialesIds.map(id => Number(id));
        await api.put(`/programa/${programaCreado.id}/filiales`, {
          filialIds: filialIdsAsNumbers
        });
      } catch (err) {
        console.error('Error al asociar filiales al programa:', err);
        console.error('Detalles del error:', err.response?.data);
      }
    }
    
    // Devolver el programa creado
    const programaActualizado = await getPrograma(programaCreado.id);
    return programaActualizado;
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
    // Obtener los días seleccionados
    let diasSeleccionados = Array.isArray(programa.diasSemana) ? programa.diasSemana : [programa.diasSemana || 'LUNES'];
    
    // Normalizar días (quitar tildes)
    diasSeleccionados = normalizarDiasSinTildes(diasSeleccionados);
    
    const programaData = {
      nombre: programa.nombre,
      isActivo: programa.estado === 'activo',
      diasSemana: diasSeleccionados,
      horaInicio: programa.horaInicio || '08:00'
    };
    
    const response = await api.put<ProgramaBackend>(`/programa/${id}`, programaData);
    
    // Si hay filiales asociadas, actualizar la relación
    const filialesIds = (programa as any).filialesIds || [];
    if (filialesIds.length > 0) {
      try {
        console.log('Actualizando filiales del programa:', filialesIds);
        // Asegurarse de que todos los IDs sean números
        const filialIdsAsNumbers = filialesIds.map(id => Number(id));
        await api.put(`/programa/${id}/filiales`, {
          filialIds: filialIdsAsNumbers
        });
      } catch (err) {
        console.error('Error al actualizar filiales del programa:', err);
      }
    }
    
    // Obtener el programa actualizado con las filiales
    const programaActualizado = await getPrograma(id);
    return programaActualizado;
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

// API DE REPORTES
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

// FUNCIONES INTEGRADAS PARA EL SISTEMA DE TRANSMISIONES
export async function getFilialesTransformadas() {
  return await getFiliales();
}

export async function getProgramasTransformados() {
  return await getProgramas();
}

export async function getReportesPorFechas(fechaInicio: string, fechaFin: string) {
  return await getReportesPorRango(fechaInicio, fechaFin);
}