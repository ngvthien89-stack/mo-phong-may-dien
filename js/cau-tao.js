/**
 * cau-tao.js — Hàm thuần cho bài 2.4 (cấu tạo MBA). Dùng chung cho trang và test Node.
 */

/**
 * Thứ tự bánh dây của dây quấn xen kẽ dọc theo trụ (từ gông trên xuống gông dưới):
 * một bánh HA chia làm hai đặt sát hai gông, giữa là CA, HA xen kẽ (slide 31).
 * @param {number} soBanhCA số bánh dây CA (≥ 1)
 * @returns {{loai: 'HA'|'CA', nua: boolean}[]}
 */
export function thuTuBanhXenKe(soBanhCA) {
  if (!Number.isInteger(soBanhCA) || soBanhCA < 1) throw new RangeError('Số bánh CA phải là số nguyên ≥ 1');
  const ds = [{ loai: 'HA', nua: true }];
  for (let k = 0; k < soBanhCA; k++) {
    ds.push({ loai: 'CA', nua: false });
    ds.push({ loai: 'HA', nua: k === soBanhCA - 1 });
  }
  return ds;
}

/**
 * Mức dầu trong bình giãn dầu (0…1 chiều cao bình) theo mức nhiệt độ dầu định tính k (0 = lạnh, 1 = nóng):
 * dầu giãn nở khi nóng nên mức dầu dâng lên; thùng máy luôn đầy dầu.
 */
export function mucDauBinhGian(k, { min, max }) {
  const kk = Math.max(0, Math.min(1, k));
  return min + (max - min) * kk;
}

/** Giới hạn chỉ số bước trong khoảng 0…n−1. */
export function gioiHanBuoc(i, n) {
  return Math.max(0, Math.min(n - 1, Math.round(i)));
}
