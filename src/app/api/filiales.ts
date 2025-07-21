import { Filial, FilialInput } from '../types/filial';
// Importar desde el nuevo archivo api-client
import * as apiClient from '../../services/api-client';

export async function getFiliales(): Promise<Filial[]> {
  return await apiClient.getFiliales();
}

export async function getFilial(id: string | number): Promise<Filial> {
  return await apiClient.getFilial(id);
}

export async function createFilial(filial: FilialInput): Promise<Filial> {
  return await apiClient.createFilial(filial);
}

export async function updateFilial(id: string | number, filial: FilialInput): Promise<Filial> {
  return await apiClient.updateFilial(id, filial);
}

export async function deleteFilial(id: string | number): Promise<void> {
  return await apiClient.deleteFilial(id);
}