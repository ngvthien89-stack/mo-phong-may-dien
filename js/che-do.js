/**
 * che-do.js — Hàm thuần cho phần IV (các chế độ làm việc của MBA, slide 59–64).
 */
import { giaiHinhT, tongTroTai } from './mach-mba.js';
import { doLon, goc } from './so-phuc.js';

/** Tổn hao đồng pCu = β²·Pn (slide 64). */
export const tonHaoDong = (beta, Pn) => beta * beta * Pn;

/** Tổng tổn hao Σp = pFe + pCu ≈ P0 + β²·Pn (slide 63–64). */
export const tongTonHao = (beta, P0, Pn) => P0 + tonHaoDong(beta, Pn);

/** Hệ số tải cho hiệu suất cao nhất β = √(P0/Pn) (slide 64). */
export const betaToiUu = (P0, Pn) => Math.sqrt(P0 / Pn);

/**
 * Hiệu suất η% = P2/P1·100 = (P1 − Σp)/P1·100 với P2 = β·S·cosφ2 (slide 64).
 * @returns {{P2: number, P1: number, tong: number, eta: number}}
 */
export function hieuSuat(beta, S, cosPhi2, P0, Pn) {
  const P2 = beta * S * cosPhi2;
  const tong = tongTonHao(beta, P0, Pn);
  const P1 = P2 + tong;
  return { P2, P1, tong, eta: P1 > 0 ? (P2 / P1) * 100 : 0 };
}

/** Độ thay đổi điện áp ΔU% = (U20 − U2)/U20·100 (slide 60). */
export const doThayDoiDienAp = (U20, U2) => ((U20 - U2) / U20) * 100;

/**
 * Chế độ làm việc của một pha (đã quy đổi về sơ cấp) theo sơ đồ hình T:
 * p = {U1, I1dm, r1, x1, r2, x2, Rth, Xth}; phi2 > 0 tải cảm, < 0 tải dung.
 * Trả về các thành phần công suất của giản đồ năng lượng (slide 59) và ΔU%.
 */
export function cheDoLamViec(p, beta, phi2) {
  const kq = giaiHinhT(p, beta > 0 ? tongTroTai(p.U1, p.I1dm, beta, phi2) : null);
  const kt = giaiHinhT(p, null);
  const I1 = doLon(kq.I1);
  const I0 = doLon(kq.I0);
  const I2 = doLon(kq.I2t);
  const U2 = doLon(kq.U2q);
  const phi1 = -goc(kq.I1); // U1 nằm trên trục thực
  const P1 = p.U1 * I1 * Math.cos(phi1);
  const Q1 = p.U1 * I1 * Math.sin(phi1);
  const P2 = beta > 0 ? U2 * I2 * Math.cos(phi2) : 0;
  const Q2 = beta > 0 ? U2 * I2 * Math.sin(phi2) : 0;
  return {
    I1, I0, I2, U2, U20: doLon(kt.U2q), phi1,
    P1, Q1, P2, Q2,
    pCu1: I1 * I1 * p.r1, q1: I1 * I1 * p.x1,
    pFe: I0 * I0 * p.Rth, qth: I0 * I0 * p.Xth,
    pCu2: I2 * I2 * p.r2, q2: I2 * I2 * p.x2,
    dU: doThayDoiDienAp(doLon(kt.U2q), U2),
  };
}

/** Điện áp ra khi đổi đầu phân áp phía CA: số vòng w1 thay đổi nấc (%), U2 = U1·w2/(w1·(1 + nấc/100)). */
export const dienApTheoNac = (U2, nac) => U2 / (1 + nac / 100);
