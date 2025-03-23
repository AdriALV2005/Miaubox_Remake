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

export function CrearServicioDialog({
  fetchServicios,
}: {
  fetchServicios: () => void;
}) {
  const [plataforma, setPlataforma] = useState("");
  const [status, setStatus] = useState<number>(1);
  const [precio_vender, setPrecioVender] = useState("");
  const [precio_comprar, setPrecioComprar] = useState("");
  const [num_proveedor, setNumProveedor] = useState("");
  const [empresa_proveedor, setEmpresaProveedor] = useState("");
  const [fecha_fin, setFechafecha_fin] = useState("");
  const [fecha_inicio, setFechaInicio] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/servicios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plataforma,
          status,
          precio_vender,
          precio_comprar,
          num_proveedor,
          empresa_proveedor,
          fecha_fin: new Date(fecha_fin).toISOString(),
          fecha_inicio: new Date(fecha_inicio).toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear el servicio");
      }

      fetchServicios();
      setPlataforma("");
      setStatus(1);
      setPrecioVender("");
      setPrecioComprar("");
      setNumProveedor("");
      setFechafecha_fin("");
      setIsOpen(false);

      toast.success("Servicio creado exitosamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Hubo un error al crear el servicio");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Crear nuevo servicio</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo servicio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-3">Plataforma</Label>
              <Input
                type="text"
                value={plataforma}
                onChange={(e) => setPlataforma(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-3">Precio a vender</Label>
              <Input
                type="text"
                value={precio_vender}
                onChange={(e) => setPrecioVender(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-3">Precio a comprar</Label>
              <Input
                type="text"
                value={precio_comprar}
                onChange={(e) => setPrecioComprar(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-3">Proveedor</Label>
              <Input
                type="text"
                value={num_proveedor}
                onChange={(e) => setNumProveedor(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-3">Empresa prov</Label>
              <Input
                type="text"
                value={empresa_proveedor}
                onChange={(e) => setEmpresaProveedor(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-3">Fecha de fin</Label>
              <Input
                type="date"
                value={fecha_fin}
                onChange={(e) => setFechafecha_fin(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-3">Fecha de inicio</Label>
              <Input
                type="date"
                value={fecha_inicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-3">Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(parseInt(e.target.value))}
              >
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
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
