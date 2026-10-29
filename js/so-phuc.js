/**
 * so-phuc.js — Số phức tối giản cho tính toán mạch xoay chiều (biểu diễn [thực, ảo]).
 */
export const phuc = (re, im = 0) => [re, im];
export const cong = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const tru = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const nhan = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const nhanSo = (a, k) => [a[0] * k, a[1] * k];
export const chia = (a, b) => {
  const m = b[0] * b[0] + b[1] * b[1];
  if (m === 0) throw new RangeError('Chia cho số phức 0');
  return [(a[0] * b[0] + a[1] * b[1]) / m, (a[1] * b[0] - a[0] * b[1]) / m];
};
export const doLon = (a) => Math.hypot(a[0], a[1]);
/** Góc (rad) của số phức. */
export const goc = (a) => Math.atan2(a[1], a[0]);
export const doiDau = (a) => [-a[0], -a[1]];
/** Số phức từ mô-đun và góc (rad). */
export const cucSang = (r, phi) => [r * Math.cos(phi), r * Math.sin(phi)];
/** Hai tổng trở song song. */
export const songSong = (a, b) => chia(nhan(a, b), cong(a, b));
