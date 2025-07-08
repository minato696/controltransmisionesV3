// src/utils/targetMapping.ts
// Este archivo lo movemos al servicio api.ts integrado

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
  // Esta función ahora usa la función importada desde api.ts
  // que contiene la lógica de mapping
  return target === 'Otros' || target === 'Otro' || [
    'Fta', 'Enf', 'P.Tec', 'F.Serv', 'Tde'
  ].includes(target);
};

/**
 * Extrae el target del motivo (para reportes tardíos)
 */
export const getTargetFromMotivo = (motivo: string | null): string | null => {
  if (!motivo) return null;
  
  // Buscar correspondencias
  if (motivo.toLowerCase().includes('falta')) return 'Fta';
  if (motivo.toLowerCase().includes('enfermedad')) return 'Enf';
  if (motivo.toLowerCase().includes('problema técnico') || 
      motivo.toLowerCase().includes('problema tecnico')) return 'P.Tec';
  if (motivo.toLowerCase().includes('falla de servicio')) return 'F.Serv';
  if (motivo.toLowerCase().includes('tarde')) return 'Tde';
  
  return null;
};