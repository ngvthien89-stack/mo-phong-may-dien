/**
 * tien-ich.js — Hàm tiện ích dùng chung cho các trang mô phỏng: nạp JSON, định dạng số, vẽ công thức KaTeX.
 */
import { dinhDangSo } from './tinh-toan.js';

export async function napJSON(duongDan) {
  const r = await fetch(duongDan, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${duongDan}: HTTP ${r.status}`);
  return r.json();
}

/** Số có khoảng 3 chữ số có nghĩa, định dạng Việt Nam. */
export function soCoNghia(x, so = 3) {
  if (!Number.isFinite(x)) return '—';
  if (x === 0) return '0';
  const le = Math.max(0, Math.min(6, so - 1 - Math.floor(Math.log10(Math.abs(x)))));
  return dinhDangSo(x, le);
}

/** Làm tròn lên mốc "đẹp" 1 – 2 – 2,5 – 5 × 10ⁿ (dùng cho thang đo). */
export function lamTronDep(x) {
  if (!(x > 0)) return 1;
  const mu = Math.pow(10, Math.floor(Math.log10(x)));
  for (const k of [1, 2, 2.5, 5, 10]) if (k * mu >= x * 0.999) return k * mu;
  return 10 * mu;
}

export function veCongThuc(o, tex, duPhong) {
  if (window.katex) {
    try {
      window.katex.render(tex, o, { throwOnError: false, displayMode: true });
      return;
    } catch { /* dạng dự phòng */ }
  }
  o.innerHTML = `<span class="cong-thuc-du-phong">${duPhong}</span>`;
}
/** Chuỗi số kiểu Việt Nam dùng trong KaTeX: dấu phẩy thập phân viết {,}, dấu chấm phân nghìn viết khoảng cách hẹp. */
export const soTex = (s) => s.replace(/\./g, '\\,').replace(',', '{,}');
