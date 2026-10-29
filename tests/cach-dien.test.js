import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dungDuoc, danhGiaCap, capThapNhat, xepDung, demTheoNhom, xaoTron } from '../js/cach-dien.js';

const nd = JSON.parse(readFileSync(new URL('../du-lieu/vat-lieu.json', import.meta.url), 'utf8'));
const bang = nd.capCachDien;

test('bảng 7 cấp cách điện đúng slide 11: Y 90, A 105, E 120, B 130, F 155, H 180, C > 180', () => {
  assert.deepEqual(bang.map((c) => c.cap), ['Y', 'A', 'E', 'B', 'F', 'H', 'C']);
  assert.deepEqual(bang.map((c) => c.t), [90, 105, 120, 130, 155, 180, 180]);
  assert.ok(bang[6].lonHon && !bang.slice(0, 6).some((c) => c.lonHon));
});

test('cấp thấp nhất dùng được theo nhiệt độ làm việc', () => {
  const ma = (t) => capThapNhat(bang, t).cap;
  assert.equal(ma(20), 'Y');
  assert.equal(ma(90), 'Y');
  assert.equal(ma(91), 'A');
  assert.equal(ma(125), 'B');
  assert.equal(ma(140), 'F');
  assert.equal(ma(180), 'H');
  assert.equal(ma(181), 'C');
});

test('đánh giá từng cấp: cấp có nhiệt độ cho phép thấp hơn t thì không dùng được', () => {
  const kq = danhGiaCap(bang, 130);
  assert.deepEqual(kq.map((c) => c.ok), [false, false, false, true, true, true, true]);
  assert.equal(dungDuoc(bang[6], 220), true);
  assert.equal(dungDuoc(bang[5], 180.5), false);
});

test('phân loại vật liệu: đủ 15 thẻ, 2 dẫn điện, 4 dẫn từ, 9 cách điện', () => {
  assert.deepEqual(demTheoNhom(nd.vatLieu), { 'dan-dien': 2, 'dan-tu': 4, 'cach-dien': 9 });
  const mica = nd.vatLieu.find((v) => v.id === 'mica');
  assert.ok(xepDung(mica, 'cach-dien') && !xepDung(mica, 'dan-tu'));
});

test('xáo trộn có hạt giống: là hoán vị, lặp lại được', () => {
  const ds = [...Array(15).keys()];
  const a = xaoTron(ds, 7);
  assert.deepEqual([...a].sort((x, y) => x - y), ds);
  assert.deepEqual(a, xaoTron(ds, 7));
  assert.notDeepEqual(a, ds);
});
