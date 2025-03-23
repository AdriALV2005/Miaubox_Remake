"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; 

interface ConfirmarEliminacionDialogProps {
  licenciaId: number;
  fetchLicencias: () => void;
}

export function ConfirmarEliminacionDialog({
  licenciaId,
  fetchLicencias,
}: ConfirmarEliminacionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEliminar = async () => {
    try {
      const response = await fetch(`/api/licencias/${licenciaId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Error al eliminar el licencia");
      }
      fetchLicencias();
      setIsOpen(false);

      toast.success("licencia eliminado correctamente");
    } catch (error) {
      console.error("Error:", error);

      toast.error("Hubo un error al eliminar la licencia");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-red-600">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
        </DialogHeader>
        <p className="mb-4">
          ¿Estás seguro de que deseas eliminar esta licencia? Esta acción no se
          puede deshacer.
        </p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleEliminar}>
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
