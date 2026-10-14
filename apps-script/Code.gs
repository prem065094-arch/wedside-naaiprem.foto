/* =====================================================================
   naaiprem.foto — ระบบรับจองคิว (Google Apps Script ผูกกับ Google Sheets)
   ---------------------------------------------------------------------
   วิธีติดตั้ง: ดู apps-script/SETUP.md
   • doGet  : ส่งช่วงเวลาที่ไม่ว่างให้ปฏิทินบนเว็บ (ไม่มีข้อมูลส่วนตัวของลูกค้า)
   • doPost : รับคำขอจอง / รับสลิปมัดจำ → บันทึกลงชีต + เก็บสลิปใน Drive + ส่งอีเมลแจ้ง
   • เปลี่ยนสถานะในชีตเป็น "มัดจำแล้ว" → ลง Google Calendar อัตโนมัติ / "ยกเลิก" → ลบออก
   ===================================================================== */

const CONFIG = {
  SHEET_BOOKINGS: 'การจอง',
  SHEET_CLOSED: 'ปิดรับ',
  SLIP_FOLDER: 'naaiprem.foto — สลิปมัดจำ',
  NOTIFY_EMAIL: '',          // ว่าง = ส่งอีเมลแจ้งเตือนเข้าบัญชี Google ที่ติดตั้งสคริปต์
  BUFFER_MINUTES: 60,        // เวลากันไว้เดินทางก่อน-หลังแต่ละงาน (นาที)
  MIN_DAYS_AHEAD: 1,         // จองล่วงหน้าอย่างน้อยกี่วัน (1 = จองได้ตั้งแต่พรุ่งนี้)
  MAX_DAYS_AHEAD: 400,       // จองล่วงหน้าได้ไกลสุดกี่วัน
  STATUSES: ['รอคุย', 'รอตรวจสลิป', 'มัดจำแล้ว', 'ถ่ายแล้ว', 'ส่งงานแล้ว', 'ยกเลิก'],
  BLOCKING: ['รอตรวจสลิป', 'มัดจำแล้ว'],   // สถานะที่ทำให้ช่วงเวลานั้นขึ้น "ไม่ว่าง" บนเว็บ
  CALENDAR_STATUSES: ['มัดจำแล้ว', 'ถ่ายแล้ว', 'ส่งงานแล้ว'], // สถานะที่มีนัดใน Google Calendar
  MAX_SLIP_BYTES: 8 * 1024 * 1024,
  TZ: 'Asia/Bangkok',
};

const HEADERS = ['รหัสจอง', 'ส่งเมื่อ', 'สถานะ', 'ประเภทงาน', 'แพ็กเกจ', 'วันที่ถ่าย', 'ช่วงเวลา',
  'ชื่อ', 'เบอร์โทร', 'LINE / Facebook', 'สถานที่', 'จังหวัด', 'จำนวนคน', 'รู้จักจาก',
  'รายละเอียด', 'สลิป', 'แนบสลิปเมื่อ', 'หมายเหตุ (ของเรา)', 'calendar'];
const COL = {}; // ชื่อคอลัมน์ → เลขคอลัมน์ (เริ่มที่ 1)
['code', 'created', 'status', 'type', 'pkg', 'date', 'time', 'name', 'phone', 'contact', 'place',
  'province', 'people', 'source', 'note', 'slip', 'slipAt', 'memo', 'events'].forEach((k, i) => { COL[k] = i + 1; });

const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

/* ---------------------------------------------------------------------
   ติดตั้ง (กด Run ครั้งแรกครั้งเดียว — หรือใช้เมนู naaiprem.foto → ติดตั้ง/ซ่อมระบบ)
   --------------------------------------------------------------------- */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(CONFIG.TZ);

  // ชีตการจอง
  let sh = ss.getSheetByName(CONFIG.SHEET_BOOKINGS) || ss.insertSheet(CONFIG.SHEET_BOOKINGS, 0);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#f1f1f1');
  sh.setFrozenRows(1);
  sh.getRange(2, 1, sh.getMaxRows() - 1, HEADERS.length).setNumberFormat('@'); // เก็บเป็นข้อความ (เบอร์ 0 นำหน้าไม่หาย)
  sh.getRange(2, COL.status, sh.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(CONFIG.STATUSES, true).setAllowInvalid(false).build());
  const colors = { 'รอคุย': '#fff4cc', 'รอตรวจสลิป': '#ffe0b2', 'มัดจำแล้ว': '#c8e6c9', 'ถ่ายแล้ว': '#bbdefb', 'ส่งงานแล้ว': '#e0e0e0', 'ยกเลิก': '#ffcdd2' };
  const statusRange = sh.getRange(2, COL.status, sh.getMaxRows() - 1, 1);
  sh.setConditionalFormatRules(Object.keys(colors).map((k) => SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(k).setBackground(colors[k]).setRanges([statusRange]).build()));
  sh.hideColumns(COL.events);
  [110, 130, 110, 100, 170, 100, 130, 150, 110, 140, 160, 100, 80, 120, 260, 90, 130, 200].forEach((w, i) => sh.setColumnWidth(i + 1, w));

  // ชีตปิดรับ (วันหยุด / ติดธุระ)
  let closed = ss.getSheetByName(CONFIG.SHEET_CLOSED) || ss.insertSheet(CONFIG.SHEET_CLOSED);
  closed.getRange(1, 1, 1, 4).setValues([['วันที่ (ปปปป-ดด-วว ค.ศ.)', 'เริ่ม (ว่าง = ทั้งวัน)', 'ถึง', 'หมายเหตุ']])
    .setFontWeight('bold').setBackground('#f1f1f1');
  closed.setFrozenRows(1);
  closed.getRange(2, 1, closed.getMaxRows() - 1, 3).setNumberFormat('@');
  closed.setColumnWidths(1, 4, 170);

  // โฟลเดอร์เก็บสลิป
  slipFolder_();

  // ลง/ลบ Google Calendar เมื่อเปลี่ยนสถานะ (ต้องใช้ trigger แบบติดตั้ง)
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'onStatusEdit')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('onStatusEdit').forSpreadsheet(ss).onEdit().create();

  // toast ไม่บล็อกสคริปต์ (alert จะค้างรอจนกว่าจะกดตกลงในชีต)
  ss.toast('ขั้นต่อไป: การทำให้ใช้งานได้ → เว็บแอป', 'ติดตั้งระบบจองเรียบร้อย ✅', 15);
  console.log('ติดตั้งระบบจองเรียบร้อย');
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('naaiprem.foto')
    .addItem('ซิงก์ Google Calendar ทั้งหมด', 'syncAllCalendar')
    .addItem('ติดตั้ง / ซ่อมระบบ', 'setup')
    .addToUi();
}

/* ---------------------------------------------------------------------
   Web app
   --------------------------------------------------------------------- */
function doGet() {
  try {
    return json_(Object.assign({ ok: true }, availability_()));
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'โหลดตารางว่างไม่สำเร็จ' });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.website) return json_({ ok: true, code: 'NP000000' }); // กันบอท (ช่องซ่อนที่คนจริงไม่กรอก)
    if (body.action === 'book') return json_(book_(body));
    if (body.action === 'slip') return json_(attachSlip_(body));
    return json_({ ok: false, error: 'คำขอไม่ถูกต้อง' });
  } catch (err) {
    if (err instanceof UserError) return json_({ ok: false, error: err.message, code: err.code });
    console.error(err);
    return json_({ ok: false, error: 'ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง หรือทักแชทเพจ NAAI PREM' });
  }
}

class UserError extends Error {
  constructor(message, code) { super(message); this.code = code || ''; }
}

/* ---------- ตารางว่าง ---------- */
function availability_() {
  const today = todayStr_();
  const busy = {};
  const add = (date, ranges) => { (busy[date] = busy[date] || []).push(...ranges); };

  bookings_().forEach((b) => {
    if (b.date >= today && CONFIG.BLOCKING.indexOf(b.status) !== -1) add(b.date, parseRanges_(b.time));
  });
  closedDays_().forEach((c) => { if (c.date >= today) add(c.date, [c.range]); });

  return {
    busy: busy,
    buffer: CONFIG.BUFFER_MINUTES,
    minDate: addDays_(today, CONFIG.MIN_DAYS_AHEAD),
    maxDate: addDays_(today, CONFIG.MAX_DAYS_AHEAD),
  };
}

/* ---------- รับคำขอจอง ---------- */
function book_(b) {
  const data = {
    type: text_(b.type, 50, true, 'ประเภทงาน'),
    pkg: text_(b.pkg, 80, true, 'แพ็กเกจ'),
    date: dateStr_(b.date),
    ranges: ranges_(b.ranges),
    name: text_(b.name, 100, true, 'ชื่อ'),
    phone: phone_(b.phone),
    contact: text_(b.contact, 100, false),
    place: text_(b.place, 200, true, 'สถานที่ถ่าย'),
    province: text_(b.province, 100, true, 'จังหวัด'),
    people: text_(b.people, 30, false),
    source: text_(b.source, 60, true, 'ช่องทางที่รู้จักเรา'),
    note: text_(b.note, 1500, false),
  };
  if (b.consent !== true) throw new UserError('กรุณายอมรับการเก็บข้อมูลเพื่อการนัดหมาย');

  const avail = availability_();
  if (data.date < avail.minDate || data.date > avail.maxDate) throw new UserError('วันที่นี้ไม่เปิดรับจองออนไลน์ กรุณาทักแชทเพื่อสอบถาม');
  rateCheck_(`book_${data.phone}`, 6); // นับเฉพาะที่จองสำเร็จ ลูกค้าที่เจอเวลาชนแล้วเลือกใหม่จะไม่โดนบล็อก

  // กดส่งซ้ำ (เช่น เน็ตหลุดตอนรอผล) → ตอบรหัสเดิม ไม่สร้างแถวซ้ำ
  const cache = CacheService.getScriptCache();
  const reqKey = /^[\w-]{8,64}$/.test(String(b.requestId || '')) ? `req_${b.requestId}` : '';

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const seen = reqKey && cache.get(reqKey);
    if (seen) return JSON.parse(seen);

    // ตรวจซ้ำในล็อก กันสองคนจองช่วงเดียวกันพร้อมกัน
    if (conflicts_(availability_().busy[data.date] || [], data.ranges)) {
      throw new UserError('ช่วงเวลานี้เพิ่งมีคนจองไป กรุณาเลือกเวลาอื่น', 'conflict');
    }
    const code = newCode_();
    const slipUrl = b.slip ? saveSlip_(b.slip, code) : '';
    const now = nowStr_();
    const row = [];
    row[COL.code - 1] = code;
    row[COL.created - 1] = now;
    row[COL.status - 1] = slipUrl ? 'รอตรวจสลิป' : 'รอคุย';
    row[COL.type - 1] = data.type;
    row[COL.pkg - 1] = data.pkg;
    row[COL.date - 1] = data.date;
    row[COL.time - 1] = formatRanges_(data.ranges);
    row[COL.name - 1] = data.name;
    row[COL.phone - 1] = data.phone;
    row[COL.contact - 1] = data.contact;
    row[COL.place - 1] = data.place;
    row[COL.province - 1] = data.province;
    row[COL.people - 1] = data.people;
    row[COL.source - 1] = data.source;
    row[COL.note - 1] = data.note;
    row[COL.slip - 1] = slipUrl;
    row[COL.slipAt - 1] = slipUrl ? now : '';
    row[COL.memo - 1] = '';
    row[COL.events - 1] = '';
    writeRow_(sheet_(), sheet_().getLastRow() + 1, row);
    SpreadsheetApp.flush();
    rateHit_(`book_${data.phone}`);
    const result = { ok: true, code: code, status: row[COL.status - 1] };
    if (reqKey) cache.put(reqKey, JSON.stringify(result), 21600);

    notify_(`📷 จองคิวใหม่ ${code} · ${data.type} ${thaiDate_(data.date)}`, [
      `รหัสจอง: ${code}`,
      `สถานะ: ${row[COL.status - 1]}`,
      `งาน: ${data.type} — ${data.pkg}`,
      `วันที่: ${thaiDate_(data.date)} เวลา ${formatRanges_(data.ranges)}`,
      `ชื่อ: ${data.name}`,
      `โทร: ${data.phone}`,
      `LINE / Facebook: ${data.contact || '-'}`,
      `สถานที่: ${data.place} จ.${data.province}`,
      `จำนวนคน: ${data.people || '-'}`,
      `รู้จักจาก: ${data.source}`,
      `รายละเอียด: ${data.note || '-'}`,
      slipUrl ? `สลิป: ${slipUrl}` : 'ยังไม่แนบสลิป',
    ]);
    return result;
  } finally {
    lock.releaseLock();
  }
}

/* ---------- แนบสลิปภายหลัง (ใช้รหัสจอง + เบอร์โทร) ---------- */
function attachSlip_(b) {
  const code = String(b.code || '').trim().toUpperCase();
  const phone = phone_(b.phone);
  if (!b.slip) throw new UserError('กรุณาเลือกรูปสลิป');
  rateCheck_(`slip_${phone}`, 10);
  rateHit_(`slip_${phone}`); // นับทุกครั้ง กันการสุ่มเดารหัสจอง

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet_();
    const last = sh.getLastRow();
    if (last < 2) throw new UserError('ไม่พบรหัสจองนี้');
    const values = sh.getRange(2, 1, last - 1, HEADERS.length).getDisplayValues();
    const i = values.findIndex((r) => r[COL.code - 1] === code && digits_(r[COL.phone - 1]) === phone);
    if (i === -1) throw new UserError('ไม่พบรหัสจองนี้ หรือเบอร์โทรไม่ตรงกับที่จองไว้');
    const r = values[i];
    if (r[COL.status - 1] === 'ยกเลิก') throw new UserError('การจองนี้ถูกยกเลิกแล้ว กรุณาทักแชทเพจ');

    const url = saveSlip_(b.slip, code);
    const rowNo = i + 2;
    const slips = r[COL.slip - 1] ? `${r[COL.slip - 1]}\n${url}` : url;
    writeRow_(sh, rowNo, [slips, nowStr_()], COL.slip);
    if (r[COL.status - 1] === 'รอคุย') writeRow_(sh, rowNo, ['รอตรวจสลิป'], COL.status);
    SpreadsheetApp.flush();

    notify_(`💸 แนบสลิปมัดจำ ${code} · ${r[COL.name - 1]}`, [
      `รหัสจอง: ${code}`,
      `งาน: ${r[COL.type - 1]} — ${r[COL.pkg - 1]}`,
      `วันที่: ${thaiDate_(r[COL.date - 1])} เวลา ${r[COL.time - 1]}`,
      `ชื่อ: ${r[COL.name - 1]} โทร ${r[COL.phone - 1]}`,
      `สลิป: ${url}`,
      'ตรวจยอดแล้วเปลี่ยนสถานะเป็น "มัดจำแล้ว" เพื่อลงปฏิทิน',
    ]);
    return { ok: true, code: code };
  } finally {
    lock.releaseLock();
  }
}

/* ---------------------------------------------------------------------
   Google Calendar
   --------------------------------------------------------------------- */
function onStatusEdit(e) {
  const range = e && e.range;
  if (!range || range.getSheet().getName() !== CONFIG.SHEET_BOOKINGS) return;
  const first = range.getColumn();
  const lastCol = first + range.getNumColumns() - 1;
  if (COL.status < first || COL.status > lastCol) return;
  for (let row = Math.max(range.getRow(), 2); row <= range.getLastRow(); row++) syncRow_(row);
}

function syncAllCalendar() {
  const last = sheet_().getLastRow();
  for (let row = 2; row <= last; row++) syncRow_(row);
  SpreadsheetApp.getActiveSpreadsheet().toast('ซิงก์ Google Calendar เรียบร้อย', 'naaiprem.foto', 8);
}

function syncRow_(row) {
  const sh = sheet_();
  const r = sh.getRange(row, 1, 1, HEADERS.length).getDisplayValues()[0];
  if (!r[COL.code - 1]) return;
  const want = CONFIG.CALENDAR_STATUSES.indexOf(r[COL.status - 1]) !== -1;
  const ids = r[COL.events - 1] ? r[COL.events - 1].split(',') : [];
  const cal = CalendarApp.getDefaultCalendar();

  if (want && !ids.length) {
    const newIds = parseRanges_(r[COL.time - 1]).map(([start, end]) => cal.createEvent(
      `📷 ${r[COL.type - 1]} · ${r[COL.name - 1]}`,
      toDate_(r[COL.date - 1], start),
      toDate_(r[COL.date - 1], end),
      {
        location: [r[COL.place - 1], r[COL.province - 1]].filter(String).join(', '),
        description: [
          `รหัสจอง ${r[COL.code - 1]} · ${r[COL.pkg - 1]}`,
          `โทร ${r[COL.phone - 1]} · LINE/FB ${r[COL.contact - 1] || '-'}`,
          `จำนวนคน ${r[COL.people - 1] || '-'}`,
          r[COL.note - 1],
          r[COL.memo - 1],
        ].filter(String).join('\n'),
      },
    ).getId());
    writeRow_(sh, row, [newIds.join(',')], COL.events);
  } else if (!want && ids.length) {
    ids.forEach((id) => { const ev = cal.getEventById(id); if (ev) ev.deleteEvent(); });
    writeRow_(sh, row, [''], COL.events);
  }
}

/* ---------------------------------------------------------------------
   Helpers
   --------------------------------------------------------------------- */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_BOOKINGS);
  if (!sh) throw new Error('ไม่พบชีต "การจอง" — กด Run ฟังก์ชัน setup ก่อน');
  return sh;
}

// เขียนค่าเป็นข้อความเสมอ และกันสูตร (ค่าที่ขึ้นต้นด้วย = + - @) ไม่ให้ชีตนำไปคำนวณ
function writeRow_(sh, row, values, startCol) {
  const safe = values.map((v) => {
    const s = v == null ? '' : String(v);
    return /^[=+\-@]/.test(s) ? `'${s}` : s;
  });
  if (row > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), 200); // ชีตเต็ม → เพิ่มแถว (ได้รูปแบบ/ตัวเลือกสถานะจากแถวก่อนหน้า)
  sh.getRange(row, startCol || 1, 1, safe.length).setNumberFormat('@').setValues([safe]);
}

function bookings_() {
  const sh = sheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, HEADERS.length).getDisplayValues().map((r) => ({
    status: r[COL.status - 1],
    date: normDate_(r[COL.date - 1]),
    time: r[COL.time - 1],
  }));
}

function closedDays_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_CLOSED);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 3).getDisplayValues()
    .map((r) => {
      const date = normDate_(r[0]);
      const start = normTime_(r[1]);
      const end = normTime_(r[2]);
      return { date: date, range: start && end && start < end ? [start, end] : ['00:00', '24:00'] };
    })
    .filter((c) => /^\d{4}-\d{2}-\d{2}$/.test(c.date));
}

function conflicts_(busy, ranges) {
  const buf = CONFIG.BUFFER_MINUTES;
  return ranges.some(([s, e]) => busy.some(([bs, be]) =>
    toMin_(s) < toMin_(be) + buf && toMin_(bs) < toMin_(e) + buf));
}

function parseRanges_(str) {
  return String(str || '').split(',').map((x) => x.trim().split('-').map(normTime_))
    .filter((r) => r.length === 2 && r[0] && r[1] && r[0] < r[1]);
}
function formatRanges_(ranges) { return ranges.map((r) => r.join('-')).join(', '); }

function ranges_(v) {
  if (!Array.isArray(v) || !v.length || v.length > 3) throw new UserError('กรุณาเลือกช่วงเวลา');
  const out = v.map((r) => [normTime_(r && r[0]), normTime_(r && r[1])]);
  if (out.some(([s, e]) => !s || !e || s >= e)) throw new UserError('ช่วงเวลาไม่ถูกต้อง');
  return out;
}

function normTime_(v) {
  const m = String(v || '').trim().match(/^(\d{1,2})[:.](\d{2})$/);
  if (!m) return '';
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 24 || min > 59 || (h === 24 && min > 0)) return '';
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}

// รับได้ทั้ง 2026-11-02 และ 2/11/2026 (กรณีพิมพ์เองในชีต)
function normDate_(v) {
  const s = String(v || '').trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const y = Number(m[3]) > 2400 ? Number(m[3]) - 543 : Number(m[3]); // รองรับปี พ.ศ.
    return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  return s;
}

function dateStr_(v) {
  const s = String(v || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new UserError('กรุณาเลือกวันที่');
  return s;
}

function text_(v, max, required, label) {
  const s = String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max);
  if (required && !s) throw new UserError(`กรุณากรอก${label}`);
  return s;
}

function digits_(v) { return String(v || '').replace(/\D/g, ''); }

function phone_(v) {
  const d = digits_(v);
  if (!/^0\d{8,9}$/.test(d)) throw new UserError('กรุณากรอกเบอร์โทรให้ถูกต้อง (9–10 หลัก)');
  return d;
}

// จำกัดจำนวนครั้งต่อเบอร์โทรใน 1 ชั่วโมง (กันสแปม)
function rateCheck_(key, max) {
  if (Number(CacheService.getScriptCache().get(key) || 0) >= max) {
    throw new UserError('ส่งคำขอบ่อยเกินไป กรุณารอสักครู่ หรือทักแชทเพจ NAAI PREM');
  }
}
function rateHit_(key) {
  const cache = CacheService.getScriptCache();
  cache.put(key, String(Number(cache.get(key) || 0) + 1), 3600);
}

function newCode_() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ตัดตัวที่สับสนง่าย (O/0, I/1)
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid());
  let code = 'NP';
  for (let i = 0; i < 6; i++) code += chars[(bytes[i] + 256) % chars.length];
  return code;
}

function slipFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SLIP_FOLDER_ID');
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (err) { /* โฟลเดอร์ถูกลบ → สร้างใหม่ */ }
  }
  const folder = DriveApp.createFolder(CONFIG.SLIP_FOLDER);
  props.setProperty('SLIP_FOLDER_ID', folder.getId());
  return folder;
}

function saveSlip_(dataUrl, code) {
  const m = String(dataUrl).match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) throw new UserError('ไฟล์สลิปต้องเป็นรูปภาพ (JPG / PNG)');
  const bytes = Utilities.base64Decode(m[2]);
  if (bytes.length > CONFIG.MAX_SLIP_BYTES) throw new UserError('ไฟล์สลิปใหญ่เกินไป');
  const ext = m[1].split('/')[1].replace('jpeg', 'jpg');
  const stamp = Utilities.formatDate(new Date(), CONFIG.TZ, 'yyyyMMdd-HHmmss');
  return slipFolder_().createFile(Utilities.newBlob(bytes, m[1], `${code}-${stamp}.${ext}`)).getUrl();
}

function notify_(subject, lines) {
  const to = CONFIG.NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
  if (!to) return;
  const url = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  MailApp.sendEmail(to, subject, `${lines.join('\n')}\n\nเปิดชีตการจอง: ${url}`);
}

function todayStr_() { return Utilities.formatDate(new Date(), CONFIG.TZ, 'yyyy-MM-dd'); }
function nowStr_() { return Utilities.formatDate(new Date(), CONFIG.TZ, 'yyyy-MM-dd HH:mm'); }

function addDays_(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return Utilities.formatDate(t, 'UTC', 'yyyy-MM-dd');
}

function toMin_(hm) { const [h, m] = hm.split(':').map(Number); return h * 60 + m; }

function toDate_(dateStr, hm) {
  if (hm === '24:00') return Utilities.parseDate(`${addDays_(dateStr, 1)} 00:00`, CONFIG.TZ, 'yyyy-MM-dd HH:mm');
  return Utilities.parseDate(`${dateStr} ${hm}`, CONFIG.TZ, 'yyyy-MM-dd HH:mm');
}

function thaiDate_(dateStr) {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return `${d} ${THAI_MONTHS[m - 1]} ${y + 543}`;
}
