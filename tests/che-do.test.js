import test from 'node:test';
import assert from 'node:assert/strict';
import { tonHaoDong, tongTonHao, betaToiUu, hieuSuat, cheDoLamViec, doThayDoiDienAp, dienApTheoNac } from '../js/che-do.js';
import { thongSoMay } from '../js/thi-nghiem.js';

const gan = (a, b, sai) => assert.ok(Math.abs(a - b) <= sai, `${a} ≠ ${b}`);
const BT2 = { S: 630e3, U1: 22e3, U2: 400, noi1: 'Y', noi2: 'D', P0: 1520, Pn: 6000, i0: 1.3, un: 6 };

test('bài tập 2: pCu = 0,6²·6000 = 2160 W, Σp = 3680 W', () => {
  gan(tonHaoDong(0.6, 6000), 2160, 1e-9);
  gan(tongTonHao(0.6, 1520, 6000), 3680, 1e-9);
});

test('bài tập 2: β tối ưu = √(P0/Pn) = 0,503 (slide 79 ghi 0,294 là sai), I2 = 457,7 A', () => {
  const b = betaToiUu(1520, 6000);
  gan(b, 0.5033, 1e-4);
  gan(b * 909.3, 457.7, 0.1);
  assert.ok(Math.abs(b - 0.294) > 0.2);
  // hiệu suất lớn nhất đúng tại β tối ưu (pFe = pCu)
  const eta = (x) => hieuSuat(x, 630e3, 0.8, 1520, 6000).eta;
  assert.ok(eta(b) > eta(b - 0.05) && eta(b) > eta(b + 0.05));
  gan(tonHaoDong(b, 6000), 1520, 1e-9);
});

test('hiệu suất: η = P2/P1·100, P1 = P2 + Σp', () => {
  const h = hieuSuat(1, 630e3, 0.8, 1520, 6000);
  gan(h.P2, 504000, 1e-6);
  gan(h.P1, 511520, 1e-6);
  gan(h.eta, 98.53, 0.01);
  assert.equal(hieuSuat(0, 630e3, 0.8, 1520, 6000).eta, 0);
});

test('chế độ làm việc: cân bằng công suất P1 = P2 + pCu1 + pFe + pCu2, Q tương tự', () => {
  const t = thongSoMay(BT2);
  const p = { U1: t.U1p, I1dm: t.I1p, r1: t.rn / 2, x1: t.xn / 2, r2: t.rn / 2, x2: t.xn / 2, Rth: t.r0, Xth: t.x0 };
  for (const phi2 of [Math.acos(0.8), 0, -Math.acos(0.6)]) {
    const c = cheDoLamViec(p, 1, phi2);
    gan(c.P1, c.P2 + c.pCu1 + c.pFe + c.pCu2, 1e-6 * c.P1);
    gan(c.Q1, c.Q2 + c.q1 + c.qth + c.q2, 1e-6 * Math.abs(c.P1));
  }
  const cam = cheDoLamViec(p, 1, Math.acos(0.8));
  const dung = cheDoLamViec(p, 1, -Math.acos(0.6));
  assert.ok(cam.dU > 0 && dung.dU < 0); // tải cảm U2 giảm, tải dung U2 có thể tăng (slide 61)
  assert.ok(cam.Q1 > 0 && cam.Q2 > 0);
  assert.ok(dung.Q2 < 0);
  // ba pha: tổn hao đồng tỉ lệ bình phương dòng điện, bằng Pn khi I1 = I1đm
  const pCu = 3 * (cam.pCu1 + cam.pCu2);
  gan(pCu, 6000 * ((cam.I1 ** 2 + cam.I2 ** 2) / 2) / t.I1p ** 2, 1);
});

test('độ thay đổi điện áp và đầu phân áp', () => {
  gan(doThayDoiDienAp(400, 388), 3, 1e-9);
  gan(dienApTheoNac(400, 5), 380.95, 0.01);
  gan(dienApTheoNac(400, -2.5), 410.26, 0.01);
});
