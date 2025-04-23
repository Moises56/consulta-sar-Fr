export interface ObligadoTributario {
  rtn: string;
  nombre: string;
  nombreComercial: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  // Nuevos campos para la información detallada
  fechaInicioActividad?: string;
  departamento?: {
    descripcion: string;
    departamentoId?: string;
  };
  actividadPrimaria?: {
    descripcion: string;
    actividadId: string;
  };
  actividadSecundaria?: {
    descripcion: string;
    actividadId: string;
  };
  // Campos para la dirección detallada
  barrio?: string;
  calleAvenida?: string;
  numeroCasa?: string;
  bloque?: string;
  sector?: string;
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
