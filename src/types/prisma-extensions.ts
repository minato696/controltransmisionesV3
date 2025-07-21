// src/types/prisma-extensions.ts

// Define interfaces simples que coincidan con la estructura de los datos
export interface DiaSemanaDB {
  id: number;
  nombre: string;
}

export interface FilialBasic {
  id: number;
  nombre: string;
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramaBasic {
  id: number;
  nombre: string;
  descripcion?: string | null;
  horaInicio: string;
  estado: string;
  fechaInicio: Date;
  fechaFin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramaDiaBasic {
  id: number;
  programaId: number;
  diaSemanaId: number;
}

export interface FilialProgramaBasic {
  id: number;
  filialId: number;
  programaId: number;
}

// Interfaces extendidas que incluyen relaciones
export interface FilialWithRelations extends FilialBasic {
  programas: {
    id: number;
    filialId: number;
    programaId: number;
    programa: ProgramaBasic;
  }[];
}

export interface ProgramaWithRelations extends ProgramaBasic {
  filiales: {
    id: number;
    filialId: number;
    programaId: number;
    filial: FilialBasic;
  }[];
  diasSemana: {
    id: number;
    programaId: number;
    diaSemanaId: number;
    diaSemana: DiaSemanaDB;
  }[];
}