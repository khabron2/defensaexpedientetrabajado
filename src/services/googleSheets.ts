/// <reference types="vite/client" />
import { Expediente, Notificacion } from '../types';

const rawUrl = (import.meta.env.VITE_GOOGLE_SCRIPT_URL && import.meta.env.VITE_GOOGLE_SCRIPT_URL.startsWith('http')) 
  ? import.meta.env.VITE_GOOGLE_SCRIPT_URL 
  : 'https://script.google.com/macros/s/AKfycbzpUZk94tPOC5gu6vRwd0ALx21rh_iFm1sdinFMT6SW1Q8JMIb-N-KPmQbxi8eAvs8/exec';

const SCRIPT_URL = rawUrl.trim();

console.log('🔌 Google Sheets Service initialized with URL:', SCRIPT_URL ? `${SCRIPT_URL.substring(0, 40)}...` : 'NONE');

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 90000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    console.log(`🌐 Fetching: ${url.split('?')[0]}...`);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    
    // Detectar errores de red/CORS específicos
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('🌐 Error de red o CORS detectado. Esto suele significar que el script de Google no está publicado como "Cualquiera" (Anyone) o la URL es incorrecta.');
      throw new Error('Error de red o CORS. Verifique la configuración del script de Google (Publicar como "Cualquiera").');
    }

    const isAbort = 
      error.name === 'AbortError' || 
      error.name === 'TimeoutError' ||
      (error.message && (
        error.message.toLowerCase().includes('aborted') || 
        error.message.toLowerCase().includes('timeout') ||
        error.message.toLowerCase().includes('signal')
      ));

    if (isAbort) {
      throw new Error(`Timeout de ${timeout}ms excedido. El script de Google está tardando demasiado en responder (posible inicio en frío).`);
    }
    throw error;
  }
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, timeout = 90000): Promise<Response> {
  try {
    return await fetchWithTimeout(url, options, timeout);
  } catch (error: any) {
    if (retries > 0 && !error.message?.includes('404')) {
      console.log(`🔄 Reintentando (${retries} restantes)... Motivo: ${error.message || 'Error desconocido'}`);
      const waitTime = (4 - retries) * 2000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return fetchWithRetry(url, options, retries - 1, timeout);
    }
    throw error;
  }
}

export async function fetchExpedientesFromSheet(): Promise<Expediente[]> {
  if (!SCRIPT_URL) return [];
  
  try {
    const response = await fetchWithRetry(`${SCRIPT_URL}?action=getExpedientes`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow'
    });
    
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('❌ Error al obtener datos de Sheets:', error.message || error);
    throw error;
  }
}

export async function fetchUsersFromSheet(): Promise<any[]> {
  if (!SCRIPT_URL) return [];
  
  try {
    const response = await fetchWithRetry(`${SCRIPT_URL}?action=getUsers`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow'
    });
    
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('❌ Error al obtener usuarios de Sheets:', error.message || error);
    throw error;
  }
}

export async function fetchNotificacionesFromSheet(): Promise<Notificacion[]> {
  if (!SCRIPT_URL) return [];
  
  try {
    const response = await fetchWithRetry(`${SCRIPT_URL}?action=getNotificaciones`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow'
    });
    
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('❌ Error al obtener notificaciones de Sheets:', error.message || error);
    throw error;
  }
}

export async function saveExpedienteToSheet(expediente: Expediente): Promise<boolean> {
  if (!SCRIPT_URL) return false;

  try {
    console.log('📤 Enviando nuevo expediente a Sheets...', expediente.numero);
    
    // Usamos fetch directo con no-cors para evitar problemas de preflight en POST
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'addExpediente',
        data: expediente
      }),
    });
    
    console.log('✅ Petición de guardado enviada.');
    return true;
  } catch (error) {
    console.error('❌ Error al guardar en Sheets:', error);
    return false;
  }
}

export async function updateExpedienteInSheet(expediente: Expediente): Promise<boolean> {
  if (!SCRIPT_URL) return false;

  try {
    console.log('📝 Actualizando expediente en Sheets...', expediente.numero, 'ID:', expediente.id);
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'updateExpediente',
        data: expediente
      }),
    });
    console.log('✅ Petición de actualización enviada a Sheets.');
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar en Sheets:', error);
    return false;
  }
}

export async function updateAudienciaDateInSheet(expedienteId: string, fechaAudiencia: string): Promise<boolean> {
  if (!SCRIPT_URL) return false;

  try {
    console.log('📅 Actualizando fecha de audiencia en Sheets...', expedienteId);
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'updateAudienciaDate',
        data: { expedienteId, fechaAudiencia }
      }),
    });
    console.log('✅ Petición de fecha de audiencia enviada a Sheets.');
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar fecha de audiencia en Sheets:', error);
    return false;
  }
}

/**
 * CÓDIGO ACTUALIZADO PARA GOOGLE APPS SCRIPT:
 * 
 * function doPost(e) {
 *   var params;
 *   try {
 *     params = JSON.parse(e.postData.contents);
 *   } catch (err) {
 *     params = {
 *       action: e.parameter.action,
 *       data: JSON.parse(e.parameter.data)
 *     };
 *   }
 *   
 *   var ss = SpreadsheetApp.openById("14ocpgew1-H38gckeiFP_KHbuJgOYv-fDuqvRH3yitwE");
 *   var sheet = ss.getSheetByName("Bdatos");
 *   
 *   if (params.action === 'addExpediente') {
 *     var exp = params.data;
 *     
 *     // --- Lógica de Carga de Archivos a Google Drive ---
 *     var folderName = "Expedientes_Adjuntos";
 *     var folders = DriveApp.getFoldersByName(folderName);
 *     var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
 *     
 *     var docUrls = [];
 *     if (exp.documentos && exp.documentos.length > 0) {
 *       exp.documentos.forEach(function(docBase64, index) {
 *         try {
 *           // El formato esperado es: data:mime;name=filename;base64,data
 *           var parts = docBase64.split(',');
 *           var meta = parts[0];
 *           var base64Data = parts[1];
 *           
 *           var mimeType = meta.split(':')[1].split(';')[0];
 *           var fileName = "adjunto_" + exp.numero + "_" + index;
 *           
 *           // Intentar extraer el nombre si viene en el string
 *           if (meta.indexOf('name=') !== -1) {
 *             fileName = meta.split('name=')[1].split(';')[0];
 *           }
 *           
 *           var decodedData = Utilities.base64Decode(base64Data);
 *           var blob = Utilities.newBlob(decodedData, mimeType, fileName);
 *           var file = folder.createFile(blob);
 *           
 *           // Hacer el archivo público para que se pueda ver con el link
 *           file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
 *           docUrls.push(file.getUrl());
 *         } catch (err) {
 *           docUrls.push("Error al cargar: " + err.toString());
 *         }
 *       });
 *     }
 *     // --------------------------------------------------
 *     
 *     sheet.appendRow([
 *       exp.numero,
 *       exp.denunciante.nombre,
 *       exp.denunciante.dni,
 *       exp.denunciante.telefono,
 *       exp.denunciante.email,
 *       exp.denunciante.barrio,
 *       exp.denunciante.calle,
 *       exp.denunciante.numero,
 *       exp.denunciante.entreCalle1,
 *       exp.denunciante.entreCalle2,
 *       exp.empresas[0] ? exp.empresas[0].nombre : '',
 *       exp.empresas[1] ? exp.empresas[1].nombre : '',
 *       exp.empresas[2] ? exp.empresas[2].nombre : '',
 *       exp.empresas[3] ? exp.empresas[3].nombre : '',
 *       exp.motivoReclamo,
 *       exp.peticiones,
 *       docUrls[0] || '', // URL del Documento 1
 *       docUrls[1] || '', // URL del Documento 2
 *       '', // Fecha de Audiencia (Col 19)
 *       exp.id, // Columna 1 (Col 20)
 *       exp.fechaCreacion, // Columna 2 (Col 21)
 *       exp.fechaModificacion || exp.fechaCreacion, // Columna 3 (Col 22)
 *       exp.estado, // Columna 4 (Col 23)
 *       JSON.stringify(exp.timeline || []), // Columna 5 (Col 24)
 *       docUrls.join(", ") // Todas las URLs en una sola columna (Col 25)
 *     ]);
 *     return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
 *   }
  
 *   if (params.action === 'updateExpediente') {
 *     var exp = params.data;
 *     var data = sheet.getDataRange().getValues();
 *     var found = false;
 *     for (var i = 1; i < data.length; i++) {
 *       // Intentar coincidir por ID (Columna 20) o por Número de Expediente (Columna 1)
 *       if ((exp.id && data[i][19] === exp.id) || (data[i][0] === exp.numero)) {
 *         sheet.getRange(i + 1, 23).setValue(exp.estado); // Estado en Columna 23
 *         sheet.getRange(i + 1, 22).setValue(exp.fechaModificacion || new Date()); // Fecha Mod en Columna 22
 *         sheet.getRange(i + 1, 24).setValue(JSON.stringify(exp.timeline || [])); // Timeline en Columna 24
 *         if (!data[i][19] && exp.id) {
 *           sheet.getRange(i + 1, 20).setValue(exp.id); // Guardar ID si no existía
 *         }
 *         found = true;
 *         break;
 *       }
 *     }
 *     return ContentService.createTextOutput(found ? "Success" : "Not Found").setMimeType(ContentService.MimeType.TEXT);
 *   }
 *
 *   if (params.action === 'updateAudienciaDate') {
 *     var info = params.data;
 *     var data = sheet.getDataRange().getValues();
 *     var found = false;
 *     for (var i = 1; i < data.length; i++) {
 *       if (data[i][19] === info.expedienteId) { // ID en Columna 20
 *         sheet.getRange(i + 1, 19).setValue(info.fechaAudiencia); // Fecha de Audiencia en Col 19
 *         found = true;
 *         break;
 *       }
 *     }
 *     return ContentService.createTextOutput(found ? "Success" : "Not Found").setMimeType(ContentService.MimeType.TEXT);
 *   }
 * }

 * function doGet(e) {
 *   var ss = SpreadsheetApp.openById("14ocpgew1-H38gckeiFP_KHbuJgOYv-fDuqvRH3yitwE");
 *   
 *   if (e.parameter.action === 'getUsers') {
 *     var sheet = ss.getSheetByName("Usuarios");
 *     var data = sheet.getDataRange().getValues();
 *     var result = [];
 *     for (var i = 1; i < data.length; i++) {
 *       if (data[i][0]) {
 *         result.push({
 *           id: i.toString(),
 *           username: data[i][0].toString(),
 *           password: data[i][1].toString(),
 *           role: 'admin'
 *         });
 *       }
 *     }
 *     return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
 *   }
 * 
 *   var sheet = ss.getSheetByName("Bdatos");
 *   var data = sheet.getDataRange().getValues();
 *   var result = [];
 *   
 *   for (var i = 1; i < data.length; i++) {
 *     var empresas = [];
 *     if (data[i][10]) empresas.push({ nombre: data[i][10] });
 *     if (data[i][11]) empresas.push({ nombre: data[i][11] });
 *     if (data[i][12]) empresas.push({ nombre: data[i][12] });
 *     if (data[i][13]) empresas.push({ nombre: data[i][13] });
 * 
 *     var documentos = [];
 *     if (data[i][16]) documentos.push(data[i][16]);
 *     if (data[i][17]) documentos.push(data[i][17]);
 * 
 *     var timeline = [];
 *     try {
 *       timeline = JSON.parse(data[i][23]);
 *     } catch (e) {}
 * 
 *     result.push({
 *       numero: data[i][0],
 *       denunciante: {
 *         nombre: data[i][1],
 *         dni: data[i][2],
 *         telefono: data[i][3],
 *         email: data[i][4],
 *         barrio: data[i][5],
 *         calle: data[i][6],
 *         numero: data[i][7],
 *         entreCalle1: data[i][8],
 *         entreCalle2: data[i][9]
 *       },
 *       empresas: empresas,
 *       motivoReclamo: data[i][14],
 *       peticiones: data[i][15],
 *       documentos: documentos,
 *       fechaAudiencia: data[i][18],
 *       id: data[i][19],
 *       fechaCreacion: data[i][20],
 *       fechaModificacion: data[i][21],
 *       estado: data[i][22],
 *       timeline: timeline
 *     });
 *   }
 *   
 *   return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
 * }
*/
