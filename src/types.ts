export interface Company {
  nombre: string;
  domicilio: string;
}

export interface StateHistory {
  estado: string;
  usuario: string;
  fecha: string;
}

export interface Case {
  id: string;
  numeroexpediente: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono?: string;
  email?: string;
  barrio: string;
  calle: string;
  numeracion: string;
  entrecalle1: string;
  entrecalle2: string;
  localidad: string;
  departamento: string;
  tipo: 'Servicio' | 'Producto';
  caracteristicas: string;
  empresasDenunciadas: Company[];
  reclamo: string;
  peticiones: string;
  fechaAudiencia: string;
  estado: string;
  usuario: string;
  historialEstados: StateHistory[];
}

export interface User {
  usuario: string;
  nombre: string;
}
