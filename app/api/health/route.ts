import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'dpms',
    timestamp: new Date().toISOString(),
  });
}
