import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const ingresos = await prisma.ingreso.findMany({
      include: {
        licencia: {
          include: {
            usuario: true,
            servicio: true,
          },
        },
      },
    });
    return NextResponse.json(ingresos, { status: 200 });
  } catch (error) {
    console.error("Error al obtener los ingresos:", error);
    return NextResponse.json(
      { error: "Error al obtener los ingresos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { licencia_id, detalles, monto_ingreso } = body;

    const nuevoRegistro = await prisma.ingreso.create({
      data: {
        licencia_id,
        detalles,
        monto_ingreso,
      },
    });

    return NextResponse.json(nuevoRegistro, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear el ingreso" },
      { status: 500 }
    );
  }
}
