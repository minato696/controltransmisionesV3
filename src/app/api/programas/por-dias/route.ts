import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface DiaSemana {
  id: number;
  nombre: string;
}

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
      const diaUpperCase = dia.toUpperCase();
      if (diaUpperCase === 'MIÉRCOLES') return 'MIERCOLES';
      if (diaUpperCase === 'SÁBADO') return 'SABADO';
      return diaUpperCase;
    });
    
    console.log('Días normalizados:', diasNormalizados);
    
    // Obtener todos los días de la semana
    const todosDias = await prisma.diaSemana.findMany();
    console.log('Todos los días en la BD:', todosDias);
    
    // Si no hay días en la BD, intentar crearlos
    if (todosDias.length === 0) {
      console.log('No hay días en la BD, intentando crearlos...');
      
      const diasParaCrear = [
        { nombre: 'LUNES' },
        { nombre: 'MARTES' },
        { nombre: 'MIERCOLES' },
        { nombre: 'JUEVES' },
        { nombre: 'VIERNES' },
        { nombre: 'SABADO' },
        { nombre: 'DOMINGO' }
      ];
      
      for (const dia of diasParaCrear) {
        await prisma.diaSemana.create({
          data: dia
        });
      }
      
      console.log('Días creados automáticamente');
      
      // Volver a obtener los días
      const diasCreados = await prisma.diaSemana.findMany();
      console.log('Días después de creación automática:', diasCreados);
      
      if (diasCreados.length === 0) {
        return NextResponse.json({ 
          error: 'No se pudieron crear los días automáticamente. Ejecute el endpoint /api/seed primero.' 
        }, { status: 500 });
      }
    }
    
    // Obtener IDs de días de la semana especificados
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
        todosDiasEnBD: todosDias.map((d: { nombre: string }) => d.nombre),
        recomendacion: 'Visite /api/seed para inicializar los datos de referencia'
      }, { status: 400 });
    }
    
    // MODIFICADO: Crear un solo programa con múltiples días
    console.log(`Creando programa: ${nombre} con ${diasSemanaDb.length} días`);
    
    try {
      // Crear el programa
      const programa = await prisma.programa.create({
        data: {
          nombre: nombre,
          descripcion: `Programa para ${diasSemanaDb.map((d: DiaSemana) => d.nombre).join(', ')}`,
          horaInicio: horaInicio,
          estado: isActivo ? 'activo' : 'inactivo',
          fechaInicio: new Date(),
          // Crear relaciones con todos los días
          diasSemana: {
            create: diasSemanaDb.map((dia: DiaSemana) => ({
              diaSemanaId: dia.id
            }))
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
      
      console.log(`Programa creado: ${nombre} con ${programa.diasSemana.length} días y ${programa.filiales.length} filiales`);
      
      return NextResponse.json(programa);
    } catch (err) {
      console.error(`Error al crear programa ${nombre}:`, err);
      throw err;
    }
  } catch (error) {
    console.error('Error al crear programa:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      error: 'Error al crear programa',
      details: errorMessage
    }, { status: 500 });
  }
}