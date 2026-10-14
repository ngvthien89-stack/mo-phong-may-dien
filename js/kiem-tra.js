/**
 * kiem-tra.js — Câu hỏi kiểm tra nhanh (trắc nghiệm), dữ liệu từ du-lieu/cau-hoi.json.
 */
const $ = (s) => document.querySelector(s);
const CHU = ['A', 'B', 'C', 'D', 'E', 'F'];

function tronNgauNhien(ds) {
  const a = [...ds];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function khoiTaoCauHoi(duLieu) {
  const hop = $('#hop-cau-hoi');
  const noiDung = $('#ch-noi-dung');
  let ds = [];
  let i = 0;
  let traLoi = [];

  function batDau() {
    ds = tronNgauNhien(duLieu.cauHoi).slice(0, duLieu.soCauMoiLan || 5);
    i = 0;
    traLoi = [];
    veCau();
  }

  function veCau() {
    const c = ds[i];
    const diem = traLoi.filter((t, k) => t === ds[k].dapAn).length;
    noiDung.innerHTML = `
      <div class="ch-tien-do">
        <span>Câu ${i + 1}/${ds.length}</span>
        <div class="ch-thanh" aria-hidden="true"><span style="width:${(i / ds.length) * 100}%"></span></div>
        <span>Đúng: ${diem}</span>
      </div>
      <p class="ch-cau">${c.cauHoi}</p>
      <div class="ch-lua-chon">
        ${c.luaChon.map((l, k) => `<button type="button" class="ch-phuong-an" data-k="${k}"><span class="ch-chu">${CHU[k]}</span><span>${l}</span></button>`).join('')}
      </div>
      <div class="ch-giai-thich" id="ch-giai-thich" hidden></div>
      <div class="ch-hanh-dong"><button type="button" class="nut nut-chinh" id="ch-tiep" hidden></button></div>`;
    noiDung.querySelectorAll('.ch-phuong-an').forEach((n) => n.addEventListener('click', () => chon(Number(n.dataset.k))));
    noiDung.querySelector('.ch-phuong-an')?.focus();
  }

  function chon(k) {
    const c = ds[i];
    traLoi[i] = k;
    const dung = k === c.dapAn;
    noiDung.querySelectorAll('.ch-phuong-an').forEach((n, j) => {
      n.disabled = true;
      if (j === c.dapAn) n.classList.add('dung');
      else if (j === k) n.classList.add('sai');
    });
    const gt = $('#ch-giai-thich');
    gt.hidden = false;
    gt.className = `ch-giai-thich ${dung ? 'dung' : 'sai'}`;
    gt.innerHTML = `<strong>${dung ? '✓ Chính xác!' : `✗ Chưa đúng. Đáp án: ${CHU[c.dapAn]}`}</strong><p>${c.giaiThich}</p>`;
    const tiep = $('#ch-tiep');
    tiep.hidden = false;
    tiep.textContent = i === ds.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo →';
    tiep.onclick = () => { if (i === ds.length - 1) ketQua(); else { i += 1; veCau(); } };
    tiep.focus();
  }

  function ketQua() {
    const diem = traLoi.filter((t, k) => t === ds[k].dapAn).length;
    const tiLe = diem / ds.length;
    const loiKhen = tiLe === 1 ? 'Xuất sắc! Bạn đã nắm vững kiến thức.' : tiLe >= 0.6 ? 'Khá tốt! Xem lại các câu sai bên dưới.' : 'Hãy xem lại mô phỏng và chế độ trình chiếu rồi thử lại.';
    noiDung.innerHTML = `
      <div class="ch-ket-qua">
        <p class="ch-diem"><span>${diem}</span>/${ds.length}</p>
        <p>${loiKhen}</p>
      </div>
      <ol class="ch-xem-lai">
        ${ds.map((c, k) => `<li class="${traLoi[k] === c.dapAn ? 'dung' : 'sai'}"><b>${traLoi[k] === c.dapAn ? '✓' : '✗'}</b> ${c.cauHoi}<br><small>Đáp án: ${CHU[c.dapAn]}. ${c.luaChon[c.dapAn]}</small></li>`).join('')}
      </ol>
      <div class="ch-hanh-dong"><button type="button" class="nut nut-chinh" id="ch-lam-lai">↻ Làm lại</button></div>`;
    $('#ch-lam-lai').addEventListener('click', batDau);
  }

  $('#nut-cau-hoi').addEventListener('click', () => {
    batDau();
    hop.showModal();
  });
  hop.querySelector('.nut-dong').addEventListener('click', () => hop.close());
  hop.addEventListener('click', (e) => { if (e.target === hop) hop.close(); });
}
