// src/app/api/debug/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const diasSemana = await prisma.diaSemana.findMany();
    
    return NextResponse.json({
      diasSemana: diasSemana
    });
  } catch (error) {
    console.error('Error en debug:', error);
    return NextResponse.json({ error: 'Error en debug' }, { status: 500 });
  }
}