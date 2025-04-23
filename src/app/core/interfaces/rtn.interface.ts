export interface ObligadoTributario {
  rtn: string;
  nombre: string;
  nombreComercial: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface VentasBrutasData {
  anio: string;
  importeTotalVentas: number;
}

export interface RtnResponse {
  data: {
    obligadoTributario: ObligadoTributario;
  };
  isSuccess: boolean;
  message: string | null;
}

export interface VentasBrutasResponse {
  data: {
    ventasBrutas: VentasBrutasData;
  };
  isSuccess: boolean;
  message: string | null;
}

export interface VentasBrutasRequest {
  Rtn: string;
  PeriodoDesde: string;
  PeriodoHasta: string;
}
