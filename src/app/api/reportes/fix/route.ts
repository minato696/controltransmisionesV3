import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Este endpoint corrige los reportes que tienen motivo pero no tienen target
export async function GET() {
  try {
    // Buscar todos los reportes que tienen motivo pero no tienen target
    const reportesConProblemas = await prisma.reporte.findMany({
      where: {
        motivo: {
          not: null,
        },
        targetId: null
      }
    });

    console.log(`Encontrados ${reportesConProblemas.length} reportes con motivo pero sin target`);

    // Buscar el target "Otros"
    const targetOtros = await prisma.target.findFirst({
      where: {
        codigo: 'Otros'
      }
    });

    if (!targetOtros) {
      return NextResponse.json({ 
        error: 'No se encontró el target "Otros" en la base de datos', 
        reportesConProblemas 
      }, { status: 500 });
    }

    // Corregir los reportes
    const reportesCorregidos = [];
    
    for (const reporte of reportesConProblemas) {
      const reporteActualizado = await prisma.reporte.update({
        where: { id: reporte.id },
        data: {
          targetId: targetOtros.id
        },
        include: {
          filial: true,
          programa: true,
          estado: true,
          target: true
        }
      });
      
      reportesCorregidos.push({
        id: reporteActualizado.id,
        estado: reporteActualizado.estado?.nombre,
        motivo: reporteActualizado.motivo,
        target: reporteActualizado.target?.codigo
      });
    }

    return NextResponse.json({
      success: true,
      mensaje: `Se corrigieron ${reportesCorregidos.length} reportes`,
      reportesCorregidos
    });
  } catch (error) {
    console.error('Error al corregir reportes:', error);
    return NextResponse.json({ error: 'Error al corregir reportes' }, { status: 500 });
  }
}