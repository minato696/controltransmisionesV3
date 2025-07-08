// src/utils/targetMapping.ts

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

/**
 * Obtiene la etiqueta completa para mostrar en la UI
 */
export const getTargetLabel = (target: string | null, isAbbr: boolean = true): string => {
  if (!target) return '';
  
  if (isAbbr) {
    // Si es abreviatura, convertir a completo
    if (target === 'Otros') return 'Otros';
    return TARGET_MAPPINGS[target] || target;
  } else {
    // Si ya es completo, devolver tal cual
    return target;
  }
};

/**
 * Procesa el target de un reporte según el estado
 */
export const processReportTarget = (report: any): any => {
  const estado = report.estado || report.estadoTransmision;
  
  // Solo procesar target si el estado es "no" o "tarde"
  if (estado === 'no' || estado === 'No' || estado === 'tarde' || estado === 'Tarde') {
    return {
      ...report,
      target: report.target || null,
      motivo: report.motivo || null
    };
  }
  
  // Para otros estados, limpiar target y motivo
  return {
    ...report,
    target: null,
    motivo: null
  };
};

/**
 * Valida si un target es válido
 */
export const isValidTargetAbbr = (target: string): boolean => {
  return target === 'Otros' || target === 'Otro' || TARGET_MAPPINGS.hasOwnProperty(target);
};

/**
 * Extrae el target del motivo (para reportes tardíos)
 */
export const getTargetFromMotivo = (motivo: string | null): string | null => {
  if (!motivo) return null;
  
  // Buscar en los mappings inversos
  for (const [backend, frontend] of Object.entries(TARGET_MAPPINGS_INVERSE)) {
    if (motivo.includes(backend)) {
      return frontend;
    }
  }
  
  // Si contiene "Tarde" pero no está en mappings, devolver Tde
  if (motivo.toLowerCase().includes('tarde')) {
    return 'Tde';
  }
  
  return null;
};