/**
 * mba-ba-pha.js — Trang 5.1–5.2 "Máy biến áp ba pha, tổ nối dây" (slide 66–72).
 *
 * Kịch bản a (ba-tru): ba MBA một pha → bốn trụ → ba trụ; ΦA + ΦB + ΦC = 0 khi đối xứng.
 * Kịch bản b (to-noi-day): chọn kiểu nối hai phía, cực tính, nhãn đầu ra → sơ đồ nối dây, đồ thị véc tơ, đồng hồ.
 * Kịch bản c (mot-pha): tổ nối dây MBA một pha I/I-12, I/I-6 (slide 70–71).
 */
import { el } from './so-do.js';
import { $, napBai, dieuKhienChung, trinhChieuVaCauHoi, vongLap, chayTrang, hienKichBan } from './khung-trang.js';
import { taoMarker, veThe, veLoiKhung, veTruc, duongGap, veVecto, veBang } from './hinh-mba.js';
import { toNoiDay, dienTheDauRa } from './to-noi-day.js';
import { goc } from './so-phuc.js';
import { dinhDangSo } from './tinh-toan.js';

const PHA = ['#e6a700', '#2e9e4f', '#d62828'];
const tenNoi = (x) => (x === 'Y' ? 'Y' : 'Δ');

/** Cuộn dây đứng dạng lò xo (vẽ ngang qua trục), từ y0 đến y1. */
function cuon(cha, x, y0, y1, mau) {
  let d = `M${x} ${y0}`;
  const n = 6;
  const h = (y1 - y0) / n;
  for (let k = 0; k < n; k++) d += ` c14 0 14 ${h} 0 ${h}`;
  return el('path', { d, fill: 'none', stroke: mau, 'stroke-width': 3 }, cha);
}

/** Đồng hồ tổ nối dây. */
function veDongHo(cha, cx, cy, R) {
  const g = el('g', { class: 'dong-ho-to' }, cha);
  el('circle', { cx, cy, r: R, class: 'mat-dong-ho' }, g);
  for (let h = 1; h <= 12; h++) {
    const a = ((90 - h * 30) * Math.PI) / 180;
    el('line', { x1: cx + (R - 12) * Math.cos(a), y1: cy - (R - 12) * Math.sin(a), x2: cx + (R - 2) * Math.cos(a), y2: cy - (R - 2) * Math.sin(a), class: 'vach-dong-ho' }, g);
    el('text', { x: cx + (R - 32) * Math.cos(a), y: cy - (R - 32) * Math.sin(a) + 8, class: 'so-dong-ho', 'text-anchor': 'middle' }, g).textContent = h;
  }
  const phut = el('line', { x1: cx, y1: cy, x2: cx, y2: cy - R + 22, class: 'kim-phut' }, g);
  const gio = el('line', { x1: cx, y1: cy, class: 'kim-gio' }, g);
  const cung = el('path', { class: 'cung-goc' }, g);
  el('circle', { cx, cy, r: 8, fill: '#13202b' }, g);
  return {
    phut,
    dat(goc) {
      const a = ((90 - goc) * Math.PI) / 180;
      gio.setAttribute('x2', (cx + (R * 0.6) * Math.cos(a)).toFixed(1));
      gio.setAttribute('y2', (cy - (R * 0.6) * Math.sin(a)).toFixed(1));
      const r = 38;
      const lon = goc > 180 ? 1 : 0;
      cung.setAttribute('d', goc % 360 === 0 ? '' : `M${cx} ${cy - r} A${r} ${r} 0 ${lon} 1 ${(cx + r * Math.cos(a)).toFixed(1)} ${(cy - r * Math.sin(a)).toFixed(1)}`);
    },
  };
}

function veSanKhau(svg) {
  svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  taoMarker(defs, 'mui-den', '#13202b');
  taoMarker(defs, 'mui-xanh', '#2a78d6');
  el('rect', { x: -2000, y: -1200, width: 5600, height: 3300, class: 'nen-san-khau' }, svg);
  const r = { a: {}, b: {}, c: {} };

  // ======================= A: BA TRỤ =======================
  const gA = el('g', {}, svg);
  r.a.g = gA;
  const a1 = veThe(gA, 20, 20, 1000, 560, 'Hình 5.1 – từ ba MBA một pha đến MBA ba pha ba trụ');
  r.a.buoc = [];
  // bước 0: ba MBA một pha
  const g0 = el('g', {}, a1);
  for (let k = 0; k < 3; k++) {
    const x0 = 90 + k * 300;
    veLoiKhung(g0, { x0, y0: 140, x1: x0 + 220, y1: 460, day: 40 });
    cuon(g0, x0 + 34, 200, 400, PHA[k]);
    cuon(g0, x0 + 214, 200, 400, PHA[k]);
    el('text', { x: x0 + 110, y: 500, class: 'chu-svg dam', 'text-anchor': 'middle' }, g0).textContent = `Pha ${'ABC'[k]}`;
  }
  r.a.buoc.push(g0);
  // bước 1: bốn trụ (ba trụ pha + trụ chung MN)
  const g1 = el('g', {}, a1);
  const xg = [120, 360, 600];
  el('path', { d: 'M100 140 H900 V180 H100 Z M100 420 H900 V460 H100 Z', class: 'loi-thep-ab' }, g1);
  for (let k = 0; k < 3; k++) {
    el('rect', { x: xg[k], y: 180, width: 44, height: 240, class: 'loi-thep-ab' }, g1);
    cuon(g1, xg[k] + 12, 200, 400, PHA[k]);
  }
  r.a.truChung = el('rect', { x: 830, y: 180, width: 50, height: 240, class: 'tru-chung' }, g1);
  el('text', { x: 855, y: 130, class: 'chu-svg dam', 'text-anchor': 'middle' }, g1).textContent = 'M';
  el('text', { x: 855, y: 490, class: 'chu-svg dam', 'text-anchor': 'middle' }, g1).textContent = 'N';
  r.a.chuTruChung = el('text', { x: 820, y: 300, class: 'chu-kq dam', 'text-anchor': 'end' }, g1);
  r.a.buoc.push(g1);
  // bước 2: ba trụ
  const g2 = el('g', {}, a1);
  veLoiKhung(g2, { x0: 160, y0: 140, x1: 860, y1: 460, day: 46 });
  el('rect', { x: 487, y: 186, width: 46, height: 228, class: 'loi-thep-ab' }, g2);
  const xt = [183, 510, 837];
  for (let k = 0; k < 3; k++) {
    cuon(g2, xt[k] - 6, 200, 400, PHA[k]);
    el('text', { x: xt[k], y: 500, class: 'chu-svg dam', 'text-anchor': 'middle' }, g2).textContent = 'ABC'[k];
  }
  r.a.buoc.push(g2);
  r.a.muiPhi = [0, 1, 2].map((k) => el('line', { class: 'vec', stroke: PHA[k], 'stroke-width': 5, 'marker-end': 'url(#mui-den)' }, a1));
  r.a.chuBuoc = el('text', { x: 44, y: 560, class: 'chu-kq' }, a1);
  const a2 = veThe(gA, 20, 600, 1000, 290, 'ΦA, ΦB, ΦC và tổng Φ = ΦA + ΦB + ΦC');
  r.a.truc = veTruc(a2, { x0: 90, x1: 990, y0: 650, y1: 870, xMin: 0, xMax: 4 * Math.PI, yMin: -1.6, yMax: 1.6 }, {
    nhanX: [[0, '0'], [Math.PI, 'π'], [2 * Math.PI, '2π'], [3 * Math.PI, '3π'], [4 * Math.PI, '4π ωt']], nhanY: [[0, '0'], [1, '+Φm'], [-1, '−Φm']],
  });
  r.a.dPha = [0, 1, 2].map((k) => el('path', { class: 'duong-dt', stroke: PHA[k] }, a2));
  r.a.dTong = el('path', { class: 'duong-dt', stroke: '#13202b', 'stroke-width': 4 }, a2);
  r.a.con = el('line', { y1: 650, y2: 870, class: 'duong-cham' }, a2);
  const a3 = veThe(gA, 1040, 20, 540, 870, 'Véc tơ từ thông');
  r.a.O = [1310, 330];
  el('circle', { cx: 1310, cy: 330, r: 170, class: 'vong-mo' }, a3);
  r.a.vt = [0, 1, 2].map((k) => veVecto(a3, PHA[k], { day: 4 }));
  r.a.vtTong = veVecto(a3, '#13202b', { day: 5 });
  r.a.dong = Array.from({ length: 8 }, (_, k) => el('text', { x: 1064, y: 560 + k * 36, class: 'chu-svg' }, a3));

  // ======================= B: TỔ NỐI DÂY =======================
  const gB = el('g', {}, svg);
  r.b.g = gB;
  const b1 = veThe(gB, 20, 20, 560, 870, 'Sơ đồ nối dây');
  r.b.soDo = el('g', {}, b1);
  r.b.kyHieu = el('text', { x: 300, y: 850, class: 'ky-hieu-to', 'text-anchor': 'middle' }, b1);
  const b2 = veThe(gB, 600, 20, 560, 870, 'Đồ thị véc tơ (slide 69, 72)');
  r.b.vtSo = el('g', {}, b2);
  r.b.vtThu = el('g', {}, b2);
  el('text', { x: 624, y: 92, class: 'chu-svg dam' }, b2).textContent = 'Sơ cấp';
  el('text', { x: 624, y: 492, class: 'chu-svg dam' }, b2).textContent = 'Thứ cấp';
  const b3 = veThe(gB, 1180, 20, 400, 870, 'Phương pháp đồng hồ');
  r.b.dongHo = veDongHo(b3, 1380, 260, 160);
  el('text', { x: 1204, y: 470, class: 'chu-svg' }, b3).textContent = 'Kim phút (12): E_AB sơ cấp';
  el('text', { x: 1204, y: 500, class: 'chu-svg' }, b3).textContent = 'Kim giờ: E_ab thứ cấp';
  r.b.ketQua = el('text', { x: 1380, y: 580, class: 'ky-hieu-to', 'text-anchor': 'middle' }, b3);
  r.b.goc = el('text', { x: 1380, y: 620, class: 'chu-kq dam', 'text-anchor': 'middle' }, b3);
  r.b.mau = [];
  el('text', { x: 1204, y: 672, class: 'chu-svg dam' }, b3).textContent = 'Bốn tổ trên slide 69:';
  for (let k = 0; k < 4; k++) {
    const g = el('g', { class: 'chip-btn', 'data-mau': k }, b3);
    el('rect', { x: 1204 + (k % 2) * 180, y: 690 + Math.floor(k / 2) * 62, width: 168, height: 50, rx: 10 }, g);
    r.b.mau.push({ g, chu: el('text', { x: 1288 + (k % 2) * 180, y: 722 + Math.floor(k / 2) * 62, 'text-anchor': 'middle' }, g) });
  }

  // ======================= C: MỘT PHA =======================
  const gC = el('g', {}, svg);
  r.c.g = gC;
  const c1 = veThe(gC, 20, 20, 760, 870, 'MBA một pha (slide 70–71)');
  veLoiKhung(c1, { x0: 240, y0: 140, x1: 520, y1: 700, day: 60 });
  cuon(c1, 254, 200, 380, '#d62828');
  r.c.cuonTC = el('g', {}, c1);
  r.c.nhan = {};
  for (const [k, y] of [['A', 200], ['X', 380], ['a', 480], ['x', 660]]) {
    el('line', { x1: 130, x2: 250, y1: y, y2: y, class: 'day-mach' }, c1);
    r.c.nhan[k] = el('text', { x: 110, y: y + 8, class: 'nhan-dai-luong', 'text-anchor': 'end' }, c1);
  }
  el('text', { x: 300, y: 300, class: 'chu-svg dam' }, c1).textContent = 'SC';
  el('text', { x: 300, y: 580, class: 'chu-svg dam' }, c1).textContent = 'TC';
  el('line', { x1: 380, x2: 380, y1: 160, y2: 680, class: 'duong-cham' }, c1);
  el('text', { x: 396, y: 430, class: 'nhan-dai-luong mau-phi' }, c1).textContent = 'Φ';
  r.c.vtSC = veVecto(c1, '#d62828', { day: 5 });
  r.c.vtTC = veVecto(c1, '#2e9e4f', { day: 5 });
  r.c.chu = [0, 1, 2].map((k) => el('text', { x: 44, y: 780 + k * 32, class: k ? 'chu-svg' : 'chu-kq dam' }, c1));
  const c2 = veThe(gC, 800, 20, 780, 870, 'Đồng hồ');
  r.c.dongHo = veDongHo(c2, 1190, 380, 230);
  r.c.ketQua = el('text', { x: 1190, y: 700, class: 'ky-hieu-to', 'text-anchor': 'middle' }, c2);
  r.c.goc = el('text', { x: 1190, y: 744, class: 'chu-kq dam', 'text-anchor': 'middle' }, c2);
  return r;
}

async function khoiDong() {
  const kq = await napBai('du-lieu/mba-ba-pha.json', 'du-lieu/cau-hoi-mba-ba-pha.json');
  if (!kq) return;
  const [nd, cauHoi] = kq;
  const svg = $('#so-do');
  const r = veSanKhau(svg);
  const md = nd.macDinh;
  const s = { kichBan: md.kichBan, dangChay: true, tocDo: 1, t: 0, buoc: 0, tBuoc: 0, tuDong: true, lech: 0, so: md.so, thu: md.thu, nguocCuc: md.nguocCuc, hoanVi: md.hoanVi, nguoc1: false };
  const { datChay, chuThich, soLieuTC } = dieuKhienChung(s, (id) => chonKichBan(id));

  const lt = nd.lyThuyet;
  $('#the-ly-thuyet').innerHTML = `
    <p class="muc-nho">${lt.muc}</p>
    <h2>5.1. Khái niệm</h2>
    <ul class="ghi-chu-ly-thuyet">${lt.khaiNiem.map((x) => `<li>${x}</li>`).join('')}</ul>
    <h2>5.2. Tổ nối dây của MBA</h2>
    <p class="dong-ly-thuyet"><b>a. Ký hiệu đầu dây</b></p>
    <table class="bang-cap"><tr><th></th><th>Đầu đầu</th><th>Đầu cuối</th><th>Trung tính</th></tr>
      ${lt.kyHieuDauDay.map((h) => `<tr><th scope="row">${h[0]}</th><td>${h[1]}</td><td>${h[2]}</td><td>${h[3]}</td></tr>`).join('')}</table>
    <p class="dong-ly-thuyet"><b>b. Các kiểu đấu dây.</b> ${lt.kieuDau}</p>
    <p class="quy-tac"><b>c. Tổ nối dây.</b> ${lt.toNoiDay}</p>
    <p class="dong-ly-thuyet">${lt.motPha}</p>`;

  // ======================= A =======================
  const TEN_BUOC = ['Ba MBA một pha riêng rẽ (hình 5.1a)', 'Ghép thành MBA bốn trụ, trụ chung MN (hình 5.1b)', 'Bỏ trụ chung: MBA ba pha ba trụ (hình 5.1c)'];
  function capNhatA() {
    r.a.buoc.forEach((g, k) => { g.style.display = k === s.buoc ? '' : 'none'; });
    r.a.chuBuoc.textContent = `Bước ${s.buoc + 1}/3: ${TEN_BUOC[s.buoc]}`;
    const { X, Y } = r.a.truc;
    const bien = [1, 1, 1 - s.lech];
    const ham = (k, a) => bien[k] * Math.sin(a - (k * 2 * Math.PI) / 3);
    const ds = Array.from({ length: 241 }, (_, i) => (i / 240) * 4 * Math.PI);
    r.a.dPha.forEach((d, k) => d.setAttribute('d', duongGap(ds.map((a) => [X(a), Y(ham(k, a))]))));
    r.a.dTong.setAttribute('d', duongGap(ds.map((a) => [X(a), Y(ham(0, a) + ham(1, a) + ham(2, a))])));
    const doiXung = s.lech < 0.001;
    const dong = [
      `Ba từ thông lệch nhau 120°:`,
      'ΦA = Φm·sin ωt',
      'ΦB = Φm·sin(ωt − 120°)',
      `ΦC = ${doiXung ? '' : `${dinhDangSo(1 - s.lech, 2)}·`}Φm·sin(ωt − 240°)`,
      '',
      doiXung ? 'Máy đối xứng: Φ = ΦA + ΦB + ΦC = 0' : 'Không đối xứng (minh họa): Φ ≠ 0',
      doiXung ? 'tại mọi thời điểm ⇒ bỏ được trụ chung.' : '⇒ trụ chung còn mang từ thông.',
      'Véc tơ đen: tổng Φ.',
    ];
    r.a.dong.forEach((o, i) => { o.textContent = dong[i]; o.setAttribute('class', i >= 5 && i <= 6 ? (doiXung ? 'chu-kq dam' : 'chu-kq xau') : 'chu-svg'); });
    $('#sl-1').textContent = `${s.buoc + 1}/3`;
    $('#sl-2').textContent = doiXung ? 'Φ = 0' : 'Φ ≠ 0';
    $('#sl-3').textContent = '—';
    chuThich(`${TEN_BUOC[s.buoc]}. ${doiXung ? 'Khi máy đối xứng, ΦA + ΦB + ΦC = 0 nên có thể bỏ trụ chung MN.' : 'Từ thông không đối xứng (minh họa): tổng khác 0.'}`);
    soLieuTC(`${TEN_BUOC[s.buoc]} · ${doiXung ? 'ΦA + ΦB + ΦC = 0' : 'Φ ≠ 0'}`);
  }

  // ======================= B =======================
  function veNoiDay(g, noi, y0, nhanDau, nhanCuoi, mauCuon, thuCap) {
    // ba cuộn đứng tại x = 150, 300, 450; đầu đầu ở trên (y0), đầu cuối ở dưới (y0 + 180)
    const xs = [150, 300, 450];
    const yT = y0;
    const yB = y0 + 180;
    xs.forEach((x, i) => {
      const nguoc = thuCap && s.nguocCuc;
      cuon(g, x, yT + 30, yB - 30, mauCuon);
      el('line', { x1: x, x2: x, y1: yT, y2: yT + 30, class: 'day-mach' }, g);
      el('line', { x1: x, x2: x, y1: yB - 30, y2: yB, class: 'day-mach' }, g);
      el('circle', { cx: x - 14, cy: nguoc ? yB - 38 : yT + 38, r: 5, fill: '#13202b' }, g); // dấu cực tính
      const iNhan = thuCap ? (i - s.hoanVi + 3) % 3 : i;
      el('text', { x: x - 16, y: yT - 4, class: 'nhan-dai-luong', 'text-anchor': 'end' }, g).textContent = nhanDau[iNhan];
      el('text', { x: x - 16, y: yB + 24, class: 'nhan-dai-luong', 'text-anchor': 'end' }, g).textContent = nhanCuoi[iNhan];
    });
    if (noi === 'Y') {
      el('path', { d: `M150 ${yB} V${yB + 14} H450 V${yB}`, class: 'day-noi-to' }, g);
    } else {
      // nối đầu cuối của một pha với đầu đầu của pha khác (theo nhãn pha, không theo vị trí trụ)
      const viTri = (pha) => xs[thuCap ? (pha + s.hoanVi) % 3 : pha];
      for (let p = 0; p < 3; p++) {
        const den = noi === 'D1' ? (p + 1) % 3 : (p + 2) % 3; // D1: cuối p → đầu p+1; D2: cuối p → đầu p−1
        const x1 = viTri(p);
        const x2 = viTri(den);
        el('path', { d: `M${x1} ${yB} V${yB + 14 + p * 8} H${x2 + 24} V${yT - 14 - p * 8} H${x2} V${yT}`, class: 'day-noi-to', stroke: PHA[p] }, g);
      }
    }
  }
  function veDoThi(g, O, R, noi, e, nhan, laSo) {
    const v = dienTheDauRa(noi, e);
    const p = (z) => [O[0] + z[0] * R, O[1] - z[1] * R];
    // đường nối các đầu ra (tam giác điện áp dây)
    el('path', { d: `${duongGap(v.map(p))} Z`, class: 'tam-giac-u' }, g);
    if (noi === 'Y') {
      v.forEach((z, i) => { const vt = veVecto(g, PHA[i], { day: 3.5 }); vt.dat(O, p(z), ''); });
    } else {
      // cạnh tam giác là sđđ dây quấn của pha tương ứng
      [0, 1, 2].forEach((i) => {
        const [a, b] = noi === 'D1' ? [i, (i + 1) % 3] : [i, (i + 2) % 3];
        const vt = veVecto(g, PHA[i], { day: 3.5 });
        vt.dat(p(v[b]), p(v[a]), '');
      });
    }
    v.forEach((z, i) => {
      const q = p(z);
      const n = Math.hypot(z[0], z[1]) || 1;
      el('text', { x: q[0] + (z[0] / n) * 22, y: q[1] - (z[1] / n) * 22 + 7, class: 'nhan-dai-luong', 'text-anchor': 'middle' }, g).textContent = nhan[i];
    });
    const vt = veVecto(g, '#13202b', { day: 2.5, net: '6 4' });
    vt.dat(p(v[1]), p(v[0]), laSo ? 'E_AB' : 'E_ab', [-34, 0]);
    return v;
  }
  function capNhatB() {
    const cfg = { so: s.so, thu: s.thu, nguocCuc: s.nguocCuc, hoanVi: s.hoanVi };
    const t = toNoiDay(cfg);
    const ky = `${tenNoi(s.so)}/${tenNoi(s.thu)}-${t.so}`;
    r.b.soDo.innerHTML = '';
    el('text', { x: 44, y: 110, class: 'chu-svg dam' }, r.b.soDo).textContent = `Sơ cấp: ${s.so === 'Y' ? 'sao' : s.so === 'D1' ? 'tam giác (A–Z, B–X, C–Y)' : 'tam giác (A–Y, B–Z, C–X)'}`;
    veNoiDay(r.b.soDo, s.so, 160, ['A', 'B', 'C'], ['X', 'Y', 'Z'], '#d62828', false);
    el('text', { x: 44, y: 470, class: 'chu-svg dam' }, r.b.soDo).textContent = `Thứ cấp: ${s.thu === 'Y' ? 'sao' : s.thu === 'D1' ? 'tam giác (a–z, b–x, c–y)' : 'tam giác (a–y, b–z, c–x)'}`;
    veNoiDay(r.b.soDo, s.thu, 520, ['a', 'b', 'c'], ['x', 'y', 'z'], '#2e9e4f', true);
    el('text', { x: 44, y: 780, class: 'nho-xam' }, r.b.soDo).textContent = 'Chấm đen: đầu cùng cực tính; cùng cột = cùng trụ.';
    r.b.kyHieu.textContent = ky;
    r.b.vtSo.innerHTML = '';
    r.b.vtThu.innerHTML = '';
    veDoThi(r.b.vtSo, [880, 290], s.so === 'Y' ? 105 : 170, s.so, t.eSo, ['A', 'B', 'C'], true);
    veDoThi(r.b.vtThu, [880, 690], s.thu === 'Y' ? 105 : 170, s.thu, t.eThu, ['a', 'b', 'c'], false);
    r.b.dongHo.dat(t.goc === 0 ? 360 : t.goc);
    r.b.ketQua.textContent = ky;
    r.b.goc.textContent = `E_ab chậm sau E_AB ${t.goc === 0 ? 360 : t.goc}° → kim giờ chỉ ${t.so}`;
    nd.mau4To.forEach((m, k) => {
      r.b.mau[k].chu.textContent = m.ten;
      r.b.mau[k].g.classList.toggle('chon', m.so === s.so && m.thu === s.thu && !s.nguocCuc && !s.hoanVi);
    });
    $('#sl-1').textContent = ky;
    $('#sl-2').textContent = `${t.goc === 0 ? 360 : t.goc}°`;
    $('#sl-3').textContent = `${dinhDangSo((goc(t.UAB) * 180) / Math.PI, 0)}° / ${dinhDangSo((goc(t.Uab) * 180) / Math.PI, 0)}°`;
    chuThich(`Tổ nối dây <b>${ky}</b>: điện áp dây thứ cấp chậm sau điện áp dây sơ cấp ${t.goc === 0 ? 360 : t.goc}° (${t.so} × 30°).${s.thu !== s.so && (s.so === 'Y' || s.thu === 'Y') ? ' Nối Y/Δ hoặc Δ/Y cho tổ số lẻ.' : ' Nối cùng kiểu cho tổ số chẵn.'}`);
    soLieuTC(`${ky} · góc lệch ${t.goc === 0 ? 360 : t.goc}°`);
  }
  svg.addEventListener('click', (e) => {
    const g = e.target.closest('[data-mau]');
    if (g && s.kichBan === 'to-noi-day') {
      const m = nd.mau4To[Number(g.dataset.mau)];
      Object.assign(s, { so: m.so, thu: m.thu, nguocCuc: false, hoanVi: 0 });
      veDieuKhien();
      capNhatB();
    }
  });

  // ======================= C =======================
  function capNhatC() {
    const ng = s.nguoc1;
    r.c.cuonTC.innerHTML = '';
    cuon(r.c.cuonTC, 254, 480, 660, '#2e9e4f');
    r.c.nhan.A.textContent = 'A';
    r.c.nhan.X.textContent = 'X';
    r.c.nhan.a.textContent = ng ? 'x' : 'a';
    r.c.nhan.x.textContent = ng ? 'a' : 'x';
    r.c.vtSC.dat([600, 420], [600, 220], 'SC', [-30, 0]);
    r.c.vtTC.dat([680, 420], [680, ng ? 620 : 260], 'TC', [30, 0]);
    const so = ng ? 6 : 12;
    r.c.dongHo.dat(ng ? 180 : 360);
    r.c.ketQua.textContent = `I/I-${so}`;
    r.c.goc.textContent = `Góc lệch ${ng ? 180 : 360}° → kim giờ chỉ ${so}`;
    r.c.chu[0].textContent = ng ? 'Đổi đầu a ↔ x: sđđ thứ cấp ngược pha' : 'Hai dây quấn cùng chiều, cùng đánh dấu: cùng pha';
    r.c.chu[1].textContent = 'Kim phút: sđđ dây quấn SC (12); kim giờ: sđđ dây quấn TC.';
    r.c.chu[2].textContent = ng ? 'Tổ I/I-6 (slide 71).' : 'Tổ I/I-12 (slide 70).';
    $('#sl-1').textContent = `I/I-${so}`;
    $('#sl-2').textContent = `${ng ? 180 : 360}°`;
    $('#sl-3').textContent = '—';
    chuThich(`MBA một pha: ${ng ? 'đổi đầu a ↔ x, sđđ thứ cấp ngược pha' : 'sđđ hai dây quấn cùng pha'} → tổ <b>I/I-${so}</b>.`);
    soLieuTC(`I/I-${so}`);
  }

  // ---------- Điều khiển ----------
  const NHAN = { 'ba-tru': ['Bước', 'Tổng từ thông', '—'], 'to-noi-day': ['Tổ nối dây', 'Góc lệch E_AB → E_ab', 'Góc E_AB / E_ab'], 'mot-pha': ['Tổ nối dây', 'Góc lệch', '—'] };
  function capNhat() {
    NHAN[s.kichBan].forEach((t, k) => { $(`#sl-${k + 1}`).previousElementSibling.textContent = t; });
    if (s.kichBan === 'ba-tru') capNhatA();
    if (s.kichBan === 'to-noi-day') capNhatB();
    if (s.kichBan === 'mot-pha') capNhatC();
  }
  function chonKichBan(id) {
    s.kichBan = id;
    hienKichBan(id, { 'ba-tru': r.a.g, 'to-noi-day': r.b.g, 'mot-pha': r.c.g });
    veDieuKhien();
    capNhat();
  }
  const nhom = (ten, id, ds, gt) => `<p class="mo-ta" style="margin:8px 0 4px"><b>${ten}</b></p><div class="hang-nut">${ds.map(([v, t]) => `<button type="button" class="nut" data-${id}="${v}" aria-pressed="${String(gt) === String(v)}">${t}</button>`).join('')}</div>`;
  function veDieuKhien() {
    const dk = $('#dieu-khien-kich-ban');
    if (s.kichBan === 'ba-tru') {
      dk.innerHTML = `${nhom('Bước', 'buoc', [[0, '1. Ba máy 1 pha'], [1, '2. Bốn trụ'], [2, '3. Ba trụ']], s.buoc)}
        <label class="o-chon"><input type="checkbox" id="bt-tu-dong" ${s.tuDong ? 'checked' : ''}> Tự động chuyển bước</label>
        <label class="dieu-khien doc"><span>Lệch ΦC (minh họa)</span> <input type="range" id="bt-lech" min="0" max="0.5" step="0.05" value="${s.lech}"><output id="bt-lech-gt">${dinhDangSo(s.lech * 100, 0)} %</output></label>`;
      dk.querySelectorAll('[data-buoc]').forEach((b) => b.addEventListener('click', () => { s.buoc = Number(b.dataset.buoc); s.tuDong = false; veDieuKhien(); capNhatA(); }));
      $('#bt-tu-dong').addEventListener('change', (e) => { s.tuDong = e.target.checked; });
      $('#bt-lech').addEventListener('input', (e) => { s.lech = Number(e.target.value); $('#bt-lech-gt').textContent = `${dinhDangSo(s.lech * 100, 0)} %`; capNhatA(); });
    } else if (s.kichBan === 'to-noi-day') {
      const kieu = [['Y', 'Sao Y'], ['D1', 'Δ (A–Z)'], ['D2', 'Δ (A–Y)']];
      dk.innerHTML = `${nhom('Sơ cấp', 'so', kieu, s.so)}${nhom('Thứ cấp', 'thu', [['Y', 'Sao y'], ['D1', 'Δ (a–z)'], ['D2', 'Δ (a–y)']], s.thu)}
        ${nhom('Nhãn đầu ra thứ cấp', 'hv', [[0, 'a b c'], [1, 'dời 1 trụ'], [2, 'dời 2 trụ']], s.hoanVi)}
        <label class="o-chon"><input type="checkbox" id="td-nguoc" ${s.nguocCuc ? 'checked' : ''}> Thứ cấp ngược cực tính</label>
        <p class="ghi-chu-nho">Thử thay đổi để thấy: đổi cực tính thêm 6 giờ (180°), dời nhãn thêm 4 giờ (120°).</p>`;
      dk.querySelectorAll('[data-so]').forEach((b) => b.addEventListener('click', () => { s.so = b.dataset.so; veDieuKhien(); capNhatB(); }));
      dk.querySelectorAll('[data-thu]').forEach((b) => b.addEventListener('click', () => { s.thu = b.dataset.thu; veDieuKhien(); capNhatB(); }));
      dk.querySelectorAll('[data-hv]').forEach((b) => b.addEventListener('click', () => { s.hoanVi = Number(b.dataset.hv); veDieuKhien(); capNhatB(); }));
      $('#td-nguoc').addEventListener('change', (e) => { s.nguocCuc = e.target.checked; capNhatB(); });
    } else {
      dk.innerHTML = '<label class="o-chon"><input type="checkbox" id="mp-nguoc"> Đổi đầu a ↔ x (ngược cực tính)</label>';
      $('#mp-nguoc').checked = s.nguoc1;
      $('#mp-nguoc').addEventListener('change', (e) => { s.nguoc1 = e.target.checked; capNhatC(); });
    }
  }

  trinhChieuVaCauHoi(nd, cauHoi, (id, b) => {
    const tt = b?.trangThai;
    if (!tt) return;
    if (tt.buoc !== undefined) { s.buoc = tt.buoc; s.tuDong = false; }
    if (tt.so) Object.assign(s, { so: tt.so, thu: tt.thu, nguocCuc: false, hoanVi: 0 });
    if (tt.nguocCuc !== undefined && tt.kichBan === 'mot-pha') s.nguoc1 = tt.nguocCuc;
    chonKichBan(tt.kichBan);
  }, datChay, s);

  vongLap(s, (dt) => {
    s.t += dt;
    if (s.kichBan !== 'ba-tru') return;
    if (s.tuDong) {
      s.tBuoc += dt;
      if (s.tBuoc > 3.5) { s.tBuoc = 0; s.buoc = (s.buoc + 1) % 3; veDieuKhien(); capNhatA(); }
    }
    const a = ((s.t * 2 * Math.PI) / 3) % (4 * Math.PI);
    r.a.con.setAttribute('x1', r.a.truc.X(a)); r.a.con.setAttribute('x2', r.a.truc.X(a));
    const bien = [1, 1, 1 - s.lech];
    const O = r.a.O;
    let tx = 0;
    let ty = 0;
    for (let k = 0; k < 3; k++) {
      // véc tơ quay: hình chiếu lên trục đứng là giá trị tức thời
      const ph = a - (k * 2 * Math.PI) / 3;
      const vx = bien[k] * Math.cos(ph);
      const vy = bien[k] * Math.sin(ph);
      tx += vx; ty += vy;
      r.a.vt[k].dat(O, [O[0] + vx * 160, O[1] - vy * 160], `Φ${'ABC'[k]}`, [vx * 40, -vy * 40]);
      // mũi tên từ thông trên trụ, độ dài ~ giá trị tức thời
      const xx = [[200, 500, 800], [200, 440, 680], [250, 580, 770]][s.buoc][k];
      const v = bien[k] * Math.sin(ph);
      r.a.muiPhi[k].setAttribute('x1', xx); r.a.muiPhi[k].setAttribute('x2', xx);
      r.a.muiPhi[k].setAttribute('y1', 300 + v * 70); r.a.muiPhi[k].setAttribute('y2', 300 - v * 70);
      r.a.muiPhi[k].style.opacity = Math.abs(v) < 0.1 ? 0 : 0.9;
    }
    r.a.vtTong.dat(O, [O[0] + tx * 160, O[1] - ty * 160], Math.hypot(tx, ty) > 0.02 ? 'Φ' : '', [16, -10]);
    const tong = Math.hypot(tx, ty) * Math.abs(Math.sin(Math.atan2(ty, tx)));
    r.a.truChung.style.fill = `color-mix(in srgb, #d62828 ${Math.round(Math.min(1, tong) * 100)}%, #e3e9ef)`;
    r.a.chuTruChung.textContent = s.buoc === 1 ? (s.lech < 0.001 ? 'Φ(MN) = 0' : 'Φ(MN) ≠ 0') : '';
  });

  chonKichBan(s.kichBan);
  document.body.classList.add('da-san-sang');
}

chayTrang(khoiDong);
