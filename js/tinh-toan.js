/**
 * tinh-toan.js — Các hàm tính toán cho mô phỏng hệ thống điện.
 * Viết thuần (không phụ thuộc DOM) để dùng chung cho trình duyệt và test Node.
 *
 * Quy ước đơn vị trong các hàm "thực hành": công suất MW, điện áp kV, điện trở Ω,
 * dòng điện A. Hai hàm cơ bản dongDienBaPha / tonThatBaPha dùng đơn vị SI (W, V, A, Ω).
 */

export const CAN3 = Math.sqrt(3);

/** Dòng điện dây của tải 3 pha: I = P / (√3 · U · cosφ). P [W], U [V] → I [A]. */
export function dongDienBaPha(P_W, U_V, cosPhi) {
  if (!(U_V > 0) || !(cosPhi > 0)) throw new RangeError('U và cosφ phải dương');
  return P_W / (CAN3 * U_V * cosPhi);
}

/** Tổn thất công suất trên đường dây 3 pha: ΔP = 3 · I² · R. I [A], R [Ω/pha] → ΔP [W]. */
export function tonThatBaPha(I_A, R_ohm) {
  return 3 * I_A * I_A * R_ohm;
}

/** Hiệu suất η = P_ra / P_vào (0…1). Trả về 0 nếu P_vào ≤ 0. */
export function hieuSuat(P_ra, P_vao) {
  if (!(P_vao > 0)) return 0;
  return P_ra / P_vao;
}

/**
 * Bài toán "cùng công suất P, khác điện áp U".
 * P là công suất đưa vào đầu đường dây (MW). Trả về dòng điện, tổn thất, % tổn thất, hiệu suất.
 */
export function tinhTruyenTai({ P_MW, U_kV, cosPhi, R_ohm }) {
  const I_A = dongDienBaPha(P_MW * 1e6, U_kV * 1e3, cosPhi);
  const dP_MW = tonThatBaPha(I_A, R_ohm) / 1e6;
  const coTheTruyenTai = dP_MW < P_MW;
  const P_nhan_MW = Math.max(0, P_MW - dP_MW);
  return {
    I_A,
    dP_MW,
    phanTram: P_MW > 0 ? (dP_MW / P_MW) * 100 : 0,
    hieuSuat: coTheTruyenTai ? hieuSuat(P_nhan_MW, P_MW) : 0,
    P_nhan_MW,
    coTheTruyenTai,
  };
}

/**
 * Biết công suất cần nhận ở cuối đường dây, tìm công suất phải gửi ở đầu đường dây.
 * Với I tính theo công suất đầu gửi: ΔP = R·P_gửi² / (U²·cos²φ)  (MW, kV, Ω)
 * ⇒ P_gửi − a·P_gửi² = P_nhận, a = R / (U²·cos²φ) ⇒ P_gửi = (1 − √(1 − 4aP_nhận)) / (2a).
 * Trả về NaN nếu không tồn tại nghiệm (tổn thất quá lớn, không thể truyền tải).
 */
export function congSuatDauGui(P_nhan_MW, U_kV, cosPhi, R_ohm) {
  if (P_nhan_MW <= 0) return 0;
  const a = R_ohm / (U_kV * U_kV * cosPhi * cosPhi);
  if (a === 0) return P_nhan_MW;
  const delta = 1 - 4 * a * P_nhan_MW;
  if (delta < 0) return NaN;
  // Dạng ổn định số của (1 − √Δ)/(2a) để tránh triệt tiêu khi a nhỏ.
  return (2 * P_nhan_MW) / (1 + Math.sqrt(delta));
}

/** Nội suy tuyến tính đồ thị 24 điểm (giá trị tại 0h…23h), vòng lại 24h ≡ 0h. */
export function noiSuyDoThi(doThi, gio) {
  const n = doThi.length;
  const g = ((gio % n) + n) % n;
  const i = Math.floor(g);
  const t = g - i;
  return doThi[i] * (1 - t) + doThi[(i + 1) % n] * t;
}

/**
 * Tính công suất từng khu vực phụ tải.
 * @param {Array} phuTai danh sách {id, Pmax_MW, doThi[24]}
 * @param {number} gio giờ trong ngày (0…24)
 * @param {Object} [tuyChon] {coDien: {id: bool}, Pthem: {id: MW}}
 */
export function tinhPhuTai(phuTai, gio, tuyChon = {}) {
  const coDien = tuyChon.coDien || {};
  const Pthem = tuyChon.Pthem || {};
  const ketQua = {};
  for (const pt of phuTai) {
    const duocCap = coDien[pt.id] !== false;
    const P = pt.Pmax_MW * noiSuyDoThi(pt.doThi, gio) + (Pthem[pt.id] || 0);
    ketQua[pt.id] = duocCap ? P : 0;
  }
  return ketQua;
}

/** Tổn thất lưới phân phối ước tính, tỉ lệ bình phương công suất: ΔP = k%·Pđm·(P/Pđm)². */
export function tonThatPhanPhoi(P_MW, phanPhoi) {
  const Pdm = phanPhoi.congSuatDinhMuc_MW;
  const k = phanPhoi.tonThatDinhMuc_phanTram / 100;
  return k * Pdm * Math.pow(P_MW / Pdm, 2);
}

/**
 * Tính trạng thái toàn hệ thống tại một thời điểm.
 * @param {Object} cauHinh nội dung cau-hinh.json
 * @param {Object} trangThai {gio, coDien, Pthem}
 */
export function tinhHeThong(cauHinh, trangThai) {
  const tt = cauHinh.truyenTai;
  const R = tt.chieuDai_km * tt.r0_ohm_km;
  const U = cauHinh.capDienAp[tt.capDienAp].kV;
  const tai = tinhPhuTai(cauHinh.phuTai, trangThai.gio, trangThai);
  const P_tai = Object.values(tai).reduce((s, x) => s + x, 0);
  const dP_pp = tonThatPhanPhoi(P_tai, cauHinh.phanPhoi);
  const P_nhan = P_tai + dP_pp;
  const P_phat = congSuatDauGui(P_nhan, U, tt.cosPhi, R);
  const dP_tt = P_phat - P_nhan;
  const I_tt = dongDienBaPha(P_phat * 1e6, U * 1e3, tt.cosPhi);
  return {
    tai,
    P_tai,
    dP_pp,
    P_nhan,
    P_phat,
    dP_tt,
    I_tt,
    R_tt: R,
    U_tt: U,
    phanTramTonThatTT: P_phat > 0 ? (dP_tt / P_phat) * 100 : 0,
    hieuSuatTT: hieuSuat(P_nhan, P_phat),
    hieuSuatTong: hieuSuat(P_tai, P_phat),
  };
}

/**
 * Một bước mô phỏng tần số – công suất tuabin (minh họa định tính, mô hình bậc thấp).
 *  - Phương trình chuyển động rô-to:  df/dt = f0/(2H) · (Pm − Pe)/S
 *  - Bộ điều tốc (độ dốc R, hằng số thời gian Tg): dPm/dt = (Pref − S·Δf/(R·f0) − Pm)/Tg
 *  - Điều chỉnh tần số cấp 2 (AGC, hệ số Ki):        dPref/dt = −Ki · S · Δf
 * @param {{f:number, Pm:number, Pref:number}} s trạng thái (Hz, MW, MW)
 * @param {number} Pe công suất điện phụ tải yêu cầu (MW)
 * @param {number} dt bước thời gian (s)
 * @param {{f0,H_s,S_MVA,doDoc_R,Tg_s,Ki}} p tham số
 */
export function buocTanSo(s, Pe, dt, p) {
  const df = s.f - p.f0;
  const dfdt = (p.f0 / (2 * p.H_s)) * ((s.Pm - Pe) / p.S_MVA);
  const dPm = (s.Pref - (p.S_MVA * df) / (p.doDoc_R * p.f0) - s.Pm) / p.Tg_s;
  const dPref = -p.Ki * p.S_MVA * df;
  return {
    f: s.f + dfdt * dt,
    Pm: s.Pm + dPm * dt,
    Pref: s.Pref + dPref * dt,
  };
}

/** Định dạng số kiểu Việt Nam (dấu phẩy thập phân). */
export function dinhDangSo(x, soLe = 1) {
  if (!Number.isFinite(x)) return '—';
  return x.toLocaleString('vi-VN', {
    minimumFractionDigits: soLe,
    maximumFractionDigits: soLe,
  });
}
