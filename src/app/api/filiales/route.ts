import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FilialWithRelations } from '@/types/prisma-extensions';


export async function GET() {
  try {
    const filiales = await prisma.filial.findMany({
      include: {
        programas: {
          include: {
            programa: true
          }
        }
      }
    });
    
    // Transformar datos para el formato esperado por el frontend
    const transformedFiliales = filiales.map((filial: FilialWithRelations) => ({
      id: filial.id,
      nombre: filial.nombre,
      activa: filial.activa,
      fechaCreacion: filial.createdAt.toISOString(),
      isActivo: filial.activa,
      programaIds: filial.programas.map((p: { programaId: number }) => p.programaId),
      createdAt: filial.createdAt.toISOString(),
      updatedAt: filial.updatedAt.toISOString()
    }));
    
    return NextResponse.json(transformedFiliales);
  } catch (error) {
    console.error('Error al obtener filiales:', error);
    return NextResponse.json({ error: 'Error al obtener filiales' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newFilial = await prisma.filial.create({
      data: {
        nombre: body.nombre,
        activa: body.activa ?? true
      }
    });
    
    return NextResponse.json(newFilial, { status: 201 });
  } catch (error) {
    console.error('Error al crear filial:', error);
    return NextResponse.json({ error: 'Error al crear filial' }, { status: 500 });
  }
}