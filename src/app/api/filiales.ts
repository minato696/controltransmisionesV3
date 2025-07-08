import { Filial, FilialInput } from '../types/filial';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function getFiliales(): Promise<Filial[]> {
  const response = await fetch(`${API_URL}/api/filiales`);
  
  if (!response.ok) {
    throw new Error('Error al obtener filiales');
  }
  
  return response.json();
}

export async function getFilial(id: string | number): Promise<Filial> {
  const response = await fetch(`${API_URL}/api/filiales/${id}`);
  
  if (!response.ok) {
    throw new Error(`Error al obtener filial con ID ${id}`);
  }
  
  return response.json();
}

export async function createFilial(filial: FilialInput): Promise<Filial> {
  const response = await fetch(`${API_URL}/api/filiales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filial),
  });
  
  if (!response.ok) {
    throw new Error('Error al crear filial');
  }
  
  return response.json();
}

export async function updateFilial(id: string | number, filial: FilialInput): Promise<Filial> {
  const response = await fetch(`${API_URL}/api/filiales/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filial),
  });
  
  if (!response.ok) {
    throw new Error(`Error al actualizar filial con ID ${id}`);
  }
  
  return response.json();
}

export async function deleteFilial(id: string | number): Promise<void> {
  const response = await fetch(`${API_URL}/api/filiales/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Error al eliminar filial con ID ${id}`);
  }
}