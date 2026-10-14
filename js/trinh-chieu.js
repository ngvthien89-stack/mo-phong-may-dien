/**
 * trinh-chieu.js — Chế độ trình chiếu: đi lần lượt từng bộ phận (A → F), làm nổi bật bộ phận
 * đang giảng, làm mờ phần còn lại và hiện lời giảng ngắn. Điều khiển bằng nút hoặc phím mũi tên,
 * PageUp/PageDown (bút trình chiếu), Space; Esc để thoát.
 */
const $ = (s) => document.querySelector(s);

export function khoiTaoTrinhChieu(ung) {
  const { noiDung, thayBien } = ung;
  const cacBuoc = [
    { id: null, ...noiDung.moDau },
    ...noiDung.boPhan.map((b) => ({ id: b.id, ma: b.ma, tieuDe: b.ten, loiGiang: b.loiGiang, capDienAp: b.capDienAp })),
    { id: null, ...noiDung.ketLuan },
  ];
  const thanh = $('#thanh-trinh-chieu');
  const nut = $('#nut-trinh-chieu');
  let i = 0;
  let dangBat = false;

  thanh.innerHTML = `
    <div class="tc-dau">
      <span class="tc-so" id="tc-so"></span>
      <h2 id="tc-tieu-de"></h2>
      <span class="tc-dien-ap" id="tc-dien-ap"></span>
    </div>
    <p id="tc-loi-giang" class="tc-loi-giang"></p>
    <p id="tc-so-lieu" class="tc-so-lieu" aria-live="off"></p>
    <div class="tc-nut">
      <button type="button" class="nut" id="tc-lui" aria-label="Bộ phận trước">◀ Lùi</button>
      <div class="tc-cham" id="tc-cham" role="tablist" aria-label="Các bước trình chiếu">
        ${cacBuoc.map((b, k) => `<button type="button" role="tab" data-k="${k}" title="${b.tieuDe}">${b.ma || (k === 0 ? '•' : k === cacBuoc.length - 1 ? '✓' : '·')}</button>`).join('')}
      </div>
      <button type="button" class="nut nut-chinh" id="tc-tiep" aria-label="Bộ phận tiếp theo">Tiếp ▶</button>
      <button type="button" class="nut" id="tc-thoat">✕ Thoát</button>
    </div>`;

  function hien(k) {
    i = Math.max(0, Math.min(cacBuoc.length - 1, k));
    const b = cacBuoc[i];
    $('#tc-so').textContent = `${i + 1}/${cacBuoc.length}`;
    $('#tc-tieu-de').innerHTML = `${b.ma ? `<span class="huy-hieu-html">${b.ma}</span>` : ''}${b.tieuDe}`;
    $('#tc-dien-ap').textContent = b.capDienAp ? thayBien(b.capDienAp) : '';
    $('#tc-dien-ap').hidden = !b.capDienAp;
    $('#tc-loi-giang').textContent = thayBien(b.loiGiang);
    $('#tc-so-lieu').textContent = '';
    $('#tc-so-lieu').hidden = !b.id;
    $('#tc-lui').disabled = i === 0;
    $('#tc-tiep').textContent = i === cacBuoc.length - 1 ? 'Kết thúc ✓' : 'Tiếp ▶';
    thanh.querySelectorAll('.tc-cham button').forEach((n, k) => n.setAttribute('aria-selected', String(k === i)));
    ung.lamNoiBat(b.id);
  }

  function bat() {
    dangBat = true;
    ung.dongThongTin?.();
    document.body.classList.add('che-do-trinh-chieu');
    thanh.hidden = false;
    nut.setAttribute('aria-pressed', 'true');
    hien(0);
  }
  function tat() {
    dangBat = false;
    document.body.classList.remove('che-do-trinh-chieu');
    thanh.hidden = true;
    nut.setAttribute('aria-pressed', 'false');
    ung.lamNoiBat(null);
  }
  const tiep = () => (i === cacBuoc.length - 1 ? tat() : hien(i + 1));

  nut.addEventListener('click', () => (dangBat ? tat() : bat()));
  $('#tc-lui').addEventListener('click', () => hien(i - 1));
  $('#tc-tiep').addEventListener('click', tiep);
  $('#tc-thoat').addEventListener('click', tat);
  thanh.querySelectorAll('.tc-cham button').forEach((n) => n.addEventListener('click', () => hien(Number(n.dataset.k))));

  return {
    get dangBat() { return dangBat; },
    get idHienTai() { return dangBat ? cacBuoc[i].id : null; },
    xuLyPhim(e) {
      if (!dangBat) return false;
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); tiep(); return true; }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); hien(i - 1); return true; }
      if (e.key === 'Home') { hien(0); return true; }
      if (e.key === 'End') { hien(cacBuoc.length - 1); return true; }
      if (e.key === 'Escape') { tat(); return true; }
      return false;
    },
  };
}
