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

test('cam-ung-dien-tu.json: lý thuyết đủ công thức, bước trình chiếu dùng kịch bản hợp lệ', () => {
  const nd = doc('cam-ung-dien-tu.json');
  assert.ok(nd.lyThuyet.phatBieu && nd.lyThuyet.congThuc.length >= 3);
  for (const c of nd.lyThuyet.congThuc) assert.ok(c.tex && c.duPhong, c.chu);
  const kichBan = ['nam-cham', 'hinh-thang', 'hinh-sin', 'thanh-dan'];
  assert.ok(kichBan.includes(nd.macDinh.kichBan));
  assert.ok(nd.macDinh.w >= nd.macDinh.wMin && nd.macDinh.w <= nd.macDinh.wMax);
  const ids = new Set();
  for (const b of nd.trinhChieu) {
    assert.ok(b.id && b.tieuDe && b.loiGiang, b.id);
    assert.ok(!ids.has(b.id), `trùng id ${b.id}`);
    ids.add(b.id);
    if (b.trangThai?.kichBan) assert.ok(kichBan.includes(b.trangThai.kichBan), b.id);
    if (b.trangThai?.w) assert.ok(b.trangThai.w >= nd.macDinh.wMin && b.trangThai.w <= nd.macDinh.wMax, b.id);
  }
  const ht = nd.hinhThang;
  assert.ok(ht.Phim_Wb >= ht.PhimMin_Wb && ht.Phim_Wb <= ht.PhimMax_Wb);
  const td = nd.thanhDan;
  assert.ok(td.lyThuyet.phatBieu && td.lyThuyet.congThuc.length && td.lyThuyet.quyTac);
  assert.ok(td.B_T >= td.BMin_T && td.B_T <= td.BMax_T && td.l_m >= td.lMin_m && td.l_m <= td.lMax_m);
  assert.ok(Math.abs(td.v_ms) <= td.vMax_ms);
  const hs = nd.hinhSin;
  assert.ok(hs.f_Hz >= hs.fMin_Hz && hs.f_Hz <= hs.fMax_Hz && hs.heSoCham > 0);
});

test('cau-hoi-cam-ung-dien-tu.json: đáp án nằm trong danh sách lựa chọn, đủ số câu', () => {
  const ch = doc('cau-hoi-cam-ung-dien-tu.json');
  assert.ok(ch.cauHoi.length >= ch.soCauMoiLan);
  for (const c of ch.cauHoi) {
    assert.ok(c.cauHoi && c.giaiThich);
    assert.ok(Number.isInteger(c.dapAn) && c.dapAn >= 0 && c.dapAn < c.luaChon.length, c.cauHoi);
  }
});
