import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const egresos = await prisma.egreso.findMany({
      include: {
        servicio: true,
      },
    });
    return NextResponse.json(egresos, { status: 200 });
  } catch (error) {
    console.error("Error al obtener los egresos:", error);
    return NextResponse.json(
      { error: "Error al obtener los egresos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Datos recibidos en la API:", body);

    const { servicio_id, detalles = "PAGO REALIZADO", monto_egreso } = body;

    // Validar los datos requeridos
    if (!servicio_id || !monto_egreso) {
      console.error("Faltan datos requeridos:", {
        servicio_id,
        detalles,
        monto_egreso,
      });
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Crear el registro en la tabla egreso
    const nuevoRegistro = await prisma.egreso.create({
      data: {
        servicio_id,
        detalles,
        monto_egreso: parseFloat(monto_egreso), // Asegurarse de que sea un número
      },
    });

    console.log("Registro creado exitosamente:", nuevoRegistro);

    return NextResponse.json(nuevoRegistro, { status: 201 });
  } catch (error) {
    console.error("Error al crear el egreso:", error);
    return NextResponse.json(
      { error: "Error al crear el egreso" },
      { status: 500 }
    );
  }
}
