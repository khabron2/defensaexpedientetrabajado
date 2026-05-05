/**
 * GOOGLE APPS SCRIPT BACKEND FOR CaseManager CRM
 * Deploy this as a Web App (Expose as: Anyone, even anonymous)
 */

const SPREADSHEET_ID = "1BycesOEPZputcAAAFoA2-kCCd5QPgUSeQSQdW_YItEM";
const SHEET_DATA = "DATOS";
const SHEET_USERS = "USUARIOS";

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // 10 seconds timeout
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === "login") return handleLogin(data);
    if (action === "createCase") return handleCreateCase(data);
    if (action === "updateStatus") return handleUpdateStatus(data);
    if (action === "updateHearing") return handleUpdateHearing(data);
    
    return response({ error: "Action not found" });
  } catch (err) {
    return response({ error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function handleUpdateStatus(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_DATA);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIdx = headers.indexOf("id");
  const estadoIdx = headers.indexOf("estado");
  const historialIdx = headers.indexOf("historialEstados");

  for (let i = 1; i < values.length; i++) {
    if (values[i][idIdx] === data.id) {
      const rowNum = i + 1;
      
      // Update estado
      sheet.getRange(rowNum, estadoIdx + 1).setValue(data.estado);
      
      // Update history
      let history = [];
      try {
        history = JSON.parse(values[i][historialIdx] || "[]");
      } catch(e) {}
      
      history.push({
        estado: data.estado,
        usuario: data.usuario,
        fecha: new Date().toISOString()
      });
      
      sheet.getRange(rowNum, historialIdx + 1).setValue(JSON.stringify(history));
      return response({ success: true });
    }
  }
  return response({ error: "Case not found" });
}

function handleUpdateHearing(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_DATA);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIdx = headers.indexOf("id");
  const hearingIdx = headers.indexOf("fechaAudiencia");

  // Validate slot
  const slotCount = values.filter((r, idx) => idx !== 0 && r[idIdx] !== data.id && r[hearingIdx] === data.fechaAudiencia).length;
  if (slotCount >= 2) return response({ error: "Cupo de audiencia completo" });

  for (let i = 1; i < values.length; i++) {
    if (values[i][idIdx] === data.id) {
      sheet.getRange(i + 1, hearingIdx + 1).setValue(data.fechaAudiencia);
      return response({ success: true });
    }
  }
  return response({ error: "Case not found" });
}

function doGet(e) {
  const action = e.parameter.action;
  if (action === "getCases") return handleGetCases();
  if (action === "getStats") return handleGetStats();
  return response({ error: "Action not permitted on GET" });
}

function handleLogin(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_USERS);
  const values = sheet.getDataRange().getValues();
  // Skip header
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.usuario && values[i][1].toString() === data.password.toString()) {
      return response({ success: true, user: { usuario: values[i][0], nombre: values[i][2] } });
    }
  }
  return response({ success: false, message: "Invalid credentials" });
}

function handleGetCases() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_DATA);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const list = [];
  for (let i = 1; i < values.length; i++) {
    let obj = {};
    headers.forEach((h, idx) => {
      let val = values[i][idx];
      if (h === "empresasDenunciadas" || h === "historialEstados") {
        try { val = JSON.parse(val); } catch(e) { val = []; }
      }
      obj[h] = val;
    });
    list.push(obj);
  }
  return response(list);
}

function handleCreateCase(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_DATA);
  const year = new Date().getFullYear();
  const values = sheet.getDataRange().getValues();
  
  // Logic for ID: DC-YYYYNNN
  const casesThisYear = values.filter(r => r[0] && r[0].toString().startsWith("DC-" + year));
  const count = casesThisYear.length + 1;
  const id = "DC-" + year + String(count).padStart(3, '0');
  const numeroexpediente = String(count).padStart(2, '0') + "/" + year;

  // Check Hearings Slot
  if (data.fechaAudiencia) {
    const slotCount = values.filter(r => r[20] === data.fechaAudiencia).length;
    if (slotCount >= 2) return response({ error: "Cupo de audiencia completo" });
  }

  const payload = data.payload;
  const historial = JSON.stringify([{ estado: "Pendiente", usuario: data.activeUser, fecha: new Date().toISOString() }]);
  
  // Order must match Sheet headers exactly
  // id, numeroexpediente, nombre, apellido, dni, telefono, email, barrio, calle, numeracion, entrecalle1, entrecalle2, localidad, departamento, tipo, caracteristicas, empresasDenunciadas, reclamo, peticiones, fechaAudiencia, estado, usuario, historialEstados
  const newRow = [
    id, 
    numeroexpediente,
    payload.nombre,
    payload.apellido,
    payload.dni,
    payload.telefono,
    payload.email,
    payload.barrio,
    payload.calle,
    payload.numeracion,
    payload.entrecalle1,
    payload.entrecalle2,
    payload.localidad,
    payload.departamento,
    payload.tipo,
    payload.caracteristicas,
    JSON.stringify(payload.empresasDenunciadas || []),
    payload.reclamo,
    payload.peticiones,
    payload.fechaAudiencia,
    "Pendiente",
    data.activeUser,
    historial
  ];

  sheet.appendRow(newRow);
  return response({ success: true, id });
}

function response(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
