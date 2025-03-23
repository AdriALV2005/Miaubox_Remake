"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Servicio } from "@/types/servicio";
import { Usuario } from "@/types/usuario";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function CrearLicenciaDialog({
  fetchLicencias,
}: {
  fetchLicencias: () => void;
}) {
  const [usuariosActivos, setUsuariosActivos] = useState<Usuario[]>([]);
  const [serviciosActivos, setServiciosActivos] = useState<Servicio[]>([]);

  const [user_id, setUserId] = useState<number>(0);
  const [servicio_id, setServicioId] = useState<number>(0);
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resUsuarios = await fetch("/api/usuarios?status=1");
        const resServicios = await fetch("/api/servicios?status=1");

        if (!resUsuarios.ok || !resServicios.ok) {
          throw new Error("Error al cargar datos de usuarios/servicios");
        }

        const dataUsuarios = await resUsuarios.json();
        const dataServicios = await resServicios.json();

        const usuariosConStatus1 = dataUsuarios.filter(
          (u: any) => u.status === 1
        );
        const serviciosConStatus1 = dataServicios.filter(
          (s: any) => s.status === 1
        );

        setUsuariosActivos(usuariosConStatus1);
        setServiciosActivos(serviciosConStatus1);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!correo.endsWith("@miaucode.digital")) {
      toast.error("El correo debe ser de Miaucode (ejemplo@miaucode.digital)");
      return;
    }

    try {
      const selectedServicio = serviciosActivos.find(
        (s) => s.id === servicio_id
      );
      if (!selectedServicio) {
        throw new Error("Servicio no encontrado");
      }

      const response = await fetch("/api/licencias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          servicio_id,
          status: 1, // Estado activo por defecto
          correo,
          contraseña,
          inicio: new Date(inicio).toISOString(),
          fin: new Date(fin).toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear la licencia");
      }

      const licencia = await response.json();

      // Crear un registro en la tabla ingreso solo si la licencia tiene estado activo
      if (licencia.status === 1) {
        const ingresoResponse = await fetch("/api/ingresos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            licencia_id: licencia.id,
            detalles: `CREACIÓN LICENCIA`,
            monto_ingreso: selectedServicio.precio_vender,
          }),
        });

        if (!ingresoResponse.ok) {
          const error = await ingresoResponse.json();
          throw new Error(error.error || "Error al crear el ingreso");
        }

        console.log("Ingreso creado:", await ingresoResponse.json());
      }

      fetchLicencias();
      setUserId(0);
      setServicioId(0);
      setCorreo("");
      setContraseña("");
      setInicio("");
      setFin("");
      setIsOpen(false);

      toast.success("Licencia creada exitosamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Hubo un error al crear la licencia");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Crear nueva licencia</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva Licencia</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-3">Usuario (activo)</Label>
              <select
                className="border rounded px-2 py-1"
                value={user_id}
                onChange={(e) => setUserId(Number(e.target.value))}
                required
              >
                <option value={0}>Seleccionar</option>
                {usuariosActivos.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.id} - {u.observacion}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="mb-3">Servicio (activo)</Label>
              <select
                className="border rounded px-2 py-1"
                value={servicio_id}
                onChange={(e) => setServicioId(Number(e.target.value))}
                required
              >
                <option value={0}>Seleccionar</option>
                {serviciosActivos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} - {s.plataforma}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="mb-3">Fecha de Inicio</Label>
              <Input
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="mb-3">Fecha de Fin</Label>
              <Input
                type="date"
                value={fin}
                onChange={(e) => setFin(e.target.value)}
                required
              />
            </div>

            <div>
              <Label className="mb-3">Correo (solo Gmail)</Label>
              <Input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div>
              <Label className="mb-3">Contraseña</Label>
              <Input
                type="text"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Crear</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
