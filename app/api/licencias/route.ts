import { NextResponse } from "next/server";
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
    const { user_id, servicio_id, status,correo ,contraseña ,inicio, fin } = body;

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
      { error: "Error al crear el licencia" },
      { status: 500 }
    );
  }
}
