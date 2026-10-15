/**
 * hinh-ray.js — Thành phần vẽ dùng chung cho Hình 1.2 (thanh dẫn chuyển động, bài 1.2.a)
 * và Hình 1.3 (thanh dẫn mang dòng điện, bài 1.2.b).
 *
 * Hình chiếu xiên: trục x sang phải, trục y hướng lên, trục z đi vào phía sau
 * (vẽ chéo lên bên phải, dọc theo thanh dẫn) — giống cách vẽ trong slide.
 */
import { el } from './so-do.js';

export const GOC = { x: 200, y: 690 };
export const EZ = { x: 0.62, y: -0.44 }; // vectơ chiếu của trục z
export const PX_MOI_M = 300; // chiều dài thanh trên hình: 1 m ↔ 300 đơn vị theo trục z
export const RAY = { x0: -110, x1: 540 };
export const VUNG = { x0: 20, x1: 560, z0: -30, z1: 330 };
export const THANH = { xMin: 40, xMax: 500 };

export const P = (x, y, z) => [GOC.x + x + EZ.x * z, GOC.y - y + EZ.y * z];
const diem = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
export const duong = (...ds) => `M${ds.map(diem).join(' L')}`;

export function muiTen(cha, lop) {
  const g = el('g', { class: `mui-ten ${lop}` }, cha);
  const than = el('line', {}, g);
  const dau = el('path', {}, g);
  return {
    g,
    /** Vẽ mũi tên từ a đến b (tọa độ màn hình). */
    dat(a, b, coDau = true) {
      than.setAttribute('x1', a[0].toFixed(1));
      than.setAttribute('y1', a[1].toFixed(1));
      than.setAttribute('x2', b[0].toFixed(1));
      than.setAttribute('y2', b[1].toFixed(1));
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const n = Math.hypot(dx, dy) || 1;
      const [ux, uy] = [dx / n, dy / n];
      const s = 14;
      dau.setAttribute('d', coDau ? `M${b[0] + ux * 4} ${b[1] + uy * 4} L${b[0] - ux * s - uy * s * 0.6} ${b[1] - uy * s + ux * s * 0.6} L${b[0] - ux * s + uy * s * 0.6} ${b[1] - uy * s - ux * s * 0.6} Z` : '');
    },
  };
}

/** Vôn kế (hoặc ampe kế) kim giữa. */
export function veDongHo(cha, cx, cy, kyHieu = '') {
  const g = el('g', { class: 'von-ke' }, cha);
  el('rect', { x: cx - 80, y: cy - 66, width: 160, height: 132, rx: 14, class: 'vo-von-ke' }, g);
  const R = 62;
  const tam = [cx, cy + 28];
  let d = '';
  for (let i = 0; i <= 30; i++) {
    const a = ((-145 + (110 * i) / 30) * Math.PI) / 180;
    d += `${i ? 'L' : 'M'}${(tam[0] + R * Math.cos(a)).toFixed(1)} ${(tam[1] + R * Math.sin(a)).toFixed(1)}`;
  }
  el('path', { d, class: 'thang-do' }, g);
  for (const [v, t] of [[-1, '−'], [0, '0'], [1, '+']]) {
    const a = ((-90 + v * 55) * Math.PI) / 180;
    el('text', { x: tam[0] + (R + 14) * Math.cos(a), y: tam[1] + (R + 14) * Math.sin(a) + 6, class: 'chu-thang-do', 'text-anchor': 'middle' }, g).textContent = t;
  }
  if (kyHieu) el('text', { x: cx, y: tam[1] - 22, class: 'chu-v', 'text-anchor': 'middle' }, g).textContent = kyHieu;
  const kim = el('line', { x1: tam[0], y1: tam[1], x2: tam[0], y2: tam[1] - R + 6, class: 'kim' }, g);
  el('circle', { cx: tam[0], cy: tam[1], r: 6, class: 'truc-kim' }, g);
  const chu = el('text', { x: cx, y: cy + 56, class: 'chu-von-ke', 'text-anchor': 'middle' }, g);
  return {
    dauTrai: [cx - 40, cy - 66],
    dauPhai: [cx + 40, cy - 66],
    dat(tiLe, nhan) {
      const a = (Math.max(-1.12, Math.min(1.12, tiLe)) * 55 * Math.PI) / 180;
      kim.setAttribute('x2', (tam[0] + (R - 6) * Math.sin(a)).toFixed(1));
      kim.setAttribute('y2', (tam[1] - (R - 6) * Math.cos(a)).toFixed(1));
      chu.textContent = nhan;
    },
  };
}

/**
 * Từ trường giữa hai cực từ (khối trên và khối dưới) với các mũi tên đường sức.
 * Gọi veKhoiTren() sau khi vẽ thanh dẫn để khối trên nằm đè lên.
 */
export function veTuTruong(cha, zMax) {
  const matPhang = (y, z0, z1) => duong(P(VUNG.x0, y, z0), P(VUNG.x1, y, z0), P(VUNG.x1, y, z1), P(VUNG.x0, y, z1)) + ' Z';
  const khoi = (y0, y1) => {
    const gk = el('g', { class: 'cuc-tu' }, cha);
    el('path', { d: matPhang(y1, VUNG.z0, Math.max(VUNG.z1, zMax + 30)), class: 'mat-tren' }, gk);
    el('path', { d: duong(P(VUNG.x0, y0, VUNG.z0), P(VUNG.x1, y0, VUNG.z0), P(VUNG.x1, y1, VUNG.z0), P(VUNG.x0, y1, VUNG.z0)) + ' Z', class: 'mat-truoc' }, gk);
    const pc = P((VUNG.x0 + VUNG.x1) / 2, (y0 + y1) / 2, VUNG.z0);
    const chu = el('text', { x: pc[0], y: pc[1] + 9, class: 'chu-cuc-tu', 'text-anchor': 'middle' }, gk);
    return { gk, chu };
  };
  const duoi = khoi(-66, -42);
  const gB = el('g', { class: 'duong-suc-b' }, cha);
  const muiB = [];
  for (const z of [10, 110, 210, 300]) {
    for (const x of [40, 160, 280, 400, 520]) muiB.push({ m: muiTen(gB, 'mui-b'), x, z });
  }
  let tren = null;
  let huong = 1;
  const datCuc = () => {
    if (!tren) return;
    const [cTren, cDuoi] = huong > 0 ? ['N', 'S'] : ['S', 'N'];
    tren.chu.textContent = cTren;
    duoi.chu.textContent = cDuoi;
    tren.gk.setAttribute('class', `cuc-tu cuc-tren cuc-${cTren.toLowerCase()}`);
    duoi.gk.setAttribute('class', `cuc-tu cuc-${cDuoi.toLowerCase()}`);
  };
  return {
    veKhoiTren() { tren = khoi(256, 282); datCuc(); },
    /** h = +1: B hướng xuống (N ở trên); −1: B hướng lên. */
    datChieu(h) {
      huong = h >= 0 ? 1 : -1;
      for (const { m, x, z } of muiB) {
        if (huong > 0) m.dat(P(x, 254, z), P(x, -40, z));
        else m.dat(P(x, -40, z), P(x, 254, z));
      }
      datCuc();
    },
    datDoDam(k) {
      for (const { m } of muiB) m.g.setAttribute('opacity', k.toFixed(2));
    },
  };
}

/**
 * Bàn tay vẽ trong mặt phẳng ngang. Hệ tọa độ cục bộ: a dọc theo bốn ngón tay, b dọc theo ngón cái choãi 90°.
 * @param {{trai?: boolean, ngon: [string, string], cai: [string, string]}} o nhãn và lớp màu của mũi tên ngón tay / ngón cái
 */
export function veBanTay(cha, { trai = false, ngon, cai }) {
  const g = el('g', { class: `ban-tay ${trai ? 'tay-trai' : 'tay-phai'}` }, cha);
  const tay = el('g', {}, g);
  const capsule = (a0, a1, b, r) => el('rect', { x: a0, y: b - r, width: a1 - a0, height: 2 * r, rx: r, class: 'da-tay' }, tay);
  el('rect', { x: -130, y: -30, width: 100, height: 60, rx: 10, class: 'co-tay' }, tay);
  capsule(30, 112, -27, 8); // ngón út
  capsule(30, 128, -9, 9); // ngón áp út
  capsule(30, 136, 9, 9); // ngón giữa
  capsule(30, 128, 27, 9); // ngón trỏ
  el('rect', { x: -42, y: -38, width: 82, height: 76, rx: 18, class: 'da-tay' }, tay);
  el('rect', { x: -8, y: 24, width: 18, height: 84, rx: 9, class: 'da-tay' }, tay); // ngón cái choãi 90°
  const chiTay = el('path', { d: 'M-20 -12 Q0 0 -18 14', class: 'chi-tay' }, tay);
  const muiB = [0, 1, 2].map(() => muiTen(g, 'mui-b'));
  const muiNgon = muiTen(g, ngon[1]);
  const muiCai = muiTen(g, cai[1]);
  const chuB = el('text', { class: 'chu-vec vec-b' }, g);
  const chuNgon = el('text', { class: `chu-vec ${ngon[2] || ''}` }, g);
  const chuCai = el('text', { class: `chu-vec ${cai[2] || ''}` }, g);
  chuB.textContent = 'B';
  chuNgon.textContent = ngon[0];
  chuCai.textContent = cai[0];
  const uz = Math.hypot(EZ.x, EZ.y);
  const ea = [EZ.x / uz, EZ.y / uz];
  return {
    g,
    /**
     * @param {number} sNgon +1: bốn ngón tay hướng vào phía sau (+z); −1: hướng ra phía trước
     * @param {number} sCai +1: ngón cái hướng sang phải (+x); −1: sang trái
     * @param {boolean} ngua true: lòng bàn tay ngửa lên (B hướng xuống); false: úp xuống (B hướng lên)
     */
    dat(cx, cy, sNgon, sCai, ngua = true) {
      tay.setAttribute('transform', `matrix(${ea[0] * sNgon} ${ea[1] * sNgon} ${sCai} 0 ${cx} ${cy})`);
      g.classList.toggle('up-tay', !ngua);
      chiTay.style.display = ngua ? '' : 'none';
      const map = (a, b) => [cx + sNgon * ea[0] * a + sCai * b, cy + sNgon * ea[1] * a];
      [[-10, -6], [12, 16], [-14, 22]].forEach(([a, b], i) => {
        const p = map(a, b);
        // đường sức từ luôn đi vào lòng bàn tay: từ trên xuống khi ngửa, từ dưới lên khi úp
        if (ngua) muiB[i].dat([p[0], p[1] - 125], [p[0], p[1] - 6]);
        else muiB[i].dat([p[0], p[1] + 125], [p[0], p[1] + 6]);
      });
      const pB = map(-10, -6);
      chuB.setAttribute('x', pB[0] - 26);
      chuB.setAttribute('y', ngua ? pB[1] - 108 : pB[1] + 128);
      muiNgon.dat(map(150, 9), map(215, 9));
      const pn = map(232, 9);
      chuNgon.setAttribute('x', pn[0] - 8);
      chuNgon.setAttribute('y', pn[1] + 8);
      muiCai.dat(map(0, 118), map(0, 185));
      const pc = map(0, 205);
      chuCai.setAttribute('x', pc[0] - (sCai > 0 ? 0 : 22));
      chuCai.setAttribute('y', pc[1] + 9);
    },
  };
}
