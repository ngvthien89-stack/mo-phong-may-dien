/**
 * vat-lieu.js — Trang 1.3 "Các loại vật liệu dùng trong máy điện" (slide 11).
 *
 * Kịch bản a (phan-loai): trò chơi xếp 15 thẻ vật liệu vào ba nhóm dẫn điện / dẫn từ / cách điện.
 * Kịch bản b (mba): hình cắt minh họa máy biến áp, bấm từng bộ phận để xem nhiệm vụ và nhóm vật liệu.
 * Kịch bản c (nhiet-do): nhiệt độ làm việc của dây quấn và bảng 7 cấp cách điện.
 */
import { el } from './so-do.js';
import { danhGiaCap, capThapNhat, xepDung, xaoTron } from './cach-dien.js';
import { dinhDangSo } from './tinh-toan.js';
import { khoiTaoTrinhChieu } from './trinh-chieu.js';
import { khoiTaoCauHoi } from './kiem-tra.js';
import { napJSON } from './tien-ich.js';

const $ = (s) => document.querySelector(s);
const MAU_KET_CAU = '#8d99a6';

// ---------- Kịch bản a: bố cục khay và các ô nhóm ----------
const KHAY = { x: 20, y: 20, w: 1560, h: 360 };
const THE_KHAY = { w: 280, h: 64, x0: 44, y0: 112, buocX: 302, buocY: 80, cot: 5 };
const O_NHOM = {
  'dan-dien': { x: 20, y: 400, w: 370, h: 490, cot: 2, theW: 155 },
  'dan-tu': { x: 410, y: 400, w: 370, h: 490, cot: 2, theW: 155 },
  'cach-dien': { x: 800, y: 400, w: 780, h: 490, cot: 4, theW: 172 },
};
const THE_NHOM_H = 58;

// Dòng chữ hiện ở chân ô nhóm khi xếp đủ (nội dung slide 11)
const CHAN_NHOM = {
  'dan-dien': ['✓ Slide: Cu, Al, hợp kim'],
  'dan-tu': ['✓ Vật liệu sắt từ: thép kỹ thuật điện,', 'gang, thép đúc, thép rèn…'],
  'cach-dien': ['✓ Phần lớn ở thể rắn (4 nhóm); ngoài ra thể khí (không khí), thể lỏng (dầu).'],
};

// ---------- Kịch bản c: thang nhiệt độ ----------
const NHIET = { tMin: 0, tMax: 220, yDuoi: 780, yTren: 150 };
const yNhiet = (t) => NHIET.yDuoi - ((t - NHIET.tMin) / (NHIET.tMax - NHIET.tMin)) * (NHIET.yDuoi - NHIET.yTren);
const DT = { x0: 770, x1: 1440, yDuoi: 760, yTren: 150 };
const yCot = (t) => DT.yDuoi - (t / NHIET.tMax) * (DT.yDuoi - DT.yTren);

/** Màu dây quấn theo nhiệt độ: xanh (nguội) → cam → đỏ (nóng). */
function mauNhietDo(t) {
  const diem = [[20, [76, 139, 245]], [100, [240, 180, 60]], [160, [235, 104, 52]], [220, [198, 40, 40]]];
  if (t <= diem[0][0]) return `rgb(${diem[0][1].join(',')})`;
  for (let k = 1; k < diem.length; k++) {
    if (t <= diem[k][0]) {
      const [t0, c0] = diem[k - 1];
      const [t1, c1] = diem[k];
      const a = (t - t0) / (t1 - t0);
      return `rgb(${c0.map((c, j) => Math.round(c + (c1[j] - c) * a)).join(',')})`;
    }
  }
  return `rgb(${diem[diem.length - 1][1].join(',')})`;
}

function veSanKhau(svg, nd) {
  svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  const gc = el('pattern', { id: 'la-thep', width: 8, height: 8, patternUnits: 'userSpaceOnUse' }, defs);
  el('rect', { width: 8, height: 8, class: 'nen-la-thep' }, gc);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 8, class: 'vach-la-thep' }, gc);
  // cột cấp C (slide ghi "> 180"): tô nhạt dần lên trên để thể hiện không có giới hạn trên cụ thể
  const gd = el('linearGradient', { id: 'cot-mo', x1: 0, y1: 1, x2: 0, y2: 0 }, defs);
  el('stop', { offset: 0.55, 'stop-color': '#66bb6a' }, gd);
  el('stop', { offset: 1, 'stop-color': '#66bb6a', 'stop-opacity': 0 }, gd);
  el('rect', { x: -2000, y: -1200, width: 5600, height: 3300, class: 'nen-san-khau' }, svg);
  const r = { a: {}, b: {}, c: {} };

  // ======================= A: PHÂN LOẠI =======================
  const gA = el('g', { class: 'kb-phan-loai' }, svg);
  r.a.g = gA;
  r.a.khay = el('g', { class: 'khu' }, gA);
  el('rect', { x: KHAY.x, y: KHAY.y, width: KHAY.w, height: KHAY.h, rx: 18, class: 'the-svg' }, r.a.khay);
  el('text', { x: 44, y: 60, class: 'tieu-de-svg' }, r.a.khay).textContent = 'Khay vật liệu – xếp từng thẻ vào đúng nhóm';
  el('text', { x: 44, y: 92, class: 'chu-svg' }, r.a.khay).textContent = 'Kéo thẻ thả vào ô nhóm, hoặc bấm chọn thẻ rồi bấm vào ô nhóm (bàn phím: Tab, Enter rồi phím 1, 2, 3).';
  r.a.khayTrong = el('text', { x: 800, y: 240, class: 'chu-khay-trong', 'text-anchor': 'middle' }, r.a.khay);
  r.a.o = {};
  for (const n of nd.nhom) {
    const o = O_NHOM[n.id];
    const g = el('g', { class: 'khu o-nhom', 'data-nhom': n.id, style: `--mau-nhom:${n.mau}` }, gA);
    el('rect', { x: o.x, y: o.y, width: o.w, height: o.h, rx: 18, class: 'the-svg vung-tha' }, g);
    el('path', { d: `M${o.x} ${o.y + 70} V${o.y + 18} a18 18 0 0 1 18 -18 H${o.x + o.w - 18} a18 18 0 0 1 18 18 V${o.y + 70} Z`, class: 'dau-o-nhom' }, g);
    el('text', { x: o.x + 22, y: o.y + 45, class: 'ten-o-nhom' }, g).textContent = `${n.phim}. ${n.ten}`;
    const dem = el('text', { x: o.x + o.w - 22, y: o.y + 45, class: 'dem-o-nhom', 'text-anchor': 'end' }, g);
    const chan = CHAN_NHOM[n.id].map((_, k) => el('text', { x: o.x + 22, y: o.y + o.h - 22 - (CHAN_NHOM[n.id].length - 1 - k) * 24, class: 'chan-o-nhom' }, g));
    r.a.o[n.id] = { g, dem, chan, lop: el('g', {}, g) };
  }
  r.a.lopKeo = el('g', { class: 'lop-keo' }, gA);

  // ======================= B: MÁY BIẾN ÁP =======================
  const gB = el('g', { class: 'kb-mba' }, svg);
  r.b.g = gB;
  const gH = el('g', { class: 'khu mba' }, gB);
  r.b.hinh = gH;
  el('rect', { x: 20, y: 20, width: 1000, height: 870, rx: 18, class: 'the-svg' }, gH);
  el('text', { x: 44, y: 60, class: 'tieu-de-svg' }, gH).textContent = 'Vật liệu trong máy biến áp (hình cắt minh họa)';
  el('text', { x: 44, y: 92, class: 'chu-svg' }, gH).textContent = 'Bấm vào một bộ phận hoặc số thứ tự để xem nhiệm vụ và nhóm vật liệu.';
  const bp = (id) => el('g', { class: 'bo-phan', 'data-bp': id }, gH);
  // không khí quanh sứ cao thế (vẽ trước để nằm dưới)
  const gKK = bp('khong-khi');
  el('rect', { x: 286, y: 128, width: 320, height: 168, rx: 26, class: 'vung-khong-khi' }, gKK);
  // vỏ máy, nắp, cánh tỏa nhiệt, chân đế
  const gVo = bp('vo-may');
  for (const [x0, xOng] of [[98, 98], [918, 910]]) {
    for (const y of [398, 712]) el('rect', { x: xOng, y, width: 92, height: 14, class: 'ong-tan-nhiet' }, gVo);
    for (let k = 0; k < 5; k++) el('rect', { x: x0 + k * 16, y: 386, width: 10, height: 352, rx: 4, class: 'canh-tan-nhiet' }, gVo);
  }
  el('rect', { x: 240, y: 800, width: 620, height: 22, class: 'vo-thung' }, gVo);
  for (const x of [262, 818]) el('rect', { x, y: 822, width: 20, height: 16, class: 'vo-thung' }, gVo);
  // dầu (bên trong thùng, mặt trước đã cắt bỏ)
  const gDau = bp('dau');
  el('rect', { x: 200, y: 332, width: 700, height: 466, class: 'dau-mba' }, gDau);
  el('path', { d: 'M190 322 V800 H910 V322', class: 'vo-cat', fill: 'none' }, gVo);
  el('rect', { x: 170, y: 300, width: 760, height: 24, rx: 4, class: 'vo-thung' }, gVo);
  // lõi thép 3 trụ: trụ T, gông G
  const LT = { x0: 305, x1: 795, yT0: 380, yT1: 430, yD0: 710, yD1: 760, tru: [305, 525, 745], rong: 50 };
  r.b.LT = LT;
  const gLoi = bp('loi-thep');
  let d = `M${LT.x0} ${LT.yT0} H${LT.x1} V${LT.yD1} H${LT.x0} Z`;
  for (let k = 0; k < 2; k++) d += ` M${LT.tru[k] + LT.rong} ${LT.yT1} V${LT.yD0} H${LT.tru[k + 1]} V${LT.yT1} Z`;
  el('path', { d, class: 'loi-thep-mba', 'fill-rule': 'evenodd' }, gLoi);
  for (const x of [415, 635]) el('text', { x, y: LT.yT0 + 34, class: 'chu-tg', 'text-anchor': 'middle' }, gLoi).textContent = 'G';
  el('text', { x: 415, y: LT.yD0 + 34, class: 'chu-tg', 'text-anchor': 'middle' }, gLoi).textContent = 'G';
  // cách điện, dây quấn HA (trong), CA (ngoài) ở hai bên mỗi trụ
  const gCD = bp('cach-dien');
  const gHA = bp('day-quan-ha');
  const gCA = bp('day-quan-cao');
  const yW0 = 446;
  const yW1 = 694;
  for (const x of LT.tru) {
    el('text', { x: x + LT.rong / 2, y: 578, class: 'chu-tg', 'text-anchor': 'middle' }, gLoi).textContent = 'T';
    for (const [mep, s] of [[x, -1], [x + LT.rong, 1]]) {
      const lop = (a, b) => [Math.min(mep + s * a, mep + s * b), Math.abs(b - a)];
      const [xc1, wc1] = lop(0, 6);
      const [xh, wh] = lop(6, 30);
      const [xc2, wc2] = lop(30, 36);
      const [xa, wa] = lop(36, 70);
      el('rect', { x: xc1, y: yW0 - 8, width: wc1, height: yW1 - yW0 + 16, class: 'ong-cach-dien' }, gCD);
      el('rect', { x: xc2, y: yW0 - 8, width: wc2, height: yW1 - yW0 + 16, class: 'ong-cach-dien' }, gCD);
      el('rect', { x: xh, y: yW0, width: wh, height: yW1 - yW0, rx: 3, class: 'day-quan ha' }, gHA);
      el('rect', { x: xa, y: yW0 + 6, width: wa, height: yW1 - yW0 - 12, rx: 3, class: 'day-quan ca' }, gCA);
      for (let y = yW0 + 10; y < yW1 - 4; y += 16) el('circle', { cx: xh + wh / 2, cy: y, r: 5, class: 'vong-dq' }, gHA);
      for (let y = yW0 + 18; y < yW1 - 12; y += 14) {
        el('circle', { cx: xa + wa / 4 + 1, cy: y, r: 4.5, class: 'vong-dq' }, gCA);
        el('circle', { cx: xa + (3 * wa) / 4 - 1, cy: y, r: 4.5, class: 'vong-dq' }, gCA);
      }
    }
  }
  // sứ cao thế (3) và sứ hạ thế (3)
  const gSu = bp('su');
  const veSu = (x, yDinh, soTang) => {
    el('rect', { x: x - 7, y: yDinh - 12, width: 14, height: 14, rx: 3, class: 'dau-su' }, gSu);
    const cao = (300 - yDinh) / soTang;
    for (let k = 0; k < soTang; k++) {
      const y = yDinh + k * cao;
      el('path', { d: `M${x - 10} ${y} L${x - 22} ${y + cao * 0.55} L${x + 22} ${y + cao * 0.55} L${x + 10} ${y} Z`, class: 'tan-su' }, gSu);
      el('rect', { x: x - 10, y: y + cao * 0.55, width: 20, height: cao * 0.45, class: 'than-su' }, gSu);
    }
  };
  for (const x of [340, 450, 560]) veSu(x, 168, 6);
  for (const x of [690, 760, 830]) veSu(x, 244, 3);
  // bình giãn dầu
  const gBGD = bp('binh-gian-dau');
  for (const x of [652, 888]) el('rect', { x: x - 5, y: 168, width: 10, height: 132, class: 'gia-do' }, gBGD);
  el('rect', { x: 640, y: 116, width: 260, height: 56, rx: 28, class: 'binh-gian-dau' }, gBGD);
  el('line', { x1: 846, y1: 128, x2: 846, y2: 160, class: 'vach-muc-dau' }, gBGD);
  // nhãn trên hình
  el('text', { x: 450, y: 152, class: 'nhan-mba', 'text-anchor': 'middle' }, gH).textContent = 'Sứ cao thế';
  el('text', { x: 760, y: 228, class: 'nhan-mba', 'text-anchor': 'middle' }, gH).textContent = 'Sứ hạ thế';
  el('text', { x: 744, y: 150, class: 'nhan-mba', 'text-anchor': 'middle' }, gH).textContent = 'Bình giãn dầu';
  // số thứ tự bộ phận
  const viTriSo = {
    'loi-thep': [550, 405], 'day-quan-ha': [373, 474], 'day-quan-cao': [408, 530], 'cach-dien': [388, 640],
    dau: [236, 372], su: [590, 262], 'khong-khi': [312, 150], 'vo-may': [190, 600], 'binh-gian-dau': [622, 144],
  };
  r.b.so = {};
  nd.mba.boPhan.forEach((b, k) => {
    const [x, y] = viTriSo[b.id];
    const g = el('g', { class: 'so-bp', 'data-bp': b.id, transform: `translate(${x} ${y})` }, gH);
    el('circle', { r: 15 }, g);
    el('text', { y: 6, 'text-anchor': 'middle' }, g).textContent = k + 1;
    r.b.so[b.id] = g;
  });
  // chú giải màu nhóm
  r.b.chuGiai = el('g', { class: 'chu-giai-mba' }, gH);
  [...nd.nhom.map((n) => [n.ngan, n.mau]), ['Kết cấu', MAU_KET_CAU]].forEach(([ten, mau], k) => {
    el('rect', { x: 44 + k * 170, y: 852, width: 20, height: 20, rx: 4, fill: mau }, r.b.chuGiai);
    el('text', { x: 72 + k * 170, y: 868, class: 'chu-svg' }, r.b.chuGiai).textContent = ten;
  });
  // thẻ danh sách bộ phận và chi tiết
  const gDS = el('g', { class: 'khu' }, gB);
  el('rect', { x: 1040, y: 20, width: 540, height: 870, rx: 18, class: 'the-svg' }, gDS);
  el('text', { x: 1064, y: 60, class: 'tieu-de-svg' }, gDS).textContent = 'Bộ phận và nhóm vật liệu';
  r.b.hang = {};
  nd.mba.boPhan.forEach((b, k) => {
    const y = 80 + k * 36;
    const g = el('g', { class: 'hang-bp', 'data-bp': b.id }, gDS);
    el('rect', { x: 1052, y, width: 516, height: 32, rx: 8, class: 'nen-hang-bp' }, g);
    el('text', { x: 1068, y: y + 22, class: 'so-hang-bp' }, g).textContent = k + 1;
    el('text', { x: 1094, y: y + 22, class: 'chu-svg ten-hang-bp' }, g).textContent = b.ten;
    const nhom = b.nhom.length ? b.nhom.map((id) => nd.nhom.find((n) => n.id === id)) : [null];
    nhom.forEach((n, j) => el('circle', { cx: 1556 - (nhom.length - 1 - j) * 18, cy: y + 16, r: 7, fill: n ? n.mau : MAU_KET_CAU }, g));
    r.b.hang[b.id] = g;
  });
  r.b.chiTiet = el('foreignObject', { x: 1052, y: 410, width: 516, height: 466 }, gDS);

  // ======================= C: CẤP CÁCH ĐIỆN =======================
  const gC = el('g', { class: 'kb-nhiet-do' }, svg);
  r.c.g = gC;
  const gT = el('g', { class: 'khu' }, gC);
  el('rect', { x: 20, y: 20, width: 620, height: 870, rx: 18, class: 'the-svg' }, gT);
  el('text', { x: 44, y: 60, class: 'tieu-de-svg' }, gT).textContent = 'Nhiệt độ làm việc của dây quấn';
  el('text', { x: 44, y: 92, class: 'chu-svg' }, gT).textContent = 'Kéo thanh trượt hoặc bấm vào nhiệt kế.';
  r.c.so = el('text', { x: 240, y: 150, class: 'so-nhiet', 'text-anchor': 'middle' }, gT);
  // cuộn dây cắt ngang quanh trụ thép
  el('rect', { x: 210, y: 250, width: 60, height: 500, class: 'loi-thep-mba' }, gT);
  el('text', { x: 0, y: 0, class: 'chu-tru-thep', 'text-anchor': 'middle', transform: 'translate(246 500) rotate(-90)' }, gT).textContent = 'trụ thép';
  r.c.cuon = [];
  for (const x0 of [116, 284]) {
    el('rect', { x: x0, y: 290, width: 80, height: 420, rx: 6, class: 'khung-cuon' }, gT);
    for (let y = 304; y < 700; y += 26) {
      for (let k = 0; k < 3; k++) r.c.cuon.push(el('circle', { cx: x0 + 14 + k * 26, cy: y + 4, r: 10.5, class: 'vong-nong' }, gT));
    }
  }
  el('text', { x: 240, y: 782, class: 'chu-svg', 'text-anchor': 'middle' }, gT).textContent = 'dây quấn (mặt cắt)';
  r.c.song = [136, 176, 304, 344].map((x) => el('path', { class: 'song-nhiet', d: `M${x} 0 q-12 -14 0 -28 q12 -14 0 -28 q-12 -14 0 -28` }, gT));
  // nhiệt kế
  const gNK = el('g', { class: 'nhiet-ke' }, gT);
  r.c.nhietKe = gNK;
  el('rect', { x: 500, y: NHIET.yTren - 26, width: 40, height: NHIET.yDuoi - NHIET.yTren + 60, rx: 20, class: 'vo-nhiet-ke' }, gNK);
  el('circle', { cx: 520, cy: NHIET.yDuoi + 50, r: 34, class: 'vo-nhiet-ke' }, gNK);
  r.c.thuyNgan = el('rect', { x: 510, width: 20, rx: 10, class: 'thuy-ngan' }, gNK);
  el('circle', { cx: 520, cy: NHIET.yDuoi + 50, r: 26, class: 'thuy-ngan' }, gNK);
  for (let t = 0; t <= 220; t += 20) {
    el('line', { x1: 486, x2: 500, y1: yNhiet(t), y2: yNhiet(t), class: 'vach-nhiet' }, gNK);
    el('text', { x: 480, y: yNhiet(t) + 5, class: 'chu-truc-dt', 'text-anchor': 'end' }, gNK).textContent = t;
  }
  el('text', { x: 480, y: NHIET.yTren - 34, class: 'chu-truc-dt', 'text-anchor': 'end' }, gNK).textContent = '°C';
  for (const c of nd.capCachDien) {
    const t = c.lonHon ? 200 : c.t;
    el('line', { x1: 540, x2: 556, y1: yNhiet(t), y2: yNhiet(t), class: 'vach-cap' }, gNK);
    el('text', { x: 562, y: yNhiet(t) + 6, class: 'chu-cap-nk' }, gNK).textContent = c.lonHon ? `${c.cap} ↑` : c.cap;
  }
  r.c.vungBam = el('rect', { x: 470, y: NHIET.yTren - 20, width: 150, height: NHIET.yDuoi - NHIET.yTren + 40, class: 'vung-bam-nhiet' }, gNK);

  // biểu đồ cột 7 cấp
  const gBD = el('g', { class: 'khu' }, gC);
  el('rect', { x: 660, y: 20, width: 920, height: 870, rx: 18, class: 'the-svg' }, gBD);
  el('text', { x: 684, y: 60, class: 'tieu-de-svg' }, gBD).textContent = '7 cấp cách điện – nhiệt độ làm việc cho phép';
  el('text', { x: 684, y: 92, class: 'chu-svg' }, gBD).textContent = 'Bấm vào một cột để đặt nhiệt độ bằng giới hạn của cấp đó.';
  for (let t = 0; t <= 220; t += 20) {
    el('line', { x1: DT.x0, x2: DT.x1, y1: yCot(t), y2: yCot(t), class: t ? 'luoi-dt' : 'truc-0' }, gBD);
    el('text', { x: DT.x0 - 10, y: yCot(t) + 5, class: 'chu-truc-dt', 'text-anchor': 'end' }, gBD).textContent = t;
  }
  el('text', { x: DT.x0 - 10, y: DT.yTren - 18, class: 'chu-truc-dt', 'text-anchor': 'end' }, gBD).textContent = '°C';
  const buoc = (DT.x1 - DT.x0) / nd.capCachDien.length;
  r.c.cot = nd.capCachDien.map((c, k) => {
    const xc = DT.x0 + buoc * (k + 0.5);
    const g = el('g', { class: 'cot-cap', 'data-t': c.lonHon ? c.t + 20 : c.t }, gBD);
    const yDinh = c.lonHon ? DT.yTren : yCot(c.t);
    const cot = el('rect', { x: xc - 32, y: yDinh, width: 64, height: DT.yDuoi - yDinh, rx: 4, class: c.lonHon ? 'than-cot mo' : 'than-cot' }, g);
    el('text', { x: xc, y: yDinh - 10, class: 'gt-cot', 'text-anchor': 'middle' }, g).textContent = c.lonHon ? `> ${c.t}` : c.t;
    el('text', { x: xc, y: DT.yDuoi + 34, class: 'ten-cap', 'text-anchor': 'middle' }, g).textContent = c.cap;
    const dau = el('text', { x: xc, y: DT.yDuoi + 66, class: 'dau-cap', 'text-anchor': 'middle' }, g);
    return { g, cot, dau, c };
  });
  r.c.duongT = el('line', { x1: DT.x0 - 4, x2: DT.x1 + 4, class: 'duong-t' }, gBD);
  r.c.chuT = el('text', { x: DT.x1 + 12, class: 'chu-t' }, gBD);
  // nhãn giá trị nằm trên đường t để luôn đọc được
  for (const o of r.c.cot) gBD.appendChild(o.g.querySelector('.gt-cot'));
  r.c.kq1 = el('text', { x: 684, y: 860, class: 'chu-kq-cap' }, gBD);
  return r;
}

async function khoiDong() {
  let nd, cauHoi;
  try {
    [nd, cauHoi] = await Promise.all([napJSON('du-lieu/vat-lieu.json'), napJSON('du-lieu/cau-hoi-vat-lieu.json')]);
  } catch (loi) {
    const tb = $('#thong-bao-loi');
    tb.hidden = false;
    tb.innerHTML = `<h2>Không nạp được dữ liệu</h2><p>${loi.message}</p>
      <p>Hãy mở trang qua GitHub Pages hoặc máy chủ cục bộ (ví dụ <code>python3 -m http.server</code>), xem README.</p>`;
    return;
  }
  const svg = $('#so-do');
  const r = veSanKhau(svg, nd);
  const nhomTheoId = Object.fromEntries(nd.nhom.map((n) => [n.id, n]));
  const s = {
    kichBan: nd.macDinh.kichBan,
    dangChay: true,
    tocDo: 1,
    hatGiong: 3,
    the: [], // thẻ vật liệu: { v, g, noi: 'khay' | id nhóm, slot }
    sai: 0,
    chon: null,
    noiBatNhom: null,
    boPhan: nd.mba.boPhan[0].id,
    toMau: false,
    t: nd.nhietDo.macDinh,
    tHien: nd.nhietDo.macDinh,
    thoiGian: 0,
  };

  // ---------- Lý thuyết ----------
  const lt = nd.lyThuyet;
  $('#the-ly-thuyet').innerHTML = `
    <p class="muc-nho">I. Tổng quan về hệ thống năng lượng điện</p>
    <h2>${lt.muc}</h2>
    <p class="dong-ly-thuyet"><b>a. Vật liệu dẫn điện:</b> ${lt.danDien}</p>
    <p class="dong-ly-thuyet"><b>b. Vật liệu dẫn từ:</b> ${lt.danTu}</p>
    <p class="dong-ly-thuyet"><b>c. Vật liệu cách điện:</b></p>
    <ul class="ghi-chu-ly-thuyet">
      <li>${lt.yeuCauCachDien.map((y, k) => (k ? y.charAt(0).toLowerCase() + y.slice(1) : y)).join(', ')}</li>
      <li>Phần lớn ở thể rắn: 4 nhóm
        <ul>${lt.nhomRan.map((n) => `<li>${n.ten}${n.viDu ? `: ${n.viDu}` : ''}</li>`).join('')}</ul>
      </li>
      <li>${lt.theKhac}</li>
    </ul>
    <table class="bang-cap">
      <caption>7 cấp cách điện của vật liệu cách điện</caption>
      <tr><th scope="row">Cấp cách điện</th>${nd.capCachDien.map((c) => `<td>${c.cap}</td>`).join('')}</tr>
      <tr><th scope="row">Nhiệt độ làm việc cho phép</th>${nd.capCachDien.map((c) => `<td>${c.lonHon ? '&gt;&nbsp;' : ''}${c.t}</td>`).join('')}</tr>
    </table>`;

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
  const toaDo = (e) => new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
  // dòng "Số liệu hiện tại" trên thanh trình chiếu
  const soLieuTC = (chu) => { const o = $('#tc-so-lieu'); if (o) o.textContent = chu; };
  const chuThich = (html, loai = 'thanh-cong') => {
    const c = $('#chu-thich-buoc');
    c.className = `chu-thich-buoc ${loai}`;
    c.innerHTML = `<span>${html}</span>`;
  };

  // ======================= A: PHÂN LOẠI =======================
  /** Ghi chữ, nén ngang nếu dài hơn khung thẻ. */
  function vuaKhung(o, chu, rongToiDa) {
    o.textContent = chu;
    if (o.getComputedTextLength() > rongToiDa) {
      o.setAttribute('textLength', rongToiDa);
      o.setAttribute('lengthAdjust', 'spacingAndGlyphs');
    }
  }

  function veThe(the) {
    const { g, v, noi } = the;
    g.innerHTML = '';
    const trongKhay = noi === 'khay';
    const w = trongKhay ? THE_KHAY.w : O_NHOM[noi].theW;
    const h = trongKhay ? THE_KHAY.h : THE_NHOM_H;
    the.w = w;
    the.h = h;
    el('rect', { width: w, height: h, rx: 10, class: 'nen-the' }, g);
    if (trongKhay) {
      el('text', { x: w / 2, y: h / 2 + 7, class: 'ten-the', 'text-anchor': 'middle' }, g).textContent = v.ten;
    } else {
      vuaKhung(el('text', { x: w / 2, y: v.nhomCon ? 25 : h / 2 + 6, class: 'ten-the nho', 'text-anchor': 'middle' }, g), v.ten, w - 14);
      if (v.nhomCon) vuaKhung(el('text', { x: w / 2, y: 46, class: 'nhom-con-the', 'text-anchor': 'middle' }, g), v.nhomCon, w - 14);
    }
    g.setAttribute('class', `the-vl ${trongKhay ? '' : 'da-xep'} ${s.chon === the ? 'dang-chon' : ''}`);
    g.style.setProperty('--mau-nhom', trongKhay ? '' : nhomTheoId[noi].mau);
  }

  function viTriThe(the) {
    if (the.noi === 'khay') {
      return [THE_KHAY.x0 + (the.slot % THE_KHAY.cot) * THE_KHAY.buocX, THE_KHAY.y0 + Math.floor(the.slot / THE_KHAY.cot) * THE_KHAY.buocY];
    }
    const o = O_NHOM[the.noi];
    const gap = (o.w - 40 - o.cot * o.theW) / (o.cot - 1);
    return [o.x + 20 + (the.slot % o.cot) * (o.theW + gap), o.y + 88 + Math.floor(the.slot / o.cot) * (THE_NHOM_H + 10)];
  }

  function datViTri(the) {
    const [x, y] = viTriThe(the);
    the.x = x;
    the.y = y;
    the.g.setAttribute('transform', `translate(${x} ${y})`);
    (the.noi === 'khay' ? r.a.khay : r.a.o[the.noi].lop).appendChild(the.g);
  }

  function taoThe(hienDapAn = false) {
    for (const t of s.the) t.g.remove();
    s.sai = 0;
    s.chon = null;
    s.the = xaoTron(nd.vatLieu, s.hatGiong).map((v, slot) => {
      const g = el('g', { tabindex: 0, role: 'button', 'aria-label': `Thẻ vật liệu: ${v.ten}` }, r.a.khay);
      return { v, g, noi: 'khay', slot };
    });
    for (const the of s.the) {
      veThe(the);
      datViTri(the);
      the.g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); chonThe(the); }
      });
    }
    if (hienDapAn) for (const the of s.the) xep(the, the.v.nhom, true);
    capNhatA();
  }

  function chonThe(the) {
    if (the.noi !== 'khay') return;
    const truoc = s.chon;
    s.chon = truoc === the ? null : the;
    for (const t of [truoc, the]) if (t) veThe(t);
    if (s.chon) chuThich(`Đã chọn <b>${the.v.ten}</b>. Bấm vào ô nhóm (hoặc phím 1, 2, 3) để xếp.`, '');
  }

  function xep(the, nhom, imLang = false) {
    if (the.noi !== 'khay') return;
    if (s.chon === the) s.chon = null;
    if (!xepDung(the.v, nhom)) {
      s.sai += 1;
      const dung = nhomTheoId[the.v.nhom];
      chuThich(`✗ <b>${the.v.ten}</b> không thuộc nhóm ${nhomTheoId[nhom].ten.toLowerCase()}. Theo slide 11, ${the.v.ten.toLowerCase()} là <b>${dung.ten.toLowerCase()}</b>${the.v.nhomCon ? ` (${the.v.nhomCon.toLowerCase()})` : ''}. Thử lại!`, 'canh-bao');
      veThe(the);
      datViTri(the);
      the.g.classList.add('lac');
      setTimeout(() => the.g.classList.remove('lac'), 500);
      capNhatA();
      return;
    }
    the.noi = nhom;
    the.slot = s.the.filter((t) => t.noi === nhom && t !== the).length;
    veThe(the);
    datViTri(the);
    if (!imLang) {
      the.g.classList.add('vua-xep');
      setTimeout(() => the.g.classList.remove('vua-xep'), 700);
      chuThich(`✓ <b>${the.v.ten}</b>: ${nhomTheoId[nhom].ten.toLowerCase()}${the.v.nhomCon ? ` – ${the.v.nhomCon.toLowerCase()}` : ''}.`);
    }
    capNhatA();
  }

  function capNhatA() {
    const daXep = s.the.filter((t) => t.noi !== 'khay').length;
    for (const n of nd.nhom) {
      const tong = nd.vatLieu.filter((v) => v.nhom === n.id).length;
      const co = s.the.filter((t) => t.noi === n.id).length;
      const o = r.a.o[n.id];
      o.dem.textContent = `${co}/${tong}`;
      o.chan.forEach((c, k) => { c.textContent = co === tong ? CHAN_NHOM[n.id][k] : ''; });
      o.g.classList.toggle('du', co === tong);
      const nb = document.body.classList.contains('che-do-trinh-chieu') ? s.noiBatNhom : null;
      o.g.classList.toggle('noi-bat', nb === n.id);
      o.g.classList.toggle('mo-nhat', !!nb && nb !== n.id);
      $(`#sl-${n.id}`).textContent = `${co}/${tong}`;
    }
    r.a.khayTrong.textContent = daXep === s.the.length ? '🎉 Đã xếp xong tất cả các thẻ!' : '';
    $('#sl-da-xep').textContent = `${daXep}/${s.the.length}`;
    $('#sl-sai').textContent = String(s.sai);
    if (s.kichBan === 'phan-loai') soLieuTC(`Đã xếp đúng ${daXep}/${s.the.length} thẻ · sai ${s.sai} lần`);
    if (daXep === s.the.length && s.kichBan === 'phan-loai') {
      chuThich(`🎉 Hoàn thành: xếp đúng ${s.the.length}/${s.the.length} thẻ, sai ${s.sai} lần. Dẫn điện: Cu, Al, hợp kim · Dẫn từ: vật liệu sắt từ · Cách điện: thể rắn (4 nhóm), thể khí, thể lỏng.`);
    }
  }

  const nhomTaiDiem = (p) => nd.nhom.find((n) => {
    const o = O_NHOM[n.id];
    return p.x >= o.x && p.x <= o.x + o.w && p.y >= o.y && p.y <= o.y + o.h;
  });

  let keo = null;
  svg.addEventListener('pointerdown', (e) => {
    if (s.kichBan !== 'phan-loai') return;
    const g = e.target.closest('.the-vl');
    const the = g && s.the.find((t) => t.g === g);
    if (!the || the.noi !== 'khay') return;
    e.preventDefault();
    svg.setPointerCapture(e.pointerId);
    const p = toaDo(e);
    keo = { the, dx: p.x - the.x, dy: p.y - the.y, p0: p, daDi: false };
  });
  svg.addEventListener('pointermove', (e) => {
    if (!keo) return;
    const p = toaDo(e);
    if (!keo.daDi && Math.hypot(p.x - keo.p0.x, p.y - keo.p0.y) > 6) {
      keo.daDi = true;
      r.a.lopKeo.appendChild(keo.the.g);
      keo.the.g.classList.add('dang-keo');
    }
    if (!keo.daDi) return;
    keo.the.g.setAttribute('transform', `translate(${p.x - keo.dx} ${p.y - keo.dy})`);
    for (const n of nd.nhom) r.a.o[n.id].g.classList.toggle('dang-tro', nhomTaiDiem(p)?.id === n.id);
  });
  svg.addEventListener('pointerup', (e) => {
    if (s.kichBan === 'phan-loai' && !keo) {
      // bấm vào ô nhóm khi đang chọn một thẻ
      const o = e.target.closest('.o-nhom');
      if (o && s.chon) xep(s.chon, o.dataset.nhom);
      return;
    }
    if (!keo) return;
    const { the, daDi } = keo;
    keo = null;
    the.g.classList.remove('dang-keo');
    for (const n of nd.nhom) r.a.o[n.id].g.classList.remove('dang-tro');
    if (!daDi) { chonThe(the); return; }
    const nhom = nhomTaiDiem(toaDo(e));
    if (nhom) xep(the, nhom.id);
    else { datViTri(the); }
  });
  svg.addEventListener('pointercancel', () => {
    if (keo) { datViTri(keo.the); keo.the.g.classList.remove('dang-keo'); keo = null; }
  });

  // ======================= B: MÁY BIẾN ÁP =======================
  function chonBoPhan(id) {
    s.boPhan = id;
    const b = nd.mba.boPhan.find((x) => x.id === id);
    const k = nd.mba.boPhan.indexOf(b);
    r.b.hinh.classList.add('co-chon');
    r.b.hinh.querySelectorAll('[data-bp]').forEach((o) => o.classList.toggle('chon', o.dataset.bp === id));
    Object.entries(r.b.hang).forEach(([ma, g]) => g.classList.toggle('chon', ma === id));
    const nhom = b.nhom.map((n) => nhomTheoId[n]);
    r.b.chiTiet.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" class="chi-tiet-bp">
      <h3><span class="so-tron">${k + 1}</span>${b.ten}</h3>
      <p class="chip-nhom">${nhom.length ? nhom.map((n) => `<span style="--mau-nhom:${n.mau}">${n.ten}</span>`).join('') : `<span style="--mau-nhom:${MAU_KET_CAU}">Bộ phận kết cấu</span>`}</p>
      <p><b>Vật liệu:</b> ${b.vatLieu}</p>
      <p><b>Nhiệm vụ:</b> ${b.nhiemVu}</p>
      <p class="nguon-bp">Nguồn: ${b.nguon} (Chuong1-MBA.pdf)</p>
    </div>`;
    $('#sl-bp').textContent = b.ten;
    $('#sl-nhom-bp').textContent = nhom.length ? nhom.map((n) => n.ngan).join(' + ') : 'Kết cấu';
    $('#sl-nguon').textContent = b.nguon;
    soLieuTC(`${k + 1}. ${b.ten}: ${nhom.length ? nhom.map((n) => n.ten.toLowerCase()).join(' + ') : 'bộ phận kết cấu'} (${b.nguon})`);
    chuThich(`<b>${k + 1}. ${b.ten}</b> – ${nhom.length ? nhom.map((n) => n.ten.toLowerCase()).join(' và ') : 'bộ phận kết cấu'}. ${b.vatLieu}`);
  }
  svg.addEventListener('click', (e) => {
    if (s.kichBan !== 'mba') return;
    const o = e.target.closest('[data-bp]');
    if (o) chonBoPhan(o.dataset.bp);
  });
  function datToMau(bat) {
    s.toMau = bat;
    r.b.hinh.classList.toggle('to-mau', bat);
    const o = $('#mba-to-mau');
    if (o) o.checked = bat;
  }

  // ======================= C: NHIỆT ĐỘ =======================
  function datNhiet(t) {
    s.t = Math.max(nd.nhietDo.min, Math.min(nd.nhietDo.max, Math.round(t)));
    const o = $('#nd-t');
    if (o) { o.value = s.t; $('#nd-t-gt').textContent = `${s.t} °C`; }
    capNhatC();
  }
  function capNhatC() {
    const ds = danhGiaCap(nd.capCachDien, s.t);
    const thap = capThapNhat(nd.capCachDien, s.t);
    ds.forEach((c, k) => {
      const o = r.c.cot[k];
      o.g.classList.toggle('ok', c.ok);
      o.g.classList.toggle('khong', !c.ok);
      o.g.classList.toggle('thap-nhat', thap && c.cap === thap.cap);
      o.dau.textContent = c.ok ? '✓' : '✗';
    });
    const khong = ds.filter((c) => !c.ok).map((c) => c.cap);
    const ten = (c) => `${c.cap} (${c.lonHon ? '> ' : ''}${c.t} °C)`;
    r.c.kq1.textContent = `t = ${s.t} °C → cấp thấp nhất dùng được: ${ten(thap)}${khong.length ? ` · không dùng được: ${khong.join(', ')}` : ''}`;
    $('#sl-t').textContent = `${s.t} °C`;
    $('#sl-cap').textContent = ten(thap);
    $('#sl-so-cap').textContent = `${ds.filter((c) => c.ok).length}/7`;
    soLieuTC(`t = ${s.t} °C · cấp thấp nhất dùng được: ${ten(thap)}${khong.length ? ` · không đạt: ${khong.join(', ')}` : ''}`);
    chuThich(s.t > 180
      ? `Nhiệt độ làm việc ${s.t} °C vượt 180 °C: chỉ còn cấp <b>C</b> (slide ghi nhiệt độ làm việc cho phép &gt; 180).`
      : `Dây quấn làm việc ở <b>${s.t} °C</b> → phải dùng vật liệu cách điện có nhiệt độ làm việc cho phép ≥ ${s.t} °C: thấp nhất là cấp <b>${ten(thap)}</b>.${khong.length ? ` Các cấp ${khong.join(', ')} không đạt.` : ''}`);
  }
  let keoNhiet = false;
  const datNhietTuDiem = (e) => {
    const p = toaDo(e);
    datNhiet(NHIET.tMin + ((NHIET.yDuoi - p.y) / (NHIET.yDuoi - NHIET.yTren)) * (NHIET.tMax - NHIET.tMin));
  };
  r.c.vungBam.addEventListener('pointerdown', (e) => { keoNhiet = true; r.c.vungBam.setPointerCapture(e.pointerId); datNhietTuDiem(e); });
  r.c.vungBam.addEventListener('pointermove', (e) => { if (keoNhiet) datNhietTuDiem(e); });
  r.c.vungBam.addEventListener('pointerup', () => { keoNhiet = false; });
  r.c.cot.forEach((o) => o.g.addEventListener('click', () => datNhiet(Number(o.g.dataset.t))));

  // ---------- Kịch bản & điều khiển ----------
  function chonKichBan(id) {
    s.kichBan = id;
    $('#chon-kich-ban').value = id;
    document.body.dataset.kichBan = id;
    r.a.g.style.display = id === 'phan-loai' ? '' : 'none';
    r.b.g.style.display = id === 'mba' ? '' : 'none';
    r.c.g.style.display = id === 'nhiet-do' ? '' : 'none';
    document.querySelectorAll('[data-che-do]').forEach((o) => { o.hidden = o.dataset.cheDo !== id; });
    veDieuKhien();
    if (id === 'phan-loai') { capNhatA(); chuThich('Kéo từng thẻ vật liệu vào đúng nhóm: dẫn điện, dẫn từ hoặc cách điện.', ''); }
    if (id === 'mba') chonBoPhan(s.boPhan);
    if (id === 'nhiet-do') datNhiet(s.t);
  }

  function veDieuKhien() {
    const dk = $('#dieu-khien-kich-ban');
    if (s.kichBan === 'phan-loai') {
      dk.innerHTML = `
        <p class="mo-ta">Xếp 15 thẻ vật liệu trong slide 11 vào ba nhóm. Xếp sai, thẻ quay về khay kèm giải thích.</p>
        <div class="hang-nut">
          <button type="button" class="nut" id="pl-xep-lai">↻ Xáo trộn, xếp lại</button>
          <button type="button" class="nut" id="pl-dap-an">✓ Hiện đáp án</button>
        </div>`;
      dk.querySelector('#pl-xep-lai').addEventListener('click', () => { s.hatGiong += 1; taoThe(); chuThich('Đã xáo trộn lại các thẻ.', ''); });
      dk.querySelector('#pl-dap-an').addEventListener('click', () => { taoThe(true); chuThich('Đáp án: dẫn điện – Cu, Al; dẫn từ – vật liệu sắt từ; cách điện – thể rắn (4 nhóm), thể khí, thể lỏng.'); });
    } else if (s.kichBan === 'mba') {
      dk.innerHTML = `
        <p class="mo-ta">Hình cắt minh họa máy biến áp ba pha kiểu trụ (lõi thép 3 trụ T, gông G; dây quấn HA bên trong, CA bên ngoài – theo slide 25, 26). Hình vẽ không theo tỷ lệ.</p>
        <label class="o-chon"><input type="checkbox" id="mba-to-mau" ${s.toMau ? 'checked' : ''}> Tô màu theo nhóm vật liệu</label>`;
      dk.querySelector('#mba-to-mau').addEventListener('change', (e) => datToMau(e.target.checked));
    } else {
      dk.innerHTML = `
        <p class="mo-ta">Chọn nhiệt độ làm việc của dây quấn, xem cấp cách điện nào dùng được theo bảng 7 cấp (slide 11).</p>
        <label class="dieu-khien doc"><span>Nhiệt độ t</span> <input type="range" id="nd-t" min="${nd.nhietDo.min}" max="${nd.nhietDo.max}" step="1" value="${s.t}"><output id="nd-t-gt">${s.t} °C</output></label>
        <div class="hang-nut">${nd.capCachDien.filter((c) => !c.lonHon).map((c) => `<button type="button" class="nut nut-nho" data-t="${c.t}">${c.t}</button>`).join('')}<button type="button" class="nut nut-nho" data-t="200">200</button></div>`;
      dk.querySelector('#nd-t').addEventListener('input', (e) => datNhiet(Number(e.target.value)));
      dk.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => datNhiet(Number(b.dataset.t))));
    }
  }

  // ---------- Trình chiếu & câu hỏi ----------
  const trinhChieu = khoiTaoTrinhChieu({
    noiDung: null,
    cacBuocTrinhChieu: nd.trinhChieu,
    lamNoiBat: (id, b) => {
      const tt = b?.trangThai;
      if (!tt) return;
      if (tt.kichBan === 'phan-loai') { s.noiBatNhom = tt.nhom || null; }
      if (tt.toMau !== undefined) datToMau(tt.toMau);
      if (tt.boPhan) s.boPhan = tt.boPhan;
      if (tt.t !== undefined) s.t = tt.t;
      chonKichBan(tt.kichBan);
    },
    dongThongTin: () => {},
  });
  khoiTaoCauHoi(cauHoi);
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, select, textarea, dialog')) return;
    if (s.kichBan === 'phan-loai' && s.chon && ['1', '2', '3'].includes(e.key)) {
      const n = nd.nhom.find((x) => x.phim === e.key);
      xep(s.chon, n.id);
      return;
    }
    if (trinhChieu.xuLyPhim(e)) return;
    if (e.key === ' ' && !e.target.closest('button, .the-vl')) { e.preventDefault(); datChay(!s.dangChay); }
  });
  // vào/thoát trình chiếu: cập nhật làm nổi bật ô nhóm
  new MutationObserver(() => capNhatA()).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // ---------- Vòng lặp hoạt hình (kịch bản c) ----------
  let tTruoc = performance.now();
  function khung(bayGio) {
    const dtThuc = Math.min(0.1, Math.max(0, (bayGio - tTruoc) / 1000));
    tTruoc = bayGio;
    const dt = s.dangChay ? dtThuc * s.tocDo : 0;
    s.thoiGian += dt;
    if (s.kichBan === 'nhiet-do') {
      s.tHien += (s.t - s.tHien) * Math.min(1, dtThuc * 6);
      const t = s.tHien;
      r.c.thuyNgan.setAttribute('y', yNhiet(t).toFixed(1));
      r.c.thuyNgan.setAttribute('height', (NHIET.yDuoi + 40 - yNhiet(t)).toFixed(1));
      const mau = mauNhietDo(t);
      for (const c of r.c.cuon) c.setAttribute('fill', mau);
      r.c.so.textContent = `${Math.round(t)} °C`;
      r.c.so.setAttribute('fill', mau);
      r.c.duongT.setAttribute('y1', yCot(Math.min(t, 220)).toFixed(1));
      r.c.duongT.setAttribute('y2', yCot(Math.min(t, 220)).toFixed(1));
      r.c.chuT.setAttribute('y', (yCot(Math.min(t, 220)) + 6).toFixed(1));
      r.c.chuT.textContent = `t = ${Math.round(t)} °C`;
      // sóng nhiệt bốc lên phía trên cuộn dây, mạnh dần theo nhiệt độ
      const doManh = Math.max(0, Math.min(1, (t - 60) / 140));
      r.c.song.forEach((o, k) => {
        const pha = (s.thoiGian * 0.6 + k / 4) % 1;
        o.setAttribute('transform', `translate(0 ${(284 - pha * 30).toFixed(1)})`);
        o.setAttribute('opacity', (doManh * Math.sin(pha * Math.PI)).toFixed(2));
      });
    }
    requestAnimationFrame(khung);
  }

  taoThe();
  chonKichBan(s.kichBan);
  document.body.classList.add('da-san-sang');
  requestAnimationFrame(khung);
}

khoiDong().catch((loi) => {
  console.error(loi);
  const tb = document.querySelector('#thong-bao-loi');
  if (tb) { tb.hidden = false; tb.innerHTML = `<h2>Lỗi khởi động mô phỏng</h2><p>${loi.message}</p>`; }
});
