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

test('luc-dien-tu.json và câu hỏi 1.2.b: đủ trường, bước trình chiếu hợp lệ, đáp án hợp lệ', () => {
  const nd = doc('luc-dien-tu.json');
  assert.ok(nd.lyThuyet.phatBieu && nd.lyThuyet.congThuc.length && nd.lyThuyet.quyTac && nd.lyThuyet.kyHieu.length === 3);
  assert.ok(['luc', 'dong-co'].includes(nd.macDinh.kichBan));
  assert.ok(Math.abs(nd.luc.i_A) <= nd.luc.iMax_A && nd.luc.B_T >= nd.luc.BMin_T && nd.luc.B_T <= nd.luc.BMax_T);
  assert.ok(nd.dongCo.R_ohm > 0 && nd.dongCo.m_kg > 0 && nd.dongCo.U_V <= nd.dongCo.UMax_V);
  for (const b of nd.trinhChieu) {
    assert.ok(b.id && b.tieuDe && b.loiGiang, b.id);
    if (b.trangThai?.kichBan) assert.ok(['luc', 'dong-co'].includes(b.trangThai.kichBan), b.id);
    if (b.trangThai?.i !== undefined) assert.ok(Math.abs(b.trangThai.i) <= nd.luc.iMax_A, b.id);
  }
  const ch = doc('cau-hoi-luc-dien-tu.json');
  assert.ok(ch.cauHoi.length >= ch.soCauMoiLan);
  for (const c of ch.cauHoi) assert.ok(Number.isInteger(c.dapAn) && c.dapAn >= 0 && c.dapAn < c.luaChon.length, c.cauHoi);
});

test('toan-dong-dien.json và câu hỏi 1.2.c: đủ trường, C nằm trong mặt phẳng hình, đáp án hợp lệ', () => {
  const nd = doc('toan-dong-dien.json');
  assert.ok(nd.lyThuyet.phatBieu && nd.lyThuyet.congThuc.length === 2 && nd.lyThuyet.chuY && nd.lyThuyet.kyHieu.length === 3);
  assert.ok(['ampere', 'mach-tu'].includes(nd.macDinh.kichBan));
  const mt = nd.machTu;
  assert.ok(mt.w >= mt.wMin && mt.w <= mt.wMax && mt.i_A <= mt.iMax_A && mt.l_m >= mt.lMin_m && mt.l_m <= mt.lMax_m);
  assert.ok(mt.muR >= mt.muRMin && mt.muR <= mt.muRMax && mt.S_cm2 > 0);
  // mặt phẳng hình: |x| ≤ 470, |y| ≤ 360 (đơn vị hình vẽ); hình chữ nhật có nửa cạnh đứng = 0,62·r
  const trongMatPhang = (C) => Math.abs(C.cx) + C.r <= 470 && Math.abs(C.cy) + C.r * (C.hinh === 'chu-nhat' ? 0.62 : 1) <= 360;
  assert.ok(trongMatPhang(nd.ampere.C));
  for (const d of nd.ampere.dayDan) assert.ok(Math.abs(d.I) <= nd.ampere.iMax_A && Math.abs(d.x) < 470 && Math.abs(d.y) < 360);
  for (const b of nd.trinhChieu) {
    assert.ok(b.id && b.tieuDe && b.loiGiang, b.id);
    if (b.trangThai?.kichBan) assert.ok(['ampere', 'mach-tu'].includes(b.trangThai.kichBan), b.id);
    if (b.trangThai?.C) assert.ok(trongMatPhang(b.trangThai.C), b.id);
  }
  const ch = doc('cau-hoi-toan-dong-dien.json');
  assert.ok(ch.cauHoi.length >= ch.soCauMoiLan);
  for (const c of ch.cauHoi) assert.ok(Number.isInteger(c.dapAn) && c.dapAn >= 0 && c.dapAn < c.luaChon.length, c.cauHoi);
});

test('vat-lieu.json và câu hỏi 1.3: nhóm hợp lệ, bộ phận MBA có nguồn slide, bước trình chiếu hợp lệ', () => {
  const nd = doc('vat-lieu.json');
  const nhom = nd.nhom.map((n) => n.id);
  assert.deepEqual(nhom, ['dan-dien', 'dan-tu', 'cach-dien']);
  assert.equal(new Set(nd.vatLieu.map((v) => v.id)).size, nd.vatLieu.length);
  for (const v of nd.vatLieu) assert.ok(v.ten && nhom.includes(v.nhom), v.id);
  assert.equal(nd.lyThuyet.nhomRan.length, 4);
  assert.equal(nd.capCachDien.length, 7);
  const boPhan = nd.mba.boPhan.map((b) => b.id);
  for (const b of nd.mba.boPhan) assert.ok(b.ten && b.nhiemVu && /^Slide \d/.test(b.nguon) && b.nhom.every((n) => nhom.includes(n)), b.id);
  for (const b of nd.trinhChieu) {
    assert.ok(b.id && b.tieuDe && b.loiGiang, b.id);
    assert.ok(['phan-loai', 'mba', 'nhiet-do'].includes(b.trangThai.kichBan), b.id);
    if (b.trangThai.nhom) assert.ok(nhom.includes(b.trangThai.nhom), b.id);
    if (b.trangThai.boPhan) assert.ok(boPhan.includes(b.trangThai.boPhan), b.id);
    if (b.trangThai.t !== undefined) assert.ok(b.trangThai.t >= nd.nhietDo.min && b.trangThai.t <= nd.nhietDo.max, b.id);
  }
  const ch = doc('cau-hoi-vat-lieu.json');
  assert.ok(ch.cauHoi.length >= ch.soCauMoiLan);
  for (const c of ch.cauHoi) assert.ok(Number.isInteger(c.dapAn) && c.dapAn >= 0 && c.dapAn < c.luaChon.length, c.cauHoi);
});

test('khai-niem-mba.json và câu hỏi 2.1–2.3: cấp điện áp theo slide 14, bước trình chiếu hợp lệ, đáp án hợp lệ', () => {
  const nd = doc('khai-niem-mba.json');
  assert.ok(nd.lyThuyet.dinhNghia.includes('giữ nguyên tần số'));
  assert.deepEqual(nd.capDienAp.truyenTai, [35, 110, 220, 500]);
  assert.equal(nd.lyThuyet.chuyenDung.length, 4);
  const dn = nd.dinhNghia;
  assert.ok(dn.dsDienAp_kV.includes(dn.U1_kV) && dn.dsDienAp_kV.includes(dn.U2_kV) && dn.f_Hz >= dn.fMin_Hz && dn.f_Hz <= dn.fMax_Hz);
  const dsU = [nd.capDienAp.uMayPhat_kV, ...nd.capDienAp.truyenTai];
  const muc = nd.lyThuyet.chuyenDung.map((c) => c.id);
  for (const b of nd.trinhChieu) {
    assert.ok(b.id && b.tieuDe && b.loiGiang, b.id);
    assert.ok(['dinh-nghia', 'truyen-tai', 'chuyen-dung'].includes(b.trangThai.kichBan), b.id);
    if (b.trangThai.U !== undefined) assert.ok(dsU.includes(b.trangThai.U), b.id);
    if (b.trangThai.muc) assert.ok(muc.includes(b.trangThai.muc), b.id);
  }
  const ch = doc('cau-hoi-khai-niem-mba.json');
  assert.ok(ch.cauHoi.length >= ch.soCauMoiLan);
  for (const c of ch.cauHoi) assert.ok(Number.isInteger(c.dapAn) && c.dapAn >= 0 && c.dapAn < c.luaChon.length, c.cauHoi);
});

test('cau-tao-mba.json và câu hỏi 2.4: bước trình chiếu hợp lệ, đáp án hợp lệ', () => {
  const nd = doc('cau-tao-mba.json');
  const kieu = nd.kieuDayQuan.map((k) => k.id);
  const boPhan = nd.voMay.boPhan.map((b) => b.id);
  for (const b of nd.trinhChieu) {
    assert.ok(b.id && b.tieuDe && b.loiGiang, b.id);
    const tt = b.trangThai;
    assert.ok(['loi-thep', 'day-quan', 'vo-may'].includes(tt.kichBan), b.id);
    if (tt.buoc !== undefined) assert.ok(tt.buoc >= 0 && tt.buoc < nd.lapRap.length, b.id);
    if (tt.kieu) assert.ok(kieu.includes(tt.kieu), b.id);
    if (tt.sapXep) assert.ok(['dong-tam', 'xen-ke'].includes(tt.sapXep), b.id);
    if (tt.boPhan) assert.ok(boPhan.includes(tt.boPhan), b.id);
    if (tt.mucDau !== undefined) assert.ok(tt.mucDau >= 0 && tt.mucDau <= 1, b.id);
  }
  const ch = doc('cau-hoi-cau-tao-mba.json');
  assert.ok(ch.cauHoi.length >= ch.soCauMoiLan);
  for (const c of ch.cauHoi) assert.ok(Number.isInteger(c.dapAn) && c.dapAn >= 0 && c.dapAn < c.luaChon.length, c.cauHoi);
});

// Các bài dùng khung chung: kiểm tra bước trình chiếu và câu hỏi
const BAI_KHUNG = [
  ['nguyen-ly-mba', ['nguyen-ly', 'he-so-k', 'dinh-muc']],
  ['phuong-trinh-mba', ['dien-ap', 'std', 'quy-doi']],
  ['so-do-thay-the', ['so-do', 'vecto', 'sai-so']],
  ['thi-nghiem-mba', ['khong-tai', 'ngan-mach', 'ket-qua']],
  ['che-do-lam-viec', ['nang-luong', 'dien-ap', 'hieu-suat']],
  ['mba-ba-pha', ['ba-tru', 'to-noi-day', 'mot-pha']],
  ['song-song-mba', ['phan-tai', 'dieu-kien', 'luu-y']],
];
for (const [tep, dsKichBan] of BAI_KHUNG) {
  test(`${tep}.json và câu hỏi: bước trình chiếu dùng kịch bản hợp lệ, đáp án hợp lệ`, () => {
    const nd = doc(`${tep}.json`);
    assert.ok(nd.lyThuyet && nd.macDinh && dsKichBan.includes(nd.macDinh.kichBan));
    assert.ok(nd.trinhChieu.length >= 4);
    for (const b of nd.trinhChieu) {
      assert.ok(b.id && b.tieuDe && b.loiGiang, b.id);
      assert.ok(dsKichBan.includes(b.trangThai.kichBan), b.id);
    }
    const ch = doc(`cau-hoi-${tep}.json`);
    assert.ok(ch.cauHoi.length >= ch.soCauMoiLan);
    for (const c of ch.cauHoi) assert.ok(Number.isInteger(c.dapAn) && c.dapAn >= 0 && c.dapAn < c.luaChon.length, c.cauHoi);
  });
}
