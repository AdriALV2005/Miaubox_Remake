import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const servicios = await prisma.servicio.findMany();
    return NextResponse.json(servicios, { status: 200 });
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    return NextResponse.json(
      { error: "Error al obtener servicios" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      plataforma,
      status,
      precio_vender,
      precio_comprar,
      num_proveedor,
      empresa_proveedor,
      fecha_fin,
      fecha_inicio,
    } = body;

    const nuevoServicio = await prisma.servicio.create({
      data: {
        plataforma,
        status: parseInt(status),
        precio_vender,
        precio_comprar,
        num_proveedor,
        fecha_fin: new Date(fecha_fin),
        fecha_inicio: new Date(fecha_inicio),
        empresa_proveedor,
      },
    });

    return NextResponse.json(nuevoServicio, { status: 201 });
  } catch (error) {
    console.error("Error al crear el servicio:", error);
    return NextResponse.json(
      { error: "Error al crear el servicio" },
      { status: 500 }
    );
  }
}
