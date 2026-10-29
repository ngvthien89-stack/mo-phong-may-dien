/**
 * cach-dien.js — Hàm thuần cho bài 1.3 (vật liệu dùng trong máy điện): tra bảng 7 cấp cách điện,
 * kiểm tra phân loại vật liệu, xáo trộn có hạt giống. Dùng chung cho trang và test Node.
 */

/**
 * Cấp cách điện có dùng được ở nhiệt độ làm việc t không.
 * Cấp ghi "> t" (lonHon) chịu được mọi nhiệt độ trong phạm vi bảng.
 */
export function dungDuoc(cap, t) {
  return cap.lonHon ? true : t <= cap.t;
}

/** Danh sách cấp kèm cờ ok ở nhiệt độ t, giữ thứ tự của bảng. */
export function danhGiaCap(bang, t) {
  return bang.map((c) => ({ ...c, ok: dungDuoc(c, t) }));
}

/** Cấp cách điện thấp nhất (đầu tiên trong bảng) dùng được ở nhiệt độ t. */
export function capThapNhat(bang, t) {
  return bang.find((c) => dungDuoc(c, t)) || null;
}

/** Vật liệu có được xếp đúng nhóm không. */
export function xepDung(vatLieu, nhom) {
  return vatLieu.nhom === nhom;
}

/** Đếm số vật liệu trong từng nhóm. */
export function demTheoNhom(dsVatLieu) {
  return dsVatLieu.reduce((kq, v) => ({ ...kq, [v.nhom]: (kq[v.nhom] || 0) + 1 }), {});
}

/** Xáo trộn Fisher–Yates với bộ sinh số giả ngẫu nhiên mulberry32 (cùng hạt giống → cùng thứ tự). */
export function xaoTron(ds, hatGiong = 1) {
  let a = hatGiong >>> 0;
  const ngauNhien = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const kq = [...ds];
  for (let i = kq.length - 1; i > 0; i--) {
    const j = Math.floor(ngauNhien() * (i + 1));
    [kq[i], kq[j]] = [kq[j], kq[i]];
  }
  return kq;
}
