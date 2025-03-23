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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Servicio } from "@/types/servicio"; // Importar la interfaz existente

export function CrearEgresoDialog({
  fetchEgresos,
}: {
  fetchEgresos: () => void;
}) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [servicioId, setServicioId] = useState<number>(0);
  const [detalles, setDetalles] = useState<string>("");
  const [montoEgreso, setMontoEgreso] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch servicios activos
  const fetchServicios = async () => {
    try {
      const response = await fetch("/api/servicios");
      if (!response.ok) throw new Error("Error al obtener los servicios");
      const data = await response.json();
      setServicios(data.filter((s: Servicio) => s.status === 1)); // Filtrar servicios activos
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const handleServicioChange = (id: number) => {
    setServicioId(id);
    const servicioSeleccionado = servicios.find((s) => s.id === id);
    if (servicioSeleccionado) {
      setDetalles(`Egreso para el servicio ${servicioSeleccionado.plataforma}`);
      setMontoEgreso(servicioSeleccionado.precio_comprar);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/egresos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          servicio_id: servicioId,
          detalles,
          monto_egreso: montoEgreso,
        }),
      });
      if (!response.ok) {
        throw new Error("Error al crear el egreso");
      }
      fetchEgresos();
      setServicioId(0);
      setDetalles("");
      setMontoEgreso(0);
      setIsOpen(false);

      toast.success("Egreso creado exitosamente");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Hubo un error al crear el egreso");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Crear Egreso</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Egreso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-3">Servicio</Label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={servicioId}
              onChange={(e) => handleServicioChange(Number(e.target.value))}
              required
            >
              <option value={0}>Seleccionar un servicio</option>
              {servicios.map((servicio) => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.plataforma}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-3">Detalles</Label>
            <Input
              type="text"
              value={detalles}
              onChange={(e) => setDetalles(e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-3">Monto del Egreso</Label>
            <Input
              type="number"
              value={montoEgreso}
              onChange={(e) => setMontoEgreso(Number(e.target.value))}
              required
            />
          </div>
          <Button type="submit">Crear</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
