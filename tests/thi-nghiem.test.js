import test from 'node:test';
import assert from 'node:assert/strict';
import { thongSoMay, doKhongTai, doNganMach, tinhKhongTai, tinhNganMach, dienApPha, dongDienPha } from '../js/thi-nghiem.js';

const gan = (a, b, sai) => assert.ok(Math.abs(a - b) <= sai, `${a} ≠ ${b}`);
// Bài tập 4 (slide 82–84): S = 500 kVA, 22/0,4 kV, Δ/Y-11, P0 = 900 W, Pn = 3600 W, i0% = 2 %, un% = 4 %
const BT4 = { S: 500e3, U1: 22e3, U2: 400, noi1: 'D', noi2: 'Y', P0: 900, Pn: 3600, i0: 2, un: 4 };

test('đại lượng pha theo kiểu nối dây', () => {
  gan(dienApPha(400, 'Y'), 230.94, 0.01);
  assert.equal(dienApPha(22e3, 'D'), 22e3);
  gan(dongDienPha(13.12, 'D'), 7.575, 0.001);
});

test('thông số một pha dựng từ đề bài tập 4 khớp lời giải slide 82–84', () => {
  const p = thongSoMay(BT4);
  gan(p.I1dm, 13.12, 0.005);
  gan(p.I1p, 7.58, 0.005);
  gan(p.kp, 95.26, 0.01); // slide ghi 95,2
  gan(p.rn, 20.9, 0.05);
  gan(p.zn, 116, 0.2);
  gan(p.xn, 114, 0.3);
  gan(p.I0p, 0.152, 0.0005);
  gan(p.r0, 13060, 60); // slide dùng I0p làm tròn 0,152 A nên ra 12 985 Ω
  gan(p.z0, 145200, 500);
});

test('thí nghiệm không tải ở U1đm tái tạo đúng số liệu đề, tính lại r0, z0, x0, cosφ0', () => {
  const p = thongSoMay(BT4);
  const d = doKhongTai(p, p.U1p);
  gan(d.I0, p.I0p, 1e-9);
  gan(3 * d.P0, 900, 1e-6);
  const kq = tinhKhongTai({ U1dm: p.U1p, I0: d.I0, P0: d.P0, U20: d.U20, I1dm: p.I1p });
  gan(kq.i0, 2, 1e-9);
  gan(kq.k, p.kp, 1e-9);
  gan(kq.cos0, 0.09, 0.001);
  // dùng đúng các số đã làm tròn của slide 84: I0p = 0,152 A
  const sl = tinhKhongTai({ U1dm: 22000, I0: 0.152, P0: 300, U20: 231, I1dm: 7.58 });
  gan(sl.r0, 12985, 1);
  gan(sl.z0, 144737, 1);
  gan(sl.x0, 144153, 1);
});

test('thí nghiệm ngắn mạch ở In = I1đm cho Un = 880 V, Pn = 1200 W/pha như slide 83', () => {
  const p = thongSoMay(BT4);
  const d = doNganMach(p, p.Unp);
  gan(d.In, p.I1p, 1e-9);
  gan(p.Unp, 880, 1e-9);
  gan(3 * d.Pn, 3600, 1e-6);
  const kq = tinhNganMach({ Un: d.Un, In: d.In, Pn: d.Pn, U1dm: p.U1p });
  gan(kq.un, 4, 1e-9);
  gan(kq.r1, 10.45, 0.03);
  gan(kq.x1, 57, 0.15);
  gan(kq.unr * kq.unr + kq.unx * kq.unx, kq.un * kq.un, 1e-9);
  gan(kq.cosn, kq.rn / kq.zn, 1e-12);
});
