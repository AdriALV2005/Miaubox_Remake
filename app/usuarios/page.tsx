"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CrearUsuarioDialog } from "@/components/usuario/CrearUsuario";
import { EditarUsuarioDialog } from "@/components/usuario/EditarUsuarioDialog";
import { ConfirmarEliminacionDialog } from "@/components/usuario/ConfirmarEliminacionDialog";
import { Usuario } from "@/types/usuario";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch("/api/usuarios");
      if (!response.ok) {
        throw new Error("Error al obtener los usuarios");
      }
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <CrearUsuarioDialog fetchUsuarios={fetchUsuarios} />
      </div>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Observación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.id}</TableCell>
                <TableCell>{usuario.telefono}</TableCell>
                <TableCell>
                  {(() => {
                    const displayedStatus =
                      usuario.status === 1 ? "Activo" : "Inactivo";
                    const statusColorClass =
                      usuario.status === 1
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800";

                    return (
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${statusColorClass}`}
                      >
                        {displayedStatus}
                      </span>
                    );
                  })()}
                </TableCell>
                <TableCell>{usuario.observacion}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <EditarUsuarioDialog
                      usuario={usuario}
                      fetchUsuarios={fetchUsuarios}
                    />
                    <ConfirmarEliminacionDialog
                      usuarioId={usuario.id}
                      fetchUsuarios={fetchUsuarios}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
