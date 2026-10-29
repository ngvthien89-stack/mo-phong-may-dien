import test from 'node:test';
import assert from 'node:assert/strict';
import { phanBoTai, taiToiDa, kiemTraDieuKien } from '../js/song-song.js';
import { dongDinhMuc } from '../js/may-bien-ap.js';

const gan = (a, b, sai) => assert.ok(Math.abs(a - b) <= sai, `${a} ≠ ${b}`);
const BT3 = [
  { Sdm: 1250, un: 5, U1: 22, U2: 0.4, to: 'Y/Y-6' },
  { Sdm: 1000, un: 5.5, U1: 22, U2: 0.4, to: 'Y/Y-6' },
];

test('bài tập 3 (slide 80–81): β1 = 0,74, β2 = 0,674, S1 ≈ 925 kVA, S2 ≈ 674 kVA', () => {
  const [m1, m2] = phanBoTai(1600, BT3);
  gan(m1.beta, 0.741, 0.001);
  gan(m2.beta, 0.674, 0.001);
  gan(m1.S, 926, 1);
  gan(m2.S, 674, 1);
  gan(m1.S + m2.S, 1600, 1e-9);
  gan(m1.beta / m2.beta, 5.5 / 5, 1e-12); // tỉ lệ nghịch với un
});

test('bài tập 3: dòng điện mỗi máy I1 ≈ 1335 A, I2 ≈ 972,8 A', () => {
  const [m1, m2] = phanBoTai(1600, BT3);
  gan(dongDinhMuc(1250e3, 400), 1804.2, 0.05);
  gan(m1.beta * dongDinhMuc(1250e3, 400), 1336, 1.5); // slide làm tròn β1 = 0,74 → 1335,1 A
  gan(m2.beta * dongDinhMuc(1000e3, 400), 972.8, 0.8);
});

test('tải tối đa khi máy có un nhỏ nhất đạt định mức', () => {
  const Smax = taiToiDa(BT3);
  const [m1] = phanBoTai(Smax, BT3);
  gan(m1.beta, 1, 1e-12);
  assert.ok(Smax < 2250);
});

test('điều kiện làm việc song song', () => {
  assert.deepEqual(kiemTraDieuKien(BT3, 0.5), { cungTo: true, cungDienAp: true, cungUn: true, dat: true });
  assert.equal(kiemTraDieuKien(BT3, 0).cungUn, false);
  assert.equal(kiemTraDieuKien([BT3[0], { ...BT3[1], to: 'Y/Δ-11' }], 1).cungTo, false);
});
