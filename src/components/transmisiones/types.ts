// Importar los tipos básicos desde la app
import { Filial as FilialBase } from '@/app/types/filial';
import { Programa as ProgramaBase } from '@/app/types/programa';

// Extender los tipos para transmisiones
export interface Programa extends ProgramaBase {
  horario: string;
  diasSemana: string[];
  isActivo: boolean;
}

export interface Filial extends FilialBase {
  isActivo: boolean;
  programaIds?: number[];
}

export interface Reporte {
  id_reporte?: number;
  filialId: number;
  programaId: number;
  fecha: string;
  estado: 'si' | 'no' | 'tarde' | 'pendiente';
  estadoTransmision?: 'Si' | 'No' | 'Tarde' | 'Pendiente';
  target?: string | null;
  motivo?: string | null;
  horaReal?: string | null;
  hora?: string | null;
  hora_tt?: string | null;
  observaciones?: string;
  isActivo?: boolean;
  createdAt?: string;
  updateAt?: string;
}

export interface EstadoTransmision {
  estado: 'pendiente' | 'si' | 'no' | 'tarde';
  horaReal?: string;
  hora_tt?: string;
  target?: string | null;
  motivo?: string | null;
}

export interface DiaSemana {
  nombre: string;
  fecha: string;
}

export interface TransmisionEditar {
  filialId: number;
  programaId: number;
  filial: string;
  programa: string;
  hora: string;
  dia: string;
  fecha: string;
  reporteId?: number;
}