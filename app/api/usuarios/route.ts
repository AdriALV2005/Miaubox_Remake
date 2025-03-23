import { NextResponse, NextRequest } from "next/server";
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

export async function POST(request: NextRequest) {
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, telefono, status, observacion } = body;

    if (!id) {
      return NextResponse.json(
        { error: "El campo ID es obligatorio" },
        { status: 400 }
      );
    }

    const updatedUsuario = await prisma.usuario.update({
      where: { id: Number(id) },
      data: {
        telefono,
        status: parseInt(status),
        observacion,
      },
    });

    return NextResponse.json(updatedUsuario, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar el usuario" },
      { status: 500 }
    );
  }
}
