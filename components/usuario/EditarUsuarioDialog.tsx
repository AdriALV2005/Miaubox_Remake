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
import { Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EditarUsuarioDialogProps {
  usuario: {
    id: number;
    telefono: string;
    status: number | string;
    observacion: string;
  };
  fetchUsuarios: () => void;
}

export function EditarUsuarioDialog({
  usuario,
  fetchUsuarios,
}: EditarUsuarioDialogProps) {
  const [telefono, setTelefono] = useState(usuario.telefono);
  const [status, setStatus] = useState<number>(Number(usuario.status));
  const [observacion, setObservacion] = useState(usuario.observacion);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telefono,
          status,
          observacion,
        }),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar el usuario");
      }
      fetchUsuarios();
      setIsOpen(false);

      toast.success("Usuario actualizado exitosamente");
    } catch (error) {
      console.error("Error:", error);

      toast.error("Hubo un error al actualizar el usuario");
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
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <Label className="mb-3">Teléfono</Label>
            <Input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Label className="mb-3">Status</Label>
            <select
              className={`border rounded px-2 py-1 ${status === 1 ? 'text-green-600' : 'text-red-600'}`}
              value={status}
              onChange={(e) => {
                setStatus(parseInt(e.target.value, 10));
              }}
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </div>
          <div className="mb-4">
            <Label className="mb-3">Observación</Label>
            <Input
              type="text"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Guardar Cambios</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
