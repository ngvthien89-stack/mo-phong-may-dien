// Test hàm tính toán bài 1.2.c (định luật toàn dòng điện) với số liệu tính tay. Chạy: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MU0, truongDayDan, tichPhanVong, duongTron, hinhChuNhat, tongDongDienBaoQuanh,
  sucTuDong, cuongDoTuTruong, tuCam, dongDienTuHoa,
} from '../js/mach-tu.js';

const gan = (thuc, ky, sai, msg = '') => assert.ok(Math.abs(thuc - ky) <= sai, `${msg} thực tế ${thuc}, kỳ vọng ${ky} ± ${sai}`);

test('Dây dẫn thẳng: I = 10 A, r = 0,1 m → H = I/(2πr) = 15,92 A/m, vuông góc bán kính', () => {
  // 10/(2π·0,1) = 15,915 A/m
  const [Hx, Hy] = truongDayDan(10, 0, 0, 0.1, 0);
  gan(Math.hypot(Hx, Hy), 15.915, 0.001);
  gan(Hx, 0, 1e-12);
  assert.ok(Hy > 0, 'dòng ⊙: tại điểm bên phải dây, H hướng lên (ngược chiều kim đồng hồ)');
});

test('∮H·dl quanh một dây: đường tròn bất kỳ bao dây 5 A → 5 A; dây nằm ngoài → 0', () => {
  const day = [{ x: 0.2, y: -0.1, I: 5 }];
  gan(tichPhanVong(day, duongTron(0, 0, 1)), 5, 1e-4); // tích phân số 2000 đoạn
  gan(tichPhanVong(day, duongTron(0.3, 0, 0.35)), 5, 1e-4); // đường tròn lệch tâm vẫn bao dây
  gan(tichPhanVong(day, duongTron(3, 3, 1)), 0, 1e-6);
});

test('∮H·dl = Σi (tổng đại số): 5 A ⊙ + 3 A ⊗ trong C, 4 A ngoài C → 2 A', () => {
  const day = [{ x: -0.3, y: 0, I: 5 }, { x: 0.3, y: 0.2, I: -3 }, { x: 2, y: 0, I: 4 }];
  const C = duongTron(0, 0, 1);
  const trong = (x, y) => x * x + y * y < 1;
  gan(tongDongDienBaoQuanh(day, trong), 2, 1e-12);
  gan(tichPhanVong(day, C), 2, 1e-4);
});

test('Hình dạng C không ảnh hưởng: hình chữ nhật bao 7 A cho ∮H·dl = 7 A', () => {
  const day = [{ x: 0.1, y: 0.05, I: 7 }, { x: 1.5, y: 0, I: -9 }];
  gan(tichPhanVong(day, hinhChuNhat(0, 0, 0.6, 0.3), 4000), 7, 1e-3);
});

test('Mạch từ Hình 1.4: w = 200 vòng, i = 2 A, l = 0,5 m → F = 400 A·vòng, H = 800 A/m', () => {
  gan(sucTuDong(200, 2), 400, 1e-12);
  gan(cuongDoTuTruong(200, 2, 0.5), 800, 1e-12);
  // ngược lại: cần H = 800 A/m trên l = 0,5 m với 200 vòng → i = 2 A
  gan(dongDienTuHoa(800, 0.5, 200), 2, 1e-12);
  assert.throws(() => cuongDoTuTruong(200, 2, 0));
});

test('Mở rộng: B = μ0·μr·H; μ0 = 4π·10⁻⁷ H/m; H = 800 A/m, μr = 1000 → B ≈ 1,005 T', () => {
  gan(MU0, 1.2566e-6, 1e-9);
  gan(tuCam(800, 1000), 1.00531, 1e-5); // 4π·10⁻⁷·1000·800 = 1,0053 T
});
