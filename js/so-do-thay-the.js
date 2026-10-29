/**
 * so-do-thay-the.js — Trang 3.3 "Sơ đồ thay thế và đồ thị véc tơ của MBA" (slide 50–53).
 *
 * Kịch bản a (so-do): hình a → hình b (hình T) → sơ đồ đơn giản; so sánh kết quả hai sơ đồ.
 * Kịch bản b (vecto): đồ thị véc tơ cho tải điện cảm và tải điện dung (Φ̇ nằm ngang như slide 52).
 * Kịch bản c (sai-so): sai khác giữa sơ đồ hình T và sơ đồ đơn giản theo hệ số tải.
 * Số liệu: một pha MBA bài tập 4 (slide 82–84), quy đổi về sơ cấp.
 */
import { el } from './so-do.js';
import { $, napBai, dieuKhienChung, trinhChieuVaCauHoi, vongLap, chayTrang, hienKichBan } from './khung-trang.js';
import { taoMarker, veThe, veTruc, duongGap, veVecto, veBang, veDienTro, veCuonCam, veCungGoc } from './hinh-mba.js';
import { giaiHinhT, giaiDonGian, tongTroTai } from './mach-mba.js';
import { phuc, cong, nhan, nhanSo, doLon, goc, doiDau, cucSang } from './so-phuc.js';
import { dinhDangSo } from './tinh-toan.js';
import { soCoNghia, veCongThuc } from './tien-ich.js';

const so = (x, k = 3) => soCoNghia(x, k);
const V = (x) => (x >= 1000 ? `${so(x / 1000, 4)} kV` : `${so(x)} V`);
const doDo = (rad) => `${dinhDangSo((rad * 180) / Math.PI, 1)}°`;
const T = 150;
const B = 380;

/** Phần chung của ba sơ đồ: cực U1, mũi tên U1, I1. */
function dauVao(g, ox) {
  for (const y of [T, B]) el('circle', { cx: ox + 20, cy: y, r: 5, class: 'diem-cuc' }, g);
  el('line', { x1: ox + 20, x2: ox + 20, y1: T + 14, y2: B - 14, class: 'vec', stroke: '#d62828', 'stroke-width': 2.5, 'marker-end': 'url(#mui-den)' }, g);
  el('text', { x: ox + 30, y: (T + B) / 2 + 6, class: 'nhan-lk' }, g).textContent = 'U₁';
  el('text', { x: ox + 34, y: T - 12, class: 'nhan-lk' }, g).textContent = 'I₁';
}

/** Tải R, X nối giữa hai dây tại x. */
function veTaiRX(g, x, nhanR, nhanX) {
  el('path', { d: `M${x} ${T} V${T + 40} M${x} ${T + 86} V${T + 100} M${x} ${T + 146} V${B}`, class: 'day-mach' }, g);
  veDienTro(g, x, T + 40, 46, true, nhanR);
  veCuonCam(g, x, T + 100, 46, true, nhanX);
}

function veSanKhau(svg) {
  svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  taoMarker(defs, 'mui-den', '#13202b');
  el('rect', { x: -2000, y: -1200, width: 5600, height: 3300, class: 'nen-san-khau' }, svg);
  const r = { a: {}, b: {}, c: {} };

  // ======================= A: SƠ ĐỒ =======================
  const gA = el('g', {}, svg);
  r.a.g = gA;
  const g1 = veThe(gA, 20, 20, 1560, 470, 'Sơ đồ thay thế của MBA (slide 50–51)');
  // hình a
  let ox = 40;
  dauVao(g1, ox);
  el('path', { d: `M${ox + 20} ${T} H${ox + 60} M${ox + 106} ${T} H${ox + 120} M${ox + 166} ${T} H${ox + 200} V${T + 89} M${ox + 200} ${T + 141} V${B} H${ox + 20}`, class: 'day-mach' }, g1);
  el('path', { d: `M${ox + 250} ${T + 89} V${T} H${ox + 270} M${ox + 316} ${T} H${ox + 330} M${ox + 376} ${T} H${ox + 440} M${ox + 440} ${B} H${ox + 250} V${T + 141}`, class: 'day-mach' }, g1);
  veDienTro(g1, ox + 60, T, 46, false, 'R₁');
  veCuonCam(g1, ox + 120, T, 46, false, 'X₁');
  veCuonCam(g1, ox + 270, T, 46, false, 'k²X₂');
  veDienTro(g1, ox + 330, T, 46, false, 'k²R₂');
  for (const [x, nhan] of [[ox + 200, 'E₁'], [ox + 250, 'kE₂']]) {
    el('circle', { cx: x, cy: T + 115, r: 26, class: 'nguon-phu' }, g1);
    el('line', { x1: x, x2: x, y1: T + 100, y2: T + 128, class: 'vec', stroke: '#13202b', 'stroke-width': 2.5, 'marker-end': 'url(#mui-den)' }, g1);
    el('text', { x: x + (nhan === 'E₁' ? -34 : 32), y: T + 121, class: 'nhan-lk', 'text-anchor': nhan === 'E₁' ? 'end' : 'start' }, g1).textContent = nhan;
  }
  veTaiRX(g1, ox + 440, 'k²Rpt', 'k²Xpt');
  for (const [x, y, t] of [[ox + 200, T - 12, 'M'], [ox + 250, T - 12, 'M′'], [ox + 200, B + 24, 'N'], [ox + 250, B + 24, 'N′']]) el('text', { x, y, class: 'nhan-lk', 'text-anchor': 'middle' }, g1).textContent = t;
  el('text', { x: ox + 396, y: T - 12, class: 'nhan-lk' }, g1).textContent = 'I₂/k';
  el('text', { x: ox + 20, y: 440, class: 'chu-svg dam' }, g1).textContent = 'a) Hai dây quấn còn tách rời (M, M′)';
  // hình b
  ox = 560;
  dauVao(g1, ox);
  el('path', { d: `M${ox + 20} ${T} H${ox + 60} M${ox + 106} ${T} H${ox + 120} M${ox + 166} ${T} H${ox + 240} M${ox + 286} ${T} H${ox + 300} M${ox + 346} ${T} H${ox + 440} M${ox + 440} ${B} H${ox + 20} M${ox + 200} ${T} V${T + 30} M${ox + 200} ${T + 76} V${T + 90} M${ox + 200} ${T + 136} V${B}`, class: 'day-mach' }, g1);
  veDienTro(g1, ox + 60, T, 46, false, 'R₁');
  veCuonCam(g1, ox + 120, T, 46, false, 'X₁');
  veCuonCam(g1, ox + 240, T, 46, false, 'X′₂');
  veDienTro(g1, ox + 300, T, 46, false, 'R′₂');
  veDienTro(g1, ox + 200, T + 30, 46, true, 'Rth');
  veCuonCam(g1, ox + 200, T + 90, 46, true, 'Xth');
  veTaiRX(g1, ox + 440, 'R′pt', 'X′pt');
  for (const [x, y] of [[ox + 200, T], [ox + 200, B]]) el('circle', { cx: x, cy: y, r: 5, class: 'diem-noi' }, g1);
  el('text', { x: ox + 200, y: T - 12, class: 'nhan-lk', 'text-anchor': 'middle' }, g1).textContent = 'M';
  el('text', { x: ox + 200, y: B + 24, class: 'nhan-lk', 'text-anchor': 'middle' }, g1).textContent = 'N';
  el('text', { x: ox + 176, y: T + 200, class: 'nhan-lk', 'text-anchor': 'end' }, g1).textContent = 'I₀';
  el('text', { x: ox + 380, y: T - 12, class: 'nhan-lk' }, g1).textContent = 'I′₂';
  el('text', { x: ox + 20, y: 440, class: 'chu-svg dam' }, g1).textContent = 'b) Sơ đồ thay thế hình T';
  r.a.ghiB = el('text', { x: ox + 20, y: 468, class: 'nho-xam' }, g1);
  // sơ đồ đơn giản
  ox = 1080;
  dauVao(g1, ox);
  el('path', { d: `M${ox + 20} ${T} H${ox + 100} M${ox + 146} ${T} H${ox + 180} M${ox + 226} ${T} H${ox + 440} M${ox + 440} ${B} H${ox + 20}`, class: 'day-mach' }, g1);
  veCuonCam(g1, ox + 100, T, 46, false, 'Xn');
  veDienTro(g1, ox + 180, T, 46, false, 'Rn');
  veTaiRX(g1, ox + 440, 'R′pt', 'X′pt');
  el('text', { x: ox + 270, y: T - 12, class: 'nhan-lk' }, g1).textContent = 'I₁ = I′₂';
  el('text', { x: ox + 20, y: 440, class: 'chu-svg dam' }, g1).textContent = 'Sơ đồ đơn giản (bỏ nhánh từ hóa)';
  r.a.ghiC = el('text', { x: ox + 20, y: 468, class: 'nho-xam' }, g1);
  for (const x of [512, 1032]) el('line', { x1: x, x2: x + 36, y1: 345, y2: 345, class: 'mui-tach', 'marker-end': 'url(#mui-den)' }, g1);
  // hạt dòng điện
  r.a.duongB = el('path', { d: 'M580 150 H1000 V380 H580', class: 'an' }, svg);
  r.a.duongNhanh = el('path', { d: 'M760 150 V380', class: 'an' }, svg);
  r.a.duongC = el('path', { d: 'M1100 150 H1520 V380 H1100', class: 'an' }, svg);
  r.a.hatB = Array.from({ length: 24 }, () => el('circle', { r: 4.5, class: 'hat-dong' }, g1));
  r.a.hatNhanh = Array.from({ length: 3 }, () => el('circle', { r: 4.5, class: 'hat-dong' }, g1));
  r.a.hatC = Array.from({ length: 24 }, () => el('circle', { r: 4.5, class: 'hat-dong' }, g1));

  const g2 = veThe(gA, 20, 510, 1000, 380, 'So sánh kết quả hai sơ đồ');
  r.a.bang = veBang(g2, 40, 560, [{ w: 300 }, { w: 200, canh: 'end' }, { w: 200, canh: 'end' }, { w: 240, canh: 'end' }], 46, ['Đại lượng', 'Hình T', 'Đơn giản', 'Sai khác'], 6);
  const g3 = veThe(gA, 1040, 510, 540, 380, 'Nhận xét');
  r.a.nx = Array.from({ length: 7 }, (_, k) => el('text', { x: 1064, y: 590 + k * 38, class: 'chu-svg' }, g3));

  // ======================= B: ĐỒ THỊ VÉC TƠ =======================
  const gB = el('g', {}, svg);
  r.b.g = gB;
  r.b.dt = [['cam', 20, 'Tải điện cảm (RL)'], ['dung', 810, 'Tải điện dung (RC)']].map(([loai, x0, ten]) => {
    const g = veThe(gB, x0, 20, 770, 870, ten);
    const O = [x0 + 385, 430];
    el('circle', { cx: O[0], cy: O[1], r: 4, fill: '#13202b' }, g);
    const vt = {};
    for (const [k, mau, tc] of [['Phi', '#13202b', {}], ['E1', '#2a78d6', {}], ['mE1', '#2a78d6', { net: '8 5' }], ['I0', '#7b2cbf', { day: 2.5 }], ['I2', '#2e9e4f', { day: 2.5 }], ['mI2', '#2e9e4f', { day: 2.5, net: '6 4' }], ['I1', '#eb6834', { day: 3 }],
      ['r2', '#8d6e63', { day: 2.5 }], ['x2', '#8d6e63', { day: 2.5 }], ['U2', '#2e9e4f', { day: 4 }], ['r1', '#8d6e63', { day: 2.5 }], ['x1', '#8d6e63', { day: 2.5 }], ['U1', '#d62828', { day: 4 }]]) {
      vt[k] = veVecto(g, mau, tc);
    }
    const cung = { phi1: veCungGoc(g, '#d62828'), psi2: veCungGoc(g, '#2e9e4f'), alpha: veCungGoc(g, '#7b2cbf') };
    const chu = [0, 1, 2].map((k) => el('text', { x: x0 + 24, y: 812 + k * 28, class: k === 0 ? 'chu-kq dam' : 'chu-svg' }, g));
    return { loai, O, vt, cung, chu };
  });

  // ======================= C: SAI SỐ =======================
  const gC = el('g', {}, svg);
  r.c.g = gC;
  const c1 = veThe(gC, 20, 20, 1000, 870, 'Hình T và sơ đồ đơn giản theo hệ số tải β');
  el('text', { x: 44, y: 100, class: 'chu-svg dam' }, c1).textContent = 'U′₂/U₁ (%)';
  r.c.t1 = veTruc(c1, { x0: 110, x1: 980, y0: 120, y1: 440, xMin: 0, xMax: 1.2, yMin: 90, yMax: 104 }, {
    nhanX: [[0, '0'], [0.2, '0,2'], [0.4, '0,4'], [0.6, '0,6'], [0.8, '0,8'], [1, '1,0'], [1.2, '1,2']],
    nhanY: [[90, '90'], [94, '94'], [98, '98'], [100, '100'], [104, '104']],
  });
  r.c.dT = el('path', { class: 'duong-dt', stroke: '#2a78d6' }, c1);
  r.c.dDG = el('path', { class: 'duong-dt', stroke: '#eb6834', 'stroke-dasharray': '9 6' }, c1);
  el('text', { x: 44, y: 520, class: 'chu-svg dam' }, c1).textContent = 'Sai khác của U′₂ giữa hai sơ đồ (%)';
  r.c.t2 = veTruc(c1, { x0: 110, x1: 980, y0: 540, y1: 820, xMin: 0, xMax: 1.2, yMin: 0, yMax: 0.1 }, {
    nhanX: [[0, '0'], [0.2, '0,2'], [0.4, '0,4'], [0.6, '0,6'], [0.8, '0,8'], [1, '1,0'], [1.2, '1,2']],
    nhanY: [[0, '0'], [0.05, '0,05'], [0.1, '0,10']],
  });
  r.c.dSS = el('path', { class: 'duong-dt', stroke: '#c62828' }, c1);
  r.c.con1 = el('line', { y1: 120, y2: 440, class: 'duong-cham' }, c1);
  r.c.con2 = el('line', { y1: 540, y2: 820, class: 'duong-cham' }, c1);
  [['Hình T', '#2a78d6', ''], ['Đơn giản', '#eb6834', '9 6']].forEach(([t, mau, net], k) => {
    el('line', { x1: 640 + k * 170, x2: 676 + k * 170, y1: 94, y2: 94, stroke: mau, 'stroke-width': 3, 'stroke-dasharray': net }, c1);
    el('text', { x: 684 + k * 170, y: 100, class: 'chu-truc-dt' }, c1).textContent = t;
  });
  el('text', { x: 980, y: 866, class: 'nho-xam', 'text-anchor': 'end' }, c1).textContent = 'β';
  const c2 = veThe(gC, 1040, 20, 540, 870, 'Tại hệ số tải đã chọn');
  r.c.dong = Array.from({ length: 12 }, (_, k) => el('text', { x: 1064, y: 100 + k * 40, class: 'chu-svg' }, c2));
  return r;
}

async function khoiDong() {
  const kq = await napBai('du-lieu/so-do-thay-the.json', 'du-lieu/cau-hoi-so-do-thay-the.json');
  if (!kq) return;
  const [nd, cauHoi] = kq;
  const svg = $('#so-do');
  const r = veSanKhau(svg);
  const P = nd.mach;
  const md = nd.macDinh;
  const s = { kichBan: md.kichBan, dangChay: true, tocDo: 1, t: 0, beta: md.beta, cosPhi2: md.cosPhi2, tinhChat: 'cam', mU: md.phongToU, mI0: md.phongToI0 };
  const { datChay, chuThich, soLieuTC } = dieuKhienChung(s, (id) => chonKichBan(id));

  const lt = nd.lyThuyet;
  $('#the-ly-thuyet').innerHTML = `
    <p class="muc-nho">${lt.muc}</p>
    <h2>3.3. Sơ đồ thay thế và đồ thị véc tơ của MBA</h2>
    <p class="dong-ly-thuyet"><b>a. Sơ đồ thay thế.</b> ${lt.soDo}</p>
    ${lt.congThuc.map((c, k) => `${c.chu ? `<p class="dong-ly-thuyet">${c.chu}</p>` : ''}<div class="cong-thuc" data-ct="${k}"></div>`).join('')}
    <p class="dong-ly-thuyet">${lt.rthXth}</p>
    <p class="quy-tac">${lt.donGian}</p>
    <p class="dong-ly-thuyet"><b>b. Đồ thị véc tơ.</b> ${lt.vecto}</p>
    <p class="ghi-chu-nho">Số liệu mô phỏng: ${P.nguon}.</p>`;
  const veLyThuyet = () => lt.congThuc.forEach((c, k) => veCongThuc($(`[data-ct="${k}"]`), c.tex, c.duPhong));
  veLyThuyet();
  if (!window.katex) document.querySelector('script[src*="katex"]')?.addEventListener('load', veLyThuyet, { once: true });

  const phi2 = (tc = s.tinhChat) => (tc === 'cam' ? 1 : -1) * Math.acos(s.cosPhi2);
  const Zt = (beta = s.beta, tc = s.tinhChat) => tongTroTai(P.U1, P.I1dm, Math.max(beta, 1e-6), phi2(tc));

  // ======================= A =======================
  function capNhatA() {
    const t = giaiHinhT(P, Zt());
    const d = giaiDonGian(P, Zt());
    r.a.ghiB.textContent = `R₁ = R′₂ = ${so(P.r1)} Ω; X₁ = X′₂ = ${so(P.x1)} Ω; Rth ≈ ${dinhDangSo(P.Rth, 0)} Ω; Xth ≈ ${dinhDangSo(P.Xth, 0)} Ω`;
    r.a.ghiC.textContent = `Rn = R₁ + R′₂ = ${so(P.r1 + P.r2)} Ω; Xn = X₁ + X′₂ = ${so(P.x1 + P.x2)} Ω`;
    const ss = (a, b) => `${dinhDangSo(((b - a) / a) * 100, 2)} %`;
    const I1 = doLon(t.I1);
    const I2 = doLon(t.I2t);
    const U2 = doLon(t.U2q);
    const Id = doLon(d.I);
    const U2d = doLon(d.U2q);
    const ds = [
      ['Dòng điện sơ cấp I₁', `${so(I1)} A`, `${so(Id)} A`, ss(I1, Id)],
      ['Dòng điện từ hóa I₀', `${so(doLon(t.I0))} A`, '0 (bỏ qua)', '—'],
      ['Dòng điện thứ cấp I′₂', `${so(I2)} A`, `${so(Id)} A`, ss(I2, Id)],
      ['Điện áp thứ cấp U′₂', V(U2), V(U2d), ss(U2, U2d)],
      ['cosφ₁', so(Math.cos(goc(t.I1))), so(Math.cos(goc(d.I))), ''],
      ['I₀/I₁đm', `${dinhDangSo((doLon(t.I0) / P.I1dm) * 100, 2)} %`, '', ''],
    ];
    r.a.bang.o.forEach((h, i) => h.forEach((o, j) => { o.textContent = ds[i][j]; }));
    const nx = [
      '|Zth| rất lớn so với |Z₁|, |Z′₂|:',
      `|Zth| ≈ ${dinhDangSo(Math.hypot(P.Rth, P.Xth), 0)} Ω; |Zn| ≈ ${so(Math.hypot(P.r1 + P.r2, P.x1 + P.x2))} Ω`,
      `⇒ I₀ chỉ ${dinhDangSo((doLon(t.I0) / P.I1dm) * 100, 2)} % I₁đm.`,
      'Bỏ nhánh từ hóa: U′₂ sai khác',
      `chỉ ${ss(U2, U2d)} ở β = ${dinhDangSo(s.beta, 2)}.`,
      'UMN = −E₁ = İ₀(Rth + jXth)',
      `= ${V(doLon(t.UM))}`,
    ];
    r.a.nx.forEach((o, i) => { o.textContent = nx[i]; o.setAttribute('class', i === 2 || i === 4 ? 'chu-kq dam' : 'chu-svg'); });
    $('#sl-i1').textContent = `${so(I1)} A`;
    $('#sl-u2').textContent = V(U2);
    $('#sl-ss').textContent = ss(U2, U2d);
    chuThich(`β = ${dinhDangSo(s.beta, 2)}, cosφ₂ = ${dinhDangSo(s.cosPhi2, 2)}: sơ đồ hình T cho U′₂ = <b>${V(U2)}</b>, sơ đồ đơn giản cho <b>${V(U2d)}</b> – sai khác ${ss(U2, U2d)} vì I₀ rất nhỏ.`);
    soLieuTC(`Hình T: U′₂ = ${V(U2)} · đơn giản: ${V(U2d)} · sai khác ${ss(U2, U2d)}`);
    s.dongB = I1;
    s.dongC = Id;
  }

  // ======================= B =======================
  function veVectoMot(o) {
    const kqT = giaiHinhT(P, Zt(s.beta, o.loai));
    const E1 = kqT.E1;
    const quay = cucSang(1, -(goc(E1) + Math.PI / 2)); // Φ̇ vượt trước Ė1 góc 90°, đưa Φ̇ về trục ngang
    const q = (z) => nhan(z, quay);
    const tlU = 250 / doLon(E1);
    const tlI = 190 / P.I1dm;
    const pU = (z) => [o.O[0] + q(z)[0] * tlU, o.O[1] - q(z)[1] * tlU];
    const pI = (z) => [o.O[0] + q(z)[0] * tlI, o.O[1] - q(z)[1] * tlI];
    const O = o.O;
    const I2 = kqT.I2q; // İ′2 theo quy ước slide
    const I0m = nhanSo(kqT.I0, s.mI0);
    const I1ve = cong(I0m, doiDau(I2));
    const mU = s.mU;
    o.vt.Phi.dat(O, [O[0] + 150, O[1]], 'Φ̇', [70, -10]);
    o.vt.E1.dat(O, pU(E1), 'Ė₁ = Ė′₂', [16, 120]);
    o.vt.mE1.dat(O, pU(doiDau(E1)), '−Ė₁', [22, -40]);
    o.vt.I0.dat(O, pI(I0m), `İ₀ (×${s.mI0})`, [10, -14]);
    o.vt.I2.dat(O, pI(I2), 'İ′₂', [-26, 0]);
    o.vt.mI2.dat(pI(I0m), pI(I1ve), '−İ′₂', [16, 6]);
    o.vt.I1.dat(O, pI(I1ve), 'İ₁', [-22, -8]);
    // U̇′2 = Ė′2 − r′2İ′2 − jx′2İ′2 (sụt áp phóng to)
    const a2 = cong(E1, nhanSo(I2, -P.r2 * mU));
    const U2ve = cong(a2, nhanSo(nhan(I2, phuc(0, 1)), -P.x2 * mU));
    o.vt.r2.dat(pU(E1), pU(a2), '−r′₂İ′₂', [44, 22]);
    o.vt.x2.dat(pU(a2), pU(U2ve), '−jx′₂İ′₂', [-80, 22]);
    o.vt.U2.dat(O, pU(U2ve), 'U̇′₂', [-28, 0]);
    // U̇1 = −Ė1 + r1İ1 + jx1İ1
    const I1 = kqT.I1;
    const b1 = cong(doiDau(E1), nhanSo(I1, P.r1 * mU));
    const U1ve = cong(b1, nhanSo(nhan(I1, phuc(0, 1)), P.x1 * mU));
    o.vt.r1.dat(pU(doiDau(E1)), pU(b1), 'r₁İ₁', [30, 0]);
    o.vt.x1.dat(pU(b1), pU(U1ve), 'jx₁İ₁', [-10, -18]);
    o.vt.U1.dat(O, pU(U1ve), 'U̇₁', [-36, -10]);
    const g = (z) => goc(q(z));
    o.cung.phi1.dat(O, 70, g(U1ve), g(I1ve), 'φ₁');
    o.cung.psi2.dat(O, 105, g(E1), g(I2), 'ψ₂');
    o.cung.alpha.dat(O, 46, 0, g(I0m), 'α');
    const U2 = doLon(kqT.U2q);
    o.chu[0].textContent = `U′₂ = ${V(U2)} = ${dinhDangSo((U2 / doLon(E1)) * 100, 2)} % E′₂`;
    o.chu[1].textContent = `I₁ = ${so(doLon(I1))} A · cosφ₁ = ${so(Math.cos(goc(kqT.I1)))} · I₀ = ${so(doLon(kqT.I0))} A`;
    o.chu[2].textContent = `Sụt áp vẽ phóng to ×${mU}, İ₀ phóng to ×${s.mI0}; độ lớn ghi là giá trị thật.`;
    return U2;
  }
  function capNhatB() {
    const [u2c, u2d] = r.b.dt.map(veVectoMot);
    $('#sl-u2c').textContent = V(u2c);
    $('#sl-u2d').textContent = V(u2d);
    chuThich(`cosφ₂ = ${dinhDangSo(s.cosPhi2, 2)}, β = ${dinhDangSo(s.beta, 2)}: tải cảm U′₂ = <b>${V(u2c)}</b>; tải dung U′₂ = <b>${V(u2d)}</b> (E₁ ≈ ${V(P.U1)}).`);
    soLieuTC(`Tải cảm U′₂ = ${V(u2c)} · tải dung U′₂ = ${V(u2d)}`);
  }

  // ======================= C =======================
  function capNhatC() {
    const dsB = Array.from({ length: 49 }, (_, i) => 0.0001 + i * 0.025);
    const tT = dsB.map((b) => (doLon(giaiHinhT(P, Zt(b)).U2q) / P.U1) * 100);
    const tD = dsB.map((b) => (doLon(giaiDonGian(P, Zt(b)).U2q) / P.U1) * 100);
    const { X, Y } = r.c.t1;
    r.c.dT.setAttribute('d', duongGap(dsB.map((b, i) => [X(b), Y(Math.max(90, Math.min(104, tT[i])))])));
    r.c.dDG.setAttribute('d', duongGap(dsB.map((b, i) => [X(b), Y(Math.max(90, Math.min(104, tD[i])))])));
    const t2 = r.c.t2;
    r.c.dSS.setAttribute('d', duongGap(dsB.map((b, i) => [t2.X(b), t2.Y(Math.min(0.1, Math.abs(tD[i] - tT[i]) / tT[i] * 100))])));
    for (const [o, tr] of [[r.c.con1, r.c.t1], [r.c.con2, t2]]) { o.setAttribute('x1', tr.X(s.beta)); o.setAttribute('x2', tr.X(s.beta)); }
    const t = giaiHinhT(P, Zt());
    const d = giaiDonGian(P, Zt());
    const U2 = doLon(t.U2q);
    const U2d = doLon(d.U2q);
    const dong = [
      `β = ${dinhDangSo(s.beta, 2)}, cosφ₂ = ${dinhDangSo(s.cosPhi2, 2)} (${s.tinhChat === 'cam' ? 'cảm' : 'dung'})`,
      '',
      `Hình T: U′₂ = ${V(U2)}`,
      `Đơn giản: U′₂ = ${V(U2d)}`,
      `Sai khác: ${dinhDangSo(((U2d - U2) / U2) * 100, 3)} %`,
      '',
      'Khi không tải, sơ đồ đơn giản cho',
      'U′₂ = U₁ (bỏ qua I₀Z₁); hình T cho',
      `U′₂ = ${V(doLon(giaiHinhT(P, null).U2q))}.`,
      '',
      'Kết luận: dùng sơ đồ đơn giản khi',
      'tính toán chế độ có tải (mục IV).',
    ];
    r.c.dong.forEach((o, i) => { o.textContent = dong[i]; o.setAttribute('class', i === 4 || i === 11 ? 'chu-kq dam' : 'chu-svg'); });
    $('#sl-u2').textContent = V(U2);
    $('#sl-ss').textContent = `${dinhDangSo(((U2d - U2) / U2) * 100, 3)} %`;
    chuThich(`Sai khác U′₂ giữa sơ đồ đơn giản và hình T ở β = ${dinhDangSo(s.beta, 2)}: <b>${dinhDangSo(((U2d - U2) / U2) * 100, 3)} %</b>.`);
    soLieuTC(`Hình T ${V(U2)} · đơn giản ${V(U2d)}`);
  }

  // ---------- Điều khiển ----------
  function capNhat() {
    if (s.kichBan === 'so-do') capNhatA();
    if (s.kichBan === 'vecto') capNhatB();
    if (s.kichBan === 'sai-so') capNhatC();
  }
  function chonKichBan(id) {
    s.kichBan = id;
    hienKichBan(id, { 'so-do': r.a.g, vecto: r.b.g, 'sai-so': r.c.g });
    veDieuKhien();
    capNhat();
  }
  function veDieuKhien() {
    const laVecto = s.kichBan === 'vecto';
    $('#dieu-khien-kich-ban').innerHTML = `
      <p class="mo-ta">Một pha MBA bài tập 4, quy đổi về sơ cấp.${laVecto ? ' Hai đồ thị dùng chung β và cosφ₂.' : ''}</p>
      <label class="dieu-khien doc"><span>Hệ số tải β</span> <input type="range" id="sd-beta" min="0" max="1.2" step="0.05" value="${s.beta}"><output id="sd-beta-gt">${dinhDangSo(s.beta, 2)}</output></label>
      <label class="dieu-khien doc"><span>cosφ₂</span> <input type="range" id="sd-cos" min="0.2" max="1" step="0.05" value="${s.cosPhi2}"><output id="sd-cos-gt">${dinhDangSo(s.cosPhi2, 2)}</output></label>
      ${laVecto ? `<label class="dieu-khien doc"><span>Phóng to sụt áp</span> <input type="range" id="sd-mu" min="1" max="30" step="1" value="${s.mU}"><output id="sd-mu-gt">×${s.mU}</output></label>`
    : `<div class="hang-nut"><button type="button" class="nut" data-tc="cam" aria-pressed="${s.tinhChat === 'cam'}">Tải cảm</button><button type="button" class="nut" data-tc="dung" aria-pressed="${s.tinhChat === 'dung'}">Tải dung</button></div>`}`;
    $('#sd-beta').addEventListener('input', (e) => { s.beta = Number(e.target.value); $('#sd-beta-gt').textContent = dinhDangSo(s.beta, 2); capNhat(); });
    $('#sd-cos').addEventListener('input', (e) => { s.cosPhi2 = Number(e.target.value); $('#sd-cos-gt').textContent = dinhDangSo(s.cosPhi2, 2); capNhat(); });
    $('#sd-mu')?.addEventListener('input', (e) => { s.mU = Number(e.target.value); $('#sd-mu-gt').textContent = `×${s.mU}`; capNhat(); });
    document.querySelectorAll('[data-tc]').forEach((b) => b.addEventListener('click', () => {
      s.tinhChat = b.dataset.tc;
      document.querySelectorAll('[data-tc]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      capNhat();
    }));
  }

  trinhChieuVaCauHoi(nd, cauHoi, (id, b) => {
    const tt = b?.trangThai;
    if (!tt) return;
    if (tt.beta !== undefined) s.beta = tt.beta;
    if (tt.cosPhi2 !== undefined) s.cosPhi2 = tt.cosPhi2;
    chonKichBan(tt.kichBan);
  }, datChay, s);

  const dB = r.a.duongB.getTotalLength();
  const dN = r.a.duongNhanh.getTotalLength();
  const dC = r.a.duongC.getTotalLength();
  vongLap(s, (dt) => {
    s.t += dt;
    if (s.kichBan !== 'so-do') return;
    const chay = (hat, p, d, n, v) => hat.forEach((h, k) => {
      if (k >= n) { h.style.display = 'none'; return; }
      h.style.display = '';
      const q = p.getPointAtLength(((k / n + s.t * v) % 1) * d);
      h.setAttribute('cx', q.x.toFixed(1)); h.setAttribute('cy', q.y.toFixed(1));
    });
    chay(r.a.hatB, r.a.duongB, dB, Math.round((s.dongB || 0) * 2.6), 0.08);
    chay(r.a.hatNhanh, r.a.duongNhanh, dN, 1, 0.08);
    chay(r.a.hatC, r.a.duongC, dC, Math.round((s.dongC || 0) * 2.6), 0.08);
  });

  chonKichBan(s.kichBan);
  document.body.classList.add('da-san-sang');
}

chayTrang(khoiDong);
