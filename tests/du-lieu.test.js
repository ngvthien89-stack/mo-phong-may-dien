// Kiểm tra cấu trúc các file JSON trong du-lieu/ (giúp phát hiện lỗi khi giảng viên chỉnh sửa).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const doc = (ten) => JSON.parse(fs.readFileSync(new URL(`../du-lieu/${ten}`, import.meta.url), 'utf8'));
const cauHinh = doc('cau-hinh.json');
const boPhan = doc('bo-phan.json');
const cauHoi = doc('cau-hoi.json');
const baiHoc = doc('bai-hoc.json');

test('cau-hinh.json: cấp điện áp đầy đủ và hợp lệ', () => {
  for (const k of ['phat', 'truyenTai', 'caoAp', 'trungAp', 'haAp']) {
    const c = cauHinh.capDienAp[k];
    assert.ok(c, `thiếu capDienAp.${k}`);
    assert.ok(c.kV > 0 && c.hienThi && /^#[0-9a-f]{6}$/i.test(c.mau), `capDienAp.${k} không hợp lệ`);
  }
  assert.ok(cauHinh.capDienAp[cauHinh.truyenTai.capDienAp]);
});

test('cau-hinh.json: đồ thị phụ tải có đủ 24 giờ, giá trị 0…1,5', () => {
  for (const pt of cauHinh.phuTai) {
    assert.equal(pt.doThi.length, 24, pt.id);
    assert.ok(pt.doThi.every((x) => x >= 0 && x <= 1.5), pt.id);
  }
  assert.deepEqual(cauHinh.phuTai.map((p) => p.id).sort(), ['cong-nghiep', 'dan-cu', 'toa-nha']);
});

test('bo-phan.json: đủ 9 bộ phận, trường bắt buộc, mã A–F, chỉ dùng biến điện áp có thật', () => {
  const ids = boPhan.boPhan.map((b) => b.id);
  for (const id of ['nguon-phat', 'mba-tang-ap', 'duong-day-truyen-tai', 'tba-truyen-tai', 'tba-phan-phoi',
    'duong-day-phan-phoi', 'thiet-bi-tu-dong', 'khu-tieu-thu', 'ho-tieu-thu']) assert.ok(ids.includes(id), id);
  assert.deepEqual(boPhan.boPhan.map((b) => b.ma).filter(Boolean).sort(), ['A', 'B', 'C', 'D', 'E', 'F']);
  const chuoi = JSON.stringify(boPhan);
  for (const [, k] of chuoi.matchAll(/\{\{(\w+)\}\}/g)) assert.ok(cauHinh.capDienAp[k], `biến {{${k}}} không có trong cau-hinh.json`);
  for (const b of boPhan.boPhan) {
    for (const t of ['ten', 'tenNgan', 'capDienAp', 'chucNang', 'loiGiang']) assert.ok(b[t], `${b.id}.${t}`);
    assert.ok(Array.isArray(b.thietBiChinh) && b.thietBiChinh.length > 0, `${b.id}.thietBiChinh`);
    assert.ok(Array.isArray(b.ghiChu) && b.ghiChu.length >= 1 && b.ghiChu.length <= 3, `${b.id}.ghiChu`);
  }
});

test('cau-hoi.json: đáp án nằm trong danh sách lựa chọn, đủ số câu', () => {
  assert.ok(cauHoi.cauHoi.length >= cauHoi.soCauMoiLan);
  for (const c of cauHoi.cauHoi) {
    assert.ok(c.cauHoi && c.giaiThich);
    assert.ok(Number.isInteger(c.dapAn) && c.dapAn >= 0 && c.dapAn < c.luaChon.length, c.cauHoi);
  }
});

test('bai-hoc.json: bài sẵn sàng phải có file trang tồn tại', () => {
  for (const ch of baiHoc.chuong) for (const b of ch.baiHoc) {
    assert.ok(['san-sang', 'sap-ra-mat'].includes(b.trangThai));
    if (b.trangThai === 'san-sang') assert.ok(fs.existsSync(new URL(`../${b.duongDan}`, import.meta.url)), b.duongDan);
  }
});
