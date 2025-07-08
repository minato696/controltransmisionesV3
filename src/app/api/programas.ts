import { Programa, ProgramaInput } from '../types/programa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function getProgramas(): Promise<Programa[]> {
  const response = await fetch(`${API_URL}/api/programas`);
  
  if (!response.ok) {
    throw new Error('Error al obtener programas');
  }
  
  return response.json();
}

export async function getPrograma(id: string | number): Promise<Programa> {
  const response = await fetch(`${API_URL}/api/programas/${id}`);
  
  if (!response.ok) {
    throw new Error(`Error al obtener programa con ID ${id}`);
  }
  
  return response.json();
}

export async function createPrograma(programa: ProgramaInput): Promise<Programa> {
  const response = await fetch(`${API_URL}/api/programas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(programa),
  });
  
  if (!response.ok) {
    throw new Error('Error al crear programa');
  }
  
  return response.json();
}

export async function updatePrograma(id: string | number, programa: ProgramaInput): Promise<Programa> {
  const response = await fetch(`${API_URL}/api/programas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(programa),
  });
  
  if (!response.ok) {
    throw new Error(`Error al actualizar programa con ID ${id}`);
  }
  
  return response.json();
}

export async function deletePrograma(id: string | number): Promise<void> {
  const response = await fetch(`${API_URL}/api/programas/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Error al eliminar programa con ID ${id}`);
  }
}

export async function getProgramasByFilial(filialId: string | number): Promise<Programa[]> {
  const response = await fetch(`${API_URL}/api/filiales/${filialId}/programas`);
  
  if (!response.ok) {
    throw new Error(`Error al obtener programas para filial con ID ${filialId}`);
  }
  
  return response.json();
}