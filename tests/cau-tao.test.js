import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { thuTuBanhXenKe, mucDauBinhGian, gioiHanBuoc } from '../js/cau-tao.js';

test('dây quấn xen kẽ: hai nửa bánh HA sát gông, CA và HA xen kẽ', () => {
  const ds = thuTuBanhXenKe(2);
  assert.deepEqual(ds.map((b) => b.loai), ['HA', 'CA', 'HA', 'CA', 'HA']);
  assert.ok(ds[0].nua && ds[ds.length - 1].nua);
  assert.ok(ds.slice(1, -1).every((b) => !b.nua));
  for (let k = 1; k < ds.length; k++) assert.notEqual(ds[k].loai, ds[k - 1].loai);
  // tổng số bánh HA (quy đổi) bằng số bánh CA
  const soHA = ds.filter((b) => b.loai === 'HA').reduce((s, b) => s + (b.nua ? 0.5 : 1), 0);
  assert.equal(soHA, 2);
  assert.deepEqual(thuTuBanhXenKe(1).map((b) => b.loai), ['HA', 'CA', 'HA']);
  assert.throws(() => thuTuBanhXenKe(0), RangeError);
});

test('bình giãn dầu: dầu nóng thì mức dầu dâng, giới hạn trong min…max', () => {
  const g = { min: 0.2, max: 0.85 };
  assert.equal(mucDauBinhGian(0, g), 0.2);
  assert.ok(Math.abs(mucDauBinhGian(1, g) - 0.85) < 1e-12);
  assert.ok(mucDauBinhGian(0.7, g) > mucDauBinhGian(0.3, g));
  assert.equal(mucDauBinhGian(2, g), mucDauBinhGian(1, g));
  assert.equal(mucDauBinhGian(-1, g), 0.2);
});

test('giới hạn bước lắp ráp', () => {
  assert.equal(gioiHanBuoc(-3, 5), 0);
  assert.equal(gioiHanBuoc(7, 5), 4);
  assert.equal(gioiHanBuoc(2.4, 5), 2);
});

test('dữ liệu cấu tạo: 5 bước lắp ráp, 4 kiểu dây quấn a–d, 9 bộ phận vỏ', () => {
  const nd = JSON.parse(readFileSync(new URL('../du-lieu/cau-tao-mba.json', import.meta.url), 'utf8'));
  assert.equal(nd.lapRap.length, 5);
  assert.deepEqual(nd.kieuDayQuan.map((k) => k.id), ['a', 'b', 'c', 'd']);
  assert.equal(nd.voMay.boPhan.length, 9);
  assert.equal(nd.lyThuyet.yeuCauVo.length, 4);
});
