import { Programa, ProgramaInput } from '../types/programa';
// Importar desde el nuevo archivo api-client
import * as apiClient from '../../services/api-client';

export async function getProgramas(): Promise<Programa[]> {
  return await apiClient.getProgramas();
}

export async function getPrograma(id: string | number): Promise<Programa> {
  return await apiClient.getPrograma(id);
}

export async function createPrograma(programa: ProgramaInput): Promise<Programa> {
  return await apiClient.createPrograma(programa);
}

export async function updatePrograma(id: string | number, programa: ProgramaInput): Promise<Programa> {
  return await apiClient.updatePrograma(id, programa);
}

export async function deletePrograma(id: string | number): Promise<void> {
  return await apiClient.deletePrograma(id);
}

export async function getProgramasByFilial(filialId: string | number): Promise<Programa[]> {
  return await apiClient.getProgramasByFilial(filialId);
}