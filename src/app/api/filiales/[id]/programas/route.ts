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
  const filialId = params.id;
  const programasFiltrados = programas.filter(p => p.filialId === filialId);
  
  return NextResponse.json(programasFiltrados);
}