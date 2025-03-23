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
    precio_vender: number;
    precio_comprar: number;
    num_proveedor: number; // Considera cambiar a string si así es el modelo
    empresa_proveedor: string;
    fecha_inicio: string;
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
  // Convertir numProveedor a string para que coincida con el modelo Prisma
  const [numProveedor, setNumProveedor] = useState(
    servicio.num_proveedor.toString()
  );
  const [empresaProveedor, setEmpresaProveedor] = useState(
    servicio.empresa_proveedor
  );
  const [fecha_inicio, setfecha_inicio] = useState(servicio.fecha_inicio);
  const [fecha_fin, setfecha_fin] = useState(servicio.fecha_fin);
  const [status, setStatus] = useState<number | string>(servicio.status);
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) ? date.toISOString().substring(0, 10) : "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/servicios`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: servicio.id,
          plataforma,
          precio_comprar: precioComprar,
          precio_vender: precioVender,
          num_proveedor: String(numProveedor), // Enviar como string
          empresa_proveedor: empresaProveedor,
          fecha_fin,
          fecha_inicio,
          status,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el servicio");
      }
      fetchServicios();
      setIsOpen(false);
      toast.success("Servicio actualizado exitosamente");
    } catch (error: any) {
      console.error("Error:", error.message);
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
              onChange={(e) => setPrecioVender(Number(e.target.value))}
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
              onChange={(e) => setNumProveedor(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Label className="mb-3">Nombre de la empresa</Label>
            <Input
              type="text"
              value={empresaProveedor}
              onChange={(e) => setEmpresaProveedor(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label className="mb-3">Fecha de inicio</Label>
            <Input
              type="date"
              value={formatDate(fecha_inicio)}
              onChange={(e) => setfecha_inicio(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label className="mb-3">Fecha de fin</Label>
            <Input
              type="date"
              value={formatDate(fecha_fin)}
              onChange={(e) => setfecha_fin(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label className="mb-3">Status</Label>
            <select
              className="border rounded px-2 py-1"
              value={status}
              onChange={(e) => setStatus(parseInt(e.target.value, 10))}
              required
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </div>

          <Button type="submit">Guardar Cambios</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}