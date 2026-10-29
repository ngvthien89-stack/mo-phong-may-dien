import test from 'node:test';
import assert from 'node:assert/strict';
import { toNoiDay, kyHieuTo, toMotPha, dienTheDauRa, sddTru } from '../js/to-noi-day.js';
import { doLon, tru } from '../js/so-phuc.js';

test('bốn tổ nối dây trên slide 69: Y/Y-12, Δ/Δ-12, Y/Δ-11, Δ/Y-11', () => {
  assert.equal(kyHieuTo({ so: 'Y', thu: 'Y' }), 'Y/Y-12');
  assert.equal(kyHieuTo({ so: 'D1', thu: 'D1' }), 'Δ/Δ-12');
  assert.equal(kyHieuTo({ so: 'Y', thu: 'D2' }), 'Y/Δ-11');
  assert.equal(kyHieuTo({ so: 'D1', thu: 'Y' }), 'Δ/Y-11');
  assert.equal(toNoiDay({ so: 'Y', thu: 'D2' }).goc, 330);
});

test('đảo cực tính thêm 180° (6 giờ); hoán vị nhãn thêm 120° (4 giờ)', () => {
  assert.equal(toNoiDay({ so: 'Y', thu: 'Y', nguocCuc: true }).so, 6);
  assert.equal(toNoiDay({ so: 'Y', thu: 'D2', nguocCuc: true }).so, 5);
  assert.equal(toNoiDay({ so: 'Y', thu: 'Y', hoanVi: 1 }).so, 4);
  assert.equal(toNoiDay({ so: 'Y', thu: 'Y', hoanVi: 2 }).so, 8);
  assert.equal(toNoiDay({ so: 'Y', thu: 'D1' }).so, 1);
});

test('nối Y/Y luôn cho tổ chẵn, Y/Δ luôn cho tổ lẻ', () => {
  for (const nguocCuc of [false, true]) {
    for (const hoanVi of [0, 1, 2]) {
      assert.equal(toNoiDay({ so: 'Y', thu: 'Y', nguocCuc, hoanVi }).so % 2, 0);
      assert.equal(toNoiDay({ so: 'Y', thu: 'D1', nguocCuc, hoanVi }).so % 2, 1);
      assert.equal(toNoiDay({ so: 'D2', thu: 'Y', nguocCuc, hoanVi }).so % 2, 1);
    }
  }
});

test('điện áp dây Y bằng √3 điện áp pha; tam giác điện thế đều', () => {
  const e = sddTru();
  for (const noi of ['Y', 'D1', 'D2']) {
    const v = dienTheDauRa(noi, e);
    const ab = doLon(tru(v[0], v[1]));
    const bc = doLon(tru(v[1], v[2]));
    assert.ok(Math.abs(ab - bc) < 1e-9);
    assert.ok(Math.abs(ab - (noi === 'Y' ? Math.sqrt(3) : 1)) < 1e-9);
  }
});

test('MBA một pha: I/I-12 và I/I-6', () => {
  assert.equal(toMotPha(false), 12);
  assert.equal(toMotPha(true), 6);
});
