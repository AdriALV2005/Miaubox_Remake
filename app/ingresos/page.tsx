"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatearFecha } from "@/utils/util";
import { Ingreso } from "@/types/ingreso"; // Asegúrate de que la interfaz esté correctamente importada
import { Egreso } from "@/types/egreso"; // Asegúrate de que la interfaz esté correctamente importada
import { Button } from "@/components/ui/button";
import { CrearEgresoDialog } from "@/components/usuario/CrearEgreso";
import { ModalVerMas } from "@/components/ingreso/ModalVerMas"; // Asegúrate de tener un componente de modal

export default function IngresosPage() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [selectedIngreso, setSelectedIngreso] = useState<Ingreso | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchIngresos = async () => {
    try {
      const response = await fetch("/api/ingresos");
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error("Error al obtener los ingresos");
      }
      const data = await response.json();
      setIngresos(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchEgresos = async () => {
    try {
      const response = await fetch("/api/egresos");
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error("Error al obtener los egresos");
      }
      const data = await response.json();
      setEgresos(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchIngresos();
    fetchEgresos();
  }, []);

  const handleVerMas = (ingreso: Ingreso) => {
    setSelectedIngreso(ingreso);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIngreso(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Tabla de Ingresos */}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ingresos</h1>
      </div>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Detalles</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingresos.map((ingreso) => (
              <TableRow key={ingreso.id}>
                <TableCell>{ingreso.id}</TableCell>
                <TableCell>{ingreso.licencia.usuario.observacion}</TableCell>
                <TableCell>{ingreso.licencia.servicio.plataforma}</TableCell>
                <TableCell>{ingreso.detalles}</TableCell>
                <TableCell>{ingreso.monto_ingreso}</TableCell>
                <TableCell>
                  <Button onClick={() => handleVerMas(ingreso)}>Ver más</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <br />

      {/* Tabla de Egresos */}
      <div className="flex justify-between items-center mb-6">
        
        <h1 className="text-2xl font-bold">Egresos</h1>
      </div>
       {/* Crear Egreso */}
       <div>
        <CrearEgresoDialog fetchEgresos={fetchEgresos} />
      </div>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Detalles</TableHead>
              <TableHead>Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {egresos.map((egreso) => (
              <TableRow key={egreso.id}>
                <TableCell>{egreso.id}</TableCell>
                <TableCell>{egreso.servicio.plataforma}</TableCell>
                <TableCell>{egreso.detalles}</TableCell>
                <TableCell>{egreso.monto_egreso}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <br />

     

      {/* Modal Ver Más */}
      {isModalOpen && selectedIngreso && (
        <ModalVerMas
          selectedIngreso={selectedIngreso}
          handleCloseModal={handleCloseModal}
        />
      )}
    </div>
  );
}
