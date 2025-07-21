export interface Programa {
  id: string | number;
  nombre: string;
  descripcion: string;
  filialId: string | number;
  fechaInicio: string;
  fechaFin?: string;
  estado: 'activo' | 'inactivo' | 'finalizado';
  
  // Propiedades adicionales para el sistema de transmisiones
  horario?: string;
  horaInicio?: string;
  isActivo?: boolean;
  diasSemana?: string[];
  filialesIds?: (string | number)[];  // Puede contener strings o números
  createdAt?: string;
  updatedAt?: string;
}

// Tipo actualizado para crear un programa
export type ProgramaInput = {
  nombre: string;
  estado: 'activo' | 'inactivo' | 'finalizado';
  filialId?: string | number;        // Mantenido para compatibilidad
  filialIds?: (string | number)[];   // Nuevo campo para múltiples filiales
  diasSemana?: string[];             // Array de días de semana
  horaInicio?: string;
};