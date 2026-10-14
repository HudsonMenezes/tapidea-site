/**
 * TapIdea — lista do beta.
 *
 * Recebe o formulário da landing page e grava uma linha na aba "Lista" desta planilha.
 * Instalação: README.md do repositório, seção "Lista do beta".
 */

const SHEET_NAME = 'Lista';
const HEADER = ['Data', 'Nome', 'E-mail', 'Uso', 'Origem'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Campo invisível: só robôs o preenchem.
  if (p.empresa) return json({ ok: true });

  const email = String(p.email || '').trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 120) return json({ ok: false, error: 'email' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet();
    const last = sheet.getLastRow();
    if (last > 1) {
      const emails = sheet.getRange(2, 3, last - 1, 1).getValues().flat();
      if (emails.indexOf(email) !== -1) return json({ ok: true, duplicate: true });
    }
    sheet.appendRow([
      new Date(),
      clean(p.nome, 80),
      email,
      clean(p.uso, 40),
      clean(p.origem, 200),
    ]);
    return json({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Texto curto e sem fórmula: um valor começando com = + - @ viraria fórmula na planilha. */
function clean(value, max) {
  const text = String(value || '').trim().slice(0, max);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
