/**
 * toan-dong-dien.js — Trang 1.2.c "Định luật toàn dòng điện": ∮H·dl = Σi = F; mạch từ H·l = w·i.
 *
 * Kịch bản a (ampere): mặt phẳng vuông góc với các dây dẫn; tọa độ mặt phẳng tính theo đơn vị hình vẽ,
 *   gốc ở tâm, trục y hướng lên. Dòng điện I > 0 đi ra khỏi mặt phẳng (⊙). Đường cong C đi ngược
 *   chiều kim đồng hồ, nên dòng ⊙ lấy dấu + theo quy tắc vặn nút chai.
 * Kịch bản b (mach-tu): mạch từ hình 1.4 và mặt cắt để đếm dòng điện xuyên qua C.
 */
import { el } from './so-do.js';
import {
  truongTong, duongTron, hinhChuNhat, tongDongDienBaoQuanh, sucTuDong, cuongDoTuTruong, tuCam,
} from './mach-tu.js';
import { dinhDangSo } from './tinh-toan.js';
import { khoiTaoTrinhChieu } from './trinh-chieu.js';
import { khoiTaoCauHoi } from './kiem-tra.js';
import { napJSON, soCoNghia, lamTronDep, veCongThuc, soTex } from './tien-ich.js';

const $ = (s) => document.querySelector(s);
const MP = { cx: 515, cy: 480, rx: 470, ry: 360 }; // khung mặt phẳng trong thẻ trái
const sx = (x) => MP.cx + x;
const sy = (y) => MP.cy - y;
const MAU = { duong: '#2e7d32', am: '#c62828', C: '#1d3557', H: '#2a78d6', i: '#eb6834' };
const R_MIN = 22; // bán kính lõi dây dẫn (đơn vị hình vẽ), tránh điểm kỳ dị khi tính H
const N_TICH_PHAN = 720;

/** Hàm tham số của C và hàm kiểm tra điểm nằm trong C. */
function hinhC(C) {
  if (C.hinh === 'chu-nhat') {
    const a = C.r;
    const b = C.r * 0.62;
    return { diem: hinhChuNhat(C.cx, C.cy, a, b), trong: (x, y) => Math.abs(x - C.cx) < a && Math.abs(y - C.cy) < b, b };
  }
  return { diem: duongTron(C.cx, C.cy, C.r), trong: (x, y) => (x - C.cx) ** 2 + (y - C.cy) ** 2 < C.r ** 2, b: C.r };
}

function veSanKhau(svg) {
  svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  const mk = (id, mau) => {
    const m = el('marker', { id, viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 4, markerHeight: 4, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 0 L10 5 L0 10 Z', fill: mau }, m);
  };
  mk('mui-h', MAU.H);
  mk('mui-duong', MAU.duong);
  mk('mui-am', MAU.am);
  mk('mui-c', MAU.C);
  mk('mui-i', MAU.i);
  const gc = el('pattern', { id: 'gach-cheo', width: 10, height: 10, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
  el('rect', { width: 10, height: 10, fill: '#cfd8dc' }, gc);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 10, stroke: '#455a64', 'stroke-width': 2.5 }, gc);
  el('rect', { x: -2000, y: -1200, width: 5600, height: 3300, class: 'nen-san-khau' }, svg);
  const r = { a: {}, b: {} };

  // ======================= KỊCH BẢN A: ĐƯỜNG CONG KÍN C =======================
  const gA = el('g', { class: 'kb-ampere' }, svg);
  r.a.g = gA;
  const gMP = el('g', { class: 'khu' }, gA);
  el('rect', { x: 20, y: 20, width: 990, height: 870, rx: 18, class: 'the-svg' }, gMP);
  el('text', { x: 44, y: 60, class: 'tieu-de-svg' }, gMP).textContent = 'Đường cong kín C quanh các dây dẫn mang dòng điện';
  el('text', { x: 44, y: 92, class: 'chu-svg' }, gMP).textContent = 'Kéo dây dẫn hoặc kéo C (tâm ✥, tay nắm ●); bấm vào dây dẫn để đổi chiều dòng điện.';
  el('rect', { x: MP.cx - MP.rx, y: MP.cy - MP.ry, width: 2 * MP.rx, height: 2 * MP.ry, rx: 10, class: 'mat-phang' }, gMP);
  r.a.vungC = el('path', { class: 'vung-c' }, gMP);
  // lưới mũi tên H
  r.a.luoiH = [];
  const gH = el('g', { class: 'luoi-h' }, gMP);
  for (let x = -440; x <= 440; x += 55) {
    for (let y = -330; y <= 330; y += 55) {
      r.a.luoiH.push({ x, y, l: el('line', { class: 'mui-h', 'marker-end': 'url(#mui-h)' }, gH) });
    }
  }
  r.a.duongC = el('path', { class: 'duong-c' }, gMP);
  r.a.muiC = [0, 1, 2, 3].map(() => el('path', { class: 'mui-c', d: 'M-9 -7 L5 0 L-9 7 Z' }, gMP));
  r.a.nhanC = el('text', { class: 'nhan-c' }, gMP);
  r.a.nhanC.textContent = 'C';
  r.a.gHt = el('g', { class: 'luoi-ht' }, gMP);
  r.a.ht = Array.from({ length: 40 }, () => el('line', { class: 'mui-ht' }, r.a.gHt));
  r.a.lopDay = el('g', { class: 'lop-day' }, gMP);
  r.a.chamDi = el('circle', { r: 9, class: 'cham-di' }, gMP);
  r.a.tamC = el('g', { class: 'tay-nam tam-c', 'data-keo': 'C-tam' }, gMP);
  el('circle', { r: 16 }, r.a.tamC);
  el('text', { y: 7, 'text-anchor': 'middle' }, r.a.tamC).textContent = '✥';
  r.a.coC = el('circle', { r: 11, class: 'tay-nam co-c', 'data-keo': 'C-co' }, gMP);

  // Thẻ kết quả: vòng tiến trình đi quanh C
  const gKQ = el('g', { class: 'khu' }, gA);
  el('rect', { x: 1030, y: 20, width: 550, height: 470, rx: 18, class: 'the-svg' }, gKQ);
  el('text', { x: 1054, y: 60, class: 'tieu-de-svg' }, gKQ).textContent = 'Đi một vòng quanh C';
  el('circle', { cx: 1305, cy: 238, r: 120, class: 'vong-nen' }, gKQ);
  r.a.vongTien = el('path', { class: 'vong-tien' }, gKQ);
  el('text', { x: 1305, y: 205, class: 'chu-svg', 'text-anchor': 'middle' }, gKQ).textContent = '∫H·dl đã cộng dồn';
  r.a.giaTriTichLuy = el('text', { x: 1305, y: 252, class: 'so-lon', 'text-anchor': 'middle' }, gKQ);
  r.a.phanTram = el('text', { x: 1305, y: 290, class: 'chu-svg', 'text-anchor': 'middle' }, gKQ);
  r.a.dongKQ1 = el('text', { x: 1054, y: 402, class: 'chu-kq' }, gKQ);
  r.a.dongKQ2 = el('text', { x: 1054, y: 436, class: 'chu-kq' }, gKQ);
  r.a.dongKQ3 = el('text', { x: 1054, y: 470, class: 'chu-kq dam' }, gKQ);

  // Thẻ đóng góp từng dây
  const gDG = el('g', { class: 'khu' }, gA);
  el('rect', { x: 1030, y: 506, width: 550, height: 384, rx: 18, class: 'the-svg' }, gDG);
  el('text', { x: 1054, y: 546, class: 'tieu-de-svg' }, gDG).textContent = 'Đóng góp của từng dây vào ∮H·dl';
  el('line', { x1: 1370, x2: 1370, y1: 566, y2: 836, class: 'truc-0' }, gDG);
  r.a.cotDG = Array.from({ length: 6 }, (_, k) => ({
    nhan: el('text', { x: 1054, y: 600 + k * 44, class: 'chu-svg' }, gDG),
    cot: el('rect', { y: 584 + k * 44, height: 24, rx: 4 }, gDG),
    gt: el('text', { x: 1560, y: 602 + k * 44, class: 'chu-gt-cot', 'text-anchor': 'end' }, gDG),
  }));
  r.a.ghiChuDG = el('text', { x: 1054, y: 866, class: 'chu-svg-nho' }, gDG);
  r.a.ghiChuDG.textContent = 'Tính số dọc theo C cho từng dây riêng rẽ (nguyên lý xếp chồng).';

  // ======================= KỊCH BẢN B: MẠCH TỪ (HÌNH 1.4) =======================
  const gB = el('g', { class: 'kb-mach-tu' }, svg);
  r.b.g = gB;
  const gHinh = el('g', { class: 'khu' }, gB);
  el('rect', { x: 20, y: 20, width: 990, height: 870, rx: 18, class: 'the-svg' }, gHinh);
  el('text', { x: 44, y: 60, class: 'tieu-de-svg' }, gHinh).textContent = 'Hình 1.4 – Mạch từ có cuộn dây w vòng';
  // lõi thép: khung ngoài và cửa sổ
  const L = { x0: 290, y0: 150, x1: 850, y1: 690, day: 120 };
  r.b.L = L;
  el('path', {
    d: `M${L.x0} ${L.y0} H${L.x1} V${L.y1} H${L.x0} Z M${L.x0 + L.day} ${L.y0 + L.day} V${L.y1 - L.day} H${L.x1 - L.day} V${L.y0 + L.day} Z`,
    class: 'loi-thep-mt', 'fill-rule': 'evenodd',
  }, gHinh);
  // đường trung bình l (đường cong C)
  const m = L.day / 2;
  r.b.duongTB = el('rect', { x: L.x0 + m, y: L.y0 + m, width: L.x1 - L.x0 - 2 * m, height: L.y1 - L.y0 - 2 * m, class: 'duong-tb' }, gHinh);
  r.b.dongPhi = el('rect', { x: L.x0 + m, y: L.y0 + m, width: L.x1 - L.x0 - 2 * m, height: L.y1 - L.y0 - 2 * m, class: 'dong-phi' }, gHinh);
  el('path', { d: `M${(L.x0 + L.x1) / 2 - 30} ${L.y0 + m} h60`, class: 'mui-phi', 'marker-end': 'url(#mui-h)' }, gHinh);
  el('text', { x: (L.x0 + L.x1) / 2, y: L.y0 + m - 16, class: 'chu-vec vec-b', 'text-anchor': 'middle' }, gHinh).textContent = 'φ';
  // tiết diện S (gạch chéo trên trụ phải)
  const sY = L.y0 + 200;
  el('path', { d: `M${L.x1 - L.day} ${sY} L${L.x1} ${sY - 46} L${L.x1} ${sY + 4} L${L.x1 - L.day} ${sY + 50} Z`, class: 'tiet-dien' }, gHinh);
  el('text', { x: L.x1 + 18, y: sY - 26, class: 'chu-vec' }, gHinh).textContent = 'S';
  el('text', { x: L.x1 - m + 34, y: L.y1 - 120, class: 'chu-vec' }, gHinh).textContent = 'l';
  el('path', { d: `M${L.x1 - m + 30} ${L.y1 - 130} L${L.x1 - m + 4} ${L.y1 - 158}`, class: 'duong-chi' }, gHinh);
  el('text', { x: L.x1 - 70, y: L.y1 + 34, class: 'chu-svg' }, gHinh).textContent = 'lõi thép';
  // cuộn dây trên trụ trái
  r.b.lopCuon = el('g', {}, gHinh);
  r.b.dauVao = el('path', { class: 'day-cuon-mt', 'marker-end': 'url(#mui-i)' }, gHinh);
  r.b.dauRa = el('path', { class: 'day-cuon-mt' }, gHinh);
  r.b.chuI = el('text', { class: 'chu-vec vec-i' }, gHinh);
  r.b.chuI.textContent = 'i';
  r.b.chuW = el('text', { class: 'chu-vec' }, gHinh);
  r.b.nhanSo = el('text', { x: 44, y: 860, class: 'chu-svg' }, gHinh);

  // Thẻ mặt cắt: đếm dòng điện qua C
  const gMC = el('g', { class: 'khu' }, gB);
  el('rect', { x: 1030, y: 20, width: 550, height: 470, rx: 18, class: 'the-svg' }, gMC);
  el('text', { x: 1054, y: 60, class: 'tieu-de-svg' }, gMC).textContent = 'Mặt cắt: dòng điện xuyên qua C';
  const M = { x0: 1150, y0: 96, x1: 1460, y1: 366, day: 60 };
  r.b.M = M;
  el('path', {
    d: `M${M.x0} ${M.y0} H${M.x1} V${M.y1} H${M.x0} Z M${M.x0 + M.day} ${M.y0 + M.day} V${M.y1 - M.day} H${M.x1 - M.day} V${M.y0 + M.day} Z`,
    class: 'loi-thep-mt', 'fill-rule': 'evenodd',
  }, gMC);
  const mm = M.day / 2;
  // C trùng đường trung bình, đi cùng chiều kim đồng hồ (cùng chiều φ trên hình 1.4)
  const [a0, b0, a1, b1] = [M.x0 + mm, M.y0 + mm, M.x1 - mm, M.y1 - mm];
  const [am, bm] = [(a0 + a1) / 2, (b0 + b1) / 2];
  el('rect', { x: a0, y: b0, width: a1 - a0, height: b1 - b0, class: 'duong-c-mc' }, gMC);
  for (const [x, y, goc] of [[am, b0, 0], [a1, bm, 90], [am, b1, 180], [a0, bm, 270]]) {
    el('path', { d: 'M-9 -7 L5 0 L-9 7 Z', class: 'mui-c', transform: `translate(${x} ${y}) rotate(${goc})` }, gMC);
  }
  el('text', { x: a1 + 6, y: b0 - 6, class: 'chu-vec vec-c' }, gMC).textContent = 'C';
  r.b.lopThanh = el('g', {}, gMC);
  r.b.chuMC0 = el('text', { x: 1054, y: 414, class: 'chu-svg-nho' }, gMC);
  r.b.chuMC0.textContent = 'C đi cùng chiều kim đồng hồ nên dòng điện ⊗ lấy dấu +; ⊙ nằm ngoài C.';
  r.b.chuMC1 = el('text', { x: 1054, y: 444, class: 'chu-kq' }, gMC);
  r.b.chuMC2 = el('text', { x: 1054, y: 474, class: 'chu-kq dam' }, gMC);

  // Thẻ đồ thị H theo i
  const gDT = el('g', { class: 'khu' }, gB);
  el('rect', { x: 1030, y: 506, width: 550, height: 384, rx: 18, class: 'the-svg' }, gDT);
  el('text', { x: 1054, y: 546, class: 'tieu-de-svg' }, gDT).textContent = 'H = w·i / l theo dòng điện i';
  r.b.dt = { x0: 1120, x1: 1550, y0: 580, y1: 830 };
  r.b.gDT = el('g', {}, gDT);
  return r;
}

async function khoiDong() {
  let nd, cauHoi;
  try {
    [nd, cauHoi] = await Promise.all([napJSON('du-lieu/toan-dong-dien.json'), napJSON('du-lieu/cau-hoi-toan-dong-dien.json')]);
  } catch (loi) {
    const tb = $('#thong-bao-loi');
    tb.hidden = false;
    tb.innerHTML = `<h2>Không nạp được dữ liệu</h2><p>${loi.message}</p>
      <p>Hãy mở trang qua GitHub Pages hoặc máy chủ cục bộ (ví dụ <code>python3 -m http.server</code>), xem README.</p>`;
    return;
  }
  const svg = $('#so-do');
  const r = veSanKhau(svg);
  const s = {
    kichBan: nd.macDinh.kichBan,
    dangChay: true,
    tocDo: 1,
    dayDan: nd.ampere.dayDan.map((d) => ({ ...d })),
    C: { ...nd.ampere.C },
    pha: 0, // vị trí chấm sáng trên C (0…1)
    tichLuy: [], // ∫H·dl cộng dồn theo vị trí
    tong: 0,
    thayDoi: true,
    w: nd.machTu.w, i: nd.machTu.i_A, l: nd.machTu.l_m, muR: nd.machTu.muR, S: nd.machTu.S_cm2,
    phaPhi: 0,
  };

  // ---------- Lý thuyết ----------
  const lt = nd.lyThuyet;
  $('#the-ly-thuyet').innerHTML = `
    <p class="muc-nho">${lt.muc}</p>
    <h2>${lt.tieuDe}</h2>
    <p class="phat-bieu">${lt.phatBieu}</p>
    ${lt.congThuc.map((c, k) => `${c.chu ? `<p class="dong-ly-thuyet">${c.chu}</p>` : ''}<div class="cong-thuc" data-ct="${k}"></div>`).join('')}
    <p class="dong-ly-thuyet">trong đó:</p>
    <ul class="ky-hieu-ly-thuyet">${lt.kyHieu.map((k) => `<li><i>${k.tex}</i> – ${k.chu}</li>`).join('')}</ul>
    <p class="quy-tac">${lt.chuY}</p>
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
  $('#chon-kich-ban').addEventListener('change', (e) => chonKichBan(e.target.value));
  const nutTMH = $('#nut-toan-man-hinh');
  if (!document.fullscreenEnabled) nutTMH.hidden = true;
  nutTMH.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  });
  document.addEventListener('fullscreenchange', () => nutTMH.classList.toggle('dang-bat', !!document.fullscreenElement));

  // ---------- Kéo thả trong kịch bản a ----------
  const toaDoMP = (e) => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    return [p.x - MP.cx, MP.cy - p.y];
  };
  const kep = (x, y, le = 0) => [Math.max(-MP.rx + le, Math.min(MP.rx - le, x)), Math.max(-MP.ry + le, Math.min(MP.ry - le, y))];
  // C luôn nằm gọn trong mặt phẳng hình
  const banKinhToiDa = (C) => Math.min(MP.rx - Math.abs(C.cx), (MP.ry - Math.abs(C.cy)) / (C.hinh === 'chu-nhat' ? 0.62 : 1)) - 6;
  let keo = null;
  svg.addEventListener('pointerdown', (e) => {
    const dich = e.target.closest('[data-keo]');
    if (!dich || s.kichBan !== 'ampere') return;
    e.preventDefault();
    svg.setPointerCapture(e.pointerId);
    const [x, y] = toaDoMP(e);
    keo = { loai: dich.dataset.keo, x0: x, y0: y, daDi: false, chiSo: Number(dich.dataset.chiSo) };
    if (keo.loai === 'day') keo.goc = [s.dayDan[keo.chiSo].x, s.dayDan[keo.chiSo].y];
    if (keo.loai === 'C-tam') keo.goc = [s.C.cx, s.C.cy];
  });
  svg.addEventListener('pointermove', (e) => {
    if (!keo) return;
    const [x, y] = toaDoMP(e);
    const dx = x - keo.x0;
    const dy = y - keo.y0;
    if (Math.hypot(dx, dy) > 4) keo.daDi = true;
    if (!keo.daDi) return;
    if (keo.loai === 'day') {
      const d = s.dayDan[keo.chiSo];
      [d.x, d.y] = kep(keo.goc[0] + dx, keo.goc[1] + dy, R_MIN + 4);
    } else if (keo.loai === 'C-tam') {
      [s.C.cx, s.C.cy] = kep(keo.goc[0] + dx, keo.goc[1] + dy, 60);
      s.C.r = Math.max(60, Math.min(banKinhToiDa(s.C), s.C.r));
    } else if (keo.loai === 'C-co') {
      const r0 = s.C.hinh === 'chu-nhat' ? Math.abs(x - s.C.cx) : Math.hypot(x - s.C.cx, y - s.C.cy);
      s.C.r = Math.max(60, Math.min(banKinhToiDa(s.C), r0));
    }
    s.thayDoi = true;
  });
  const tha = () => {
    if (keo && !keo.daDi && keo.loai === 'day') {
      // bấm (không kéo) vào dây dẫn: đổi chiều dòng điện
      s.dayDan[keo.chiSo].I = -s.dayDan[keo.chiSo].I;
      s.thayDoi = true;
      veDieuKhien();
    } else if (keo) veDieuKhien(false);
    keo = null;
  };
  svg.addEventListener('pointerup', tha);
  svg.addEventListener('pointercancel', () => { keo = null; });

  // ---------- Kịch bản ----------
  function chonKichBan(id) {
    s.kichBan = id;
    $('#chon-kich-ban').value = id;
    document.body.dataset.kichBan = id;
    r.a.g.style.display = id === 'ampere' ? '' : 'none';
    r.b.g.style.display = id === 'mach-tu' ? '' : 'none';
    document.querySelectorAll('[data-che-do]').forEach((o) => { o.hidden = o.dataset.cheDo !== id; });
    s.thayDoi = true;
    veDieuKhien();
    veSoLieu(true);
  }

  function veDieuKhien(hetLai = true) {
    const dk = $('#dieu-khien-kich-ban');
    if (s.kichBan === 'ampere') {
      if (!hetLai && dk.querySelector('#td-ds')) {
        // chỉ cập nhật giá trị hiển thị sau khi kéo thả
        s.dayDan.forEach((d, k) => {
          const o = dk.querySelector(`[data-i="${k}"]`);
          if (o) { o.value = d.I; dk.querySelector(`[data-i-gt="${k}"]`).textContent = `${dinhDangSo(d.I, 1)} A`; }
        });
        return;
      }
      dk.innerHTML = `
        <p class="mo-ta">Mỗi dây dẫn vuông góc với mặt phẳng hình. Dòng điện dương (⊙) đi ra, âm (⊗) đi vào. Đường cong C đi <b>ngược chiều kim đồng hồ</b>.</p>
        <div id="td-ds">
          ${s.dayDan.map((d, k) => `<label class="dieu-khien doc"><span>i<sub>${k + 1}</sub></span> <input type="range" min="${-nd.ampere.iMax_A}" max="${nd.ampere.iMax_A}" step="0.5" value="${d.I}" data-i="${k}"><output data-i-gt="${k}">${dinhDangSo(d.I, 1)} A</output></label>`).join('')}
        </div>
        <div class="hang-nut">
          <button type="button" class="nut" id="td-them" ${s.dayDan.length >= 5 ? 'disabled' : ''}>＋ Thêm dây dẫn</button>
          <button type="button" class="nut" id="td-bot" ${s.dayDan.length <= 1 ? 'disabled' : ''}>－ Bớt dây dẫn</button>
        </div>
        <div class="hang-nut">
          <button type="button" class="nut" id="td-tron" aria-pressed="${s.C.hinh === 'tron'}">◯ C hình tròn</button>
          <button type="button" class="nut" id="td-cn" aria-pressed="${s.C.hinh === 'chu-nhat'}">▭ C hình chữ nhật</button>
          <button type="button" class="nut" id="td-di">↻ Đi lại một vòng</button>
        </div>`;
      dk.querySelectorAll('[data-i]').forEach((o) => o.addEventListener('input', () => {
        const k = Number(o.dataset.i);
        s.dayDan[k].I = Number(o.value);
        dk.querySelector(`[data-i-gt="${k}"]`).textContent = `${dinhDangSo(s.dayDan[k].I, 1)} A`;
        s.thayDoi = true;
      }));
      dk.querySelector('#td-them').addEventListener('click', () => {
        const goc = s.dayDan.length * 1.7;
        s.dayDan.push({ x: Math.round(260 * Math.cos(goc)), y: Math.round(200 * Math.sin(goc)), I: 2 });
        s.thayDoi = true;
        veDieuKhien();
      });
      dk.querySelector('#td-bot').addEventListener('click', () => { s.dayDan.pop(); s.thayDoi = true; veDieuKhien(); });
      dk.querySelector('#td-tron').addEventListener('click', () => { s.C.hinh = 'tron'; s.C.r = Math.min(s.C.r, banKinhToiDa(s.C)); s.thayDoi = true; veDieuKhien(); });
      dk.querySelector('#td-cn').addEventListener('click', () => { s.C.hinh = 'chu-nhat'; s.C.r = Math.min(s.C.r, banKinhToiDa(s.C)); s.thayDoi = true; veDieuKhien(); });
      dk.querySelector('#td-di').addEventListener('click', () => { s.pha = 0; });
    } else {
      const c = nd.machTu;
      dk.innerHTML = `
        <p class="mo-ta">Cuộn dây w vòng quấn trên lõi thép, mang dòng điện từ hóa i. Đường cong C chọn trùng đường trung bình của mạch từ, dài l.</p>
        <label class="dieu-khien doc"><span>Số vòng w</span> <input type="range" id="mt-w" min="${c.wMin}" max="${c.wMax}" step="10" value="${s.w}"><output id="mt-w-gt"></output></label>
        <label class="dieu-khien doc"><span>Dòng điện i</span> <input type="range" id="mt-i" min="0" max="${c.iMax_A}" step="0.1" value="${s.i}"><output id="mt-i-gt"></output></label>
        <label class="dieu-khien doc"><span>Chiều dài l</span> <input type="range" id="mt-l" min="${c.lMin_m}" max="${c.lMax_m}" step="0.05" value="${s.l}"><output id="mt-l-gt"></output></label>
        <details class="mo-rong">
          <summary>Mở rộng: từ cảm B và từ thông φ</summary>
          <label class="dieu-khien doc"><span>μ<sub>r</sub> (minh họa)</span> <input type="range" id="mt-mu" min="${c.muRMin}" max="${c.muRMax}" step="100" value="${s.muR}"><output id="mt-mu-gt"></output></label>
          <p class="ghi-chu-nho">Giả thiết vật liệu tuyến tính, tiết diện S = ${dinhDangSo(c.S_cm2, 0)} cm². Thực tế đường cong từ hóa của thép không tuyến tính và có bão hòa.</p>
        </details>`;
      const capNhat = () => {
        s.w = Number($('#mt-w').value);
        s.i = Number($('#mt-i').value);
        s.l = Number($('#mt-l').value);
        s.muR = Number($('#mt-mu').value);
        $('#mt-w-gt').textContent = String(s.w);
        $('#mt-i-gt').textContent = `${dinhDangSo(s.i, 1)} A`;
        $('#mt-l-gt').textContent = `${dinhDangSo(s.l, 2)} m`;
        $('#mt-mu-gt').textContent = dinhDangSo(s.muR, 0);
        s.thayDoi = true;
      };
      for (const q of ['#mt-w', '#mt-i', '#mt-l', '#mt-mu']) $(q).addEventListener('input', capNhat);
      capNhat();
    }
  }

  // ---------- Tính toán kịch bản a ----------
  function tinhLaiA() {
    const hc = hinhC(s.C);
    const day = s.dayDan.map((d) => ({ ...d }));
    const tl = new Float64Array(N_TICH_PHAN + 1);
    let truoc = hc.diem(0);
    for (let k = 1; k <= N_TICH_PHAN; k++) {
      const sau = hc.diem(k / N_TICH_PHAN);
      const [Hx, Hy] = truongTong(day, (truoc[0] + sau[0]) / 2, (truoc[1] + sau[1]) / 2, R_MIN);
      tl[k] = tl[k - 1] + Hx * (sau[0] - truoc[0]) + Hy * (sau[1] - truoc[1]);
      truoc = sau;
    }
    s.tichLuy = tl;
    s.tong = tl[N_TICH_PHAN];
    s.sigma = tongDongDienBaoQuanh(day, hc.trong);
    // đóng góp riêng của từng dây (tích phân số riêng rẽ)
    s.dongGop = day.map((d) => {
      let tong = 0;
      let p0 = hc.diem(0);
      for (let k = 1; k <= 360; k++) {
        const p1 = hc.diem(k / 360);
        const [Hx, Hy] = truongTong([d], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, R_MIN);
        tong += Hx * (p1[0] - p0[0]) + Hy * (p1[1] - p0[1]);
        p0 = p1;
      }
      return { I: d.I, trong: hc.trong(d.x, d.y), gop: tong };
    });
    veHinhA(hc);
  }

  function veHinhA(hc) {
    const C = s.C;
    // đường cong C
    let d = '';
    for (let k = 0; k <= 160; k++) {
      const [x, y] = hc.diem(k / 160);
      d += `${k ? 'L' : 'M'}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`;
    }
    r.a.duongC.setAttribute('d', `${d} Z`);
    r.a.vungC.setAttribute('d', `${d} Z`);
    [0.125, 0.375, 0.625, 0.875].forEach((t, k) => {
      const [x0, y0] = hc.diem(t - 0.003);
      const [x1, y1] = hc.diem(t + 0.003);
      const goc = (Math.atan2(-(y1 - y0), x1 - x0) * 180) / Math.PI;
      const [x, y] = hc.diem(t);
      r.a.muiC[k].setAttribute('transform', `translate(${sx(x).toFixed(1)} ${sy(y).toFixed(1)}) rotate(${goc.toFixed(1)})`);
    });
    const [xc, yc] = hc.diem(0.18);
    r.a.nhanC.setAttribute('x', sx(xc) + 14);
    r.a.nhanC.setAttribute('y', sy(yc) - 10);
    r.a.tamC.setAttribute('transform', `translate(${sx(C.cx)} ${sy(C.cy)})`);
    r.a.coC.setAttribute('cx', sx(C.cx + C.r));
    r.a.coC.setAttribute('cy', sy(C.cy));
    // lưới H (thang logarit để thấy được cả vùng xa)
    const Href = 1 / (2 * Math.PI * 140);
    for (const o of r.a.luoiH) {
      // bỏ mũi tên sát dây dẫn và chỗ đặt nhãn dòng điện bên dưới dây
      const gan = s.dayDan.some((dd) => Math.hypot(dd.x - o.x, dd.y - o.y) < R_MIN + 10
        || (Math.abs(dd.x - o.x) < 75 && o.y < dd.y && o.y > dd.y - R_MIN - 40));
      const [Hx, Hy] = truongTong(s.dayDan, o.x, o.y, R_MIN);
      const H = Math.hypot(Hx, Hy);
      if (gan || H < 1e-9) { o.l.setAttribute('opacity', 0); continue; }
      const dai = Math.min(26, 5 + 9 * Math.log2(1 + H / Href));
      const ux = Hx / H;
      const uy = Hy / H;
      o.l.setAttribute('x1', (sx(o.x) - (ux * dai) / 2).toFixed(1));
      o.l.setAttribute('y1', (sy(o.y) + (uy * dai) / 2).toFixed(1));
      o.l.setAttribute('x2', (sx(o.x) + (ux * dai) / 2).toFixed(1));
      o.l.setAttribute('y2', (sy(o.y) - (uy * dai) / 2).toFixed(1));
      o.l.setAttribute('opacity', Math.min(0.85, 0.2 + 0.25 * Math.log2(1 + H / Href)).toFixed(2));
    }
    // thành phần tiếp tuyến H_t dọc theo C
    r.a.ht.forEach((o, k) => {
      const t = (k + 0.5) / r.a.ht.length;
      const [x, y] = hc.diem(t);
      const [xa, ya] = hc.diem(t - 0.002);
      const [xb, yb] = hc.diem(t + 0.002);
      const n = Math.hypot(xb - xa, yb - ya) || 1;
      const tx = (xb - xa) / n;
      const ty = (yb - ya) / n;
      const [Hx, Hy] = truongTong(s.dayDan, x, y, R_MIN);
      const Ht = Hx * tx + Hy * ty;
      const dai = Math.sign(Ht) * Math.min(30, 4 + 10 * Math.log2(1 + Math.abs(Ht) / Href));
      o.setAttribute('x1', sx(x).toFixed(1));
      o.setAttribute('y1', sy(y).toFixed(1));
      o.setAttribute('x2', (sx(x) + tx * dai).toFixed(1));
      o.setAttribute('y2', (sy(y) - ty * dai).toFixed(1));
      o.setAttribute('class', `mui-ht ${Ht >= 0 ? 'duong' : 'am'}`);
      o.setAttribute('marker-end', `url(#mui-${Ht >= 0 ? 'duong' : 'am'})`);
    });
    // dây dẫn
    r.a.lopDay.innerHTML = '';
    s.dayDan.forEach((dd, k) => {
      const g = el('g', { class: `day-dan ${dd.I >= 0 ? 'ra' : 'vao'}`, 'data-keo': 'day', 'data-chi-so': k, transform: `translate(${sx(dd.x)} ${sy(dd.y)})` }, r.a.lopDay);
      el('circle', { r: R_MIN }, g);
      if (dd.I >= 0) el('circle', { r: 5, class: 'cham-ra' }, g);
      else el('path', { d: 'M-10 -10 L10 10 M10 -10 L-10 10', class: 'cheo-vao' }, g);
      el('text', { y: R_MIN + 24, 'text-anchor': 'middle', class: 'nhan-day' }, g).textContent = `i${k + 1} = ${dinhDangSo(dd.I, 1)} A`;
    });
    // cột đóng góp
    const gMax = Math.max(1, ...s.dayDan.map((dd) => Math.abs(dd.I)));
    r.a.cotDG.forEach((c, k) => {
      const dg = s.dongGop[k];
      const hien = !!dg;
      [c.nhan, c.cot, c.gt].forEach((o) => { o.style.display = hien ? '' : 'none'; });
      if (!hien) return;
      c.nhan.textContent = `i${k + 1} ${dg.trong ? '(trong C)' : '(ngoài C)'}`;
      const w = (Math.abs(dg.gop) / gMax) * 95;
      c.cot.setAttribute('x', dg.gop >= 0 ? 1370 : 1370 - w);
      c.cot.setAttribute('width', Math.max(1.5, w));
      c.cot.setAttribute('class', `cot-dg ${dg.gop >= 0 ? 'duong' : 'am'}`);
      c.gt.textContent = `${dinhDangSo(Math.abs(dg.gop) < 0.005 ? 0 : dg.gop, 2)} A`;
    });
  }

  // ---------- Vẽ kịch bản b ----------
  function veHinhB() {
    const { L } = r.b;
    // cuộn dây: các vòng xoắn quấn quanh trụ trái
    const n = Math.max(3, Math.min(12, Math.round(s.w / 40)));
    const yTren = L.y0 + 190;
    const yDuoi = L.y1 - 190;
    const buoc = (yDuoi - yTren) / (n - 1);
    const xT = L.x0 - 22;
    const xP = L.x0 + L.day + 22;
    let d = '';
    for (let k = 0; k < n; k++) {
      const y = yTren + k * buoc;
      d += `M${xT} ${y + 10} C${xT - 6} ${y - 8} ${xP + 6} ${y - 18} ${xP} ${y} `;
    }
    r.b.lopCuon.innerHTML = '';
    el('path', { d, class: 'vong-cuon-mt' }, r.b.lopCuon);
    r.b.dauVao.setAttribute('d', `M${xT - 170} ${yTren - 10} L${xT - 4} ${yTren - 10} L${xT} ${yTren + 10}`);
    r.b.dauRa.setAttribute('d', `M${xT} ${yDuoi + 10} L${xT - 4} ${yDuoi + 28} L${xT - 170} ${yDuoi + 28}`);
    r.b.chuI.setAttribute('x', xT - 120);
    r.b.chuI.setAttribute('y', yTren - 26);
    r.b.chuW.setAttribute('x', xP + 26);
    r.b.chuW.setAttribute('y', (yTren + yDuoi) / 2 + 8);
    r.b.chuW.textContent = `w = ${s.w}`;
    r.b.nhanSo.textContent = `Vẽ ${n} vòng tượng trưng cho w = ${s.w} vòng. Mũi tên nét đứt: đường trung bình l (cũng là đường cong C).`;
    // mặt cắt: các thanh dẫn
    const { M } = r.b;
    r.b.lopThanh.innerHTML = '';
    const soThanh = Math.min(7, Math.max(2, Math.round(s.w / 100)));
    const yA = M.y0 + M.day + 18;
    const yB = M.y1 - M.day - 18;
    for (let k = 0; k < soThanh; k++) {
      const y = yA + ((yB - yA) * k) / Math.max(1, soThanh - 1);
      // cạnh ngoài trụ trái: dòng điện đi ra (⊙); cạnh trong (cửa sổ): đi vào (⊗)
      const ra = el('g', { transform: `translate(${M.x0 - 18} ${y})`, class: 'thanh-mc ra' }, r.b.lopThanh);
      el('circle', { r: 11 }, ra);
      el('circle', { r: 3.5, class: 'cham-ra' }, ra);
      const vao = el('g', { transform: `translate(${M.x0 + M.day + 18} ${y})`, class: 'thanh-mc vao' }, r.b.lopThanh);
      el('circle', { r: 11 }, vao);
      el('path', { d: 'M-6 -6 L6 6 M6 -6 L-6 6', class: 'cheo-vao' }, vao);
    }
    r.b.chuMC1.textContent = `C bao ${s.w} thanh dẫn ⊗ (vẽ ${soThanh}), mỗi thanh mang i = ${dinhDangSo(s.i, 1)} A`;
    r.b.chuMC2.textContent = `⇒ Σi = w·i = ${s.w}·${dinhDangSo(s.i, 1)} = ${dinhDangSo(sucTuDong(s.w, s.i), 0)} A`;
    // đồ thị H theo i
    const { dt } = r.b;
    const g = r.b.gDT;
    g.innerHTML = '';
    const iMax = nd.machTu.iMax_A;
    const hMax = lamTronDep(cuongDoTuTruong(s.w, iMax, s.l));
    const X = (i) => dt.x0 + (i / iMax) * (dt.x1 - dt.x0);
    const Y = (h) => dt.y1 - (h / hMax) * (dt.y1 - dt.y0);
    for (const k of [0, 0.5, 1]) {
      el('line', { x1: dt.x0, x2: dt.x1, y1: Y(k * hMax), y2: Y(k * hMax), class: k ? 'luoi-dt' : 'truc-0' }, g);
      el('text', { x: dt.x0 - 8, y: Y(k * hMax) + 5, class: 'chu-truc-dt', 'text-anchor': 'end' }, g).textContent = dinhDangSo(k * hMax, 0);
    }
    for (let i = 0; i <= iMax; i++) el('text', { x: X(i), y: dt.y1 + 22, class: 'chu-truc-dt', 'text-anchor': 'middle' }, g).textContent = `${i} A`;
    el('text', { x: dt.x0 - 8, y: dt.y0 - 14, class: 'chu-truc-dt', 'text-anchor': 'end' }, g).textContent = 'A/m';
    el('line', { x1: X(0), y1: Y(0), x2: X(iMax), y2: Y(cuongDoTuTruong(s.w, iMax, s.l)), class: 'duong-dt', stroke: '#2a78d6' }, g);
    const H = cuongDoTuTruong(s.w, s.i, s.l);
    el('line', { x1: X(s.i), y1: dt.y1, x2: X(s.i), y2: Y(H), class: 'duong-gioi' }, g);
    el('circle', { cx: X(s.i), cy: Y(H), r: 7, fill: '#2a78d6', class: 'cham-dt' }, g);
    el('text', { x: Math.min(X(s.i) + 12, dt.x1 - 120), y: Y(H) - 12, class: 'chu-tiep-tuyen', 'text-anchor': 'start' }, g).textContent = `H = ${soCoNghia(H)} A/m`;
  }

  // ---------- Số liệu & chú thích ----------
  let lanSoLieu = 0;
  function veSoLieu(ngay = false) {
    const bayGio = performance.now();
    if (!ngay && bayGio - lanSoLieu < 250) return;
    lanSoLieu = bayGio;
    let html;
    if (s.kichBan === 'ampere') {
      if (!s.dongGop) return;
      const trong = s.dongGop.map((dg, k) => ({ ...dg, k })).filter((dg) => dg.trong);
      const ngoai = s.dongGop.map((dg, k) => ({ ...dg, k })).filter((dg) => !dg.trong);
      const bieuThuc = trong.length
        ? trong.map((dg, j) => `${dg.I >= 0 ? (j ? ' + ' : '') : ' − '}${dinhDangSo(Math.abs(dg.I), 1)}`).join('')
        : '0';
      $('#sl-sigma').textContent = `${dinhDangSo(s.sigma, 2)} A`;
      $('#sl-tich-phan').textContent = `${dinhDangSo(s.tong, 2)} A`;
      $('#sl-trong').textContent = trong.length ? trong.map((dg) => `i${dg.k + 1}`).join(', ') : 'không có';
      $('#sl-ngoai').textContent = ngoai.length ? ngoai.map((dg) => `i${dg.k + 1}`).join(', ') : 'không có';
      const texBT = trong.length
        ? trong.map((dg, j) => `${dg.I >= 0 ? (j ? '+' : '') : '-'}${soTex(dinhDangSo(Math.abs(dg.I), 1))}`).join('')
        : '0';
      veCongThuc($('#ct-ampere'),
        `\\oint_C H\\,dl = \\sum i_k = ${texBT} = \\mathbf{${soTex(dinhDangSo(s.sigma, 1))}\\ \\text{A}}`,
        `∮H·dl = Σi = ${bieuThuc} = <b>${dinhDangSo(s.sigma, 1)} A</b>`);
      html = `C bao quanh: ${trong.length ? trong.map((dg) => `i${dg.k + 1} = ${dinhDangSo(dg.I, 1)} A ${dg.I >= 0 ? '(⊙, dấu +)' : '(⊗, dấu −)'}`).join('; ') : 'không có dây nào'} → <b>Σi = ${dinhDangSo(s.sigma, 1)} A</b>. Tích phân số ∮H·dl = <b>${dinhDangSo(s.tong, 2)} A</b> ✓.${ngoai.length ? ` Dây ${ngoai.map((dg) => `i${dg.k + 1}`).join(', ')} nằm ngoài C: không đóng góp.` : ''}`;
    } else {
      const F = sucTuDong(s.w, s.i);
      const H = cuongDoTuTruong(s.w, s.i, s.l);
      const B = tuCam(H, s.muR);
      const phi = B * s.S * 1e-4;
      $('#sl-f').textContent = `${dinhDangSo(F, 0)} A·vòng`;
      $('#sl-h').textContent = `${soCoNghia(H)} A/m`;
      $('#sl-bb').textContent = `${soCoNghia(B)} T`;
      $('#sl-phi').textContent = `${soCoNghia(phi * 1000)} mWb`;
      veCongThuc($('#ct-mach-tu'),
        `H = \\dfrac{wi}{l} = \\dfrac{${s.w}\\cdot ${soTex(dinhDangSo(s.i, 1))}}{${soTex(dinhDangSo(s.l, 2))}} = \\mathbf{${soTex(soCoNghia(H))}\\ \\text{A/m}}`,
        `H = w·i/l = ${s.w}·${dinhDangSo(s.i, 1)}/${dinhDangSo(s.l, 2)} = <b>${soCoNghia(H)} A/m</b>`);
      html = s.i <= 0
        ? 'Chưa có dòng điện từ hóa (i = 0): sức từ động F = 0, không có từ trường trong mạch từ.'
        : `Cuộn dây ${s.w} vòng mang dòng điện từ hóa i = ${dinhDangSo(s.i, 1)} A → sức từ động <b>F = w·i = ${dinhDangSo(F, 0)} A·vòng</b>; mạch từ dài l = ${dinhDangSo(s.l, 2)} m → <b>H = F/l = ${soCoNghia(H)} A/m</b>.`;
    }
    const c = $('#chu-thich-buoc');
    c.className = 'chu-thich-buoc thanh-cong';
    c.innerHTML = `<span>${html}</span>`;
    const oTC = $('#tc-so-lieu');
    if (oTC && trinhChieu.idHienTai) {
      oTC.textContent = s.kichBan === 'ampere'
        ? `Σi = ${dinhDangSo(s.sigma, 1)} A · ∮H·dl (tính số) = ${dinhDangSo(s.tong, 2)} A`
        : `w = ${s.w} · i = ${dinhDangSo(s.i, 1)} A · l = ${dinhDangSo(s.l, 2)} m · F = ${dinhDangSo(sucTuDong(s.w, s.i), 0)} A·vòng · H = ${soCoNghia(cuongDoTuTruong(s.w, s.i, s.l))} A/m`;
    }
  }

  // ---------- Trình chiếu & câu hỏi ----------
  const trinhChieu = khoiTaoTrinhChieu({
    noiDung: null,
    cacBuocTrinhChieu: nd.trinhChieu,
    lamNoiBat: (id, b) => {
      const tt = b?.trangThai;
      if (!tt) return;
      if (tt.C) { s.C = { ...tt.C }; s.dayDan = nd.ampere.dayDan.map((d) => ({ ...d })); s.pha = 0; }
      if (tt.kichBan) chonKichBan(tt.kichBan);
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
    if (s.kichBan === 'ampere') {
      if (s.thayDoi) { tinhLaiA(); s.thayDoi = false; veSoLieu(true); }
      s.pha = (s.pha + dt / nd.ampere.chuKyDiVong_s) % 1;
      const hc = hinhC(s.C);
      const [x, y] = hc.diem(s.pha);
      r.a.chamDi.setAttribute('cx', sx(x).toFixed(1));
      r.a.chamDi.setAttribute('cy', sy(y).toFixed(1));
      const k = Math.min(N_TICH_PHAN, Math.round(s.pha * N_TICH_PHAN));
      const daCong = s.tichLuy[k] ?? 0;
      r.a.giaTriTichLuy.textContent = `${dinhDangSo(daCong, 2)} A`;
      r.a.phanTram.textContent = `đã đi ${dinhDangSo(s.pha * 100, 0)} % vòng C`;
      const goc = s.pha * 2 * Math.PI;
      const R = 120;
      const xa = 1305 + R * Math.sin(goc);
      const ya = 238 - R * Math.cos(goc);
      r.a.vongTien.setAttribute('d', s.pha < 0.001 ? '' : `M1305 ${238 - R} A${R} ${R} 0 ${s.pha > 0.5 ? 1 : 0} 1 ${xa.toFixed(1)} ${ya.toFixed(1)}`);
      r.a.dongKQ1.textContent = `Tích phân số cả vòng: ∮H·dl = ${dinhDangSo(s.tong, 2)} A`;
      r.a.dongKQ2.textContent = `Tổng đại số dòng điện bao quanh: Σi = ${dinhDangSo(s.sigma, 2)} A`;
      r.a.dongKQ3.textContent = Math.abs(s.tong - s.sigma) < 0.05 ? '✓ Hai kết quả bằng nhau: ∮H·dl = Σi' : '…';
    } else {
      if (s.thayDoi) { veHinhB(); s.thayDoi = false; veSoLieu(true); }
      const H = cuongDoTuTruong(s.w, s.i, s.l);
      s.phaPhi = (s.phaPhi + dt * (20 + 0.08 * H)) % 40;
      r.b.dongPhi.style.strokeDashoffset = (-s.phaPhi).toFixed(1);
      r.b.dongPhi.style.opacity = s.i > 0 ? Math.min(1, 0.25 + H / 2000).toFixed(2) : 0;
    }
    veSoLieu();
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
