export interface ConsultaVb {
  id?: string;
  userId?: string;
  rtn: string;
  nombreComercial: string;
  anio: string;
  importeTotalVentas: number;
  declaracionesAmdc: DeclaracionAmdc[];
  diferencia: number;
  analisis: string;
  fechaConsulta: string;
}

export interface DeclaracionAmdc {
  cantidadDeclarada: string;
  estatus: string;
  fecha: string;
}

export interface ConsultasVbResponse {
  data: ConsultaVb[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ConsultaVbResponse {
  id: string;
  userId: string;
  rtn: string;
  nombreComercial: string;
  anio: string;
  importeTotalVentas: number;
  declaracionesAmdc: string | DeclaracionAmdc[];
  diferencia: number;
  analisis: string;
  fechaConsulta: string;
}

export interface ConsultaVbDeleteResponse {
  message: string;
}