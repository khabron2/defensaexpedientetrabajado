export type ExpedienteStatus =
  | "pasa p/archivos"
  | "pasa p/archivos con acuerdo"
  | "pasa p/archivos solucionado"
  | "pasa p/archivos por acuerdo"
  | "pasa p/ archivo-armario p/ limbo"
  | "pasa p/jurídico p/imputar"
  | "para imputar"
  | "p/asesoría legal dpto jurídico p/evaluación"
  | "pase dpto jurídico p/medida preventiva"
  | "p/dpto jurídico p/ análisis"
  | "sale cedula para la consumidora"
  | "sale cedula p/ la denunciada"
  | "la consumidora se notificó en este org."
  | "reprogramación de audiencia"
  | "incomparecencia de las partes"
  | "expediente no armado, esperando documental"
  | "p/reprogramar"
  | "p/ homologación de la direc."
  | "archivo a despacho p/ copias certificadas"
  | "plazo de 5 días"
  | "plazo de 10 días"
  | "plazo de 20 días"
  | "plazo de 30 días"
  | "plazo de 90 días"
  | "a la espera que responda el consumidor"
  | "las partes informaran el cumplimiento"
  | "a espera que responda la empresa"
  | "la consumidora tiene que informar el cumplimiento"
  | "el consumidor va a venir a firmar la acta"
  | "planteo de recurso jerárquico"
  | "entró escrito del consumidor"
  | "a despacho para copia certificada / p/ imputar"
  | "pasa p/ archivo se le resolvió"
  | "pasa p/caja"
  | "plazo p/ la denunciada p/ cumplir con la propuesta- en caja"
  | "plazo p/ consumidora p/ informar el cumplimiento- en caja"
  | "para imputar"
  | "pase a jurídico";

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

export interface User {
  id: string;
  username: string;
  password?: string;
  role: "admin" | "staff";
}

export interface AppSettings {
  proximoNumero: number;
}
