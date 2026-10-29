import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { giaiBT1, giaiBT2, giaiBT3, giaiBT4 } from '../js/bai-tap.js';

const nd = JSON.parse(readFileSync(new URL('../du-lieu/bai-tap-chuong-1.json', import.meta.url), 'utf8'));
const bt = Object.fromEntries(nd.baiTap.map((b) => [b.id, b]));
const gan = (a, b, sai) => assert.ok(Math.abs(a - b) <= sai, `${a} ≠ ${b}`);
const gt = (ds) => ds.map((b) => b.giaTri);

test('bài tập 1: kp = 64,95 (slide 65,21 do làm tròn 0,23 kV)', () => {
  const [up1, up2, kp] = gt(giaiBT1(bt.bt1.thamSo));
  gan(up1, 15, 1e-12);
  gan(up2, 0.2309, 1e-4);
  gan(kp, 64.95, 0.01);
  gan(15 / 0.23, 65.21, 0.01); // tái hiện con số của slide
});

test('bài tập 2: I2đm = 909,3 A; Σp ≈ 3680 W; β tối ưu 0,503; I2 = 457,7 A', () => {
  const [I2dm, beta, pCu, tong, bMax, I2] = gt(giaiBT2(bt.bt2.thamSo));
  gan(I2dm, 909.3, 0.05);
  gan(beta, 0.605, 0.001);
  gan(pCu, 2195, 2);
  gan(tong, 3715, 2);
  gan(bMax, 0.5033, 1e-4);
  gan(I2, 457.7, 0.2);
});

test('bài tập 3: khớp slide 80–81', () => {
  const [tong, b1, S1, b2, S2, I1dm, I1, I2dm, I2] = gt(giaiBT3(bt.bt3.thamSo));
  gan(tong, 431.8, 0.05);
  gan(b1, 0.741, 0.001);
  gan(S1, 926, 1);
  gan(b2, 0.674, 0.001);
  gan(S2, 674, 1);
  gan(I1dm, 1804.2, 0.1);
  gan(I1, 1336.5, 1);
  gan(I2dm, 1443.4, 0.1);
  gan(I2, 972.4, 1);
});

test('bài tập 4: khớp slide 82–84', () => {
  const v = gt(giaiBT4(bt.bt4.thamSo));
  const [I1dm, I1p, Rn, R1, U1n, zn, Xn, X1, kp, R2, X2, I0p, R0, z0, X0, cos0] = v;
  gan(I1dm, 13.12, 0.005);
  gan(I1p, 7.58, 0.005);
  gan(Rn, 20.9, 0.05);
  gan(R1, 10.45, 0.03);
  gan(U1n, 880, 1e-9);
  gan(zn, 116, 0.2);
  gan(Xn, 114, 0.3);
  gan(X1, 57, 0.15);
  gan(kp, 95.26, 0.01);
  gan(R2, 1.15e-3, 0.01e-3);
  gan(X2, 6.29e-3, 0.02e-3);
  gan(I0p, 0.152, 0.001);
  gan(R0 / 12985, 1, 0.01);
  gan(z0 / 144737, 1, 0.005);
  gan(X0 / 144153, 1, 0.005);
  gan(cos0, 0.09, 0.001);
});

test('mỗi bước đều có tên, công thức, giá trị hữu hạn', () => {
  for (const [ham, id] of [[giaiBT1, 'bt1'], [giaiBT2, 'bt2'], [giaiBT3, 'bt3'], [giaiBT4, 'bt4']]) {
    for (const b of ham(bt[id].thamSo, bt[id].dapAnSlide)) assert.ok(b.ten && b.congThuc && Number.isFinite(b.giaTri), `${id}: ${b.ten}`);
  }
});
