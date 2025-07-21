export interface Filial {
  id: string | number;
  nombre: string;
  activa: boolean;
  
  // Campos opcionales que pueden existir en el backend
  descripcion?: string;
  ubicacion?: string;
  fechaCreacion?: string;
  isActivo?: boolean;
  programaIds?: number[];
  programas?: any[];
  createdAt?: string;
  updatedAt?: string;
}

// Tipo simplificado para crear o actualizar filiales
export type FilialInput = {
  nombre: string;
  activa: boolean;
};