// Test hàm tính toán bài 1.2.a (định luật cảm ứng điện từ) với số liệu tính tay. Chạy: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  tuThongMocVong, sddCamUng, daoHamSo, tuThongHinhSin, sddHinhSin, bienDoSdd, sddHieuDung,
  tuThongHinhThang, tuThongNamCham, BoDaoHam,
} from '../js/dien-tu.js';

const gan = (thuc, ky, sai, msg = '') => assert.ok(Math.abs(thuc - ky) <= sai, `${msg} thực tế ${thuc}, kỳ vọng ${ky} ± ${sai}`);

test('Một vòng dây: φ tăng đều 0,02 Wb trong 0,1 s → e = −0,2 V', () => {
  // dφ/dt = 0,02/0,1 = 0,2 Wb/s ; e = −1·0,2 = −0,2 V
  gan(sddCamUng(1, 0.02 / 0.1), -0.2, 1e-12);
});

test('Cuộn 50 vòng: cùng dφ/dt = 0,2 Wb/s → e = −10 V; φ giảm thì e đổi dấu', () => {
  gan(sddCamUng(50, 0.2), -10, 1e-12);
  gan(sddCamUng(50, -0.2), 10, 1e-12);
  assert.equal(Object.is(sddCamUng(50, 0), 0), true); // không trả về −0
});

test('Từ thông móc vòng ψ = w·φ: w = 200, φ = 1,5 mWb → ψ = 0,3 Wb; e = −dψ/dt = −w·dφ/dt', () => {
  gan(tuThongMocVong(200, 1.5e-3), 0.3, 1e-12);
  // φ(t) = 3t (mWb) → ψ(t) = 200·3e-3·t → dψ/dt = 0,6 Wb/s
  const psi = (t) => tuThongMocVong(200, 3e-3 * t);
  gan(-daoHamSo(psi, 0.5), sddCamUng(200, 3e-3), 1e-6);
});

test('Từ thông hình sin: Φm = 0,01 Wb, f = 50 Hz, w = 100 → Em = 314,16 V, E = 222,1 V ≈ 4,44·f·w·Φm', () => {
  // Em = 2π·50·100·0,01 = 100π = 314,159 V ; E = Em/√2 = 222,144 V ; 4,44·50·100·0,01 = 222 V
  gan(bienDoSdd(100, 0.01, 50), 314.159, 0.001);
  gan(sddHieuDung(100, 0.01, 50), 222.144, 0.001);
  gan(sddHieuDung(100, 0.01, 50), 4.44 * 50 * 100 * 0.01, 0.2);
});

test('Hình sin: e = −w·dφ/dt tại mọi thời điểm; e chậm pha 90° so với φ', () => {
  const [w, Phim, f] = [100, 0.01, 50];
  for (const t of [0, 0.0013, 0.005, 0.0117]) {
    const dphi = daoHamSo((x) => tuThongHinhSin(Phim, f, x), t, 1e-7);
    gan(sddHinhSin(w, Phim, f, t), sddCamUng(w, dphi), 1e-3, `t = ${t}`);
  }
  // t = 0: φ = 0, e = −Em (cực tiểu) ; t = T/4 = 5 ms: φ = Φm (cực đại), e = 0
  gan(sddHinhSin(w, Phim, f, 0), -314.159, 0.001);
  gan(tuThongHinhSin(Phim, f, 0.005), 0.01, 1e-12);
  gan(sddHinhSin(w, Phim, f, 0.005), 0, 1e-9);
});

test('Hình thang: tăng 0,02 Wb trong 2 s → dφ/dt = 0,01; giữ → 0; giảm trong 1 s → −0,02', () => {
  const p = { Phim: 0.02, tTang: 2, tGiu: 3, tGiam: 1, tNghi: 2 };
  let k = tuThongHinhThang(1, p);
  gan(k.phi, 0.01, 1e-12); gan(k.dPhiDt, 0.01, 1e-12); assert.equal(k.giaiDoan, 'tang');
  k = tuThongHinhThang(4, p);
  gan(k.phi, 0.02, 1e-12); assert.equal(k.dPhiDt, 0); assert.equal(k.giaiDoan, 'giu');
  k = tuThongHinhThang(5.5, p);
  gan(k.phi, 0.01, 1e-12); gan(k.dPhiDt, -0.02, 1e-12); assert.equal(k.giaiDoan, 'giam');
  k = tuThongHinhThang(7, p);
  assert.equal(k.phi, 0); assert.equal(k.giaiDoan, 'nghi');
  // tuần hoàn với chu kỳ T = 8 s ; cuộn 100 vòng ở pha tăng: e = −100·0,01 = −1 V
  gan(tuThongHinhThang(9, p).phi, 0.01, 1e-12);
  gan(sddCamUng(100, tuThongHinhThang(9, p).dPhiDt), -1, 1e-12);
});

test('Nam châm: φ lớn nhất khi sát cuộn dây, tại d = d0 còn 1/(2√2) ≈ 0,354, đảo cực thì đổi dấu', () => {
  const p = { Phimax: 0.004, d0: 80 };
  gan(tuThongNamCham(0, p), 0.004, 1e-15);
  gan(tuThongNamCham(80, p), 0.004 / (2 * Math.SQRT2), 1e-12);
  gan(tuThongNamCham(80, p, -1), -0.004 / (2 * Math.SQRT2), 1e-12);
  assert.ok(tuThongNamCham(300, p) < tuThongNamCham(100, p));
});

test('Bộ đạo hàm: tín hiệu tăng đều 0,5 Wb/s → hội tụ về 0,5; tín hiệu đứng yên → về 0', () => {
  const bo = new BoDaoHam(0.05);
  let x = 0;
  for (let i = 0; i < 200; i++) { x += 0.5 * 0.01; bo.capNhat(x, 0.01); }
  gan(bo.giaTri, 0.5, 1e-6);
  for (let i = 0; i < 300; i++) bo.capNhat(x, 0.01);
  gan(bo.giaTri, 0, 1e-9);
});
