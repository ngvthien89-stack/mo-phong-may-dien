/**
 * song-song.js — MBA làm việc song song (slide 73–74).
 */

/**
 * Hệ số tải của các MBA làm việc song song (tỉ lệ nghịch với điện áp ngắn mạch):
 * β_i = S / (un_i · Σ(Sđm_j / un_j)).
 * @param {number} S tổng công suất tải (kVA)
 * @param {{Sdm: number, un: number}[]} dsMay
 */
export function phanBoTai(S, dsMay) {
  const tong = dsMay.reduce((t, m) => t + m.Sdm / m.un, 0);
  return dsMay.map((m) => {
    const beta = S / (m.un * tong);
    return { beta, S: beta * m.Sdm };
  });
}

/** Tổng công suất tải lớn nhất để không máy nào quá tải (β_max = 1). */
export function taiToiDa(dsMay) {
  const tong = dsMay.reduce((t, m) => t + m.Sdm / m.un, 0);
  const unMin = Math.min(...dsMay.map((m) => m.un));
  return unMin * tong;
}

/**
 * Kiểm tra ba điều kiện làm việc song song (slide 73): cùng tổ nối dây, cùng cấp điện áp và hệ số biến đổi,
 * cùng điện áp ngắn mạch (so với sai lệch cho phép 'saiUn' tính theo %).
 */
export function kiemTraDieuKien(dsMay, saiUn = 0) {
  const dau = dsMay[0];
  const cungTo = dsMay.every((m) => m.to === dau.to);
  const cungDienAp = dsMay.every((m) => m.U1 === dau.U1 && m.U2 === dau.U2);
  const unMin = Math.min(...dsMay.map((m) => m.un));
  const unMax = Math.max(...dsMay.map((m) => m.un));
  const cungUn = unMax - unMin <= saiUn + 1e-12;
  return { cungTo, cungDienAp, cungUn, dat: cungTo && cungDienAp && cungUn };
}
