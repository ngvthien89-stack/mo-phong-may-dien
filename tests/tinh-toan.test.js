// Test các hàm tính toán với bộ số liệu tính tay. Chạy: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  dongDienBaPha, tonThatBaPha, hieuSuat, tinhTruyenTai, congSuatDauGui,
  noiSuyDoThi, tinhPhuTai, tonThatPhanPhoi, tinhHeThong, buocTanSo, dinhDangSo,
} from '../js/tinh-toan.js';

const cauHinh = JSON.parse(fs.readFileSync(new URL('../du-lieu/cau-hinh.json', import.meta.url), 'utf8'));
const gan = (thuc, ky, sai = 1e-6, msg) =>
  assert.ok(Math.abs(thuc - ky) <= sai, `${msg || ''} thực tế ${thuc}, kỳ vọng ${ky} ± ${sai}`);

test('I = P/(√3·U·cosφ): P = 50 MW, U = 110 kV, cosφ = 0,9 → I ≈ 291,59 A', () => {
  // Tính tay: √3·110 000·0,9 = 171 473,0 ; 50·10⁶ / 171 473,0 = 291,59 A
  gan(dongDienBaPha(50e6, 110e3, 0.9), 291.59, 0.01);
});

test('I với U = 22 kV và U = 500 kV (cùng P = 50 MW, cosφ = 0,9)', () => {
  gan(dongDienBaPha(50e6, 22e3, 0.9), 1457.96, 0.01);   // 50e6 / 34 294,6
  gan(dongDienBaPha(50e6, 500e3, 0.9), 64.15, 0.01);    // 50e6 / 779 422,9
});

test('I với cosφ = 1: P = 173,2 kW, U = 1 kV → I = 100 A', () => {
  gan(dongDienBaPha(Math.sqrt(3) * 100e3, 1e3, 1), 100, 1e-9);
});

test('ΔP = 3·I²·R: I = 100 A, R = 2 Ω → 60 000 W', () => {
  assert.equal(tonThatBaPha(100, 2), 60000);
});

test('Kịch bản truyền tải P = 50 MW, R = 5 Ω (50 km × 0,1 Ω/km)', () => {
  const chung = { P_MW: 50, cosPhi: 0.9, R_ohm: 5 };
  // 110 kV: ΔP = 3·291,59²·5 = 1,2754 MW → 2,55 %
  const k110 = tinhTruyenTai({ ...chung, U_kV: 110 });
  gan(k110.dP_MW, 1.2754, 0.0005);
  gan(k110.phanTram, 2.551, 0.001);
  gan(k110.hieuSuat, 0.97449, 0.00001);
  // 22 kV: ΔP = 3·1457,96²·5 = 31,885 MW → 63,77 %
  const k22 = tinhTruyenTai({ ...chung, U_kV: 22 });
  gan(k22.dP_MW, 31.885, 0.001);
  gan(k22.phanTram, 63.77, 0.01);
  assert.equal(k22.coTheTruyenTai, true);
  // 500 kV: ΔP = 3·64,15²·5 = 61,73 kW → 0,123 %
  const k500 = tinhTruyenTai({ ...chung, U_kV: 500 });
  gan(k500.dP_MW, 0.06173, 0.00001);
  gan(k500.phanTram, 0.1235, 0.0001);
});

test('Tăng U gấp đôi thì tổn thất giảm 4 lần (ΔP ~ 1/U²)', () => {
  const chung = { P_MW: 80, cosPhi: 0.85, R_ohm: 7 };
  const a = tinhTruyenTai({ ...chung, U_kV: 110 });
  const b = tinhTruyenTai({ ...chung, U_kV: 220 });
  gan(a.dP_MW / b.dP_MW, 4, 1e-9);
});

test('Tổn thất vượt công suất → không thể truyền tải', () => {
  const k = tinhTruyenTai({ P_MW: 200, U_kV: 22, cosPhi: 0.9, R_ohm: 20 });
  assert.equal(k.coTheTruyenTai, false);
  assert.equal(k.hieuSuat, 0);
  assert.equal(k.P_nhan_MW, 0);
});

test('Hiệu suất η = P_ra / P_vào', () => {
  gan(hieuSuat(300, 303.83), 0.98739, 0.00001);
  assert.equal(hieuSuat(10, 0), 0);
});

test('Công suất đầu gửi: P_nhận = 300 MW, U = 500 kV, cosφ = 0,9, R = 8,4 Ω → ≈ 303,83 MW', () => {
  // a = 8,4/(500²·0,81) = 4,14815·10⁻⁵ ; √(1 − 4a·300) = √0,950222 = 0,974793
  // P = (1 − 0,974793)/(2a) = 0,025207/8,2963·10⁻⁵ ≈ 303,83 MW
  const P = congSuatDauGui(300, 500, 0.9, 8.4);
  gan(P, 303.83, 0.01);
  // Kiểm tra lại: P_gửi − ΔP(P_gửi) = P_nhận
  const dP = tinhTruyenTai({ P_MW: P, U_kV: 500, cosPhi: 0.9, R_ohm: 8.4 }).dP_MW;
  gan(P - dP, 300, 1e-9);
  assert.equal(congSuatDauGui(0, 500, 0.9, 8.4), 0);
  assert.ok(Number.isNaN(congSuatDauGui(1000, 22, 0.9, 50)));
});

test('Nội suy đồ thị phụ tải 24 giờ (có vòng qua nửa đêm)', () => {
  const d = Array.from({ length: 24 }, (_, i) => i);   // giá trị = số giờ
  assert.equal(noiSuyDoThi(d, 10), 10);
  assert.equal(noiSuyDoThi(d, 10.5), 10.5);
  assert.equal(noiSuyDoThi(d, 23.5), 11.5);             // (23 + 0)/2
  assert.equal(noiSuyDoThi(d, 24), 0);
});

test('Phụ tải theo giờ, cắt điện một khu vực và cộng thêm công suất', () => {
  const pt = [
    { id: 'x', Pmax_MW: 100, doThi: Array(24).fill(0.5) },
    { id: 'y', Pmax_MW: 40, doThi: Array(24).fill(1) },
  ];
  assert.deepEqual(tinhPhuTai(pt, 7), { x: 50, y: 40 });
  assert.deepEqual(tinhPhuTai(pt, 7, { coDien: { y: false }, Pthem: { x: 60 } }), { x: 110, y: 0 });
});

test('Tổn thất phân phối tỉ lệ P²: tại P định mức bằng đúng % định mức', () => {
  const pp = { congSuatDinhMuc_MW: 300, tonThatDinhMuc_phanTram: 4 };
  gan(tonThatPhanPhoi(300, pp), 12, 1e-9);
  gan(tonThatPhanPhoi(150, pp), 3, 1e-9);
});

test('Cân bằng công suất toàn hệ thống: P_phát = P_tải + ΔP_pp + ΔP_tt', () => {
  const kq = tinhHeThong(cauHinh, { gio: 19 });
  gan(kq.P_phat, kq.P_tai + kq.dP_pp + kq.dP_tt, 1e-9);
  assert.ok(kq.hieuSuatTT > 0.95 && kq.hieuSuatTT < 1);
  assert.ok(kq.hieuSuatTong < kq.hieuSuatTT);
  // Cắt toàn bộ tải → không phát
  const tat = tinhHeThong(cauHinh, { gio: 19, coDien: { 'cong-nghiep': false, 'toa-nha': false, 'dan-cu': false } });
  assert.equal(tat.P_phat, 0);
});

test('Mô hình tần số: tăng tải đột ngột → tần số giảm rồi được khôi phục về 50 Hz', () => {
  const p = cauHinh.kichBanTangTai.tanSo;
  let s = { f: 50, Pm: 250, Pref: 250 };
  let fMin = 50;
  for (let t = 0; t < 120; t += 0.01) {
    s = buocTanSo(s, 310, 0.01, p);
    fMin = Math.min(fMin, s.f);
  }
  assert.ok(fMin < 49.9 && fMin > 49, `tần số thấp nhất ${fMin}`);
  gan(s.f, 50, 0.01);
  gan(s.Pm, 310, 0.5);
});

test('Định dạng số kiểu Việt Nam', () => {
  assert.equal(dinhDangSo(1234.567, 2), '1.234,57');
  assert.equal(dinhDangSo(NaN), '—');
});
