/**
 * so-do.js — Vẽ toàn bộ sơ đồ hệ thống điện bằng SVG (phong cách phẳng).
 * Hệ tọa độ: viewBox 0 0 1600 900.
 *  - Hàng trên (mặt đất y = 390): A nhà máy → MBA tăng áp → B đường dây 500 kV → TBA truyền tải → 110 kV
 *  - Hàng dưới (mặt đất y = 830), từ phải sang trái: TBA phân phối → D/E lưới trung áp → C khu tiêu thụ → F hộ gia đình
 */

const NS = 'http://www.w3.org/2000/svg';

export function el(tag, thuocTinh = {}, cha) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(thuocTinh)) e.setAttribute(k, v);
  if (cha) cha.appendChild(e);
  return e;
}

/** Đường dây võng giữa các điểm treo: mỗi khoảng cột dùng một đường cong bậc 2. */
export function duongVong(diem, heSoVong = 0.07) {
  let d = `M${diem[0][0]} ${diem[0][1]}`;
  for (let i = 1; i < diem.length; i++) {
    const [x1, y1] = diem[i - 1];
    const [x2, y2] = diem[i];
    const vong = Math.hypot(x2 - x1, y2 - y1) * heSoVong;
    d += ` Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + 2 * vong} ${x2} ${y2}`;
  }
  return d;
}

// Bộ sinh số ngẫu nhiên có hạt giống (để cửa sổ sáng/tắt ổn định giữa các lần tải trang)
function taoNgauNhien(hat) {
  let s = hat;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/** Vị trí các cột / thiết bị dùng chung cho phần hoạt hình. */
export const VI_TRI = {
  cot500: [540, 800, 1060],
  cotTrungAp: { dauRa: 1458, P1: 1390, P2: 1270, P3: 1050, P4: 830, P5: 640 },
  cotHaAp: [460, 310, 160],
  nha: [90, 235, 385, 540],
  yTrungAp: [676, 685, 694],
  yHaAp: [718, 726, 734, 742],
};

export function veSoDo(svg, cauHinh) {
  const mau = Object.fromEntries(Object.entries(cauHinh.capDienAp).map(([k, v]) => [k, v.mau]));
  const ngauNhien = taoNgauNhien(20240901);
  svg.innerHTML = '';
  const ref = {
    boPhan: {}, duong: {}, doanSuCo: {}, mba: [], cuaSo: { 'cong-nghiep': [], 'toa-nha': [], 'dan-cu': [] },
    thietBi: {}, khoi: [], nhan: [],
  };

  // ---------- defs ----------
  const defs = el('defs', {}, svg);
  const gTroi = el('linearGradient', { id: 'g-troi', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 0, y2: 400 }, defs);
  ref.troiTren = el('stop', { offset: '0', 'stop-color': '#7cc6f2' }, gTroi);
  ref.troiDuoi = el('stop', { offset: '1', 'stop-color': '#d9f1ff' }, gTroi);
  const gDong = el('linearGradient', { id: 'g-dong', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 390, x2: 0, y2: 900 }, defs);
  el('stop', { offset: '0', 'stop-color': '#c5e6a6' }, gDong);
  el('stop', { offset: '1', 'stop-color': '#9fd27f' }, gDong);
  const loc = el('filter', { id: 'loc-sang', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
  el('feGaussianBlur', { stdDeviation: '3' }, loc);

  // ---------- nền ----------
  const nen = el('g', { class: 'nen' }, svg);
  // Các hình nền vẽ rộng ra ngoài viewBox để lấp đầy khung khi tỉ lệ màn hình khác 16:9
  el('rect', { x: -2000, y: -1200, width: 5600, height: 1600, fill: 'url(#g-troi)' }, nen);
  ref.sao = el('g', { class: 'sao', opacity: 0 }, nen);
  for (let i = 0; i < 40; i++) {
    el('circle', { cx: (ngauNhien() * 1600).toFixed(0), cy: (ngauNhien() * 300).toFixed(0), r: (0.8 + ngauNhien() * 1.4).toFixed(1), fill: '#fff' }, ref.sao);
  }
  ref.matTroi = el('circle', { r: 26, fill: '#ffd166', stroke: '#ffe8a3', 'stroke-width': 8 }, nen);
  ref.matTrang = el('path', { d: 'M4 -22 A22 22 0 1 0 4 22 A17 17 0 1 1 4 -22 Z', fill: '#fdf6d8', opacity: 0 }, nen);
  el('path', { d: 'M0 392 Q120 340 260 380 T560 372 T880 366 T1200 376 T1600 360 L1600 400 L0 400 Z', fill: '#a9d48b' }, nen);
  el('rect', { x: -2000, y: 390, width: 5600, height: 510, fill: 'url(#g-dong)' }, nen);
  el('rect', { x: -2000, y: 828, width: 5600, height: 1200, fill: '#86b96a' }, nen);
  el('rect', { x: -2000, y: 845, width: 5600, height: 40, fill: '#a7b4bd', opacity: 0.55 }, nen); // con đường
  ref.lopDem = el('rect', { x: -2000, y: -1200, width: 5600, height: 3300, fill: '#0b1d3a', opacity: 0, 'pointer-events': 'none' }, nen);

  // tạo nhóm bộ phận (một bộ phận có thể gồm nhiều nhóm để xếp lớp)
  const nhom = (id, lop = 'chinh') => {
    const g = el('g', { class: 'bo-phan', 'data-id': id, 'data-lop': lop }, svg);
    (ref.boPhan[id] ||= []).push(g);
    return g;
  };
  const vungChamDuong = (g, d, id) => el('path', { d, class: 'vung-cham', 'data-id': id }, g);
  const dangKyDuong = (id, cap, paths, g) => {
    const lopHat = el('g', { class: 'lop-hat' }, g);
    ref.duong[id] = { cap, paths, lopHat, mau: mau[cap] };
    return ref.duong[id];
  };
  const veMBA = (g, x, y, rong, cao, id, soSu = 3) => {
    const vong = el('circle', { cx: x + rong / 2, cy: y + cao / 2, r: Math.max(rong, cao) * 0.6, class: 'song-mba' }, g);
    el('rect', { x: x + rong, y: y + 6, width: 7, height: cao - 10, fill: '#6c7a89' }, g);
    el('rect', { x: x - 7, y: y + 6, width: 7, height: cao - 10, fill: '#6c7a89' }, g);
    for (let i = 0; i < 3; i++) {
      el('line', { x1: x + rong + 1, x2: x + rong + 6, y1: y + 10 + i * (cao - 18) / 2, y2: y + 10 + i * (cao - 18) / 2, stroke: '#4a5568', 'stroke-width': 1.5 }, g);
    }
    el('rect', { x, y, width: rong, height: cao, rx: 4, fill: '#8d99ae', stroke: '#3f4a5a', 'stroke-width': 2 }, g);
    el('rect', { x: x + 6, y: y + 6, width: rong - 12, height: 6, rx: 2, fill: '#a9b4c6' }, g);
    const su = [];
    for (let i = 0; i < soSu; i++) {
      const sx = x + (rong / (soSu + 1)) * (i + 1);
      el('rect', { x: sx - 3, y: y - 14, width: 6, height: 14, rx: 2, fill: '#b5835a' }, g);
      su.push([sx, y - 14]);
    }
    ref.mba.push({ id, vong, r0: Math.max(rong, cao) * 0.6 });
    return su;
  };

  // ======================= A. NHÀ MÁY ĐIỆN =======================
  const gA = nhom('nguon-phat');
  el('path', { d: 'M40 390 Q72 322 56 252 L124 252 Q108 322 140 390 Z', fill: '#dfe6ea', stroke: '#78909c', 'stroke-width': 2 }, gA);
  el('ellipse', { cx: 90, cy: 252, rx: 34, ry: 5, fill: '#b0bec5', stroke: '#78909c', 'stroke-width': 1.5 }, gA);
  el('rect', { x: 240, y: 236, width: 62, height: 56, fill: '#e3e9ee', stroke: '#546e7a', 'stroke-width': 2 }, gA);
  el('rect', { x: 150, y: 290, width: 175, height: 100, fill: '#eef2f5', stroke: '#546e7a', 'stroke-width': 2 }, gA);
  el('rect', { x: 146, y: 282, width: 183, height: 10, fill: '#607d8b' }, gA);
  el('rect', { x: 305, y: 165, width: 18, height: 117, fill: '#cfd8dc', stroke: '#78909c', 'stroke-width': 1.5 }, gA);
  el('rect', { x: 305, y: 165, width: 18, height: 10, fill: '#d62828' }, gA);
  el('rect', { x: 305, y: 186, width: 18, height: 8, fill: '#d62828' }, gA);
  el('rect', { x: 160, y: 312, width: 150, height: 64, rx: 6, fill: '#263238' }, gA);
  // tuabin
  const gTB = el('g', { transform: 'translate(198 344)' }, gA);
  el('circle', { r: 25, fill: '#455a64', stroke: '#90a4ae', 'stroke-width': 2 }, gTB);
  ref.tuabin = el('g', {}, gTB);
  for (let i = 0; i < 8; i++) {
    el('path', { d: 'M-3 -4 L-6 -22 L6 -22 L3 -4 Z', fill: '#cfd8dc', transform: `rotate(${i * 45})` }, ref.tuabin);
  }
  el('circle', { r: 5, fill: '#eceff1' }, ref.tuabin);
  el('line', { x1: 223, y1: 344, x2: 246, y2: 344, stroke: '#b0bec5', 'stroke-width': 5 }, gA);
  el('rect', { x: 246, y: 325, width: 50, height: 38, rx: 6, fill: '#ffb703', stroke: '#c98500', 'stroke-width': 2 }, gA);
  el('text', { x: 271, y: 351, 'text-anchor': 'middle', class: 'chu-may-phat' }, gA).textContent = 'G';
  const pPhat = el('path', { d: 'M296 344 L352 344', class: 'day', 'stroke-width': 5, stroke: mau.phat }, gA);
  dangKyDuong('phat', 'phat', [pPhat], gA);
  ref.khoi.push({ x: 314, y: 160, loai: 'khoi' }, { x: 90, y: 246, loai: 'hoi' });
  ref.lopKhoi = el('g', { class: 'lop-khoi', 'pointer-events': 'none' }, gA);

  // ======================= MBA TĂNG ÁP =======================
  const gT1 = nhom('mba-tang-ap');
  const suT1 = veMBA(gT1, 352, 330, 60, 60, 'mba-tang-ap');

  // ======================= B. ĐƯỜNG DÂY TRUYỀN TẢI =======================
  const gB = nhom('duong-day-truyen-tai');
  const gBDay = el('g', {}, gB);
  const gBCot = el('g', {}, gB);
  const veCotThep = (g, x, chan, dinh, mucXa, dai, nuaChan) => {
    const yThan = dinh + 34;
    const nua = (y) => 8 + (nuaChan - 8) * (y - yThan) / (chan - yThan);
    const c = { stroke: '#4f5d6b', fill: 'none' };
    el('path', { d: `M${x - nuaChan} ${chan} L${x - 8} ${yThan} L${x} ${dinh} L${x + 8} ${yThan} L${x + nuaChan} ${chan}`, ...c, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
    let d = '';
    const buoc = (chan - yThan) / 8;
    for (let i = 0; i < 8; i++) {
      const ya = yThan + i * buoc;
      const yb = ya + buoc;
      d += `M${x - nua(ya)} ${ya} L${x + nua(yb)} ${yb} M${x + nua(ya)} ${ya} L${x - nua(yb)} ${yb} `;
    }
    el('path', { d, ...c, 'stroke-width': 1.3 }, g);
    const diemTreo = { trai: [], phai: [] };
    for (const y of mucXa) {
      el('path', { d: `M${x - dai} ${y} L${x + dai} ${y} M${x - dai} ${y} L${x - nua(y + 14)} ${y + 14} M${x + dai} ${y} L${x + nua(y + 14)} ${y + 14}`, ...c, 'stroke-width': 2.2 }, g);
      for (const [phia, s] of [['trai', -1], ['phai', 1]]) {
        el('line', { x1: x + s * dai, y1: y, x2: x + s * dai, y2: y + 13, stroke: '#a1887f', 'stroke-width': 3.5, 'stroke-dasharray': '2 1.5' }, g);
        diemTreo[phia].push([x + s * dai, y + 14]);
      }
    }
    return { dinh: [x, dinh], ...diemTreo };
  };
  const cot = VI_TRI.cot500.map((x) => veCotThep(gBCot, x, 390, 140, [178, 208, 238], 46, 32));
  // Cổng xà đầu vào TBA truyền tải
  const cong = { x: 1200, y: 262 };
  const diemCong = [[1186, 262], [1200, 262], [1214, 262]];
  const pTT = [];
  for (const phia of ['trai', 'phai']) {
    for (let i = 0; i < 3; i++) {
      const diem = [[suT1[i][0], suT1[i][1]], ...cot.map((c) => c[phia][i]), diemCong[i]];
      pTT.push(el('path', { d: duongVong(diem, 0.045), class: 'day day-tt', 'stroke-width': 2.6, stroke: mau.truyenTai }, gBDay));
    }
  }
  // dây chống sét
  el('path', { d: duongVong(cot.map((c) => c.dinh), 0.04), stroke: '#78909c', 'stroke-width': 1.2, fill: 'none' }, gBDay);
  vungChamDuong(gBDay, duongVong([[suT1[1][0], suT1[1][1]], ...cot.map((c) => c.trai[1]), diemCong[1]], 0.045), 'duong-day-truyen-tai');
  dangKyDuong('truyen-tai', 'truyenTai', pTT, gBDay);
  // Đường dây 110 kV (cột nhỏ hơn) nối TBA truyền tải → TBA phân phối
  const cot110a = veCotThep(gBCot, 1470, 390, 232, [264, 286, 308], 30, 22);
  const cot110b = veCotThep(gBCot, 1520, 640, 500, [532, 554, 576], 30, 22);
  const diemRa110 = [[1355, 290], [1365, 290], [1375, 290]];
  const diemVaoPP = [[1562, 712], [1570, 712], [1578, 712]];
  const p110 = [];
  for (let i = 0; i < 3; i++) {
    p110.push(el('path', { d: duongVong([diemRa110[i], cot110a.trai[i], cot110b.trai[i], diemVaoPP[i]], 0.035), class: 'day', 'stroke-width': 2.2, stroke: mau.caoAp }, gBDay));
  }
  vungChamDuong(gBDay, duongVong([diemRa110[1], cot110a.trai[1], cot110b.trai[1], diemVaoPP[1]], 0.035), 'duong-day-truyen-tai');
  dangKyDuong('cao-ap', 'caoAp', p110, gBDay);

  // ======================= TBA TRUYỀN TẢI =======================
  const gTT = nhom('tba-truyen-tai');
  el('rect', { x: 1165, y: 370, width: 220, height: 20, fill: '#cfd8dc' }, gTT);
  for (const px of [1176, 1220]) el('rect', { x: px, y: 252, width: 5, height: 138, fill: '#78909c' }, gTT);
  el('rect', { x: 1170, y: 252, width: 58, height: 5, fill: '#78909c' }, gTT);
  for (const px of [1348, 1378]) el('rect', { x: px, y: 280, width: 4, height: 110, fill: '#78909c' }, gTT);
  el('rect', { x: 1344, y: 278, width: 40, height: 4, fill: '#78909c' }, gTT);
  for (let i = 0; i < 3; i++) {
    el('path', { d: `M${diemCong[i][0]} ${diemCong[i][1]} L${diemCong[i][0]} ${294 + i * 6} L1335 ${294 + i * 6}`, class: 'day', stroke: mau.truyenTai, 'stroke-width': 2 }, gTT);
  }
  const suTT1 = veMBA(gTT, 1238, 326, 44, 44, 'tba-truyen-tai');
  const suTT2 = veMBA(gTT, 1296, 326, 44, 44, 'tba-truyen-tai');
  for (const s of [...suTT1, ...suTT2]) el('line', { x1: s[0], y1: s[1], x2: s[0], y2: 300, stroke: mau.truyenTai, 'stroke-width': 1.6 }, gTT);
  el('path', { d: 'M1340 340 L1365 340 L1365 290', class: 'day', stroke: mau.caoAp, 'stroke-width': 2.2 }, gTT);
  veHangRao(gTT, 1165, 1385, 390);

  // ======================= TBA PHÂN PHỐI =======================
  const gPP = nhom('tba-phan-phoi');
  el('rect', { x: 1440, y: 812, width: 150, height: 18, fill: '#cfd8dc' }, gPP);
  for (const px of [1553, 1584]) el('rect', { x: px, y: 704, width: 4, height: 126, fill: '#78909c' }, gPP);
  el('rect', { x: 1549, y: 702, width: 42, height: 4, fill: '#78909c' }, gPP);
  const suPP = veMBA(gPP, 1494, 768, 46, 44, 'tba-phan-phoi');
  for (let i = 0; i < 3; i++) {
    el('path', { d: `M${diemVaoPP[i][0]} ${diemVaoPP[i][1]} L${suPP[i][0]} ${suPP[i][1]}`, class: 'day', stroke: mau.caoAp, 'stroke-width': 1.6 }, gPP);
  }
  el('rect', { x: 1462, y: 772, width: 24, height: 40, rx: 2, fill: '#b0bec5', stroke: '#607d8b', 'stroke-width': 1.5 }, gPP);
  el('path', { d: 'M1494 790 L1474 790 L1474 772 L1462 700', class: 'day', stroke: mau.trungAp, 'stroke-width': 2.4 }, gPP);
  veHangRao(gPP, 1440, 1590, 830);

  // ======================= C. KHU VỰC TIÊU THỤ (vẽ trước dây phân phối) =======================
  const gC = nhom('khu-tieu-thu');
  // Tòa nhà cao tầng
  el('rect', { x: 905, y: 490, width: 50, height: 15, fill: '#90a4ae' }, gC);
  el('line', { x1: 930, y1: 466, x2: 930, y2: 490, stroke: '#607d8b', 'stroke-width': 3 }, gC);
  el('rect', { x: 870, y: 505, width: 120, height: 325, fill: '#cfe3f3', stroke: '#455a64', 'stroke-width': 2 }, gC);
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 4; c++) {
      ref.cuaSo['toa-nha'].push(el('rect', { x: 882 + c * 26, y: 518 + r * 27, width: 18, height: 16, class: 'cua-so', 'data-nguong': ngauNhien().toFixed(3) }, gC));
    }
  }
  el('rect', { x: 915, y: 800, width: 30, height: 30, fill: '#455a64' }, gC);
  // Nhà máy công nghiệp
  el('rect', { x: 1190, y: 712, width: 11, height: 26, fill: '#8d6e63' }, gC);
  el('rect', { x: 1070, y: 755, width: 142, height: 75, fill: '#ffe8cc', stroke: '#8d6e63', 'stroke-width': 2 }, gC);
  let rang = 'M1070 755';
  for (let i = 0; i < 4; i++) {
    const x0 = 1070 + i * 35.5;
    rang += ` L${x0} 733 L${x0 + 35.5} 755`;
  }
  el('path', { d: rang + ' Z', fill: '#bcaaa4', stroke: '#8d6e63', 'stroke-width': 2, 'stroke-linejoin': 'round' }, gC);
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      ref.cuaSo['cong-nghiep'].push(el('rect', { x: 1080 + c * 24, y: 766 + r * 26, width: 16, height: 13, class: 'cua-so', 'data-nguong': ngauNhien().toFixed(3) }, gC));
    }
  }
  el('rect', { x: 1180, y: 798, width: 22, height: 32, fill: '#8d6e63' }, gC);
  ref.khoi.push({ x: 1195, y: 708, loai: 'khoi-nho' });
  // MBA riêng của nhà máy và tòa nhà
  const suC1 = veMBA(gC, 1224, 800, 34, 30, 'mba-cong-nghiep');
  const suC2 = veMBA(gC, 1004, 800, 34, 30, 'mba-toa-nha');

  // ======================= F. HỘ TIÊU THỤ (nhà dân) =======================
  const gF = nhom('ho-tieu-thu');
  const mauTuong = ['#ffe0b2', '#dcedc8', '#ffccbc', '#e1bee7'];
  const mauMai = ['#d84315', '#6d4c41', '#c62828', '#5d4037'];
  VI_TRI.nha.forEach((cx, i) => {
    el('rect', { x: cx - 40, y: 786, width: 80, height: 44, fill: mauTuong[i], stroke: '#6d4c41', 'stroke-width': 2 }, gF);
    el('path', { d: `M${cx - 50} 788 L${cx} 752 L${cx + 50} 788 Z`, fill: mauMai[i], stroke: '#4e342e', 'stroke-width': 2, 'stroke-linejoin': 'round' }, gF);
    el('rect', { x: cx - 6, y: 806, width: 13, height: 24, fill: '#795548' }, gF);
    for (const dx of [-30, 14]) {
      ref.cuaSo['dan-cu'].push(el('rect', { x: cx + dx, y: 796, width: 16, height: 14, class: 'cua-so', 'data-nguong': ngauNhien().toFixed(3) }, gF));
    }
  });

  // ======================= D. ĐƯỜNG DÂY PHÂN PHỐI =======================
  const gD = nhom('duong-day-phan-phoi');
  const gDDay = el('g', {}, gD);
  const gDCot = el('g', {}, gD);
  const ct = VI_TRI.cotTrungAp;
  const veCotBeTong = (x, dinh) => {
    el('path', { d: `M${x - 5} 830 L${x - 3} ${dinh} L${x + 3} ${dinh} L${x + 5} 830 Z`, fill: '#a3a3a3', stroke: '#6b6b6b', 'stroke-width': 1.5 }, gDCot);
  };
  for (const x of [ct.P1, ct.P2, ct.P3, ct.P4, ct.P5]) {
    veCotBeTong(x, 666);
    el('rect', { x: x - 22, y: 670, width: 44, height: 4, fill: '#6b6b6b' }, gDCot);
    for (const y of VI_TRI.yTrungAp) el('circle', { cx: x, cy: y, r: 2.6, fill: '#e0d6c8', stroke: '#8d7b68' }, gDCot);
  }
  for (const x of VI_TRI.cotHaAp) {
    veCotBeTong(x, 710);
    for (const y of VI_TRI.yHaAp) el('circle', { cx: x, cy: y, r: 2, fill: '#e0d6c8', stroke: '#8d7b68' }, gDCot);
  }
  const doanTA = (x1, x2, ...giua) => VI_TRI.yTrungAp.map((y) => [[x1, y], ...giua.map((g) => [g, y]), [x2, y]]);
  const taoDoan = (id, diemCacPha, dsCot) => {
    const paths = diemCacPha.map((diem) => el('path', { d: duongVong(diem, 0.03), class: 'day', 'stroke-width': 2, stroke: mau.trungAp }, gDDay));
    const dangKy = dangKyDuong(id, 'trungAp', paths, gDDay);
    const vung = vungChamDuong(gDDay, `M${dsCot[0]} 685 L${dsCot[dsCot.length - 1]} 685`, 'duong-day-phan-phoi');
    vung.dataset.doan = id;
    ref.doanSuCo[id] = { vung, dangKy, x1: dsCot[0], x2: dsCot[dsCot.length - 1] };
    return dangKy;
  };
  taoDoan('s0', doanTA(ct.dauRa, ct.P1), [ct.dauRa, ct.P1]);
  taoDoan('s1', doanTA(ct.P1, ct.P2), [ct.P1, ct.P2]);
  taoDoan('s2', doanTA(ct.P2, ct.P4, ct.P3), [ct.P2, ct.P3, ct.P4]);
  taoDoan('s3', doanTA(ct.P4, ct.P5), [ct.P4, ct.P5]);
  // Nhánh rẽ đến MBA của nhà máy và tòa nhà
  const re = (id, x0, su) => {
    const p = el('path', { d: `M${x0} 694 L${x0} 704 L${su[1][0]} ${su[1][1]}`, class: 'day', 'stroke-width': 2.6, stroke: mau.trungAp }, gDDay);
    dangKyDuong(id, 'trungAp', [p], gDDay);
  };
  re('re-cong-nghiep', ct.P2, suC1);
  re('re-toa-nha', ct.P3, suC2);
  // Hạ áp: MBA treo cột tại P5 → các cột hạ áp → dây vào nhà
  const pHa = VI_TRI.yHaAp.map((y) => el('path', { d: duongVong([[ct.P5, y], ...VI_TRI.cotHaAp.map((x) => [x, y])], 0.025), class: 'day', 'stroke-width': 1.7, stroke: mau.haAp }, gDDay));
  dangKyDuong('ha-ap', 'haAp', pHa, gDDay);
  vungChamDuong(gDDay, `M${ct.P5} 730 L${VI_TRI.cotHaAp[2]} 730`, 'duong-day-phan-phoi');
  const pVaoNha = VI_TRI.nha.map((cx) => el('path', { d: `M${cx - 4} 745 L${cx + 16} 768`, class: 'day', 'stroke-width': 1.6, stroke: mau.haAp }, gDDay));
  dangKyDuong('vao-nha', 'haAp', pVaoNha, gDDay);

  // MBA treo cột (thuộc F) – vẽ sau cột để nằm trên cột
  const gFMBA = nhom('ho-tieu-thu', 'phu');
  el('rect', { x: ct.P5 + 2, y: 712, width: 8, height: 3, fill: '#6b6b6b' }, gFMBA);
  const suTC = veMBA(gFMBA, ct.P5 + 8, 708, 30, 32, 'mba-treo-cot');
  for (let i = 0; i < 3; i++) {
    el('path', { d: `M${ct.P5} ${VI_TRI.yTrungAp[i]} L${suTC[i][0]} ${suTC[i][1]}`, stroke: mau.trungAp, 'stroke-width': 1.3, fill: 'none' }, gFMBA);
  }

  // ======================= E. THIẾT BỊ TỰ ĐỘNG PHÂN PHỐI =======================
  const gE = nhom('thiet-bi-tu-dong');
  const veThietBi = (id, x, nhanTB, phia) => {
    const bx = phia > 0 ? x + 6 : x - 6 - 32;
    const g = el('g', { class: 'thiet-bi' }, gE);
    el('line', { x1: bx + 16, y1: 694, x2: bx + 16, y2: 700, stroke: '#37474f', 'stroke-width': 2 }, g);
    const hop = el('rect', { x: bx, y: 700, width: 32, height: 20, rx: 4, fill: '#37474f', stroke: '#1b262c', 'stroke-width': 1.5 }, g);
    el('text', { x: bx + 13, y: 714, class: 'chu-thiet-bi', 'text-anchor': 'middle' }, g).textContent = nhanTB;
    const den = el('circle', { cx: bx + 27, cy: 706, r: 3.6, class: 'den-trang-thai dong' }, g);
    ref.thietBi[id] = { g, hop, den, x: bx + 16, y: 710 };
  };
  veThietBi('R', ct.P1, 'R', 1);
  veThietBi('LBS1', ct.P2, 'LBS', -1);
  veThietBi('LBS2', ct.P4, 'LBS', 1);

  // ---------- lớp hiệu ứng (tia lửa) và nhãn ----------
  ref.lopHieuUng = el('g', { class: 'lop-hieu-ung', 'pointer-events': 'none' }, svg);
  ref.lopNhan = el('g', { class: 'lop-nhan' }, svg);
  return ref;
}

function veHangRao(g, x1, x2, chan) {
  let d = `M${x1} ${chan - 16} L${x2} ${chan - 16} M${x1} ${chan - 2} L${x2} ${chan - 2}`;
  for (let x = x1; x <= x2; x += 10) d += ` M${x} ${chan - 20} L${x} ${chan}`;
  el('path', { d, stroke: '#90a4ae', 'stroke-width': 1.3, fill: 'none' }, g);
}

/**
 * Nhãn có nền bo tròn; tùy chọn huy hiệu chữ cái (A–F).
 * @returns {SVGGElement}
 */
export function taoNhan(lop, { x, y, chu, ma, id, lopCss = '' }) {
  const g = el('g', { class: `nhan ${lopCss}`.trim(), 'data-id': id || '' }, lop);
  const nen = el('rect', { rx: 15, class: 'nen-nhan' }, g);
  const t = el('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'chu-nhan' }, g);
  t.textContent = chu;
  let huyHieu;
  if (ma) {
    huyHieu = el('g', { class: 'huy-hieu' }, g);
    el('circle', { r: 14 }, huyHieu);
    el('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' }, huyHieu).textContent = ma;
  }
  canChinhNhan(g);
  return g;
}

/** Tính lại kích thước nền nhãn sau khi đổi chữ. */
export function canChinhNhan(g) {
  const t = g.querySelector('.chu-nhan');
  const nen = g.querySelector('.nen-nhan');
  const huyHieu = g.querySelector('.huy-hieu');
  const x = Number(t.getAttribute('x'));
  const y = Number(t.getAttribute('y'));
  let w = 0;
  let h = 22;
  try {
    const b = t.getBBox();
    w = b.width;
    h = b.height;
  } catch { w = t.textContent.length * 10; }
  const them = huyHieu ? 34 : 0;
  const dem = 12;
  const trai = x - w / 2 - dem - them;
  nen.setAttribute('x', trai);
  nen.setAttribute('y', y - h / 2 - 6);
  nen.setAttribute('width', w + 2 * dem + them);
  nen.setAttribute('height', h + 12);
  if (huyHieu) huyHieu.setAttribute('transform', `translate(${trai + 20} ${y})`);
}
