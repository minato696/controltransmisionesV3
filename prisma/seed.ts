import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
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

  for (const dia of diasSemana) {
    await prisma.diaSemana.upsert({
      where: { nombre: dia.nombre },
      update: {},
      create: dia,
    });
  }
  console.log('Días de la semana creados');

  // Crear estados de transmisión
  const estados = [
    { nombre: 'Pendiente' },
    { nombre: 'Si' },
    { nombre: 'No' },
    { nombre: 'Tarde' }
  ];

  for (const estado of estados) {
    await prisma.estadoTransmision.upsert({
      where: { nombre: estado.nombre },
      update: {},
      create: estado,
    });
  }
  console.log('Estados de transmisión creados');

  // Crear targets/motivos
  const targets = [
    { codigo: 'Fta', nombre: 'Falta', tipo: 'no_transmitio' },
    { codigo: 'Enf', nombre: 'Enfermedad', tipo: 'no_transmitio' },
    { codigo: 'P.Tec', nombre: 'Problema técnico', tipo: 'ambos' },
    { codigo: 'F.Serv', nombre: 'Falla de servicios', tipo: 'ambos' },
    { codigo: 'Tde', nombre: 'Tarde', tipo: 'transmitio_tarde' },
    { codigo: 'Otro', nombre: 'Otro', tipo: 'ambos' }
  ];

  for (const target of targets) {
    await prisma.target.upsert({
      where: { codigo: target.codigo },
      update: {},
      create: target,
    });
  }
  console.log('Targets creados');

  console.log('Base de datos inicializada con datos de referencia');
  console.log('Las filiales y programas deberán ser creados desde el frontend');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });