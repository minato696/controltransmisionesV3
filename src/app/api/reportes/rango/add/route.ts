import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const reportesData = await request.json();
    
    if (!Array.isArray(reportesData)) {
      return NextResponse.json({ error: 'Se espera un array de reportes' }, { status: 400 });
    }
    
    const reportesCreados = [];
    
    for (const reporteData of reportesData) {
      const { 
        filialId, 
        programaId, 
        fecha, 
        estado, 
        estadoTransmision, 
        target, 
        motivo, 
        hora, 
        horaReal, 
        hora_tt, 
        observaciones 
      } = reporteData;
      
      // Validar campos obligatorios
      if (!filialId || !programaId || !fecha) {
        return NextResponse.json({ 
          error: 'Faltan campos obligatorios (filialId, programaId, fecha)' 
        }, { status: 400 });
      }
      
      // Buscar o crear el estado
      let estadoId: number | undefined;
      
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
      } else {
        // Si no existe el estado, usar el estado "Pendiente"
        const estadoPendiente = await prisma.estadoTransmision.findFirst({
          where: { nombre: 'Pendiente' }
        });
        estadoId = estadoPendiente?.id;
      }
      
      // Si no se encontró ningún estado, retornar error
      if (!estadoId) {
        return NextResponse.json({ 
          error: 'No se pudo determinar el estado. Verifica que los estados estén inicializados.' 
        }, { status: 400 });
      }
      
      // Buscar el target si existe
      let targetId: number | undefined;
      
      if (target) {
        const targetDB = await prisma.target.findFirst({
          where: { codigo: target }
        });
        
        if (targetDB) {
          targetId = targetDB.id;
        }
      }
      
      // Verificar si ya existe un reporte para esta combinación
      const reporteExistente = await prisma.reporte.findUnique({
        where: {
          filialId_programaId_fecha: {
            filialId: parseInt(filialId),
            programaId: parseInt(programaId),
            fecha: new Date(fecha)
          }
        }
      });
      
      let reporte;
      
      if (reporteExistente) {
        // Actualizar reporte existente
        reporte = await prisma.reporte.update({
          where: { id: reporteExistente.id },
          data: {
            estadoId,
            targetId: targetId || null,
            motivo: motivo || null,
            hora: horaReal || hora || null,
            horaTt: hora_tt || null,
            observaciones: observaciones || null,
            updatedAt: new Date()
          },
          include: {
            filial: true,
            programa: true,
            estado: true,
            target: true
          }
        });
      } else {
        // Crear nuevo reporte
        reporte = await prisma.reporte.create({
          data: {
            filialId: parseInt(filialId),
            programaId: parseInt(programaId),
            fecha: new Date(fecha),
            estadoId,
            targetId: targetId || null,
            motivo: motivo || null,
            hora: horaReal || hora || null,
            horaTt: hora_tt || null,
            observaciones: observaciones || null
          },
          include: {
            filial: true,
            programa: true,
            estado: true,
            target: true
          }
        });
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
      
      reportesCreados.push(reporteTransformado);
    }
    
    return NextResponse.json(reportesCreados, { status: 201 });
  } catch (error) {
    console.error('Error al crear reportes:', error);
    return NextResponse.json({ error: 'Error al crear reportes' }, { status: 500 });
  }
}