export interface DatosAmdcResponse {
  data: DatosAmdc[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface DatosAmdc {
  id: string;
  RTN: string;
  ICS: string;
  NOMBRE: string;
  NOMBRE_COMERCIAL: string;
  ANIO: number;
  CANTIDAD_DECLARADA: string;
  ESTATUS: number;
  FECHA: string;
}
