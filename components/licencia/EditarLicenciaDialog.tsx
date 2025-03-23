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
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface EditarLicenciaDialogProps {
  licencia: {
    id: number;
    user_id: number;
    servicio_id: number;
    status: number | string;
    correo: string;
    contraseña: string;
    inicio: string;
    fin: string;
  };
  fetchLicencias: () => void;
}

export function EditarLicenciaDialog({
  licencia,
  fetchLicencias,
}: EditarLicenciaDialogProps) {
  const [usuariosActivos, setUsuariosActivos] = useState<Usuario[]>([]);
  const [serviciosActivos, setServiciosActivos] = useState<Servicio[]>([]);

  const [user_id, setUser_id] = useState(licencia.user_id);
  const [servicio_id, setServicio_id] = useState(licencia.servicio_id);
  const [status, setStatus] = useState<number | string>(licencia.status);
  const [correo, setCorreo] = useState(licencia.correo);
  const [contraseña, setContraseña] = useState(licencia.contraseña);
  const [inicio, setInicio] = useState(licencia.inicio);
  const [fin, setFin] = useState(licencia.fin);

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
        console.error("Error al cargar usuarios/servicios:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/licencias/${licencia.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          servicio_id,
          status,
          correo,
          contraseña,
          inicio,
          fin,
        }),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar la licencia");
      }
      fetchLicencias();
      setIsOpen(false);
      toast.success("Licencia actualizada exitosamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Hubo un error al actualizar la licencia");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-blue-600">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar licencia</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-3">Usuario (activo)</Label>
            <select
              className="border rounded px-2 py-1"
              value={user_id}
              onChange={(e) => setUser_id(Number(e.target.value))}
              required
            >
              <option value={0}>Seleccionar</option>
              {usuariosActivos.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.observacion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="mb-3">Servicio (activo)</Label>
            <select
              className="border rounded px-2 py-1"
              value={servicio_id}
              onChange={(e) => setServicio_id(Number(e.target.value))}
              required
            >
              <option value={0}>Seleccionar</option>
              {serviciosActivos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.plataforma}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="mb-3">Status</Label>
            <select
              className="border rounded px-2 py-1"
              value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
              required
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </div>

          <div>
            <Label className="mb-3">Correo</Label>
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

          <div>
            <Label className="mb-3">Inicio</Label>
            <Input
              type="date"
              value={inicio ? inicio.substring(0, 10) : ""}
              onChange={(e) => setInicio(e.target.value)}
              required
            />
          </div>

          <div>
            <Label className="mb-3">Fin</Label>
            <Input
              type="date"
              value={fin ? fin.substring(0, 10) : ""}
              onChange={(e) => setFin(e.target.value)}
              required
            />
          </div>

          <Button type="submit">Guardar Cambios</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
