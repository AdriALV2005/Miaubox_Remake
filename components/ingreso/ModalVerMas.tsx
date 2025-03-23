import React from "react";
import { Ingreso } from "@/types/ingreso"; // Asegúrate de que la interfaz esté correctamente importada
import { Button } from "@/components/ui/button";
import { formatearFecha } from "@/utils/util";

interface ModalVerMasProps {
  selectedIngreso: Ingreso;
  handleCloseModal: () => void;
}

export const ModalVerMas: React.FC<ModalVerMasProps> = ({
  selectedIngreso,
  handleCloseModal,
}) => {
  return (
    <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">{selectedIngreso.detalles}</h2>
        <div className="mb-4">
          <p>
            <strong>Código de usuario:</strong> {selectedIngreso.id}
          </p>
          <hr className="my-2" />
          <p>
            <strong>Nombre del Usuario:</strong>{" "}
            {selectedIngreso.licencia.usuario.observacion}
          </p>
          <hr className="my-2" />
          <p>
            <strong>Plataforma :</strong>{" "}
            {selectedIngreso.licencia.servicio.plataforma}
          </p>
          <hr className="my-2" />
          <p>
            <strong>Monto:</strong> {selectedIngreso.monto_ingreso}
          </p>
        </div>
        {selectedIngreso.detalles.includes("RENOVACIÓN") && (
          <div className="mb-4">
            <p>
              <strong>Fecha de Inicio de la renovación:</strong>{" "}
              {formatearFecha(selectedIngreso.licencia.inicio)}
            </p>
            <hr className="my-2" />
            <p>
              <strong>Fecha de Fin de la renovación:</strong>{" "}
              {formatearFecha(selectedIngreso.licencia.fin)}
            </p>
          </div>
        )}
        <div className="flex justify-end">
          <Button
            onClick={handleCloseModal}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
