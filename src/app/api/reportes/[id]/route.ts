import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de reporte inválido' }, { status: 400 });
    }
    
    const reporte = await prisma.reporte.findUnique({
      where: { id },
      include: {
        filial: true,
        programa: true,
        estado: true,
        target: true
      }
    });
    
    if (!reporte) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
    }
    
    // Transformar para respuesta
    const reporteTransformado = {
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
    };
    
    return NextResponse.json(reporteTransformado);
  } catch (error) {
    console.error(`Error al obtener reporte con ID ${params.id}:`, error);
    return NextResponse.json({ error: 'Error al obtener reporte' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de reporte inválido' }, { status: 400 });
    }
    
    const reporteData = await request.json();
    console.log('Datos recibidos para actualizar reporte:', reporteData);
    
    // Verificar si el reporte existe
    const reporteExistente = await prisma.reporte.findUnique({
      where: { id }
    });
    
    if (!reporteExistente) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
    }
    
    // Preparar datos para actualización
    const { 
      estadoTransmision, 
      estado, 
      target, 
      motivo, 
      hora, 
      horaReal, 
      hora_tt, 
      observaciones 
    } = reporteData;
    
    // Buscar o crear el estado
    let estadoId: number | undefined;
    
    if (estadoTransmision || estado) {
      // Normalizar el estado para la búsqueda
      const estadoNombre = estadoTransmision || 
                          (estado === 'si' ? 'Si' : 
                           estado === 'no' ? 'No' : 
                           estado === 'tarde' ? 'Tarde' : 'Pendiente');
      
      const estadoDB = await prisma.estadoTransmision.findFirst({
        where: { nombre: estadoNombre }
      });
      
      if (estadoDB) {
        estadoId = estadoDB.id;
      }
    }
    
    // Buscar el target si existe
    let targetId: number | null = null;
    
    if (target) {
      const targetDB = await prisma.target.findFirst({
        where: { codigo: target }
      });
      
      if (targetDB) {
        targetId = targetDB.id;
      }
    }
    
    // Datos para actualizar
    const updateData: any = {};
    
    if (estadoId) updateData.estadoId = estadoId;
    
    // Manejo mejorado del target y motivo
    if (target === 'Otros' && motivo) {
      // Si el target es "Otros", guardar el target y el motivo personalizado
      updateData.targetId = targetId;
      updateData.motivo = motivo;
    } else if (target && target !== 'Otros') {
      // Si hay un target específico (no es "Otros"), guardar el target y eliminar cualquier motivo
      updateData.targetId = targetId;
      updateData.motivo = null; // Limpiamos el motivo ya que no es necesario
    } else if (!target && motivo) {
      // Si no hay target pero hay motivo, guardamos solo el motivo
      updateData.targetId = null;
      updateData.motivo = motivo;
    } else {
      // En cualquier otro caso, usar los valores proporcionados
      updateData.targetId = targetId;
      if (motivo !== undefined) {
        updateData.motivo = motivo || null;
      }
    }
    
    // Otros campos
    if (hora !== undefined || horaReal !== undefined) updateData.hora = horaReal || hora || null;
    if (hora_tt !== undefined) updateData.horaTt = hora_tt || null;
    if (observaciones !== undefined) updateData.observaciones = observaciones || null;
    
    console.log('Datos a actualizar:', updateData);
    
    // Actualizar reporte
    const reporte = await prisma.reporte.update({
      where: { id },
      data: updateData,
      include: {
        filial: true,
        programa: true,
        estado: true,
        target: true
      }
    });
    
    console.log('Reporte actualizado:', reporte);
    
    // Transformar para respuesta
    const reporteTransformado = {
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
    };
    
    return NextResponse.json(reporteTransformado);
  } catch (error) {
    console.error(`Error al actualizar reporte con ID ${params.id}:`, error);
    return NextResponse.json({ error: 'Error al actualizar reporte' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de reporte inválido' }, { status: 400 });
    }
    
    // Verificar si el reporte existe
    const reporteExistente = await prisma.reporte.findUnique({
      where: { id }
    });
    
    if (!reporteExistente) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
    }
    
    // Eliminar reporte
    await prisma.reporte.delete({
      where: { id }
    });
    
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Error al eliminar reporte con ID ${params.id}:`, error);
    return NextResponse.json({ error: 'Error al eliminar reporte' }, { status: 500 });
  }
}