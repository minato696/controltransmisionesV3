import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Crear días de la semana
    const diasSemana = [
      { nombre: 'LUNES' },
      { nombre: 'MARTES' },
      { nombre: 'MIERCOLES' },
      { nombre: 'JUEVES' },
      { nombre: 'VIERNES' },
      { nombre: 'SABADO' },
      { nombre: 'DOMINGO' }
    ];

    const createdDias = [];
    for (const dia of diasSemana) {
      const result = await prisma.diaSemana.upsert({
        where: { nombre: dia.nombre },
        update: {},
        create: dia,
      });
      createdDias.push(result);
    }
    
    // Crear estados de transmisión
    const estados = [
      { nombre: 'Pendiente' },
      { nombre: 'Si' },
      { nombre: 'No' },
      { nombre: 'Tarde' }
    ];

    const createdEstados = [];
    for (const estado of estados) {
      const result = await prisma.estadoTransmision.upsert({
        where: { nombre: estado.nombre },
        update: {},
        create: estado,
      });
      createdEstados.push(result);
    }
    
    // Crear targets/motivos
    const targets = [
      { codigo: 'Fta', nombre: 'Falta', tipo: 'no_transmitio' },
      { codigo: 'Enf', nombre: 'Enfermedad', tipo: 'no_transmitio' },
      { codigo: 'P.Tec', nombre: 'Problema técnico', tipo: 'ambos' },
      { codigo: 'F.Serv', nombre: 'Falla de servicios', tipo: 'ambos' },
      { codigo: 'Tde', nombre: 'Tarde', tipo: 'transmitio_tarde' },
      { codigo: 'Otro', nombre: 'Otro', tipo: 'ambos' }
    ];

    const createdTargets = [];
    for (const target of targets) {
      const result = await prisma.target.upsert({
        where: { codigo: target.codigo },
        update: {},
        create: target,
      });
      createdTargets.push(result);
    }

    return NextResponse.json({
      success: true,
      data: {
        diasSemana: createdDias,
        estados: createdEstados,
        targets: createdTargets
      },
      message: 'Base de datos inicializada con datos de referencia'
    });
  } catch (error) {
    console.error('Error al inicializar datos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al inicializar datos', 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
}