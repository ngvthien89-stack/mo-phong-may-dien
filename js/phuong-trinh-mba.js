/**
 * phuong-trinh-mba.js — Trang 3.1–3.2 "Phương trình cân bằng điện, từ và quy đổi MBA" (slide 44–49).
 *
 * Kịch bản a (dien-ap): hình 3.1, từ thông chính và từ thông tản; đồ thị véc tơ cân bằng điện áp hai phía.
 * Kịch bản b (std): cân bằng stđ İ1 = İ0 + (−İ′2) khi tải thay đổi; Φ gần như không đổi.
 * Kịch bản c (quy-doi): đại lượng thứ cấp thực và quy đổi về sơ cấp.
 * Số liệu: một pha MBA bài tập 4 (slide 82–84), quy đổi về sơ cấp.
 */
import { el } from './so-do.js';
import { $, napBai, dieuKhienChung, trinhChieuVaCauHoi, vongLap, chayTrang, hienKichBan } from './khung-trang.js';
import { taoMarker, veThe, veLoiKhung, veCuonDung, veNguonAC, veTai, veTruc, duongGap, veVecto, veBang } from './hinh-mba.js';
import { giaiHinhT, tongTroTai } from './mach-mba.js';
import { phuc, cong, nhan, nhanSo, doLon, goc, doiDau } from './so-phuc.js';
import { dinhDangSo } from './tinh-toan.js';
import { soCoNghia, veCongThuc } from './tien-ich.js';

const so = (x, k = 3) => soCoNghia(x, k);
const doDo = (rad) => `${dinhDangSo((rad * 180) / Math.PI, 1)}°`;
const V = (x) => (x >= 1000 ? `${so(x / 1000, 4)} kV` : `${so(x)} V`);

/** Hộp tổng trở nằm ngang trên dây dẫn. */
function veHopZ(cha, x, y, w, nhan) {
  el('rect', { x, y: y - 16, width: w, height: 32, rx: 4, class: 'than-tai' }, cha);
  return el('text', { x: x + w / 2, y: y - 26, class: 'chu-svg dam', 'text-anchor': 'middle' }, cha).textContent = nhan;
}

function veSanKhau(svg) {
  svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  taoMarker(defs, 'mui-den', '#13202b');
  taoMarker(defs, 'mui-xanh', '#2a78d6');
  taoMarker(defs, 'mui-cam', '#eb6834');
  el('rect', { x: -2000, y: -1200, width: 5600, height: 3300, class: 'nen-san-khau' }, svg);
  const r = { a: {}, b: {}, c: {} };

  // ======================= A: CÂN BẰNG ĐIỆN ÁP =======================
  const gA = el('g', {}, svg);
  r.a.g = gA;
  const g1 = veThe(gA, 20, 20, 1000, 500, 'Hình 3.1 – dòng điện, điện áp, từ thông');
  const L = { x0: 330, y0: 120, x1: 690, y1: 450, day: 48 };
  veLoiKhung(g1, L);
  const m = L.day / 2;
  r.a.phi = el('rect', { x: L.x0 + m, y: L.y0 + m, width: L.x1 - L.x0 - L.day, height: L.y1 - L.y0 - L.day, class: 'dong-phi' }, g1);
  el('line', { x1: 470, x2: 550, y1: L.y0 + m, y2: L.y0 + m, class: 'vec', stroke: '#2a78d6', 'marker-end': 'url(#mui-xanh)' }, g1);
  el('text', { x: 510, y: 108, class: 'nhan-dai-luong mau-phi', 'text-anchor': 'middle' }, g1).textContent = 'Φ';
  r.a.tan1 = el('ellipse', { cx: L.x0 + m, cy: 285, rx: 66, ry: 150, class: 'tu-tan' }, g1);
  r.a.tan2 = el('ellipse', { cx: L.x1 - m, cy: 285, rx: 66, ry: 150, class: 'tu-tan' }, g1);
  el('text', { x: 404, y: 208, class: 'nhan-dai-luong mau-i' }, g1).textContent = 'Φt1';
  el('text', { x: 616, y: 208, class: 'nhan-dai-luong mau-i', 'text-anchor': 'end' }, g1).textContent = 'Φt2';
  veCuonDung(g1, L.x0, L.x0 + L.day, 175, 395, 9, 'cuon-day so-cap');
  veCuonDung(g1, L.x1 - L.day, L.x1, 175, 395, 7, 'cuon-day thu-cap');
  veNguonAC(g1, 120, 285);
  el('path', { d: 'M120 251 V150 H320 V182 M120 319 V420 H320 V388', class: 'day-mach' }, g1);
  el('path', { d: 'M700 192 V150 H880 V240 M880 330 V420 H700 V388', class: 'day-mach' }, g1);
  veTai(g1, 880, 285, 30, 90, 'Z');
  el('line', { x1: 210, x2: 210, y1: 190, y2: 380, class: 'vec', stroke: '#d62828', 'marker-end': 'url(#mui-den)' }, g1);
  el('text', { x: 222, y: 296, class: 'nhan-dai-luong mau-u1' }, g1).textContent = 'U₁';
  el('line', { x1: 960, x2: 960, y1: 190, y2: 380, class: 'vec', stroke: '#2e9e4f', 'marker-end': 'url(#mui-den)' }, g1);
  el('text', { x: 970, y: 296, class: 'nhan-dai-luong mau-u2' }, g1).textContent = 'U₂';
  el('line', { x1: 230, x2: 290, y1: 150, y2: 150, class: 'vec', stroke: '#eb6834', 'marker-end': 'url(#mui-cam)' }, g1);
  el('text', { x: 248, y: 138, class: 'nhan-dai-luong mau-i' }, g1).textContent = 'I₁';
  el('line', { x1: 760, x2: 820, y1: 150, y2: 150, class: 'vec', stroke: '#eb6834', 'marker-end': 'url(#mui-cam)' }, g1);
  el('text', { x: 778, y: 138, class: 'nhan-dai-luong mau-i' }, g1).textContent = 'I₂';
  el('text', { x: 270, y: 300, class: 'nhan-dai-luong', 'text-anchor': 'middle' }, g1).textContent = 'E₁';
  el('text', { x: 752, y: 300, class: 'nhan-dai-luong', 'text-anchor': 'middle' }, g1).textContent = 'E₂';
  r.a.chuHinh = el('text', { x: 44, y: 500, class: 'chu-kq' }, g1);

  const g2 = veThe(gA, 20, 540, 1000, 350, 'Đồ thị véc tơ cân bằng điện áp (một pha, quy đổi)');
  r.a.ghiChu = el('text', { x: 44, y: 878, class: 'nho-xam' }, g2);
  el('line', { x1: 510, x2: 510, y1: 600, y2: 870, class: 'duong-cham' }, g2);
  el('text', { x: 44, y: 616, class: 'chu-svg dam' }, g2).textContent = 'Sơ cấp: U̇₁ = −Ė₁ + İ₁r₁ + jİ₁x₁';
  el('text', { x: 530, y: 616, class: 'chu-svg dam' }, g2).textContent = 'Thứ cấp: U̇′₂ = Ė′₂ − İ′₂r′₂ − jİ′₂x′₂';
  r.a.vt = {
    U1: veVecto(g2, '#d62828'), E1: veVecto(g2, '#2a78d6'), r1: veVecto(g2, '#7b2cbf'), x1: veVecto(g2, '#2e7d32'), I1: veVecto(g2, '#eb6834', { day: 2.5, net: '7 4' }),
    E2: veVecto(g2, '#2a78d6'), r2: veVecto(g2, '#7b2cbf'), x2: veVecto(g2, '#2e7d32'), U2: veVecto(g2, '#2e9e4f'), I2: veVecto(g2, '#eb6834', { day: 2.5, net: '7 4' }),
  };

  const g3 = veThe(gA, 1040, 20, 540, 870, 'Số liệu (một pha, quy đổi)');
  r.a.bang = veBang(g3, 1056, 70, [{ w: 170 }, { w: 190, canh: 'end' }, { w: 148, canh: 'end' }], 44, ['Đại lượng', 'Độ lớn', 'Góc'], 11);
  r.a.nhanXet = [0, 1, 2, 3].map((k) => el('text', { x: 1064, y: 640 + k * 32, class: k === 3 ? 'chu-kq dam' : 'chu-svg' }, g3));
  r.a.nguon = el('text', { x: 1064, y: 870, class: 'nho-xam' }, g3);

  // ======================= B: CÂN BẰNG STĐ =======================
  const gB = el('g', {}, svg);
  r.b.g = gB;
  const b1 = veThe(gB, 20, 20, 1000, 500, 'Cân bằng stđ khi tải thay đổi');
  const LB = { x0: 120, y0: 120, x1: 440, y1: 440, day: 46 };
  veLoiKhung(b1, LB);
  r.b.phi = el('rect', { x: LB.x0 + 23, y: LB.y0 + 23, width: LB.x1 - LB.x0 - 46, height: LB.y1 - LB.y0 - 46, class: 'dong-phi' }, b1);
  veCuonDung(b1, LB.x0, LB.x0 + LB.day, 170, 390, 8, 'cuon-day so-cap');
  veCuonDung(b1, LB.x1 - LB.day, LB.x1, 170, 390, 6, 'cuon-day thu-cap');
  el('text', { x: 280, y: 108, class: 'nhan-dai-luong mau-phi', 'text-anchor': 'middle' }, b1).textContent = 'Φ';
  el('text', { x: 186, y: 290, class: 'nhan-dai-luong' }, b1).textContent = 'i₁w₁';
  el('text', { x: 374, y: 290, class: 'nhan-dai-luong', 'text-anchor': 'end' }, b1).textContent = 'i₂w₂';
  r.b.vong1 = Array.from({ length: 14 }, () => el('circle', { r: 4.5, class: 'hat-dong' }, b1));
  r.b.vong2 = Array.from({ length: 14 }, () => el('circle', { r: 4.5, class: 'hat-dong' }, b1));
  r.b.duong1 = el('path', { d: 'M110 170 V390', class: 'an' }, svg);
  r.b.duong2 = el('path', { d: 'M450 390 V170', class: 'an' }, svg);
  el('text', { x: 500, y: 130, class: 'chu-svg dam' }, b1).textContent = 'Stđ chia cho w₁ (A, quy đổi về sơ cấp):';
  r.b.cot = [['I₀ (từ hóa)', '#7b2cbf'], ['I₁ (sơ cấp)', '#d62828'], ['I′₂ = I₂w₂/w₁', '#2e9e4f']].map(([t, mau], k) => {
    const y = 160 + k * 74;
    el('text', { x: 500, y: y + 26, class: 'chu-svg' }, b1).textContent = t;
    return { cot: el('rect', { x: 660, y, height: 40, rx: 5, fill: mau }, b1), gt: el('text', { y: y + 28, class: 'chu-kq' }, b1) };
  });
  el('text', { x: 500, y: 410, class: 'chu-svg dam' }, b1).textContent = 'Φ tỉ lệ với E₁ – gần như không đổi:';
  r.b.cotPhi = el('rect', { x: 500, y: 424, height: 30, rx: 5, fill: '#2a78d6' }, b1);
  r.b.gtPhi = el('text', { y: 446, class: 'chu-kq' }, b1);

  const b2 = veThe(gB, 20, 540, 1000, 350, '');
  el('text', { x: 44, y: 580, class: 'chu-svg dam' }, b2).textContent = 'İ₁ = İ₀ + (−İ′₂)';
  r.b.ghiChuVt = el('text', { x: 44, y: 870, class: 'nho-xam' }, b2);
  el('line', { x1: 60, x2: 470, y1: 630, y2: 630, class: 'duong-cham' }, b2);
  el('text', { x: 470, y: 622, class: 'nho-xam', 'text-anchor': 'end' }, b2).textContent = 'hướng U̇₁';
  r.b.vt = { I0: veVecto(b2, '#7b2cbf'), I2: veVecto(b2, '#2e9e4f'), I1: veVecto(b2, '#d62828') };
  el('text', { x: 530, y: 580, class: 'chu-svg dam' }, b2).textContent = 'Dòng điện theo hệ số tải β';
  r.b.truc = veTruc(b2, { x0: 590, x1: 990, y0: 600, y1: 830, xMin: 0, xMax: 1.2, yMin: 0, yMax: 10 }, {
    nhanX: [[0, '0'], [0.4, '0,4'], [0.8, '0,8'], [1.2, '1,2']], nhanY: [[0, '0'], [5, '5'], [10, '10 A']],
  });
  r.b.dI1 = el('path', { class: 'duong-dt', stroke: '#d62828' }, b2);
  r.b.dI2 = el('path', { class: 'duong-dt', stroke: '#2e9e4f', 'stroke-dasharray': '8 5' }, b2);
  r.b.dI0 = el('path', { class: 'duong-dt', stroke: '#7b2cbf' }, b2);
  r.b.conTro = el('line', { y1: 600, y2: 830, class: 'duong-cham' }, b2);

  const b3 = veThe(gB, 1040, 20, 540, 870, 'Nhận xét');
  r.b.dong = Array.from({ length: 12 }, (_, k) => el('text', { x: 1064, y: 100 + k * 40, class: 'chu-svg' }, b3));

  // ======================= C: QUY ĐỔI =======================
  const gC = el('g', {}, svg);
  r.c.g = gC;
  const c1 = veThe(gC, 20, 20, 1000, 870, '3.2. Quy đổi MBA – nối hai dây quấn (giả tưởng)');
  // trước quy đổi
  el('text', { x: 44, y: 104, class: 'chu-svg dam' }, c1).textContent = 'Trước quy đổi: hai mạch cách ly, liên hệ qua từ thông';
  veNguonAC(c1, 90, 270, 30);
  el('path', { d: 'M90 240 V180 H200 M320 180 H400 V220 M90 300 V360 H400 V320', class: 'day-mach' }, c1);
  r.c.z1a = veHopZ(c1, 200, 180, 120, 'Z₁');
  veLoiKhung(c1, { x0: 392, y0: 200, x1: 600, y1: 340, day: 26 });
  veCuonDung(c1, 392, 418, 222, 318, 5, 'cuon-day so-cap');
  veCuonDung(c1, 574, 600, 226, 314, 3, 'cuon-day thu-cap');
  el('path', { d: 'M610 230 V180 H680 M800 180 H880 V225 M880 315 V360 H610 V310', class: 'day-mach' }, c1);
  veHopZ(c1, 680, 180, 120, 'Z₂');
  veTai(c1, 880, 270, 30, 90, 'Zt');
  r.c.tren = [0, 1, 2].map((k) => el('text', { x: 44, y: 400 + k * 26, class: 'chu-svg' }, c1));
  el('text', { x: 510, y: 486, class: 'chu-kq dam', 'text-anchor': 'middle' }, c1).textContent = '⇩ quy đổi thứ cấp về sơ cấp: sđđ ×k, dòng điện ÷k, tổng trở ×k²';
  // sau quy đổi
  el('text', { x: 44, y: 530, class: 'chu-svg dam' }, c1).textContent = 'Sau quy đổi: một mạch điện (sơ đồ thay thế, mục 3.3)';
  veNguonAC(c1, 90, 680, 30);
  el('path', { d: 'M90 650 V590 H200 M320 590 H660 M780 590 H880 V635 M880 725 V770 H90 V710 M440 590 V625 M440 735 V770', class: 'day-mach' }, c1);
  veHopZ(c1, 200, 590, 120, 'Z₁');
  el('rect', { x: 424, y: 625, width: 32, height: 110, rx: 4, class: 'than-tai' }, c1);
  el('text', { x: 466, y: 686, class: 'chu-svg dam' }, c1).textContent = 'Zth';
  el('circle', { cx: 440, cy: 590, r: 6, class: 'diem-noi' }, c1);
  el('circle', { cx: 440, cy: 770, r: 6, class: 'diem-noi' }, c1);
  veHopZ(c1, 660, 590, 120, 'Z′₂');
  veTai(c1, 880, 680, 30, 90, 'Z′t');
  r.c.duoi = [0, 1, 2].map((k) => el('text', { x: 44, y: 812 + k * 26, class: 'chu-svg' }, c1));

  const c2 = veThe(gC, 1040, 20, 540, 870, 'Thực tế ↔ quy đổi');
  r.c.bang = veBang(c2, 1056, 70, [{ w: 110 }, { w: 140, canh: 'end' }, { w: 140, canh: 'end' }, { w: 118, canh: 'middle' }], 46, ['', 'Thực tế', 'Quy đổi', 'Quan hệ'], 7);
  r.c.kiem = Array.from({ length: 7 }, (_, k) => el('text', { x: 1064, y: 470 + k * 38, class: k % 3 === 2 ? 'chu-kq dam' : 'chu-svg' }, c2));
  return r;
}

async function khoiDong() {
  const kq = await napBai('du-lieu/phuong-trinh-mba.json', 'du-lieu/cau-hoi-phuong-trinh-mba.json');
  if (!kq) return;
  const [nd, cauHoi] = kq;
  const svg = $('#so-do');
  const r = veSanKhau(svg);
  const P = nd.mach;
  const s = { kichBan: nd.macDinh.kichBan, dangChay: true, tocDo: 1, t: 0, beta: nd.macDinh.beta, cosPhi2: nd.macDinh.cosPhi2, tinhChat: nd.macDinh.tinhChat, phongTo: nd.macDinh.phongTo };
  const { datChay, chuThich, soLieuTC } = dieuKhienChung(s, (id) => chonKichBan(id));

  // ---------- Lý thuyết ----------
  const lt = nd.lyThuyet;
  $('#the-ly-thuyet').innerHTML = `
    <p class="muc-nho">${lt.muc}</p>
    <h2>3.1. Các phương trình cân bằng điện và từ</h2>
    <p class="dong-ly-thuyet">${lt.chieu}</p>
    ${lt.congThuc.map((c, k) => `${c.chu ? `<p class="dong-ly-thuyet">${c.chu}</p>` : ''}<div class="cong-thuc" data-ct="${k}"></div>`).join('')}
    <p class="quy-tac">${lt.stdNhanXet}</p>
    <h2>3.2. Quy đổi MBA</h2>
    <p class="dong-ly-thuyet">${lt.quyDoi}</p>
    <p class="ghi-chu-nho">Số liệu mô phỏng: ${P.nguon}.</p>`;
  const veLyThuyet = () => lt.congThuc.forEach((c, k) => veCongThuc($(`[data-ct="${k}"]`), c.tex, c.duPhong));
  veLyThuyet();
  if (!window.katex) document.querySelector('script[src*="katex"]')?.addEventListener('load', () => { veLyThuyet(); capNhat(); }, { once: true });

  const phi2 = () => (s.tinhChat === 'cam' ? 1 : -1) * Math.acos(s.cosPhi2);
  const giai = (beta = s.beta) => giaiHinhT(P, tongTroTai(P.U1, P.I1dm, beta, phi2()));

  // ======================= A =======================
  function capNhatA() {
    const kq = giai();
    const I1 = doLon(kq.I1);
    const I2 = doLon(kq.I2t);
    const E1 = doLon(kq.E1);
    const U2 = doLon(kq.U2q);
    r.a.chuHinh.textContent = `U₁ = ${V(P.U1)} · I₁ = ${so(I1)} A · E₁ = ${V(E1)} · U′₂ = ${V(U2)} · I′₂ = ${so(I2)} A`;
    // sơ cấp: gốc trái, U1 nằm ngang; sụt áp phóng to
    const k = s.phongTo;
    const tlU = 360 / P.U1;
    const tlI = 130 / P.I1dm;
    const O1 = [70, 760];
    const p = (o, z, tl) => [o[0] + z[0] * tl, o[1] - z[1] * tl];
    const dr1 = nhanSo(nhanSo(kq.I1, P.r1), k);
    const dx1 = nhanSo(nhan(kq.I1, phuc(0, P.x1)), k);
    const E1ve = cong(kq.U1, doiDau(cong(dr1, dx1))); // −Ė1 vẽ phóng to: U̇1 − k·İ1Z1
    r.a.vt.U1.dat(O1, p(O1, kq.U1, tlU), 'U̇₁', [0, 30]);
    r.a.vt.E1.dat(O1, p(O1, E1ve, tlU), '−Ė₁', [-20, -14]);
    r.a.vt.r1.dat(p(O1, E1ve, tlU), p(O1, cong(E1ve, dr1), tlU), 'İ₁r₁', [0, -16]);
    r.a.vt.x1.dat(p(O1, cong(E1ve, dr1), tlU), p(O1, kq.U1, tlU), 'jİ₁x₁', [18, 0]);
    r.a.vt.I1.dat(O1, p(O1, kq.I1, tlI), I1 > 0.5 ? 'İ₁' : '', [-6, 22]);
    // thứ cấp theo quy ước slide: U̇′2 = Ė′2 − İ′2Z′2, Ė′2 = Ė1 (hướng sang trái)
    const O2 = [960, 760];
    const E2 = kq.E1;
    const I2q = kq.I2q;
    const dr2 = nhanSo(nhanSo(I2q, -P.r2), k);
    const dx2 = nhanSo(nhan(I2q, phuc(0, -P.x2)), k);
    const U2ve = cong(cong(E2, dr2), dx2);
    r.a.vt.E2.dat(O2, p(O2, E2, tlU), 'Ė′₂', [-40, -22]);
    r.a.vt.r2.dat(p(O2, E2, tlU), p(O2, cong(E2, dr2), tlU), '−İ′₂r′₂', [-10, 26]);
    r.a.vt.x2.dat(p(O2, cong(E2, dr2), tlU), p(O2, U2ve, tlU), '−jİ′₂x′₂', [-60, 0]);
    r.a.vt.U2.dat(O2, p(O2, U2ve, tlU), 'U̇′₂', [30, 34]);
    r.a.vt.I2.dat(O2, p(O2, I2q, tlI), I2 > 0.5 ? 'İ′₂' : '', [6, 22]);
    r.a.ghiChu.textContent = `Các véc tơ sụt áp phóng to ×${k} để dễ nhìn; dòng điện vẽ theo thang riêng.`;
    const ds = [
      ['U̇₁', V(P.U1), doDo(0)],
      ['−Ė₁', V(E1), doDo(goc(kq.UM))],
      ['İ₁', `${so(I1)} A`, doDo(goc(kq.I1))],
      ['İ₁r₁', `${so(I1 * P.r1)} V`, doDo(goc(kq.I1))],
      ['İ₁x₁', `${so(I1 * P.x1)} V`, doDo(goc(kq.I1) + Math.PI / 2)],
      ['İ₀', `${so(doLon(kq.I0))} A`, doDo(goc(kq.I0))],
      ['U̇′₂', V(U2), doDo(goc(U2ve))],
      ['İ′₂', `${so(I2)} A`, doDo(goc(I2q))],
      ['İ′₂r′₂', `${so(I2 * P.r2)} V`, ''],
      ['İ′₂x′₂', `${so(I2 * P.x2)} V`, ''],
      ['cosφ₁', so(Math.cos(goc(kq.I1)), 3), ''],
    ];
    r.a.bang.o.forEach((h, i) => h.forEach((o, j) => { o.textContent = ds[i][j]; }));
    r.a.nhanXet[0].textContent = `Sụt áp sơ cấp |İ₁Z₁| = ${so(I1 * Math.hypot(P.r1, P.x1))} V`;
    r.a.nhanXet[1].textContent = `= ${so((I1 * Math.hypot(P.r1, P.x1) * 100) / P.U1)} % của U₁ (rất nhỏ).`;
    r.a.nhanXet[2].textContent = `E₁ = ${so((E1 / P.U1) * 100, 4)} % U₁; U′₂ = ${so((U2 / P.U1) * 100, 4)} % U₁.`;
    r.a.nhanXet[3].textContent = s.beta === 0 ? 'Không tải: I₁ = I₀, U′₂ ≈ U₁.' : 'E₁ ≈ U₁ vì sụt áp trên Z₁ nhỏ.';
    r.a.nguon.textContent = P.nguon;
    $('#sl-i1').textContent = `${so(I1)} A`;
    $('#sl-e1').textContent = V(E1);
    $('#sl-u2').textContent = V(U2);
    chuThich(`β = ${dinhDangSo(s.beta, 2)}, cosφ₂ = ${dinhDangSo(s.cosPhi2, 2)} (${s.tinhChat === 'cam' ? 'tải cảm' : 'tải dung'}): I₁ = <b>${so(I1)} A</b>, E₁ = <b>${V(E1)}</b>, U′₂ = <b>${V(U2)}</b>. U̇₁ = −Ė₁ + İ₁Z₁ với |İ₁Z₁| chỉ ${so((I1 * Math.hypot(P.r1, P.x1) * 100) / P.U1)} % U₁.`);
    soLieuTC(`I₁ = ${so(I1)} A · E₁ = ${V(E1)} · U′₂ = ${V(U2)}`);
  }

  // ======================= B =======================
  function capNhatB() {
    const kq = giai();
    const I1 = doLon(kq.I1);
    const I0 = doLon(kq.I0);
    const I2 = doLon(kq.I2t);
    const E1 = doLon(kq.E1);
    const tl = 300 / 10;
    [[I0, 0], [I1, 1], [I2, 2]].forEach(([x, i]) => {
      const w = Math.max(2, x * tl);
      r.b.cot[i].cot.setAttribute('width', w);
      r.b.cot[i].gt.setAttribute('x', 660 + w + 10);
      r.b.cot[i].gt.textContent = `${so(x)} A`;
    });
    const k0 = doLon(giai(0).E1);
    r.b.cotPhi.setAttribute('width', (E1 / P.U1) * 300);
    r.b.gtPhi.setAttribute('x', 500 + (E1 / P.U1) * 300 + 10);
    r.b.gtPhi.textContent = `${so((E1 / k0) * 100, 4)} % so với không tải`;
    // tam giác dòng điện (İ0 phóng to ×10)
    const O = [80, 630];
    const tlI = 250 / P.I1dm;
    const I0ve = nhanSo(kq.I0, 10);
    const p = (z) => [O[0] + z[0] * tlI, O[1] - z[1] * tlI];
    r.b.vt.I0.dat(O, p(I0ve), 'İ₀ (×10)', [-30, -10]);
    r.b.vt.I2.dat(p(I0ve), p(cong(I0ve, kq.I2t)), '−İ′₂', [0, 24]);
    r.b.vt.I1.dat(O, p(cong(I0ve, kq.I2t)), 'İ₁', [0, -14]);
    r.b.ghiChuVt.textContent = 'İ₀ phóng to ×10 để dễ nhìn; thực tế I₀ rất nhỏ so với I₁.';
    // đồ thị theo β
    const { X, Y } = r.b.truc;
    const dsB = Array.from({ length: 49 }, (_, i) => i * 0.025);
    const nghiem = dsB.map((b) => giai(b));
    r.b.dI1.setAttribute('d', duongGap(nghiem.map((n, i) => [X(dsB[i]), Y(doLon(n.I1))])));
    r.b.dI2.setAttribute('d', duongGap(nghiem.map((n, i) => [X(dsB[i]), Y(doLon(n.I2t))])));
    r.b.dI0.setAttribute('d', duongGap(nghiem.map((n, i) => [X(dsB[i]), Y(doLon(n.I0))])));
    r.b.conTro.setAttribute('x1', X(s.beta));
    r.b.conTro.setAttribute('x2', X(s.beta));
    const dong = [
      'Khi không tải: i₁ = i₀, Φ do stđ i₀w₁ sinh ra.',
      'Khi có tải: Φ do stđ tổng (i₁w₁ + i₂w₂) sinh ra.',
      'U₁ không đổi ⇒ Φ không đổi ⇒ stđ tổng không đổi:',
      '   i₀w₁ = i₁w₁ + i₂w₂ ⇒ i₁ = i₀ + (−i′₂)',
      '',
      `Hệ số tải β = ${dinhDangSo(s.beta, 2)}:`,
      `   I₀ = ${so(I0)} A (gần như không đổi)`,
      `   I′₂ = ${so(I2)} A`,
      `   I₁ = ${so(I1)} A`,
      `   E₁ = ${V(E1)} ⇒ Φ ≈ ${so((E1 / k0) * 100, 4)} % lúc không tải`,
      '',
      'Tải tăng ⇒ I′₂ tăng ⇒ I₁ tự tăng theo để bù.',
    ];
    r.b.dong.forEach((o, i) => { o.textContent = dong[i]; o.setAttribute('class', i === 3 || i === 11 ? 'chu-kq dam' : 'chu-svg'); });
    $('#sl-i1').textContent = `${so(I1)} A`;
    $('#sl-i0').textContent = `${so(I0)} A`;
    $('#sl-i2').textContent = `${so(I2)} A`;
    chuThich(`β = ${dinhDangSo(s.beta, 2)}: I₁ = <b>${so(I1)} A</b> = İ₀ + (−İ′₂) với I₀ = ${so(I0)} A, I′₂ = ${so(I2)} A; từ thông Φ ≈ ${so((E1 / k0) * 100, 4)} % lúc không tải.`);
    soLieuTC(`β = ${dinhDangSo(s.beta, 2)} · I₀ = ${so(I0)} A · I′₂ = ${so(I2)} A · I₁ = ${so(I1)} A`);
  }

  // ======================= C =======================
  function capNhatC() {
    const kq = giai();
    const k = P.kp;
    const E1 = doLon(kq.E1);
    const U2q = doLon(kq.U2q);
    const I2q = doLon(kq.I2t);
    const Zt = tongTroTai(P.U1, P.I1dm, Math.max(s.beta, 1e-9), phi2());
    const zt = doLon(Zt);
    const mOhm = (x) => `${so(x * 1000)} mΩ`;
    const dong = [
      ['E₂', `${so(E1 / k)} V`, `${V(E1)}`, 'E′₂ = kE₂'],
      ['U₂', `${so(U2q / k)} V`, `${V(U2q)}`, 'U′₂ = kU₂'],
      ['I₂', `${so(I2q * k)} A`, `${so(I2q)} A`, 'I′₂ = I₂/k'],
      ['r₂', mOhm(P.r2 / (k * k)), `${so(P.r2)} Ω`, 'r′₂ = k²r₂'],
      ['x₂', mOhm(P.x2 / (k * k)), `${so(P.x2)} Ω`, 'x′₂ = k²x₂'],
      ['|Zt|', s.beta > 0 ? `${so(zt / (k * k))} Ω` : '∞', s.beta > 0 ? `${so(zt)} Ω` : '∞', 'Z′t = k²Zt'],
      ['k', '', so(k), 'kp (slide 83)'],
    ];
    r.c.bang.o.forEach((h, i) => h.forEach((o, j) => { o.textContent = dong[i][j]; }));
    const S2 = (E1 / k) * (I2q * k);
    const S2q = E1 * I2q;
    const p2 = (I2q * k) ** 2 * (P.r2 / (k * k));
    const p2q = I2q ** 2 * P.r2;
    const kiem = [
      'Công suất truyền tải không đổi:',
      `E₂·I₂ = ${so(S2 / 1000, 4)} kVA; E′₂·I′₂ = ${so(S2q / 1000, 4)} kVA`,
      '✓ bằng nhau',
      'Tổn hao không đổi:',
      `I₂²·r₂ = ${so(p2, 4)} W; I′₂²·r′₂ = ${so(p2q, 4)} W`,
      '✓ bằng nhau',
      `Ė′₂ = Ė₁ = ${V(E1)} (hệ phương trình slide 49)`,
    ];
    r.c.kiem.forEach((o, i) => { o.textContent = kiem[i]; });
    r.c.tren[0].textContent = `Sơ cấp: U₁ = ${V(P.U1)}, Z₁ = ${so(P.r1)} + j${so(P.x1)} Ω, E₁ = ${V(E1)}`;
    r.c.tren[1].textContent = `Thứ cấp: E₂ = ${so(E1 / k)} V, I₂ = ${so(I2q * k)} A, Z₂ = ${so((P.r2 / (k * k)) * 1000)} + j${so((P.x2 / (k * k)) * 1000)} mΩ`;
    r.c.tren[2].textContent = 'Hai dây quấn có điện áp khác nhau k lần nên không nối trực tiếp được.';
    r.c.duoi[0].textContent = `Z′₂ = k²Z₂ = ${so(P.r2)} + j${so(P.x2)} Ω; Zth ≈ ${dinhDangSo(P.Rth, 0)} + j${dinhDangSo(P.Xth, 0)} Ω`;
    r.c.duoi[1].textContent = `E′₂ = E₁ = ${V(E1)} nên hai đầu dây quấn nối được với nhau; I′₂ = ${so(I2q)} A.`;
    $('#sl-k').textContent = so(k);
    $('#sl-i2').textContent = `${so(I2q * k)} A → ${so(I2q)} A`;
    chuThich(`kp = ${so(k)}: E′₂ = kE₂ = ${V(E1)}, I′₂ = I₂/k = ${so(I2q)} A, r′₂ = k²r₂ = ${so(P.r2)} Ω. Công suất và tổn hao trước, sau quy đổi bằng nhau.`);
    soLieuTC(`k = ${so(k)} · I₂ = ${so(I2q * k)} A ↔ I′₂ = ${so(I2q)} A · r₂ = ${so((P.r2 / (k * k)) * 1000)} mΩ ↔ r′₂ = ${so(P.r2)} Ω`);
  }

  // ---------- Điều khiển ----------
  function capNhat() {
    if (s.kichBan === 'dien-ap') capNhatA();
    if (s.kichBan === 'std') capNhatB();
    if (s.kichBan === 'quy-doi') capNhatC();
  }
  function chonKichBan(id) {
    s.kichBan = id;
    hienKichBan(id, { 'dien-ap': r.a.g, std: r.b.g, 'quy-doi': r.c.g });
    veDieuKhien();
    capNhat();
  }
  function veDieuKhien() {
    $('#dieu-khien-kich-ban').innerHTML = `
      <p class="mo-ta">Một pha MBA bài tập 4 (500 kVA, 22/0,4 kV), quy đổi về sơ cấp. Thay đổi tải để xem các phương trình cân bằng.</p>
      <label class="dieu-khien doc"><span>Hệ số tải β</span> <input type="range" id="pt-beta" min="0" max="1.2" step="0.05" value="${s.beta}"><output id="pt-beta-gt">${dinhDangSo(s.beta, 2)}</output></label>
      <label class="dieu-khien doc"><span>cosφ₂</span> <input type="range" id="pt-cos" min="0.2" max="1" step="0.05" value="${s.cosPhi2}"><output id="pt-cos-gt">${dinhDangSo(s.cosPhi2, 2)}</output></label>
      <div class="hang-nut">
        <button type="button" class="nut" data-tc="cam" aria-pressed="${s.tinhChat === 'cam'}">Tải cảm (RL)</button>
        <button type="button" class="nut" data-tc="dung" aria-pressed="${s.tinhChat === 'dung'}">Tải dung (RC)</button>
      </div>
      ${s.kichBan === 'dien-ap' ? `<label class="dieu-khien doc"><span>Phóng to sụt áp</span> <input type="range" id="pt-pt" min="1" max="40" step="1" value="${s.phongTo}"><output id="pt-pt-gt">×${s.phongTo}</output></label>` : ''}`;
    $('#pt-beta').addEventListener('input', (e) => { s.beta = Number(e.target.value); $('#pt-beta-gt').textContent = dinhDangSo(s.beta, 2); capNhat(); });
    $('#pt-cos').addEventListener('input', (e) => { s.cosPhi2 = Number(e.target.value); $('#pt-cos-gt').textContent = dinhDangSo(s.cosPhi2, 2); capNhat(); });
    document.querySelectorAll('[data-tc]').forEach((b) => b.addEventListener('click', () => {
      s.tinhChat = b.dataset.tc;
      document.querySelectorAll('[data-tc]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      capNhat();
    }));
    $('#pt-pt')?.addEventListener('input', (e) => { s.phongTo = Number(e.target.value); $('#pt-pt-gt').textContent = `×${s.phongTo}`; capNhat(); });
  }

  trinhChieuVaCauHoi(nd, cauHoi, (id, b) => {
    const tt = b?.trangThai;
    if (!tt) return;
    if (tt.beta !== undefined) s.beta = tt.beta;
    chonKichBan(tt.kichBan);
  }, datChay, s);

  // ---------- Vòng lặp ----------
  const d1 = r.b.duong1.getTotalLength();
  const d2 = r.b.duong2.getTotalLength();
  vongLap(s, (dt) => {
    s.t += dt;
    if (s.kichBan === 'dien-ap') {
      r.a.phi.style.strokeDashoffset = (-(s.t * 40) % 34).toFixed(1);
      const tan = Math.min(1, 0.15 + s.beta * 0.8);
      r.a.tan1.style.opacity = tan.toFixed(2);
      r.a.tan2.style.opacity = (s.beta > 0 ? tan : 0).toFixed(2);
    } else if (s.kichBan === 'std') {
      r.b.phi.style.strokeDashoffset = (-(s.t * 40) % 34).toFixed(1);
      const kq = giai();
      const n1 = Math.max(2, Math.round(doLon(kq.I1) * 1.6));
      const n2 = Math.round(doLon(kq.I2t) * 1.6);
      [[r.b.vong1, r.b.duong1, d1, n1, 1], [r.b.vong2, r.b.duong2, d2, n2, 1]].forEach(([hat, p, d, n]) => {
        hat.forEach((h, k) => {
          if (k >= n) { h.style.display = 'none'; return; }
          h.style.display = '';
          const q = p.getPointAtLength(((k / n + s.t * 0.25) % 1) * d);
          h.setAttribute('cx', q.x.toFixed(1)); h.setAttribute('cy', q.y.toFixed(1));
        });
      });
    }
  });

  chonKichBan(s.kichBan);
  document.body.classList.add('da-san-sang');
}

chayTrang(khoiDong);
