import { NextResponse } from 'next/server';
import { Filial } from '@/app/types/filial';

// Datos de ejemplo
const filiales: Filial[] = [
  {
    id: '1',
    nombre: 'Filial Central',
    descripcion: 'Sede principal de la organización',
    ubicacion: 'Ciudad de México',
    fechaCreacion: '2023-01-15T00:00:00Z',
    activa: true,
  },
  {
    id: '2',
    nombre: 'Filial Norte',
    descripcion: 'Sucursal en la zona norte',
    ubicacion: 'Monterrey',
    fechaCreacion: '2023-03-22T00:00:00Z',
    activa: true,
  },
  {
    id: '3',
    nombre: 'Filial Sur',
    descripcion: 'Sucursal en la zona sur',
    ubicacion: 'Mérida',
    fechaCreacion: '2023-05-10T00:00:00Z',
    activa: false,
  },
];

export async function GET() {
  return NextResponse.json(filiales);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const newFilial: Filial = {
    id: Date.now().toString(),
    nombre: body.nombre,
    descripcion: body.descripcion,
    ubicacion: body.ubicacion,
    fechaCreacion: new Date().toISOString(),
    activa: body.activa ?? true,
  };
  
  filiales.push(newFilial);
  
  return NextResponse.json(newFilial, { status: 201 });
}