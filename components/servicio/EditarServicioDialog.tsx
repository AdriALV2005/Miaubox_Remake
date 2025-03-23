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

interface EditarServicioDialogProps {
  servicio: {
    id: number;
    plataforma: string;
    precio_vender: string;
    precio_comprar: number;
    num_proveedor: string;
    empresa_proveedor: string;
    fecha_inicio : string;
    fecha_fin: string;
    status: number | string;
  };
  fetchServicios: () => void;
}

export function EditarServicioDialog({
  servicio,
  fetchServicios,
}: EditarServicioDialogProps) {
  const [plataforma, setPlataforma] = useState(servicio.plataforma);
  const [precioVender, setPrecioVender] = useState(servicio.precio_vender);
  const [precioComprar, setPrecioComprar] = useState(servicio.precio_comprar);
  const [numProveedor, setNumProveedor] = useState(servicio.num_proveedor);
  const [empresaProveedor, setEmpresaProveedor] = useState(servicio.empresa_proveedor);
  const [fecha_inicio, setfecha_inicio] = useState(servicio.fecha_inicio);
  const [fecha_fin, setfecha_fin] = useState(servicio.fecha_fin);
  const [status, setStatus] = useState<number | string>(servicio.status);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/servicios/${servicio.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plataforma,
          precio_comprar: precioComprar,
          precio_vender: precioVender,
          num_proveedor: numProveedor,
          empresa_proveedor: empresaProveedor,
          fecha_fin: fecha_fin,
          fecha_inicio: fecha_inicio,
          status,
        }),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar el servicio");
      }
      fetchServicios();
      setIsOpen(false);

      toast.success("Servicio actualizado exitosamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Hubo un error al actualizar el servicio");
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
          <DialogTitle>Editar Servicio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <Label className="mb-3">Plataforma</Label>
            <Input
              type="text"
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label className="mb-3">Precio de Venta</Label>
            <Input
              type="text"
              value={precioVender}
              onChange={(e) => setPrecioVender(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label className="mb-3">Precio de Compra</Label>
            <Input
              type="number"
              value={precioComprar}
              onChange={(e) => setPrecioComprar(Number(e.target.value))}
              required
            />
          </div>

          <div className="mb-4">
            <Label className="mb-3">Número de Proveedor</Label>
            <Input
              type="text"
              value={numProveedor}
              onChange={(e) => setNumProveedor((e.target.value))}
              required
            />
          </div>
          <div className="mb-4">
            <Label className="mb-3">Nombre de la empresa</Label>
            <Input
              type="text"
              value={empresaProveedor}
              onChange={(e) => setEmpresaProveedor((e.target.value))}
              required
            />
          </div>

          <div className="mb-4">
            <Label className="mb-3">Fecha de fecha inicio</Label>
            <Input
              type="date"
              value={
                fecha_inicio
                  ? new Date(fecha_inicio).toISOString().substring(0, 10)
                  : ""
              }
              onChange={(e) => setfecha_inicio(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label className="mb-3">Fecha de fin</Label>
            <Input
              type="date"
              value={
                fecha_fin
                  ? new Date(fecha_fin).toISOString().substring(0, 10)
                  : ""
              }
              onChange={(e) => setfecha_fin(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label className="mb-3">Status</Label>
            <Input
              type="number"
              value={status}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setStatus(isNaN(value) ? 1 : value);
              }}
              required
            />
          </div>

          <Button type="submit">Guardar Cambios</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
