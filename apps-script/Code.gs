const SPREADSHEET_ID = '17ctgF9Q5LauKU3K50qYOqfbs5LxXuxEA3BSMzY02D00';
const SESSIONS_SHEET = 'Sesiones';
const EVENTS_SHEET = 'Eventos';
const GAME_ID = 'lavibora-2026';

function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'Registro de La víbora de la mentira'
  });
}

function doPost(event) {
  let payload;

  try {
    payload = JSON.parse(event && event.postData ? event.postData.contents : '{}');
  } catch (error) {
    return jsonResponse_({ ok: false, error: 'Carga JSON inválida.' });
  }

  if (payload.action !== 'register_session' || payload.game_id !== GAME_ID) {
    return jsonResponse_({ ok: false, error: 'Solicitud no admitida.' });
  }

  if (asText_(payload.website, 10)) {
    return jsonResponse_({ ok: true });
  }

  const sessionId = asText_(payload.session_id, 80);
  const nombre = asText_(payload.nombre, 60);
  const apellido = asText_(payload.apellido, 60);
  const institucion = asText_(payload.institucion, 120);
  const correo = asText_(payload.correo_electronico, 120).toLowerCase();
  const consentimiento = payload.consentimiento === true;

  if (!sessionId || !nombre || !apellido || !institucion || !isValidEmail_(correo) || !consentimiento) {
    return jsonResponse_({ ok: false, error: 'Faltan datos obligatorios o contienen errores.' });
  }

  const cache = CacheService.getScriptCache();
  const cacheKey = 'session:' + sessionId;
  if (cache.get(cacheKey)) {
    return jsonResponse_({ ok: true, duplicate: true, session_id: sessionId });
  }

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sessionsSheet = spreadsheet.getSheetByName(SESSIONS_SHEET);
    const eventsSheet = spreadsheet.getSheetByName(EVENTS_SHEET);

    if (!sessionsSheet || !eventsSheet) {
      throw new Error('No se encontraron las pestañas requeridas.');
    }

    const now = new Date();
    const nivel = clampNumber_(payload.nivel_actual, 1, 10, 1);
    const vidas = clampNumber_(payload.vidas_restantes, 0, 3, 3);
    const avatar = ['student', 'teacher'].includes(payload.avatar) ? payload.avatar : 'student';

    appendMappedRow_(sessionsSheet, {
      session_id: sessionId,
      fecha_inicio: now,
      ultima_actividad: now,
      fecha_fin: '',
      nombre_apellido: nombre + ' ' + apellido,
      institucion: institucion,
      correo_electronico: correo,
      consentimiento: true,
      avatar: avatar,
      nivel_actual: nivel,
      nivel_alcanzado: nivel,
      estado: 'registrado',
      vidas_restantes: vidas,
      tiempo_total_segundos: 0,
      quiz_puntaje: '',
      certificado_emitido: false,
      quiz_respuestas_json: '',
      navegador: asText_(payload.navegador, 250),
      origen: asText_(payload.origen, 250),
      version_juego: asText_(payload.version_juego, 80),
      nombre: nombre,
      apellido: apellido
    });

    appendMappedRow_(eventsSheet, {
      session_id: sessionId,
      evento: 'session_start',
      fecha: now,
      nivel: nivel,
      vida: vidas,
      elemento: '',
      tiempo_total_segundos: 0,
      detalle_json: JSON.stringify({ avatar: avatar })
    });

    SpreadsheetApp.flush();
    cache.put(cacheKey, '1', 21600);

    return jsonResponse_({ ok: true, session_id: sessionId });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, error: 'No fue posible registrar la sesión.' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function appendMappedRow_(sheet, data) {
  const lastColumn = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  const row = headers.map(function (header) {
    return Object.prototype.hasOwnProperty.call(data, header) ? data[header] : '';
  });

  sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
}

function asText_(value, maxLength) {
  return String(value == null ? '' : value)
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLength);
}

function isValidEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function clampNumber_(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function jsonResponse_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
