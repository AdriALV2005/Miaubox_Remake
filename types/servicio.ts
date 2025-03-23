export interface Servicio {
  id: number;
  plataforma: string;
  precio_vender: string;
  precio_comprar: number;
  num_proveedor: number;
  empresa_proveedor: string;
  fecha_inicio: string;
  fecha_fin : string;
  status: number | string;
}