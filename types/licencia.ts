export interface Licencia {
    id: number; 
    user_id: number;
    servicio_id: number; 
    status: number | string; 
    correo: string; 
    contraseña: string; 
    inicio: string; 
    fin: string; 
  }