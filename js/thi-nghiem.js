/**
 * thi-nghiem.js — Hàm thuần cho bài 3.4: thí nghiệm không tải, ngắn mạch (slide 54–57) và các bài tập (slide 77–84).
 * Mọi đại lượng tính cho một pha; với dây quấn nối Δ: Up = Ud, Ip = Id/√3; nối Y: Up = Ud/√3, Ip = Id.
 */
const CAN3 = Math.sqrt(3);

/** Điện áp pha và dòng điện pha theo kiểu nối dây ('Y' | 'D'). */
export function dienApPha(Ud, noi) { return noi === 'D' ? Ud : Ud / CAN3; }
export function dongDienPha(Id, noi) { return noi === 'D' ? Id / CAN3 : Id; }

/**
 * Thông số một pha (quy đổi về sơ cấp) dựng từ số liệu cho trên nhãn máy / đề bài:
 * m = {S (VA), U1, U2 (V, điện áp dây), noi1, noi2, P0, Pn (W, ba pha), i0 (%), un (%)}.
 */
export function thongSoMay(m) {
  const I1dm = m.S / (CAN3 * m.U1);
  const U1p = dienApPha(m.U1, m.noi1);
  const U2p = dienApPha(m.U2, m.noi2);
  const I1p = dongDienPha(I1dm, m.noi1);
  const I0p = (m.i0 / 100) * I1p;
  const r0 = m.P0 / (3 * I0p * I0p);
  const z0 = U1p / I0p;
  const x0 = Math.sqrt(z0 * z0 - r0 * r0);
  const Unp = (m.un / 100) * U1p;
  const zn = Unp / I1p;
  const rn = m.Pn / (3 * I1p * I1p);
  const xn = Math.sqrt(zn * zn - rn * rn);
  return { I1dm, U1p, U2p, kp: U1p / U2p, I1p, I0p, r0, z0, x0, Unp, zn, rn, xn };
}

/** Số đo một pha khi thí nghiệm không tải ở điện áp U (mô hình tuyến tính z0 = r0 + jx0). */
export function doKhongTai(p, U) {
  const I0 = U / p.z0;
  return { U1: U, I0, P0: I0 * I0 * p.r0, U20: U / p.kp };
}

/** Số đo một pha khi thí nghiệm ngắn mạch ở điện áp Un. */
export function doNganMach(p, Un) {
  const In = Un / p.zn;
  return { Un, In, Pn: In * In * p.rn, I2: In * p.kp };
}

/** Tính thông số từ số liệu thí nghiệm không tải (slide 54–55). */
export function tinhKhongTai({ U1dm, I0, P0, U20, I1dm }) {
  const r0 = P0 / (I0 * I0);
  const z0 = U1dm / I0;
  return { k: U1dm / U20, i0: (I0 / I1dm) * 100, r0, z0, x0: Math.sqrt(Math.max(0, z0 * z0 - r0 * r0)), cos0: P0 / (U1dm * I0) };
}

/** Tính thông số từ số liệu thí nghiệm ngắn mạch (slide 56–57), In = I1đm. */
export function tinhNganMach({ Un, In, Pn, U1dm }) {
  const zn = Un / In;
  const rn = Pn / (In * In);
  const xn = Math.sqrt(Math.max(0, zn * zn - rn * rn));
  return {
    zn, rn, xn, r1: rn / 2, x1: xn / 2,
    un: ((zn * In) / U1dm) * 100, unr: ((rn * In) / U1dm) * 100, unx: ((xn * In) / U1dm) * 100,
    cosn: Pn / (In * Un),
  };
}
