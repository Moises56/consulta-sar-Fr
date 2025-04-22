export interface DatosAMDC {
  id: string;
  RTN: string;
  ICS: string;
  NOMBRE: string;
  NOMBRE_COMERCIAL: string;
  ANIO: number;
  CANTIDAD_DECLARADA: number;
  ESTATUS: number;
  FECHA: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatosAMDCFilters {
  RTN?: string;
  ICS?: string;
  ANIO?: number;
  NOMBRE?: string;
  NOMBRE_COMERCIAL?: string;
  ESTATUS?: number;
  page?: number;
  limit?: number;
}
