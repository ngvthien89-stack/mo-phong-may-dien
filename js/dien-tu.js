/**
 * dien-tu.js — Hàm tính toán cho bài 1.2.a "Định luật cảm ứng điện từ".
 * Không phụ thuộc DOM, dùng chung cho trình duyệt và test Node. Đơn vị SI: Wb, s, V.
 */

/** Từ thông móc vòng của cuộn dây w vòng: ψ = w·φ (Wb). */
export function tuThongMocVong(w, phi) {
  return w * phi;
}

/** Sđđ cảm ứng: e = −w·dφ/dt (V). Với w = 1 là công thức cho một vòng dây e = −dφ/dt. */
export function sddCamUng(w, dPhiDt) {
  const e = -w * dPhiDt;
  return e === 0 ? 0 : e; // tránh −0
}

/** Đạo hàm số bằng sai phân trung tâm. */
export function daoHamSo(f, t, h = 1e-6) {
  return (f(t + h) - f(t - h)) / (2 * h);
}

/** Từ thông hình sin φ = Φm·sin(2πft). */
export function tuThongHinhSin(Phim, f, t) {
  return Phim * Math.sin(2 * Math.PI * f * t);
}

/** Sđđ khi từ thông hình sin: e = −w·ω·Φm·cos(ωt). */
export function sddHinhSin(w, Phim, f, t) {
  const omega = 2 * Math.PI * f;
  return sddCamUng(w, omega * Phim * Math.cos(omega * t));
}

/** Biên độ sđđ Em = ω·w·Φm = 2π·f·w·Φm. */
export function bienDoSdd(w, Phim, f) {
  return 2 * Math.PI * f * w * Phim;
}

/** Trị hiệu dụng E = Em/√2 = (2π/√2)·f·w·Φm ≈ 4,44·f·w·Φm. */
export function sddHieuDung(w, Phim, f) {
  return bienDoSdd(w, Phim, f) / Math.SQRT2;
}

/**
 * Từ thông dạng hình thang: tăng đều → giữ → giảm đều → nghỉ (lặp lại theo chu kỳ).
 * @returns {{phi:number, dPhiDt:number, giaiDoan:'tang'|'giu'|'giam'|'nghi'}}
 */
export function tuThongHinhThang(t, { Phim, tTang, tGiu, tGiam, tNghi }) {
  const T = tTang + tGiu + tGiam + tNghi;
  const u = ((t % T) + T) % T;
  if (u < tTang) return { phi: (Phim * u) / tTang, dPhiDt: Phim / tTang, giaiDoan: 'tang' };
  if (u < tTang + tGiu) return { phi: Phim, dPhiDt: 0, giaiDoan: 'giu' };
  if (u < tTang + tGiu + tGiam) {
    const v = u - tTang - tGiu;
    return { phi: Phim * (1 - v / tGiam), dPhiDt: -Phim / tGiam, giaiDoan: 'giam' };
  }
  return { phi: 0, dPhiDt: 0, giaiDoan: 'nghi' };
}

/**
 * Từ thông do nam châm thẳng móc qua cuộn dây theo khoảng cách d (mô hình rút gọn trên trục):
 * φ(d) = Φmax / (1 + (d/d0)²)^(3/2). cuc = +1 khi cực N hướng vào cuộn dây, −1 khi đảo cực.
 */
export function tuThongNamCham(d, { Phimax, d0 }, cuc = 1) {
  const x = Math.max(0, d) / d0;
  return (cuc * Phimax) / Math.pow(1 + x * x, 1.5);
}

/**
 * Bộ ước lượng đạo hàm theo thời gian từ các mẫu rời rạc (dùng khi người dùng kéo nam châm),
 * có lọc quán tính bậc nhất với hằng số thời gian tau (s) để kim vôn kế không giật.
 */
export class BoDaoHam {
  constructor(tau = 0.08) {
    this.tau = tau;
    this.truoc = null;
    this.giaTri = 0;
  }

  capNhat(x, dt) {
    if (this.truoc === null || !(dt > 0)) {
      this.truoc = x;
      return this.giaTri;
    }
    const tho = (x - this.truoc) / dt;
    this.truoc = x;
    const a = this.tau > 0 ? 1 - Math.exp(-dt / this.tau) : 1;
    this.giaTri += a * (tho - this.giaTri);
    if (Math.abs(this.giaTri) < 1e-12) this.giaTri = 0;
    return this.giaTri;
  }

  datLai(x = null) {
    this.truoc = x;
    this.giaTri = 0;
  }
}

/**
 * Sđđ cảm ứng trong thanh dẫn chuyển động vuông góc với từ trường: e = B·l·v (V).
 * B: mật độ từ cảm (T = Wb/m²), l: chiều dài thanh dẫn (m), v: vận tốc (m/s, có dấu theo chiều chuyển động).
 */
export function sddThanhDan(B, l, v) {
  const e = B * l * v;
  return e === 0 ? 0 : e;
}
