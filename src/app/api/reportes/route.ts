import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const reportes = await prisma.reporte.findMany({
      include: {
        filial: true,
        programa: true,
        estado: true,
        target: true
      }
    });
    
    if (reportes.length === 0) {
      return NextResponse.json([]);
    }
    
    // Transformar datos para el formato esperado por el frontend
    const reportesTransformados = reportes.map(reporte => ({
      id_reporte: reporte.id,
      filialId: reporte.filialId,
      programaId: reporte.programaId,
      fecha: reporte.fecha.toISOString().split('T')[0],
      estado: reporte.estado?.nombre?.toLowerCase() === 'si' ? 'si' : 
              reporte.estado?.nombre?.toLowerCase() === 'no' ? 'no' : 
              reporte.estado?.nombre?.toLowerCase() === 'tarde' ? 'tarde' : 'pendiente',
      estadoTransmision: reporte.estado?.nombre || 'Pendiente',
      target: reporte.target?.codigo || null,
      motivo: reporte.motivo || null,
      horaReal: reporte.hora || null,
      hora: reporte.hora || null,
      hora_tt: reporte.horaTt || null,
      observaciones: reporte.observaciones || null,
      createdAt: reporte.createdAt.toISOString(),
      updatedAt: reporte.updatedAt.toISOString()
    }));
    
    return NextResponse.json(reportesTransformados);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return NextResponse.json({ error: 'Error al obtener reportes' }, { status: 500 });
  }
}