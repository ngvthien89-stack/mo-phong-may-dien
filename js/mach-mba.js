/**
 * mach-mba.js — Giải sơ đồ thay thế của MBA một pha (hoặc một pha của MBA ba pha), đã quy đổi về sơ cấp (slide 49–51).
 *
 * Sơ đồ hình T: U1 → Z1 = r1 + jx1 → nút M; nhánh từ hóa Zth = Rth + jXth; nhánh thứ cấp Z'2 = r'2 + jx'2 nối tải Z't.
 * Quy ước dấu theo slide: U1 = −E1 + I1·Z1;  U'2 = E'2 − I'2·Z'2;  I1 = I0 + (−I'2);  E'2 = E1;  −E1 = I0·Zth.
 * Trong mã dùng I2t = −I'2 (dòng điện thứ cấp quy đổi chảy vào tải theo chiều từ nút M), nên I1 = I0 + I2t.
 */
import { phuc, cong, tru, nhan, chia, doLon, goc, doiDau, cucSang, songSong } from './so-phuc.js';

/** Tổng trở tải quy đổi theo hệ số tải beta và cosφ2 (phi2 > 0: tải cảm, < 0: tải dung). */
export function tongTroTai(U1, I1dm, beta, phi2) {
  if (!(beta > 0)) return null;
  const z = U1 / (beta * I1dm);
  return cucSang(z, phi2);
}

/**
 * Giải sơ đồ thay thế hình T.
 * @param {{U1: number, r1: number, x1: number, r2: number, x2: number, Rth: number, Xth: number}} p thông số (đã quy đổi)
 * @param {number[]|null} Zt tổng trở tải quy đổi (null = không tải)
 */
export function giaiHinhT(p, Zt) {
  const U1 = phuc(p.U1, 0);
  const Z1 = phuc(p.r1, p.x1);
  const Z2 = phuc(p.r2, p.x2);
  const Zth = phuc(p.Rth, p.Xth);
  const Znhanh = Zt ? songSong(Zth, cong(Z2, Zt)) : Zth;
  const I1 = chia(U1, cong(Z1, Znhanh));
  const UM = tru(U1, nhan(I1, Z1)); // điện áp trên nhánh từ hóa = −E1
  const I0 = chia(UM, Zth);
  const I2t = Zt ? chia(UM, cong(Z2, Zt)) : phuc(0, 0); // = −I'2
  const U2q = Zt ? nhan(I2t, Zt) : UM; // điện áp trên tải (quy đổi), về độ lớn là U'2
  return { U1, Z1, Z2, Zth, I1, I0, I2t, I2q: doiDau(I2t), E1: doiDau(UM), E2q: doiDau(UM), U2q, UM };
}

/** Giải sơ đồ thay thế đơn giản (bỏ nhánh từ hóa): Zn = Z1 + Z'2 nối tiếp tải (slide 51). */
export function giaiDonGian(p, Zt) {
  const U1 = phuc(p.U1, 0);
  const Zn = phuc(p.r1 + p.r2, p.x1 + p.x2);
  const I = chia(U1, cong(Zn, Zt));
  return { I, U2q: nhan(I, Zt), Zn };
}

/** Thông số thường dùng của một nghiệm. */
export function tomTat(kq) {
  return {
    I1: doLon(kq.I1), I0: doLon(kq.I0), I2q: doLon(kq.I2t), E1: doLon(kq.E1), U2q: doLon(kq.U2q),
    phi1: goc(kq.U1) - goc(kq.I1),
  };
}
