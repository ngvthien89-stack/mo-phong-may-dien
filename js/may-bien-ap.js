/**
 * may-bien-ap.js — Hàm thuần cho phần II (khái niệm chung về máy biến áp). Dùng chung cho trang và test Node.
 */

/**
 * So sánh truyền cùng công suất S trên cùng đường dây ở điện áp U với điện áp mốc Umoc.
 * S = √3·U·I nên I tỉ lệ nghịch với U; ΔU = z·I; ΔP = R·I².
 * @returns {{I: number, dU: number, dP: number}} tỉ số so với khi truyền ở Umoc
 */
export function soSanhTruyenTai(U, Umoc) {
  if (!(U > 0) || !(Umoc > 0)) throw new RangeError('Điện áp phải dương');
  const k = Umoc / U;
  return { I: k, dU: k, dP: k * k };
}

/** Số lần giảm tương ứng với một tỉ số (0,25 → giảm 4 lần). */
export const soLanGiam = (tiSo) => 1 / tiSo;

/** Điện áp tức thời chuẩn hóa u/Um = sin(2πft + pha). */
export function dienApChuanHoa(f, t, pha = 0) {
  return Math.sin(2 * Math.PI * f * t + pha);
}

/** Chu kỳ T = 1/f (s). */
export function chuKy(f) {
  if (!(f > 0)) throw new RangeError('Tần số phải dương');
  return 1 / f;
}

/** Loại MBA theo hai điện áp: tăng áp, hạ áp hoặc bằng nhau. */
export function loaiMBA(U1, U2) {
  if (U2 > U1) return 'tang-ap';
  if (U2 < U1) return 'ha-ap';
  return 'bang';
}

/** Độ lệch kim đồng hồ (0…1 ứng với 0…100 %), giới hạn ở toiDa %. */
export function doLechKim(phanTram, toiDa = 120) {
  return Math.max(0, Math.min(toiDa, phanTram)) / 100;
}

/** Giá trị hiệu dụng sđđ dây quấn theo slide 39: E = 4,44·f·w·Φm (Φm tính bằng Wb). */
export function sddHieuDungMBA(f, w, Phim) {
  return 4.44 * f * w * Phim;
}

/** Hệ số biến áp k = w1/w2 (slide 40). */
export function heSoBienAp(w1, w2) {
  if (!(w1 > 0) || !(w2 > 0)) throw new RangeError('Số vòng phải dương');
  return w1 / w2;
}

/** Điện áp thứ cấp khi bỏ qua điện áp rơi trên dây quấn: U2 = U1·w2/w1 (slide 40). */
export function dienApThuCap(U1, w1, w2) {
  return U1 / heSoBienAp(w1, w2);
}

/**
 * Dòng điện định mức từ công suất và điện áp định mức (slide 42):
 * 1 pha I = S/U; 3 pha I = S/(√3·U) với U là điện áp dây.
 */
export function dongDinhMuc(S, U, soPha = 3) {
  if (!(U > 0)) throw new RangeError('Điện áp phải dương');
  return soPha === 3 ? S / (Math.sqrt(3) * U) : S / U;
}
