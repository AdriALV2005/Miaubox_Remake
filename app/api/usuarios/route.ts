import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany();
    return NextResponse.json(usuarios, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { telefono, status, observacion } = body;

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        telefono,
        status: parseInt(status),
        observacion,
      },
    });

    return NextResponse.json(nuevoUsuario, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    );
  }
}
