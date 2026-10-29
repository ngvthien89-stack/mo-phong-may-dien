/**
 * cau-tao-mba.js — Trang 2.4 "Cấu tạo máy biến áp" (slide 25–37).
 *
 * Kịch bản a (loi-thep): lắp ráp ruột MBA 3 pha kiểu trụ theo từng bước; lõi liền khối và lá thép phủ sơn cách điện.
 * Kịch bản b (day-quan): dây quấn đồng tâm / xen kẽ; bốn kiểu dây quấn đồng tâm a–d.
 * Kịch bản c (vo-may): bản vẽ cấu tạo MBA (slide 26), vỏ máy, bình giãn dầu.
 */
import { el } from './so-do.js';
import { thuTuBanhXenKe, mucDauBinhGian, gioiHanBuoc } from './cau-tao.js';
import { dinhDangSo } from './tinh-toan.js';
import { khoiTaoTrinhChieu } from './trinh-chieu.js';
import { khoiTaoCauHoi } from './kiem-tra.js';
import { napJSON } from './tien-ich.js';

const $ = (s) => document.querySelector(s);
const MAU = { HA: '#2a78d6', CA: '#d62828' };
const THOI_GIAN_BUOC_S = 1.2;
const thuongDau = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const tienTo = (b) => (b.so === '–' ? '' : `${b.so} – `);

// Lõi thép 3 trụ của kịch bản a
const CT = { x0: 190, x1: 830, yT0: 200, yT1: 270, yD0: 650, yD1: 720, tru: [190, 475, 760], rong: 70 };
// Bề dày các lớp quanh trụ: khe, HA, khe, CA
const LOP = { khe1: 8, ha: 22, khe2: 10, ca: 26 };

/** Hai hình chữ nhật (bên trái, bên phải trụ) của một lớp dây quấn cách mép trụ từ a đến b. */
function haiBen(xTru, rong, a, b) {
  return [[xTru - b, b - a], [xTru + rong + a, b - a]];
}

function veSanKhau(svg, nd) {
  svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  const pat = (id, ngang) => {
    const p = el('pattern', { id, width: 7, height: 7, patternUnits: 'userSpaceOnUse' }, defs);
    el('rect', { width: 7, height: 7, class: 'nen-la-thep' }, p);
    el('line', ngang ? { x1: 0, y1: 0, x2: 7, y2: 0, class: 'vach-la-thep' } : { x1: 0, y1: 0, x2: 0, y2: 7, class: 'vach-la-thep' }, p);
  };
  pat('la-doc', false);
  pat('la-ngang', true);
  const caro = el('pattern', { id: 'o-caro', width: 8, height: 8, patternUnits: 'userSpaceOnUse' }, defs);
  el('rect', { width: 8, height: 8, fill: '#fde2e2' }, caro);
  el('path', { d: 'M0 0 H8 M0 0 V8', stroke: MAU.CA, 'stroke-width': 1.4 }, caro);
  const soc = el('pattern', { id: 'o-soc', width: 6, height: 8, patternUnits: 'userSpaceOnUse' }, defs);
  el('rect', { width: 6, height: 8, fill: '#e3efff' }, soc);
  el('path', { d: 'M0 0 V8', stroke: MAU.HA, 'stroke-width': 1.4 }, soc);
  el('rect', { x: -2000, y: -1200, width: 5600, height: 3300, class: 'nen-san-khau' }, svg);
  const r = { a: {}, b: {}, c: {} };

  // ======================= A: LÕI THÉP, LẮP RÁP =======================
  const gA = el('g', { class: 'kb-loi-thep' }, svg);
  r.a.g = gA;
  const gLR = el('g', { class: 'khu' }, gA);
  el('rect', { x: 20, y: 20, width: 1000, height: 870, rx: 18, class: 'the-svg' }, gLR);
  el('text', { x: 44, y: 60, class: 'tieu-de-svg' }, gLR).textContent = 'Lắp ráp ruột MBA 3 pha kiểu trụ';
  el('text', { x: 44, y: 92, class: 'chu-svg' }, gLR).textContent = 'Theo hình slide 25: T – trụ, G – gông. Hình vẽ minh họa, không theo tỷ lệ.';
  r.a.duoi = el('rect', { x: CT.x0, y: CT.yD0, width: CT.x1 - CT.x0, height: CT.yD1 - CT.yD0, class: 'loi-mba ngang' }, gLR);
  r.a.tru = CT.tru.map((x) => el('rect', { x, width: CT.rong, class: 'loi-mba doc' }, gLR));
  r.a.ha = el('g', { class: 'lop-day ha' }, gLR);
  r.a.ca = el('g', { class: 'lop-day ca' }, gLR);
  for (const x of CT.tru) {
    for (const [xx, w] of haiBen(x, CT.rong, LOP.khe1, LOP.khe1 + LOP.ha)) el('rect', { x: xx, y: 290, width: w, height: 340, rx: 3, class: 'cuon-ha' }, r.a.ha);
    for (const [xx, w] of haiBen(x, CT.rong, LOP.khe1 + LOP.ha + LOP.khe2, LOP.khe1 + LOP.ha + LOP.khe2 + LOP.ca)) el('rect', { x: xx, y: 300, width: w, height: 320, rx: 3, class: 'cuon-ca' }, r.a.ca);
  }
  r.a.tren = el('rect', { x: CT.x0, y: CT.yT0, width: CT.x1 - CT.x0, height: CT.yT1 - CT.yT0, class: 'loi-mba ngang' }, gLR);
  // từ thông chính khép kín qua hai cửa sổ
  r.a.phi = el('g', { class: 'tu-thong-chinh' }, gLR);
  const m = CT.rong / 2;
  for (const k of [0, 1]) {
    el('rect', { x: CT.tru[k] + m, y: CT.yT0 + m, width: CT.tru[k + 1] - CT.tru[k], height: CT.yD1 - CT.yT0 - 2 * m, rx: 8, class: 'duong-phi' }, r.a.phi);
  }
  // nhãn T, G, 1, 2, 3
  r.a.nhan = el('g', { class: 'nhan-ruot' }, gLR);
  for (const x of CT.tru) el('text', { x: x + m, y: 468, class: 'chu-tg', 'text-anchor': 'middle' }, r.a.nhan).textContent = 'T';
  for (const y of [CT.yT0 + 45, CT.yD0 + 45]) el('text', { x: 367, y, class: 'chu-tg', 'text-anchor': 'middle' }, r.a.nhan).textContent = 'G';
  const xHA = CT.x0 - LOP.khe1 - LOP.ha / 2;
  const xCA = CT.x0 - LOP.khe1 - LOP.ha - LOP.khe2 - LOP.ca / 2;
  for (const [so, x, y] of [['1', xHA, 630], ['2', xCA, 620], ['3', CT.x0 + 30, CT.yD1]]) {
    const xNhan = { 1: 150, 2: 100, 3: 230 }[so];
    el('path', { d: `M${x} ${y} L${xNhan} 770`, class: 'duong-chi' }, r.a.nhan);
    el('text', { x: xNhan, y: 794, class: 'so-chu-thich', 'text-anchor': 'middle' }, r.a.nhan).textContent = so;
  }
  el('text', { x: 300, y: 794, class: 'chu-svg' }, r.a.nhan).textContent = '1 – Cuộn dây hạ áp; 2 – Cuộn dây cao áp; 3 – Mạch từ';
  r.a.chuBuoc = el('text', { x: 44, y: 860, class: 'chu-kq dam' }, gLR);

  // lá thép và dòng điện xoáy
  const gLT = el('g', { class: 'khu' }, gA);
  el('rect', { x: 1040, y: 20, width: 540, height: 500, rx: 18, class: 'the-svg' }, gLT);
  el('text', { x: 1064, y: 60, class: 'tieu-de-svg' }, gLT).textContent = 'Lá thép phủ sơn cách điện';
  el('text', { x: 1064, y: 92, class: 'chu-svg' }, gLT).textContent = 'Mặt cắt ngang trụ thép; từ thông xoay chiều ⊗ đi qua.';
  const K = { x0: 1120, y0: 120, w: 380, h: 270 };
  r.a.K = K;
  r.a.khoi = el('g', {}, gLT);
  r.a.xoay = el('g', {}, gLT);
  r.a.chuLT1 = el('text', { x: 1064, y: 432, class: 'chu-svg' }, gLT);
  r.a.chuLT2 = el('text', { x: 1064, y: 462, class: 'chu-kq dam' }, gLT);
  el('text', { x: 1064, y: 500, class: 'chu-svg-nho' }, gLT).textContent = 'Hình minh họa định tính dòng điện xoáy (vòng đỏ).';

  // các bước lắp ráp
  const gBL = el('g', { class: 'khu' }, gA);
  el('rect', { x: 1040, y: 540, width: 540, height: 350, rx: 18, class: 'the-svg' }, gBL);
  el('text', { x: 1064, y: 580, class: 'tieu-de-svg' }, gBL).textContent = 'Các bước lắp ráp';
  r.a.dsBuoc = nd.lapRap.map((b, k) => {
    const y = 600 + k * 52;
    const g = el('g', { class: 'hang-buoc', 'data-buoc': k }, gBL);
    el('rect', { x: 1052, y, width: 516, height: 46, rx: 10, class: 'nen-hang-buoc' }, g);
    el('circle', { cx: 1076, cy: y + 23, r: 14, class: 'cham-buoc' }, g);
    const so = el('text', { x: 1076, y: y + 29, class: 'so-buoc', 'text-anchor': 'middle' }, g);
    so.textContent = k + 1;
    el('text', { x: 1102, y: y + 29, class: 'chu-svg ten-buoc' }, g).textContent = b.ten;
    return { g, so };
  });
  el('text', { x: 1064, y: 878, class: 'chu-svg-nho' }, gBL).textContent = 'Ảnh thực tế: slide 27 (ghép mạch từ), 33, 34 (lắp dây quấn).';

  // ======================= B: DÂY QUẤN =======================
  const gB = el('g', { class: 'kb-day-quan' }, svg);
  r.b.g = gB;
  const gSX = el('g', { class: 'khu' }, gB);
  el('rect', { x: 20, y: 20, width: 740, height: 870, rx: 18, class: 'the-svg' }, gSX);
  el('text', { x: 44, y: 60, class: 'tieu-de-svg' }, gSX).textContent = 'Sắp xếp dây quấn CA và HA trên trụ';
  r.b.tieuDePhu = el('text', { x: 44, y: 92, class: 'chu-svg' }, gSX);
  const TR = { x0: 330, x1: 410, y0: 190, y1: 770 };
  el('rect', { x: 90, y: 140, width: 560, height: 50, class: 'loi-mba ngang' }, gSX);
  el('rect', { x: 90, y: TR.y1, width: 560, height: 50, class: 'loi-mba ngang' }, gSX);
  el('rect', { x: TR.x0, y: TR.y0, width: TR.x1 - TR.x0, height: TR.y1 - TR.y0, class: 'loi-mba doc' }, gSX);
  el('line', { x1: 370, x2: 370, y1: 120, y2: 840, class: 'truc-doi-xung' }, gSX);
  el('text', { x: 370, y: 486, class: 'chu-tg', 'text-anchor': 'middle' }, gSX).textContent = 'T';
  el('text', { x: 140, y: 174, class: 'chu-tg', 'text-anchor': 'middle' }, gSX).textContent = 'G';
  el('text', { x: 140, y: 804, class: 'chu-tg', 'text-anchor': 'middle' }, gSX).textContent = 'G';
  // đồng tâm
  r.b.dongTam = el('g', { class: 'sap-xep' }, gSX);
  for (const [xx, w] of haiBen(TR.x0, TR.x1 - TR.x0, 10, 46)) el('rect', { x: xx, y: 220, width: w, height: 520, rx: 3, fill: 'url(#o-soc)', class: 'vien-ha' }, r.b.dongTam);
  for (const [xx, w] of haiBen(TR.x0, TR.x1 - TR.x0, 60, 106)) el('rect', { x: xx, y: 232, width: w, height: 496, rx: 3, fill: 'url(#o-caro)', class: 'vien-ca' }, r.b.dongTam);
  for (const [chu, x, y] of [['HA', 446, 380], ['CA', 498, 440]]) {
    el('path', { d: `M${x} ${y} L590 ${y - 40}`, class: 'duong-chi' }, r.b.dongTam);
    el('text', { x: 598, y: y - 34, class: `nhan-hc ${chu.toLowerCase()}` }, r.b.dongTam).textContent = chu;
  }
  // xen kẽ
  r.b.xenKe = el('g', { class: 'sap-xep' }, gSX);
  const banh = thuTuBanhXenKe(nd.xenKe.soBanhCA);
  const hBanh = (b) => (b.nua ? 52 : 108);
  const khe = 14;
  const tong = banh.reduce((sTong, b) => sTong + hBanh(b), 0) + khe * (banh.length - 1);
  let y = (TR.y0 + TR.y1) / 2 - tong / 2;
  for (const b of banh) {
    const h = hBanh(b);
    for (const [xx, w] of haiBen(TR.x0, TR.x1 - TR.x0, 10, 100)) {
      el('rect', { x: xx, y, width: w, height: h, rx: 3, fill: b.loai === 'HA' ? 'url(#o-soc)' : 'url(#o-caro)', class: b.loai === 'HA' ? 'vien-ha' : 'vien-ca' }, r.b.xenKe);
    }
    el('text', { x: 540, y: y + h / 2 + 7, class: `nhan-hc ${b.loai.toLowerCase()}` }, r.b.xenKe).textContent = b.nua ? `${b.loai} (nửa bánh)` : b.loai;
    y += h + khe;
  }
  r.b.chuSX1 = el('text', { x: 44, y: 858, class: 'chu-svg' }, gSX);
  r.b.chuSX2 = el('text', { x: 44, y: 882, class: 'chu-svg' }, gSX);

  // bốn kiểu dây quấn đồng tâm
  const gK = el('g', { class: 'khu kieu-dong-tam' }, gB);
  r.b.khuKieu = gK;
  el('rect', { x: 780, y: 20, width: 800, height: 870, rx: 18, class: 'the-svg' }, gK);
  el('text', { x: 804, y: 60, class: 'tieu-de-svg' }, gK).textContent = 'Các kiểu dây quấn đồng tâm (slide 29–30)';
  r.b.o = {};
  nd.kieuDayQuan.forEach((k, i) => {
    const x = 796 + (i % 2) * 392;
    const yO = 80 + Math.floor(i / 2) * 404;
    const g = el('g', { class: 'o-kieu', 'data-kieu': k.id }, gK);
    el('rect', { x, y: yO, width: 376, height: 392, rx: 14, class: 'nen-o-kieu' }, g);
    const quan = veKieuDayQuan(g, k.id, x + 188, yO + 140);
    el('text', { x: x + 16, y: yO + 286, class: 'ten-kieu' }, g).textContent = k.ten;
    k.dong.forEach((d, j) => { el('text', { x: x + 16, y: yO + 316 + j * 26, class: 'chu-o-kieu' }, g).textContent = d; });
    el('text', { x: x + 360, y: yO + 378, class: 'chu-svg-nho', 'text-anchor': 'end' }, g).textContent = k.nguon;
    r.b.o[k.id] = { g, quan };
  });

  // ======================= C: VỎ MÁY =======================
  const gC = el('g', { class: 'kb-vo-may' }, svg);
  r.c.g = gC;
  const gV = el('g', { class: 'khu ban-ve' }, gC);
  r.c.banVe = gV;
  el('rect', { x: 20, y: 20, width: 1000, height: 870, rx: 18, class: 'the-svg' }, gV);
  el('text', { x: 44, y: 60, class: 'tieu-de-svg' }, gV).textContent = 'Bản vẽ cấu tạo máy biến áp (slide 26)';
  el('text', { x: 44, y: 92, class: 'chu-svg' }, gV).textContent = 'Bấm vào số hoặc bộ phận để xem nhiệm vụ.';
  const T = { x0: 260, x1: 760, y0: 330, y1: 740, giua: 510 };
  r.c.T = T;
  const bp = (id) => el('g', { class: 'bo-phan', 'data-bp': id }, gV);
  // cánh tỏa nhiệt
  const gCanh = bp('canh');
  for (const [x0, xOng, wOng] of [[140, 140, 120], [776, 760, 118]]) {
    for (const yy of [372, 690]) el('rect', { x: xOng, y: yy, width: wOng, height: 12, class: 'ong-canh' }, gCanh);
    for (let k = 0; k < 6; k++) el('rect', { x: x0 + k * 18, y: 360, width: 12, height: 350, rx: 4, class: 'la-canh' }, gCanh);
  }
  // chân đế
  const gChan = bp('chan');
  el('rect', { x: 280, y: T.y1, width: 460, height: 22, class: 'vo-thung' }, gChan);
  for (const x of [300, 660]) el('path', { d: `M${x} ${T.y1 + 22} v34 h60 v-34`, class: 'ray-chan' }, gChan);
  // dầu và ruột máy (thấy được khi cắt bỏ vỏ)
  r.c.dau = el('rect', { x: T.x0 + 8, y: T.y0, width: T.x1 - T.x0 - 16, height: T.y1 - T.y0 - 8, class: 'dau-thung' }, gV);
  const gRuot = bp('ruot');
  const R = { x0: 300, x1: 720, y0: 400, y1: 700, rong: 40 };
  el('rect', { x: R.x0, y: R.y0, width: R.x1 - R.x0, height: 36, class: 'loi-mba ngang' }, gRuot);
  el('rect', { x: R.x0, y: R.y1 - 36, width: R.x1 - R.x0, height: 36, class: 'loi-mba ngang' }, gRuot);
  for (const x of [R.x0, (R.x0 + R.x1) / 2 - R.rong / 2, R.x1 - R.rong]) {
    el('rect', { x, y: R.y0 + 36, width: R.rong, height: R.y1 - R.y0 - 72, class: 'loi-mba doc' }, gRuot);
    for (const [xx, w] of haiBen(x, R.rong, 4, 16)) el('rect', { x: xx, y: R.y0 + 50, width: w, height: R.y1 - R.y0 - 100, class: 'cuon-ha' }, gRuot);
    for (const [xx, w] of haiBen(x, R.rong, 20, 36)) el('rect', { x: xx, y: R.y0 + 56, width: w, height: R.y1 - R.y0 - 112, class: 'cuon-ca' }, gRuot);
  }
  r.c.hatDau = Array.from({ length: 22 }, () => el('circle', { r: 5, class: 'hat-dau' }, gV));
  // vỏ thùng: nửa phải luôn che; nửa trái che khi không cắt
  const gVo = bp('vo');
  r.c.voTrai = el('rect', { x: T.x0, y: T.y0, width: T.giua - T.x0, height: T.y1 - T.y0, class: 'mat-vo' }, gVo);
  el('rect', { x: T.giua, y: T.y0, width: T.x1 - T.giua, height: T.y1 - T.y0, class: 'mat-vo' }, gVo);
  for (const x of [560, 620, 680]) el('line', { x1: x, x2: x, y1: T.y0 + 30, y2: T.y1 - 20, class: 'gan-vo' }, gVo);
  r.c.vienCat = el('path', { d: `M${T.x0} ${T.y0} V${T.y1} H${T.giua}`, class: 'vien-thung' }, gV);
  el('path', { d: `M${T.giua} ${T.y0} H${T.x1} V${T.y1} H${T.giua}`, class: 'vien-thung' }, gV);
  // nắp, móc treo, sứ
  const gNap = bp('nap');
  el('rect', { x: 240, y: 308, width: 540, height: 22, rx: 3, class: 'vo-thung' }, gNap);
  const gMoc = bp('moc');
  for (const x of [300, 768]) el('path', { d: `M${x - 12} 308 v-14 a12 12 0 0 1 24 0 v14`, class: 'moc-treo' }, gMoc);
  const veSu = (g, x, yDinh, soTang) => {
    el('rect', { x: x - 7, y: yDinh - 14, width: 14, height: 16, rx: 3, class: 'dau-su' }, g);
    const cao = (308 - yDinh) / soTang;
    for (let k = 0; k < soTang; k++) {
      const yy = yDinh + k * cao;
      el('path', { d: `M${x - 9} ${yy} L${x - 20} ${yy + cao * 0.55} L${x + 20} ${yy + cao * 0.55} L${x + 9} ${yy} Z`, class: 'tan-su' }, g);
      el('rect', { x: x - 9, y: yy + cao * 0.55, width: 18, height: cao * 0.45, class: 'than-su' }, g);
    }
  };
  const gSuCao = bp('su-cao');
  for (const x of [440, 520, 600]) veSu(gSuCao, x, 172, 6);
  const gSuHa = bp('su-ha');
  for (const x of [650, 690, 730]) veSu(gSuHa, x, 252, 3);
  // bình giãn dầu
  const gBinh = bp('binh');
  for (const x of [262, 382]) el('rect', { x: x - 5, y: 196, width: 10, height: 112, class: 'gia-do' }, gBinh);
  el('rect', { x: 150, y: 132, width: 250, height: 64, rx: 32, class: 'vo-binh' }, gBinh);
  r.c.B = { x0: 158, x1: 392, y0: 140, y1: 188 };
  r.c.dauBinh = el('rect', { x: 158, width: 234, rx: 22, class: 'dau-binh' }, gBinh);
  r.c.chuMuc = el('text', { x: 275, y: 122, class: 'nhan-mba', 'text-anchor': 'middle' }, gV);
  // số thứ tự (slide 26)
  const viTri = { ruot: [380, 560], vo: [640, 470], nap: [470, 319], 'su-cao': [628, 204], moc: [322, 268], canh: [195, 540], chan: [510, 752], 'su-ha': [690, 222] };
  r.c.so = {};
  for (const b of nd.voMay.boPhan) {
    if (!viTri[b.id]) continue;
    const [x, yy] = viTri[b.id];
    const g = el('g', { class: 'so-bp', 'data-bp': b.id, transform: `translate(${x} ${yy})` }, gV);
    el('circle', { r: b.so.length > 2 ? 20 : 15 }, g);
    el('text', { y: 6, 'text-anchor': 'middle' }, g).textContent = b.id === 'canh' ? '6' : b.so;
    r.c.so[b.id] = g;
  }
  const g7 = el('g', { class: 'so-bp', 'data-bp': 'canh', transform: 'translate(831 540)' }, gV);
  el('circle', { r: 15 }, g7);
  el('text', { y: 6, 'text-anchor': 'middle' }, g7).textContent = '7';
  r.c.chuDau = el('text', { x: 44, y: 870, class: 'chu-kq dam' }, gV);

  // danh sách bộ phận
  const gDS = el('g', { class: 'khu' }, gC);
  el('rect', { x: 1040, y: 20, width: 540, height: 870, rx: 18, class: 'the-svg' }, gDS);
  el('text', { x: 1064, y: 60, class: 'tieu-de-svg' }, gDS).textContent = 'Các bộ phận (slide 26, 35)';
  r.c.hang = {};
  nd.voMay.boPhan.forEach((b, k) => {
    const yy = 78 + k * 36;
    const g = el('g', { class: 'hang-bp', 'data-bp': b.id }, gDS);
    el('rect', { x: 1052, y: yy, width: 516, height: 32, rx: 8, class: 'nen-hang-bp' }, g);
    el('text', { x: 1078, y: yy + 22, class: 'so-hang-bp', 'text-anchor': 'middle' }, g).textContent = b.so;
    el('text', { x: 1110, y: yy + 22, class: 'chu-svg ten-hang-bp' }, g).textContent = b.ten;
    r.c.hang[b.id] = g;
  });
  r.c.chiTiet = el('foreignObject', { x: 1052, y: 410, width: 516, height: 470 }, gDS);
  return r;
}

/** Hình vẽ từng kiểu dây quấn đồng tâm (slide 29, 30); trả về path "đường quấn" để tạo hoạt hình. */
function veKieuDayQuan(cha, id, cx, cy) {
  const g = el('g', { class: 'hinh-kieu' }, cha);
  el('line', { x1: cx, x2: cx, y1: cy - 120, y2: cy + 120, class: 'truc-doi-xung' }, g);
  let dQuan = '';
  if (id === 'a') {
    for (const s of [-1, 1]) {
      el('rect', { x: cx + s * 50 - (s < 0 ? 4 : 0), y: cy - 104, width: 4, height: 208, class: 'ong-cach-dien' }, g);
      for (let c = 0; c < 3; c++) {
        for (let k = 0; k < 13; k++) el('circle', { cx: cx + s * (64 + c * 14), cy: cy - 90 + k * 15, r: 6.5, class: 'tiet-dien-tron' }, g);
      }
      el('rect', { x: s < 0 ? cx - 104 : cx + 46, y: cy - 112, width: 58, height: 8, class: 'vanh-dau' }, g);
      el('rect', { x: s < 0 ? cx - 104 : cx + 46, y: cy + 104, width: 58, height: 8, class: 'vanh-dau' }, g);
    }
    for (let k = 0; k < 13; k++) dQuan += `${k ? 'L' : 'M'}${cx - 64} ${cy - 90 + k * 15} L${cx + 64} ${cy - 90 + k * 15 + 7.5} `;
  } else if (id === 'b') {
    for (const s of [-1, 1]) {
      for (let c = 0; c < 2; c++) {
        for (let k = 0; k < 9; k++) el('rect', { x: cx + s * (60 + c * 16) - 5, y: cy - 100 + k * 22, width: 10, height: 18, class: 'tiet-dien-bet' }, g);
      }
    }
    for (let k = 0; k < 9; k++) {
      const yy = cy - 100 + k * 22;
      el('path', { d: `M${cx - 55} ${yy + 2} L${cx + 55} ${yy + 12} L${cx + 55} ${yy + 22} L${cx - 55} ${yy + 12} Z`, class: 'bang-truoc' }, g);
      dQuan += `${k ? 'L' : 'M'}${cx - 55} ${yy + 7} L${cx + 55} ${yy + 17} `;
    }
  } else if (id === 'c') {
    for (const s of [-1, 1]) {
      for (let k = 0; k < 7; k++) {
        const x = s < 0 ? cx - 110 : cx + 62;
        el('rect', { x, y: cy - 104 + k * 30, width: 48, height: 18, class: 'nhom-soi' }, g);
        for (let j = 1; j < 4; j++) el('line', { x1: x + j * 12, x2: x + j * 12, y1: cy - 104 + k * 30, y2: cy - 86 + k * 30, class: 'vach-soi' }, g);
      }
    }
    for (let k = 0; k < 7; k++) {
      const yy = cy - 104 + k * 30;
      el('path', { d: `M${cx - 62} ${yy + 4} L${cx + 62} ${yy + 18} L${cx + 62} ${yy + 30} L${cx - 62} ${yy + 16} Z`, class: 'bang-truoc' }, g);
      dQuan += `${k ? 'L' : 'M'}${cx - 62} ${yy + 10} L${cx + 62} ${yy + 24} `;
    }
  } else {
    for (const s of [-1, 1]) {
      for (let k = 0; k < 8; k++) {
        const x = s < 0 ? cx - 118 : cx + 50;
        el('rect', { x, y: cy - 104 + k * 26, width: 68, height: 14, class: 'banh-day' }, g);
        for (let j = 1; j < 6; j++) el('line', { x1: x + j * 11.3, x2: x + j * 11.3, y1: cy - 104 + k * 26, y2: cy - 90 + k * 26, class: 'vach-soi' }, g);
      }
    }
    for (let k = 0; k < 7; k++) {
      const yy = cy - 90 + k * 26;
      el('line', { x1: cx - 50, y1: yy, x2: cx + 50, y2: yy + 12, class: 'chuyen-banh' }, g);
      dQuan += `${k ? 'L' : 'M'}${cx - 50} ${yy} L${cx + 50} ${yy + 12} `;
    }
  }
  return el('path', { d: dQuan, class: 'duong-quan' }, g);
}

async function khoiDong() {
  let nd, cauHoi;
  try {
    [nd, cauHoi] = await Promise.all([napJSON('du-lieu/cau-tao-mba.json'), napJSON('du-lieu/cau-hoi-cau-tao-mba.json')]);
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
    t: 0,
    buoc: nd.lapRap.length - 1,
    p: 1, // tiến độ hoạt hình của bước hiện tại (0…1)
    tuDong: false,
    laThep: true,
    sapXep: 'dong-tam',
    kieu: 'a',
    boPhan: 'ruot',
    catVo: true,
    nhietDau: nd.voMay.mucDau.macDinh,
  };

  // ---------- Lý thuyết ----------
  const lt = nd.lyThuyet;
  $('#the-ly-thuyet').innerHTML = `
    <p class="muc-nho">${lt.muc}</p>
    <h2>${lt.tieuDe}</h2>
    <p class="phat-bieu">${lt.tongQuan}</p>
    <p class="dong-ly-thuyet"><b>2.4.1. Lõi thép:</b> ${lt.loiThep}</p>
    <p class="quy-tac">${lt.laThep}</p>
    <p class="dong-ly-thuyet"><b>2.4.2. Dây quấn:</b> ${lt.dayQuan.join(' ')}</p>
    <p class="dong-ly-thuyet">${lt.phanLoaiDayQuan}</p>
    <ul class="ghi-chu-ly-thuyet">
      <li><b>Đồng tâm:</b> ${nd.kieuDayQuan.map((k) => `${k.ten.replace(/^[a-d]\) /, '')} (${k.dong.map(thuongDau).join('; ')})`).join('; ')}.</li>
      <li><b>Xen kẽ:</b> ${lt.xenKe}</li>
    </ul>
    <p class="dong-ly-thuyet"><b>2.4.3. Vỏ máy:</b> ${lt.voMay} ${lt.binhGianDau}</p>
    <p class="ghi-chu-nho">${lt.hinhAnh}</p>`;

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
  $('#chon-kich-ban').addEventListener('change', (e) => chonKichBan(e.target.value));
  const nutTMH = $('#nut-toan-man-hinh');
  if (!document.fullscreenEnabled) nutTMH.hidden = true;
  nutTMH.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  });
  document.addEventListener('fullscreenchange', () => nutTMH.classList.toggle('dang-bat', !!document.fullscreenElement));
  const soLieuTC = (chu) => { const o = $('#tc-so-lieu'); if (o) o.textContent = chu; };
  const chuThich = (html, loai = 'thanh-cong') => {
    const c = $('#chu-thich-buoc');
    c.className = `chu-thich-buoc ${loai}`;
    c.innerHTML = `<span>${html}</span>`;
  };

  // ======================= A =======================
  function datBuoc(i, hoatHinh = true) {
    s.buoc = gioiHanBuoc(i, nd.lapRap.length);
    s.p = hoatHinh ? 0 : 1;
    const b = nd.lapRap[s.buoc];
    r.a.dsBuoc.forEach((o, k) => {
      o.g.classList.toggle('xong', k < s.buoc);
      o.g.classList.toggle('dang', k === s.buoc);
      o.so.textContent = k < s.buoc ? '✓' : k + 1;
    });
    r.a.chuBuoc.textContent = `Bước ${s.buoc + 1}/${nd.lapRap.length}: ${b.ten}`;
    $('#sl-buoc').textContent = `${s.buoc + 1}/${nd.lapRap.length}`;
    const lui = $('#lr-lui');
    if (lui) { lui.disabled = s.buoc === 0; $('#lr-tiep').disabled = s.buoc === nd.lapRap.length - 1; }
    chuThich(`<b>Bước ${s.buoc + 1}. ${b.ten}.</b> ${b.moTa}`);
    soLieuTC(`Bước ${s.buoc + 1}/${nd.lapRap.length}: ${b.ten}`);
  }

  function veLaThep() {
    const { K } = r.a;
    r.a.khoi.innerHTML = '';
    r.a.xoay.innerHTML = '';
    // nền ⊗ từ thông
    const soLa = s.laThep ? 8 : 1;
    const rongLa = K.w / soLa;
    for (let k = 0; k < soLa; k++) {
      el('rect', { x: K.x0 + k * rongLa, y: K.y0, width: rongLa, height: K.h, class: 'mat-cat-thep' }, r.a.khoi);
      if (s.laThep && k) el('rect', { x: K.x0 + k * rongLa - 2, y: K.y0, width: 4, height: K.h, class: 'lop-son' }, r.a.khoi);
    }
    for (let x = K.x0 + 24; x < K.x0 + K.w; x += 48) {
      for (let y = K.y0 + 30; y < K.y0 + K.h; y += 54) el('text', { x, y: y + 6, class: 'ky-hieu-phi', 'text-anchor': 'middle' }, r.a.khoi).textContent = '⊗';
    }
    el('rect', { x: K.x0, y: K.y0, width: K.w, height: K.h, class: 'vien-mat-cat' }, r.a.khoi);
    for (let k = 0; k < soLa; k++) {
      const rx = (rongLa - (s.laThep ? 16 : 70)) / 2;
      const ry = K.h / 2 - (s.laThep ? 14 : 36);
      el('ellipse', { cx: K.x0 + (k + 0.5) * rongLa, cy: K.y0 + K.h / 2, rx, ry, class: `vong-xoay ${s.laThep ? 'nho' : 'lon'}` }, r.a.xoay);
    }
    r.a.chuLT1.textContent = s.laThep ? 'Ghép lá thép, mặt lá phủ sơn cách điện (vàng):' : 'Lõi thép liền khối (không ghép lá):';
    r.a.chuLT2.textContent = s.laThep ? 'dòng xoáy bị chia nhỏ trong từng lá → giảm tổn hao' : 'vòng dòng điện xoáy lớn → tổn hao lớn, lõi nóng';
    r.a.chuLT2.setAttribute('class', `chu-kq dam ${s.laThep ? '' : 'xau'}`);
    $('#sl-la-thep').textContent = s.laThep ? 'Ghép lá thép phủ sơn' : 'Liền khối (so sánh)';
    const o = $('#lr-la-thep');
    if (o) o.checked = s.laThep;
  }

  // ======================= B =======================
  function capNhatB() {
    const dongTam = s.sapXep === 'dong-tam';
    r.b.dongTam.style.opacity = dongTam ? 1 : 0;
    r.b.xenKe.style.opacity = dongTam ? 0 : 1;
    r.b.khuKieu.classList.toggle('mo', !dongTam);
    r.b.tieuDePhu.textContent = dongTam ? 'Dây quấn đồng tâm – nửa mặt cắt dọc trụ thép' : 'Dây quấn xen kẽ – nửa mặt cắt dọc trụ thép';
    r.b.chuSX1.textContent = dongTam ? 'HA đặt trong, sát trụ; CA lồng đồng tâm bên ngoài (như slide 25).' : 'Bánh dây CA, HA quấn xen kẽ dọc theo trụ thép;';
    r.b.chuSX2.textContent = dongTam ? 'Đường đứt: trục đối xứng của trụ.' : 'một bánh HA chia làm hai, đặt sát gông (slide 31).';
    Object.entries(r.b.o).forEach(([id, o]) => o.g.classList.toggle('chon', dongTam && id === s.kieu));
    const k = nd.kieuDayQuan.find((x) => x.id === s.kieu);
    $('#sl-sap-xep').textContent = dongTam ? 'Đồng tâm' : 'Xen kẽ';
    $('#sl-kieu').textContent = dongTam ? k.ten : '—';
    $('#sl-dung').textContent = dongTam ? k.dong[1].replace(/^Thường làm |^Chủ yếu làm /, '') : 'Hai dây quấn có nhiều đầu dây';
    document.querySelectorAll('[data-sx]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sx === s.sapXep)));
    if (dongTam) {
      chuThich(`<b>Dây quấn đồng tâm – ${k.ten}:</b> ${k.dong.map(thuongDau).join('; ')} (${k.nguon}).`);
      soLieuTC(`Đồng tâm · ${k.ten}: ${k.dong[1]}`);
    } else {
      chuThich(`<b>Dây quấn xen kẽ:</b> ${nd.lyThuyet.xenKe}`);
      soLieuTC('Xen kẽ: HA (nửa) – CA – HA – CA – HA (nửa)');
    }
  }
  svg.addEventListener('click', (e) => {
    if (s.kichBan === 'day-quan') {
      const o = e.target.closest('.o-kieu');
      if (o) { s.kieu = o.dataset.kieu; s.sapXep = 'dong-tam'; s.tQuan = 0; capNhatB(); }
    } else if (s.kichBan === 'vo-may') {
      const o = e.target.closest('[data-bp]');
      if (o) chonBoPhan(o.dataset.bp);
    }
  });

  // ======================= C =======================
  function chonBoPhan(id) {
    s.boPhan = id;
    const b = nd.voMay.boPhan.find((x) => x.id === id);
    r.c.banVe.classList.add('co-chon');
    r.c.banVe.querySelectorAll('[data-bp]').forEach((o) => o.classList.toggle('chon', o.dataset.bp === id));
    Object.entries(r.c.hang).forEach(([ma, g]) => g.classList.toggle('chon', ma === id));
    r.c.chiTiet.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" class="chi-tiet-bp">
      <h3>${b.so === '–' ? '' : `<span class="so-tron">${b.so}</span>`}${b.ten}</h3>
      <p>${b.moTa}</p>
      <h4>Yêu cầu đối với vỏ máy (slide 35)</h4>
      <ul>${nd.lyThuyet.yeuCauVo.map((y) => `<li>${y}</li>`).join('')}</ul>
    </div>`;
    $('#sl-bp').textContent = `${tienTo(b)}${b.ten}`;
    chuThich(`<b>${tienTo(b)}${b.ten}:</b> ${b.moTa}`);
    soLieuTC(`${tienTo(b)}${b.ten}`);
  }
  function capNhatC() {
    r.c.voTrai.style.display = s.catVo ? 'none' : '';
    r.c.vienCat.setAttribute('class', s.catVo ? 'vien-thung cat' : 'vien-thung');
    const muc = mucDauBinhGian(s.nhietDau, nd.voMay.mucDau);
    const { B } = r.c;
    const h = (B.y1 - B.y0) * muc;
    r.c.dauBinh.setAttribute('y', (B.y1 - h).toFixed(1));
    r.c.dauBinh.setAttribute('height', h.toFixed(1));
    const nhan = s.nhietDau < 0.34 ? 'lạnh' : s.nhietDau < 0.67 ? 'ấm' : 'nóng';
    r.c.chuMuc.textContent = `Bình giãn dầu – mức dầu ${dinhDangSo(muc * 100, 0)} %`;
    r.c.chuDau.textContent = `Dầu ${nhan} → mức dầu trong bình giãn dầu ${dinhDangSo(muc * 100, 0)} %; thùng máy luôn đầy dầu ✓`;
    r.c.dau.style.fill = `color-mix(in srgb, #e8a33a ${Math.round(40 + 50 * s.nhietDau)}%, #f6e7b6)`;
    $('#sl-nhiet-dau').textContent = nhan;
    $('#sl-muc-dau').textContent = `${dinhDangSo(muc * 100, 0)} %`;
    const o = $('#vm-nhiet');
    if (o) o.value = Math.round(s.nhietDau * 100);
    const c = $('#vm-cat');
    if (c) c.checked = s.catVo;
  }

  // ---------- Kịch bản & điều khiển ----------
  function chonKichBan(id) {
    s.kichBan = id;
    $('#chon-kich-ban').value = id;
    document.body.dataset.kichBan = id;
    r.a.g.style.display = id === 'loi-thep' ? '' : 'none';
    r.b.g.style.display = id === 'day-quan' ? '' : 'none';
    r.c.g.style.display = id === 'vo-may' ? '' : 'none';
    document.querySelectorAll('[data-che-do]').forEach((o) => { o.hidden = o.dataset.cheDo !== id; });
    veDieuKhien();
    if (id === 'loi-thep') { veLaThep(); datBuoc(s.buoc, false); }
    if (id === 'day-quan') capNhatB();
    if (id === 'vo-may') { capNhatC(); chonBoPhan(s.boPhan); }
  }

  function veDieuKhien() {
    const dk = $('#dieu-khien-kich-ban');
    if (s.kichBan === 'loi-thep') {
      dk.innerHTML = `
        <p class="mo-ta">Lắp ráp ruột MBA 3 pha kiểu trụ từng bước; so sánh lõi liền khối với lõi ghép lá thép phủ sơn cách điện.</p>
        <div class="hang-nut">
          <button type="button" class="nut" id="lr-lui">◀ Bước trước</button>
          <button type="button" class="nut nut-chinh" id="lr-tiep">Bước tiếp ▶</button>
          <button type="button" class="nut" id="lr-tu-dong">↻ Tự động lắp từ đầu</button>
        </div>
        <label class="o-chon"><input type="checkbox" id="lr-la-thep" ${s.laThep ? 'checked' : ''}> Lõi ghép lá thép phủ sơn cách điện</label>`;
      dk.querySelector('#lr-lui').addEventListener('click', () => { s.tuDong = false; datBuoc(s.buoc - 1, false); });
      dk.querySelector('#lr-tiep').addEventListener('click', () => { s.tuDong = false; datBuoc(s.buoc + 1); });
      dk.querySelector('#lr-tu-dong').addEventListener('click', () => { s.tuDong = true; datBuoc(0); });
      dk.querySelector('#lr-la-thep').addEventListener('change', (e) => { s.laThep = e.target.checked; veLaThep(); });
    } else if (s.kichBan === 'day-quan') {
      dk.innerHTML = `
        <p class="mo-ta">Chọn cách sắp xếp dây quấn CA và HA; bấm vào một ô để xem kiểu dây quấn đồng tâm.</p>
        <div class="hang-nut">
          <button type="button" class="nut" data-sx="dong-tam" aria-pressed="${s.sapXep === 'dong-tam'}">Đồng tâm</button>
          <button type="button" class="nut" data-sx="xen-ke" aria-pressed="${s.sapXep === 'xen-ke'}">Xen kẽ</button>
        </div>`;
      dk.querySelectorAll('[data-sx]').forEach((b) => b.addEventListener('click', () => { s.sapXep = b.dataset.sx; capNhatB(); }));
    } else {
      dk.innerHTML = `
        <p class="mo-ta">Bấm vào bộ phận trên bản vẽ hoặc trong danh sách. Thay đổi nhiệt độ dầu để thấy vai trò của bình giãn dầu.</p>
        <label class="o-chon"><input type="checkbox" id="vm-cat" ${s.catVo ? 'checked' : ''}> Cắt bỏ nửa vỏ để thấy ruột máy</label>
        <label class="dieu-khien doc"><span>Nhiệt độ dầu</span> <input type="range" id="vm-nhiet" min="0" max="100" step="1" value="${Math.round(s.nhietDau * 100)}"><output>lạnh → nóng</output></label>
        <p class="ghi-chu-nho">Mức nhiệt độ định tính; slide không cho số liệu. Dòng dầu tuần hoàn qua cánh tỏa nhiệt vẽ minh họa.</p>`;
      dk.querySelector('#vm-cat').addEventListener('change', (e) => { s.catVo = e.target.checked; capNhatC(); });
      dk.querySelector('#vm-nhiet').addEventListener('input', (e) => { s.nhietDau = Number(e.target.value) / 100; capNhatC(); });
    }
  }

  // ---------- Trình chiếu & câu hỏi ----------
  const trinhChieu = khoiTaoTrinhChieu({
    noiDung: null,
    cacBuocTrinhChieu: nd.trinhChieu,
    lamNoiBat: (id, b) => {
      const tt = b?.trangThai;
      if (!tt) return;
      if (tt.buoc !== undefined) { s.buoc = tt.buoc; s.tuDong = false; }
      if (tt.laThep !== undefined) s.laThep = tt.laThep;
      if (tt.sapXep) s.sapXep = tt.sapXep;
      if (tt.kieu) s.kieu = tt.kieu;
      if (tt.boPhan) s.boPhan = tt.boPhan;
      if (tt.catVo !== undefined) s.catVo = tt.catVo;
      if (tt.mucDau !== undefined) s.nhietDau = tt.mucDau;
      chonKichBan(tt.kichBan);
      if (tt.kichBan === 'loi-thep') datBuoc(s.buoc);
    },
  });
  khoiTaoCauHoi(cauHoi);
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, select, textarea, dialog')) return;
    if (trinhChieu.xuLyPhim(e)) return;
    if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); datChay(!s.dangChay); }
  });

  // ---------- Vòng lặp ----------
  const duongDau = el('path', {
    d: `M390 690 V360 H${r.c.T.x0 + 16} L250 378 H196 V696 H250 L${r.c.T.x0 + 16} 690 Z`, class: 'an',
  }, r.c.g);
  const daiDau = duongDau.getTotalLength();
  const em = (x) => 1 - (1 - x) ** 3;
  s.tQuan = 0;
  let tTruoc = performance.now();
  function khung(bayGio) {
    const dtThuc = Math.min(0.1, Math.max(0, (bayGio - tTruoc) / 1000));
    tTruoc = bayGio;
    const dt = s.dangChay ? dtThuc * s.tocDo : 0;
    s.t += dt;
    if (s.kichBan === 'loi-thep') {
      s.p = Math.min(1, s.p + dt / THOI_GIAN_BUOC_S);
      if (s.tuDong && s.p >= 1 && s.buoc < nd.lapRap.length - 1) {
        s.cho = (s.cho || 0) + dt;
        if (s.cho > 0.6) { s.cho = 0; datBuoc(s.buoc + 1); }
      }
      const p = em(s.p);
      const pBuoc = (k) => (s.buoc > k ? 1 : s.buoc === k ? p : 0);
      // bước 0: trụ "mọc" lên từ gông dưới
      const h0 = (CT.yD0 - CT.yT1) * pBuoc(0);
      r.a.tru.forEach((o) => {
        const h = s.buoc === 0 ? h0 : CT.yD0 - CT.yT1;
        o.setAttribute('y', (CT.yD0 - h).toFixed(1));
        o.setAttribute('height', h.toFixed(1));
      });
      const truot = (o, k, dy) => {
        o.style.display = s.buoc >= k ? '' : 'none';
        o.setAttribute('transform', `translate(0 ${(-dy * (1 - pBuoc(k))).toFixed(1)})`);
      };
      truot(r.a.ha, 1, 420);
      truot(r.a.ca, 2, 420);
      truot(r.a.tren, 3, 160);
      r.a.phi.style.display = s.buoc >= 3 ? '' : 'none';
      r.a.phi.style.opacity = (s.buoc > 3 ? 1 : pBuoc(3)).toFixed(2);
      r.a.phi.style.strokeDashoffset = (-(s.t * 40) % 36).toFixed(1);
      r.a.nhan.style.opacity = s.buoc >= 4 ? pBuoc(4).toFixed(2) : 0;
      // dòng điện xoáy chạy vòng
      r.a.xoay.style.strokeDashoffset = (-(s.t * (s.laThep ? 20 : 60)) % 30).toFixed(1);
    } else if (s.kichBan === 'day-quan') {
      s.tQuan = (s.tQuan + dt / 3) % 1.25;
      for (const [id, o] of Object.entries(r.b.o)) {
        const dai = o.quan.getTotalLength();
        o.quan.style.strokeDasharray = `${dai}`;
        o.quan.style.strokeDashoffset = id === s.kieu && s.sapXep === 'dong-tam' ? (dai * (1 - Math.min(1, s.tQuan))).toFixed(1) : '0';
      }
    } else {
      r.c.hatDau.forEach((h, k) => {
        h.style.display = s.catVo ? '' : 'none';
        if (!s.catVo) return;
        const u = (k / r.c.hatDau.length + s.t * (0.04 + 0.05 * s.nhietDau)) % 1;
        const q = duongDau.getPointAtLength(u * daiDau);
        h.setAttribute('cx', q.x.toFixed(1));
        h.setAttribute('cy', q.y.toFixed(1));
        // dầu nóng (đi lên giữa thùng) màu đỏ, dầu nguội (đi xuống trong cánh tỏa nhiệt) màu xanh
        h.setAttribute('class', `hat-dau ${q.x > 300 && q.y < 690 ? 'nong' : q.x < 255 ? 'nguoi' : ''}`);
      });
    }
    requestAnimationFrame(khung);
  }

  chonKichBan(s.kichBan);
  document.body.classList.add('da-san-sang');
  requestAnimationFrame(khung);
}

khoiDong().catch((loi) => {
  console.error(loi);
  const tb = document.querySelector('#thong-bao-loi');
  if (tb) { tb.hidden = false; tb.innerHTML = `<h2>Lỗi khởi động mô phỏng</h2><p>${loi.message}</p>`; }
});
