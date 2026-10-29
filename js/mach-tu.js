/**
 * mach-tu.js — Hàm tính toán cho bài 1.2.c "Định luật toàn dòng điện" và mạch từ.
 * Không phụ thuộc DOM; dùng chung cho trình duyệt và test Node. Đơn vị SI.
 */

export const MU0 = 4 * Math.PI * 1e-7; // độ từ thẩm của chân không (H/m)

/**
 * Cường độ từ trường do một dây dẫn thẳng dài vô hạn (vuông góc mặt phẳng hình) gây ra tại điểm (x, y):
 * |H| = I/(2πr), hướng theo quy tắc vặn nút chai. I > 0: dòng điện đi ra khỏi mặt phẳng (⊙) → H ngược chiều kim đồng hồ.
 * @returns {[number, number]} [Hx, Hy] (A/m nếu tọa độ tính bằng m)
 */
export function truongDayDan(I, x0, y0, x, y, rMin = 1e-9) {
  const dx = x - x0;
  const dy = y - y0;
  const r2 = Math.max(dx * dx + dy * dy, rMin * rMin);
  const k = I / (2 * Math.PI * r2);
  return [-k * dy, k * dx];
}

/** Từ trường tổng của nhiều dây dẫn {x, y, I} (nguyên lý xếp chồng). */
export function truongTong(dayDan, x, y, rMin) {
  let Hx = 0;
  let Hy = 0;
  for (const d of dayDan) {
    const [hx, hy] = truongDayDan(d.I, d.x, d.y, x, y, rMin);
    Hx += hx;
    Hy += hy;
  }
  return [Hx, Hy];
}

/**
 * Tích phân vòng ∮H·dl dọc đường cong kín C cho bởi hàm tham số diem(t), t ∈ [0, 1).
 * Chiều đi của C là chiều tăng của t. Dùng quy tắc trung điểm với n đoạn.
 */
export function tichPhanVong(dayDan, diem, n = 2000) {
  let tong = 0;
  let truoc = diem(0);
  for (let k = 1; k <= n; k++) {
    const sau = diem(k / n);
    const xm = (truoc[0] + sau[0]) / 2;
    const ym = (truoc[1] + sau[1]) / 2;
    const [Hx, Hy] = truongTong(dayDan, xm, ym);
    tong += Hx * (sau[0] - truoc[0]) + Hy * (sau[1] - truoc[1]);
    truoc = sau;
  }
  return tong;
}

/** Đường tròn tâm (cx, cy) bán kính r, đi ngược chiều kim đồng hồ trong hệ trục toán học (y hướng lên). */
export const duongTron = (cx, cy, r) => (t) => [cx + r * Math.cos(2 * Math.PI * t), cy + r * Math.sin(2 * Math.PI * t)];

/** Hình chữ nhật tâm (cx, cy), nửa cạnh a, b, đi ngược chiều kim đồng hồ (y hướng lên). */
export function hinhChuNhat(cx, cy, a, b) {
  const goc = [[cx + a, cy - b], [cx + a, cy + b], [cx - a, cy + b], [cx - a, cy - b]];
  const dai = [2 * b, 2 * a, 2 * b, 2 * a];
  const chuVi = 4 * (a + b);
  return (t) => {
    let s = (((t % 1) + 1) % 1) * chuVi;
    for (let i = 0; i < 4; i++) {
      if (s <= dai[i] || i === 3) {
        const [x0, y0] = goc[i];
        const [x1, y1] = goc[(i + 1) % 4];
        const u = Math.min(1, s / dai[i]);
        return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u];
      }
      s -= dai[i];
    }
    return goc[0];
  };
}

/** Tổng đại số các dòng điện nằm trong C (dương khi ⊙, tức phù hợp với chiều đi ngược kim đồng hồ của C). */
export function tongDongDienBaoQuanh(dayDan, laBenTrong) {
  return dayDan.reduce((s, d) => (laBenTrong(d.x, d.y) ? s + d.I : s), 0);
}

/** Sức từ động F = w·i (A·vòng). */
export function sucTuDong(w, i) {
  return w * i;
}

/** Cường độ từ trường trong mạch từ theo định luật toàn dòng điện: H·l = w·i ⇒ H = w·i/l (A/m). */
export function cuongDoTuTruong(w, i, l) {
  if (!(l > 0)) throw new RangeError('Chiều dài mạch từ phải dương');
  return (w * i) / l;
}

/** Từ cảm trong vật liệu tuyến tính: B = μ0·μr·H (T). */
export function tuCam(H, muR) {
  return MU0 * muR * H;
}

/** Dòng điện từ hóa cần thiết để tạo cường độ từ trường H trong mạch từ dài l với w vòng: i = H·l/w (A). */
export function dongDienTuHoa(H, l, w) {
  return (H * l) / w;
}
