/**
 * luc-dien-tu.js — Trang 1.2.b "Định luật lực điện từ": F_đt = B·i·l, quy tắc bàn tay trái (Hình 1.3).
 *
 * Quy ước dấu (giống Hình 1.3): huongB = +1 khi B hướng xuống; i > 0 khi dòng điện chạy dọc thanh
 * vào phía sau (vẽ chéo lên bên phải); F > 0 khi lực hướng sang phải. Khi đó F = −B·i·l:
 * B hướng xuống, i vào phía sau ⇒ lực hướng sang trái (như slide).
 */
import { el } from './so-do.js';
import { taoDoThi } from './hinh-dien-tu.js';
import { P, duong, muiTen, veDongHo, veTuTruong, veBanTay, PX_MOI_M, RAY, THANH } from './hinh-ray.js';
import { lucDienTu, buocThanhDongCo } from './dien-tu.js';
import { dinhDangSo } from './tinh-toan.js';
import { khoiTaoTrinhChieu } from './trinh-chieu.js';
import { khoiTaoCauHoi } from './kiem-tra.js';
import { napJSON, soCoNghia, lamTronDep, veCongThuc, soTex } from './tien-ich.js';

const $ = (s) => document.querySelector(s);
const MAU = { i: '#eb6834', F: '#7b2cbf', v: '#2e7d32' };

/** Vẽ sân khấu: Hình 1.3, quy tắc bàn tay trái, đồ thị. */
function veSanKhau(svg, cfg) {
  svg.innerHTML = '';
  el('rect', { x: -2000, y: -1200, width: 5600, height: 3300, class: 'nen-san-khau' }, svg);
  const r = {};
  // ======================= HÌNH 1.3 =======================
  const gHinh = el('g', { class: 'khu', 'data-khu': 'hinh-1-3' }, svg);
  el('rect', { x: 20, y: 20, width: 990, height: 870, rx: 18, class: 'the-svg' }, gHinh);
  el('text', { x: 44, y: 60, class: 'tieu-de-svg' }, gHinh).textContent = 'Hình 1.3 – Thanh dẫn mang dòng điện trong từ trường';
  r.phuDe = el('text', { x: 44, y: 92, class: 'chu-svg' }, gHinh);
  [['vec-b', 'B, φ', 'đường sức từ'], ['vec-i', 'i', 'dòng điện'], ['vec-f', 'F', 'lực điện từ F_đt']].forEach(([lop, ky, chu], k) => {
    el('text', { x: 52 + k * 250, y: 136, class: `chu-vec ${lop} chu-vec-nho` }, gHinh).textContent = ky;
    el('text', { x: 52 + k * 250 + (ky.length > 1 ? 52 : 22), y: 134, class: 'chu-svg' }, gHinh).textContent = `– ${chu}`;
  });
  const zMax = PX_MOI_M * Math.max(cfg.luc.lMax_m, cfg.dongCo.l_m);
  r.tuTruong = veTuTruong(gHinh, zMax);
  r.rayGan = el('path', { class: 'ray' }, gHinh);
  r.rayXa = el('path', { class: 'ray' }, gHinh);
  r.ampeKe = veDongHo(gHinh, 110, 806, 'A');
  // nguồn điện
  const gNguon = el('g', { class: 'nguon-dien' }, gHinh);
  // Nguồn đặt bên phải, nối đầu phải của ray xa: dây nối không vắt qua mặt từ trường
  el('rect', { x: 800, y: 786, width: 150, height: 90, rx: 12, class: 'vo-nguon' }, gNguon);
  // ký hiệu pin: vạch dài là cực dương, vạch ngắn là cực âm
  r.vachTrai = el('line', { x1: 867, x2: 867, class: 'cuc-pin' }, gNguon);
  r.vachPhai = el('line', { x1: 883, x2: 883, class: 'cuc-pin' }, gNguon);
  el('line', { x1: 814, y1: 826, x2: 867, y2: 826, class: 'day-nguon' }, gNguon);
  el('line', { x1: 883, y1: 826, x2: 936, y2: 826, class: 'day-nguon' }, gNguon);
  r.dauCong = el('text', { x: 852, y: 806, class: 'chu-cuc-pin', 'text-anchor': 'middle' }, gNguon);
  r.dauTru = el('text', { x: 898, y: 810, class: 'chu-cuc-pin', 'text-anchor': 'middle' }, gNguon);
  r.chuNguon = el('text', { x: 875, y: 866, class: 'chu-nguon', 'text-anchor': 'middle' }, gNguon);
  r.day1 = el('path', { class: 'day-noi' }, gHinh);
  r.day2 = el('path', { class: 'day-noi' }, gHinh);
  r.day3 = el('path', { class: 'day-noi' }, gHinh);
  // thanh dẫn, kích thước l, mũi tên i và F
  r.duongL = el('path', { class: 'duong-l' }, gHinh);
  r.chuL = el('text', { class: 'chu-vec vec-l', 'text-anchor': 'middle' }, gHinh);
  r.than = el('path', { class: 'thanh-dan' }, gHinh);
  r.sang = el('path', { class: 'thanh-dan-sang' }, gHinh);
  r.dau = el('ellipse', { rx: 9, ry: 7, class: 'dau-thanh' }, gHinh);
  r.muiI = muiTen(gHinh, 'mui-i-thanh');
  r.chuI = el('text', { class: 'chu-vec vec-i' }, gHinh);
  r.chuI.textContent = 'i';
  r.muiF = muiTen(gHinh, 'mui-f-thanh');
  r.chuF = el('text', { class: 'chu-vec vec-f' }, gHinh);
  r.chuF.innerHTML = 'F<tspan class="chi-so" dy="8">đt</tspan>';
  r.tuTruong.veKhoiTren();
  const pB = P(550, 120, 0);
  el('text', { x: pB[0] + 18, y: pB[1], class: 'chu-vec vec-b' }, gHinh).textContent = 'φ, B';

  // ======================= QUY TẮC BÀN TAY TRÁI =======================
  const gTay = el('g', { class: 'khu', 'data-khu': 'ban-tay' }, svg);
  el('rect', { x: 1030, y: 20, width: 550, height: 470, rx: 18, class: 'the-svg' }, gTay);
  el('text', { x: 1054, y: 60, class: 'tieu-de-svg' }, gTay).textContent = 'Quy tắc bàn tay trái';
  r.banTay = veBanTay(gTay, { trai: true, ngon: ['i', 'mui-i-tay', 'vec-i'], cai: ['F', 'mui-f-tay', 'vec-f'] });
  ['Đường sức từ B đi vào lòng bàn tay', 'Các ngón tay: chiều dòng điện i', 'Ngón cái choãi ra 90°: chiều lực điện từ F'].forEach((t, k) => {
    el('text', { x: 1054, y: 420 + k * 26, class: 'chu-svg' }, gTay).textContent = `${k + 1}. ${t}`;
  });
  r.anTay = el('text', { x: 1305, y: 250, class: 'chu-svg', 'text-anchor': 'middle' }, gTay);
  r.anTay.textContent = 'Bật “Bàn tay trái” để hiện hình';

  // ======================= ĐỒ THỊ =======================
  const gDT = el('g', { class: 'khu', 'data-khu': 'do-thi' }, svg);
  el('rect', { x: 1030, y: 506, width: 550, height: 384, rx: 18, class: 'the-svg' }, gDT);
  r.doThi1 = taoDoThi(gDT, { x: 1124, y: 548, w: 430, h: 110, tieuDe: '', mau: MAU.i });
  r.doThi2 = taoDoThi(gDT, { x: 1124, y: 724, w: 430, h: 110, tieuDe: '', mau: MAU.F, coTrucThoiGian: true });
  [r.tieuDe1, r.tieuDe2] = gDT.querySelectorAll('.tieu-de-do-thi-dt');
  r.duong1 = gDT.querySelectorAll('.duong-dt')[0];
  r.cham1 = gDT.querySelectorAll('.cham-dt')[0];
  return r;
}

async function khoiDong() {
  let nd, cauHoi;
  try {
    [nd, cauHoi] = await Promise.all([napJSON('du-lieu/luc-dien-tu.json'), napJSON('du-lieu/cau-hoi-luc-dien-tu.json')]);
  } catch (loi) {
    const tb = $('#thong-bao-loi');
    tb.hidden = false;
    tb.innerHTML = `<h2>Không nạp được dữ liệu</h2><p>${loi.message}</p>
      <p>Hãy mở trang qua GitHub Pages hoặc máy chủ cục bộ (ví dụ <code>python3 -m http.server</code>), xem README.</p>`;
    return;
  }
  const svg = $('#so-do');
  const r = veSanKhau(svg, nd);
  const s = {
    kichBan: nd.macDinh.kichBan,
    dangChay: true,
    tocDo: 1,
    hienBanTay: nd.macDinh.hienBanTay,
    huongB: 1,
    // kịch bản a
    i: nd.luc.i_A, B: nd.luc.B_T, l: nd.luc.l_m,
    // kịch bản b
    U: nd.dongCo.U_V, v: 0, x: (THANH.xMin + THANH.xMax) / 2, e: 0,
    F: 0, t: 0, lichSu: [],
  };

  // ---------- Lý thuyết ----------
  const lt = nd.lyThuyet;
  $('#the-ly-thuyet').innerHTML = `
    <p class="muc-nho">${lt.muc}</p>
    <h2>${lt.tieuDe}</h2>
    <p class="phat-bieu">${lt.phatBieu}</p>
    ${lt.congThuc.map((c, k) => `<div class="cong-thuc" data-ct="${k}"></div>`).join('')}
    <p class="dong-ly-thuyet">trong đó:</p>
    <ul class="ky-hieu-ly-thuyet">${lt.kyHieu.map((k) => `<li><i>${k.tex}</i> – ${k.chu}</li>`).join('')}</ul>
    <p class="dong-ly-thuyet chieu-luc"><i>${lt.chieu}</i></p>
    <p class="quy-tac">${lt.quyTac}</p>
    <ul class="ghi-chu-ly-thuyet">${lt.ghiChu.map((g) => `<li>${g}</li>`).join('')}</ul>`;
  const veLyThuyet = () => lt.congThuc.forEach((c, k) => veCongThuc($(`[data-ct="${k}"]`), c.tex, c.duPhong));
  veLyThuyet();
  if (!window.katex) document.querySelector('script[src*="katex"]')?.addEventListener('load', () => { veLyThuyet(); veSoLieu(true); }, { once: true });

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
  const oTay = $('#hien-ban-tay');
  oTay.checked = s.hienBanTay;
  oTay.addEventListener('change', () => { s.hienBanTay = oTay.checked; });
  $('#chon-kich-ban').addEventListener('change', (e) => chonKichBan(e.target.value));
  const nutTMH = $('#nut-toan-man-hinh');
  if (!document.fullscreenEnabled) nutTMH.hidden = true;
  nutTMH.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  });
  document.addEventListener('fullscreenchange', () => nutTMH.classList.toggle('dang-bat', !!document.fullscreenElement));

  const thaLai = () => {
    // đặt thanh ở đầu ray phía ngược chiều lực để thanh chạy hết chiều dài ray
    const F0 = -s.huongB * lucDienTu(nd.dongCo.B_T, s.U / nd.dongCo.R_ohm, nd.dongCo.l_m);
    s.x = F0 < 0 ? THANH.xMax : THANH.xMin;
    s.v = 0;
  };
  const daoCuc = () => {
    s.huongB = -s.huongB;
    r.tuTruong.datChieu(s.huongB);
    if (s.kichBan === 'dong-co') thaLai();
  };

  // ---------- Kịch bản ----------
  function chonKichBan(id) {
    s.kichBan = id;
    $('#chon-kich-ban').value = id;
    document.body.dataset.kichBan = id;
    s.t = 0;
    s.lichSu = [];
    const dk = $('#dieu-khien-kich-ban');
    const c = nd.luc;
    if (id === 'luc') {
      s.x = (THANH.xMin + THANH.xMax) / 2;
      s.v = 0;
      s.l = c.l_m;
      dk.innerHTML = `
        <p class="mo-ta">Thanh dẫn được <b>giữ cố định</b> trên hai thanh ray, nối với nguồn điều chỉnh được dòng điện. Chiều dương của i: dọc thanh, hướng vào phía sau (như hình 1.3).</p>
        <label class="dieu-khien doc"><span>Dòng điện i</span> <input type="range" id="ld-i" min="${-c.iMax_A}" max="${c.iMax_A}" step="0.5" value="${s.i}"><output id="ld-i-gt"></output></label>
        <label class="dieu-khien doc"><span>Từ cảm B</span> <input type="range" id="ld-b" min="${c.BMin_T}" max="${c.BMax_T}" step="0.05" value="${s.B}"><output id="ld-b-gt"></output></label>
        <label class="dieu-khien doc"><span>Chiều dài l</span> <input type="range" id="ld-l" min="${c.lMin_m}" max="${c.lMax_m}" step="0.05" value="${s.l}"><output id="ld-l-gt"></output></label>
        <div class="hang-nut">
          <button type="button" class="nut" id="ld-dao-i">⇄ Đảo chiều i</button>
          <button type="button" class="nut" id="ld-dao-b">⇅ Đảo cực nam châm</button>
          <button type="button" class="nut" id="ld-i0">i = 0</button>
        </div>`;
      const capNhat = () => {
        s.i = Number($('#ld-i').value);
        s.B = Number($('#ld-b').value);
        s.l = Number($('#ld-l').value);
        $('#ld-i-gt').textContent = `${dinhDangSo(s.i, 1)} A`;
        $('#ld-b-gt').textContent = `${dinhDangSo(s.B, 2)} T`;
        $('#ld-l-gt').textContent = `${dinhDangSo(s.l, 2)} m`;
      };
      for (const q of ['#ld-i', '#ld-b', '#ld-l']) $(q).addEventListener('input', capNhat);
      $('#ld-dao-i').addEventListener('click', () => { $('#ld-i').value = -s.i; capNhat(); });
      $('#ld-i0').addEventListener('click', () => { $('#ld-i').value = 0; capNhat(); });
      $('#ld-dao-b').addEventListener('click', daoCuc);
      capNhat();
    } else {
      const d = nd.dongCo;
      s.B = d.B_T;
      s.l = d.l_m;
      dk.innerHTML = `
        <p class="mo-ta">Thanh dẫn <b>tự do</b> trên hai thanh ray nối nguồn U qua điện trở R = ${dinhDangSo(d.R_ohm, 1)} Ω; khối lượng thanh m = ${dinhDangSo(d.m_kg, 1)} kg, B = ${dinhDangSo(d.B_T, 2)} T, l = ${dinhDangSo(d.l_m, 2)} m (bỏ qua ma sát).</p>
        <label class="dieu-khien doc"><span>Điện áp U</span> <input type="range" id="dc-u" min="0" max="${d.UMax_V}" step="0.5" value="${s.U}"><output id="dc-u-gt"></output></label>
        <div class="hang-nut">
          <button type="button" class="nut" id="dc-tha">↺ Thả lại thanh</button>
          <button type="button" class="nut" id="dc-dao-b">⇅ Đảo cực nam châm</button>
        </div>`;
      const capNhat = () => { s.U = Number($('#dc-u').value); $('#dc-u-gt').textContent = `${dinhDangSo(s.U, 1)} V`; };
      $('#dc-u').addEventListener('input', capNhat);
      $('#dc-tha').addEventListener('click', thaLai);
      $('#dc-dao-b').addEventListener('click', daoCuc);
      capNhat();
      thaLai();
    }
    document.querySelectorAll('[data-che-do]').forEach((o) => { o.hidden = o.dataset.cheDo !== id; });
    r.phuDe.textContent = id === 'luc'
      ? 'Thanh dẫn giữ cố định trên hai thanh ray nối nguồn; chỉnh i, B, l ở bảng bên phải.'
      : 'Thanh dẫn tự do: lực điện từ làm thanh chuyển động (nguyên lý động cơ).';
    r.tieuDe1.textContent = id === 'luc' ? 'i (A)' : 'v (m/s)';
    r.tieuDe2.textContent = 'F (N)';
    r.duong1.setAttribute('stroke', id === 'luc' ? MAU.i : MAU.v);
    r.cham1.setAttribute('fill', id === 'luc' ? MAU.i : MAU.v);
    veSoLieu(true);
  }

  // ---------- Vẽ hình theo trạng thái ----------
  function veHinh() {
    const L = PX_MOI_M * s.l;
    r.rayGan.setAttribute('d', duong(P(RAY.x0, 0, 0), P(RAY.x1, 0, 0)));
    r.rayXa.setAttribute('d', duong(P(RAY.x0, 0, L), P(RAY.x1, 0, L)));
    const gan = P(RAY.x0, 0, 0);
    const xaPhai = P(RAY.x1, 0, L);
    // mạch: ray gần → ampe kế → (dưới khối nam châm) → nguồn → đầu phải ray xa → thanh dẫn
    r.day1.setAttribute('d', duong(gan, [gan[0], 716], r.ampeKe.dauTrai));
    r.day2.setAttribute('d', duong(r.ampeKe.dauPhai, [196, 740], [196, 800], [780, 800], [780, 826], [814, 826]));
    r.day3.setAttribute('d', duong([936, 826], [972, 826], [972, xaPhai[1]], xaPhai));
    // Dòng điện dương chạy dọc thanh từ ray gần sang ray xa, về nguồn qua cực bên phải và ra ở cực bên trái,
    // nên cực bên trái (nối ampe kế và ray gần) là cực dương.
    const traiDuong = s.kichBan === 'luc' ? s.i >= 0 : s.U >= 0;
    r.dauCong.textContent = traiDuong ? '+' : '−';
    r.dauTru.textContent = traiDuong ? '−' : '+';
    const [dai, ngan] = [[806, 846], [816, 836]];
    const [vt, vp] = traiDuong ? [dai, ngan] : [ngan, dai];
    r.vachTrai.setAttribute('y1', vt[0]); r.vachTrai.setAttribute('y2', vt[1]);
    r.vachPhai.setAttribute('y1', vp[0]); r.vachPhai.setAttribute('y2', vp[1]);
    r.chuNguon.textContent = s.kichBan === 'luc' ? 'nguồn dòng' : `U = ${dinhDangSo(s.U, 1)} V`;
    // thanh dẫn
    const a = P(s.x, 0, -24);
    const b = P(s.x, 0, L + 24);
    r.than.setAttribute('d', duong(a, b));
    r.sang.setAttribute('d', duong([a[0] - 3, a[1] - 4], [b[0] - 3, b[1] - 4]));
    r.dau.setAttribute('cx', b[0].toFixed(1));
    r.dau.setAttribute('cy', b[1].toFixed(1));
    const k0 = P(s.x - 46, 0, 0);
    const k1 = P(s.x - 46, 0, L);
    r.duongL.setAttribute('d', `${duong(k0, k1)} ${duong(P(s.x - 30, 0, 0), P(s.x - 56, 0, 0))} ${duong(P(s.x - 30, 0, L), P(s.x - 56, 0, L))}`);
    const km = P(s.x - 60, 0, L * 0.62);
    r.chuL.setAttribute('x', km[0] - 40);
    r.chuL.setAttribute('y', km[1] - 6);
    r.chuL.textContent = `l = ${dinhDangSo(s.l, 2)} m`;
    // dòng điện dọc thanh
    const coI = Math.abs(s.i) > 1e-6;
    r.muiI.g.style.display = coI ? '' : 'none';
    r.chuI.style.display = coI ? '' : 'none';
    if (coI) {
      const d0 = P(s.x + 34, 0, L * 0.15);
      const d1 = P(s.x + 34, 0, L * 0.85);
      r.muiI.dat(s.i > 0 ? d0 : d1, s.i > 0 ? d1 : d0);
      const pi = s.i > 0 ? P(s.x + 46, 0, L * 0.92) : P(s.x + 40, 0, L * 0.08);
      r.chuI.setAttribute('x', pi[0] + 4);
      r.chuI.setAttribute('y', pi[1] + (s.i > 0 ? -8 : 30));
    }
    // lực điện từ đặt tại trung điểm thanh, hướng ngang
    const coF = Math.abs(s.F) > 1e-6;
    r.muiF.g.style.display = coF ? '' : 'none';
    r.chuF.style.display = coF ? '' : 'none';
    if (coF) {
      // đặt lực ở phần gần của thanh, nhãn bên dưới mũi tên để không chồng lên nhãn l và i
      const goc = P(s.x, 0, L * 0.3);
      const Fmax = nd.luc.BMax_T * nd.luc.iMax_A * nd.luc.lMax_m;
      const dai = Math.sign(s.F) * (55 + 120 * Math.min(1, Math.abs(s.F) / Fmax));
      r.muiF.dat(goc, [goc[0] + dai, goc[1]]);
      r.chuF.setAttribute('x', goc[0] + dai + (s.F > 0 ? -18 : -24));
      r.chuF.setAttribute('y', goc[1] + 36);
    }
    r.tuTruong.datDoDam(0.2 + (0.8 * s.B) / nd.luc.BMax_T);
    // bàn tay trái: đường sức vào lòng bàn tay, các ngón theo i, ngón cái theo F
    r.banTay.g.style.display = s.hienBanTay ? '' : 'none';
    r.anTay.style.display = s.hienBanTay ? 'none' : '';
    if (s.hienBanTay) {
      const sNgon = s.i >= 0 ? 1 : -1;
      const sCai = -s.huongB * sNgon;
      r.banTay.dat(1265, 240, sNgon, sCai, s.huongB > 0);
    }
  }

  // ---------- Số liệu & chú thích ----------
  let lanSoLieu = 0;
  const huongBChu = () => (s.huongB > 0 ? 'hướng xuống' : 'hướng lên');
  function veSoLieu(ngay = false) {
    const bayGio = performance.now();
    if (!ngay && bayGio - lanSoLieu < 250) return;
    lanSoLieu = bayGio;
    const Fmag = Math.abs(s.F);
    const huongF = s.F < 0 ? 'sang trái' : 'sang phải';
    $('#sl-b').textContent = `${dinhDangSo(s.B, 2)} T (${huongBChu()})`;
    $('#sl-i').textContent = `${soCoNghia(Math.abs(s.i))} A`;
    $('#sl-l').textContent = `${dinhDangSo(s.l, 2)} m`;
    $('#sl-f').textContent = Fmag > 1e-9 ? `${soCoNghia(Fmag)} N, ${huongF}` : '0 N';
    let html;
    let loai = '';
    const iTex = soTex(soCoNghia(Math.abs(s.i)));
    veCongThuc($('#ct-f'),
      `F_{dt} = Bil = ${soTex(dinhDangSo(s.B, 2))}\\cdot${iTex}\\cdot${soTex(dinhDangSo(s.l, 2))} = \\mathbf{${soTex(soCoNghia(Fmag))}\\ \\text{N}}`,
      `F_đt = B·i·l = ${dinhDangSo(s.B, 2)}·${soCoNghia(Math.abs(s.i))}·${dinhDangSo(s.l, 2)} = <b>${soCoNghia(Fmag)} N</b>`);
    if (s.kichBan === 'luc') {
      if (Math.abs(s.i) < 1e-9) {
        html = 'Không có dòng điện trong thanh dẫn (i = 0) → <b>F<sub>đt</sub> = 0</b>.';
      } else {
        html = `B ${huongBChu()}, dòng điện i = ${soCoNghia(Math.abs(s.i))} A chạy dọc thanh <b>${s.i > 0 ? 'vào phía sau' : 'ra phía trước'}</b> → theo quy tắc bàn tay trái, lực điện từ hướng <b>${huongF}</b>: F<sub>đt</sub> = B·i·l = <b>${soCoNghia(Fmag)} N</b>.`;
        loai = s.F < 0 ? 'thanh-cong' : 'canh-bao';
      }
    } else {
      const d = nd.dongCo;
      const eMag = Math.abs(s.e);
      $('#sl-u').textContent = `${dinhDangSo(s.U, 1)} V`;
      $('#sl-v').textContent = `${soCoNghia(Math.abs(s.v))} m/s`;
      $('#sl-e').textContent = `${soCoNghia(eMag)} V`;
      veCongThuc($('#ct-i'),
        `i = \\dfrac{U - e}{R} = \\dfrac{${soTex(dinhDangSo(s.U, 1))} - ${soTex(soCoNghia(eMag))}}{${soTex(dinhDangSo(d.R_ohm, 1))}} = \\mathbf{${iTex}\\ \\text{A}}`,
        `i = (U − e)/R = (${dinhDangSo(s.U, 1)} − ${soCoNghia(eMag)})/${dinhDangSo(d.R_ohm, 1)} = <b>${soCoNghia(Math.abs(s.i))} A</b>`);
      if (Math.abs(s.U) < 1e-9) {
        html = 'Điện áp nguồn U = 0: không có dòng điện, không có lực điện từ.';
      } else if (Math.abs(s.i) < 0.02 * Math.abs(s.U / d.R_ohm)) {
        html = `B·l·v ≈ U: sđđ cảm ứng gần bằng điện áp nguồn nên <b>i ≈ 0, F<sub>đt</sub> ≈ 0</b>; thanh chuyển động gần như đều với v ≈ ${soCoNghia(Math.abs(s.v))} m/s (bỏ qua ma sát).`;
        loai = 'thanh-cong';
      } else {
        html = `Lực điện từ F<sub>đt</sub> = ${soCoNghia(Fmag)} N làm thanh chuyển động <b>${huongF}</b> (v = ${soCoNghia(Math.abs(s.v))} m/s). Thanh chuyển động cảm ứng sđđ e = B·l·v = ${soCoNghia(eMag)} V <b>ngược chiều nguồn</b> → i = (U − e)/R = ${soCoNghia(Math.abs(s.i))} A và lực giảm dần.`;
        loai = 'canh-bao';
      }
    }
    const c = $('#chu-thich-buoc');
    c.className = `chu-thich-buoc ${loai}`;
    c.innerHTML = `<span>${html}</span>`;
    const oTC = $('#tc-so-lieu');
    if (oTC && trinhChieu.idHienTai) oTC.textContent = `B = ${dinhDangSo(s.B, 2)} T · i = ${soCoNghia(Math.abs(s.i))} A · l = ${dinhDangSo(s.l, 2)} m · F = ${soCoNghia(Fmag)} N ${Fmag > 1e-9 ? huongF : ''}`;
  }

  // ---------- Trình chiếu & câu hỏi ----------
  const trinhChieu = khoiTaoTrinhChieu({
    noiDung: null,
    cacBuocTrinhChieu: nd.trinhChieu,
    lamNoiBat: (id, b) => {
      const tt = b?.trangThai;
      if (!tt) return;
      if (tt.huongB && tt.huongB !== s.huongB) { s.huongB = tt.huongB; r.tuTruong.datChieu(s.huongB); }
      if (tt.kichBan && tt.kichBan !== s.kichBan) chonKichBan(tt.kichBan);
      if (tt.i !== undefined && $('#ld-i')) { $('#ld-i').value = tt.i; $('#ld-i').dispatchEvent(new Event('input')); }
      if (tt.hienBanTay !== undefined) { s.hienBanTay = tt.hienBanTay; oTay.checked = tt.hienBanTay; }
      if (tt.kichBan === 'dong-co') thaLai();
    },
  });
  khoiTaoCauHoi(cauHoi);
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, select, textarea, dialog')) return;
    if (trinhChieu.xuLyPhim(e)) return;
    if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); datChay(!s.dangChay); }
  });

  // ---------- Vòng lặp ----------
  let tTruoc = performance.now();
  function khung(bayGio) {
    const dtThuc = Math.min(0.1, Math.max(0, (bayGio - tTruoc) / 1000));
    tTruoc = bayGio;
    const dt = s.dangChay ? dtThuc * s.tocDo : 0;
    if (s.kichBan === 'luc') {
      s.F = -s.huongB * lucDienTu(s.B, s.i, s.l);
    } else {
      const d = nd.dongCo;
      const kq = buocThanhDongCo(s.v, dt, { U: s.U, R: d.R_ohm, B: s.huongB * d.B_T, l: d.l_m, m: d.m_kg });
      s.v = kq.v;
      s.i = kq.i;
      s.e = kq.e;
      s.F = kq.F;
      s.x += s.v * d.pxMoiMs * dt;
      if (s.x < THANH.xMin || s.x > THANH.xMax) thaLai();
    }
    if (dt > 0 || !s.lichSu.length) {
      s.t += dt;
      s.lichSu.push([s.t, s.kichBan === 'luc' ? s.i : s.v, s.F]);
      while (s.lichSu.length > 2 && s.lichSu[0][0] < s.t - 10.2) s.lichSu.shift();
    }
    veHinh();
    r.ampeKe.dat(s.i / (s.kichBan === 'luc' ? nd.luc.iMax_A : lamTronDep(nd.dongCo.UMax_V / nd.dongCo.R_ohm)), `i = ${soCoNghia(s.i)} A`);
    const dinhDangT = (t) => (Math.abs(t) < 1e-9 ? 'bây giờ' : `${dinhDangSo(t, t % 1 ? 1 : 0)} s`);
    const y1Max = s.kichBan === 'luc' ? nd.luc.iMax_A : lamTronDep(nd.dongCo.UMax_V / (nd.dongCo.B_T * nd.dongCo.l_m));
    const fMax = s.kichBan === 'luc'
      ? lamTronDep(nd.luc.BMax_T * nd.luc.iMax_A * nd.luc.lMax_m)
      : lamTronDep(nd.dongCo.B_T * (nd.dongCo.UMax_V / nd.dongCo.R_ohm) * nd.dongCo.l_m);
    r.doThi1.capNhat(s.lichSu.map((p) => [p[0], p[1]]), { tCuoi: s.t, khoang: 10, yMax: y1Max, dinhDangY: (v) => dinhDangSo(v, 0), dinhDangT });
    r.doThi2.capNhat(s.lichSu.map((p) => [p[0], p[2]]), { tCuoi: s.t, khoang: 10, yMax: fMax, dinhDangY: (v) => soCoNghia(v, 2), dinhDangT });
    veSoLieu();
    requestAnimationFrame(khung);
  }

  r.tuTruong.datChieu(s.huongB);
  chonKichBan(s.kichBan);
  document.body.classList.add('da-san-sang');
  requestAnimationFrame(khung);
}

khoiDong().catch((loi) => {
  console.error(loi);
  const tb = document.querySelector('#thong-bao-loi');
  if (tb) { tb.hidden = false; tb.innerHTML = `<h2>Lỗi khởi động mô phỏng</h2><p>${loi.message}</p>`; }
});
