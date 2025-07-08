import { NextResponse } from 'next/server';
import { Filial } from '@/app/types/filial';

// Datos de ejemplo (los mismos que en el otro archivo)
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const filial = filiales.find(f => f.id === id);
  
  if (!filial) {
    return NextResponse.json({ error: 'Filial no encontrada' }, { status: 404 });
  }
  
  return NextResponse.json(filial);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const filialIndex = filiales.findIndex(f => f.id === id);
  
  if (filialIndex === -1) {
    return NextResponse.json({ error: 'Filial no encontrada' }, { status: 404 });
  }
  
  const body = await request.json();
  
  filiales[filialIndex] = {
    ...filiales[filialIndex],
    nombre: body.nombre ?? filiales[filialIndex].nombre,
    descripcion: body.descripcion ?? filiales[filialIndex].descripcion,
    ubicacion: body.ubicacion ?? filiales[filialIndex].ubicacion,
    activa: body.activa ?? filiales[filialIndex].activa,
  };
  
  return NextResponse.json(filiales[filialIndex]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const filialIndex = filiales.findIndex(f => f.id === id);
  
  if (filialIndex === -1) {
    return NextResponse.json({ error: 'Filial no encontrada' }, { status: 404 });
  }
  
  filiales.splice(filialIndex, 1);
  
  return new Response(null, { status: 204 });
}