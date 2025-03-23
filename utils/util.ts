import { Servicio } from "@/types/servicio";
import { Usuario } from "@/types/usuario";

export const getStatusClassName = (status: string | number): string => {
  const baseClasses = "px-2 py-1 rounded text-sm font-medium";
  const statusClasses = {
    Activo: "bg-green-100 text-green-800",
    Inactivo: "bg-red-100 text-red-800",
    default: "bg-yellow-100 text-yellow-800",
  };
  return `${baseClasses} ${
    statusClasses[status as keyof typeof statusClasses] || statusClasses.default
  }`;
};

export function formatearFecha(fecha: string): string {
  if (!fecha) return "N/A";
  const [datePart] = fecha.split("T");
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year}`;
}

export function getUsuarioObservacion(
  usuarios: Usuario[],
  uid: number
): string {
  const foundUser = usuarios.find((user) => user.id === uid);
  return foundUser ? foundUser.observacion : "Desconocido";
}
export function getServicioPlataforma(
  servicios: Servicio[],
  sid: number
): string {
  const foundServicio = servicios.find((s) => s.id === sid);
  return foundServicio ? foundServicio.plataforma : "Desconocido";
}
