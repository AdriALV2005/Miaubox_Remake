export interface Ingreso {
  id: number;
  licencia_id: number;
  detalles: string;
  monto_ingreso: number;
  fecha: string;
  licencia: {
    usuario: {
      observacion: string;
    };
    inicio: string;
    fin: string;
    servicio: {
      plataforma: string;
    };
  };
}
