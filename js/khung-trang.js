/**
 * khung-trang.js — Khung dùng chung cho các trang mô phỏng phần II–VI (chương 1):
 * nạp dữ liệu, nút điều khiển chung, chú thích, trình chiếu, câu hỏi, vòng lặp hoạt hình.
 */
import { dinhDangSo } from './tinh-toan.js';
import { khoiTaoTrinhChieu } from './trinh-chieu.js';
import { khoiTaoCauHoi } from './kiem-tra.js';
import { napJSON } from './tien-ich.js';

export const $ = (s) => document.querySelector(s);

function hienLoi(tieuDe, noiDung) {
  const tb = $('#thong-bao-loi');
  if (!tb) return;
  tb.hidden = false;
  tb.innerHTML = `<h2>${tieuDe}</h2>${noiDung}`;
}

/** Nạp nội dung bài và ngân hàng câu hỏi; trả về null (kèm thông báo) nếu không nạp được. */
export async function napBai(tepNoiDung, tepCauHoi) {
  try {
    return await Promise.all([napJSON(tepNoiDung), napJSON(tepCauHoi)]);
  } catch (loi) {
    hienLoi('Không nạp được dữ liệu', `<p>${loi.message}</p>
      <p>Hãy mở trang qua GitHub Pages hoặc máy chủ cục bộ (ví dụ <code>python3 -m http.server</code>), xem README.</p>`);
    return null;
  }
}

/**
 * Gắn các nút chung (chạy/tạm dừng, tốc độ, chọn kịch bản, toàn màn hình).
 * @param {{dangChay: boolean, tocDo: number}} s trạng thái trang
 */
export function dieuKhienChung(s, chonKichBan) {
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
  const chuThich = (html, loai = 'thanh-cong') => {
    const c = $('#chu-thich-buoc');
    c.className = `chu-thich-buoc ${loai}`;
    c.innerHTML = `<span>${html}</span>`;
  };
  const soLieuTC = (chu) => { const o = $('#tc-so-lieu'); if (o) o.textContent = chu; };
  return { datChay, chuThich, soLieuTC };
}

/** Khởi tạo trình chiếu theo nd.trinhChieu, câu hỏi và phím tắt. */
export function trinhChieuVaCauHoi(nd, cauHoi, lamNoiBat, datChay, s) {
  const trinhChieu = khoiTaoTrinhChieu({ noiDung: null, cacBuocTrinhChieu: nd.trinhChieu, lamNoiBat });
  khoiTaoCauHoi(cauHoi);
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, select, textarea, dialog')) return;
    if (trinhChieu.xuLyPhim(e)) return;
    if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); datChay(!s.dangChay); }
  });
  return trinhChieu;
}

/** Vòng lặp requestAnimationFrame; gọi buoc(dt, dtThuc) với dt đã nhân tốc độ (0 khi tạm dừng). */
export function vongLap(s, buoc) {
  let tTruoc = performance.now();
  const khung = (bayGio) => {
    const dtThuc = Math.min(0.1, Math.max(0, (bayGio - tTruoc) / 1000));
    tTruoc = bayGio;
    const dt = s.dangChay ? dtThuc * s.tocDo : 0;
    buoc(dt, dtThuc);
    requestAnimationFrame(khung);
  };
  requestAnimationFrame(khung);
}

/** Chạy hàm khởi động trang, hiện thông báo nếu có lỗi. */
export function chayTrang(khoiDong) {
  khoiDong().catch((loi) => {
    console.error(loi);
    hienLoi('Lỗi khởi động mô phỏng', `<p>${loi.message}</p>`);
  });
}

/** Ẩn/hiện các nhóm kịch bản và các hàng dữ liệu theo kịch bản đang chọn. */
export function hienKichBan(id, nhom) {
  $('#chon-kich-ban').value = id;
  document.body.dataset.kichBan = id;
  for (const [ma, g] of Object.entries(nhom)) g.style.display = ma === id ? '' : 'none';
  document.querySelectorAll('[data-che-do]').forEach((o) => { o.hidden = !o.dataset.cheDo.split(' ').includes(id); });
}
