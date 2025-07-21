import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Datos recibidos en el endpoint:', body);
    
    const { nombre, diasSemana = [], horaInicio = '08:00', isActivo = true, filialIds = [] } = body;
    
    // Validaciones
    if (!nombre) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });
    }
    
    if (diasSemana.length === 0) {
      return NextResponse.json({ error: 'Al menos un día es requerido' }, { status: 400 });
    }
    
    if (filialIds.length === 0) {
      return NextResponse.json({ error: 'Al menos una filial es requerida' }, { status: 400 });
    }
    
    // Normalizar días (quitar acentos)
    const diasNormalizados = diasSemana.map((dia: string) => {
      if (dia === 'MIÉRCOLES') return 'MIERCOLES';
      if (dia === 'SÁBADO') return 'SABADO';
      return dia;
    });
    
    console.log('Días normalizados:', diasNormalizados);
    
    // Obtener todos los días de la semana
    const todosDias = await prisma.diaSemana.findMany();
    console.log('Todos los días en la BD:', todosDias);
    
    // Obtener IDs de días de la semana
    const diasSemanaDb = await prisma.diaSemana.findMany({
      where: {
        nombre: {
          in: diasNormalizados
        }
      }
    });
    
    console.log('Días encontrados en DB:', diasSemanaDb);
    
    if (diasSemanaDb.length === 0) {
      return NextResponse.json({ 
        error: 'No se encontraron los días especificados en la base de datos',
        diasEnviados: diasSemana,
        diasNormalizados: diasNormalizados,
        todosDiasEnBD: todosDias.map((d: { nombre: string }) => d.nombre)
      }, { status: 400 });
    }
    
    // Crear un programa para cada día de la semana
    const programasCreados = [];
    
    for (const dia of diasSemanaDb) {
      const nombrePrograma = `${nombre} - ${dia.nombre}`;
      
      try {
        // Crear el programa
        const programa = await prisma.programa.create({
          data: {
            nombre: nombrePrograma,
            descripcion: `Programa automático para ${dia.nombre}`,
            horaInicio: horaInicio,
            estado: isActivo ? 'activo' : 'inactivo',
            fechaInicio: new Date(),
            // Crear relación con este único día
            diasSemana: {
              create: [{
                diaSemanaId: dia.id
              }]
            },
            // Crear relaciones con todas las filiales seleccionadas
            filiales: {
              create: filialIds.map((filialId: number) => ({
                filialId
              }))
            }
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
        
        programasCreados.push(programa);
        console.log(`Programa creado: ${nombrePrograma}`);
      } catch (err) {
        console.error(`Error al crear programa para ${dia.nombre}:`, err);
      }
    }
    
    console.log(`Total programas creados: ${programasCreados.length}`);
    return NextResponse.json(programasCreados);
  } catch (error) {
    console.error('Error al crear programas por días:', error);
    return NextResponse.json({ error: 'Error al crear programas por días' }, { status: 500 });
  }
}