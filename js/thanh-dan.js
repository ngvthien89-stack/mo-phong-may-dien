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
import { P, duong, muiTen, veDongHo, veTuTruong, veBanTay, PX_MOI_M, RAY, VUNG, THANH } from './hinh-ray.js';

const MAU = { B: '#2a78d6', e: '#eb6834', v: '#2e7d32' };

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
  const tuTruong = veTuTruong(gHinh, zMax);
  tuTruong.datChieu(1);
  // Ray, dây nối, vôn kế
  const gRay = el('g', {}, gHinh);
  const rayGan = el('path', { class: 'ray' }, gRay);
  const rayXa = el('path', { class: 'ray' }, gRay);
  const vonKe = veDongHo(gHinh, 110, 806);
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
  tuTruong.veKhoiTren();
  const pB = P(VUNG.x1 - 10, 120, 0);
  el('text', { x: pB[0] + 18, y: pB[1], class: 'chu-vec vec-b' }, gHinh).textContent = 'φ, B';

  // ======================= QUY TẮC BÀN TAY PHẢI =======================
  const gTay = el('g', { class: 'khu', 'data-khu': 'ban-tay' }, g);
  el('rect', { x: 1030, y: 20, width: 550, height: 470, rx: 18, class: 'the-svg' }, gTay);
  el('text', { x: 1054, y: 60, class: 'tieu-de-svg' }, gTay).textContent = 'Quy tắc bàn tay phải';
  const banTay = veBanTay(gTay, { ngon: ['e', 'mui-e-tay', 'vec-e'], cai: ['v', 'mui-v-tay', 'vec-v'] });
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
    tuTruong.datDoDam(0.2 + (0.8 * s.B) / cfg.BMax_T);
    // bàn tay
    banTay.g.style.display = s.hienBanTay ? '' : 'none';
    anTay.style.display = s.hienBanTay ? 'none' : '';
    if (s.hienBanTay) {
      // bàn tay phải ngửa (B hướng xuống): ngón cái theo v, bốn ngón tay theo e (cùng dấu với v)
      const h = s.v >= 0 ? 1 : -1;
      banTay.dat(1265, 240, h, h, true);
    }
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
