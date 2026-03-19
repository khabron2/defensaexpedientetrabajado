export type ExpedienteStatus = string;

export interface TimelineEvent {
  id: string;
  status: ExpedienteStatus;
  date: string;
  notes?: string;
}

export interface Empresa {
  nombre: string;
}

export interface Expediente {
  id: string;
  numero: string;
  fechaCreacion: string;
  fechaModificacion: string;
  denunciante: {
    nombre: string;
    dni: string;
    telefono: string;
    email: string;
    calle: string;
    numero: string;
    barrio: string;
    entreCalle1: string;
    entreCalle2: string;
  };
  empresas: Empresa[];
  motivoReclamo: string;
  peticiones: string;
  estado: ExpedienteStatus;
  timeline: TimelineEvent[];
  documentos: string[]; // URLs or base64
  fechaAudiencia?: string;
}

export interface Audiencia {
  id: string;
  expedienteId: string;
  fecha: string; // ISO date
  hora: "08:00" | "09:00" | "10:00" | "11:00" | "12:00";
  espacio: 1 | 2;
  denunciante: string;
  denunciado: string;
}

export interface Notificacion {
  id: string;
  fechaIngreso: string;
  ref: string;
  anio: string;
  area: string;
  departamento: string;
  tipo: string;
  dirigidoA: string;
  contra: string;
  fechaAudiencia: string;
  notificador: string;
  notificado: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: "admin" | "staff";
}

export interface AppSettings {
  proximoNumero: number;
}
