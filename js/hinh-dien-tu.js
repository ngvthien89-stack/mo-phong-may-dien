/**
 * hinh-dien-tu.js — Vẽ sân khấu SVG cho bài 1.2.a "Định luật cảm ứng điện từ".
 * viewBox 0 0 1600 900:
 *  - Trái: Hình 1.1 — vòng dây/cuộn dây nhìn chính diện, ký hiệu từ thông ⊗/⊙, chiều e, vôn kế
 *  - Phải trên: nguồn tạo từ thông nhìn ngang (nam châm / nam châm điện / nam châm quay)
 *  - Phải dưới: đồ thị φ(t) và e(t)
 */
import { el } from './so-do.js';

export const MAT = { cx: 420, cy: 400, rx: 285, ry: 180 };
const NGANG = { truc: 250, xCuon: 1440 };
const MAU = { tuThong: '#2a78d6', sdd: '#eb6834', dong: '#b87333' };

const diemElip = (cx, cy, rx, ry, t) => [cx + rx * Math.cos(t), cy + ry * Math.sin(t)];

function cungElip(cx, cy, rx, ry, t0, t1, so = 90) {
  let d = '';
  for (let i = 0; i <= so; i++) {
    const [x, y] = diemElip(cx, cy, rx, ry, t0 + ((t1 - t0) * i) / so);
    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

/** Ký hiệu từ thông: ⊗ (đi vào trang) hoặc ⊙ (đi ra). */
function kyHieuTuThong(cha, x, y, r, lop) {
  const g = el('g', { class: `ky-hieu ${lop}`, transform: `translate(${x} ${y})` }, cha);
  el('circle', { r, class: 'vong-ky-hieu' }, g);
  const cheo = r * 0.62;
  const vao = el('path', { d: `M${-cheo} ${-cheo} L${cheo} ${cheo} M${cheo} ${-cheo} L${-cheo} ${cheo}`, class: 'dau-vao' }, g);
  const ra = el('circle', { r: r * 0.24, class: 'dau-ra' }, g);
  return {
    g,
    dat(huong, doDam) {
      g.setAttribute('opacity', doDam.toFixed(2));
      vao.style.display = huong > 0 ? '' : 'none';
      ra.style.display = huong < 0 ? '' : 'none';
    },
  };
}

function veNamCham(cha) {
  const g = el('g', { class: 'nam-cham' }, cha);
  const duongSuc = el('g', { class: 'duong-suc' }, g);
  for (const s of [1, -1]) {
    el('path', { d: `M80 ${-14 * s} C150 ${-95 * s} -150 ${-95 * s} -80 ${-14 * s}` }, duongSuc);
    el('path', { d: `M80 ${-20 * s} C200 ${-155 * s} -200 ${-155 * s} -80 ${-20 * s}` }, duongSuc);
    // mũi tên ngoài nam châm hướng từ N (phải) sang S (trái)
    el('path', { d: `M6 ${-74 * s - 6} L-6 ${-74 * s} L6 ${-74 * s + 6}`, class: 'mui-suc' }, duongSuc);
    el('path', { d: `M6 ${-120 * s - 6} L-6 ${-120 * s} L6 ${-120 * s + 6}`, class: 'mui-suc' }, duongSuc);
  }
  const cucTrai = el('rect', { x: -80, y: -24, width: 80, height: 48, rx: 4 }, g);
  const cucPhai = el('rect', { x: 0, y: -24, width: 80, height: 48, rx: 4 }, g);
  const chuTrai = el('text', { x: -40, y: 9, class: 'chu-cuc', 'text-anchor': 'middle' }, g);
  const chuPhai = el('text', { x: 40, y: 9, class: 'chu-cuc', 'text-anchor': 'middle' }, g);
  return {
    g,
    duongSuc,
    /** cuc = +1: cực N bên phải (hướng vào cuộn dây); −1: đảo cực. */
    datCuc(cuc) {
      const [trai, phai] = cuc > 0 ? ['S', 'N'] : ['N', 'S'];
      chuTrai.textContent = trai;
      chuPhai.textContent = phai;
      cucTrai.setAttribute('class', `cuc-${trai}`);
      cucPhai.setAttribute('class', `cuc-${phai}`);
      duongSuc.setAttribute('transform', cuc > 0 ? '' : 'scale(-1 1)');
    },
  };
}

/** Đồ thị theo thời gian vẽ trong SVG chính. */
function taoDoThi(cha, { x, y, w, h, tieuDe, mau, coTiepTuyen = false, coTrucThoiGian = false }) {
  const g = el('g', { class: 'do-thi-dt' }, cha);
  const tieu = el('text', { x: x - 86, y: y - 12, class: 'tieu-de-do-thi-dt' }, g);
  tieu.textContent = tieuDe;
  const luoi = [-1, 0, 1].map((k) => ({
    k,
    duong: el('line', { x1: x, x2: x + w, y1: y + h / 2 - (k * h) / 2, y2: y + h / 2 - (k * h) / 2, class: k === 0 ? 'truc-0' : 'luoi-dt' }, g),
    chu: el('text', { x: x - 8, y: y + h / 2 - (k * h) / 2 + 5, class: 'chu-truc-dt', 'text-anchor': 'end' }, g),
  }));
  const duong = el('path', { class: 'duong-dt', stroke: mau }, g);
  const tiepTuyen = coTiepTuyen ? el('line', { class: 'tiep-tuyen' }, g) : null;
  const chuTiepTuyen = coTiepTuyen ? el('text', { class: 'chu-tiep-tuyen' }, g) : null;
  const cham = el('circle', { r: 7, fill: mau, class: 'cham-dt' }, g);
  const nhanTG = coTrucThoiGian ? [0, 0.25, 0.5, 0.75, 1].map((k) => el('text', { x: x + k * w, y: y + h + 22, class: 'chu-truc-dt', 'text-anchor': 'middle' }, g)) : [];
  let yMaxCu = null;
  return {
    /**
     * @param {Array<[number,number]>} du các điểm [t, giá trị]
     * @param {{tCuoi:number, khoang:number, yMax:number, dinhDangY:(v:number)=>string, dinhDangT:(t:number)=>string, doDoc?:number}} o
     */
    capNhat(du, o) {
      const tDau = o.tCuoi - o.khoang;
      const sx = (t) => x + ((t - tDau) / o.khoang) * w;
      const sy = (v) => y + h / 2 - (Math.max(-1.05, Math.min(1.05, v / o.yMax)) * h) / 2;
      if (o.yMax !== yMaxCu) {
        yMaxCu = o.yMax;
        for (const l of luoi) l.chu.textContent = o.dinhDangY(l.k * o.yMax);
      }
      nhanTG.forEach((n, i) => { n.textContent = o.dinhDangT(-o.khoang * (1 - i / 4)); });
      let d = '';
      for (const [t, v] of du) if (t >= tDau) d += `${d ? 'L' : 'M'}${sx(t).toFixed(1)} ${sy(v).toFixed(1)}`;
      duong.setAttribute('d', d);
      const cuoi = du[du.length - 1];
      if (!cuoi) return;
      const cx = sx(cuoi[0]);
      const cy = sy(cuoi[1]);
      cham.setAttribute('cx', cx.toFixed(1));
      cham.setAttribute('cy', cy.toFixed(1));
      if (tiepTuyen) {
        // độ dốc trên màn hình của đường tiếp tuyến: (px/px)
        const kx = w / o.khoang;
        const ky = h / 2 / o.yMax;
        const dx = 1;
        const dy = -(o.doDoc * ky) / kx;
        const n = Math.hypot(dx, dy);
        const L = 70;
        tiepTuyen.setAttribute('x1', (cx - (L * dx) / n).toFixed(1));
        tiepTuyen.setAttribute('y1', (cy - (L * dy) / n).toFixed(1));
        tiepTuyen.setAttribute('x2', (cx + (L * dx) / n * 0.25).toFixed(1));
        tiepTuyen.setAttribute('y2', (cy + (L * dy) / n * 0.25).toFixed(1));
        chuTiepTuyen.setAttribute('x', (cx - 12).toFixed(1));
        chuTiepTuyen.setAttribute('y', (cy > y + h / 2 ? cy - 20 : cy + 32).toFixed(1));
        chuTiepTuyen.textContent = o.chuDoDoc;
      }
    },
  };
}

export function veSanKhau(svg) {
  svg.innerHTML = '';
  const ref = { tuThong: [], lenz: [], mui: [] };
  // nền tràn khung (lấp khoảng trống khi tỉ lệ khung khác 16:9)
  el('rect', { x: -2000, y: -1200, width: 5600, height: 3300, class: 'nen-san-khau' }, svg);

  // ======================= HÌNH 1.1 =======================
  const gMat = el('g', { class: 'khu', 'data-khu': 'mat' }, svg);
  el('rect', { x: 20, y: 20, width: 800, height: 870, rx: 18, class: 'the-svg' }, gMat);
  el('text', { x: 44, y: 60, class: 'tieu-de-svg' }, gMat).textContent = 'Hình 1.1 – Vòng dây nhìn chính diện';
  kyHieuTuThong(gMat, 56, 92, 11, 'chu-giai-ky-hieu').dat(1, 1);
  el('text', { x: 76, y: 99, class: 'chu-svg' }, gMat).textContent = 'từ thông đi vào';
  kyHieuTuThong(gMat, 240, 92, 11, 'chu-giai-ky-hieu').dat(-1, 1);
  el('text', { x: 260, y: 99, class: 'chu-svg' }, gMat).textContent = 'đi ra';
  kyHieuTuThong(gMat, 340, 92, 9, 'lenz chu-giai-ky-hieu').dat(1, 1);
  el('text', { x: 357, y: 99, class: 'chu-svg' }, gMat).textContent = 'từ thông do dòng cảm ứng (Lenz)';

  const { cx, cy, rx, ry } = MAT;
  ref.nhanPhi = el('text', { x: cx, y: 150, class: 'nhan-phi', 'text-anchor': 'middle' }, gMat);
  ref.lopCuon = el('g', { class: 'lop-cuon' }, gMat);
  // ký hiệu từ thông ⊗/⊙ (vị trí lưới bên trong vòng dây, xếp gần tâm trước)
  const viTri = [];
  for (let gx = -231; gx <= 231; gx += 66) {
    for (let gy = -120; gy <= 120; gy += 60) {
      const r = (gx / 238) ** 2 + (gy / 142) ** 2;
      if (r <= 1) viTri.push({ x: cx + gx, y: cy + gy, r });
    }
  }
  viTri.sort((a, b) => a.r - b.r);
  const lopTT = el('g', {}, gMat);
  for (const p of viTri) ref.tuThong.push(kyHieuTuThong(lopTT, p.x, p.y, 17, 'chinh'));
  const viTriLenz = [];
  for (let gx = -198; gx <= 198; gx += 66) {
    for (let gy = -90; gy <= 90; gy += 60) {
      const r = (gx / 230) ** 2 + (gy / 135) ** 2;
      if (r <= 1) viTriLenz.push({ x: cx + gx, y: cy + gy, r });
    }
  }
  viTriLenz.sort((a, b) => a.r - b.r);
  ref.lopLenz = el('g', { class: 'lop-lenz' }, gMat);
  for (const p of viTriLenz) ref.lenz.push(kyHieuTuThong(ref.lopLenz, p.x, p.y, 11, 'lenz'));
  // mũi tên chiều thực của e chạy quanh vòng dây
  ref.lopMui = el('g', { class: 'lop-mui-e' }, gMat);
  for (let i = 0; i < 8; i++) ref.mui.push(el('path', { d: 'M-9 -10 L5 0 L-9 10', class: 'mui-e' }, ref.lopMui));
  // chiều dương quy ước (giống Hình 1.1: bên trái, hướng lên — chiều kim đồng hồ)
  ref.lopQuyUoc = el('g', { class: 'lop-quy-uoc' }, gMat);
  el('path', { d: cungElip(cx, cy, rx + 58, ry + 58, Math.PI - 0.36, Math.PI + 0.3), class: 'cung-quy-uoc' }, ref.lopQuyUoc);
  const [ax, ay] = diemElip(cx, cy, rx + 58, ry + 58, Math.PI + 0.36);
  el('path', { d: `M${ax - 10} ${ay + 16} L${ax} ${ay - 2} L${ax + 10} ${ay + 16} Z`, class: 'dau-quy-uoc' }, ref.lopQuyUoc);
  el('text', { x: 52, y: cy + 8, class: 'chu-e-quy-uoc', 'text-anchor': 'middle' }, ref.lopQuyUoc).textContent = 'e';
  el('text', { x: 52, y: cy + 34, class: 'chu-svg-nho', 'text-anchor': 'middle' }, ref.lopQuyUoc).textContent = '(+)';
  ref.nhanW = el('text', { x: cx + rx - 4, y: cy + ry + 52, class: 'nhan-w', 'text-anchor': 'end' }, gMat);
  // vôn kế kim giữa
  const vk = el('g', { class: 'von-ke' }, gMat);
  ref.chanTrai = el('path', { class: 'day-noi' }, gMat);
  ref.chanPhai = el('path', { class: 'day-noi' }, gMat);
  el('rect', { x: cx - 100, y: 712, width: 200, height: 162, rx: 16, class: 'vo-von-ke' }, vk);
  const tamVK = [cx, 842];
  el('path', { d: cungElip(tamVK[0], tamVK[1], 82, 82, (-145 * Math.PI) / 180, (-35 * Math.PI) / 180, 40), class: 'thang-do' }, vk);
  for (const v of [-1, -0.5, 0, 0.5, 1]) {
    const a = ((-90 + v * 55) * Math.PI) / 180;
    el('line', { x1: tamVK[0] + 74 * Math.cos(a), y1: tamVK[1] + 74 * Math.sin(a), x2: tamVK[0] + 86 * Math.cos(a), y2: tamVK[1] + 86 * Math.sin(a), class: 'vach-do' }, vk);
  }
  for (const [v, t] of [[-1, '−'], [0, '0'], [1, '+']]) {
    const a = ((-90 + v * 55) * Math.PI) / 180;
    el('text', { x: tamVK[0] + 102 * Math.cos(a), y: tamVK[1] + 102 * Math.sin(a) + 6, class: 'chu-thang-do', 'text-anchor': 'middle' }, vk).textContent = t;
  }
  el('text', { x: cx, y: 818, class: 'chu-v', 'text-anchor': 'middle' }, vk).textContent = 'V';
  ref.kim = el('line', { x1: tamVK[0], y1: tamVK[1], x2: tamVK[0], y2: tamVK[1] - 72, class: 'kim' }, vk);
  el('circle', { cx: tamVK[0], cy: tamVK[1], r: 7, class: 'truc-kim' }, vk);
  ref.chuVonKe = el('text', { x: cx, y: 866, class: 'chu-von-ke', 'text-anchor': 'middle' }, vk);
  ref.chiQuaThang = el('text', { x: cx + 92, y: 734, class: 'qua-thang', 'text-anchor': 'end' }, vk);

  // ======================= NGUỒN TẠO TỪ THÔNG (nhìn ngang) =======================
  const gNg = el('g', { class: 'khu', 'data-khu': 'nguon' }, svg);
  el('rect', { x: 840, y: 20, width: 740, height: 420, rx: 18, class: 'the-svg' }, gNg);
  ref.tieuDeNguon = el('text', { x: 864, y: 60, class: 'tieu-de-svg' }, gNg);
  el('line', { x1: 870, x2: 1566, y1: NGANG.truc, y2: NGANG.truc, class: 'truc-ngang' }, gNg);
  // mắt người quan sát Hình 1.1
  const mat = el('g', { transform: `translate(884 ${NGANG.truc})`, class: 'mat-nhin' }, gNg);
  el('path', { d: 'M-14 0 Q0 -13 14 0 Q0 13 -14 0 Z' }, mat);
  el('circle', { cx: 3, r: 5 }, mat);
  el('text', { x: 864, y: 418, class: 'chu-svg-nho' }, gNg).textContent = 'Mắt: hướng nhìn của Hình 1.1. Từ thông hướng sang phải = đi vào trang (⊗)';
  // các nguồn
  ref.namCham = veNamCham(el('g', {}, gNg));
  ref.goiYKeo = el('text', { class: 'goi-y-keo', 'text-anchor': 'middle' }, ref.namCham.g);
  ref.goiYKeo.setAttribute('y', 62);
  ref.goiYKeo.textContent = '⟷ kéo nam châm';
  ref.vungKeo = el('rect', { x: -95, y: -40, width: 190, height: 80, class: 'vung-keo' }, ref.namCham.g);

  ref.gQuay = el('g', { transform: `translate(1150 ${NGANG.truc})` }, gNg);
  el('path', { d: cungElip(0, 0, 112, 112, -2.4, -0.75, 30), class: 'mui-quay' }, ref.gQuay);
  const [qx, qy] = diemElip(0, 0, 112, 112, -0.75);
  el('path', { d: `M${qx - 12} ${qy - 6} L${qx + 2} ${qy + 2} L${qx - 6} ${qy + 14}`, class: 'mui-quay' }, ref.gQuay);
  el('text', { x: -60, y: -112, class: 'chu-omega' }, ref.gQuay).textContent = 'ω';
  ref.namChamQuay = veNamCham(el('g', {}, ref.gQuay));
  ref.namChamQuay.datCuc(1);

  ref.gDien = el('g', {}, gNg);
  ref.duongSucDien = el('g', { class: 'duong-suc dien' }, ref.gDien);
  for (const s of [1, -1]) {
    el('path', { d: `M1300 ${NGANG.truc - 16 * s} C1400 ${NGANG.truc - 140 * s} 940 ${NGANG.truc - 140 * s} 1040 ${NGANG.truc - 16 * s}` }, ref.duongSucDien);
  }
  el('rect', { x: 1040, y: NGANG.truc - 24, width: 260, height: 48, rx: 6, class: 'loi-thep' }, ref.gDien);
  for (let x = 1062; x <= 1280; x += 24) el('ellipse', { cx: x, cy: NGANG.truc, rx: 8, ry: 36, class: 'vong-quan' }, ref.gDien);
  el('path', { d: `M1062 ${NGANG.truc + 36} L1062 370 L1120 370 M1278 ${NGANG.truc + 36} L1278 370 L1220 370`, class: 'day-noi' }, ref.gDien);
  el('rect', { x: 1120, y: 346, width: 100, height: 48, rx: 10, class: 'hop-nguon' }, ref.gDien);
  ref.chuDongDien = el('text', { x: 1170, y: 377, class: 'chu-dong-dien', 'text-anchor': 'middle' }, ref.gDien);
  ref.cucDienPhai = el('text', { x: 1286, y: NGANG.truc - 34, class: 'chu-cuc-dien', 'text-anchor': 'middle' }, ref.gDien);
  ref.cucDienTrai = el('text', { x: 1054, y: NGANG.truc - 34, class: 'chu-cuc-dien', 'text-anchor': 'middle' }, ref.gDien);

  // cuộn dây nhìn ngang + mũi tên từ thông xuyên qua
  ref.lopCuonNgang = el('g', {}, gNg);
  ref.muiTuThong = el('g', { class: 'mui-tu-thong' }, gNg);
  ref.thanMuiTT = el('line', { x1: 1350, x2: 1530, y1: NGANG.truc, y2: NGANG.truc }, ref.muiTuThong);
  ref.dauMuiTT = el('path', { d: `M1530 ${NGANG.truc - 14} L1556 ${NGANG.truc} L1530 ${NGANG.truc + 14} Z` }, ref.muiTuThong);
  ref.chuPhiNgang = el('text', { x: 1540, y: NGANG.truc - 26, class: 'chu-phi-ngang', 'text-anchor': 'middle' }, gNg);
  ref.chuPhiNgang.textContent = 'φ';

  // ======================= ĐỒ THỊ =======================
  const gDT = el('g', { class: 'khu', 'data-khu': 'do-thi' }, svg);
  el('rect', { x: 840, y: 456, width: 740, height: 434, rx: 18, class: 'the-svg' }, gDT);
  ref.doThiPhi = taoDoThi(gDT, { x: 950, y: 506, w: 606, h: 140, tieuDe: '', mau: MAU.tuThong, coTiepTuyen: true });
  ref.doThiE = taoDoThi(gDT, { x: 950, y: 706, w: 606, h: 140, tieuDe: '', mau: MAU.sdd, coTrucThoiGian: true });
  ref.tieuDePhi = gDT.querySelectorAll('.tieu-de-do-thi-dt')[0];
  ref.tieuDeE = gDT.querySelectorAll('.tieu-de-do-thi-dt')[1];
  return ref;
}

/** Vẽ lại các vòng dây khi đổi số vòng w (vẽ tối đa 8 vòng). */
export function veCuonDay(ref, w) {
  const { cx, cy, rx, ry } = MAT;
  const n = Math.min(8, Math.max(1, Math.round(w)));
  ref.lopCuon.innerHTML = '';
  const khe = 0.075;
  for (let k = n - 1; k >= 0; k--) {
    const dx = (k - (n - 1) / 2) * 6;
    const dy = -(k - (n - 1) / 2) * 4;
    el('path', { d: cungElip(cx + dx, cy + dy, rx, ry, Math.PI / 2 + khe, Math.PI / 2 + 2 * Math.PI - khe, 160), class: 'vong-day' }, ref.lopCuon);
  }
  const [x1, y1] = diemElip(cx, cy, rx, ry, Math.PI / 2 + khe);
  const [x2, y2] = diemElip(cx, cy, rx, ry, Math.PI / 2 - khe);
  ref.chanTrai.setAttribute('d', `M${x1.toFixed(1)} ${y1.toFixed(1)} L${cx - 44} 650 L${cx - 44} 712`);
  ref.chanPhai.setAttribute('d', `M${x2.toFixed(1)} ${y2.toFixed(1)} L${cx + 44} 650 L${cx + 44} 712`);
  ref.nhanW.textContent = w > 8 ? `w = ${w} vòng (vẽ 8 vòng)` : `w = ${w} vòng`;
  ref.lopCuonNgang.innerHTML = '';
  for (let k = 0; k < n; k++) {
    el('ellipse', { cx: NGANG.xCuon + (k - (n - 1) / 2) * 7, cy: NGANG.truc, rx: 9, ry: 105, class: 'vong-day-ngang' }, ref.lopCuonNgang);
  }
}

/** Đặt vị trí 8 mũi tên chiều thực của e trên vòng dây. pha: 0…1, huong: +1 chiều kim đồng hồ. */
export function datMuiE(ref, pha, huong, doDam) {
  const { cx, cy, rx, ry } = MAT;
  ref.lopMui.setAttribute('opacity', doDam.toFixed(2));
  ref.mui.forEach((m, i) => {
    const t = Math.PI / 2 + 0.35 + ((i + pha) / ref.mui.length) * (2 * Math.PI - 0.7);
    const [x, y] = diemElip(cx, cy, rx + 30, ry + 30, t);
    const goc = (Math.atan2(ry * Math.cos(t), -rx * Math.sin(t)) * 180) / Math.PI + (huong > 0 ? 0 : 180);
    m.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${goc.toFixed(1)})`);
  });
}

export { NGANG, MAU };
