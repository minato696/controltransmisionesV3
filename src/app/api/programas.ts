import { Programa, ProgramaInput } from '../types/programa';
// Importación corregida - ajusta la ruta según tu estructura de carpetas
import * as apiAdapter from '../../services/api-adapter';

// Estos métodos ahora redirigen al adaptador API que maneja
// la estructura específica de tu backend
export async function getProgramas(): Promise<Programa[]> {
  return await apiAdapter.getProgramas();
}

export async function getPrograma(id: string | number): Promise<Programa> {
  return await apiAdapter.getPrograma(id);
}

export async function createPrograma(programa: ProgramaInput): Promise<Programa> {
  return await apiAdapter.createPrograma(programa);
}

export async function updatePrograma(id: string | number, programa: ProgramaInput): Promise<Programa> {
  return await apiAdapter.updatePrograma(id, programa);
}

export async function deletePrograma(id: string | number): Promise<void> {
  return await apiAdapter.deletePrograma(id);
}

export async function getProgramasByFilial(filialId: string | number): Promise<Programa[]> {
  return await apiAdapter.getProgramasByFilial(filialId);
}