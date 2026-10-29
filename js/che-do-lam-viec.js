/**
 * che-do-lam-viec.js — Trang 4.1–4.3 "Các chế độ làm việc của MBA" (slide 59–64).
 *
 * Kịch bản a (nang-luong): giản đồ năng lượng P, Q (slide 59) tính từ sơ đồ thay thế hình T.
 * Kịch bản b (dien-ap): ΔU% = f(β), f(cosφ2) (slide 61); điều chỉnh bằng đầu phân áp ±2,5 %, ±5 %.
 * Kịch bản c (hieu-suat): tổn hao pFe, pCu = β²Pn, hiệu suất η(β) và β tối ưu (slide 63–64).
 */
import { el } from './so-do.js';
import { $, napBai, dieuKhienChung, trinhChieuVaCauHoi, vongLap, chayTrang, hienKichBan } from './khung-trang.js';
import { taoMarker, veThe, veTruc, duongGap, veBang } from './hinh-mba.js';
import { thongSoMay } from './thi-nghiem.js';
import { cheDoLamViec, hieuSuat, betaToiUu, tonHaoDong, dienApTheoNac } from './che-do.js';
import { dinhDangSo } from './tinh-toan.js';
import { soCoNghia, veCongThuc } from './tien-ich.js';

const so = (x, k = 3) => soCoNghia(x, k);
const kW = (x) => (Math.abs(x) >= 1000 ? `${so(x / 1000, 4)} kW` : `${so(x)} W`);
const kVAr = (x) => (Math.abs(x) >= 1000 ? `${so(x / 1000, 4)} kVAr` : `${so(x)} VAr`);
const MAU = { P: '#2a78d6', Q: '#7b2cbf', mat: '#d62828' };

/** Mũi tên dải (giản đồ năng lượng): từ x0 đến x1 tại tâm y, độ dày h. */
function dai(x0, x1, y, h) {
  const m = Math.min(26, h / 2 + 10);
  return `M${x0} ${y - h / 2} H${x1 - m} L${x1} ${y} L${x1 - m} ${y + h / 2} H${x0} Z`;
}
/** Nhánh tổn hao rẽ xuống từ dải chính tại x, độ dày h, dài d. */
function nhanhXuong(x, y, h, d) {
  return `M${x} ${y} C${x + 30} ${y} ${x + 50} ${y + 20} ${x + 50} ${y + 50} V${y + d - 14} L${x + 50 + h / 2 + 10} ${y + d - 14} L${x + 50} ${y + d} L${x + 50 - h / 2 - 10} ${y + d - 14} L${x + 50 - h / 2} ${y + d - 14} V${y + 50} C${x + 50 - h / 2} ${y + 30} ${x + 30 - h / 2} ${y + h} ${x} ${y + h} Z`;
}

function veSanKhau(svg) {
  svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  taoMarker(defs, 'mui-den', '#13202b');
  el('rect', { x: -2000, y: -1200, width: 5600, height: 3300, class: 'nen-san-khau' }, svg);
  const r = { a: {}, b: {}, c: {} };

  // ======================= A: GIẢN ĐỒ NĂNG LƯỢNG =======================
  const gA = el('g', {}, svg);
  r.a.g = gA;
  for (const [k, y0, ten, mau] of [['P', 20, 'Công suất tác dụng P (slide 59)', MAU.P], ['Q', 460, 'Công suất phản kháng Q', MAU.Q]]) {
    const g = veThe(gA, 20, y0, 1000, 420, ten);
    const o = { y: y0 + 185 };
    // từ thông Φ tượng trưng giữa hai dây quấn
    for (let i = 0; i < 5; i++) el('line', { x1: 470, x2: 530, y1: y0 + 140 + i * 22, y2: y0 + 140 + i * 22, class: 'vec', stroke: '#90a4ae', 'stroke-width': 2, 'marker-end': 'url(#mui-den)' }, g);
    el('text', { x: 450, y: y0 + 150, class: 'nhan-dai-luong mau-phi', 'text-anchor': 'end' }, g).textContent = 'Φ';
    o.dai1 = el('path', { fill: mau, opacity: 0.8 }, g);
    o.dai2 = el('path', { fill: mau, opacity: 0.8 }, g);
    o.dai3 = el('path', { fill: mau, opacity: 0.8 }, g);
    o.n1 = el('path', { fill: MAU.mat, opacity: 0.75 }, g);
    o.nFe = el('path', { fill: MAU.mat, opacity: 0.75 }, g);
    o.n2 = el('path', { fill: MAU.mat, opacity: 0.75 }, g);
    o.c1 = el('text', { x: 44, y: y0 + 84, class: 'chu-kq dam' }, g);
    o.c1b = el('text', { x: 44, y: y0 + 110, class: 'chu-svg' }, g);
    o.cDt = el('text', { x: 560, y: y0 + 84, class: 'chu-svg dam' }, g);
    o.c2 = el('text', { x: 996, y: y0 + 84, class: 'chu-kq dam', 'text-anchor': 'end' }, g);
    o.c2b = el('text', { x: 996, y: y0 + 110, class: 'chu-svg', 'text-anchor': 'end' }, g);
    o.m1 = el('text', { x: 280, y: y0 + 380, class: 'chu-svg', 'text-anchor': 'middle' }, g);
    o.mFe = el('text', { x: 540, y: y0 + 380, class: 'chu-svg', 'text-anchor': 'middle' }, g);
    o.m2 = el('text', { x: 800, y: y0 + 380, class: 'chu-svg', 'text-anchor': 'middle' }, g);
    o.ghi = el('text', { x: 996, y: y0 + 406, class: 'nho-xam', 'text-anchor': 'end' }, g);
    o.hat = Array.from({ length: 18 }, () => el('circle', { r: 4, fill: '#fff', opacity: 0.85 }, g));
    r.a[k] = o;
  }
  const gN = veThe(gA, 1040, 20, 540, 860, 'Cân bằng công suất (3 pha)');
  r.a.bang = veBang(gN, 1056, 70, [{ w: 170 }, { w: 170, canh: 'end' }, { w: 168, canh: 'end' }], 44, ['Thành phần', 'P', 'Q'], 7);
  r.a.nx = Array.from({ length: 8 }, (_, k) => el('text', { x: 1064, y: 460 + k * 34, class: 'chu-svg' }, gN));

  // ======================= B: ĐỘ THAY ĐỔI ĐIỆN ÁP =======================
  const gB = el('g', {}, svg);
  r.b.g = gB;
  const b1 = veThe(gB, 20, 20, 760, 560, 'ΔU% = f(β) khi cosφ₂ = const');
  r.b.t1 = veTruc(b1, { x0: 100, x1: 750, y0: 90, y1: 520, xMin: 0, xMax: 1.2, yMin: -4, yMax: 6 }, {
    nhanX: [[0, '0'], [0.2, '0,2'], [0.4, '0,4'], [0.6, '0,6'], [0.8, '0,8'], [1, '1'], [1.2, '1,2 β']],
    nhanY: [[-4, '−4'], [-2, '−2'], [0, '0'], [2, '2'], [4, '4'], [6, '6 %']],
  });
  r.b.duong1 = [['cam', 0.7, '#d62828', 'cosφ₂ = 0,7 (φ₂ > 0)'], ['tro', 1, '#13202b', 'cosφ₂ = 1'], ['dung', 0.7, '#2a78d6', 'cosφ₂ = 0,7 (φ₂ < 0)']].map(([tc, c, mau, ten]) => ({
    tc, c, ten, d: el('path', { class: 'duong-dt', stroke: mau }, b1), chu: el('text', { class: 'chu-truc-dt', fill: mau }, b1),
  }));
  r.b.dChon = el('path', { class: 'duong-dt', stroke: '#f2a900', 'stroke-dasharray': '8 5' }, b1);
  r.b.cham1 = el('circle', { r: 7, fill: '#f2a900', class: 'cham-dt' }, b1);
  const b2 = veThe(gB, 800, 20, 780, 560, 'ΔU% = f(cosφ₂) khi β = const');
  r.b.t2 = veTruc(b2, { x0: 880, x1: 1560, y0: 90, y1: 520, xMin: -1, xMax: 1, yMin: -6, yMax: 6 }, {
    nhanX: [[-1, '0'], [-0.6, '0,4'], [-0.2, '0,8'], [0, '1'], [0.2, '0,8'], [0.6, '0,4'], [1, '0']],
    nhanY: [[-6, '−6'], [-3, '−3'], [0, '0'], [3, '3'], [6, '6 %']],
  });
  el('text', { x: 900, y: 110, class: 'chu-svg dam' }, b2).textContent = '← φ₂ < 0 (tải dung)';
  el('text', { x: 1540, y: 504, class: 'chu-svg dam', 'text-anchor': 'end' }, b2).textContent = 'φ₂ > 0 (tải cảm) →';
  r.b.d2 = el('path', { class: 'duong-dt', stroke: '#7b2cbf' }, b2);
  r.b.cham2 = el('circle', { r: 7, fill: '#f2a900', class: 'cham-dt' }, b2);
  const b3 = veThe(gB, 20, 600, 1560, 290, 'Điều chỉnh điện áp bằng đầu phân áp phía CA (slide 62)');
  r.b.nac = [];
  r.b.U2s = [];
  for (let k = 0; k < 5; k++) {
    const x = 60 + k * 190;
    const g = el('g', { class: 'chip-btn', 'data-nac': k }, b3);
    el('rect', { x, y: 680, width: 170, height: 56, rx: 10 }, g);
    r.b.nac.push({ g, chu: el('text', { x: x + 85, y: 714, 'text-anchor': 'middle' }, g) });
    r.b.U2s.push(el('text', { x: x + 85, y: 770, class: 'chu-kq', 'text-anchor': 'middle' }, b3));
  }
  el('text', { x: 60, y: 668, class: 'chu-svg' }, b3).textContent = 'Chọn nấc (số vòng w₁ thay đổi):';
  el('text', { x: 60, y: 806, class: 'nho-xam' }, b3).textContent = 'Điện áp dây thứ cấp khi có tải ứng với từng nấc (U₁ = U₁đm, cùng tải).';
  r.b.ketQua = [0, 1, 2, 3].map((k) => el('text', { x: 1040, y: 690 + k * 40, class: k === 3 ? 'chu-kq dam' : 'chu-svg' }, b3));

  // ======================= C: HIỆU SUẤT =======================
  const gC = el('g', {}, svg);
  r.c.g = gC;
  const c1 = veThe(gC, 20, 20, 1000, 430, 'Tổn hao theo hệ số tải β (3 pha)');
  r.c.t1 = veTruc(c1, { x0: 110, x1: 980, y0: 90, y1: 400, xMin: 0, xMax: 1.2, yMin: 0, yMax: 10000 }, {
    nhanX: [[0, '0'], [0.2, '0,2'], [0.4, '0,4'], [0.6, '0,6'], [0.8, '0,8'], [1, '1'], [1.2, '1,2 β']],
    nhanY: [[0, '0'], [2500, '2,5 kW'], [5000, '5 kW'], [7500, '7,5 kW'], [10000, '10 kW']],
  });
  r.c.dFe = el('path', { class: 'duong-dt', stroke: '#7b2cbf' }, c1);
  r.c.dCu = el('path', { class: 'duong-dt', stroke: '#eb6834' }, c1);
  r.c.dTong = el('path', { class: 'duong-dt', stroke: '#13202b', 'stroke-dasharray': '8 5' }, c1);
  [['pFe ≈ P₀', '#7b2cbf'], ['pCu = β²Pn', '#eb6834'], ['Σp', '#13202b']].forEach(([t, mau], k) => {
    el('rect', { x: 600 + k * 130, y: 50, width: 18, height: 6, fill: mau }, c1);
    el('text', { x: 624 + k * 130, y: 58, class: 'chu-truc-dt' }, c1).textContent = t;
  });
  r.c.vachToiUu1 = el('line', { y1: 90, y2: 400, class: 'duong-cham', stroke: '#2e7d32' }, c1);
  r.c.con1 = el('circle', { r: 7, fill: '#eb6834', class: 'cham-dt' }, c1);
  const c2 = veThe(gC, 20, 470, 1000, 420, 'Hiệu suất η% theo hệ số tải β');
  r.c.t2 = veTruc(c2, { x0: 110, x1: 980, y0: 540, y1: 850, xMin: 0, xMax: 1.2, yMin: 96, yMax: 99.2 }, {
    nhanX: [[0, '0'], [0.2, '0,2'], [0.4, '0,4'], [0.6, '0,6'], [0.8, '0,8'], [1, '1'], [1.2, '1,2 β']],
    nhanY: [[96, '96'], [97, '97'], [98, '98'], [99, '99 %']],
  });
  r.c.dEta = el('path', { class: 'duong-dt', stroke: '#2e7d32' }, c2);
  r.c.vachToiUu2 = el('line', { y1: 540, y2: 850, class: 'duong-cham' }, c2);
  r.c.chuToiUu = el('text', { y: 530, class: 'chu-svg dam', 'text-anchor': 'middle' }, c2);
  r.c.con2 = el('circle', { r: 7, fill: '#2e7d32', class: 'cham-dt' }, c2);
  const c3 = veThe(gC, 1040, 20, 540, 870, 'Tại hệ số tải đã chọn');
  r.c.dong = Array.from({ length: 16 }, (_, k) => el('text', { x: 1064, y: 100 + k * 38, class: 'chu-svg' }, c3));
  return r;
}

async function khoiDong() {
  const kq = await napBai('du-lieu/che-do-lam-viec.json', 'du-lieu/cau-hoi-che-do-lam-viec.json');
  if (!kq) return;
  const [nd, cauHoi] = kq;
  const svg = $('#so-do');
  const r = veSanKhau(svg);
  const md = nd.macDinh;
  const s = { kichBan: md.kichBan, dangChay: true, tocDo: 1, t: 0, may: md.may, beta: md.beta, cosPhi2: md.cosPhi2, tinhChat: md.tinhChat, phongTo: md.phongTo, nac: 2 };
  const { datChay, chuThich, soLieuTC } = dieuKhienChung(s, (id) => chonKichBan(id));

  const lt = nd.lyThuyet;
  $('#the-ly-thuyet').innerHTML = `
    <p class="muc-nho">${lt.muc}</p>
    <h2>4.1. Giản đồ năng lượng của MBA</h2>
    <ul class="ghi-chu-ly-thuyet">${lt.nangLuong.map((x) => `<li>${x}</li>`).join('')}</ul>
    <h2>4.2. Độ thay đổi điện áp và cách điều chỉnh</h2>
    <p class="dong-ly-thuyet">${lt.dienAp}</p>
    <div class="cong-thuc" data-ct="0"></div>
    <ul class="ghi-chu-ly-thuyet">${lt.dieuChinh.map((x) => `<li>${x}</li>`).join('')}</ul>
    <h2>4.3. Tổn hao và hiệu suất</h2>
    ${lt.congThuc.slice(1).map((c, k) => `${c.chu ? `<p class="dong-ly-thuyet">${c.chu}</p>` : ''}<div class="cong-thuc" data-ct="${k + 1}"></div>`).join('')}
    <p class="ghi-chu-nho">${lt.kyHieuPFe}</p>`;
  const veLyThuyet = () => lt.congThuc.forEach((c, k) => veCongThuc($(`[data-ct="${k}"]`), c.tex, c.duPhong));
  veLyThuyet();
  if (!window.katex) document.querySelector('script[src*="katex"]')?.addEventListener('load', veLyThuyet, { once: true });

  const may = () => nd.may.find((m) => m.id === s.may);
  const mach = () => {
    const t = thongSoMay(may());
    return { t, p: { U1: t.U1p, I1dm: t.I1p, r1: t.rn / 2, x1: t.xn / 2, r2: t.rn / 2, x2: t.xn / 2, Rth: t.r0, Xth: t.x0 } };
  };
  const phi = (tc = s.tinhChat, c = s.cosPhi2) => (tc === 'cam' ? 1 : tc === 'dung' ? -1 : 0) * Math.acos(c);

  // ======================= A =======================
  function veGianDo(o, X1, Xdt, X2, m1, mFe, m2, donVi, ten) {
    // thang: X1 (đầu vào) dày 90 px; tổn hao phóng to s.phongTo lần
    const k = 90 / Math.max(Math.abs(X1), Math.abs(X2), 1);
    const h1 = Math.max(4, Math.abs(X1) * k);
    const hdt = Math.max(4, Math.abs(Xdt) * k);
    const h2 = Math.max(4, Math.abs(X2) * k);
    const y = o.y;
    o.dai1.setAttribute('d', dai(40, 300, y, h1));
    o.dai2.setAttribute('d', dai(300, 560, y, hdt));
    o.dai3.setAttribute('d', dai(560, 960, y, h2));
    // hướng: âm thì đảo chiều mũi tên (dòng công suất ngược)
    for (const [d, gt, x0, x1] of [[o.dai1, X1, 40, 300], [o.dai3, X2, 560, 960]]) {
      d.setAttribute('transform', gt < 0 ? `translate(${x0 + x1} 0) scale(-1 1)` : '');
    }
    const kM = k * s.phongTo;
    o.n1.setAttribute('d', nhanhXuong(230, y + h1 / 2 - Math.min(h1, Math.abs(m1) * kM), Math.min(60, Math.abs(m1) * kM), 125));
    o.nFe.setAttribute('d', nhanhXuong(490, y + hdt / 2 - Math.min(hdt, Math.abs(mFe) * kM), Math.min(60, Math.abs(mFe) * kM), 125));
    o.n2.setAttribute('d', nhanhXuong(750, y + hdt / 2 - Math.min(hdt, Math.abs(m2) * kM), Math.min(60, Math.abs(m2) * kM), 125));
    o.c1.textContent = `${ten}₁ = ${donVi(X1)}`;
    o.c2.textContent = `${ten}₂ = ${donVi(X2)}`;
    o.cDt.textContent = `${ten}đt = ${donVi(Xdt)}`;
    o.m1.textContent = ten === 'P' ? `pCu1 = ${donVi(m1)}` : `q₁ = ${donVi(m1)}`;
    o.mFe.textContent = ten === 'P' ? `pFe = ${donVi(mFe)}` : `qth = ${donVi(mFe)}`;
    o.m2.textContent = ten === 'P' ? `pCu2 = ${donVi(m2)}` : `q₂ = ${donVi(m2)}`;
    o.ghi.textContent = `Nhánh tổn hao phóng to ×${s.phongTo}`;
    o.kTocDo = { X1, X2 };
  }
  function capNhatA() {
    const { p } = mach();
    const c = cheDoLamViec(p, s.beta, phi());
    const n = (x) => 3 * x;
    const Pdt = c.P1 - c.pCu1 - c.pFe;
    const Qdt = c.Q1 - c.q1 - c.qth;
    veGianDo(r.a.P, n(c.P1), n(Pdt), n(c.P2), n(c.pCu1), n(c.pFe), n(c.pCu2), kW, 'P');
    veGianDo(r.a.Q, n(c.Q1), n(Qdt), n(c.Q2), n(c.q1), n(c.qth), n(c.q2), kVAr, 'Q');
    r.a.P.c1b.textContent = `cosφ₁ = ${so(Math.cos(c.phi1))}`;
    r.a.P.c2b.textContent = `cosφ₂ = ${dinhDangSo(s.cosPhi2, 2)}`;
    r.a.Q.c1b.textContent = c.Q1 >= 0 ? 'Q₁ > 0: nhận Q từ nguồn' : 'Q₁ < 0: trả Q về nguồn';
    r.a.Q.c2b.textContent = c.Q2 > 0 ? 'Q₂ > 0 (tải cảm)' : c.Q2 < 0 ? 'Q₂ < 0 (tải dung)' : 'Q₂ = 0';
    const ds = [
      ['Đầu vào', kW(n(c.P1)), kVAr(n(c.Q1))],
      ['Dây quấn SC', kW(n(c.pCu1)), kVAr(n(c.q1))],
      ['Lõi thép', kW(n(c.pFe)), kVAr(n(c.qth))],
      ['Điện từ', kW(n(Pdt)), kVAr(n(Qdt))],
      ['Dây quấn TC', kW(n(c.pCu2)), kVAr(n(c.q2))],
      ['Ra tải', kW(n(c.P2)), kVAr(n(c.Q2))],
      ['η%', `${so((c.P2 / c.P1) * 100, 4)} %`, ''],
    ];
    r.a.bang.o.forEach((h, i) => h.forEach((o, j) => { o.textContent = ds[i][j]; }));
    let ketLuan;
    if (s.tinhChat === 'cam') ketLuan = ['Tải cảm: φ₂ > 0 → Q₂ > 0, Q₁ > 0:', 'Q truyền từ sơ cấp sang thứ cấp.'];
    else if (s.tinhChat === 'tro') ketLuan = ['Tải thuần trở: Q₂ = 0; MBA vẫn lấy Q₁ > 0', 'từ nguồn để từ hóa và cho từ thông tản.'];
    else if (c.Q1 < 0) ketLuan = ['Tải dung, Q₁ < 0: công suất phản kháng', 'truyền từ thứ cấp sang sơ cấp.'];
    else ketLuan = ['Tải dung, Q₁ > 0: MBA lấy Q từ phía', 'sơ cấp và thứ cấp để từ hóa nó.'];
    const nx = [
      `${may().ten}`,
      `β = ${dinhDangSo(s.beta, 2)}, cosφ₂ = ${dinhDangSo(s.cosPhi2, 2)}`,
      '',
      ketLuan[0],
      ketLuan[1],
      '',
      `Σp = ${kW(n(c.pCu1 + c.pFe + c.pCu2))} = ${so((n(c.pCu1 + c.pFe + c.pCu2) / n(c.P1)) * 100)} % P₁`,
      'Tính theo sơ đồ thay thế hình T.',
    ];
    r.a.nx.forEach((o, i) => { o.textContent = nx[i]; o.setAttribute('class', i === 3 || i === 4 ? 'chu-kq dam' : 'chu-svg'); });
    $('#sl-1').textContent = `${kW(n(c.P1))}; ${kVAr(n(c.Q1))}`;
    $('#sl-2').textContent = `${kW(n(c.P2))}; ${kVAr(n(c.Q2))}`;
    $('#sl-3').textContent = `${so((c.P2 / c.P1) * 100, 4)} %`;
    chuThich(`P₁ = ${kW(n(c.P1))} → P₂ = ${kW(n(c.P2))}; Q₁ = <b>${kVAr(n(c.Q1))}</b>, Q₂ = <b>${kVAr(n(c.Q2))}</b>. ${ketLuan.join(' ')}`);
    soLieuTC(`P₁ = ${kW(n(c.P1))} · Q₁ = ${kVAr(n(c.Q1))} · P₂ = ${kW(n(c.P2))} · Q₂ = ${kVAr(n(c.Q2))}`);
  }

  // ======================= B =======================
  function capNhatB() {
    const { p, t } = mach();
    const dsB = Array.from({ length: 49 }, (_, i) => 0.0001 + i * 0.025);
    const { X, Y } = r.b.t1;
    const kep = (v) => Math.max(-4, Math.min(6, v));
    for (const d of r.b.duong1) {
      const ds = dsB.map((b) => [X(b), Y(kep(cheDoLamViec(p, b, phi(d.tc, d.c)).dU))]);
      d.d.setAttribute('d', duongGap(ds));
      d.chu.setAttribute('x', 560);
      d.chu.setAttribute('y', ds[34][1] + (d.tc === 'dung' ? 26 : -12));
      d.chu.textContent = d.ten;
    }
    r.b.dChon.setAttribute('d', duongGap(dsB.map((b) => [X(b), Y(kep(cheDoLamViec(p, b, phi()).dU))])));
    const c = cheDoLamViec(p, s.beta, phi());
    r.b.cham1.setAttribute('cx', X(s.beta)); r.b.cham1.setAttribute('cy', Y(kep(c.dU)));
    // ΔU theo cosφ2 (trục x: −1 … 0 tải dung, 0 … 1 tải cảm; |x| = 1 − cosφ2)
    const t2 = r.b.t2;
    const dsX = Array.from({ length: 81 }, (_, i) => -1 + i * 0.025);
    const dU = (x) => {
      const cos = Math.max(0.0001, 1 - Math.abs(x));
      return cheDoLamViec(p, Math.max(s.beta, 0.0001), (x < 0 ? -1 : 1) * Math.acos(cos)).dU;
    };
    r.b.d2.setAttribute('d', duongGap(dsX.map((x) => [t2.X(x), t2.Y(Math.max(-6, Math.min(6, dU(x))))])));
    const xChon = (s.tinhChat === 'dung' ? -1 : 1) * (s.tinhChat === 'tro' ? 0 : 1 - s.cosPhi2);
    r.b.cham2.setAttribute('cx', t2.X(xChon)); r.b.cham2.setAttribute('cy', t2.Y(Math.max(-6, Math.min(6, dU(xChon)))));
    // đầu phân áp
    const U2dm = may().U2;
    const U2tai = U2dm * (1 - c.dU / 100);
    let tot = 0;
    nd.nacPhanAp.forEach((nac, k) => {
      const u = dienApTheoNac(U2tai, nac);
      r.b.nac[k].chu.textContent = `${nac > 0 ? '+' : ''}${dinhDangSo(nac, 1)} %`;
      r.b.nac[k].g.classList.toggle('chon', k === s.nac);
      r.b.U2s[k].textContent = `${so(u, 4)} V`;
      if (Math.abs(dienApTheoNac(U2tai, nac) - U2dm) < Math.abs(dienApTheoNac(U2tai, nd.nacPhanAp[tot]) - U2dm)) tot = k;
    });
    const uChon = dienApTheoNac(U2tai, nd.nacPhanAp[s.nac]);
    r.b.ketQua[0].textContent = `Không tải: U₂₀ = ${U2dm} V; có tải: U₂ = ${so(U2tai, 4)} V (ΔU% = ${so(c.dU)} %)`;
    r.b.ketQua[1].textContent = `Nấc ${nd.nacPhanAp[s.nac] > 0 ? '+' : ''}${dinhDangSo(nd.nacPhanAp[s.nac], 1)} %: U₂ = ${so(uChon, 4)} V (lệch ${so(((uChon - U2dm) / U2dm) * 100)} % so với U₂đm)`;
    r.b.ketQua[2].textContent = 'Giảm w₁ (nấc âm) → tỉ số k giảm → U₂ tăng.';
    r.b.ketQua[3].textContent = `Nấc gần U₂đm nhất: ${nd.nacPhanAp[tot] > 0 ? '+' : ''}${dinhDangSo(nd.nacPhanAp[tot], 1)} %`;
    $('#sl-1').textContent = `${so(c.dU)} %`;
    $('#sl-2').textContent = `${so(U2tai, 4)} V`;
    $('#sl-3').textContent = `Un% = ${may().un} %`;
    void t;
    chuThich(`β = ${dinhDangSo(s.beta, 2)}, cosφ₂ = ${dinhDangSo(s.cosPhi2, 2)} (${s.tinhChat === 'cam' ? 'cảm' : s.tinhChat === 'dung' ? 'dung' : 'trở'}): <b>ΔU% = ${so(c.dU)} %</b>, U₂ = ${so(U2tai, 4)} V. ${c.dU < 0 ? 'Điện áp thứ cấp tăng khi có tải dung.' : ''}`);
    soLieuTC(`ΔU% = ${so(c.dU)} % · U₂ = ${so(U2tai, 4)} V · nấc ${dinhDangSo(nd.nacPhanAp[s.nac], 1)} % → ${so(uChon, 4)} V`);
  }
  svg.addEventListener('click', (e) => {
    const g = e.target.closest('[data-nac]');
    if (g && s.kichBan === 'dien-ap') { s.nac = Number(g.dataset.nac); capNhatB(); }
  });

  // ======================= C =======================
  function capNhatC() {
    const m = may();
    const S = m.S;
    const bTU = betaToiUu(m.P0, m.Pn);
    const { X, Y } = r.c.t1;
    const dsB = Array.from({ length: 61 }, (_, i) => i * 0.02);
    r.c.dFe.setAttribute('d', duongGap(dsB.map((b) => [X(b), Y(m.P0)])));
    r.c.dCu.setAttribute('d', duongGap(dsB.map((b) => [X(b), Y(Math.min(10000, tonHaoDong(b, m.Pn)))])));
    r.c.dTong.setAttribute('d', duongGap(dsB.map((b) => [X(b), Y(Math.min(10000, m.P0 + tonHaoDong(b, m.Pn)))])));
    r.c.vachToiUu1.setAttribute('x1', X(bTU)); r.c.vachToiUu1.setAttribute('x2', X(bTU));
    r.c.con1.setAttribute('cx', X(s.beta)); r.c.con1.setAttribute('cy', Y(Math.min(10000, tonHaoDong(s.beta, m.Pn))));
    const cos = s.tinhChat === 'tro' ? 1 : s.cosPhi2;
    const t2 = r.c.t2;
    r.c.dEta.setAttribute('d', duongGap(dsB.slice(1).map((b) => [t2.X(b), t2.Y(Math.max(96, hieuSuat(b, S, cos, m.P0, m.Pn).eta))])));
    r.c.vachToiUu2.setAttribute('x1', t2.X(bTU)); r.c.vachToiUu2.setAttribute('x2', t2.X(bTU));
    r.c.chuToiUu.setAttribute('x', t2.X(bTU));
    r.c.chuToiUu.textContent = `β = √(P₀/Pn) = ${so(bTU)}`;
    const h = hieuSuat(s.beta, S, cos, m.P0, m.Pn);
    const hMax = hieuSuat(bTU, S, cos, m.P0, m.Pn);
    r.c.con2.setAttribute('cx', t2.X(s.beta)); r.c.con2.setAttribute('cy', t2.Y(Math.max(96, h.eta)));
    const I2dm = S / (Math.sqrt(3) * m.U2);
    const dong = [
      `${m.ten} (${m.nguon})`,
      `P₀ = ${m.P0} W; Pn = ${m.Pn} W; cosφ₂ = ${dinhDangSo(cos, 2)}`,
      '',
      `β = ${dinhDangSo(s.beta, 2)} → I₂ = β·I₂đm = ${so(s.beta * I2dm, 4)} A`,
      `pFe ≈ P₀ = ${kW(m.P0)}`,
      `pCu = β²·Pn = ${kW(tonHaoDong(s.beta, m.Pn))}`,
      `Σp = ${kW(h.tong)}`,
      `P₂ = β·S·cosφ₂ = ${kW(h.P2)}`,
      `η% = P₂/(P₂ + Σp)·100 = ${so(h.eta, 4)} %`,
      '',
      `Hiệu suất cao nhất khi pFe = pCu:`,
      `β = √(P₀/Pn) = √(${m.P0}/${m.Pn}) = ${so(bTU)}`,
      `I₂ = ${so(bTU)}·${so(I2dm, 4)} = ${so(bTU * I2dm, 4)} A`,
      `ηmax = ${so(hMax.eta, 4)} %`,
      m.id === 'bt2' ? 'Slide 79 ghi β = 0,294 (nhầm số học),' : '',
      m.id === 'bt2' ? 'đúng là β ≈ 0,503, I₂ ≈ 457,7 A.' : '',
    ];
    r.c.dong.forEach((o, i) => { o.textContent = dong[i]; o.setAttribute('class', i === 8 || i === 11 || i === 13 ? 'chu-kq dam' : i >= 14 ? 'chu-kq xau' : 'chu-svg'); });
    $('#sl-1').textContent = `${so(h.eta, 4)} %`;
    $('#sl-2').textContent = kW(h.tong);
    $('#sl-3').textContent = so(bTU);
    chuThich(`β = ${dinhDangSo(s.beta, 2)}: Σp = ${kW(h.tong)}, <b>η = ${so(h.eta, 4)} %</b>. Hiệu suất cao nhất <b>${so(hMax.eta, 4)} %</b> tại β = √(P₀/Pn) = ${so(bTU)} (pFe = pCu).`);
    soLieuTC(`β = ${dinhDangSo(s.beta, 2)} · η = ${so(h.eta, 4)} % · βtối ưu = ${so(bTU)}`);
  }

  // ---------- Điều khiển ----------
  const NHAN = {
    'nang-luong': ['P₁; Q₁ (3 pha)', 'P₂; Q₂ (3 pha)', 'Hiệu suất η'],
    'dien-ap': ['ΔU%', 'U₂ khi có tải', 'Điện áp ngắn mạch'],
    'hieu-suat': ['Hiệu suất η', 'Tổng tổn hao Σp', 'β tối ưu'],
  };
  function capNhat() {
    NHAN[s.kichBan].forEach((t, k) => { $(`#sl-${k + 1}`).previousElementSibling.textContent = t; });
    if (s.kichBan === 'nang-luong') capNhatA();
    if (s.kichBan === 'dien-ap') capNhatB();
    if (s.kichBan === 'hieu-suat') capNhatC();
  }
  function chonKichBan(id) {
    s.kichBan = id;
    hienKichBan(id, { 'nang-luong': r.a.g, 'dien-ap': r.b.g, 'hieu-suat': r.c.g });
    veDieuKhien();
    capNhat();
  }
  function veDieuKhien() {
    $('#dieu-khien-kich-ban').innerHTML = `
      <label class="dieu-khien doc"><span>Máy</span> <select id="cd-may">${nd.may.map((m) => `<option value="${m.id}" ${m.id === s.may ? 'selected' : ''}>${m.ten}</option>`).join('')}</select><span></span></label>
      <label class="dieu-khien doc"><span>Hệ số tải β</span> <input type="range" id="cd-beta" min="0.05" max="1.2" step="0.05" value="${s.beta}"><output id="cd-beta-gt">${dinhDangSo(s.beta, 2)}</output></label>
      <label class="dieu-khien doc"><span>cosφ₂</span> <input type="range" id="cd-cos" min="0.2" max="1" step="0.05" value="${s.cosPhi2}"><output id="cd-cos-gt">${dinhDangSo(s.cosPhi2, 2)}</output></label>
      <div class="hang-nut">${[['cam', 'Tải cảm'], ['tro', 'Thuần trở'], ['dung', 'Tải dung']].map(([v, t]) => `<button type="button" class="nut" data-tc="${v}" aria-pressed="${s.tinhChat === v}">${t}</button>`).join('')}</div>
      ${s.kichBan === 'nang-luong' ? `<label class="dieu-khien doc"><span>Phóng to tổn hao</span> <input type="range" id="cd-pt" min="1" max="40" step="1" value="${s.phongTo}"><output id="cd-pt-gt">×${s.phongTo}</output></label>` : ''}
      <p class="ghi-chu-nho">Máy dựng từ số liệu đề bài tập (P₀, Pn, i₀%, Un%); tính một pha theo sơ đồ hình T, nhân 3.</p>`;
    $('#cd-may').addEventListener('change', (e) => { s.may = e.target.value; capNhat(); });
    $('#cd-beta').addEventListener('input', (e) => { s.beta = Number(e.target.value); $('#cd-beta-gt').textContent = dinhDangSo(s.beta, 2); capNhat(); });
    $('#cd-cos').addEventListener('input', (e) => { s.cosPhi2 = Number(e.target.value); $('#cd-cos-gt').textContent = dinhDangSo(s.cosPhi2, 2); capNhat(); });
    $('#cd-pt')?.addEventListener('input', (e) => { s.phongTo = Number(e.target.value); $('#cd-pt-gt').textContent = `×${s.phongTo}`; capNhat(); });
    document.querySelectorAll('[data-tc]').forEach((b) => b.addEventListener('click', () => {
      s.tinhChat = b.dataset.tc;
      document.querySelectorAll('[data-tc]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      capNhat();
    }));
  }

  trinhChieuVaCauHoi(nd, cauHoi, (id, b) => {
    const tt = b?.trangThai;
    if (!tt) return;
    if (tt.tinhChat) s.tinhChat = tt.tinhChat;
    if (tt.cosPhi2 !== undefined) s.cosPhi2 = tt.cosPhi2;
    chonKichBan(tt.kichBan);
  }, datChay, s);

  // hạt chạy dọc dải công suất (theo chiều dòng công suất)
  vongLap(s, (dt) => {
    s.t += dt;
    if (s.kichBan !== 'nang-luong') return;
    for (const o of [r.a.P, r.a.Q]) {
      if (!o.kTocDo) continue;
      o.hat.forEach((h, k) => {
        const u = (k / o.hat.length + s.t * 0.12) % 1;
        const x = 40 + u * 900;
        const chieu = x < 300 ? Math.sign(o.kTocDo.X1) : x > 560 ? Math.sign(o.kTocDo.X2) : Math.sign(o.kTocDo.X1 || 1);
        h.setAttribute('cx', (chieu >= 0 ? x : 980 - x).toFixed(1));
        h.setAttribute('cy', o.y.toFixed(1));
      });
    }
  });

  chonKichBan(s.kichBan);
  document.body.classList.add('da-san-sang');
}

chayTrang(khoiDong);
