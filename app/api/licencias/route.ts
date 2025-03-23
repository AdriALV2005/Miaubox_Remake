import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const licencias = await prisma.licencia.findMany();
    return NextResponse.json(licencias, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener licencias" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, servicio_id, status, correo, contraseña, inicio, fin } =
      body;

    const nuevoLicencia = await prisma.licencia.create({
      data: {
        user_id,
        servicio_id,
        status,
        correo,
        contraseña,
        inicio: new Date(inicio),
        fin: new Date(fin),
      },
    });

    return NextResponse.json(nuevoLicencia, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear la licencia" },
      { status: 500 }
    );
  }
}

// Endpoint PUT modificado para leer el id desde el body y actualizar todos los campos
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      user_id,
      servicio_id,
      status,
      correo,
      contraseña,
      inicio,
      fin,
    } = body;

    if (!id || !inicio || !fin) {
      return NextResponse.json(
        { error: "Los campos id, inicio y fin son requeridos" },
        { status: 400 }
      );
    }

    const updatedLicencia = await prisma.licencia.update({
      where: { id: Number(id) },
      data: {
        user_id,
        servicio_id,
        status,
        correo,
        contraseña,
        inicio: new Date(inicio),
        fin: new Date(fin),
      },
    });

    return NextResponse.json(updatedLicencia, { status: 200 });
  } catch (error: any) {
    console.error("Error updating licencia:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar la licencia" },
      { status: 500 }
    );
  }
}
