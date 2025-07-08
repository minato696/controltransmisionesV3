import { Filial, FilialInput } from '../types/filial';
// Importación corregida - ajusta la ruta según tu estructura de carpetas
import * as apiAdapter from '../../services/api-adapter';

// Estos métodos ahora redirigen al adaptador API que maneja
// la estructura específica de tu backend
export async function getFiliales(): Promise<Filial[]> {
  return await apiAdapter.getFiliales();
}

export async function getFilial(id: string | number): Promise<Filial> {
  return await apiAdapter.getFilial(id);
}

export async function createFilial(filial: FilialInput): Promise<Filial> {
  return await apiAdapter.createFilial(filial);
}

export async function updateFilial(id: string | number, filial: FilialInput): Promise<Filial> {
  return await apiAdapter.updateFilial(id, filial);
}

export async function deleteFilial(id: string | number): Promise<void> {
  return await apiAdapter.deleteFilial(id);
}