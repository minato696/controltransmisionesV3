import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProgramaWithRelations, DiaSemanaDB } from '@/types/prisma-extensions';

export async function GET() {
  try {
    const programas = await prisma.programa.findMany({
      include: {
        filiales: {
          include: {
            filial: true
          }
        },
        diasSemana: {
          include: {
            diaSemana: true
          }
        }
      }
    });
    
    // Transformar datos para el formato esperado por el frontend
    const transformedProgramas = programas.map((programa: ProgramaWithRelations) => ({
      id: programa.id,
      nombre: programa.nombre,
      descripcion: programa.descripcion || '',
      filialId: programa.filiales[0]?.filialId || null,
      fechaInicio: programa.fechaInicio.toISOString().split('T')[0],
      fechaFin: programa.fechaFin ? programa.fechaFin.toISOString().split('T')[0] : null,
      estado: programa.estado,
      horario: programa.horaInicio,
      horaInicio: programa.horaInicio,
      isActivo: programa.estado === 'activo',
      diasSemana: programa.diasSemana.map((d: { diaSemana: { nombre: string } }) => d.diaSemana.nombre),
      filialesIds: programa.filiales.map((f: { filialId: number }) => f.filialId),
      createdAt: programa.createdAt.toISOString(),
      updatedAt: programa.updatedAt.toISOString()
    }));
    
    return NextResponse.json(transformedProgramas);
  } catch (error) {
    console.error('Error al obtener programas:', error);
    return NextResponse.json({ error: 'Error al obtener programas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Obtener IDs de días de la semana
    const diasSemana = await prisma.diaSemana.findMany({
      where: {
        nombre: {
          in: body.diasSemana || ['LUNES']
        }
      }
    });
    
    // Crear el programa
    const newPrograma = await prisma.programa.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        horaInicio: body.horaInicio || '08:00',
        estado: body.estado || 'activo',
        fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : new Date(),
        fechaFin: body.fechaFin ? new Date(body.fechaFin) : null,
        // Crear relaciones con días de la semana
        diasSemana: {
          create: diasSemana.map((dia: DiaSemanaDB) => ({
            diaSemanaId: dia.id
          }))
        },
        // Crear relaciones con filiales si existen
        filiales: body.filialIds?.length ? {
          create: body.filialIds.map((filialId: number) => ({
            filialId
          }))
        } : undefined
      },
      include: {
        diasSemana: {
          include: {
            diaSemana: true
          }
        },
        filiales: {
          include: {
            filial: true
          }
        }
      }
    });
    
    // Transformar para respuesta
    const transformedPrograma = {
      id: newPrograma.id,
      nombre: newPrograma.nombre,
      descripcion: newPrograma.descripcion || '',
      filialId: newPrograma.filiales[0]?.filialId || null,
      fechaInicio: newPrograma.fechaInicio.toISOString().split('T')[0],
      fechaFin: newPrograma.fechaFin ? newPrograma.fechaFin.toISOString().split('T')[0] : null,
      estado: newPrograma.estado,
      horario: newPrograma.horaInicio,
      horaInicio: newPrograma.horaInicio,
      isActivo: newPrograma.estado === 'activo',
      diasSemana: newPrograma.diasSemana.map((d: { diaSemana: { nombre: string } }) => d.diaSemana.nombre),
      filialesIds: newPrograma.filiales.map((f: { filialId: number }) => f.filialId),
      createdAt: newPrograma.createdAt.toISOString(),
      updatedAt: newPrograma.updatedAt.toISOString()
    };
    
    return NextResponse.json(transformedPrograma, { status: 201 });
  } catch (error) {
    console.error('Error al crear programa:', error);
    return NextResponse.json({ error: 'Error al crear programa' }, { status: 500 });
  }
}