import { NextResponse } from 'next/server';
import { Programa } from '@/app/types/programa';

// Datos de ejemplo
const programas: Programa[] = [
  {
    id: '1',
    nombre: 'Programa de Capacitación',
    descripcion: 'Capacitación para nuevos empleados',
    filialId: '1',
    fechaInicio: '2023-02-10T00:00:00Z',
    fechaFin: '2023-05-10T00:00:00Z',
    estado: 'finalizado',
  },
  {
    id: '2',
    nombre: 'Programa de Desarrollo',
    descripcion: 'Desarrollo de nuevas habilidades',
    filialId: '1',
    fechaInicio: '2023-06-01T00:00:00Z',
    estado: 'activo',
  },
  {
    id: '3',
    nombre: 'Programa de Integración',
    descripcion: 'Integración de equipos',
    filialId: '2',
    fechaInicio: '2023-04-15T00:00:00Z',
    estado: 'activo',
  },
  {
    id: '4',
    nombre: 'Programa de Ventas',
    descripcion: 'Capacitación en ventas',
    filialId: '2',
    fechaInicio: '2023-03-01T00:00:00Z',
    fechaFin: '2023-04-30T00:00:00Z',
    estado: 'finalizado',
  },
  {
    id: '5',
    nombre: 'Programa de Innovación',
    descripcion: 'Desarrollo de ideas innovadoras',
    filialId: '3',
    fechaInicio: '2023-07-01T00:00:00Z',
    estado: 'inactivo',
  },
];

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const programa = programas.find(p => p.id === id);
  
  if (!programa) {
    return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 });
  }
  
  return NextResponse.json(programa);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const programaIndex = programas.findIndex(p => p.id === id);
  
  if (programaIndex === -1) {
    return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 });
  }
  
  const body = await request.json();
  
  programas[programaIndex] = {
    ...programas[programaIndex],
    nombre: body.nombre ?? programas[programaIndex].nombre,
    descripcion: body.descripcion ?? programas[programaIndex].descripcion,
    filialId: body.filialId ?? programas[programaIndex].filialId,
    fechaInicio: body.fechaInicio ?? programas[programaIndex].fechaInicio,
    fechaFin: body.fechaFin ?? programas[programaIndex].fechaFin,
    estado: body.estado ?? programas[programaIndex].estado,
  };
  
  return NextResponse.json(programas[programaIndex]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const programaIndex = programas.findIndex(p => p.id === id);
  
  if (programaIndex === -1) {
    return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 });
  }
  
  programas.splice(programaIndex, 1);
  
  return new Response(null, { status: 204 });
}