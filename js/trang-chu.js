/** trang-chu.js — Hiển thị danh sách bài học từ du-lieu/bai-hoc.json. */
const khung = document.querySelector('#danh-sach');

const mauThe = (b) => {
  const sanSang = b.trangThai === 'san-sang';
  const noiDung = `
    <span class="the-ma">${b.ma || '—'}</span>
    <span class="the-chu">
      <span class="the-ten">${b.ten}</span>
      <span class="the-mo-ta">${b.moTa || ''}</span>
    </span>
    <span class="the-trang-thai">${sanSang ? 'Vào học →' : 'Sắp ra mắt'}</span>`;
  return sanSang
    ? `<li><a class="the-bai san-sang" href="${b.duongDan}">${noiDung}</a></li>`
    : `<li><div class="the-bai sap-ra-mat" aria-disabled="true">${noiDung}</div></li>`;
};

fetch('du-lieu/bai-hoc.json', { cache: 'no-cache' })
  .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
  .then((d) => {
    khung.innerHTML = d.chuong.map((c) => `
      <section class="chuong">
        <h2>${c.ten}</h2>
        <ul class="ds-bai">${c.baiHoc.map(mauThe).join('')}</ul>
      </section>`).join('');
  })
  .catch(() => {
    // Dự phòng khi mở trực tiếp bằng file:// (trình duyệt chặn fetch)
    khung.innerHTML = `
      <section class="chuong"><h2>Chương 1. Mở đầu</h2>
        <ul class="ds-bai">${mauThe({ ma: '1.1', ten: 'Hệ thống năng lượng điện', moTa: 'Sản xuất, truyền tải, phân phối và tiêu thụ điện năng.', duongDan: 'he-thong-dien.html', trangThai: 'san-sang' })}</ul>
      </section>
      <p class="ghi-chu-nho">Không đọc được <code>du-lieu/bai-hoc.json</code>. Hãy mở trang qua GitHub Pages hoặc máy chủ cục bộ (xem README).</p>`;
  });
