/**
 * bai-tap.js — Lời giải từng bước bốn bài tập chương 1 (slide 77–84).
 * Mỗi hàm trả về danh sách bước: { ten, congThuc, thay, giaTri, donVi, slide?, ghiChu? }.
 * 'giaTri' là số (để định dạng khi hiển thị); 'slide' là chuỗi kết quả ghi trên slide để đối chiếu.
 */
import { dienApPha, dongDienPha } from './thi-nghiem.js';
import { phanBoTai } from './song-song.js';
import { betaToiUu, tonHaoDong } from './che-do.js';

const CAN3 = Math.sqrt(3);

export function giaiBT1(t, slide = {}) {
  const Up1 = dienApPha(t.U1_kV, t.noi1);
  const Up2 = dienApPha(t.U2_kV, t.noi2);
  return [
    { ten: 'Điện áp pha sơ cấp', congThuc: t.noi1 === 'D' ? 'Nối Δ: Up1 = Ud1' : 'Nối Y: Up1 = Ud1/√3', giaTri: Up1, donVi: 'kV', slide: slide.Up1 },
    { ten: 'Điện áp pha thứ cấp', congThuc: t.noi2 === 'D' ? 'Nối Δ: Up2 = Ud2' : 'Nối Y: Up2 = Ud2/√3', giaTri: Up2, donVi: 'kV', slide: slide.Up2 },
    { ten: 'Tỷ số biến áp pha', congThuc: 'kp = Up1/Up2', giaTri: Up1 / Up2, donVi: '', slide: slide.kp, ghiChu: 'Slide làm tròn Up2 = 0,23 kV trước khi chia nên được 65,21.' },
  ];
}

export function giaiBT2(t, slide = {}) {
  const I2dm = (t.S_kVA * 1000) / (CAN3 * t.U2_kV * 1000);
  const beta = t.Itai_A / I2dm;
  const pCu = tonHaoDong(beta, t.Pn_W);
  const bMax = betaToiUu(t.P0_W, t.Pn_W);
  return [
    { ten: 'Dòng điện thứ cấp định mức', congThuc: 'I₂đm = S/(√3·U₂)', giaTri: I2dm, donVi: 'A', slide: slide.I2dm },
    { ten: 'Hệ số tải', congThuc: 'β = I₂/I₂đm', giaTri: beta, donVi: '', slide: slide.beta, ghiChu: 'Slide làm tròn β = 0,6.' },
    { ten: 'Tổn hao đồng', congThuc: 'pCu = β²·Pn', giaTri: pCu, donVi: 'W', slide: slide.pCu, ghiChu: 'Slide dùng β = 0,6 nên được 2160 W.' },
    { ten: 'Tổng tổn hao', congThuc: 'Σp = pFe + pCu = P₀ + pCu', giaTri: t.P0_W + pCu, donVi: 'W', slide: slide.tong },
    { ten: 'Hệ số tải cho hiệu suất cao nhất', congThuc: 'P₀ = β²·Pn → β = √(P₀/Pn)', giaTri: bMax, donVi: '', slide: slide.betaMax, ghiChu: 'Slide ghi 0,294 là nhầm số học: √(1520/6000) = √0,2533 ≈ 0,503.' },
    { ten: 'Dòng điện tải để hiệu suất cao nhất', congThuc: 'I₂ = β·I₂đm', giaTri: bMax * I2dm, donVi: 'A', slide: slide.I2, ghiChu: 'Slide ra 267,7 A do dùng β = 0,294.' },
  ];
}

export function giaiBT3(t, slide = {}) {
  const may = [{ Sdm: t.S1_kVA, un: t.un1 }, { Sdm: t.S2_kVA, un: t.un2 }];
  const tong = may.reduce((s, m) => s + m.Sdm / m.un, 0);
  const [m1, m2] = phanBoTai(t.Stai_kVA, may);
  const I1dm = (t.S1_kVA * 1000) / (CAN3 * t.U2_kV * 1000);
  const I2dm = (t.S2_kVA * 1000) / (CAN3 * t.U2_kV * 1000);
  return [
    { ten: 'Tổng Sđmi/uni%', congThuc: 'Σ(Sđmi/uni%) = Sđm1/un1 + Sđm2/un2', giaTri: tong, donVi: '', slide: slide.tong },
    { ten: 'Hệ số tải máy 1', congThuc: 'β₁ = S/(un1·Σ)', giaTri: m1.beta, donVi: '', slide: slide.beta1 },
    { ten: 'Dung lượng máy 1', congThuc: 'S₁ = β₁·Sđm1', giaTri: m1.S, donVi: 'kVA', slide: slide.S1, ghiChu: 'Slide dùng β₁ = 0,74 nên được 925 kVA.' },
    { ten: 'Hệ số tải máy 2', congThuc: 'β₂ = S/(un2·Σ)', giaTri: m2.beta, donVi: '', slide: slide.beta2 },
    { ten: 'Dung lượng máy 2', congThuc: 'S₂ = β₂·Sđm2', giaTri: m2.S, donVi: 'kVA', slide: slide.S2 },
    { ten: 'Dòng định mức máy 1 (phía 0,4 kV)', congThuc: 'I₁đm = Sđm1/(√3·U₂)', giaTri: I1dm, donVi: 'A', slide: slide.I1dm, ghiChu: 'Slide ghi U1đm trong công thức nhưng thay số 400 V.' },
    { ten: 'Dòng điện máy 1', congThuc: 'I₁ = β₁·I₁đm', giaTri: m1.beta * I1dm, donVi: 'A', slide: slide.I1, ghiChu: 'Slide dùng β₁ = 0,74.' },
    { ten: 'Dòng định mức máy 2 (phía 0,4 kV)', congThuc: 'I₂đm = Sđm2/(√3·U₂)', giaTri: I2dm, donVi: 'A', slide: slide.I2dm },
    { ten: 'Dòng điện máy 2', congThuc: 'I₂ = β₂·I₂đm', giaTri: m2.beta * I2dm, donVi: 'A', slide: slide.I2 },
  ];
}

export function giaiBT4(t, slide = {}) {
  const I1dm = (t.S_kVA * 1000) / (CAN3 * t.U1_kV * 1000);
  const I1p = dongDienPha(I1dm, t.noi1);
  const U1p = dienApPha(t.U1_kV * 1000, t.noi1);
  const U2p = dienApPha(t.U2_kV * 1000, t.noi2);
  const Rn = t.Pn_W / (3 * I1p * I1p);
  const U1n = (t.un / 100) * U1p;
  const zn = U1n / I1p;
  const Xn = Math.sqrt(zn * zn - Rn * Rn);
  const kp = U1p / U2p;
  const I0p = (t.i0 / 100) * I1p;
  const R0 = t.P0_W / (3 * I0p * I0p);
  const z0 = U1p / I0p;
  const X0 = Math.sqrt(z0 * z0 - R0 * R0);
  return [
    { ten: 'Dòng điện sơ cấp định mức', congThuc: 'I₁đm = S/(√3·U₁đm)', giaTri: I1dm, donVi: 'A', slide: slide.I1dm },
    { ten: 'Dòng điện pha sơ cấp', congThuc: t.noi1 === 'D' ? 'Nối Δ: I₁đmp = I₁đm/√3' : 'Nối Y: I₁đmp = I₁đm', giaTri: I1p, donVi: 'A', slide: slide.I1dmp },
    { ten: 'Điện trở ngắn mạch', congThuc: 'Rn = Pn/(3·I₁đmp²)', giaTri: Rn, donVi: 'Ω', slide: slide.Rn, ghiChu: 'Slide ghi đơn vị "A", đúng là Ω.' },
    { ten: 'Điện trở dây quấn', congThuc: 'R₁ ≈ R′₂ = Rn/2', giaTri: Rn / 2, donVi: 'Ω', slide: slide.R1 },
    { ten: 'Điện áp ngắn mạch pha', congThuc: 'U₁n = un%·U₁p', giaTri: U1n, donVi: 'V', slide: slide.U1n },
    { ten: 'Tổng trở ngắn mạch', congThuc: 'zn = U₁n/I₁đmp', giaTri: zn, donVi: 'Ω', slide: slide.zn },
    { ten: 'Điện kháng ngắn mạch', congThuc: 'Xn = √(zn² − Rn²)', giaTri: Xn, donVi: 'Ω', slide: slide.Xn },
    { ten: 'Điện kháng tản', congThuc: 'X₁ ≈ X′₂ = Xn/2', giaTri: Xn / 2, donVi: 'Ω', slide: slide.X1 },
    { ten: 'Tỷ số biến áp pha', congThuc: 'kp = U₁p/U₂p', giaTri: kp, donVi: '', slide: slide.kp },
    { ten: 'Điện trở thứ cấp thực', congThuc: 'R₂ = R′₂/kp²', giaTri: Rn / 2 / (kp * kp), donVi: 'Ω', slide: slide.R2 },
    { ten: 'Điện kháng thứ cấp thực', congThuc: 'X₂ = X′₂/kp²', giaTri: Xn / 2 / (kp * kp), donVi: 'Ω', slide: slide.X2 },
    { ten: 'Dòng điện không tải pha', congThuc: 'I₀p = i₀%·I₁đmp', giaTri: I0p, donVi: 'A', slide: slide.I0p },
    { ten: 'Điện trở không tải', congThuc: 'R₀ = P₀/(3·I₀p²)', giaTri: R0, donVi: 'Ω', slide: slide.R0, ghiChu: 'Slide dùng I₀p làm tròn 0,152 A nên được 12 985 Ω (và viết "12,985Ω").' },
    { ten: 'Tổng trở không tải', congThuc: 'z₀ = U₁p/I₀p', giaTri: z0, donVi: 'Ω', slide: slide.z0 },
    { ten: 'Điện kháng không tải', congThuc: 'X₀ = √(z₀² − R₀²); Rth ≈ R₀, Xth ≈ X₀', giaTri: X0, donVi: 'Ω', slide: slide.X0 },
    { ten: 'Hệ số công suất không tải', congThuc: 'cosφ₀ = R₀/z₀', giaTri: R0 / z0, donVi: '', slide: slide.cos0 },
  ];
}
