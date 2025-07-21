import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DiaSemanaDB } from '@/types/prisma-extensions';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const programaId = parseInt(params.id);
    const { diasSemana } = await request.json();
    
    // Verificar que el programa existe
    const programa = await prisma.programa.findUnique({
      where: { id: programaId }
    });
    
    if (!programa) {
      return NextResponse.json({ error: 'Programa no encontrado' }, { status: 404 });
    }
    
    // Eliminar días existentes
    await prisma.programaDia.deleteMany({
      where: { programaId }
    });
    
    // Obtener IDs de días de la semana
    const diasSemanaDb = await prisma.diaSemana.findMany({
      where: {
        nombre: {
          in: diasSemana
        }
      }
    });
    
    // Crear nuevas relaciones
    const nuevosProgDias = await Promise.all(
      diasSemanaDb.map((dia: DiaSemanaDB) => 
        prisma.programaDia.create({
          data: {
            programaId,
            diaSemanaId: dia.id
          }
        })
      )
    );
    
    return NextResponse.json(nuevosProgDias);
  } catch (error) {
    console.error(`Error al actualizar días para programa ${params.id}:`, error);
    return NextResponse.json({ error: 'Error al actualizar días del programa' }, { status: 500 });
  }
}