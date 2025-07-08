export interface Programa {
  id: string | number;
  nombre: string;
  descripcion: string;
  filialId: string | number; // Referencia a la filial
  fechaInicio: string; // ISO date string
  fechaFin?: string; // ISO date string (opcional)
  estado: 'activo' | 'inactivo' | 'finalizado';
}

// Tipo para crear un programa (sin ID ya que será generado por el backend)
export type ProgramaInput = Omit<Programa, 'id'>;