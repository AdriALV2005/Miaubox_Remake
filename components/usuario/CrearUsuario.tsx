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
import { useState } from "react";
import { toast } from "sonner";

export function CrearUsuarioDialog({
  fetchUsuarios,
}: {
  fetchUsuarios: () => void;
}) {
  const [telefono, setTelefono] = useState("");
  const [status, setStatus] = useState<number>(1);
  const [observacion, setObservacion] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
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
        throw new Error("Error al crear el usuario");
      }
      fetchUsuarios();
      setTelefono("");
      setStatus(1);
      setObservacion("");
  
      setIsOpen(false);

      toast.success("Usuario creado exitosamente");
    } catch (error) {
      console.error("Error:", error);

      toast.error("Hubo un error al crear el usuario");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Crear nuevo usuario</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-3">Teléfono</Label>
            <Input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-3">Status</Label>
            <select
              className={`border rounded px-2 py-1 ${
                status === 1 ? 'text-green-600' : 'text-red-600'
              }`}
              value={status}
              onChange={(e) => {
                setStatus(parseInt(e.target.value, 10));
              }}
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </div>
          <div>
            <Label className="mb-3">Observación</Label>
            <Input
              type="text"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit">Crear</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
