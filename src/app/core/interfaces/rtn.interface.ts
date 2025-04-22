export interface ObligadoTributario {
  rtn: string;
  nombre: string;
  nombreComercial: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface VentasBrutas {
  rtn: string;
  periodo: string;
  monto: number;
  fecha: string;
}

export interface RtnResponse {
  data: {
    obligadoTributario: ObligadoTributario;
  };
  isSuccess: boolean;
  message: string | null;
}

export interface VentasBrutasResponse {
  data: VentasBrutas[];
  isSuccess: boolean;
  message: string | null;
}
