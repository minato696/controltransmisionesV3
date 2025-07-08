// src/services/api.ts
import axios from 'axios';
import { Filial, FilialInput } from '../app/types/filial';
import { Programa, ProgramaInput } from '../app/types/programa';

// Configuración base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.10.213:5886';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== TIPOS ====================
export interface ProgramaBackend {
  id: number;
  nombre: string;
  horaInicio: string;
  isActivo: boolean;
  diasSemana: string[];
  filialesIds?: number[];
  createdAt?: string;
  updateAt?: string;
}

export interface FilialBackend {
  id: number;
  nombre: string;
  isActivo: boolean;
  programaIds?: number[];
  programas?: ProgramaBackend[];
  createdAt?: string;
  updateAt?: string;
}

export interface ReporteBackend {
  id_reporte?: number;
  fecha: string;
  estadoTransmision: 'Si' | 'No' | 'Tarde' | 'Pendiente';
  target?: string | null;
  motivo?: string | null;
  filialId: number;
  programaId: number;
  hora?: string | null;
  hora_tt?: string | null;
  createdAt?: string;
  updateAt?: string;
}

// ==================== CONVERSIONES DE FECHA ====================
export const convertirFechaASwagger = (fechaInput: any): string => {
  if (!fechaInput) {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const año = hoy.getFullYear();
    return `${dia}/${mes}/${año}`;
  }
  
  if (fechaInput instanceof Date) {
    const dia = String(fechaInput.getDate()).padStart(2, '0');
    const mes = String(fechaInput.getMonth() + 1).padStart(2, '0');
    const año = fechaInput.getFullYear();
    return `${dia}/${mes}/${año}`;
  }
  
  if (typeof fechaInput === 'string' && fechaInput.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return fechaInput;
  }
  
  if (typeof fechaInput === 'string' && fechaInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = fechaInput.split('-');
    return `${day}/${month}/${year}`;
  }
  
  return fechaInput;
};

export const convertirFechaDesdeSwagger = (fechaSwagger: string): string => {
  if (!fechaSwagger) return '';
  const [day, month, year] = fechaSwagger.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// ==================== TRANSFORMACIONES ====================
export const transformarProgramas = (programasBackend: ProgramaBackend[]) => {
  return programasBackend.map(programa => ({
    id: programa.id,
    nombre: programa.nombre,
    horario: programa.horaInicio || '00:00',
    horaInicio: programa.horaInicio,
    isActivo: programa.isActivo,
    diasSemana: programa.diasSemana,
    filialesIds: programa.filialesIds || [],
    createdAt: programa.createdAt,
    updatedAt: programa.updateAt
  }));
};

export const transformarFiliales = (filialesBackend: FilialBackend[]) => {
  return filialesBackend.map(filial => ({
    id: filial.id,
    nombre: filial.nombre.toUpperCase(),
    activa: filial.isActivo,
    // Campos opcionales con valores por defecto
    descripcion: '',
    ubicacion: '',
    fechaCreacion: filial.createdAt || new Date().toISOString(),
    // Propiedades para el sistema de transmisiones
    isActivo: filial.isActivo,
    programaIds: filial.programaIds || [],
    programas: filial.programas ? transformarProgramas(filial.programas) : [],
    createdAt: filial.createdAt,
    updatedAt: filial.updateAt
  }));
};

export const transformarReportes = (reportesBackend: ReporteBackend[]) => {
  return reportesBackend.map(reporte => {
    const fechaTransformada = reporte.fecha.includes('/') 
      ? convertirFechaDesdeSwagger(reporte.fecha)
      : reporte.fecha;
    
    let estadoTransformado: 'si' | 'no' | 'tarde' | 'pendiente' = 'pendiente';
    switch (reporte.estadoTransmision?.toLowerCase()) {
      case 'si': estadoTransformado = 'si'; break;
      case 'no': estadoTransformado = 'no'; break;
      case 'tarde': estadoTransformado = 'tarde'; break;
      default: estadoTransformado = 'pendiente';
    }
    
    let targetTransformado = null;
    if (reporte.target) {
      targetTransformado = convertBackendTargetToAbbr(reporte.target);
    }
    
    return {
      id_reporte: reporte.id_reporte,
      filialId: reporte.filialId,
      programaId: reporte.programaId,
      fecha: fechaTransformada,
      estado: estadoTransformado,
      estadoTransmision: reporte.estadoTransmision,
      target: targetTransformado,
      motivo: reporte.motivo || null,
      horaReal: reporte.hora || null,
      hora: reporte.hora || null,
      hora_tt: reporte.hora_tt || null,
      createdAt: reporte.createdAt,
      updateAt: reporte.updateAt
    };
  });
};

// ==================== FUNCIONES PARA ADAPTAR LOS DATOS AL BACKEND ====================

// Función corregida para preparar los datos de filial para el backend
export const transformarProgramaParaBackend = (programa: ProgramaInput): ProgramaBackend => {
  return {
    id: 0, // El ID será asignado por el backend en la creación
    nombre: programa.nombre,
    descripcion: programa.descripcion,
    horaInicio: programa.fechaInicio ? new Date(programa.fechaInicio).toTimeString().slice(0, 5) : '08:00',
    isActivo: programa.estado === 'activo',
    diasSemana: programa.diasSemana || ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES']
  } as ProgramaBackend;
};

// Función corregida para preparar los datos de filial para el backend
// Solo incluye los campos que el backend espera
export const transformarFilialParaBackend = (filial: FilialInput): FilialBackend => {
  return {
    id: 0, // El ID será asignado por el backend en la creación
    nombre: filial.nombre,
    isActivo: filial.activa
  } as FilialBackend;
};

// ==================== ENDPOINTS ====================
export const getProgramas = async () => {
  const response = await api.get<ProgramaBackend[]>('/programa/listar');
  return response.data;
};

export const getFiliales = async () => {
  const response = await api.get<FilialBackend[]>('/filial/listar');
  return response.data;
};

export const getReportes = async () => {
  try {
    const response = await api.get<ReporteBackend[]>('/reporte/listar');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

export const createReporte = async (reporteData: any) => {
  const estado = reporteData.estadoTransmision || reporteData.estado || 'Pendiente';
  const esSiTransmitio = estado === 'Si' || estado === 'si';
  const esNoTransmitio = estado === 'No' || estado === 'no';
  const esTardio = estado === 'Tarde' || estado === 'tarde';
  
  const fechaFormateada = convertirFechaASwagger(reporteData.fecha);
  
  let reporteObjeto: any = {
    fecha: fechaFormateada,
    estadoTransmision: estado === 'si' ? 'Si' : 
                       estado === 'no' ? 'No' : 
                       estado === 'tarde' ? 'Tarde' : 'Pendiente',
    filialId: parseInt(reporteData.filialId),
    programaId: parseInt(reporteData.programaId)
  };
  
  if (esSiTransmitio) {
    reporteObjeto.hora = reporteData.hora || reporteData.horaReal;
    reporteObjeto.target = null;
    reporteObjeto.motivo = null;
    reporteObjeto.hora_tt = null;
  } else if (esNoTransmitio) {
    reporteObjeto.hora = null;
    reporteObjeto.hora_tt = null;
    reporteObjeto.target = reporteData.target === 'Otros' ? 'Otro' : convertAbbrToBackendTarget(reporteData.target);
    reporteObjeto.motivo = reporteData.target === 'Otros' ? reporteData.motivo : null;
  } else if (esTardio) {
    reporteObjeto.hora = reporteData.hora || reporteData.horaReal;
    reporteObjeto.hora_tt = reporteData.hora_tt;
    reporteObjeto.target = null;
    reporteObjeto.motivo = reporteData.target === 'Otros' ? reporteData.motivo : null;
  }
  
  const response = await api.post('/reporte/add', [reporteObjeto]);
  return Array.isArray(response.data) ? response.data[0] : response.data;
};

export const updateReporte = async (id: number, reporteData: any) => {
  const estado = reporteData.estadoTransmision || reporteData.estado || 'Pendiente';
  const esSiTransmitio = estado === 'Si' || estado === 'si';
  const esNoTransmitio = estado === 'No' || estado === 'no';
  const esTardio = estado === 'Tarde' || estado === 'tarde';
  
  const fechaFormateada = convertirFechaASwagger(reporteData.fecha);
  
  let updateObjeto: any = {
    id_reporte: id,
    fecha: fechaFormateada,
    estadoTransmision: estado === 'si' ? 'Si' : 
                       estado === 'no' ? 'No' : 
                       estado === 'tarde' ? 'Tarde' : 'Pendiente',
    filialId: parseInt(reporteData.filialId),
    programaId: parseInt(reporteData.programaId)
  };
  
  if (esSiTransmitio) {
    updateObjeto.hora = reporteData.hora || reporteData.horaReal;
    updateObjeto.target = null;
    updateObjeto.motivo = null;
    updateObjeto.hora_tt = null;
  } else if (esNoTransmitio) {
    updateObjeto.hora = null;
    updateObjeto.hora_tt = null;
    updateObjeto.target = reporteData.target === 'Otros' ? 'Otro' : convertAbbrToBackendTarget(reporteData.target);
    updateObjeto.motivo = reporteData.target === 'Otros' ? reporteData.motivo : null;
  } else if (esTardio) {
    updateObjeto.hora = reporteData.hora || reporteData.horaReal;
    updateObjeto.hora_tt = reporteData.hora_tt;
    updateObjeto.target = null;
    updateObjeto.motivo = reporteData.target === 'Otros' ? reporteData.motivo : null;
  }
  
  const response = await api.put(`/reporte/${id}`, updateObjeto);
  return response.data;
};

export const guardarOActualizarReporte = async (
  filialId: number, 
  programaId: number, 
  fecha: string, 
  datosReporte: any
) => {
  const reporteCompleto = {
    ...datosReporte,
    filialId,
    programaId,
    fecha
  };
  
  if (datosReporte.id_reporte) {
    return await updateReporte(datosReporte.id_reporte, reporteCompleto);
  } else {
    return await createReporte(reporteCompleto);
  }
};

// ==================== FUNCIONES INTEGRADAS ====================
export const getProgramasTransformados = async () => {
  const programas = await getProgramas();
  return transformarProgramas(programas);
};

export const getFilialesTransformadas = async () => {
  const filiales = await getFiliales();
  return transformarFiliales(filiales);
};

export const getReportesPorFechas = async (fechaInicio: string, fechaFin: string) => {
  const reportes = await getReportes();
  const reportesTransformados = transformarReportes(reportes);
  
  return reportesTransformados.filter(reporte => {
    return reporte.fecha >= fechaInicio && reporte.fecha <= fechaFin;
  });
};

// ==================== FUNCIONES DE UTILIDAD PARA TARGET ====================

// Mapeo de abreviaturas (frontend) a valores completos (backend)
const TARGET_MAPPINGS: Record<string, string> = {
  // Frontend -> Backend
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

/**
 * Convierte una abreviatura del frontend al valor completo del backend
 */
export const convertAbbrToBackendTarget = (abbr: string | null): string | null => {
  if (!abbr) return null;
  
  // Si es "Otros" o "Otro", siempre devolver "Otro" (backend)
  if (abbr === 'Otros' || abbr === 'Otro') {
    return 'Otro';
  }
  
  return TARGET_MAPPINGS[abbr] || abbr;
};

/**
 * Convierte un valor completo del backend a la abreviatura del frontend
 */
export const convertBackendTargetToAbbr = (backendTarget: string | null): string | null => {
  if (!backendTarget) return null;
  
  // Si es "Otro" (backend), devolver "Otros" (frontend)
  if (backendTarget === 'Otro') {
    return 'Otros';
  }
  
  return TARGET_MAPPINGS_INVERSE[backendTarget] || backendTarget;
};