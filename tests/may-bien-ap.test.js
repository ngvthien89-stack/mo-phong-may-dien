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

import { sddHieuDungMBA, heSoBienAp, dienApThuCap, dongDinhMuc } from '../js/may-bien-ap.js';

test('E = 4,44·f·w·Φm và k = w1/w2 = E1/E2', () => {
  gan(sddHieuDungMBA(50, 1000, 0.0045), 999);
  gan(sddHieuDungMBA(50, 1000, 0.0045) / sddHieuDungMBA(50, 50, 0.0045), heSoBienAp(1000, 50));
  gan(heSoBienAp(1100, 20), 55);
  gan(dienApThuCap(22, 1100, 20), 0.4);
  assert.throws(() => heSoBienAp(0, 10), RangeError);
});

test('dòng điện định mức khớp các bài tập trong slide', () => {
  gan(dongDinhMuc(630e3, 400), 909.3, 0.05); // bài tập 2: 909,3 A
  gan(dongDinhMuc(500e3, 22e3), 13.12, 0.005); // bài tập 4: 13,12 A
  gan(dongDinhMuc(1250e3, 400), 1804.2, 0.05); // bài tập 3: 1804,2 A
  gan(dongDinhMuc(1000e3, 400), 1443.4, 0.05);
  gan(dongDinhMuc(10e3, 220, 1), 45.4545, 1e-3);
  // S = √3·U1·I1 = √3·U2·I2
  gan(Math.sqrt(3) * 22e3 * dongDinhMuc(630e3, 22e3), Math.sqrt(3) * 400 * dongDinhMuc(630e3, 400), 1e-6);
});
