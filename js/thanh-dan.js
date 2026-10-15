/**
 * thanh-dan.js — Kịch bản d) của bài 1.2.a: thanh dẫn chuyển động trong từ trường, e = B·l·v (Hình 1.2)
 * và quy tắc bàn tay phải.
 *
 * Hình chiếu xiên: trục x sang phải (chiều v), trục y hướng lên (B hướng xuống, −y),
 * trục z đi vào phía sau (vẽ chéo lên bên phải, dọc theo thanh dẫn). Chiều dương của e là +z
 * (như hình 1.2 trong slide): v sang phải, B hướng xuống ⇒ e hướng vào phía sau.
 */
import { el } from './so-do.js';
import { taoDoThi } from './hinh-dien-tu.js';
import { sddThanhDan } from './dien-tu.js';
import { dinhDangSo } from './tinh-toan.js';

const GOC = { x: 200, y: 690 };
const EZ = { x: 0.62, y: -0.44 }; // vectơ chiếu của trục z
const PX_MOI_M = 300; // chiều dài thanh trên hình: 1 m ↔ 300 đơn vị theo trục z
const RAY = { x0: -110, x1: 540 };
const VUNG = { x0: 20, x1: 560, z0: -30, z1: 330 };
const THANH = { xMin: 40, xMax: 500 };
const MAU = { B: '#2a78d6', e: '#eb6834', v: '#2e7d32' };

const P = (x, y, z) => [GOC.x + x + EZ.x * z, GOC.y - y + EZ.y * z];
const diem = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const duong = (...ds) => `M${ds.map(diem).join(' L')}`;

function muiTen(cha, lop) {
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

function veVonKe(cha, cx, cy) {
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

/** Bàn tay phải vẽ trong mặt phẳng ngang (mặt phẳng chứa v và e), lòng bàn tay hướng lên đón đường sức B. */
function veBanTay(cha) {
  const g = el('g', { class: 'ban-tay' }, cha);
  const tay = el('g', {}, g);
  // Hệ tọa độ cục bộ: a dọc theo các ngón tay (chiều e), b dọc theo ngón cái (chiều v)
  const capsule = (a0, a1, b, r) => el('rect', { x: a0, y: b - r, width: a1 - a0, height: 2 * r, rx: r, class: 'da-tay' }, tay);
  el('rect', { x: -130, y: -30, width: 100, height: 60, rx: 10, class: 'co-tay' }, tay);
  capsule(30, 112, -27, 8); // ngón út
  capsule(30, 128, -9, 9); // ngón áp út
  capsule(30, 136, 9, 9); // ngón giữa
  capsule(30, 128, 27, 9); // ngón trỏ
  el('rect', { x: -42, y: -38, width: 82, height: 76, rx: 18, class: 'da-tay' }, tay);
  el('rect', { x: -8, y: 24, width: 18, height: 84, rx: 9, class: 'da-tay' }, tay); // ngón cái choãi 90°
  el('path', { d: 'M-20 -12 Q0 0 -18 14', class: 'chi-tay' }, tay);
  const muiB = [0, 1, 2].map(() => muiTen(g, 'mui-b'));
  const muiE = muiTen(g, 'mui-e-tay');
  const muiV = muiTen(g, 'mui-v-tay');
  const chuB = el('text', { class: 'chu-vec vec-b' }, g);
  const chuE = el('text', { class: 'chu-vec vec-e' }, g);
  const chuV = el('text', { class: 'chu-vec vec-v' }, g);
  chuB.textContent = 'B';
  chuE.textContent = 'e';
  chuV.textContent = 'v';
  const uz = Math.hypot(EZ.x, EZ.y);
  const ea = [EZ.x / uz, EZ.y / uz]; // hướng màn hình của trục a (dọc e)
  return {
    g,
    /** huong = +1: thanh đi sang phải; −1: sang trái (bàn tay xoay 180° trong mặt phẳng ngang). */
    dat(cx, cy, huong) {
      const s = huong >= 0 ? 1 : -1;
      tay.setAttribute('transform', `matrix(${ea[0] * s} ${ea[1] * s} ${s} 0 ${cx} ${cy})`);
      const map = (a, b) => [cx + s * (ea[0] * a + b), cy + s * ea[1] * a];
      [[-10, -6], [12, 16], [-14, 22]].forEach(([a, b], i) => {
        const p = map(a, b);
        muiB[i].dat([p[0], p[1] - 125], [p[0], p[1] - 6]);
      });
      const pB = map(-10, -6);
      chuB.setAttribute('x', pB[0] - 26);
      chuB.setAttribute('y', pB[1] - 108);
      muiE.dat(map(150, 9), map(215, 9));
      const pe = map(232, 9);
      chuE.setAttribute('x', pe[0] - 8);
      chuE.setAttribute('y', pe[1] + 8);
      muiV.dat(map(0, 118), map(0, 185));
      const pv = map(0, 205);
      chuV.setAttribute('x', pv[0] - 8);
      chuV.setAttribute('y', pv[1] + 9);
    },
  };
}

/**
 * Tạo kịch bản thanh dẫn.
 * @param {SVGSVGElement} svg
 * @param {object} cfg nội dung thanhDan trong du-lieu/cam-ung-dien-tu.json
 * @param {{soCoNghia, veCongThuc, soTex, lamTronDep, datChuThich}} tienIch
 */
export function taoThanhDan(svg, cfg, tienIch) {
  const { soCoNghia, veCongThuc, soTex, lamTronDep } = tienIch;
  const s = {
    B: cfg.B_T, l: cfg.l_m, v: cfg.v_ms, x: THANH.xMin + 60, tuDoiChieu: cfg.tuDoiChieu,
    hienBanTay: true, t: 0, lichSu: [], e: 0,
  };
  const g = el('g', { class: 'san-khau-thanh' }, svg);
  g.style.display = 'none';

  // ======================= HÌNH 1.2 =======================
  const gHinh = el('g', { class: 'khu', 'data-khu': 'hinh-1-2' }, g);
  el('rect', { x: 20, y: 20, width: 990, height: 870, rx: 18, class: 'the-svg' }, gHinh);
  el('text', { x: 44, y: 60, class: 'tieu-de-svg' }, gHinh).textContent = 'Hình 1.2 – Thanh dẫn chuyển động trong từ trường';
  el('text', { x: 44, y: 92, class: 'chu-svg' }, gHinh).textContent = 'Thanh dẫn trượt trên hai thanh ray nối với vôn kế; chỉnh v, B, l ở bảng bên phải.';
  [['vec-b', 'B, φ', 'đường sức từ'], ['vec-v', 'v', 'vận tốc thanh'], ['vec-e', 'e', 'sức điện động']].forEach(([lop, ky, chu], i) => {
    el('text', { x: 52 + i * 250, y: 136, class: `chu-vec ${lop} chu-vec-nho` }, gHinh).textContent = ky;
    el('text', { x: 52 + i * 250 + (ky.length > 1 ? 52 : 22), y: 134, class: 'chu-svg' }, gHinh).textContent = `– ${chu}`;
  });
  const zMax = PX_MOI_M * cfg.lMax_m;
  const matPhang = (y, z0, z1) => duong(P(VUNG.x0, y, z0), P(VUNG.x1, y, z0), P(VUNG.x1, y, z1), P(VUNG.x0, y, z1)) + ' Z';
  const khoi = (y0, y1, lop, chu) => {
    const gk = el('g', { class: `cuc-tu ${lop}` }, gHinh);
    el('path', { d: matPhang(y1, VUNG.z0, Math.max(VUNG.z1, zMax + 30)), class: 'mat-tren' }, gk);
    el('path', { d: duong(P(VUNG.x0, y0, VUNG.z0), P(VUNG.x1, y0, VUNG.z0), P(VUNG.x1, y1, VUNG.z0), P(VUNG.x0, y1, VUNG.z0)) + ' Z', class: 'mat-truoc' }, gk);
    const pc = P((VUNG.x0 + VUNG.x1) / 2, (y0 + y1) / 2, VUNG.z0);
    el('text', { x: pc[0], y: pc[1] + 9, class: 'chu-cuc-tu', 'text-anchor': 'middle' }, gk).textContent = chu;
    return gk;
  };
  khoi(-66, -42, 'cuc-s', 'S');
  // Đường sức từ B (hướng xuống, từ cực N sang cực S)
  const gB = el('g', { class: 'duong-suc-b' }, gHinh);
  const muiB = [];
  for (const z of [10, 110, 210, 300]) {
    for (const x of [40, 160, 280, 400, 520]) {
      const m = muiTen(gB, 'mui-b');
      m.dat(P(x, 254, z), P(x, -40, z));
      muiB.push(m);
    }
  }
  // Ray, dây nối, vôn kế
  const gRay = el('g', {}, gHinh);
  const rayGan = el('path', { class: 'ray' }, gRay);
  const rayXa = el('path', { class: 'ray' }, gRay);
  const vonKe = veVonKe(gHinh, 110, 806);
  const dayGan = el('path', { class: 'day-noi' }, gHinh);
  const dayXa = el('path', { class: 'day-noi' }, gHinh);
  // Thanh dẫn và các mũi tên
  const kichThuoc = el('g', { class: 'kich-thuoc' }, gHinh);
  const duongL = el('path', { class: 'duong-l' }, kichThuoc);
  const chuL = el('text', { class: 'chu-vec vec-l', 'text-anchor': 'middle' }, kichThuoc);
  const thanThanh = el('path', { class: 'thanh-dan' }, gHinh);
  const sangThanh = el('path', { class: 'thanh-dan-sang' }, gHinh);
  const dauThanh = el('ellipse', { rx: 9, ry: 7, class: 'dau-thanh' }, gHinh);
  const dau = [0, 1].map(() => {
    const gd = el('g', { class: 'dau-dien-tich' }, gHinh);
    el('circle', { r: 12 }, gd);
    const t = el('text', { y: 6, 'text-anchor': 'middle' }, gd);
    return { gd, t };
  });
  const muiE = muiTen(gHinh, 'mui-e-thanh');
  const chuE = el('text', { class: 'chu-vec vec-e' }, gHinh);
  chuE.textContent = 'e';
  const muiV = muiTen(gHinh, 'mui-v');
  const chuV = el('text', { class: 'chu-vec vec-v' }, gHinh);
  chuV.textContent = 'v';
  khoi(256, 282, 'cuc-n', 'N');
  const pB = P(VUNG.x1 - 10, 120, 0);
  el('text', { x: pB[0] + 18, y: pB[1], class: 'chu-vec vec-b' }, gHinh).textContent = 'φ, B';

  // ======================= QUY TẮC BÀN TAY PHẢI =======================
  const gTay = el('g', { class: 'khu', 'data-khu': 'ban-tay' }, g);
  el('rect', { x: 1030, y: 20, width: 550, height: 470, rx: 18, class: 'the-svg' }, gTay);
  el('text', { x: 1054, y: 60, class: 'tieu-de-svg' }, gTay).textContent = 'Quy tắc bàn tay phải';
  const banTay = veBanTay(gTay);
  [
    'Đường sức từ B đi vào lòng bàn tay',
    'Ngón cái choãi ra 90°: chiều chuyển động v',
    'Bốn ngón tay: chiều sức điện động e',
  ].forEach((t, i) => {
    el('text', { x: 1054, y: 420 + i * 26, class: 'chu-svg' }, gTay).textContent = `${i + 1}. ${t}`;
  });
  const anTay = el('text', { x: 1305, y: 250, class: 'chu-svg', 'text-anchor': 'middle' }, gTay);
  anTay.textContent = 'Bật “Bàn tay phải” để hiện hình';

  // ======================= ĐỒ THỊ =======================
  const gDT = el('g', { class: 'khu', 'data-khu': 'do-thi-thanh' }, g);
  el('rect', { x: 1030, y: 506, width: 550, height: 384, rx: 18, class: 'the-svg' }, gDT);
  const doThiV = taoDoThi(gDT, { x: 1124, y: 548, w: 430, h: 110, tieuDe: 'v (m/s)', mau: MAU.v });
  const doThiE = taoDoThi(gDT, { x: 1124, y: 724, w: 430, h: 110, tieuDe: 'e (V)', mau: MAU.e, coTrucThoiGian: true });

  function veHinh() {
    const L = PX_MOI_M * s.l;
    rayGan.setAttribute('d', duong(P(RAY.x0, 0, 0), P(RAY.x1, 0, 0)));
    rayXa.setAttribute('d', duong(P(RAY.x0, 0, L), P(RAY.x1, 0, L)));
    const xa = P(RAY.x0, 0, L);
    const gan = P(RAY.x0, 0, 0);
    dayGan.setAttribute('d', duong(gan, [gan[0], 716], vonKe.dauTrai));
    dayXa.setAttribute('d', duong(xa, vonKe.dauPhai));
    // thanh dẫn
    const a = P(s.x, 0, -24);
    const b = P(s.x, 0, L + 24);
    thanThanh.setAttribute('d', duong(a, b));
    sangThanh.setAttribute('d', duong([a[0] - 3, a[1] - 4], [b[0] - 3, b[1] - 4]));
    dauThanh.setAttribute('cx', b[0].toFixed(1));
    dauThanh.setAttribute('cy', b[1].toFixed(1));
    // kích thước l (nét đứt song song với thanh, như hình 1.2)
    const k0 = P(s.x - 46, 0, 0);
    const k1 = P(s.x - 46, 0, L);
    duongL.setAttribute('d', `${duong(k0, k1)} ${duong(P(s.x - 30, 0, 0), P(s.x - 56, 0, 0))} ${duong(P(s.x - 30, 0, L), P(s.x - 56, 0, L))}`);
    const km = P(s.x - 60, 0, L * 0.62);
    chuL.setAttribute('x', km[0] - 40);
    chuL.setAttribute('y', km[1] - 6);
    chuL.textContent = `l = ${dinhDangSo(s.l, 2)} m`;
    // e dọc thanh, v ngang
    const e = s.e;
    const coE = Math.abs(e) > 1e-9;
    const d0 = P(s.x + 34, 0, L * 0.15);
    const d1 = P(s.x + 34, 0, L * 0.85);
    muiE.g.style.display = coE ? '' : 'none';
    chuE.style.display = coE ? '' : 'none';
    if (coE) {
      muiE.dat(e > 0 ? d0 : d1, e > 0 ? d1 : d0);
      const pe = e > 0 ? P(s.x + 46, 0, L * 0.92) : P(s.x + 40, 0, L * 0.08);
      chuE.setAttribute('x', pe[0] + 4);
      chuE.setAttribute('y', pe[1] + (e > 0 ? -8 : 30));
    }
    const coV = Math.abs(s.v) > 1e-9;
    muiV.g.style.display = coV ? '' : 'none';
    chuV.style.display = coV ? '' : 'none';
    if (coV) {
      // mũi tên v đặt ở đầu gần của thanh để không chồng lên nhãn l và e
      const goc = P(s.x, 0, L * 0.06);
      const dai = Math.sign(s.v) * (50 + 10 * Math.abs(s.v));
      muiV.dat(goc, [goc[0] + dai, goc[1]]);
      chuV.setAttribute('x', goc[0] + dai + (s.v > 0 ? 10 : -28));
      chuV.setAttribute('y', goc[1] + 10);
    }
    // điện tích tách ở hai đầu thanh: đầu theo chiều e mang dấu +
    const pXa = P(s.x - 22, 0, L + 6);
    const pGan = P(s.x - 22, 0, -6);
    [[pXa, e > 0 ? '+' : '−'], [pGan, e > 0 ? '−' : '+']].forEach(([p, kyHieu], i) => {
      dau[i].gd.setAttribute('transform', `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`);
      dau[i].gd.style.display = coE ? '' : 'none';
      dau[i].t.textContent = kyHieu;
      dau[i].gd.setAttribute('class', `dau-dien-tich ${kyHieu === '+' ? 'duong' : 'am'}`);
    });
    for (const m of muiB) m.g.setAttribute('opacity', (0.2 + (0.8 * s.B) / cfg.BMax_T).toFixed(2));
    // bàn tay
    banTay.g.style.display = s.hienBanTay ? '' : 'none';
    anTay.style.display = s.hienBanTay ? 'none' : '';
    if (s.hienBanTay) banTay.dat(1265, 240, s.v >= 0 ? 1 : -1);
  }

  const eMax = () => cfg.BMax_T * cfg.lMax_m * cfg.vMax_ms;
  let eRange = 1;

  return {
    g,
    get e() { return s.e; },
    datBanTay(bat) {
      s.hienBanTay = bat;
      const o = document.querySelector('#hien-ban-tay');
      if (o) o.checked = bat;
    },
    batDau() {
      s.t = 0;
      s.lichSu = [];
    },
    veDieuKhien(dk) {
      dk.innerHTML = `
        <p class="mo-ta">Thanh dẫn dài <b>l</b> trượt trên hai thanh ray, vuông góc với từ trường <b>B</b> hướng xuống. Chiều dương của e: dọc thanh, hướng vào phía sau (như hình 1.2).</p>
        <label class="dieu-khien doc"><span>Vận tốc v</span> <input type="range" id="td-v" min="${-cfg.vMax_ms}" max="${cfg.vMax_ms}" step="0.5" value="${s.v}"><output id="td-v-gt"></output></label>
        <label class="dieu-khien doc"><span>Từ cảm B</span> <input type="range" id="td-b" min="${cfg.BMin_T}" max="${cfg.BMax_T}" step="0.05" value="${s.B}"><output id="td-b-gt"></output></label>
        <label class="dieu-khien doc"><span>Chiều dài l</span> <input type="range" id="td-l" min="${cfg.lMin_m}" max="${cfg.lMax_m}" step="0.05" value="${s.l}"><output id="td-l-gt"></output></label>
        <div class="hang-nut">
          <button type="button" class="nut" id="td-dung">⏹ v = 0</button>
          <button type="button" class="nut" id="td-dao">⇄ Đổi chiều v</button>
        </div>
        <label class="o-chon"><input type="checkbox" id="td-tu-doi" ${s.tuDoiChieu ? 'checked' : ''}> Tự đổi chiều ở cuối ray</label>
        <label class="o-chon"><input type="checkbox" id="hien-ban-tay" ${s.hienBanTay ? 'checked' : ''}> Bàn tay phải</label>`;
      const $ = (q) => dk.querySelector(q);
      const capNhat = () => {
        s.v = Number($('#td-v').value);
        s.B = Number($('#td-b').value);
        s.l = Number($('#td-l').value);
        $('#td-v-gt').textContent = `${dinhDangSo(s.v, 1)} m/s`;
        $('#td-b-gt').textContent = `${dinhDangSo(s.B, 2)} T`;
        $('#td-l-gt').textContent = `${dinhDangSo(s.l, 2)} m`;
      };
      for (const id of ['#td-v', '#td-b', '#td-l']) $(id).addEventListener('input', capNhat);
      $('#td-dung').addEventListener('click', () => { $('#td-v').value = 0; capNhat(); });
      $('#td-dao').addEventListener('click', () => { $('#td-v').value = -s.v; capNhat(); });
      $('#td-tu-doi').addEventListener('change', (e) => { s.tuDoiChieu = e.target.checked; });
      $('#hien-ban-tay').addEventListener('change', (e) => { s.hienBanTay = e.target.checked; });
      capNhat();
    },
    capNhat(dt) {
      if (dt > 0) {
        s.x += s.v * cfg.pxMoiMs * dt;
        if (s.x > THANH.xMax || s.x < THANH.xMin) {
          if (s.tuDoiChieu) {
            s.x = Math.min(THANH.xMax, Math.max(THANH.xMin, s.x));
            s.v = -s.v;
            const o = document.querySelector('#td-v');
            if (o) { o.value = s.v; o.dispatchEvent(new Event('input')); }
          } else {
            s.x = s.x > THANH.xMax ? THANH.xMin : THANH.xMax;
          }
        }
        s.t += dt;
      }
      s.e = sddThanhDan(s.B, s.l, s.v);
      if (dt > 0 || !s.lichSu.length) {
        s.lichSu.push([s.t, s.v, s.e]);
        while (s.lichSu.length > 2 && s.lichSu[0][0] < s.t - 10.2) s.lichSu.shift();
      }
      eRange = lamTronDep(eMax() * 0.5);
      veHinh();
      vonKe.dat(s.e / eRange, `e = ${soCoNghia(s.e)} V`);
      const dinhDangT = (t) => (Math.abs(t) < 1e-9 ? 'bây giờ' : `${dinhDangSo(t, t % 1 ? 1 : 0)} s`);
      doThiV.capNhat(s.lichSu.map((p) => [p[0], p[1]]), { tCuoi: s.t, khoang: 10, yMax: cfg.vMax_ms, dinhDangY: (v) => dinhDangSo(v, 0), dinhDangT });
      doThiE.capNhat(s.lichSu.map((p) => [p[0], p[2]]), { tCuoi: s.t, khoang: 10, yMax: eRange, dinhDangY: (v) => soCoNghia(v, 2), dinhDangT });
    },
    /** Bảng số liệu, công thức thay số và chú thích. */
    veSoLieu() {
      const q = (id) => document.querySelector(id);
      q('#sl-b').textContent = `${dinhDangSo(s.B, 2)} T`;
      q('#sl-l').textContent = `${dinhDangSo(s.l, 2)} m`;
      q('#sl-v').textContent = `${dinhDangSo(s.v, 1)} m/s`;
      q('#sl-e-thanh').textContent = `${soCoNghia(s.e)} V`;
      q('#sl-dphi-thanh').textContent = `${soCoNghia(Math.abs(s.B * s.l * s.v))} Wb/s`;
      const v = s.v < 0 ? `(${soTex(dinhDangSo(s.v, 1))})` : soTex(dinhDangSo(s.v, 1));
      veCongThuc(q('#ct-thanh'),
        `e = Blv = ${soTex(dinhDangSo(s.B, 2))}\\cdot${soTex(dinhDangSo(s.l, 2))}\\cdot${v} = \\mathbf{${soTex(soCoNghia(s.e))}\\ \\text{V}}`,
        `e = B·l·v = ${dinhDangSo(s.B, 2)}·${dinhDangSo(s.l, 2)}·${dinhDangSo(s.v, 1)} = <b>${soCoNghia(s.e)} V</b>`);
      let html;
      let loai = '';
      if (Math.abs(s.v) < 1e-9) {
        html = 'Thanh dẫn <b>đứng yên</b>: không cắt đường sức từ, từ thông qua mạch không đổi → <b>e = 0</b>.';
      } else {
        const sangPhai = s.v > 0;
        html = `Thanh chuyển động sang <b>${sangPhai ? 'phải' : 'trái'}</b> với |v| = ${dinhDangSo(Math.abs(s.v), 1)} m/s, cắt đường sức từ B hướng xuống → theo quy tắc bàn tay phải, e hướng dọc thanh <b>${sangPhai ? 'vào phía sau' : 'ra phía trước'}</b> (đầu ${sangPhai ? 'xa' : 'gần'} mang dấu +): e = B·l·v = <b>${soCoNghia(s.e)} V</b>.`;
        loai = sangPhai ? 'thanh-cong' : 'canh-bao';
      }
      return { html, loai, tomTat: `B = ${dinhDangSo(s.B, 2)} T · l = ${dinhDangSo(s.l, 2)} m · v = ${dinhDangSo(s.v, 1)} m/s · e = ${soCoNghia(s.e)} V` };
    },
  };
}
