/**
 * thi-nghiem-mba.js — Trang 3.4 "Thí nghiệm xác định thông số của MBA" (slide 54–57).
 *
 * Kịch bản a (khong-tai): phòng thí nghiệm ảo không tải – đo U1, I0, P0, U20, tính k, i0%, r0, z0, x0, cosφ0.
 * Kịch bản b (ngan-mach): thí nghiệm ngắn mạch – đo Un, In, Pn, tính zn, rn, xn, Un%, Unr%, Unx%, cosφn.
 * Kịch bản c (ket-qua): thông số sơ đồ thay thế từ hai thí nghiệm, so với lời giải slide 84.
 * Máy ảo dựng từ số liệu đề (bài tập 4, bài tập 2), mô hình tuyến tính, đo một pha.
 */
import { el } from './so-do.js';
import { $, napBai, dieuKhienChung, trinhChieuVaCauHoi, vongLap, chayTrang, hienKichBan } from './khung-trang.js';
import { taoMarker, veThe, veTruc, duongGap, veBang, veDongHoDo, veDienTro, veCuonCam, veCuonDung } from './hinh-mba.js';
import { thongSoMay, doKhongTai, doNganMach, tinhKhongTai, tinhNganMach } from './thi-nghiem.js';
import { dinhDangSo } from './tinh-toan.js';
import { soCoNghia, veCongThuc } from './tien-ich.js';

const so = (x, k = 3) => soCoNghia(x, k);
const V = (x) => (x >= 1000 ? `${so(x / 1000, 4)} kV` : `${so(x)} V`);
const Ohm = (x) => `${x >= 1000 ? dinhDangSo(x, 0) : so(x)} Ω`;

/** Bàn thí nghiệm: bộ điều chỉnh, ampe kế, oát kế, vôn kế, MBA, phía thứ cấp hở mạch hoặc nối tắt qua ampe kế. */
function veBanThiNghiem(g, nganMach) {
  const T = 180;
  const B = 400;
  el('rect', { x: 46, y: T - 10, width: 124, height: B - T + 20, rx: 10, class: 'hop-dieu-chinh' }, g);
  ['Bộ', 'điều chỉnh', 'điện áp'].forEach((t, k) => { el('text', { x: 108, y: 230 + k * 24, class: 'chu-svg', 'text-anchor': 'middle' }, g).textContent = t; });
  el('circle', { cx: 108, cy: 340, r: 24, class: 'num-dieu-chinh' }, g);
  const kim = el('line', { x1: 108, y1: 340, x2: 108, y2: 320, class: 'kim-num' }, g);
  el('path', { d: `M170 ${T} H${560} M170 ${B} H${560}`, class: 'day-mach' }, g);
  el('path', { d: `M470 ${T} V250 M470 320 V${B}`, class: 'day-mach' }, g);
  for (const [x, y] of [[470, T], [470, B]]) el('circle', { cx: x, cy: y, r: 5, class: 'diem-noi' }, g);
  const A = veDongHoDo(g, 250, T, 'A', 32);
  el('rect', { x: 330, y: T - 28, width: 64, height: 56, rx: 8, class: 'vo-dong-ho' }, g);
  el('text', { x: 362, y: T + 9, class: 'chu-dong-ho', 'text-anchor': 'middle' }, g).textContent = 'W';
  const V1 = veDongHoDo(g, 470, 285, 'V', 32);
  // MBA
  el('rect', { x: 606, y: 150, width: 12, height: 280, class: 'loi-thep-ab' }, g);
  el('rect', { x: 632, y: 150, width: 12, height: 280, class: 'loi-thep-ab' }, g);
  veCuonDung(g, 576, 596, 200, 380, 8, 'cuon-day so-cap');
  veCuonDung(g, 654, 674, 200, 380, 8, 'cuon-day thu-cap');
  el('path', { d: `M560 ${T} H586 V193 M560 ${B} H586 V387`, class: 'day-mach' }, g);
  el('path', { d: `M686 193 V${T} H820 V250 M686 387 V${B} H820 V320`, class: 'day-mach' }, g);
  const V2 = veDongHoDo(g, 820, 285, nganMach ? 'A2' : 'V2', 32);
  const chu = {};
  for (const [k, x, y, canh] of [['A', 250, 236, 'middle'], ['W', 362, 236, 'middle'], ['V1', 470, 350, 'middle'], ['V2', 820, 350, 'middle']]) {
    chu[k] = el('text', { x, y, class: 'chu-dong-ho-gt', 'text-anchor': canh }, g);
  }
  el('text', { x: 600, y: 456, class: 'chu-svg', 'text-anchor': 'middle' }, g).textContent = nganMach ? 'thứ cấp nối tắt qua ampe kế A2' : 'thứ cấp hở mạch: I₂ = 0';
  return { A, V1, V2, kim, chu };
}

function veSanKhau(svg) {
  svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  taoMarker(defs, 'mui-den', '#13202b');
  el('rect', { x: -2000, y: -1200, width: 5600, height: 3300, class: 'nen-san-khau' }, svg);
  const r = { a: {}, b: {}, c: {} };
  for (const [ma, nm, ten] of [['a', false, 'a. Thí nghiệm không tải (slide 54)'], ['b', true, 'b. Thí nghiệm ngắn mạch (slide 56)']]) {
    const gK = el('g', {}, svg);
    r[ma].g = gK;
    const g1 = veThe(gK, 20, 20, 1000, 480, ten);
    r[ma].ban = veBanThiNghiem(g1, nm);
    r[ma].trangThai = el('text', { x: 996, y: 60, class: 'chu-kq', 'text-anchor': 'end' }, g1);
    const g2 = veThe(gK, 20, 520, 1000, 370, nm ? 'In, Pn theo Un (% U₁đm)' : 'I₀, P₀ theo U₁ (% U₁đm)');
    r[ma].truc = veTruc(g2, { x0: 110, x1: 980, y0: 600, y1: 840, xMin: 0, xMax: nm ? 6 : 110, yMin: 0, yMax: 130 }, {
      nhanX: nm ? [[0, '0'], [1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5'], [6, '6 %']] : [[0, '0'], [20, '20'], [40, '40'], [60, '60'], [80, '80'], [100, '100'], [110, '110 %']],
      nhanY: [[0, '0'], [50, '50'], [100, '100 %']],
    });
    r[ma].d1 = el('path', { class: 'duong-dt', stroke: '#eb6834' }, g2);
    r[ma].d2 = el('path', { class: 'duong-dt', stroke: '#7b2cbf' }, g2);
    r[ma].cham1 = el('circle', { r: 7, fill: '#eb6834', class: 'cham-dt' }, g2);
    r[ma].cham2 = el('circle', { r: 7, fill: '#7b2cbf', class: 'cham-dt' }, g2);
    r[ma].vachDm = el('line', { y1: 600, y2: 840, class: 'duong-cham' }, g2);
    [[nm ? 'In' : 'I₀', '#eb6834'], [nm ? 'Pn' : 'P₀', '#7b2cbf']].forEach(([t, mau], k) => {
      el('rect', { x: 560 + k * 110, y: 566, width: 18, height: 6, fill: mau }, g2);
      el('text', { x: 584 + k * 110, y: 574, class: 'chu-truc-dt' }, g2).textContent = t;
      if (k) el('text', { x: 980, y: 574, class: 'chu-truc-dt', 'text-anchor': 'end' }, g2).textContent = '(% giá trị định mức)';
    });
    const g3 = veThe(gK, 1040, 20, 540, 870, 'Tính thông số (một pha)');
    r[ma].bang = veBang(g3, 1056, 70, [{ w: 150 }, { w: 220 }, { w: 138, canh: 'end' }], 44, ['Thông số', 'Công thức', 'Giá trị'], nm ? 10 : 7);
    r[ma].ghi = [0, 1, 2, 3].map((k) => el('text', { x: 1064, y: (nm ? 600 : 460) + k * 34, class: 'chu-svg' }, g3));
  }

  // ======================= C: KẾT QUẢ =======================
  const gC = el('g', {}, svg);
  r.c.g = gC;
  const c1 = veThe(gC, 20, 20, 1000, 870, 'Sơ đồ thay thế với thông số từ hai thí nghiệm');
  const T = 260;
  const B = 560;
  el('path', { d: `M80 ${T} H150 M196 ${T} H230 M276 ${T} H480 M480 ${T} V320 M480 366 V380 M480 426 V${B} M480 ${T} H560 M606 ${T} H640 M686 ${T} H900 M900 ${T} V${B} H80`, class: 'day-mach' }, c1);
  for (const y of [T, B]) el('circle', { cx: 80, cy: y, r: 6, class: 'diem-cuc' }, c1);
  el('text', { x: 60, y: (T + B) / 2 + 6, class: 'nhan-lk', 'text-anchor': 'end' }, c1).textContent = 'U₁';
  veCuonCam(c1, 150, T, 46);
  veDienTro(c1, 230, T, 46);
  veDienTro(c1, 480, 320, 46, true);
  veCuonCam(c1, 480, 380, 46, true);
  veDienTro(c1, 560, T, 46);
  veCuonCam(c1, 640, T, 46);
  el('text', { x: 910, y: (T + B) / 2 + 6, class: 'nhan-lk' }, c1).textContent = 'Z′t';
  r.c.nhan = {
    x1: el('text', { x: 173, y: T - 46, class: 'nhan-lk', 'text-anchor': 'middle' }, c1),
    r1: el('text', { x: 253, y: T - 18, class: 'nhan-lk', 'text-anchor': 'middle' }, c1),
    r0: el('text', { x: 500, y: 349, class: 'nhan-lk' }, c1),
    x0: el('text', { x: 500, y: 409, class: 'nhan-lk' }, c1),
    r2: el('text', { x: 583, y: T - 18, class: 'nhan-lk', 'text-anchor': 'middle' }, c1),
    x2: el('text', { x: 663, y: T - 46, class: 'nhan-lk', 'text-anchor': 'middle' }, c1),
  };
  el('text', { x: 420, y: 160, class: 'chu-svg dam', 'text-anchor': 'middle' }, c1).textContent = 'r₁, x₁, r′₂, x′₂: từ thí nghiệm ngắn mạch (rn/2, xn/2)';
  el('text', { x: 480, y: 620, class: 'chu-svg dam', 'text-anchor': 'middle' }, c1).textContent = 'nhánh từ hóa: từ thí nghiệm không tải (Rth ≈ r₀, Xth ≈ x₀ như slide 84)';
  r.c.ghi = [0, 1, 2, 3].map((k) => el('text', { x: 44, y: 700 + k * 34, class: 'chu-svg' }, c1));
  const c2 = veThe(gC, 1040, 20, 540, 870, 'So với lời giải slide 84');
  r.c.bang = veBang(c2, 1056, 70, [{ w: 110 }, { w: 200, canh: 'end' }, { w: 198, canh: 'end' }], 46, ['', 'Thí nghiệm ảo', 'Slide 84'], 9);
  r.c.nx = [0, 1, 2, 3, 4].map((k) => el('text', { x: 1064, y: 560 + k * 32, class: 'chu-svg' }, c2));
  return r;
}

async function khoiDong() {
  const kq = await napBai('du-lieu/thi-nghiem-mba.json', 'du-lieu/cau-hoi-thi-nghiem-mba.json');
  if (!kq) return;
  const [nd, cauHoi] = kq;
  const svg = $('#so-do');
  const r = veSanKhau(svg);
  const s = { kichBan: nd.macDinh.kichBan, dangChay: true, tocDo: 1, t: 0, may: nd.macDinh.may, uKT: 1, uNM: 1, kimA: {} };
  const { datChay, chuThich, soLieuTC } = dieuKhienChung(s, (id) => chonKichBan(id));

  const lt = nd.lyThuyet;
  $('#the-ly-thuyet').innerHTML = `
    <p class="muc-nho">${lt.muc}</p>
    <h2>3.4. Thí nghiệm xác định thông số của MBA</h2>
    <p class="dong-ly-thuyet"><b>a.</b> ${lt.khongTai}</p>
    <p class="dong-ly-thuyet"><b>b.</b> ${lt.nganMach}</p>
    ${lt.congThuc.map((c, k) => `${c.chu ? `<p class="dong-ly-thuyet">${c.chu}</p>` : ''}<div class="cong-thuc" data-ct="${k}"></div>`).join('')}`;
  const veLyThuyet = () => lt.congThuc.forEach((c, k) => veCongThuc($(`[data-ct="${k}"]`), c.tex, c.duPhong));
  veLyThuyet();
  if (!window.katex) document.querySelector('script[src*="katex"]')?.addEventListener('load', veLyThuyet, { once: true });

  const may = () => nd.may.find((m) => m.id === s.may);
  const thongSo = () => thongSoMay(may());

  // ======================= A: KHÔNG TẢI =======================
  function capNhatA() {
    const p = thongSo();
    const d = doKhongTai(p, s.uKT * p.U1p);
    const ban = r.a.ban;
    s.kimA = { A: d.I0 / (p.I0p * 1.25), V1: s.uKT / 1.25, V2: s.uKT / 1.25 };
    ban.chu.A.textContent = `I₀ = ${so(d.I0)} A`;
    ban.chu.W.textContent = `P₀ = ${so(d.P0)} W`;
    ban.chu.V1.textContent = `U₁ = ${V(d.U1)}`;
    ban.chu.V2.textContent = `U₂₀ = ${V(d.U20)}`;
    ban.kim.setAttribute('transform', `rotate(${(s.uKT * 240 - 120).toFixed(1)} 108 340)`);
    const dung = Math.abs(s.uKT - 1) < 0.005;
    r.a.trangThai.textContent = dung ? '✓ U₁ = U₁đm – đọc số liệu' : `U₁ = ${dinhDangSo(s.uKT * 100, 0)} % U₁đm – cần đặt U₁ = U₁đm`;
    r.a.trangThai.setAttribute('class', `chu-kq ${dung ? 'dam' : 'xau'}`);
    const k = tinhKhongTai({ U1dm: d.U1, I0: d.I0, P0: d.P0, U20: d.U20, I1dm: p.I1p });
    const ds = [
      ['k', 'U₁đm/U₂₀', so(k.k)],
      ['i₀%', 'I₀/I₁đm·100', `${so(k.i0)} %`],
      ['r₀', 'P₀/I₀²', Ohm(k.r0)],
      ['z₀', 'U₁đm/I₀', Ohm(k.z0)],
      ['x₀', '√(z₀² − r₀²)', Ohm(k.x0)],
      ['cosφ₀', 'P₀/(U₁đm·I₀)', so(k.cos0)],
      ['P₀ ba pha', '3·P₀ (pha)', `${so(3 * d.P0)} W`],
    ];
    r.a.bang.o.forEach((h, i) => h.forEach((o, j) => { o.textContent = ds[i][j]; }));
    const m = may();
    r.a.ghi[0].textContent = `${m.ten} (${m.nguon})`;
    r.a.ghi[1].textContent = `Một pha: U₁đm = ${V(p.U1p)}, I₁đm = ${so(p.I1p)} A`;
    r.a.ghi[2].textContent = dung ? `Kiểm tra: i₀% = ${so(k.i0)} % đúng bằng đề (${m.i0} %).` : 'Các giá trị chỉ đúng khi U₁ = U₁đm.';
    r.a.ghi[3].textContent = 'Mô hình tuyến tính: I₀ ∼ U₁, P₀ ∼ U₁².';
    veDoThi(r.a, (u) => doKhongTai(p, (u / 100) * p.U1p), (dd) => [dd.I0 / p.I0p, dd.P0 / (p.I0p ** 2 * p.r0)], s.uKT * 100, 110);
    $('#sl-u').textContent = `${dinhDangSo(s.uKT * 100, 0)} % U₁đm`;
    $('#sl-i').textContent = `${so(d.I0)} A`;
    $('#sl-p').textContent = `${so(d.P0)} W`;
    chuThich(dung
      ? `Không tải ở U₁đm: I₀ = <b>${so(d.I0)} A</b> (i₀% = ${so(k.i0)} %), P₀ = <b>${so(d.P0)} W/pha</b>, U₂₀ = ${V(d.U20)} → k = ${so(k.k)}, r₀ = ${Ohm(k.r0)}, z₀ = ${Ohm(k.z0)}, cosφ₀ = ${so(k.cos0)}.`
      : `U₁ = ${dinhDangSo(s.uKT * 100, 0)} % U₁đm: I₀ = ${so(d.I0)} A, P₀ = ${so(d.P0)} W. Tăng điện áp đến đúng U₁đm để đọc số liệu.`, dung ? 'thanh-cong' : '');
    soLieuTC(`U₁ = ${dinhDangSo(s.uKT * 100, 0)} % · I₀ = ${so(d.I0)} A · P₀ = ${so(d.P0)} W · U₂₀ = ${V(d.U20)}`);
  }

  // ======================= B: NGẮN MẠCH =======================
  function capNhatB() {
    const p = thongSo();
    const Un = s.uNM * p.Unp;
    const d = doNganMach(p, Un);
    const ban = r.b.ban;
    s.kimA = { A: d.In / (p.I1p * 1.25), V1: s.uNM / 1.25, V2: d.In / (p.I1p * 1.25) };
    ban.chu.A.textContent = `In = ${so(d.In)} A`;
    ban.chu.W.textContent = `Pn = ${so(d.Pn)} W`;
    ban.chu.V1.textContent = `Un = ${V(Un)}`;
    ban.chu.V2.textContent = `I₂ = ${so(d.I2)} A`;
    ban.kim.setAttribute('transform', `rotate(${(s.uNM * 100 - 120).toFixed(1)} 108 340)`);
    const dung = Math.abs(s.uNM - 1) < 0.005;
    const qua = s.uNM > 1.005;
    r.b.trangThai.textContent = dung ? '✓ In = I₁đm – đọc số liệu' : qua ? '⚠ In vượt I₁đm – giảm điện áp!' : `In = ${dinhDangSo(s.uNM * 100, 0)} % I₁đm – tăng từ từ`;
    r.b.trangThai.setAttribute('class', `chu-kq ${dung ? 'dam' : 'xau'}`);
    const k = tinhNganMach({ Un, In: d.In, Pn: d.Pn, U1dm: p.U1p });
    const ds = [
      ['zn', 'Un/In', Ohm(k.zn)],
      ['rn', 'Pn/In²', Ohm(k.rn)],
      ['xn', '√(zn² − rn²)', Ohm(k.xn)],
      ['r₁ ≈ r′₂', 'rn/2', Ohm(k.r1)],
      ['x₁ ≈ x′₂', 'xn/2', Ohm(k.x1)],
      ['Un%', 'Zn·I₁đm/U₁đm', `${so(k.un)} %`],
      ['Unr%', 'rn·I₁đm/U₁đm', `${so(k.unr)} %`],
      ['Unx%', 'xn·I₁đm/U₁đm', `${so(k.unx)} %`],
      ['cosφn', 'rn/Zn', so(k.zn ? k.rn / k.zn : 0)],
      ['Pn ba pha', '3·Pn (pha)', `${so(3 * d.Pn)} W`],
    ];
    r.b.bang.o.forEach((h, i) => h.forEach((o, j) => { o.textContent = ds[i][j]; }));
    const m = may();
    r.b.ghi[0].textContent = `${m.ten} (${m.nguon})`;
    r.b.ghi[1].textContent = `Un tại I₁đm = ${V(p.Unp)} = ${m.un} % U₁đm (một pha)`;
    r.b.ghi[2].textContent = 'Không đặt U₁đm vào máy đang nối tắt thứ cấp:';
    r.b.ghi[3].textContent = `dòng điện sẽ gấp ${so(100 / m.un)} lần định mức.`;
    veDoThi(r.b, (u) => doNganMach(p, (u / 100) * p.U1p), (dd) => [dd.In / p.I1p, dd.Pn / (p.I1p ** 2 * p.rn)], s.uNM * m.un, 6);
    r.b.vachDm.setAttribute('x1', r.b.truc.X(m.un));
    r.b.vachDm.setAttribute('x2', r.b.truc.X(m.un));
    $('#sl-u').textContent = `${V(Un)} (${dinhDangSo(s.uNM * m.un, 2)} %)`;
    $('#sl-i').textContent = `${so(d.In)} A`;
    $('#sl-p').textContent = `${so(d.Pn)} W`;
    chuThich(dung
      ? `Ngắn mạch ở In = I₁đm: Un = <b>${V(Un)}</b> (${m.un} % U₁đm), Pn = <b>${so(d.Pn)} W/pha</b> → zn = ${Ohm(k.zn)}, rn = ${Ohm(k.rn)}, xn = ${Ohm(k.xn)}, cosφn = ${so(k.rn / k.zn)}.`
      : qua ? `⚠ Dòng điện ngắn mạch ${so(d.In)} A đã vượt I₁đm = ${so(p.I1p)} A. Giảm điện áp!` : `Un = ${V(Un)}: In = ${so(d.In)} A. Tăng từ từ đến khi In = I₁đm.`, dung ? 'thanh-cong' : qua ? 'canh-bao' : '');
    soLieuTC(`Un = ${V(Un)} · In = ${so(d.In)} A · Pn = ${so(d.Pn)} W`);
  }

  /** Đồ thị hai đại lượng (% giá trị định mức) theo điện áp đặt (%). */
  function veDoThi(o, ham, tiLe, xHienTai, xMax) {
    const { X, Y } = o.truc;
    const ds = Array.from({ length: 56 }, (_, i) => (i / 55) * xMax);
    const gt = ds.map((x) => tiLe(ham(x)).map((v) => v * 100));
    o.d1.setAttribute('d', duongGap(ds.map((x, i) => [X(x), Y(Math.min(130, gt[i][0]))])));
    o.d2.setAttribute('d', duongGap(ds.map((x, i) => [X(x), Y(Math.min(130, gt[i][1]))])));
    const h = tiLe(ham(xHienTai)).map((v) => Math.min(130, v * 100));
    o.cham1.setAttribute('cx', X(xHienTai)); o.cham1.setAttribute('cy', Y(h[0]));
    o.cham2.setAttribute('cx', X(xHienTai)); o.cham2.setAttribute('cy', Y(h[1]));
    if (xMax > 50) { o.vachDm.setAttribute('x1', X(100)); o.vachDm.setAttribute('x2', X(100)); }
  }

  // ======================= C: KẾT QUẢ =======================
  function capNhatC() {
    const p = thongSo();
    const m = may();
    const kt = tinhKhongTai({ U1dm: p.U1p, I0: p.I0p, P0: m.P0 / 3, U20: p.U2p, I1dm: p.I1p });
    const nm = tinhNganMach({ Un: p.Unp, In: p.I1p, Pn: m.Pn / 3, U1dm: p.U1p });
    r.c.nhan.x1.textContent = `x₁ = ${so(nm.x1)} Ω`;
    r.c.nhan.r1.textContent = `r₁ = ${so(nm.r1)} Ω`;
    r.c.nhan.r2.textContent = `r′₂ = ${so(nm.r1)} Ω`;
    r.c.nhan.x2.textContent = `x′₂ = ${so(nm.x1)} Ω`;
    r.c.nhan.r0.textContent = `Rth ≈ r₀ = ${Ohm(kt.r0)}`;
    r.c.nhan.x0.textContent = `Xth ≈ x₀ = ${Ohm(kt.x0)}`;
    r.c.ghi[0].textContent = `${m.ten} (${m.nguon}), một pha quy đổi về sơ cấp, kp = ${so(kt.k)}.`;
    r.c.ghi[1].textContent = `Thứ cấp thực: r₂ = r′₂/kp² = ${so((nm.r1 / kt.k ** 2) * 1000)} mΩ; x₂ = x′₂/kp² = ${so((nm.x1 / kt.k ** 2) * 1000)} mΩ.`;
    r.c.ghi[2].textContent = `Không tải: cosφ₀ = ${so(kt.cos0)} (rất thấp). Ngắn mạch: cosφn = ${so(nm.rn / nm.zn)}.`;
    r.c.ghi[3].textContent = 'Slide 84 tính gần đúng Rth ≈ R₀, Xth ≈ X₀ (bỏ qua r₁, x₁ vốn rất nhỏ so với nhánh từ hóa).';
    const sl = m.loiGiaiSlide;
    const ds = [
      ['kp', so(kt.k), sl ? so(sl.kp) : '—'],
      ['R₀', Ohm(kt.r0), sl ? Ohm(sl.R0) : '—'],
      ['z₀', Ohm(kt.z0), sl ? Ohm(sl.z0) : '—'],
      ['X₀', Ohm(kt.x0), sl ? Ohm(sl.X0) : '—'],
      ['cosφ₀', so(kt.cos0), sl ? so(sl.cos0) : '—'],
      ['Rn', Ohm(nm.rn), sl ? Ohm(sl.Rn) : '—'],
      ['zn', Ohm(nm.zn), sl ? Ohm(sl.zn) : '—'],
      ['Xn', Ohm(nm.xn), sl ? Ohm(sl.Xn) : '—'],
      ['I₀p', `${so(p.I0p, 4)} A`, sl ? '0,152 A' : '—'],
    ];
    r.c.bang.o.forEach((h, i) => h.forEach((o, j) => { o.textContent = ds[i][j]; }));
    const nx = sl ? [
      'Sai khác ở R₀, z₀, X₀ (khoảng 0,3–0,6 %)',
      'do slide làm tròn I₀p = 0,152 A',
      `(chính xác ${so(p.I0p, 4)} A); kp = 95,26 do slide`,
      'làm tròn. Các giá trị ngắn mạch trùng nhau.',
      'Xem thêm ghi chú rà soát slide 84.',
    ] : ['Bài tập 2 không yêu cầu tính sơ đồ thay thế;', 'giá trị ở đây tính từ số liệu đề cho', '(P₀, Pn, I₀%, Un%) theo cùng công thức.', '', ''];
    r.c.nx.forEach((o, i) => { o.textContent = nx[i]; });
    $('#sl-u').textContent = '—';
    $('#sl-i').textContent = `I₀p = ${so(p.I0p)} A`;
    $('#sl-p').textContent = `P₀ = ${m.P0} W, Pn = ${m.Pn} W`;
    chuThich(`Sơ đồ thay thế ${m.ten}: r₁ ≈ r′₂ = ${Ohm(nm.r1)}, x₁ ≈ x′₂ = ${Ohm(nm.x1)}, Rth ≈ ${Ohm(kt.r0)}, Xth ≈ ${Ohm(kt.x0)}.`);
    soLieuTC(`r₁ = r′₂ = ${Ohm(nm.r1)} · x₁ = x′₂ = ${Ohm(nm.x1)} · Rth ≈ ${Ohm(kt.r0)} · Xth ≈ ${Ohm(kt.x0)}`);
  }

  // ---------- Điều khiển ----------
  function capNhat() {
    if (s.kichBan === 'khong-tai') capNhatA();
    if (s.kichBan === 'ngan-mach') capNhatB();
    if (s.kichBan === 'ket-qua') capNhatC();
  }
  function chonKichBan(id) {
    s.kichBan = id;
    hienKichBan(id, { 'khong-tai': r.a.g, 'ngan-mach': r.b.g, 'ket-qua': r.c.g });
    veDieuKhien();
    capNhat();
  }
  function veDieuKhien() {
    const chonMay = `<label class="dieu-khien doc"><span>Máy</span> <select id="tn-may">${nd.may.map((m) => `<option value="${m.id}" ${m.id === s.may ? 'selected' : ''}>${m.ten}</option>`).join('')}</select><span></span></label>`;
    let them = '';
    if (s.kichBan === 'khong-tai') {
      them = `<label class="dieu-khien doc"><span>U₁ (% U₁đm)</span> <input type="range" id="tn-u" min="0" max="110" step="1" value="${Math.round(s.uKT * 100)}"><output id="tn-u-gt">${Math.round(s.uKT * 100)} %</output></label>
        <div class="hang-nut"><button type="button" class="nut" id="tn-dat">Đặt U₁ = U₁đm</button></div>`;
    } else if (s.kichBan === 'ngan-mach') {
      them = `<label class="dieu-khien doc"><span>Un (% giá trị tại I₁đm)</span> <input type="range" id="tn-u" min="0" max="120" step="1" value="${Math.round(s.uNM * 100)}"><output id="tn-u-gt">${Math.round(s.uNM * 100)} %</output></label>
        <div class="hang-nut"><button type="button" class="nut" id="tn-dat">Tăng đến In = I₁đm</button></div>`;
    }
    $('#dieu-khien-kich-ban').innerHTML = `<p class="mo-ta">Máy ảo dựng từ số liệu đề bài tập (mô hình tuyến tính, đo một pha). Vặn bộ điều chỉnh điện áp và đọc đồng hồ.</p>${chonMay}${them}`;
    $('#tn-may').addEventListener('change', (e) => { s.may = e.target.value; capNhat(); });
    const tr = $('#tn-u');
    if (tr) {
      const dat = (v) => {
        if (s.kichBan === 'khong-tai') s.uKT = v / 100; else s.uNM = v / 100;
        tr.value = v; $('#tn-u-gt').textContent = `${v} %`;
        capNhat();
      };
      tr.addEventListener('input', (e) => dat(Number(e.target.value)));
      $('#tn-dat').addEventListener('click', () => dat(100));
    }
  }

  trinhChieuVaCauHoi(nd, cauHoi, (id, b) => {
    const tt = b?.trangThai;
    if (!tt) return;
    if (tt.u !== undefined) { if (tt.kichBan === 'khong-tai') s.uKT = tt.u; else s.uNM = tt.u; }
    chonKichBan(tt.kichBan);
  }, datChay, s);

  // kim đồng hồ chuyển động mượt
  const kimHien = { A: 0, V1: 0, V2: 0 };
  vongLap(s, (dt, dtThuc) => {
    const o = s.kichBan === 'khong-tai' ? r.a : s.kichBan === 'ngan-mach' ? r.b : null;
    if (!o) return;
    for (const k of ['A', 'V1', 'V2']) {
      kimHien[k] += ((s.kimA[k] || 0) - kimHien[k]) * Math.min(1, dtThuc * 6);
      o.ban[k].dat(kimHien[k]);
    }
  });

  chonKichBan(s.kichBan);
  document.body.classList.add('da-san-sang');
}

chayTrang(khoiDong);
