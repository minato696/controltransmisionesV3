export interface Filial {
  id: string | number;
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  fechaCreacion: string; // ISO date string
  activa: boolean;
}

// Tipo para crear una filial (sin ID ya que será generado por el backend)
export type FilialInput = Omit<Filial, 'id' | 'fechaCreacion'> & {
  fechaCreacion?: string;
};