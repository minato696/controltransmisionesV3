import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log('Endpoint /api/reportes/add recibió una solicitud POST');
    
    const reportesData = await request.json();
    console.log('Datos recibidos:', reportesData);
    
    if (!Array.isArray(reportesData)) {
      console.error('Se esperaba un array, pero se recibió:', typeof reportesData);
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
      
      console.log(`Procesando reporte para filial ${filialId}, programa ${programaId}, fecha ${fecha}`);
      
      // Buscar o crear el estado
      let estadoId;
      
      // Normalizar el estado para la búsqueda
      const estadoNombre = estadoTransmision || 
                          (estado === 'si' ? 'Si' : 
                           estado === 'no' ? 'No' : 
                           estado === 'tarde' ? 'Tarde' : 'Pendiente');
      
      console.log('Buscando estado:', estadoNombre);
      
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
      
      console.log('ID de estado encontrado:', estadoId);
      
      // Si no se encontró ningún estado, retornar error
      if (!estadoId) {
        return NextResponse.json({ 
          error: 'No se pudo determinar el estado. Verifica que los estados estén inicializados.' 
        }, { status: 400 });
      }
      
      // Buscar el target si existe
      let targetId = null;
      
      if (target) {
        console.log('Buscando target:', target);
        
        const targetDB = await prisma.target.findFirst({
          where: { codigo: target }
        });
        
        if (targetDB) {
          targetId = targetDB.id;
          console.log('ID de target encontrado:', targetId);
        }
      }
      
      // Verificar si ya existe un reporte para esta combinación
      console.log('Verificando si el reporte ya existe...');
      
      const reporteExistente = await prisma.reporte.findUnique({
        where: {
          filialId_programaId_fecha: {
            filialId: Number(filialId),
            programaId: Number(programaId),
            fecha: new Date(fecha)
          }
        }
      });
      
      let reporte;
      
      if (reporteExistente) {
        console.log('Actualizando reporte existente con ID:', reporteExistente.id);
        
        // Actualizar reporte existente
        reporte = await prisma.reporte.update({
          where: { id: reporteExistente.id },
          data: {
            estadoId,
            targetId: targetId,
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
        console.log('Creando nuevo reporte');
        
        // Crear nuevo reporte
        reporte = await prisma.reporte.create({
          data: {
            filialId: Number(filialId),
            programaId: Number(programaId),
            fecha: new Date(fecha),
            estadoId,
            targetId: targetId,
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
      
      console.log('Reporte guardado correctamente con ID:', reporte.id);
      
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
    
    console.log(`Se procesaron ${reportesCreados.length} reportes correctamente`);
    return NextResponse.json(reportesCreados, { status: 201 });
  } catch (error) {
    console.error('Error al crear reportes:', error);
    return NextResponse.json({ 
      error: 'Error al crear reportes',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}