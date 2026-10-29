/**
 * to-noi-day.js — Xác định tổ nối dây MBA ba pha bằng véc tơ (slide 68–72).
 *
 * Sđđ dây quấn trên trụ k (k = 0, 1, 2 ứng A, B, C): E_k = 1∠(90° − 120°·k) (đồ thị véc tơ quay ngược chiều kim đồng hồ).
 * Mỗi dây quấn là nguồn sđđ hướng từ đầu cuối (X, x…) đến đầu đầu (A, a…): V(đầu) − V(cuối) = e.
 * Kiểu nối: 'Y' – ba đầu cuối nối chung; 'D1' – đầu đầu pha i nối đầu cuối pha i−1 (A–Z, B–X, C–Y);
 * 'D2' – đầu đầu pha i nối đầu cuối pha i+1 (A–Y, B–Z, C–X).
 */
import { phuc, tru, doiDau, goc, cucSang } from './so-phuc.js';

const RAD = Math.PI / 180;

/** Sđđ dây quấn trên ba trụ. */
export const sddTru = () => [0, 1, 2].map((k) => cucSang(1, (90 - 120 * k) * RAD));

/**
 * Điện áp dây U_ab (giữa đầu ra pha 0 và pha 1) của một phía.
 * @param {'Y'|'D1'|'D2'} noi kiểu nối
 * @param {number[][]} e sđđ ba dây quấn theo thứ tự pha (a, b, c)
 */
export function dienApDay(noi, e) {
  if (noi === 'Y') return tru(e[0], e[1]);
  if (noi === 'D1') return e[0]; // a = đầu a = cuối c, b = đầu b = cuối a ⇒ Uab = e_a
  return doiDau(e[1]); // a = đầu a = cuối b ⇒ Uab = −e_b
}

/** Điện thế ba đầu ra (để vẽ đồ thị véc tơ), lấy trọng tâm tam giác làm gốc. */
export function dienTheDauRa(noi, e) {
  let v;
  if (noi === 'Y') v = e.map((x) => [...x]);
  else if (noi === 'D1') {
    // V(a) − V(b) = e_a, V(b) − V(c) = e_b
    const a = phuc(0, 0);
    const b = tru(a, e[0]);
    const c = tru(b, e[1]);
    v = [a, b, c];
  } else {
    // V(a) − V(c) = e_a (đầu a, cuối a = c), V(b) − V(a) = e_b
    const a = phuc(0, 0);
    const b = [a[0] + e[1][0], a[1] + e[1][1]];
    const c = tru(a, e[0]);
    v = [a, b, c];
  }
  const g = [(v[0][0] + v[1][0] + v[2][0]) / 3, (v[0][1] + v[1][1] + v[2][1]) / 3];
  return v.map((x) => tru(x, g));
}

/**
 * Tổ nối dây.
 * @param {{so: 'Y'|'D1'|'D2', thu: 'Y'|'D1'|'D2', nguocCuc?: boolean, hoanVi?: 0|1|2}} cfg
 *   nguocCuc: dây quấn thứ cấp quấn/đánh dấu ngược (sđđ ngược pha); hoanVi: dời nhãn a, b, c sang trụ kế tiếp
 * @returns {{so: number, goc: number, UAB: number[], Uab: number[], eSo: number[][], eThu: number[][]}}
 */
export function toNoiDay({ so, thu, nguocCuc = false, hoanVi = 0 }) {
  const E = sddTru();
  const eSo = E;
  const eThu = [0, 1, 2].map((i) => {
    const x = E[(i + hoanVi) % 3];
    return nguocCuc ? doiDau(x) : [...x];
  });
  const UAB = dienApDay(so, eSo);
  const Uab = dienApDay(thu, eThu);
  let lech = ((goc(UAB) - goc(Uab)) / RAD) % 360;
  if (lech < 0) lech += 360;
  let n = Math.round(lech / 30) % 12;
  if (n === 0) n = 12;
  return { so: n, goc: Math.round(lech) % 360, UAB, Uab, eSo, eThu };
}

/** Ký hiệu tổ nối dây, ví dụ Y/Δ-11. */
export function kyHieuTo(cfg) {
  const t = (x) => (x === 'Y' ? 'Y' : 'Δ');
  return `${t(cfg.so)}/${t(cfg.thu)}-${toNoiDay(cfg).so}`;
}

/** Tổ nối dây MBA một pha: cùng cực tính I/I-12, ngược cực tính I/I-6 (slide 70–71). */
export const toMotPha = (nguocCuc) => (nguocCuc ? 6 : 12);
