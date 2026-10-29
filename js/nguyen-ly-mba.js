/**
 * nguyen-ly-mba.js — Trang 2.5–2.7 "Nguyên lý làm việc, hệ số biến áp, thông số định mức" (slide 38–42).
 *
 * Kịch bản a (nguyen-ly): u1 → i1 → Φ = Φm·sin ωt → e1, e2; đồ thị theo ωt; E = 4,44·f·w·Φm.
 * Kịch bản b (he-so-k): k = w1/w2 ≈ U1/U2, điện áp trên mỗi vòng dây hai phía bằng nhau.
 * Kịch bản c (dinh-muc): nhãn máy, tính dòng điện định mức từ S và U.
 */
import { el } from './so-do.js';
import { $, napBai, dieuKhienChung, trinhChieuVaCauHoi, vongLap, chayTrang, hienKichBan } from './khung-trang.js';
import { taoMarker, veThe, veLoiKhung, veCuonDung, veNguonAC, veTai, veTruc, duongGap } from './hinh-mba.js';
import { sddHieuDungMBA, heSoBienAp, dienApThuCap, dongDinhMuc, loaiMBA } from './may-bien-ap.js';
import { dinhDangSo } from './tinh-toan.js';
import { soCoNghia, veCongThuc, soTex } from './tien-ich.js';

const so = (x, k = 3) => soCoNghia(x, k);
const kV = (u) => `${dinhDangSo(u, u < 1 ? 2 : u < 10 ? 1 : 0).replace(/,0+$/, '')} kV`;
const soVongVe = (w) => Math.max(2, Math.min(16, Math.round(2 + (14 * Math.log10(w)) / Math.log10(2000))));

function veSanKhau(svg, nd) {
  svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  taoMarker(defs, 'mui-do', '#d62828');
  taoMarker(defs, 'mui-xanh-la', '#2e9e4f');
  taoMarker(defs, 'mui-xanh', '#2a78d6');
  taoMarker(defs, 'mui-cam', '#eb6834');
  taoMarker(defs, 'mui-den', '#13202b');
  el('rect', { x: -2000, y: -1200, width: 5600, height: 3300, class: 'nen-san-khau' }, svg);
  const r = { a: {}, b: {}, c: {} };

  // ======================= A: NGUYÊN LÝ =======================
  const gA = el('g', {}, svg);
  r.a.g = gA;
  const gM = veThe(gA, 20, 20, 1000, 500, 'Nguyên lý làm việc của MBA (slide 38)');
  const L = { x0: 330, y0: 120, x1: 660, y1: 440, day: 50 };
  veLoiKhung(gM, L);
  const m = L.day / 2;
  r.a.phi = el('rect', { x: L.x0 + m, y: L.y0 + m, width: L.x1 - L.x0 - L.day, height: L.y1 - L.y0 - L.day, class: 'dong-phi' }, gM);
  r.a.muiPhi = el('line', { y1: L.y0 + m, y2: L.y0 + m, class: 'vec', stroke: '#2a78d6', 'marker-end': 'url(#mui-xanh)' }, gM);
  el('text', { x: 495, y: 108, class: 'nhan-dai-luong mau-phi', 'text-anchor': 'middle' }, gM).textContent = 'Φ';
  r.a.cuon1 = el('g', {}, gM);
  r.a.cuon2 = el('g', {}, gM);
  r.a.L = L;
  veNguonAC(gM, 120, 280);
  el('path', { d: 'M120 246 V160 H320 V177 M120 314 V400 H320 V383', class: 'day-mach' }, gM);
  el('path', { d: 'M670 187 V160 H880 V235 M880 325 V400 H670 V383', class: 'day-mach' }, gM);
  veTai(gM, 880, 280);
  el('text', { x: 186, y: 290, class: 'nhan-dai-luong mau-u1' }, gM).textContent = 'u₁';
  el('text', { x: 790, y: 290, class: 'nhan-dai-luong mau-u2' }, gM).textContent = 'u₂';
  el('text', { x: 230, y: 146, class: 'nhan-dai-luong mau-i' }, gM).textContent = 'i₁';
  el('text', { x: 760, y: 146, class: 'nhan-dai-luong mau-i' }, gM).textContent = 'i₂';
  el('text', { x: 396, y: 300, class: 'nhan-dai-luong' }, gM).textContent = 'w₁';
  el('text', { x: 556, y: 300, class: 'nhan-dai-luong' }, gM).textContent = 'w₂';
  el('text', { x: 300, y: 470, class: 'nhan-dai-luong mau-u1', 'text-anchor': 'middle' }, gM).textContent = 'e₁';
  el('text', { x: 690, y: 470, class: 'nhan-dai-luong mau-u2', 'text-anchor': 'middle' }, gM).textContent = 'e₂';
  r.a.chuE1 = el('text', { x: 44, y: 500, class: 'chu-kq dam' }, gM);
  r.a.chuE2 = el('text', { x: 996, y: 500, class: 'chu-kq dam', 'text-anchor': 'end' }, gM);
  r.a.duongSC = el('path', { d: 'M120 246 V160 H320 V177 M320 383 V400 H120 V314', class: 'an' }, svg);
  r.a.duongTC = el('path', { d: 'M670 187 V160 H880 V235 M880 325 V400 H670 V383', class: 'an' }, svg);
  r.a.hat1 = Array.from({ length: 12 }, () => el('circle', { r: 5, class: 'hat-dong' }, gM));
  r.a.hat2 = Array.from({ length: 12 }, () => el('circle', { r: 5, class: 'hat-dong' }, gM));

  // đồ thị theo ωt
  const gD = veThe(gA, 20, 540, 1000, 350, 'Φ(t), e₁(t), e₂(t) theo góc ωt');
  const truc = veTruc(gD, { x0: 90, x1: 980, y0: 600, y1: 840, xMin: 0, xMax: 4 * Math.PI, yMin: -1.15, yMax: 1.4 }, {
    nhanX: [[0, '0'], [Math.PI, 'π'], [2 * Math.PI, '2π'], [3 * Math.PI, '3π'], [4 * Math.PI, '4π']],
    nhanY: [[0, '0'], [1, '+1'], [-1, '−1']],
  });
  r.a.truc = truc;
  r.a.dPhi = el('path', { class: 'duong-dt', stroke: '#2a78d6' }, gD);
  r.a.dE1 = el('path', { class: 'duong-dt', stroke: '#d62828' }, gD);
  r.a.dE2 = el('path', { class: 'duong-dt', stroke: '#2e9e4f', 'stroke-dasharray': '8 5' }, gD);
  r.a.con = el('line', { y1: 600, y2: 840, class: 'duong-cham' }, gD);
  // chú thích góc lệch π/2 giữa đỉnh Φ và đỉnh e
  el('line', { x1: truc.X(Math.PI / 2), x2: truc.X(Math.PI), y1: 616, y2: 616, class: 'vec', stroke: '#13202b', 'stroke-width': 2, 'marker-start': 'url(#mui-den)', 'marker-end': 'url(#mui-den)' }, gD);
  el('text', { x: truc.X(Math.PI) + 12, y: 622, class: 'chu-svg dam' }, gD).textContent = 'π/2';
  [['Φ/Φm', '#2a78d6'], ['e₁/√2E₁', '#d62828'], ['e₂/√2E₁', '#2e9e4f']].forEach(([t, mau], k) => {
    el('rect', { x: 600 + k * 130, y: 566, width: 18, height: 6, fill: mau }, gD);
    el('text', { x: 624 + k * 130, y: 574, class: 'chu-truc-dt' }, gD).textContent = t;
  });
  r.a.chuDT = el('text', { x: 44, y: 880, class: 'nho-xam' }, gD);

  // chuỗi nhân quả
  const gC = veThe(gA, 1040, 20, 540, 870, 'Chuỗi nhân quả');
  r.a.hop = Array.from({ length: 6 }, (_, k) => {
    const y = 80 + k * 133;
    const g = el('g', {}, gC);
    const nen = el('rect', { x: 1056, y, width: 508, height: 104, rx: 12, class: 'o-gia-tri' }, g);
    const d1 = el('text', { x: 1074, y: y + 38, class: 'chu-svg dam' }, g);
    const d2 = el('text', { x: 1074, y: y + 72, class: 'chu-svg' }, g);
    if (k < 5) el('line', { x1: 1310, x2: 1310, y1: y + 106, y2: y + 128, class: 'vec', stroke: '#13202b', 'stroke-width': 2.5, 'marker-end': 'url(#mui-den)' }, g);
    return { nen, d1, d2 };
  });

  // ======================= B: HỆ SỐ k =======================
  const gB = el('g', {}, svg);
  r.b.g = gB;
  const gK = veThe(gB, 20, 20, 1000, 870, 'Hệ số biến áp k = w₁/w₂ ≈ U₁/U₂ (slide 40)');
  r.b.k = el('text', { x: 510, y: 150, class: 'so-lon', 'text-anchor': 'middle' }, gK);
  r.b.loai = el('text', { x: 510, y: 186, class: 'chu-kq dam', 'text-anchor': 'middle' }, gK);
  const LK = { x0: 360, y0: 220, x1: 660, y1: 620, day: 56 };
  veLoiKhung(gK, LK);
  r.b.LK = LK;
  r.b.cuon1 = el('g', {}, gK);
  r.b.cuon2 = el('g', {}, gK);
  el('path', { d: `M${LK.x0 - 10} 268 H260 M${LK.x0 - 10} 572 H260`, class: 'day-mach' }, gK);
  el('path', { d: `M${LK.x1 + 10} 268 H760 M${LK.x1 + 10} 572 H760`, class: 'day-mach' }, gK);
  for (const x of [260, 760]) {
    el('circle', { cx: x, cy: 268, r: 7, class: 'diem-cuc' }, gK);
    el('circle', { cx: x, cy: 572, r: 7, class: 'diem-cuc' }, gK);
  }
  r.b.w1 = el('text', { x: LK.x0 + LK.day / 2, y: 656, class: 'nhan-dai-luong', 'text-anchor': 'middle' }, gK);
  r.b.w2 = el('text', { x: LK.x1 - LK.day / 2, y: 656, class: 'nhan-dai-luong', 'text-anchor': 'middle' }, gK);
  const hopU = (x, nhan, lop) => {
    el('rect', { x, y: 350, width: 210, height: 140, rx: 14, class: 'o-gia-tri' }, gK);
    el('text', { x: x + 105, y: 390, class: `nhan-dai-luong ${lop}`, 'text-anchor': 'middle' }, gK).textContent = nhan;
    return el('text', { x: x + 105, y: 450, class: 'so-lon', 'text-anchor': 'middle' }, gK);
  };
  r.b.U1 = hopU(40, 'U₁', 'mau-u1');
  r.b.U2 = hopU(790, 'U₂', 'mau-u2');
  el('text', { x: 510, y: 690, class: 'chu-svg dam', 'text-anchor': 'middle' }, gK).textContent = 'Điện áp trên mỗi vòng dây hai phía bằng nhau:';
  el('rect', { x: 120, y: 712, width: 330, height: 110, rx: 14, class: 'o-gia-tri noi-bat' }, gK);
  el('rect', { x: 570, y: 712, width: 330, height: 110, rx: 14, class: 'o-gia-tri noi-bat' }, gK);
  el('text', { x: 510, y: 780, class: 'so-lon', 'text-anchor': 'middle' }, gK).textContent = '=';
  r.b.vv1 = el('text', { x: 285, y: 784, class: 'so-lon', 'text-anchor': 'middle' }, gK);
  r.b.vv2 = el('text', { x: 735, y: 784, class: 'so-lon', 'text-anchor': 'middle' }, gK);
  el('text', { x: 285, y: 742, class: 'chu-svg', 'text-anchor': 'middle' }, gK).textContent = 'U₁/w₁';
  el('text', { x: 735, y: 742, class: 'chu-svg', 'text-anchor': 'middle' }, gK).textContent = 'U₂/w₂';
  el('text', { x: 44, y: 870, class: 'nho-xam' }, gK).textContent = 'Bỏ qua điện áp rơi trên các dây quấn (slide 40). Số vòng dây là giá trị minh họa.';

  const gBT = veThe(gB, 1040, 20, 540, 870, 'Chọn w₂ để có U₂ mong muốn', 'Các cặp điện áp lấy từ các bài tập trong slide.');
  r.b.chip = [];
  [[22, 0.4, 'bài tập 2, 4'], [15, 0.4, 'bài tập 1'], [6, 0.4, 'slide 67']].forEach(([u1, u2, nguon], k) => {
    const g = el('g', { class: 'chip-btn', 'data-u1': u1, 'data-u2': u2 }, gBT);
    el('rect', { x: 1064, y: 110 + k * 62, width: 492, height: 48, rx: 10 }, g);
    el('text', { x: 1082, y: 141 + k * 62 }, g).textContent = `${kV(u1)} → ${kV(u2)}  (${nguon})`;
    r.b.chip.push(g);
  });
  r.b.giai = Array.from({ length: 6 }, (_, k) => el('text', { x: 1064, y: 330 + k * 40, class: k === 5 ? 'chu-kq dam' : 'chu-kq' }, gBT));
  r.b.nutDat = el('g', { class: 'chip-btn', id: 'nut-dat-w2' }, gBT);
  el('rect', { x: 1064, y: 590, width: 300, height: 48, rx: 10 }, r.b.nutDat);
  el('text', { x: 1082, y: 621 }, r.b.nutDat).textContent = '→ Đặt w₂ theo kết quả';
  el('text', { x: 1064, y: 700, class: 'chu-svg' }, gBT).textContent = 'k > 1: MBA hạ áp (U₂ < U₁)';
  el('text', { x: 1064, y: 732, class: 'chu-svg' }, gBT).textContent = 'k < 1: MBA tăng áp (U₂ > U₁)';
  el('text', { x: 1064, y: 764, class: 'chu-svg' }, gBT).textContent = 'Tăng w₂ thì U₂ tăng theo tỉ lệ w₂/w₁.';

  // ======================= C: ĐỊNH MỨC =======================
  const gCM = el('g', {}, svg);
  r.c.g = gCM;
  const gN = veThe(gCM, 20, 20, 1000, 870, 'Nhãn máy (slide 41–42)');
  el('rect', { x: 90, y: 100, width: 840, height: 740, rx: 16, class: 'nhan-may' }, gN);
  for (const [x, y] of [[112, 122], [908, 122], [112, 818], [908, 818]]) el('circle', { cx: x, cy: y, r: 7, class: 'dinh-tan' }, gN);
  el('text', { x: 510, y: 160, class: 'tieu-de-nhan', 'text-anchor': 'middle' }, gN).textContent = 'MÁY BIẾN ÁP';
  r.c.tenMay = el('text', { x: 510, y: 196, class: 'chu-svg', 'text-anchor': 'middle' }, gN);
  r.c.hang = ['Số pha', 'Công suất định mức S', 'Điện áp định mức U₁đm / U₂đm', 'Dòng điện định mức I₁đm', 'Dòng điện định mức I₂đm', 'Tần số f', 'Tổ nối dây', 'Điện áp ngắn mạch Un%', 'Chế độ làm việc, tiêu chuẩn sản xuất'].map((t, k) => {
    const y = 236 + k * 64;
    const nen = el('rect', { x: 110, y: y - 30, width: 800, height: 52, rx: 8, class: 'hang-nhan' }, gN);
    el('text', { x: 130, y: y + 4, class: 'chu-svg' }, gN).textContent = t;
    return { nen, gt: el('text', { x: 890, y: y + 4, class: 'gt-nhan', 'text-anchor': 'end' }, gN) };
  });
  r.c.nguon = el('text', { x: 510, y: 870, class: 'nho-xam', 'text-anchor': 'middle' }, gN);

  const gT = veThe(gCM, 1040, 20, 540, 870, 'Tính dòng điện định mức');
  r.c.dong = Array.from({ length: 7 }, (_, k) => el('text', { x: 1064, y: 110 + k * 44, class: k === 6 ? 'chu-kq dam' : 'chu-kq' }, gT));
  el('text', { x: 1064, y: 460, class: 'chu-svg dam' }, gT).textContent = 'So sánh dòng điện định mức hai phía';
  r.c.cot1 = el('rect', { x: 1064, y: 490, height: 44, rx: 6, fill: '#d62828' }, gT);
  r.c.cot2 = el('rect', { x: 1064, y: 560, height: 44, rx: 6, fill: '#2e9e4f' }, gT);
  r.c.cotChu1 = el('text', { y: 520, class: 'chu-kq' }, gT);
  r.c.cotChu2 = el('text', { y: 590, class: 'chu-kq' }, gT);
  r.c.nhanXet = [0, 1, 2].map((k) => el('text', { x: 1064, y: 670 + k * 32, class: 'chu-svg' }, gT));
  el('text', { x: 1064, y: 860, class: 'nho-xam' }, gT).textContent = 'Máy 3 pha: U là điện áp dây; máy 1 pha: điện áp pha.';
  return r;
}

async function khoiDong() {
  const kq = await napBai('du-lieu/nguyen-ly-mba.json', 'du-lieu/cau-hoi-nguyen-ly-mba.json');
  if (!kq) return;
  const [nd, cauHoi] = kq;
  const svg = $('#so-do');
  const r = veSanKhau(svg, nd);
  const nl = nd.nguyenLy;
  const hk = nd.heSoK;
  const s = {
    kichBan: nd.macDinh.kichBan, dangChay: true, tocDo: 1, t: 0,
    f: nl.f_Hz, w1: nl.w1, w2: nl.w2, Phim: nl.Phim_mWb,
    U1: hk.U1_kV, kw1: hk.w1, kw2: hk.w2, U2muc: 0.4,
    may: 'bt2', tuNhap: { ...nd.mayMau.find((x) => x.id === 'mot-pha') },
    hop: 0, tHop: 0,
  };
  const { datChay, chuThich, soLieuTC } = dieuKhienChung(s, (id) => chonKichBan(id));

  // ---------- Lý thuyết ----------
  const lt = nd.lyThuyet;
  $('#the-ly-thuyet').innerHTML = `
    <p class="muc-nho">${lt.muc}</p>
    <h2>2.5. Nguyên lý làm việc của MBA</h2>
    ${lt.nguyenLy.map((p) => `<p class="dong-ly-thuyet">${p}</p>`).join('')}
    ${lt.congThuc.map((c, k) => `${c.chu ? `<p class="dong-ly-thuyet">${c.chu}</p>` : ''}<div class="cong-thuc" data-ct="${k}"></div>`).join('')}
    <p class="quy-tac">${lt.nhanXet}</p>
    <h2>2.7. Các thông số định mức của MBA</h2>
    <ul class="ghi-chu-ly-thuyet">${lt.dinhMuc.map((d) => `<li>${d}</li>`).join('')}</ul>`;
  const veLyThuyet = () => lt.congThuc.forEach((c, k) => veCongThuc($(`[data-ct="${k}"]`), c.tex, c.duPhong));
  veLyThuyet();
  if (!window.katex) document.querySelector('script[src*="katex"]')?.addEventListener('load', () => { veLyThuyet(); capNhat(); }, { once: true });

  // ======================= A =======================
  function capNhatA() {
    const { L } = r.a;
    r.a.cuon1.innerHTML = '';
    r.a.cuon2.innerHTML = '';
    veCuonDung(r.a.cuon1, L.x0, L.x0 + L.day, 170, 390, soVongVe(s.w1), 'cuon-day so-cap');
    veCuonDung(r.a.cuon2, L.x1 - L.day, L.x1, 170, 390, soVongVe(s.w2), 'cuon-day thu-cap');
    const Phim = s.Phim / 1000;
    const E1 = sddHieuDungMBA(s.f, s.w1, Phim);
    const E2 = sddHieuDungMBA(s.f, s.w2, Phim);
    const k = heSoBienAp(s.w1, s.w2);
    r.a.chuE1.textContent = `E₁ = 4,44·f·w₁·Φm = ${so(E1)} V`;
    r.a.chuE2.textContent = `E₂ = 4,44·f·w₂·Φm = ${so(E2)} V`;
    // đồ thị: e chậm sau Φ góc π/2; e2 vẽ theo cùng thang với e1 để thấy trị số khác nhau
    const { X, Y } = r.a.truc;
    const ds = (fn) => duongGap(Array.from({ length: 241 }, (_, i) => { const a = (i / 240) * 4 * Math.PI; return [X(a), Y(fn(a))]; }));
    r.a.dPhi.setAttribute('d', ds((a) => Math.sin(a)));
    r.a.dE1.setAttribute('d', ds((a) => Math.sin(a - Math.PI / 2)));
    r.a.dE2.setAttribute('d', ds((a) => (E2 / E1) * Math.sin(a - Math.PI / 2)));
    r.a.chuDT.textContent = `Φm = ${dinhDangSo(s.Phim, 1)} mWb · √2E₁ = ${so(Math.SQRT2 * E1)} V · √2E₂ = ${so(Math.SQRT2 * E2)} V · cùng tần số f = ${s.f} Hz`;
    const noi = [
      ['① Đặt u₁ xoay chiều hình sin vào w₁', `f = ${s.f} Hz, ω = 2πf = ${so(2 * Math.PI * s.f)} rad/s`],
      ['② Dòng điện i₁ chạy trong w₁', 'sinh ra từ thông Φ = Φm·sin ωt trong lõi thép'],
      ['③ Φ móc vòng qua cả w₁ và w₂', `Φm = ${dinhDangSo(s.Phim, 1)} mWb`],
      ['④ Cảm ứng e₁ = −w₁·dΦ/dt, e₂ = −w₂·dΦ/dt', 'e₁, e₂ chậm sau Φ góc π/2'],
      [`⑤ E₁ = 4,44·f·w₁·Φm = ${so(E1)} V`, `E₂ = 4,44·f·w₂·Φm = ${so(E2)} V`],
      [`⑥ k = w₁/w₂ = E₁/E₂ = ${so(k)}`, 'cùng tần số, trị số hiệu dụng khác nhau'],
    ];
    r.a.hop.forEach((h, i) => { h.d1.textContent = noi[i][0]; h.d2.textContent = noi[i][1]; });
    $('#sl-e1').textContent = `${so(E1)} V`;
    $('#sl-e2').textContent = `${so(E2)} V`;
    $('#sl-k').textContent = so(k);
    veCongThuc($('#ct-e'),
      `E_1 = 4{,}44\\cdot ${s.f}\\cdot ${s.w1}\\cdot ${soTex(dinhDangSo(Phim, 4))} = \\mathbf{${soTex(so(E1))}\\ \\text{V}}`,
      `E₁ = 4,44·${s.f}·${s.w1}·${dinhDangSo(Phim, 4)} = <b>${so(E1)} V</b>`);
    chuThich(`Φm = ${dinhDangSo(s.Phim, 1)} mWb, f = ${s.f} Hz: <b>E₁ = ${so(E1)} V</b>, <b>E₂ = ${so(E2)} V</b>, k = w₁/w₂ = ${so(k)} – cùng tần số, khác trị số hiệu dụng.`);
    soLieuTC(`E₁ = ${so(E1)} V · E₂ = ${so(E2)} V · k = ${so(k)}`);
  }

  // ======================= B =======================
  function capNhatB() {
    const { LK } = r.b;
    r.b.cuon1.innerHTML = '';
    r.b.cuon2.innerHTML = '';
    veCuonDung(r.b.cuon1, LK.x0, LK.x0 + LK.day, 268, 572, soVongVe(s.kw1), 'cuon-day so-cap');
    veCuonDung(r.b.cuon2, LK.x1 - LK.day, LK.x1, 268, 572, soVongVe(s.kw2), 'cuon-day thu-cap');
    const k = heSoBienAp(s.kw1, s.kw2);
    const U2 = dienApThuCap(s.U1, s.kw1, s.kw2);
    const loai = loaiMBA(s.U1, U2);
    r.b.k.textContent = `k = ${s.kw1}/${s.kw2} = ${so(k)}`;
    r.b.loai.textContent = loai === 'ha-ap' ? 'k > 1: MBA hạ áp' : loai === 'tang-ap' ? 'k < 1: MBA tăng áp' : 'k = 1';
    r.b.w1.textContent = `w₁ = ${s.kw1}`;
    r.b.w2.textContent = `w₂ = ${s.kw2}`;
    r.b.U1.textContent = kV(s.U1);
    r.b.U2.textContent = `${so(U2)} kV`;
    const vv = (s.U1 * 1000) / s.kw1;
    r.b.vv1.textContent = `${so(vv)} V/vòng`;
    r.b.vv2.textContent = `${so((U2 * 1000) / s.kw2)} V/vòng`;
    const w2Can = (s.kw1 * s.U2muc) / s.U1;
    const giai = [
      `Cần: U₁ = ${kV(s.U1)} → U₂ = ${kV(s.U2muc)}, w₁ = ${s.kw1}`,
      'Từ U₁/w₁ = U₂/w₂:',
      `w₂ = w₁·U₂/U₁ = ${s.kw1}·${dinhDangSo(s.U2muc, 1)}/${dinhDangSo(s.U1, 1)}`,
      `w₂ = ${so(w2Can)} vòng`,
      `k = U₁/U₂ = ${so(s.U1 / s.U2muc)}`,
      Math.abs(w2Can - s.kw2) < 0.5 ? '✓ w₂ hiện tại đúng bằng kết quả' : `Hiện tại w₂ = ${s.kw2} → U₂ = ${so(U2)} kV`,
    ];
    r.b.giai.forEach((o, i) => { o.textContent = giai[i]; });
    r.b.chip.forEach((g) => g.classList.toggle('chon', Number(g.dataset.u1) === s.U1 && Number(g.dataset.u2) === s.U2muc));
    $('#sl-u1').textContent = kV(s.U1);
    $('#sl-u2').textContent = `${so(U2)} kV`;
    $('#sl-kk').textContent = so(k);
    veCongThuc($('#ct-k'),
      `k = \\dfrac{w_1}{w_2} = \\dfrac{${s.kw1}}{${s.kw2}} = ${soTex(so(k))} \\approx \\dfrac{U_1}{U_2}`,
      `k = w₁/w₂ = ${s.kw1}/${s.kw2} = ${so(k)} ≈ U₁/U₂`);
    chuThich(`k = w₁/w₂ = ${so(k)}: U₂ ≈ U₁/k = ${kV(s.U1)}/${so(k)} = <b>${so(U2)} kV</b>; điện áp trên mỗi vòng dây hai phía bằng nhau: <b>${so(vv)} V/vòng</b>.`);
    soLieuTC(`k = ${so(k)} · U₁ = ${kV(s.U1)} → U₂ = ${so(U2)} kV · ${so(vv)} V/vòng`);
    const o1 = $('#k-w1');
    if (o1) { o1.value = s.kw1; $('#k-w2').value = s.kw2; $('#k-w1-gt').textContent = s.kw1; $('#k-w2-gt').textContent = s.kw2; }
  }
  svg.addEventListener('click', (e) => {
    if (s.kichBan !== 'he-so-k') return;
    const chip = e.target.closest('.chip-btn[data-u1]');
    if (chip) { s.U1 = Number(chip.dataset.u1); s.U2muc = Number(chip.dataset.u2); veDieuKhien(); capNhatB(); return; }
    if (e.target.closest('#nut-dat-w2')) {
      s.kw2 = Math.max(1, Math.round((s.kw1 * s.U2muc) / s.U1));
      capNhatB();
    }
  });

  // ======================= C =======================
  function mayHienTai() {
    return s.may === 'mot-pha' ? s.tuNhap : nd.mayMau.find((x) => x.id === s.may);
  }
  function capNhatC() {
    const mm = mayHienTai();
    const S = mm.S_kVA * 1000;
    const I1 = dongDinhMuc(S, mm.U1_kV * 1000, mm.soPha);
    const I2 = dongDinhMuc(S, mm.U2_kV * 1000, mm.soPha);
    r.c.tenMay.textContent = mm.ten;
    const chuaGhi = '— (slide không ghi)';
    const gt = [
      mm.soPha === 3 ? '3 pha' : '1 pha',
      `${dinhDangSo(mm.S_kVA, 0)} kVA`,
      `${kV(mm.U1_kV)} / ${kV(mm.U2_kV)}`,
      `${so(I1, 4)} A`,
      `${so(I2, 4)} A`,
      mm.f_Hz ? `${mm.f_Hz} Hz` : chuaGhi,
      mm.toNoiDay || chuaGhi,
      mm.Un ? `${dinhDangSo(mm.Un, mm.Un % 1 ? 1 : 0)} %` : chuaGhi,
      chuaGhi,
    ];
    r.c.hang.forEach((h, i) => {
      h.gt.textContent = gt[i];
      h.nen.setAttribute('class', `hang-nhan ${i === 3 || i === 4 ? 'tinh' : ''}`);
      h.gt.setAttribute('class', `gt-nhan ${gt[i] === chuaGhi ? 'mo' : ''}`);
    });
    r.c.nguon.textContent = `Nguồn số liệu: ${mm.nguon}`;
    const can = mm.soPha === 3 ? '√3·' : '';
    const dong = [
      mm.soPha === 3 ? 'MBA 3 pha: S = √3·U₁đm·I₁đm = √3·U₂đm·I₂đm' : 'MBA 1 pha: S = U₁đm·I₁đm = U₂đm·I₂đm',
      `I₁đm = S/(${can}U₁đm)`,
      `     = ${dinhDangSo(S, 0)}/(${can}${dinhDangSo(mm.U1_kV * 1000, 0)}) = ${so(I1, 4)} A`,
      `I₂đm = S/(${can}U₂đm)`,
      `     = ${dinhDangSo(S, 0)}/(${can}${dinhDangSo(mm.U2_kV * 1000, 0)}) = ${so(I2, 4)} A`,
      `I₂đm/I₁đm = U₁đm/U₂đm = ${so(I2 / I1)}`,
      `⇒ I₁đm = ${so(I1, 4)} A, I₂đm = ${so(I2, 4)} A`,
    ];
    r.c.dong.forEach((o, i) => { o.textContent = dong[i]; });
    const max = Math.max(I1, I2);
    const W = 300;
    r.c.cot1.setAttribute('width', Math.max(2, (I1 / max) * W));
    r.c.cot2.setAttribute('width', Math.max(2, (I2 / max) * W));
    r.c.cotChu1.setAttribute('x', 1064 + Math.max(2, (I1 / max) * W) + 10);
    r.c.cotChu2.setAttribute('x', 1064 + Math.max(2, (I2 / max) * W) + 10);
    r.c.cotChu1.textContent = `I₁đm ${so(I1, 4)} A`;
    r.c.cotChu2.textContent = `I₂đm ${so(I2, 4)} A`;
    const phiaLon = I2 > I1 ? 'hạ áp' : 'cao áp';
    r.c.nhanXet[0].textContent = `Phía ${phiaLon} có dòng điện định mức lớn hơn.`;
    r.c.nhanXet[1].textContent = 'Liên hệ slide 29: dây quấn tiết diện lớn (dây bẹt)';
    r.c.nhanXet[2].textContent = 'thường làm dây quấn HA.';
    $('#sl-s').textContent = `${dinhDangSo(mm.S_kVA, 0)} kVA`;
    $('#sl-i1').textContent = `${so(I1, 4)} A`;
    $('#sl-i2').textContent = `${so(I2, 4)} A`;
    veCongThuc($('#ct-i'),
      `I_{2đm} = \\dfrac{S}{${mm.soPha === 3 ? '\\sqrt{3}' : ''}U_{2đm}} = \\dfrac{${soTex(dinhDangSo(S, 0))}}{${mm.soPha === 3 ? '\\sqrt{3}\\cdot' : ''}${soTex(dinhDangSo(mm.U2_kV * 1000, 0))}} = \\mathbf{${soTex(so(I2, 4))}\\ \\text{A}}`,
      `I₂đm = S/(${can}U₂đm) = <b>${so(I2, 4)} A</b>`);
    chuThich(`${mm.ten} (${mm.nguon}): <b>I₁đm = ${so(I1, 4)} A</b>, <b>I₂đm = ${so(I2, 4)} A</b>.`);
    soLieuTC(`${mm.ten}: I₁đm = ${so(I1, 4)} A · I₂đm = ${so(I2, 4)} A`);
  }

  // ---------- Kịch bản & điều khiển ----------
  function capNhat() {
    if (s.kichBan === 'nguyen-ly') capNhatA();
    if (s.kichBan === 'he-so-k') capNhatB();
    if (s.kichBan === 'dinh-muc') capNhatC();
  }
  function chonKichBan(id) {
    s.kichBan = id;
    hienKichBan(id, { 'nguyen-ly': r.a.g, 'he-so-k': r.b.g, 'dinh-muc': r.c.g });
    veDieuKhien();
    capNhat();
  }
  const thanhTruot = (id, nhan, min, max, buoc, gt, donVi = '') => `<label class="dieu-khien doc"><span>${nhan}</span> <input type="range" id="${id}" min="${min}" max="${max}" step="${buoc}" value="${gt}"><output id="${id}-gt">${gt}${donVi}</output></label>`;
  function veDieuKhien() {
    const dk = $('#dieu-khien-kich-ban');
    if (s.kichBan === 'nguyen-ly') {
      dk.innerHTML = `<p class="mo-ta">Thay đổi f, số vòng dây, Φm để xem E₁, E₂ thay đổi (số liệu minh họa).</p>
        ${thanhTruot('nl-f', 'Tần số f', nl.fMin_Hz, nl.fMax_Hz, 5, s.f, ' Hz')}
        ${thanhTruot('nl-w1', 'Số vòng w₁', nl.wMin, nl.wMax, 10, s.w1)}
        ${thanhTruot('nl-w2', 'Số vòng w₂', nl.wMin, nl.wMax, 10, s.w2)}
        ${thanhTruot('nl-phi', 'Φm (mWb)', nl.PhimMin_mWb, nl.PhimMax_mWb, 0.5, s.Phim)}`;
      for (const [id, k, dv] of [['nl-f', 'f', ' Hz'], ['nl-w1', 'w1', ''], ['nl-w2', 'w2', ''], ['nl-phi', 'Phim', '']]) {
        $(`#${id}`).addEventListener('input', (e) => { s[k] = Number(e.target.value); $(`#${id}-gt`).textContent = `${dinhDangSo(s[k], k === 'Phim' ? 1 : 0)}${dv}`; capNhatA(); });
      }
    } else if (s.kichBan === 'he-so-k') {
      dk.innerHTML = `<p class="mo-ta">Chọn U₁ và số vòng hai phía; U₂ ≈ U₁·w₂/w₁. Bấm các cặp điện áp trên sân khấu để giải bài toán ngược.</p>
        <label class="dieu-khien doc"><span>U₁</span> <select id="k-u1">${hk.dsU1_kV.map((u) => `<option value="${u}" ${u === s.U1 ? 'selected' : ''}>${kV(u)}</option>`).join('')}</select><span></span></label>
        ${thanhTruot('k-w1', 'Số vòng w₁', hk.wMin, hk.wMax, 5, s.kw1)}
        ${thanhTruot('k-w2', 'Số vòng w₂', hk.wMin, hk.wMax, 1, s.kw2)}`;
      $('#k-u1').addEventListener('change', (e) => { s.U1 = Number(e.target.value); capNhatB(); });
      $('#k-w1').addEventListener('input', (e) => { s.kw1 = Number(e.target.value); capNhatB(); });
      $('#k-w2').addEventListener('input', (e) => { s.kw2 = Number(e.target.value); capNhatB(); });
    } else {
      const tn = s.tuNhap;
      dk.innerHTML = `<p class="mo-ta">Chọn máy mẫu (lấy từ slide) hoặc tự nhập MBA 1 pha.</p>
        <label class="dieu-khien doc"><span>Máy</span> <select id="dm-may">${nd.mayMau.map((x) => `<option value="${x.id}" ${x.id === s.may ? 'selected' : ''}>${x.ten}</option>`).join('')}</select><span></span></label>
        <div id="dm-tu-nhap" ${s.may === 'mot-pha' ? '' : 'hidden'}>
          ${thanhTruot('dm-s', 'S (kVA)', 1, 100, 1, tn.S_kVA)}
          ${thanhTruot('dm-u1', 'U₁đm (V)', 100, 1000, 10, tn.U1_kV * 1000)}
          ${thanhTruot('dm-u2', 'U₂đm (V)', 10, 1000, 2, tn.U2_kV * 1000)}
        </div>`;
      $('#dm-may').addEventListener('change', (e) => { s.may = e.target.value; $('#dm-tu-nhap').hidden = s.may !== 'mot-pha'; capNhatC(); });
      for (const [id, k, he] of [['dm-s', 'S_kVA', 1], ['dm-u1', 'U1_kV', 1000], ['dm-u2', 'U2_kV', 1000]]) {
        $(`#${id}`).addEventListener('input', (e) => { tn[k] = Number(e.target.value) / he; $(`#${id}-gt`).textContent = e.target.value; capNhatC(); });
      }
    }
  }

  trinhChieuVaCauHoi(nd, cauHoi, (id, b) => {
    const tt = b?.trangThai;
    if (!tt) return;
    if (tt.may) s.may = tt.may;
    chonKichBan(tt.kichBan);
  }, datChay, s);

  // ---------- Vòng lặp ----------
  const dai1 = r.a.duongSC.getTotalLength();
  const dai2 = r.a.duongTC.getTotalLength();
  let vt = 0;
  vongLap(s, (dt) => {
    s.t += dt;
    if (s.kichBan !== 'nguyen-ly') return;
    // thời gian hiển thị chậm: một chu kỳ ứng với 2,5 s
    const goc = (s.t * 2 * Math.PI) / 2.5;
    const Phi = Math.sin(goc);
    const i = Math.sin(goc - 0.15);
    vt += dt * 0.12 * i;
    r.a.hat1.forEach((h, k) => {
      const q = r.a.duongSC.getPointAtLength((((k / r.a.hat1.length + vt) % 1) + 1) % 1 * dai1);
      h.setAttribute('cx', q.x.toFixed(1)); h.setAttribute('cy', q.y.toFixed(1));
    });
    r.a.hat2.forEach((h, k) => {
      const q = r.a.duongTC.getPointAtLength((((k / r.a.hat2.length - vt) % 1) + 1) % 1 * dai2);
      h.setAttribute('cx', q.x.toFixed(1)); h.setAttribute('cy', q.y.toFixed(1));
    });
    const giua = (r.a.L.x0 + r.a.L.x1) / 2;
    r.a.muiPhi.setAttribute('x1', (giua - 70 * Phi).toFixed(1));
    r.a.muiPhi.setAttribute('x2', (giua + 70 * Phi).toFixed(1));
    r.a.muiPhi.style.opacity = Math.abs(Phi) < 0.08 ? 0 : 1;
    r.a.phi.style.opacity = (0.25 + 0.75 * Math.abs(Phi)).toFixed(2);
    r.a.phi.style.strokeDashoffset = (-(s.t * 50) % 34).toFixed(1);
    const a = ((goc % (4 * Math.PI)) + 4 * Math.PI) % (4 * Math.PI);
    r.a.con.setAttribute('x1', r.a.truc.X(a).toFixed(1));
    r.a.con.setAttribute('x2', r.a.truc.X(a).toFixed(1));
    s.tHop += dt;
    if (s.tHop > 1.8) { s.tHop = 0; s.hop = (s.hop + 1) % r.a.hop.length; }
    r.a.hop.forEach((h, k) => h.nen.setAttribute('class', `o-gia-tri ${k === s.hop ? 'noi-bat' : ''}`));
  });

  chonKichBan(s.kichBan);
  document.body.classList.add('da-san-sang');
}

chayTrang(khoiDong);
