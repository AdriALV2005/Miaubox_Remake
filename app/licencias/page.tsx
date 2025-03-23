"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmarEliminacionDialog } from "@/components/licencia/ConfirmarEliminacionDialog";
import { CrearLicenciaDialog } from "@/components/licencia/CrearLicencia";
import { EditarLicenciaDialog } from "@/components/licencia/EditarLicenciaDialog";
import { Licencia } from "@/types/licencia";
import { Usuario } from "@/types/usuario";
import { Servicio } from "@/types/servicio";
import {
  formatearFecha,
  getServicioPlataforma,
  getStatusClassName,
  getUsuarioObservacion,
} from "@/utils/util";
import { Button } from "@/components/ui/button";

export default function LicenciasPage() {
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const fetchLicencias = async () => {
    try {
      const response = await fetch("/api/licencias");
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error("Error al obtener las licencias");
      }
      const data = await response.json();
      setLicencias(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch("/api/usuarios?status=1");
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchServicios = async () => {
    try {
      const res = await fetch("/api/servicios?status=1");
      const data = await res.json();
      setServicios(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRenovar = async (licencia: Licencia) => {
    try {
      const selectedServicio = servicios.find(
        (s) => s.id === licencia.servicio_id
      );
      if (!selectedServicio) {
        throw new Error("Servicio no encontrado");
      }

      const nuevaFechaInicio = new Date(licencia.inicio);
      nuevaFechaInicio.setMonth(nuevaFechaInicio.getMonth() + 1);

      const nuevaFechaFin = new Date(licencia.fin);
      nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + 1);

      // Cambia la ruta para llamar al endpoint fijo
      const response = await fetch(`/api/licencias`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: licencia.id,
          inicio: nuevaFechaInicio.toISOString(),
          fin: nuevaFechaFin.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al renovar la licencia");
      }

      await fetch("/api/ingresos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licencia_id: licencia.id,
          detalles: `RENOVACIÓN LICENCIA`,
          monto_ingreso: selectedServicio.precio_vender,
        }),
      });

      fetchLicencias();
      toast.success("Licencia renovada exitosamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Hubo un error al renovar la licencia");
    }
  };

  useEffect(() => {
    fetchLicencias();
    fetchUsuarios();
    fetchServicios();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Licencias</h1>
        <CrearLicenciaDialog fetchLicencias={fetchLicencias} />
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Contraseña</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {licencias.map((licencia) => (
              <TableRow key={licencia.id}>
                <TableCell>{licencia.id}</TableCell>
                <TableCell>
                  {getUsuarioObservacion(usuarios, licencia.user_id)}
                </TableCell>
                <TableCell>
                  {getServicioPlataforma(servicios, licencia.servicio_id)}
                </TableCell>
                <TableCell>{formatearFecha(licencia.inicio)}</TableCell>
                <TableCell>{formatearFecha(licencia.fin)}</TableCell>
                <TableCell>
                  <span
                    className={getStatusClassName(
                      licencia.status === 1 ? "Activo" : "Inactivo"
                    )}
                  >
                    {licencia.status === 1 ? "Activo" : "Inactivo"}
                  </span>
                </TableCell>
                <TableCell>{licencia.correo}</TableCell>
                <TableCell>{licencia.contraseña}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <EditarLicenciaDialog
                      licencia={licencia}
                      fetchLicencias={fetchLicencias}
                    />
                    <ConfirmarEliminacionDialog
                      licenciaId={licencia.id}
                      fetchLicencias={fetchLicencias}
                    />
                    <Button onClick={() => handleRenovar(licencia)}>
                      Renovar
                    </Button>
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
