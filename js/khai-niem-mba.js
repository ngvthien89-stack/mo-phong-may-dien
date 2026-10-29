/**
 * khai-niem-mba.js — Trang 2.1–2.3 "Định nghĩa, vai trò và công dụng của máy biến áp" (slide 13–24).
 *
 * Kịch bản a (dinh-nghia): MBA một pha nguồn – tải, đồ thị u1(t), u2(t) cùng tần số; thử nguồn một chiều; ký hiệu.
 * Kịch bản b (truyen-tai): sơ đồ slide 14, so sánh tỉ lệ I, ΔU, ΔP khi truyền cùng S ở các cấp điện áp.
 * Kịch bản c (chuyen-dung): MBA chuyên dụng; máy biến dòng điện và máy biến điện áp (slide 24).
 */
import { el } from './so-do.js';
import { soSanhTruyenTai, soLanGiam, dienApChuanHoa, chuKy, loaiMBA, doLechKim } from './may-bien-ap.js';
import { dinhDangSo } from './tinh-toan.js';
import { khoiTaoTrinhChieu } from './trinh-chieu.js';
import { khoiTaoCauHoi } from './kiem-tra.js';
import { napJSON, soCoNghia } from './tien-ich.js';

const $ = (s) => document.querySelector(s);
const kV = (u) => `${dinhDangSo(u, u < 1 ? 1 : 0)} kV`;
const MAU = { u1: '#2a78d6', u2: '#eb6834', phi: '#2a78d6', I: '#2a78d6', dU: '#7b2cbf', dP: '#d62828' };
const CUA_SO_S = 0.04; // cửa sổ thời gian của đồ thị: 40 ms

/** Cuộn dây vẽ dạng các vòng quấn quanh một trụ đứng của lõi (x0…x1 là mép trụ). */
function veCuonDung(cha, x0, x1, y0, y1, soVong, lop = 'cuon-day') {
  let d = '';
  const buoc = (y1 - y0) / (soVong - 1);
  for (let k = 0; k < soVong; k++) {
    const y = y0 + k * buoc;
    d += `M${x0 - 10} ${y + 7} C${x0 - 14} ${y - 6} ${x1 + 14} ${y - 13} ${x1 + 10} ${y} `;
  }
  return el('path', { d, class: lop }, cha);
}

/** Cuộn dây quấn quanh một trụ nằm ngang (y0…y1 là mép trụ). */
function veCuonNgang(cha, x0, x1, y0, y1, soVong, lop = 'cuon-day') {
  let d = '';
  const buoc = (x1 - x0) / (soVong - 1);
  for (let k = 0; k < soVong; k++) {
    const x = x0 + k * buoc;
    d += `M${x - 6} ${y1 + 9} C${x - 12} ${y1 + 12} ${x - 14} ${y0 - 12} ${x} ${y0 - 9} `;
  }
  return el('path', { d, class: lop }, cha);
}

/** Ký hiệu MBA: hai vòng tròn giao nhau, có thể ghi kiểu nối dây. */
function veKyHieu(cha, cx, cy, r, { trai = '', phai = '', dai = 90, lop = '' } = {}) {
  const g = el('g', { class: `ky-hieu-mba ${lop}` }, cha);
  el('line', { x1: cx - r * 0.55 - r - dai, y1: cy, x2: cx - r * 0.55 - r, y2: cy, class: 'day-ky-hieu' }, g);
  el('line', { x1: cx + r * 0.55 + r, y1: cy, x2: cx + r * 0.55 + r + dai, y2: cy, class: 'day-ky-hieu' }, g);
  el('circle', { cx: cx - r * 0.55, cy, r, class: 'vong-ky-hieu' }, g);
  el('circle', { cx: cx + r * 0.55, cy, r, class: 'vong-ky-hieu' }, g);
  if (trai === 'Y') {
    const [x, y, a] = [cx - r * 0.85, cy, r * 0.32];
    el('path', { d: `M${x} ${y} L${x - a} ${y - a} M${x} ${y} L${x - a} ${y + a} M${x} ${y} L${x + a * 0.9} ${y}`, class: 'net-noi-day' }, g);
  }
  if (phai === 'D') {
    const [x, y, a] = [cx + r * 0.9, cy, r * 0.34];
    el('path', { d: `M${x + a} ${y - a} L${x - a} ${y} L${x + a} ${y + a} Z`, class: 'net-noi-day' }, g);
  }
  return g;
}

/** Đồng hồ đo kim (ampe kế / vôn kế), kim lệch từ 0 đến 120 %. */
function veDongHoDo(cha, cx, cy, kyHieu) {
  const g = el('g', { class: 'dong-ho-do' }, cha);
  const R = 44;
  el('circle', { cx, cy, r: R, class: 'vo-dong-ho' }, g);
  const goc = (k) => ((-150 + 120 * k) * Math.PI) / 180;
  let d = '';
  for (let i = 0; i <= 24; i++) {
    const a = goc(i / 20);
    d += `${i ? 'L' : 'M'}${(cx + (R - 8) * Math.cos(a)).toFixed(1)} ${(cy + (R - 8) * Math.sin(a)).toFixed(1)}`;
  }
  el('path', { d, class: 'thang-dong-ho' }, g);
  const a100 = goc(1);
  el('line', { x1: cx + (R - 14) * Math.cos(a100), y1: cy + (R - 14) * Math.sin(a100), x2: cx + (R - 4) * Math.cos(a100), y2: cy + (R - 4) * Math.sin(a100), class: 'vach-100' }, g);
  el('text', { x: cx, y: cy + 26, class: 'chu-dong-ho', 'text-anchor': 'middle' }, g).textContent = kyHieu;
  const kim = el('line', { x1: cx, y1: cy, class: 'kim-dong-ho' }, g);
  el('circle', { cx, cy, r: 5, class: 'truc-dong-ho' }, g);
  return {
    dauTrai: [cx - R, cy],
    dauPhai: [cx + R, cy],
    dat(k) {
      const a = goc(k);
      kim.setAttribute('x2', (cx + (R - 10) * Math.cos(a)).toFixed(1));
      kim.setAttribute('y2', (cy + (R - 10) * Math.sin(a)).toFixed(1));
    },
  };
}

function veSanKhau(svg, nd) {
  svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  const mk = (id, mau) => {
    const m = el('marker', { id, viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 4, markerHeight: 4, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 0 L10 5 L0 10 Z', fill: mau }, m);
  };
  mk('mui-den', '#13202b');
  mk('mui-xanh', '#2a78d6');
  el('rect', { x: -2000, y: -1200, width: 5600, height: 3300, class: 'nen-san-khau' }, svg);
  const r = { a: {}, b: {}, c: {} };

  // ======================= A: ĐỊNH NGHĨA =======================
  const gA = el('g', { class: 'kb-dinh-nghia' }, svg);
  r.a.g = gA;
  const gMach = el('g', { class: 'khu' }, gA);
  el('rect', { x: 20, y: 20, width: 980, height: 480, rx: 18, class: 'the-svg' }, gMach);
  el('text', { x: 44, y: 60, class: 'tieu-de-svg' }, gMach).textContent = 'Máy biến áp: biến đổi điện áp, giữ nguyên tần số';
  el('text', { x: 44, y: 92, class: 'chu-svg' }, gMach).textContent = 'Từ thông xoay chiều φ trong lõi thép liên kết hai cuộn dây w₁ và w₂.';
  // nguồn
  el('circle', { cx: 120, cy: 290, r: 46, class: 'vo-nguon-ac' }, gMach);
  r.a.kyHieuNguon = el('path', { class: 'ky-hieu-nguon' }, gMach);
  el('text', { x: 40, y: 232, class: 'chu-svg dam' }, gMach).textContent = 'Nguồn';
  // lõi thép
  const L = { x0: 360, x1: 660, y0: 160, y1: 420, day: 44 };
  el('path', {
    d: `M${L.x0} ${L.y0} H${L.x1} V${L.y1} H${L.x0} Z M${L.x0 + L.day} ${L.y0 + L.day} V${L.y1 - L.day} H${L.x1 - L.day} V${L.y0 + L.day} Z`,
    class: 'loi-thep-ab', 'fill-rule': 'evenodd',
  }, gMach);
  const m = L.day / 2;
  r.a.phi = el('rect', { x: L.x0 + m, y: L.y0 + m, width: L.x1 - L.x0 - 2 * m, height: L.y1 - L.y0 - 2 * m, class: 'dong-phi-ab' }, gMach);
  r.a.chuPhi = el('text', { x: (L.x0 + L.x1) / 2, y: L.y0 - 12, class: 'chu-vec vec-b', 'text-anchor': 'middle' }, gMach);
  r.a.chuPhi.textContent = 'φ';
  veCuonDung(gMach, L.x0, L.x0 + L.day, 210, 370, 7);
  veCuonDung(gMach, L.x1 - L.day, L.x1, 220, 360, 5);
  el('text', { x: L.x0 + L.day + 12, y: 296, class: 'chu-vec' }, gMach).textContent = 'w₁';
  el('text', { x: L.x1 - L.day - 50, y: 296, class: 'chu-vec' }, gMach).textContent = 'w₂';
  // dây nối nguồn – sơ cấp, thứ cấp – tải
  el('path', { d: `M120 244 V200 H${L.x0 - 10} V217 M120 336 V380 H${L.x0 - 10} V363`, class: 'day-mach' }, gMach);
  el('path', { d: `M${L.x1 + 10} 227 V200 H860 V250 M${L.x1 + 10} 353 V380 H860 V330`, class: 'day-mach' }, gMach);
  r.a.hatTrai = Array.from({ length: 10 }, () => el('circle', { r: 5, class: 'hat-dong' }, gMach));
  r.a.hatPhai = Array.from({ length: 10 }, () => el('circle', { r: 5, class: 'hat-dong' }, gMach));
  // tải: bóng đèn
  r.a.quangDen = el('circle', { cx: 860, cy: 290, r: 60, class: 'quang-den' }, gMach);
  el('circle', { cx: 860, cy: 290, r: 40, class: 'bong-den' }, gMach);
  el('path', { d: 'M840 304 L850 276 L860 300 L870 276 L880 304', class: 'soi-den' }, gMach);
  el('text', { x: 926, y: 297, class: 'chu-svg dam' }, gMach).textContent = 'Tải';
  r.a.nhanU1 = el('text', { x: 240, y: 186, class: 'nhan-u u1', 'text-anchor': 'middle' }, gMach);
  r.a.nhanU2 = el('text', { x: 760, y: 186, class: 'nhan-u u2', 'text-anchor': 'middle' }, gMach);
  r.a.nhanF1 = el('text', { x: 240, y: 410, class: 'chu-svg', 'text-anchor': 'middle' }, gMach);
  r.a.nhanF2 = el('text', { x: 760, y: 410, class: 'chu-svg', 'text-anchor': 'middle' }, gMach);
  el('text', { x: 230, y: 440, class: 'chu-svg-nho', 'text-anchor': 'middle' }, gMach).textContent = 'sơ cấp';
  el('text', { x: 770, y: 440, class: 'chu-svg-nho', 'text-anchor': 'middle' }, gMach).textContent = 'thứ cấp';
  r.a.loaiMBA = el('text', { x: 510, y: 470, class: 'loai-mba', 'text-anchor': 'middle' }, gMach);

  // đồ thị u1(t), u2(t)
  const gDT = el('g', { class: 'khu' }, gA);
  el('rect', { x: 20, y: 520, width: 980, height: 370, rx: 18, class: 'the-svg' }, gDT);
  r.a.dt = [];
  for (const [k, x0, ten, mau] of [[0, 70, 'u₁(t)', MAU.u1], [1, 545, 'u₂(t)', MAU.u2]]) {
    const o = { x0, x1: x0 + 420, yGiua: 712, bien: 105 };
    el('text', { x: x0 - 26, y: 560, class: 'tieu-de-do-thi-dt' }, gDT).textContent = ten;
    o.tieuDe = el('text', { x: x0 + 420, y: 560, class: 'chu-svg', 'text-anchor': 'end' }, gDT);
    el('line', { x1: x0, x2: o.x1, y1: o.yGiua, y2: o.yGiua, class: 'truc-0' }, gDT);
    for (const s of [-1, 1]) {
      el('line', { x1: x0, x2: o.x1, y1: o.yGiua - s * o.bien, y2: o.yGiua - s * o.bien, class: 'luoi-dt' }, gDT);
      el('text', { x: x0 - 6, y: o.yGiua - s * o.bien + 5, class: 'chu-truc-dt', 'text-anchor': 'end' }, gDT).textContent = s > 0 ? '+Um' : '−Um';
    }
    for (let ms = 0; ms <= 40; ms += 10) {
      el('text', { x: x0 + (ms / 40) * 420, y: o.yGiua + o.bien + 26, class: 'chu-truc-dt', 'text-anchor': 'middle' }, gDT).textContent = `${ms} ms`;
    }
    o.gChuKy = el('g', {}, gDT);
    o.duong = el('path', { class: 'duong-dt', stroke: mau }, gDT);
    o.cham = el('circle', { r: 7, fill: mau, class: 'cham-dt' }, gDT);
    r.a.dt[k] = o;
  }
  r.a.chuT = el('text', { x: 510, y: 878, class: 'chu-svg dam', 'text-anchor': 'middle' }, gDT);

  // ký hiệu
  const gKH = el('g', { class: 'khu' }, gA);
  el('rect', { x: 1020, y: 20, width: 560, height: 480, rx: 18, class: 'the-svg' }, gKH);
  el('text', { x: 1044, y: 60, class: 'tieu-de-svg' }, gKH).textContent = 'Ký hiệu MBA trong hệ thống điện lực';
  veKyHieu(gKH, 1300, 160, 44, { dai: 110 });
  el('text', { x: 1300, y: 240, class: 'chu-svg', 'text-anchor': 'middle' }, gKH).textContent = 'Mỗi vòng tròn tượng trưng cho một dây quấn';
  veKyHieu(gKH, 1300, 340, 44, { dai: 110, trai: 'Y', phai: 'D' });
  el('text', { x: 1300, y: 420, class: 'chu-svg', 'text-anchor': 'middle' }, gKH).textContent = 'Ký hiệu có ghi kiểu nối dây: Y (sao), Δ (tam giác)';
  el('text', { x: 1300, y: 450, class: 'chu-svg-nho', 'text-anchor': 'middle' }, gKH).textContent = 'Tổ nối dây được học ở phần V – Máy biến áp ba pha';

  // ba ý của định nghĩa
  const gY = el('g', { class: 'khu' }, gA);
  el('rect', { x: 1020, y: 520, width: 560, height: 370, rx: 18, class: 'the-svg' }, gY);
  el('text', { x: 1044, y: 560, class: 'tieu-de-svg' }, gY).textContent = 'Ba ý chính của định nghĩa';
  r.a.y = [
    ['Thiết bị điện từ tĩnh', 'Không có bộ phận chuyển động.'],
    ['Nguyên lý cảm ứng điện từ', 'φ biến thiên sinh ra sđđ ở w₂ (bài 1.2.a).'],
    ['Biến đổi điện áp xoay chiều', 'U₁ ≠ U₂ nhưng giữ nguyên tần số: f₁ = f₂.'],
  ].map(([a, b], k) => {
    const y = 600 + k * 96;
    const g = el('g', { class: 'y-chinh' }, gY);
    el('circle', { cx: 1066, cy: y + 18, r: 20, class: 'nen-y' }, g);
    const dau = el('text', { x: 1066, y: y + 26, class: 'dau-y', 'text-anchor': 'middle' }, g);
    el('text', { x: 1100, y: y + 12, class: 'ten-y' }, g).textContent = a;
    const phu = el('text', { x: 1100, y: y + 40, class: 'chu-svg' }, g);
    phu.textContent = b;
    return { g, dau, phu, goc: b };
  });

  // ======================= B: TRUYỀN TẢI =======================
  const gB = el('g', { class: 'kb-truyen-tai' }, svg);
  r.b.g = gB;
  const gSD = el('g', { class: 'khu' }, gB);
  el('rect', { x: 20, y: 20, width: 1560, height: 400, rx: 18, class: 'the-svg' }, gSD);
  el('text', { x: 44, y: 60, class: 'tieu-de-svg' }, gSD).textContent = 'Sử dụng MBA để truyền tải và phân phối điện năng (slide 14)';
  const yL = 230;
  el('circle', { cx: 110, cy: yL, r: 40, class: 'vo-nguon-ac' }, gSD);
  el('path', { d: 'M90 230 q10 -18 20 0 t20 0', class: 'ky-hieu-nguon' }, gSD);
  el('text', { x: 110, y: 300, class: 'chu-svg dam', 'text-anchor': 'middle' }, gSD).textContent = 'MFĐ';
  el('text', { x: 110, y: 326, class: 'chu-svg', 'text-anchor': 'middle' }, gSD).textContent = nd.capDienAp.mayPhat;
  el('line', { x1: 150, x2: 250, y1: yL, y2: yL, class: 'day-ky-hieu' }, gSD);
  el('line', { x1: 220, x2: 220, y1: yL - 16, y2: yL + 16, class: 'day-ky-hieu' }, gSD);
  r.b.mbaTang = veKyHieu(gSD, 330, yL, 32, { dai: 30 });
  r.b.nhanTang = el('text', { x: 330, y: 300, class: 'chu-svg dam', 'text-anchor': 'middle' }, gSD);
  r.b.nhanTang.textContent = 'MBA tăng áp';
  r.b.gachTang = el('path', { d: 'M286 190 L374 270 M374 190 L286 270', class: 'gach-bo' }, gSD);
  // đường dây và cột
  const xD0 = 410;
  const xD1 = 1180;
  r.b.xD = [xD0, xD1];
  for (const x of [470, 620, 970, 1120]) {
    el('path', { d: `M${x - 18} ${yL + 80} L${x} ${yL - 44} L${x + 18} ${yL + 80} M${x - 26} ${yL - 22} H${x + 26} M${x - 9} ${yL + 18} H${x + 9}`, class: 'cot-dien' }, gSD);
  }
  r.b.day = el('line', { x1: xD0, x2: xD1, y1: yL, y2: yL, class: 'day-truyen-tai' }, gSD);
  el('text', { x: (xD0 + xD1) / 2, y: 150, class: 'chu-svg', 'text-anchor': 'middle', 'font-style': 'italic' }, gSD).textContent = 'Đường dây truyền tải';
  r.b.nhanU = el('text', { x: (xD0 + xD1) / 2, y: 292, class: 'nhan-u-day', 'text-anchor': 'middle' }, gSD);
  r.b.hat = Array.from({ length: 36 }, () => el('circle', { r: 6, class: 'hat-cong-suat' }, gSD));
  r.b.song = Array.from({ length: 6 }, (_, k) => el('path', { class: 'song-nhiet-day', d: `M${470 + k * 130} 0 q-8 -10 0 -20 q8 -10 0 -20` }, gSD));
  veKyHieu(gSD, 1260, yL, 32, { dai: 30 });
  el('text', { x: 1260, y: 300, class: 'chu-svg dam', 'text-anchor': 'middle' }, gSD).textContent = 'MBA hạ áp';
  el('line', { x1: 1340, x2: 1340, y1: yL - 60, y2: yL + 60, class: 'day-ky-hieu' }, gSD);
  for (const y of [yL - 50, yL, yL + 50]) el('line', { x1: 1340, x2: 1420, y1: y, y2: y, class: 'day-ky-hieu', 'marker-end': 'url(#mui-den)' }, gSD);
  el('text', { x: 1500, y: yL - 6, class: 'chu-svg dam', 'text-anchor': 'middle' }, gSD).textContent = 'Hộ tiêu thụ';
  el('text', { x: 1500, y: yL + 20, class: 'chu-svg', 'text-anchor': 'middle' }, gSD).textContent = nd.capDienAp.hoTieuThu;
  r.b.dongSo = el('text', { x: 44, y: 396, class: 'chu-kq' }, gSD);

  // biểu đồ so sánh
  const gBD = el('g', { class: 'khu' }, gB);
  el('rect', { x: 20, y: 440, width: 1000, height: 450, rx: 18, class: 'the-svg' }, gBD);
  el('text', { x: 44, y: 480, class: 'tieu-de-svg' }, gBD).textContent = 'Cùng công suất S – so với truyền ở 21 kV (100 %)';
  const BD = { x0: 100, x1: 990, yTren: 560, yDuoi: 820 };
  r.b.BD = BD;
  for (const p of [0, 50, 100]) {
    const y = BD.yDuoi - (p / 100) * (BD.yDuoi - BD.yTren);
    el('line', { x1: BD.x0, x2: BD.x1, y1: y, y2: y, class: p ? 'luoi-dt' : 'truc-0' }, gBD);
    el('text', { x: BD.x0 - 10, y: y + 5, class: 'chu-truc-dt', 'text-anchor': 'end' }, gBD).textContent = `${p} %`;
  }
  const dsU = [nd.capDienAp.uMayPhat_kV, ...nd.capDienAp.truyenTai];
  const buoc = (BD.x1 - BD.x0) / dsU.length;
  r.b.nhom = dsU.map((U, k) => {
    const xc = BD.x0 + buoc * (k + 0.5);
    const g = el('g', { class: 'nhom-cot', 'data-u': U }, gBD);
    el('rect', { x: xc - buoc / 2 + 6, y: BD.yTren - 30, width: buoc - 12, height: BD.yDuoi - BD.yTren + 80, rx: 10, class: 'nen-nhom-cot' }, g);
    const ss = soSanhTruyenTai(U, nd.capDienAp.uMayPhat_kV);
    ['I', 'dU', 'dP'].forEach((kh, j) => {
      const x = xc + (j - 1) * 52;
      const h = ss[kh] * (BD.yDuoi - BD.yTren);
      el('rect', { x: x - 22, y: BD.yDuoi - h, width: 44, height: Math.max(h, 1.5), rx: 3, fill: MAU[kh] }, g);
      el('text', { x, y: BD.yDuoi - h - 8, class: 'gt-cot-tt', 'text-anchor': 'middle' }, g).textContent = `${soCoNghia(ss[kh] * 100, 2)}%`;
    });
    el('text', { x: xc, y: BD.yDuoi + 30, class: 'ten-nhom-cot', 'text-anchor': 'middle' }, g).textContent = kV(U);
    return g;
  });
  [['I_d', MAU.I], ['ΔU', MAU.dU], ['ΔP', MAU.dP]].forEach(([ten, mau], k) => {
    el('rect', { x: 640 + k * 120, y: 505, width: 18, height: 18, rx: 3, fill: mau }, gBD);
    chuChiSo(el('text', { x: 664 + k * 120, y: 520, class: 'chu-svg' }, gBD), ten);
  });

  // hệ quả
  const gHQ = el('g', { class: 'khu' }, gB);
  el('rect', { x: 1040, y: 440, width: 540, height: 450, rx: 18, class: 'the-svg' }, gHQ);
  chuChiSo(el('text', { x: 1064, y: 480, class: 'tieu-de-svg' }, gHQ), 'Cùng S, nếu ↑U_d → ↓I_d dẫn đến:');
  chuChiSo(el('text', { x: 1064, y: 522, class: 'chu-svg' }, gHQ), 'S = √3·U_d·I_d ⇒ I_d tỉ lệ nghịch với U_d');
  r.b.hq = nd.lyThuyet.ketQuaTangAp.map((t, k) => {
    chuChiSo(el('text', { x: 1064, y: 580 + k * 62, class: 'chu-hq' }, gHQ), `→ ${t}`);
    return el('text', { x: 1090, y: 606 + k * 62, class: 'chu-hq-so' }, gHQ);
  });
  r.b.ketLuan = el('text', { x: 1064, y: 800, class: 'chu-kq dam' }, gHQ);
  r.b.ketLuan2 = el('text', { x: 1064, y: 832, class: 'chu-kq dam' }, gHQ);
  chuChiSo(el('text', { x: 1064, y: 870, class: 'chu-svg-nho' }, gHQ), 'Tỉ lệ tính với cùng S, cùng đường dây (R_d, z không đổi).');

  // ======================= C: CHUYÊN DỤNG =======================
  const gC = el('g', { class: 'kb-chuyen-dung' }, svg);
  r.c.g = gC;
  const gDL = el('g', { class: 'khu khu-do-luong' }, gC);
  r.c.khuDoLuong = gDL;
  el('rect', { x: 20, y: 20, width: 1000, height: 870, rx: 18, class: 'the-svg' }, gDL);
  el('text', { x: 44, y: 60, class: 'tieu-de-svg' }, gDL).textContent = 'Máy biến dòng điện và máy biến điện áp (slide 24)';
  const y1 = 150;
  const y2 = 210;
  el('text', { x: 50, y: y1 - 10, class: 'chu-svg-nho' }, gDL).textContent = 'dây 1';
  el('text', { x: 50, y: y2 - 10, class: 'chu-svg-nho' }, gDL).textContent = 'dây 2';
  // máy biến dòng (bên trái)
  const BI = { x0: 200, x1: 380, y0: 300, y1: 500, day: 30 };
  const BU = { x0: 600, x1: 780, y0: 300, y1: 500, day: 30 };
  const loi = (o) => el('path', {
    d: `M${o.x0} ${o.y0} H${o.x1} V${o.y1} H${o.x0} Z M${o.x0 + o.day} ${o.y0 + o.day} V${o.y1 - o.day} H${o.x1 - o.day} V${o.y0 + o.day} Z`,
    class: 'loi-thep-ab', 'fill-rule': 'evenodd',
  }, gDL);
  loi(BI);
  loi(BU);
  for (const o of [BI, BU]) {
    el('rect', { x: o.x0 + o.day / 2, y: o.y0 + o.day / 2, width: o.x1 - o.x0 - o.day, height: o.y1 - o.y0 - o.day, class: 'vien-tu-thong' }, gDL);
    veCuonNgang(gDL, o.x0 + 40, o.x1 - 40, o.y0, o.y0 + o.day, 6);
    veCuonNgang(gDL, o.x0 + 40, o.x1 - 40, o.y1 - o.day, o.y1, 6);
    el('text', { x: o.x1 + 14, y: o.y0 + 24, class: 'chu-vec chu-vec-nho' }, gDL).textContent = 'W1';
    el('text', { x: o.x1 + 14, y: o.y1 - 2, class: 'chu-vec chu-vec-nho' }, gDL).textContent = 'W2';
  }
  // đường dây: dây 1 liền; dây 2 đi qua W1 của máy biến dòng
  el('path', { d: `M40 ${y1} H980`, class: 'day-luoi' }, gDL);
  r.c.duongDay2 = `M40 ${y2} H${BI.x0 + 34} V${BI.y0 - 10} H${BI.x1 - 34} V${y2} H980`;
  el('path', { d: r.c.duongDay2, class: 'day-luoi' }, gDL);
  r.c.duongDay2El = el('path', { d: r.c.duongDay2, class: 'an' }, gDL);
  // W1 máy biến điện áp: một đầu nối dây 2, một đầu nối dây 1
  el('path', { d: `M${BU.x0 + 34} ${BU.y0 - 10} V${y2}`, class: 'day-luoi' }, gDL);
  el('path', { d: `M${BU.x1 - 34} ${BU.y0 - 10} V${y1}`, class: 'day-luoi' }, gDL);
  for (const [x, y] of [[BU.x0 + 34, y2], [BU.x1 - 34, y1]]) el('circle', { cx: x, cy: y, r: 6, class: 'diem-noi' }, gDL);
  // W2 – đồng hồ – nối đất
  const yDH = 640;
  const veMachDo = (o, kh) => {
    const cx = (o.x0 + o.x1) / 2;
    const dh = veDongHoDo(gDL, cx, yDH, kh);
    el('path', { d: `M${o.x0 + 34} ${o.y1 + 10} V${yDH} H${dh.dauTrai[0]}`, class: 'day-luoi' }, gDL);
    el('path', { d: `M${o.x1 - 34} ${o.y1 + 10} V${yDH} H${dh.dauPhai[0]}`, class: 'day-luoi' }, gDL);
    const xd = o.x0 + 34;
    el('path', { d: `M${xd} ${yDH} H${xd - 40} V${yDH + 30} M${xd - 58} ${yDH + 30} H${xd - 22} M${xd - 52} ${yDH + 38} H${xd - 28} M${xd - 46} ${yDH + 46} H${xd - 34}`, class: 'day-luoi' }, gDL);
    return dh;
  };
  r.c.ampe = veMachDo(BI, 'A');
  r.c.von = veMachDo(BU, 'V');
  r.c.chuA = el('text', { x: (BI.x0 + BI.x1) / 2, y: yDH + 74, class: 'chu-dong-ho-gt', 'text-anchor': 'middle' }, gDL);
  r.c.chuV = el('text', { x: (BU.x0 + BU.x1) / 2, y: yDH + 74, class: 'chu-dong-ho-gt', 'text-anchor': 'middle' }, gDL);
  for (const [x, dong] of [[44, ['Máy biến dòng điện:', 'W1 mắc nối tiếp trên dây 2,', 'W2 nối ampe kế A.']], [520, ['Máy biến điện áp:', 'W1 mắc giữa dây 1 và dây 2,', 'W2 nối vôn kế V.']]]) {
    dong.forEach((t, k) => { el('text', { x, y: 790 + k * 28, class: k ? 'chu-svg' : 'chu-svg dam' }, gDL).textContent = t; });
  }
  r.c.hatDay2 = Array.from({ length: 16 }, () => el('circle', { r: 5, class: 'hat-dong' }, gDL));

  // danh sách MBA chuyên dụng
  const gCD = el('g', { class: 'khu' }, gC);
  el('rect', { x: 1040, y: 20, width: 540, height: 870, rx: 18, class: 'the-svg' }, gCD);
  el('text', { x: 1064, y: 60, class: 'tieu-de-svg' }, gCD).textContent = 'MBA trong thiết bị chuyên dụng';
  r.c.muc = {};
  nd.lyThuyet.chuyenDung.forEach((c, k) => {
    const y = 90 + k * 176;
    const g = el('g', { class: 'muc-cd', 'data-muc': c.id }, gCD);
    el('rect', { x: 1056, y, width: 508, height: 160, rx: 14, class: 'nen-muc-cd' }, g);
    veBieuTuong(g, c.id, 1130, y + 80);
    el('text', { x: 1210, y: y + 62, class: 'chu-svg' }, g).textContent = c.noi;
    const ten = el('text', { x: 1210, y: y + 96, class: 'ten-muc-cd' }, g);
    if (c.id === 'do-luong') {
      ten.textContent = 'Máy biến điện áp,';
      el('text', { x: 1210, y: y + 126, class: 'ten-muc-cd' }, g).textContent = 'máy biến dòng điện…';
    } else ten.textContent = c.ten;
    r.c.muc[c.id] = g;
  });
  el('text', { x: 1064, y: 830, class: 'chu-svg-nho' }, gCD).textContent = 'Hình ảnh thực tế: slide 16–23 (MBA phân phối,';
  el('text', { x: 1064, y: 854, class: 'chu-svg-nho' }, gCD).textContent = 'trạm 110–500 kV, máy biến dòng, biến điện áp…).';
  return r;
}

/** Biểu tượng phẳng cho từng loại MBA chuyên dụng. */
function veBieuTuong(cha, id, cx, cy) {
  const g = el('g', { class: `bieu-tuong bt-${id}` }, cha);
  if (id === 'lo') {
    el('rect', { x: cx - 50, y: cy - 40, width: 100, height: 80, rx: 8, class: 'bt-vo' }, g);
    el('rect', { x: cx - 32, y: cy - 16, width: 64, height: 40, rx: 4, class: 'bt-cua-lo' }, g);
    el('path', { d: `M${cx} ${cy + 20} q-18 -12 -6 -30 q4 10 10 4 q-2 -12 8 -20 q10 20 4 30 q8 -2 8 -10 q8 18 -24 26 Z`, class: 'bt-lua' }, g);
  } else if (id === 'han') {
    el('path', { d: `M${cx - 46} ${cy - 30} L${cx + 6} ${cy + 22}`, class: 'bt-que-han' }, g);
    el('rect', { x: cx - 52, y: cy + 32, width: 104, height: 12, rx: 3, class: 'bt-vo' }, g);
    for (let k = 0; k < 8; k++) {
      const a = (-160 + k * 20) * (Math.PI / 180);
      el('line', { x1: cx + 10, y1: cy + 28, x2: cx + 10 + 34 * Math.cos(a), y2: cy + 28 + 34 * Math.sin(a), class: 'bt-tia' }, g);
    }
  } else if (id === 'thi-nghiem') {
    el('rect', { x: cx - 8, y: cy - 34, width: 16, height: 78, class: 'bt-cot' }, g);
    for (const y of [-40, -10, 20]) el('ellipse', { cx, cy: cy + y, rx: 40, ry: 9, class: 'bt-vanh' }, g);
    el('rect', { x: cx - 34, y: cy + 40, width: 68, height: 12, rx: 3, class: 'bt-vo' }, g);
  } else {
    el('circle', { cx, cy, r: 44, class: 'bt-vo-dh' }, g);
    el('path', { d: `M${cx - 32} ${cy + 6} A34 34 0 0 1 ${cx + 32} ${cy + 6}`, class: 'bt-thang' }, g);
    el('line', { x1: cx, y1: cy + 14, x2: cx + 20, y2: cy - 18, class: 'bt-kim' }, g);
    el('text', { x: cx, y: cy + 34, class: 'bt-chu', 'text-anchor': 'middle' }, g).textContent = 'A V';
  }
  return g;
}

/** Ghi chữ SVG, đổi "X_y" thành chỉ số dưới (tspan). */
function chuChiSo(o, chu) {
  o.textContent = '';
  for (const phan of chu.split(/(_[A-Za-z0-9]+)/)) {
    if (!phan) continue;
    const t = el('tspan', phan.startsWith('_') ? { class: 'chi-so-duoi', dy: 5 } : { dy: o.lastChild?.getAttribute('class') === 'chi-so-duoi' ? -5 : 0 }, o);
    t.textContent = phan.startsWith('_') ? phan.slice(1) : phan;
  }
  if (o.lastChild?.getAttribute('class') === 'chi-so-duoi') el('tspan', { dy: -5 }, o).textContent = '\u200b';
  return o;
}
const htmlChiSo = (chu) => chu.replace(/_([A-Za-z0-9]+)/g, '<sub>$1</sub>');

/** Vị trí trên một path theo tỉ lệ 0…1. */
const diemTrenPath = (p, tong, k) => p.getPointAtLength(((k % 1) + 1) % 1 * tong);

async function khoiDong() {
  let nd, cauHoi;
  try {
    [nd, cauHoi] = await Promise.all([napJSON('du-lieu/khai-niem-mba.json'), napJSON('du-lieu/cau-hoi-khai-niem-mba.json')]);
  } catch (loi) {
    const tb = $('#thong-bao-loi');
    tb.hidden = false;
    tb.innerHTML = `<h2>Không nạp được dữ liệu</h2><p>${loi.message}</p>
      <p>Hãy mở trang qua GitHub Pages hoặc máy chủ cục bộ (ví dụ <code>python3 -m http.server</code>), xem README.</p>`;
    return;
  }
  const svg = $('#so-do');
  const r = veSanKhau(svg, nd);
  const dn = nd.dinhNghia;
  const s = {
    kichBan: nd.macDinh.kichBan,
    dangChay: true,
    tocDo: 1,
    t: 0,
    U1: dn.U1_kV,
    U2: dn.U2_kV,
    f: dn.f_Hz,
    motChieu: false,
    U: 220,
    muc: 'do-luong',
    I: nd.doLuong.I_phanTram,
    Ud: nd.doLuong.U_phanTram,
    kimA: 0,
    kimV: 0,
  };

  // ---------- Lý thuyết ----------
  const lt = nd.lyThuyet;
  $('#the-ly-thuyet').innerHTML = `
    <p class="muc-nho">${lt.muc}</p>
    <h2>2.1. Định nghĩa</h2>
    <p class="phat-bieu">${lt.dinhNghia}</p>
    <h2>2.2. Vai trò của MBA</h2>
    <ul class="ghi-chu-ly-thuyet">${lt.vaiTro.map((v) => `<li>${v}</li>`).join('')}</ul>
    <h2>2.3. Công dụng của MBA</h2>
    <ul class="ghi-chu-ly-thuyet">
      <li>${lt.congDung} Máy phát ${nd.capDienAp.mayPhat} → MBA tăng áp → đường dây ${nd.capDienAp.truyenTai.join(', ')} kV → MBA hạ áp → hộ tiêu thụ ${nd.capDienAp.hoTieuThu}.</li>
      <li>Cùng công suất S, nếu ↑U<sub>d</sub> → ↓I<sub>d</sub> dẫn đến: ${htmlChiSo(lt.ketQuaTangAp.join('; '))}.</li>
      <li>MBA sử dụng trong các thiết bị chuyên dụng:
        <ul>${lt.chuyenDung.map((c) => `<li>${c.noi}: ${c.ten}</li>`).join('')}</ul>
      </li>
    </ul>
    <p class="ghi-chu-nho">${lt.hinhAnh}</p>`;

  // ---------- Điều khiển chung ----------
  const nutChay = $('#nut-chay');
  const datChay = (chay) => {
    s.dangChay = chay;
    nutChay.innerHTML = chay ? '<span aria-hidden="true">⏸</span> Tạm dừng' : '<span aria-hidden="true">▶</span> Chạy';
    nutChay.setAttribute('aria-pressed', String(!chay));
    document.body.classList.toggle('tam-dung', !chay);
  };
  nutChay.addEventListener('click', () => datChay(!s.dangChay));
  $('#toc-do').addEventListener('input', (e) => {
    s.tocDo = Number(e.target.value);
    $('#gia-tri-toc-do').textContent = `${dinhDangSo(s.tocDo, s.tocDo % 1 ? 2 : 0)}×`;
  });
  $('#chon-kich-ban').addEventListener('change', (e) => chonKichBan(e.target.value));
  const nutTMH = $('#nut-toan-man-hinh');
  if (!document.fullscreenEnabled) nutTMH.hidden = true;
  nutTMH.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  });
  document.addEventListener('fullscreenchange', () => nutTMH.classList.toggle('dang-bat', !!document.fullscreenElement));
  const soLieuTC = (chu) => { const o = $('#tc-so-lieu'); if (o) o.textContent = chu; };
  const chuThich = (html, loai = 'thanh-cong') => {
    const c = $('#chu-thich-buoc');
    c.className = `chu-thich-buoc ${loai}`;
    c.innerHTML = `<span>${html}</span>`;
  };

  // ======================= A =======================
  function capNhatA() {
    const loai = loaiMBA(s.U1, s.U2);
    r.a.nhanU1.textContent = `U₁ = ${kV(s.U1)}`;
    r.a.nhanU2.textContent = s.motChieu ? 'U₂ = 0' : `U₂ = ${kV(s.U2)}`;
    r.a.nhanF1.textContent = s.motChieu ? 'f = 0 (một chiều)' : `f₁ = ${s.f} Hz`;
    r.a.nhanF2.textContent = s.motChieu ? '—' : `f₂ = ${s.f} Hz`;
    r.a.loaiMBA.textContent = s.motChieu ? 'Nguồn một chiều: φ không biến thiên → không có sđđ ở w₂'
      : loai === 'tang-ap' ? 'MBA tăng áp: U₂ > U₁' : loai === 'ha-ap' ? 'MBA hạ áp: U₂ < U₁' : 'U₂ = U₁';
    r.a.loaiMBA.setAttribute('class', `loai-mba ${s.motChieu ? 'canh-bao-svg' : ''}`);
    r.a.kyHieuNguon.setAttribute('d', s.motChieu ? 'M96 290 H144 M108 276 H132 M120 270 V264' : 'M96 290 q12 -22 24 0 t24 0');
    r.a.dt[0].tieuDe.textContent = s.motChieu ? `U₁ = ${kV(s.U1)} không đổi` : `U₁ = ${kV(s.U1)}, f = ${s.f} Hz`;
    r.a.dt[1].tieuDe.textContent = s.motChieu ? 'u₂ = 0' : `U₂ = ${kV(s.U2)}, f = ${s.f} Hz`;
    // vạch chu kỳ trên cả hai đồ thị
    const T = chuKy(s.f);
    for (const o of r.a.dt) {
      o.gChuKy.innerHTML = '';
      if (s.motChieu) continue;
      for (let t = T; t < CUA_SO_S - 1e-9; t += T) {
        const x = o.x0 + (t / CUA_SO_S) * (o.x1 - o.x0);
        el('line', { x1: x, x2: x, y1: o.yGiua - o.bien - 8, y2: o.yGiua + o.bien + 8, class: 'vach-chu-ky' }, o.gChuKy);
      }
      // đường cong
      let d = '';
      for (let k = 0; k <= 400; k++) {
        const t = (k / 400) * CUA_SO_S;
        d += `${k ? 'L' : 'M'}${(o.x0 + (k / 400) * (o.x1 - o.x0)).toFixed(1)} ${(o.yGiua - o.bien * dienApChuanHoa(s.f, t)).toFixed(1)}`;
      }
      o.duong.setAttribute('d', d);
    }
    if (s.motChieu) {
      r.a.dt[0].duong.setAttribute('d', `M${r.a.dt[0].x0} ${r.a.dt[0].yGiua - r.a.dt[0].bien} H${r.a.dt[0].x1}`);
      r.a.dt[1].duong.setAttribute('d', `M${r.a.dt[1].x0} ${r.a.dt[1].yGiua} H${r.a.dt[1].x1}`);
    }
    r.a.chuT.textContent = s.motChieu ? 'Một chiều: u₁ không đổi → φ không đổi → e₂ = −w₂·dφ/dt = 0'
      : `Vạch đứt: chu kỳ T = 1/f = ${dinhDangSo(T * 1000, T * 1000 % 1 ? 1 : 0)} ms – trùng nhau trên cả hai đồ thị ⇒ f₂ = f₁`;
    r.a.y.forEach((y, k) => {
      const hong = s.motChieu && k > 0;
      y.g.classList.toggle('hong', hong);
      y.dau.textContent = hong ? '✗' : '✓';
      y.phu.textContent = hong ? (k === 1 ? 'φ không biến thiên → không có sđđ cảm ứng.' : 'Không biến đổi được điện áp một chiều.') : y.goc;
    });
    r.a.g.classList.toggle('mot-chieu', s.motChieu);
    $('#sl-u1').textContent = kV(s.U1);
    $('#sl-u2').textContent = s.motChieu ? '0' : kV(s.U2);
    $('#sl-f').textContent = s.motChieu ? '0 (một chiều)' : `${s.f} Hz`;
    $('#sl-loai').textContent = s.motChieu ? '—' : { 'tang-ap': 'Tăng áp', 'ha-ap': 'Hạ áp', bang: 'U₂ = U₁' }[loai];
    const chu = s.motChieu
      ? 'Nguồn <b>một chiều</b>: ở trạng thái xác lập từ thông φ không biến thiên, dφ/dt = 0 nên cuộn w₂ không có sức điện động – <b>MBA không làm việc với dòng điện một chiều</b>.'
      : `${loai === 'tang-ap' ? 'MBA tăng áp' : loai === 'ha-ap' ? 'MBA hạ áp' : 'MBA'}: U₁ = ${kV(s.U1)} → U₂ = ${kV(s.U2)}, tần số giữ nguyên <b>f₁ = f₂ = ${s.f} Hz</b>.`;
    chuThich(chu, s.motChieu ? 'canh-bao' : 'thanh-cong');
    soLieuTC(s.motChieu ? 'Nguồn một chiều: U₂ = 0' : `U₁ = ${kV(s.U1)} → U₂ = ${kV(s.U2)} · f₁ = f₂ = ${s.f} Hz`);
  }

  // ======================= B =======================
  function capNhatB() {
    const Umoc = nd.capDienAp.uMayPhat_kV;
    const ss = soSanhTruyenTai(s.U, Umoc);
    const khongTang = s.U === Umoc;
    chuChiSo(r.b.nhanU, `U_d = ${kV(s.U)}`);
    r.b.gachTang.style.display = khongTang ? '' : 'none';
    r.b.mbaTang.classList.toggle('mo', khongTang);
    r.b.nhanTang.classList.toggle('mo', khongTang);
    r.b.nhom.forEach((g) => g.classList.toggle('chon', Number(g.dataset.u) === s.U));
    // đường dây nóng lên theo ΔP
    const nong = Math.sqrt(ss.dP);
    r.b.day.style.stroke = `color-mix(in srgb, #d62828 ${Math.round(nong * 100)}%, #1d3557)`;
    r.b.day.style.strokeWidth = (5 + 6 * nong).toFixed(1);
    const pt = (x) => `${soCoNghia(x * 100, 3)} %`;
    chuChiSo(r.b.dongSo, khongTang
      ? 'Không dùng MBA tăng áp: truyền ở điện áp máy phát – mốc so sánh 100 %.'
      : `So với truyền ở ${kV(Umoc)}: I_d còn ${pt(ss.I)}, ΔU còn ${pt(ss.dU)}, ΔP còn ${pt(ss.dP)}.`);
    const lan = (x) => soCoNghia(soLanGiam(x), 3);
    chuChiSo(r.b.hq[0], khongTang ? '(mốc so sánh)' : `vì I_d giảm ${lan(ss.I)} lần`);
    r.b.hq[1].textContent = khongTang ? '(mốc so sánh)' : `giảm ${lan(ss.dU)} lần`;
    r.b.hq[2].textContent = khongTang ? '(mốc so sánh)' : `giảm ${lan(ss.dP)} lần (bình phương)`;
    chuChiSo(r.b.ketLuan, `U_d: ${kV(Umoc)} → ${kV(s.U)}`);
    chuChiSo(r.b.ketLuan2, khongTang ? '⇒ chưa giảm được tổn thất' : `⇒ I_d giảm ${lan(ss.I)} lần, ΔP giảm ${lan(ss.dP)} lần`);
    $('#sl-ud').textContent = kV(s.U);
    $('#sl-id').textContent = pt(ss.I);
    $('#sl-du').textContent = pt(ss.dU);
    $('#sl-dp').textContent = pt(ss.dP);
    const nut = document.querySelectorAll('[data-ud]');
    nut.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.ud) === s.U)));
    chuThich(htmlChiSo(khongTang
      ? `Truyền thẳng ở điện áp máy phát ${kV(Umoc)} (không có MBA tăng áp): dòng điện lớn, tổn thất lớn – lấy làm mốc 100 %.`
      : `Nâng điện áp lên <b>${kV(s.U)}</b>: cùng S, I_d giảm <b>${lan(ss.I)} lần</b>, ΔU = z·I_d giảm ${lan(ss.dU)} lần, ΔP = R_d·I_d² giảm <b>${lan(ss.dP)} lần</b>.`));
    soLieuTC(`Ud = ${kV(s.U)} · Id còn ${pt(ss.I)} · ΔP còn ${pt(ss.dP)} (so với ${kV(Umoc)})`);
  }

  // ======================= C =======================
  function chonMuc(id) {
    s.muc = id;
    Object.entries(r.c.muc).forEach(([ma, g]) => g.classList.toggle('chon', ma === id));
    r.c.khuDoLuong.classList.toggle('noi-bat', id === 'do-luong');
    const c = nd.lyThuyet.chuyenDung.find((x) => x.id === id);
    chuThich(`${c.noi}: <b>${c.ten}</b>${c.ten.endsWith('…') ? '' : '.'}${id === 'do-luong' ? ' Sơ đồ bên trái: máy biến dòng điện (W2 nối ampe kế) và máy biến điện áp (W2 nối vôn kế).' : ''}`);
  }
  function capNhatC() {
    $('#sl-i').textContent = `${s.I} %`;
    $('#sl-ud2').textContent = `${s.Ud} %`;
    r.c.chuA.textContent = `chỉ ${s.I} % thang đo`;
    r.c.chuV.textContent = `chỉ ${s.Ud} % thang đo`;
    soLieuTC(`Dòng điện đường dây ${s.I} % → ampe kế chỉ ${s.I} % · điện áp ${s.Ud} % → vôn kế chỉ ${s.Ud} %`);
  }
  svg.addEventListener('click', (e) => {
    if (s.kichBan !== 'chuyen-dung') return;
    const g = e.target.closest('.muc-cd');
    if (g) chonMuc(g.dataset.muc);
  });

  // ---------- Kịch bản & điều khiển ----------
  function chonKichBan(id) {
    s.kichBan = id;
    $('#chon-kich-ban').value = id;
    document.body.dataset.kichBan = id;
    r.a.g.style.display = id === 'dinh-nghia' ? '' : 'none';
    r.b.g.style.display = id === 'truyen-tai' ? '' : 'none';
    r.c.g.style.display = id === 'chuyen-dung' ? '' : 'none';
    document.querySelectorAll('[data-che-do]').forEach((o) => { o.hidden = o.dataset.cheDo !== id; });
    veDieuKhien();
    if (id === 'dinh-nghia') capNhatA();
    if (id === 'truyen-tai') capNhatB();
    if (id === 'chuyen-dung') { chonMuc(s.muc); capNhatC(); }
  }

  function veDieuKhien() {
    const dk = $('#dieu-khien-kich-ban');
    if (s.kichBan === 'dinh-nghia') {
      const tuyChon = (chon) => dn.dsDienAp_kV.map((u) => `<option value="${u}" ${u === chon ? 'selected' : ''}>${kV(u)}</option>`).join('');
      dk.innerHTML = `
        <p class="mo-ta">Chọn điện áp hai phía (các cấp trên sơ đồ slide 14) và tần số; quan sát u₁(t), u₂(t).</p>
        <label class="dieu-khien doc"><span>U₁ (sơ cấp)</span> <select id="dn-u1">${tuyChon(s.U1)}</select><span></span></label>
        <label class="dieu-khien doc"><span>U₂ (thứ cấp)</span> <select id="dn-u2">${tuyChon(s.U2)}</select><span></span></label>
        <label class="dieu-khien doc"><span>Tần số f</span> <input type="range" id="dn-f" min="${dn.fMin_Hz}" max="${dn.fMax_Hz}" step="5" value="${s.f}"><output id="dn-f-gt">${s.f} Hz</output></label>
        <label class="o-chon"><input type="checkbox" id="dn-mot-chieu" ${s.motChieu ? 'checked' : ''}> Thử với nguồn một chiều</label>
        <p class="ghi-chu-nho">Tần số chỉnh được chỉ để minh họa u₁, u₂ luôn cùng tần số.</p>`;
      dk.querySelector('#dn-u1').addEventListener('change', (e) => { s.U1 = Number(e.target.value); capNhatA(); });
      dk.querySelector('#dn-u2').addEventListener('change', (e) => { s.U2 = Number(e.target.value); capNhatA(); });
      dk.querySelector('#dn-f').addEventListener('input', (e) => { s.f = Number(e.target.value); dk.querySelector('#dn-f-gt').textContent = `${s.f} Hz`; capNhatA(); });
      dk.querySelector('#dn-mot-chieu').addEventListener('change', (e) => { s.motChieu = e.target.checked; capNhatA(); });
    } else if (s.kichBan === 'truyen-tai') {
      const dsU = [nd.capDienAp.uMayPhat_kV, ...nd.capDienAp.truyenTai];
      dk.innerHTML = `
        <p class="mo-ta">Chọn điện áp đường dây truyền tải. 21 kV: không dùng MBA tăng áp (truyền ở điện áp máy phát).</p>
        <div class="hang-nut">${dsU.map((u) => `<button type="button" class="nut" data-ud="${u}" aria-pressed="${u === s.U}">${kV(u)}</button>`).join('')}</div>`;
      dk.querySelectorAll('[data-ud]').forEach((b) => b.addEventListener('click', () => { s.U = Number(b.dataset.ud); capNhatB(); }));
    } else {
      const td = nd.doLuong.toiDa_phanTram;
      dk.innerHTML = `
        <p class="mo-ta">Bấm vào một loại MBA chuyên dụng ở thẻ bên phải. Thay đổi dòng điện, điện áp của đường dây để xem kim đồng hồ.</p>
        <label class="dieu-khien doc"><span>Dòng điện dây</span> <input type="range" id="cd-i" min="0" max="${td}" step="5" value="${s.I}"><output id="cd-i-gt">${s.I} %</output></label>
        <label class="dieu-khien doc"><span>Điện áp dây</span> <input type="range" id="cd-u" min="0" max="${td}" step="5" value="${s.Ud}"><output id="cd-u-gt">${s.Ud} %</output></label>
        <p class="ghi-chu-nho">Tính theo % giá trị định mức; slide không cho tỉ số biến đổi cụ thể.</p>`;
      dk.querySelector('#cd-i').addEventListener('input', (e) => { s.I = Number(e.target.value); dk.querySelector('#cd-i-gt').textContent = `${s.I} %`; capNhatC(); });
      dk.querySelector('#cd-u').addEventListener('input', (e) => { s.Ud = Number(e.target.value); dk.querySelector('#cd-u-gt').textContent = `${s.Ud} %`; capNhatC(); });
    }
  }

  // ---------- Trình chiếu & câu hỏi ----------
  const trinhChieu = khoiTaoTrinhChieu({
    noiDung: null,
    cacBuocTrinhChieu: nd.trinhChieu,
    lamNoiBat: (id, b) => {
      const tt = b?.trangThai;
      if (!tt) return;
      if (tt.motChieu !== undefined) s.motChieu = tt.motChieu;
      if (tt.U !== undefined) s.U = tt.U;
      if (tt.muc) s.muc = tt.muc;
      chonKichBan(tt.kichBan);
    },
  });
  khoiTaoCauHoi(cauHoi);
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, select, textarea, dialog')) return;
    if (trinhChieu.xuLyPhim(e)) return;
    if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); datChay(!s.dangChay); }
  });

  // ---------- Vòng lặp ----------
  const duongTrai = el('path', { d: 'M120 244 V200 H350 V217', class: 'an' }, r.a.g);
  const duongTraiDuoi = el('path', { d: 'M350 363 V380 H120 V336', class: 'an' }, r.a.g);
  const duongPhai = el('path', { d: 'M670 227 V200 H860 V250', class: 'an' }, r.a.g);
  const duongPhaiDuoi = el('path', { d: 'M860 330 V380 H670 V353', class: 'an' }, r.a.g);
  const dai = (p) => p.getTotalLength();
  const daiA = [duongTrai, duongTraiDuoi, duongPhai, duongPhaiDuoi].map(dai);
  const duongB = el('path', { d: `M150 230 H${r.b.xD[1] + 160}`, class: 'an' }, r.b.g);
  const daiB = dai(duongB);
  const daiC = dai(r.c.duongDay2El);
  let viTri = 0; // vị trí hạt dòng điện (pha)
  let tTruoc = performance.now();
  function khung(bayGio) {
    const dtThuc = Math.min(0.1, Math.max(0, (bayGio - tTruoc) / 1000));
    tTruoc = bayGio;
    const dt = s.dangChay ? dtThuc * s.tocDo : 0;
    s.t += dt;
    if (s.kichBan === 'dinh-nghia') {
      // thời gian hiển thị chậm lại 50 lần để mắt theo kịp: 1 s thực ↔ 20 ms
      const tMo = (s.t / 50) % CUA_SO_S;
      for (const [k, o] of r.a.dt.entries()) {
        const u = s.motChieu ? (k ? 0 : 1) : dienApChuanHoa(s.f, tMo);
        o.cham.setAttribute('cx', (o.x0 + (tMo / CUA_SO_S) * (o.x1 - o.x0)).toFixed(1));
        o.cham.setAttribute('cy', (o.yGiua - o.bien * u).toFixed(1));
      }
      // hạt dòng điện dao động qua lại theo i ~ sin; một chiều: chạy đều ở sơ cấp, đứng yên ở thứ cấp
      const i = s.motChieu ? 1 : dienApChuanHoa(s.f, tMo);
      viTri += dt * 0.25 * i;
      const datHat = (hat, p1, d1, p2, d2, lech) => hat.forEach((h, k) => {
        const p = k < hat.length / 2 ? p1 : p2;
        const dd = k < hat.length / 2 ? d1 : d2;
        const q = diemTrenPath(p, dd, (k % (hat.length / 2)) / (hat.length / 2) + lech);
        h.setAttribute('cx', q.x.toFixed(1));
        h.setAttribute('cy', q.y.toFixed(1));
      });
      datHat(r.a.hatTrai, duongTrai, daiA[0], duongTraiDuoi, daiA[1], viTri);
      datHat(r.a.hatPhai, duongPhai, daiA[2], duongPhaiDuoi, daiA[3], s.motChieu ? 0 : viTri);
      r.a.phi.style.strokeDashoffset = s.motChieu ? '0' : (-(s.t * 60) % 40).toFixed(1);
      r.a.phi.style.opacity = s.motChieu ? 0.9 : (0.35 + 0.65 * Math.abs(i)).toFixed(2);
      r.a.quangDen.style.opacity = s.motChieu ? 0 : 0.85;
    } else if (s.kichBan === 'truyen-tai') {
      const ss = soSanhTruyenTai(s.U, nd.capDienAp.uMayPhat_kV);
      // mật độ hạt ~ dòng điện, hạt chạy cùng tốc độ
      const soHat = Math.max(3, Math.round(r.b.hat.length * ss.I));
      r.b.hat.forEach((h, k) => {
        if (k >= soHat) { h.style.display = 'none'; return; }
        h.style.display = '';
        const q = diemTrenPath(duongB, daiB, k / soHat + s.t * 0.08);
        h.setAttribute('cx', q.x.toFixed(1));
        h.setAttribute('cy', q.y.toFixed(1));
      });
      const doManh = Math.min(1, Math.sqrt(ss.dP));
      r.b.song.forEach((o, k) => {
        const pha = (s.t * 0.7 + k / 6) % 1;
        o.setAttribute('transform', `translate(0 ${(220 - pha * 20).toFixed(1)})`);
        o.setAttribute('opacity', (doManh * Math.sin(pha * Math.PI)).toFixed(2));
      });
    } else {
      s.kimA += (doLechKim(s.I, nd.doLuong.toiDa_phanTram) - s.kimA) * Math.min(1, dtThuc * 5);
      s.kimV += (doLechKim(s.Ud, nd.doLuong.toiDa_phanTram) - s.kimV) * Math.min(1, dtThuc * 5);
      r.c.ampe.dat(s.kimA);
      r.c.von.dat(s.kimV);
      const soHat = Math.max(2, Math.round(r.c.hatDay2.length * Math.min(1, s.I / 100)));
      r.c.hatDay2.forEach((h, k) => {
        if (k >= soHat || s.I === 0) { h.style.display = 'none'; return; }
        h.style.display = '';
        const q = diemTrenPath(r.c.duongDay2El, daiC, k / soHat + s.t * 0.06);
        h.setAttribute('cx', q.x.toFixed(1));
        h.setAttribute('cy', q.y.toFixed(1));
      });
    }
    requestAnimationFrame(khung);
  }

  chonKichBan(s.kichBan);
  document.body.classList.add('da-san-sang');
  requestAnimationFrame(khung);
}

khoiDong().catch((loi) => {
  console.error(loi);
  const tb = document.querySelector('#thong-bao-loi');
  if (tb) { tb.hidden = false; tb.innerHTML = `<h2>Lỗi khởi động mô phỏng</h2><p>${loi.message}</p>`; }
});
