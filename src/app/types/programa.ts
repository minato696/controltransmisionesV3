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
  filialesIds?: number[];
  createdAt?: string;
  updatedAt?: string;
}

// Tipo simplificado para crear un programa
// Solo incluye los campos necesarios para el backend
export type ProgramaInput = {
  nombre: string;
  estado: 'activo' | 'inactivo' | 'finalizado';
  filialId: string | number;
  diasSemana?: string[];
  horaInicio?: string;
};