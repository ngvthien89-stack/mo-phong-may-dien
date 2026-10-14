/**
 * do-thi.js — Đồ thị nhỏ: đồ thị phụ tải ngày (trong sơ đồ) và đồ thị theo thời gian (kịch bản tăng tải).
 */
import { el } from './so-do.js';
import { noiSuyDoThi, dinhDangSo } from './tinh-toan.js';

const dinhDangGio = (g) => {
  const h = Math.floor(g) % 24;
  const m = Math.round((g - Math.floor(g)) * 60);
  return `${String(h).padStart(2, '0')}:${String(m === 60 ? 0 : m).padStart(2, '0')}`;
};
export { dinhDangGio };

function mucTron(x) {
  const buoc = x > 200 ? 100 : x > 80 ? 50 : x > 20 ? 10 : 5;
  return Math.ceil(x / buoc) * buoc;
}

/**
 * Đồ thị phụ tải ngày (tổng các khu vực) đặt ở góc trên bên phải sơ đồ.
 * @param {SVGElement} cha  @param {Array} phuTai  @param {(gio:number)=>void} khiChonGio
 */
export function veDoThiPhuTai(cha, phuTai, khiChonGio, khung = { x: 1212, y: 10, w: 378, h: 205 }) {
  const g = el('g', { class: 'do-thi-phu-tai' }, cha);
  const { x, y, w, h } = khung;
  el('rect', { x, y, width: w, height: h, rx: 12, class: 'nen-do-thi' }, g);
  el('text', { x: x + 16, y: y + 24, class: 'tieu-de-do-thi' }, g).textContent = 'Đồ thị phụ tải ngày (tổng, MW)';
  const vx0 = x + 46;
  const vx1 = x + w - 16;
  const vy0 = y + 44;
  const vy1 = y + h - 30;
  const tong = (gio) => phuTai.reduce((s, p) => s + p.Pmax_MW * noiSuyDoThi(p.doThi, gio), 0);
  const diem = [];
  for (let i = 0; i <= 96; i++) diem.push([i / 4, tong(i / 4)]);
  const yMax = mucTron(Math.max(...diem.map((d) => d[1])) * 1.05);
  const sx = (gio) => vx0 + (gio / 24) * (vx1 - vx0);
  const sy = (P) => vy1 - (P / yMax) * (vy1 - vy0);
  for (const v of [0, yMax / 2, yMax]) {
    el('line', { x1: vx0, x2: vx1, y1: sy(v), y2: sy(v), class: v === 0 ? 'truc' : 'luoi' }, g);
    el('text', { x: vx0 - 6, y: sy(v) + 4, class: 'chu-truc', 'text-anchor': 'end' }, g).textContent = dinhDangSo(v, 0);
  }
  for (const gio of [0, 6, 12, 18, 24]) {
    el('text', { x: sx(gio), y: vy1 + 17, class: 'chu-truc', 'text-anchor': 'middle' }, g).textContent = `${gio}h`;
  }
  const dLine = diem.map((d, i) => `${i ? 'L' : 'M'}${sx(d[0]).toFixed(1)} ${sy(d[1]).toFixed(1)}`).join(' ');
  el('path', { d: `${dLine} L${vx1} ${vy1} L${vx0} ${vy1} Z`, class: 'vung-do-thi' }, g);
  el('path', { d: dLine, class: 'duong-do-thi' }, g);
  // Con trỏ thời điểm hiện tại
  const vach = el('line', { y1: vy0 - 4, y2: vy1, class: 'vach-hien-tai' }, g);
  const cham = el('circle', { r: 5, class: 'cham-hien-tai' }, g);
  const chu = el('text', { class: 'chu-hien-tai' }, g);
  // Lớp rê chuột
  const vachRe = el('line', { x1: vx0, x2: vx0, y1: vy0, y2: vy1, class: 'vach-re', opacity: 0 }, g);
  const chuRe = el('text', { x: (vx0 + vx1) / 2, y: vy0 - 2, class: 'chu-re', opacity: 0, 'text-anchor': 'middle' }, g);
  const vungRe = el('rect', { x: vx0, y: vy0 - 6, width: vx1 - vx0, height: vy1 - vy0 + 12, class: 'vung-re-do-thi' }, g);
  const gioTuSuKien = (e) => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(cha.getScreenCTM().inverse());
    return Math.max(0, Math.min(24, ((p.x - vx0) / (vx1 - vx0)) * 24));
  };
  vungRe.addEventListener('pointermove', (e) => {
    const gio = gioTuSuKien(e);
    vachRe.setAttribute('x1', sx(gio));
    vachRe.setAttribute('x2', sx(gio));
    vachRe.setAttribute('opacity', 1);
    chuRe.setAttribute('x', Math.min(vx1 - 50, Math.max(vx0 + 50, sx(gio))));
    chuRe.setAttribute('y', vy0 - 2);
    chuRe.textContent = `${dinhDangGio(gio)} · ${dinhDangSo(tong(gio), 0)} MW`;
    chuRe.setAttribute('opacity', 1);
    chu.setAttribute('opacity', 0);
  });
  vungRe.addEventListener('pointerleave', () => {
    vachRe.setAttribute('opacity', 0);
    chuRe.setAttribute('opacity', 0);
    chu.setAttribute('opacity', 1);
  });
  vungRe.addEventListener('click', (e) => khiChonGio(Math.round(gioTuSuKien(e) * 4) / 4));
  return {
    capNhat(gio, Pthuc) {
      const P = Pthuc ?? tong(gio);
      vach.setAttribute('x1', sx(gio));
      vach.setAttribute('x2', sx(gio));
      cham.setAttribute('cx', sx(gio));
      cham.setAttribute('cy', sy(Math.min(P, yMax)));
      const benPhai = gio < 13;
      chu.setAttribute('x', sx(gio) + (benPhai ? 8 : -8));
      chu.setAttribute('y', Math.max(vy0 + 12, sy(Math.min(P, yMax)) - 10));
      chu.setAttribute('text-anchor', benPhai ? 'start' : 'end');
      chu.textContent = `${dinhDangGio(gio)} · ${dinhDangSo(P, 0)} MW`;
    },
  };
}

/**
 * Đồ thị đường theo thời gian (vẽ lại toàn bộ mỗi lần cập nhật — số điểm nhỏ).
 * @param {SVGSVGElement} svg viewBox 0 0 320 130
 * @param {{ten:string, mau:string, du:Array<[number,number]>}[]} dayDuLieu
 */
export function veDoThiThoiGian(svg, dayDuLieu, { donVi = '', soLe = 0, yMin, yMax, khoangThoiGian = 40 } = {}) {
  svg.innerHTML = '';
  const W = 320;
  const H = 130;
  const x0 = 46;
  const x1 = W - 54;
  const y0 = 10;
  const y1 = H - 22;
  const tatCa = dayDuLieu.flatMap((d) => d.du);
  if (!tatCa.length) return;
  const tCuoi = Math.max(...tatCa.map((p) => p[0]));
  const tDau = tCuoi - khoangThoiGian;
  let lo = yMin ?? Math.min(...tatCa.map((p) => p[1]));
  let hi = yMax ?? Math.max(...tatCa.map((p) => p[1]));
  if (hi - lo < 1e-6) { hi += 1; lo -= 1; }
  const dem = (hi - lo) * 0.1;
  lo -= dem; hi += dem;
  const sx = (t) => x0 + ((t - tDau) / khoangThoiGian) * (x1 - x0);
  const sy = (v) => y1 - ((v - lo) / (hi - lo)) * (y1 - y0);
  for (const v of [lo + dem, (lo + hi) / 2, hi - dem]) {
    el('line', { x1: x0, x2: x1, y1: sy(v), y2: sy(v), class: 'luoi' }, svg);
    el('text', { x: x0 - 5, y: sy(v) + 4, class: 'chu-truc', 'text-anchor': 'end' }, svg).textContent = dinhDangSo(v, soLe);
  }
  el('line', { x1: x0, x2: x1, y1, y2: y1, class: 'truc' }, svg);
  el('text', { x: x0, y: H - 6, class: 'chu-truc' }, svg).textContent = `−${khoangThoiGian} s`;
  el('text', { x: x1, y: H - 6, class: 'chu-truc', 'text-anchor': 'end' }, svg).textContent = `bây giờ (${donVi})`;
  const nhanY = [];
  for (const d of dayDuLieu) {
    const pts = d.du.filter((p) => p[0] >= tDau);
    if (!pts.length) continue;
    el('path', {
      d: pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0]).toFixed(1)} ${sy(p[1]).toFixed(1)}`).join(' '),
      fill: 'none', stroke: d.mau, 'stroke-width': 2, 'stroke-linejoin': 'round',
    }, svg);
    const cuoi = pts[pts.length - 1];
    let yNhan = sy(cuoi[1]) + 4;
    for (const yk of nhanY) if (Math.abs(yk - yNhan) < 13) yNhan = yk + (yNhan >= yk ? 13 : -13);
    nhanY.push(yNhan);
    el('circle', { cx: sx(cuoi[0]), cy: sy(cuoi[1]), r: 3.5, fill: d.mau }, svg);
    el('text', { x: x1 + 6, y: yNhan, class: 'chu-nhan-duong' }, svg).textContent = dinhDangSo(cuoi[1], soLe);
  }
}
