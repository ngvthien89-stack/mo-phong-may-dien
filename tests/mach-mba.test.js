import test from 'node:test';
import assert from 'node:assert/strict';
import { phuc, cong, nhan, chia, doLon, goc, songSong } from '../js/so-phuc.js';
import { tongTroTai, giaiHinhT, giaiDonGian, tomTat } from '../js/mach-mba.js';

const gan = (a, b, sai) => assert.ok(Math.abs(a - b) <= sai, `${a} ≠ ${b}`);
// Thông số một pha, quy đổi về sơ cấp, lấy từ bài tập 4 (slide 82–84): 500 kVA, 22/0,4 kV, Δ/Y-11
const P = { U1: 22000, r1: 10.45, x1: 57, r2: 10.45, x2: 57, Rth: 12985, Xth: 144153 };
const I1dmp = 7.58;

test('số phức cơ bản', () => {
  assert.deepEqual(nhan(phuc(1, 2), phuc(3, -1)), [5, 5]);
  const q = chia(phuc(5, 5), phuc(3, -1));
  gan(q[0], 1, 1e-12); gan(q[1], 2, 1e-12);
  gan(doLon(phuc(3, 4)), 5, 1e-12);
  gan(goc(phuc(0, 1)), Math.PI / 2, 1e-12);
  const ss = songSong(phuc(2, 0), phuc(2, 0));
  gan(ss[0], 1, 1e-12);
  assert.throws(() => chia(phuc(1, 0), phuc(0, 0)), RangeError);
});

test('không tải: I0 ≈ 0,152 A như bài tập 4, I1 = I0, cosφ0 ≈ 0,09', () => {
  const kq = tomTat(giaiHinhT(P, null));
  gan(kq.I0, 0.152, 0.001);
  gan(kq.I1, kq.I0, 1e-12);
  gan(Math.cos(kq.phi1), 0.09, 0.005);
  gan(kq.E1, 22000, 25); // E1 ≈ U1 khi không tải
});

test('có tải định mức: cân bằng dòng điện I1 = I0 + (−I′2), E′2 = E1', () => {
  const Zt = tongTroTai(P.U1, I1dmp, 1, Math.acos(0.8));
  const kq = giaiHinhT(P, Zt);
  const tong = cong(kq.I0, kq.I2t);
  gan(tong[0], kq.I1[0], 1e-9); gan(tong[1], kq.I1[1], 1e-9);
  assert.deepEqual(kq.E2q, kq.E1);
  const t = tomTat(kq);
  gan(t.I1, I1dmp, 0.25); // xấp xỉ dòng định mức
  assert.ok(t.U2q < P.U1); // tải cảm: điện áp thứ cấp quy đổi giảm
  // phương trình U1 = −E1 + I1·Z1
  const ve = cong(kq.UM, nhan(kq.I1, kq.Z1));
  gan(ve[0], P.U1, 1e-6); gan(ve[1], 0, 1e-6);
});

test('sơ đồ đơn giản sai khác nhỏ so với hình T khi tải định mức', () => {
  const Zt = tongTroTai(P.U1, I1dmp, 1, Math.acos(0.8));
  const a = tomTat(giaiHinhT(P, Zt));
  const b = giaiDonGian(P, Zt);
  gan(doLon(b.U2q), a.U2q, a.U2q * 0.01);
  gan(doLon(b.I), a.I2q, a.I2q * 0.01);
});

test('tải dung có thể làm U′2 lớn hơn U1', () => {
  const Zt = tongTroTai(P.U1, I1dmp, 1, -Math.acos(0.3));
  const t = tomTat(giaiHinhT(P, Zt));
  assert.ok(t.U2q > P.U1);
});
