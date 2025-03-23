"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CrearServicioDialog } from "@/components/servicio/CrearServicio";
import { EditarServicioDialog } from "@/components/servicio/EditarServicioDialog";
import { ConfirmarEliminacionDialog } from "@/components/servicio/ConfirmarEliminacionDialog";
import { Servicio } from "@/types/servicio";
import { formatearFecha } from "@/utils/util";

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const fetchServicios = async () => {
    try {
      const response = await fetch("/api/servicios");
      if (!response.ok) throw new Error("Error al obtener los servicios");
      const data = await response.json();
      setServicios(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Servicios</h1>
        <CrearServicioDialog fetchServicios={fetchServicios} />
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Precio a vender</TableHead>
              <TableHead>Precio a comprar</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Empresa proveedora</TableHead>
              <TableHead>Fecha inicio</TableHead>
              <TableHead>Fecha fin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {servicios.map((servicio) => (
              <TableRow key={servicio.id}>
                <TableCell>{servicio.id}</TableCell>
                <TableCell>{servicio.plataforma}</TableCell>
                <TableCell>{servicio.precio_vender}</TableCell>
                <TableCell>{servicio.precio_comprar}</TableCell>
                <TableCell>{servicio.num_proveedor}</TableCell>
                <TableCell>{servicio.empresa_proveedor}</TableCell>
                <TableCell>{formatearFecha(servicio.fecha_fin)}</TableCell>
                <TableCell>{formatearFecha(servicio.fecha_inicio)}</TableCell>
                <TableCell>
                  {(() => {
                    const displayedStatus =
                      servicio.status === 1 ? "Activo" : "Inactivo";
                    const statusColorClass =
                      servicio.status === 1
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800";

                    return (
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${statusColorClass}`}
                      >
                        {displayedStatus}
                      </span>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <EditarServicioDialog
                      servicio={servicio}
                      fetchServicios={fetchServicios}
                    />
                    <ConfirmarEliminacionDialog
                      servicioId={servicio.id}
                      fetchServicios={fetchServicios}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
