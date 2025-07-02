import { NextResponse } from 'next/server';
import { getBarbershopData } from '@/app/_actions/get-barbershop-data';

export async function GET() {
  const barbershop = await getBarbershopData();
  if (!barbershop) {
    return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 });
  }
  return NextResponse.json(barbershop);
}
