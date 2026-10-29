/**
 * hinh-mba.js — Thành phần vẽ SVG dùng chung cho các trang máy biến áp (phần II–VI).
 */
import { el } from './so-do.js';

/** Khai báo mũi tên tam giác (marker) màu cho trước. */
export function taoMarker(defs, id, mau, kichThuoc = 4) {
  const m = el('marker', { id, viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: kichThuoc, markerHeight: kichThuoc, orient: 'auto-start-reverse' }, defs);
  el('path', { d: 'M0 0 L10 5 L0 10 Z', fill: mau }, m);
  return m;
}

/** Thẻ nền (card) có tiêu đề; trả về nhóm .khu để vẽ tiếp. */
export function veThe(cha, x, y, w, h, tieuDe, phu = '') {
  const g = el('g', { class: 'khu' }, cha);
  el('rect', { x, y, width: w, height: h, rx: 18, class: 'the-svg' }, g);
  if (tieuDe) el('text', { x: x + 24, y: y + 40, class: 'tieu-de-svg' }, g).textContent = tieuDe;
  if (phu) el('text', { x: x + 24, y: y + 72, class: 'chu-svg' }, g).textContent = phu;
  return g;
}

/** Lõi thép khung chữ nhật một cửa sổ. o = {x0, y0, x1, y1, day}. */
export function veLoiKhung(cha, o, lop = 'loi-thep-ab') {
  return el('path', {
    d: `M${o.x0} ${o.y0} H${o.x1} V${o.y1} H${o.x0} Z M${o.x0 + o.day} ${o.y0 + o.day} V${o.y1 - o.day} H${o.x1 - o.day} V${o.y0 + o.day} Z`,
    class: lop, 'fill-rule': 'evenodd',
  }, cha);
}

/** Cuộn dây quấn quanh trụ đứng (x0…x1 là mép trụ, y0…y1 là phạm vi cuộn). */
export function veCuonDung(cha, x0, x1, y0, y1, soVong, lop = 'cuon-day') {
  let d = '';
  const buoc = (y1 - y0) / Math.max(1, soVong - 1);
  for (let k = 0; k < soVong; k++) {
    const y = y0 + k * buoc;
    d += `M${x0 - 10} ${y + 7} C${x0 - 14} ${y - 6} ${x1 + 14} ${y - 13} ${x1 + 10} ${y} `;
  }
  return el('path', { d, class: lop }, cha);
}

/** Nguồn xoay chiều (vòng tròn có dấu ~). */
export function veNguonAC(cha, cx, cy, r = 34) {
  const g = el('g', { class: 'nguon-ac' }, cha);
  el('circle', { cx, cy, r, class: 'vo-nguon-ac' }, g);
  el('path', { d: `M${cx - r * 0.55} ${cy} q${r * 0.27} ${-r * 0.5} ${r * 0.55} 0 t${r * 0.55} 0`, class: 'ky-hieu-nguon' }, g);
  return g;
}

/** Điện trở tải dạng hình chữ nhật đứng. */
export function veTai(cha, cx, cy, w = 30, h = 90, nhan = 'Tải') {
  const g = el('g', { class: 'tai' }, cha);
  el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, class: 'than-tai' }, g);
  if (nhan) el('text', { x: cx + w / 2 + 12, y: cy + 6, class: 'chu-svg dam' }, g).textContent = nhan;
  return g;
}

/** Đồng hồ đo kim (V, A, W), kim lệch theo tỉ lệ 0…1,2. */
export function veDongHoDo(cha, cx, cy, kyHieu, R = 40) {
  const g = el('g', { class: 'dong-ho-do' }, cha);
  el('circle', { cx, cy, r: R, class: 'vo-dong-ho' }, g);
  const goc = (k) => ((-150 + 120 * k) * Math.PI) / 180;
  let d = '';
  for (let i = 0; i <= 24; i++) {
    const a = goc(i / 20);
    d += `${i ? 'L' : 'M'}${(cx + (R - 8) * Math.cos(a)).toFixed(1)} ${(cy + (R - 8) * Math.sin(a)).toFixed(1)}`;
  }
  el('path', { d, class: 'thang-dong-ho' }, g);
  el('text', { x: cx, y: cy + R * 0.6, class: 'chu-dong-ho', 'text-anchor': 'middle' }, g).textContent = kyHieu;
  const kim = el('line', { x1: cx, y1: cy, x2: cx, y2: cy - R + 10, class: 'kim-dong-ho' }, g);
  el('circle', { cx, cy, r: 4.5, class: 'truc-dong-ho' }, g);
  return {
    g,
    dat(k) {
      const a = goc(Math.max(0, Math.min(1.2, k)));
      kim.setAttribute('x2', (cx + (R - 10) * Math.cos(a)).toFixed(1));
      kim.setAttribute('y2', (cy + (R - 10) * Math.sin(a)).toFixed(1));
    },
  };
}

/**
 * Hệ trục đồ thị đơn giản: trả về hàm đổi tọa độ và nhóm để vẽ đường.
 * o = {x0, x1, y0, y1, xMin, xMax, yMin, yMax}
 */
export function veTruc(cha, o, { nhanX = [], nhanY = [], donViX = '', donViY = '' } = {}) {
  const g = el('g', {}, cha);
  const X = (x) => o.x0 + ((x - o.xMin) / (o.xMax - o.xMin)) * (o.x1 - o.x0);
  const Y = (y) => o.y1 - ((y - o.yMin) / (o.yMax - o.yMin)) * (o.y1 - o.y0);
  for (const [y, chu] of nhanY) {
    el('line', { x1: o.x0, x2: o.x1, y1: Y(y), y2: Y(y), class: y === 0 ? 'truc-0' : 'luoi-dt' }, g);
    el('text', { x: o.x0 - 8, y: Y(y) + 5, class: 'chu-truc-dt', 'text-anchor': 'end' }, g).textContent = chu;
  }
  for (const [x, chu] of nhanX) {
    el('line', { x1: X(x), x2: X(x), y1: o.y0, y2: o.y1, class: 'luoi-dt' }, g);
    el('text', { x: X(x), y: o.y1 + 22, class: 'chu-truc-dt', 'text-anchor': 'middle' }, g).textContent = chu;
  }
  if (donViX) el('text', { x: o.x1, y: o.y1 + 44, class: 'chu-truc-dt', 'text-anchor': 'end' }, g).textContent = donViX;
  if (donViY) el('text', { x: o.x0 - 8, y: o.y0 - 12, class: 'chu-truc-dt', 'text-anchor': 'end' }, g).textContent = donViY;
  return { g, X, Y, lop: el('g', {}, cha) };
}

/** Chuỗi lệnh path từ danh sách điểm [x, y] (tọa độ màn hình). */
export const duongGap = (ds) => ds.map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');

/**
 * Véc tơ (mũi tên) có nhãn cho đồ thị véc tơ. dat(a, b, nhan) vẽ từ điểm a đến b (tọa độ màn hình).
 */
export function veVecto(cha, mau, { day = 3.5, net = '' } = {}) {
  const g = el('g', { class: 'vecto' }, cha);
  const than = el('line', { stroke: mau, 'stroke-width': day, 'stroke-linecap': 'round', ...(net ? { 'stroke-dasharray': net } : {}) }, g);
  const dau = el('path', { fill: mau }, g);
  const chu = el('text', { class: 'nhan-vecto', fill: mau }, g);
  return {
    g,
    dat(a, b, nhan = '', lechNhan = [8, -8]) {
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const n = Math.hypot(dx, dy);
      g.style.display = n < 0.5 ? 'none' : '';
      if (n < 0.5) return;
      const [ux, uy] = [dx / n, dy / n];
      const s = Math.min(13, n * 0.45);
      than.setAttribute('x1', a[0].toFixed(1));
      than.setAttribute('y1', a[1].toFixed(1));
      than.setAttribute('x2', (b[0] - ux * s * 0.7).toFixed(1));
      than.setAttribute('y2', (b[1] - uy * s * 0.7).toFixed(1));
      dau.setAttribute('d', `M${b[0]} ${b[1]} L${b[0] - ux * s - uy * s * 0.45} ${b[1] - uy * s + ux * s * 0.45} L${b[0] - ux * s + uy * s * 0.45} ${b[1] - uy * s - ux * s * 0.45} Z`);
      chu.textContent = nhan;
      chu.setAttribute('x', ((a[0] + b[0]) / 2 + lechNhan[0]).toFixed(1));
      chu.setAttribute('y', ((a[1] + b[1]) / 2 + lechNhan[1]).toFixed(1));
    },
  };
}

/**
 * Bảng chữ trong SVG: trả về ma trận ô chữ (o[hang][cot]) để cập nhật nội dung.
 * cot = [{w, canh: 'start'|'end'|'middle'}], hàng đầu là tiêu đề.
 */
export function veBang(cha, x, y, cot, hangH, tieuDe, soHang) {
  const g = el('g', { class: 'bang-svg' }, cha);
  const rong = cot.reduce((t, c) => t + c.w, 0);
  const o = [];
  for (let h = 0; h <= soHang; h++) {
    el('rect', { x, y: y + h * hangH, width: rong, height: hangH, class: `hang-bang ${h ? '' : 'dau'}` }, g);
    let xc = x;
    o.push(cot.map((c, k) => {
      const canh = c.canh || 'start';
      const xt = canh === 'start' ? xc + 10 : canh === 'end' ? xc + c.w - 10 : xc + c.w / 2;
      xc += c.w;
      const t = el('text', { x: xt, y: y + h * hangH + hangH / 2 + 6, class: `chu-bang ${h ? '' : 'dam'}`, 'text-anchor': canh }, g);
      if (!h) t.textContent = tieuDe[k];
      return t;
    }));
  }
  return { g, o: o.slice(1) };
}

/** Điện trở (hình chữ nhật) dọc theo dây dẫn, bắt đầu tại (x, y), dài 'dai'. */
export function veDienTro(cha, x, y, dai = 46, doc = false, nhan = '') {
  const g = el('g', { class: 'linh-kien' }, cha);
  if (doc) el('rect', { x: x - 9, y, width: 18, height: dai, class: 'dien-tro' }, g);
  else el('rect', { x, y: y - 9, width: dai, height: 18, class: 'dien-tro' }, g);
  if (nhan) el('text', doc ? { x: x + 16, y: y + dai / 2 + 6, class: 'nhan-lk' } : { x: x + dai / 2, y: y - 16, class: 'nhan-lk', 'text-anchor': 'middle' }, g).textContent = nhan;
  return g;
}

/** Cuộn cảm (ba vòng bán nguyệt) dọc theo dây dẫn, bắt đầu tại (x, y), dài 'dai'. */
export function veCuonCam(cha, x, y, dai = 46, doc = false, nhan = '') {
  const g = el('g', { class: 'linh-kien' }, cha);
  const r = dai / 6;
  let d = doc ? `M${x} ${y}` : `M${x} ${y}`;
  for (let k = 0; k < 3; k++) d += doc ? ` a${r} ${r} 0 0 1 0 ${2 * r}` : ` a${r} ${r} 0 0 1 ${2 * r} 0`;
  el('path', { d, class: 'cuon-cam' }, g);
  if (nhan) el('text', doc ? { x: x + 16, y: y + dai / 2 + 6, class: 'nhan-lk' } : { x: x + dai / 2, y: y - 16, class: 'nhan-lk', 'text-anchor': 'middle' }, g).textContent = nhan;
  return g;
}

/** Cung chỉ góc giữa hai hướng (rad, theo trục y hướng lên) quanh tâm O. */
export function veCungGoc(cha, mau) {
  const g = el('g', {}, cha);
  const cung = el('path', { fill: 'none', stroke: mau, 'stroke-width': 2 }, g);
  const chu = el('text', { class: 'nhan-vecto', fill: mau, 'text-anchor': 'middle' }, g);
  return {
    dat(O, r, a1, a2, nhan) {
      let da = a2 - a1;
      while (da > Math.PI) da -= 2 * Math.PI;
      while (da < -Math.PI) da += 2 * Math.PI;
      g.style.display = Math.abs(da) < 0.02 ? 'none' : '';
      const p1 = [O[0] + r * Math.cos(a1), O[1] - r * Math.sin(a1)];
      const p2 = [O[0] + r * Math.cos(a1 + da), O[1] - r * Math.sin(a1 + da)];
      cung.setAttribute('d', `M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A${r} ${r} 0 0 ${da > 0 ? 0 : 1} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`);
      const am = a1 + da / 2;
      chu.setAttribute('x', (O[0] + (r + 18) * Math.cos(am)).toFixed(1));
      chu.setAttribute('y', (O[1] - (r + 18) * Math.sin(am) + 6).toFixed(1));
      chu.textContent = nhan;
    },
  };
}
