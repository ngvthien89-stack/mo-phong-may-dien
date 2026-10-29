import test from 'node:test';
import assert from 'node:assert/strict';
import { soSanhTruyenTai, soLanGiam, dienApChuanHoa, chuKy, loaiMBA, doLechKim } from '../js/may-bien-ap.js';

const gan = (a, b, sai = 1e-9) => assert.ok(Math.abs(a - b) <= sai, `${a} ≠ ${b}`);

test('cùng S: tăng U gấp đôi thì I, ΔU giảm 2 lần, ΔP giảm 4 lần', () => {
  const kq = soSanhTruyenTai(220, 110);
  gan(kq.I, 0.5);
  gan(kq.dU, 0.5);
  gan(kq.dP, 0.25);
  gan(soLanGiam(kq.dP), 4);
});

test('so với truyền ở 21 kV: 500 kV giảm I khoảng 23,8 lần, ΔP khoảng 567 lần', () => {
  const kq = soSanhTruyenTai(500, 21);
  gan(soLanGiam(kq.I), 500 / 21);
  gan(soLanGiam(kq.dP), (500 / 21) ** 2);
  gan(soLanGiam(kq.dP), 566.893, 1e-3);
  assert.deepEqual(soSanhTruyenTai(21, 21), { I: 1, dU: 1, dP: 1 });
  assert.throws(() => soSanhTruyenTai(0, 21), RangeError);
});

test('u1 và u2 cùng tần số: cùng chu kỳ, cùng điểm qua 0', () => {
  gan(chuKy(50), 0.02);
  gan(dienApChuanHoa(50, 0.005), 1);
  gan(dienApChuanHoa(50, 0.01), 0, 1e-12);
  gan(dienApChuanHoa(50, 0.0123), dienApChuanHoa(50, 0.0123 + chuKy(50)), 1e-12);
});

test('loại MBA và độ lệch kim', () => {
  assert.equal(loaiMBA(21, 220), 'tang-ap');
  assert.equal(loaiMBA(110, 0.4), 'ha-ap');
  assert.equal(loaiMBA(35, 35), 'bang');
  gan(doLechKim(60), 0.6);
  gan(doLechKim(150), 1.2);
  gan(doLechKim(-5), 0);
});
