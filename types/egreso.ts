export interface Egreso {
  id: number;
  servicio_id: number;
  detalles: string;
  monto_egreso: number;
  servicio:{
    plataforma: string;
  }
}