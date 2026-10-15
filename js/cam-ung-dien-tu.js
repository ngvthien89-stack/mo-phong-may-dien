/**
 * cam-ung-dien-tu.js — Trang 1.2.a "Định luật cảm ứng điện từ (định luật Faraday)".
 */
import { veSanKhau, veCuonDay, datMuiE, NGANG } from './hinh-dien-tu.js';
import { sddCamUng, tuThongMocVong, tuThongNamCham, tuThongHinhThang, bienDoSdd, sddHieuDung, BoDaoHam } from './dien-tu.js';
import { dinhDangSo } from './tinh-toan.js';
import { khoiTaoTrinhChieu } from './trinh-chieu.js';
import { khoiTaoCauHoi } from './kiem-tra.js';

const $ = (s) => document.querySelector(s);
const X_NAM_CHAM = { min: 1000, max: 1320, giua: 1160, bienDo: 155 };

async function napJSON(duongDan) {
  const r = await fetch(duongDan, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${duongDan}: HTTP ${r.status}`);
  return r.json();
}

/** Số có khoảng 3 chữ số có nghĩa, định dạng Việt Nam. */
function soCoNghia(x, so = 3) {
  if (!Number.isFinite(x)) return '—';
  if (x === 0) return '0';
  const le = Math.max(0, Math.min(6, so - 1 - Math.floor(Math.log10(Math.abs(x)))));
  return dinhDangSo(x, le);
}

/** Làm tròn lên mốc "đẹp" 1 – 2 – 2,5 – 5 × 10ⁿ (dùng cho thang đo). */
function lamTronDep(x) {
  if (!(x > 0)) return 1;
  const mu = Math.pow(10, Math.floor(Math.log10(x)));
  for (const k of [1, 2, 2.5, 5, 10]) if (k * mu >= x * 0.999) return k * mu;
  return 10 * mu;
}

function veCongThuc(o, tex, duPhong) {
  if (window.katex) {
    try {
      window.katex.render(tex, o, { throwOnError: false, displayMode: true });
      return;
    } catch { /* dạng dự phòng */ }
  }
  o.innerHTML = `<span class="cong-thuc-du-phong">${duPhong}</span>`;
}
const soTex = (s) => s.replace(/\./g, '\\,').replace(',', '{,}');

async function khoiDong() {
  let nd, cauHoi;
  try {
    [nd, cauHoi] = await Promise.all([napJSON('du-lieu/cam-ung-dien-tu.json'), napJSON('du-lieu/cau-hoi-cam-ung-dien-tu.json')]);
  } catch (loi) {
    const tb = $('#thong-bao-loi');
    tb.hidden = false;
    tb.innerHTML = `<h2>Không nạp được dữ liệu</h2><p>${loi.message}</p>
      <p>Hãy mở trang qua GitHub Pages hoặc máy chủ cục bộ (ví dụ <code>python3 -m http.server</code>), xem README.</p>`;
    return;
  }

  const svg = $('#so-do');
  const ref = veSanKhau(svg);
  const tt = {
    kichBan: nd.macDinh.kichBan,
    w: nd.macDinh.w,
    dangChay: true,
    tocDo: 1,
    hienQuyUoc: true,
    hienLenz: false,
    t: 0,
    lichSu: [],
    phi: 0,
    dPhi: 0,
    e: 0,
    giaiDoan: '',
    phaMui: 0,
    namCham: { x: X_NAM_CHAM.min + 20, cuc: 1, tuDong: true, tTuDong: -0.75, dangKeo: false, lech: 0 },
    hinhThang: { ...nd.hinhThang },
    hinhSin: { ...nd.hinhSin },
  };
  const boDaoHam = new BoDaoHam(0.06);

  // ---------- Lý thuyết (theo slide) ----------
  const lt = nd.lyThuyet;
  $('#the-ly-thuyet').innerHTML = `
    <p class="muc-nho">${lt.muc}</p>
    <h2>${lt.tieuDe}</h2>
    <p class="phat-bieu">${lt.phatBieu}</p>
    ${lt.congThuc.map((c, i) => `<p class="dong-ly-thuyet">${c.chu}</p><div class="cong-thuc" data-ct="${i}"></div>${c.sau ? `<p class="dong-ly-thuyet sau">${c.sau}</p>` : ''}`).join('')}
    <ul class="ghi-chu-ly-thuyet">${lt.ghiChu.map((g) => `<li>${g}</li>`).join('')}</ul>`;
  const veLyThuyet = () => lt.congThuc.forEach((c, i) => veCongThuc($(`[data-ct="${i}"]`), c.tex, c.duPhong));
  veLyThuyet();
  if (!window.katex) document.querySelector('script[src*="katex"]')?.addEventListener('load', () => { veLyThuyet(); veSoLieu(true); }, { once: true });

  // ---------- Điều khiển chung ----------
  const oW = $('#so-vong');
  oW.min = nd.macDinh.wMin;
  oW.max = nd.macDinh.wMax;
  const datW = (w) => {
    tt.w = Math.round(w);
    oW.value = tt.w;
    $('#gia-tri-so-vong').textContent = tt.w;
    veCuonDay(ref, tt.w);
  };
  oW.addEventListener('input', () => datW(Number(oW.value)));
  const oQuyUoc = $('#hien-quy-uoc');
  const oLenz = $('#hien-lenz');
  oQuyUoc.addEventListener('change', () => { tt.hienQuyUoc = oQuyUoc.checked; });
  oLenz.addEventListener('change', () => { tt.hienLenz = oLenz.checked; });

  const nutChay = $('#nut-chay');
  const datChay = (chay) => {
    tt.dangChay = chay;
    nutChay.innerHTML = chay ? '<span aria-hidden="true">⏸</span> Tạm dừng' : '<span aria-hidden="true">▶</span> Chạy';
    nutChay.setAttribute('aria-pressed', String(!chay));
    document.body.classList.toggle('tam-dung', !chay);
  };
  nutChay.addEventListener('click', () => datChay(!tt.dangChay));
  $('#toc-do').addEventListener('input', (e) => {
    tt.tocDo = Number(e.target.value);
    $('#gia-tri-toc-do').textContent = `${dinhDangSo(tt.tocDo, tt.tocDo % 1 ? 2 : 0)}×`;
  });
  $('#chon-kich-ban').addEventListener('change', (e) => chonKichBan(e.target.value));

  const nutTMH = $('#nut-toan-man-hinh');
  if (!document.fullscreenEnabled) nutTMH.hidden = true;
  nutTMH.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  });
  document.addEventListener('fullscreenchange', () => nutTMH.classList.toggle('dang-bat', !!document.fullscreenElement));

  // ---------- Kéo nam châm ----------
  const toaDoSvg = (e) => new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
  ref.vungKeo.addEventListener('pointerdown', (e) => {
    if (tt.kichBan !== 'nam-cham') return;
    e.preventDefault();
    ref.vungKeo.setPointerCapture(e.pointerId);
    tt.namCham.dangKeo = true;
    tt.namCham.lech = toaDoSvg(e).x - tt.namCham.x;
    datTuDong(false);
  });
  ref.vungKeo.addEventListener('pointermove', (e) => {
    if (!tt.namCham.dangKeo) return;
    tt.namCham.x = Math.min(X_NAM_CHAM.max, Math.max(X_NAM_CHAM.min, toaDoSvg(e).x - tt.namCham.lech));
  });
  const thaKeo = () => { tt.namCham.dangKeo = false; };
  ref.vungKeo.addEventListener('pointerup', thaKeo);
  ref.vungKeo.addEventListener('pointercancel', thaKeo);

  function datTuDong(bat) {
    tt.namCham.tuDong = bat;
    if (bat) {
      // tiếp tục dao động từ vị trí hiện tại để không bị giật
      const s = Math.max(-1, Math.min(1, (tt.namCham.x - X_NAM_CHAM.giua) / X_NAM_CHAM.bienDo));
      tt.namCham.tTuDong = (Math.asin(s) / (2 * Math.PI)) * nd.namCham.chuKyTuDong_s;
    }
    const n = $('#nut-tu-dong');
    if (n) {
      n.setAttribute('aria-pressed', String(bat));
      n.innerHTML = bat ? '⏹ Dừng tự động' : '⟷ Tự động đưa vào – rút ra';
    }
  }

  // ---------- Kịch bản ----------
  function chonKichBan(id) {
    tt.kichBan = id;
    $('#chon-kich-ban').value = id;
    document.body.dataset.kichBan = id;
    tt.t = 0;
    tt.lichSu = [];
    boDaoHam.datLai();
    ref.namCham.g.style.display = id === 'nam-cham' ? '' : 'none';
    ref.gQuay.style.display = id === 'hinh-sin' ? '' : 'none';
    ref.gDien.style.display = id === 'hinh-thang' ? '' : 'none';
    ref.tieuDeNguon.textContent = {
      'nam-cham': 'Nguồn từ thông: nam châm thẳng (nhìn ngang)',
      'hinh-thang': 'Nguồn từ thông: nam châm điện, dòng i(t) (nhìn ngang)',
      'hinh-sin': 'Nguồn từ thông: nam châm quay như máy phát (nhìn ngang)',
    }[id];
    const dk = $('#dieu-khien-kich-ban');
    if (id === 'nam-cham') {
      dk.innerHTML = `
        <p class="mo-ta"><b>Kéo nam châm</b> trên hình (phần bên phải sân khấu) lại gần hoặc ra xa cuộn dây, hoặc bật chế độ tự động.</p>
        <div class="hang-nut">
          <button type="button" class="nut" id="nut-tu-dong" aria-pressed="true"></button>
          <button type="button" class="nut" id="nut-dao-cuc">⇄ Đảo cực nam châm</button>
        </div>`;
      $('#nut-tu-dong').addEventListener('click', () => datTuDong(!tt.namCham.tuDong));
      $('#nut-dao-cuc').addEventListener('click', () => { tt.namCham.cuc *= -1; ref.namCham.datCuc(tt.namCham.cuc); });
      ref.namCham.datCuc(tt.namCham.cuc);
      datTuDong(tt.namCham.tuDong);
    } else if (id === 'hinh-thang') {
      const p = tt.hinhThang;
      dk.innerHTML = `
        <p class="mo-ta">Dòng điện nam châm điện lần lượt <b>tăng đều</b> (${dinhDangSo(p.tTang_s, 0)} s) → <b>giữ không đổi</b> (${dinhDangSo(p.tGiu_s, 0)} s) → <b>giảm đều</b> (${dinhDangSo(p.tGiam_s, 0)} s) → <b>bằng 0</b> (${dinhDangSo(p.tNghi_s, 0)} s). Từ thông φ tỉ lệ với dòng điện.</p>
        <label class="dieu-khien doc"><span>Φ<sub>max</sub></span> <input type="range" id="tt-phim" min="${p.PhimMin_Wb * 1000}" max="${p.PhimMax_Wb * 1000}" step="1" value="${p.Phim_Wb * 1000}"><output id="tt-phim-gt"></output></label>`;
      const capNhat = () => { p.Phim_Wb = Number($('#tt-phim').value) / 1000; $('#tt-phim-gt').textContent = `${dinhDangSo(p.Phim_Wb * 1000, 0)} mWb`; };
      $('#tt-phim').addEventListener('input', capNhat);
      capNhat();
    } else {
      const p = tt.hinhSin;
      dk.innerHTML = `
        <p class="mo-ta">Nam châm quay đều với tần số f tạo từ thông <b>φ = Φ<sub>m</sub>·sin ωt</b> qua cuộn dây. Hoạt hình chạy chậm ${dinhDangSo(p.heSoCham, 0)} lần; số liệu tính với tần số thực.</p>
        <label class="dieu-khien doc"><span>Φ<sub>m</sub></span> <input type="range" id="sin-phim" min="${p.PhimMin_Wb * 1000}" max="${p.PhimMax_Wb * 1000}" step="1" value="${p.Phim_Wb * 1000}"><output id="sin-phim-gt"></output></label>
        <label class="dieu-khien doc"><span>Tần số f</span> <input type="range" id="sin-f" min="${p.fMin_Hz}" max="${p.fMax_Hz}" step="1" value="${p.f_Hz}"><output id="sin-f-gt"></output></label>`;
      const capNhat = () => {
        p.Phim_Wb = Number($('#sin-phim').value) / 1000;
        p.f_Hz = Number($('#sin-f').value);
        $('#sin-phim-gt').textContent = `${dinhDangSo(p.Phim_Wb * 1000, 0)} mWb`;
        $('#sin-f-gt').textContent = `${dinhDangSo(p.f_Hz, 0)} Hz`;
        tt.lichSu = [];
      };
      $('#sin-phim').addEventListener('input', capNhat);
      $('#sin-f').addEventListener('input', capNhat);
      capNhat();
    }
    $('#hang-sin').hidden = id !== 'hinh-sin';
    veSoLieu(true);
  }

  /** Thông số hiển thị theo kịch bản: khoảng thời gian đồ thị, thang φ, thang e danh định. */
  function thongSoKichBan() {
    if (tt.kichBan === 'nam-cham') {
      return { khoang: 6, phiRef: nd.namCham.Phimax_Wb, eDanhDinh: tt.w * nd.namCham.Phimax_Wb * 3, ms: false };
    }
    if (tt.kichBan === 'hinh-thang') {
      const p = tt.hinhThang;
      return { khoang: 10, phiRef: p.PhimMax_Wb, eDanhDinh: (tt.w * p.Phim_Wb) / Math.min(p.tTang_s, p.tGiam_s), ms: false, codinh: true };
    }
    const p = tt.hinhSin;
    return { khoang: 2 / p.f_Hz, phiRef: p.Phim_Wb, eDanhDinh: bienDoSdd(tt.w, p.Phim_Wb, p.f_Hz), ms: true, codinh: true };
  }

  // ---------- Số liệu và chú thích ----------
  let lanSoLieu = 0;
  let eRange = 1;
  const donViE = () => (eRange >= 1 ? { k: 1, ten: 'V' } : { k: 1000, ten: 'mV' });
  const chuE = (e) => { const d = donViE(); return `${soCoNghia(e * d.k)} ${d.ten}`; };
  function veSoLieu(ngay = false) {
    const bayGio = performance.now();
    if (!ngay && bayGio - lanSoLieu < 250) return;
    lanSoLieu = bayGio;
    const { phi, dPhi, e, w } = tt;
    $('#sl-phi').textContent = `${soCoNghia(phi * 1000)} mWb`;
    $('#sl-dphi').textContent = `${soCoNghia(dPhi)} Wb/s`;
    $('#sl-psi').textContent = `${soCoNghia(tuThongMocVong(w, phi))} Wb`;
    $('#sl-e').textContent = chuE(e);
    $('#sl-w').textContent = `${w} vòng`;
    const d = donViE();
    veCongThuc($('#ct-so'),
      `e = -w\\dfrac{d\\phi}{dt} = -${w}\\cdot(${soTex(soCoNghia(dPhi))}) = \\mathbf{${soTex(soCoNghia(e * d.k))}\\ \\text{${d.ten}}}`,
      `e = −w·dφ/dt = −${w}·(${soCoNghia(dPhi)} Wb/s) = <b>${chuE(e)}</b>`);
    if (tt.kichBan === 'hinh-sin') {
      const p = tt.hinhSin;
      const Em = bienDoSdd(w, p.Phim_Wb, p.f_Hz);
      const E = sddHieuDung(w, p.Phim_Wb, p.f_Hz);
      $('#sl-em').textContent = `${soCoNghia(Em)} V`;
      $('#sl-ehd').textContent = `${soCoNghia(E)} V`;
      veCongThuc($('#ct-sin'),
        `E = \\dfrac{E_m}{\\sqrt2} = 4{,}44\\,f\\,w\\,\\Phi_m = 4{,}44\\cdot${p.f_Hz}\\cdot${w}\\cdot${soTex(soCoNghia(p.Phim_Wb))} \\approx \\mathbf{${soTex(soCoNghia(E))}\\ \\text{V}}`,
        `E = Em/√2 = 4,44·f·w·Φm = 4,44·${p.f_Hz}·${w}·${soCoNghia(p.Phim_Wb)} ≈ <b>${soCoNghia(E)} V</b>`);
    }
    // chú thích dưới sân khấu
    const nguong = 0.015 * eRange;
    const tienTo = tt.kichBan === 'hinh-thang'
      ? { tang: 'Dòng điện tăng đều: ', giu: 'Dòng điện giữ không đổi: ', giam: 'Dòng điện giảm đều: ', nghi: 'Dòng điện bằng 0: ' }[tt.giaiDoan] || ''
      : tt.kichBan === 'nam-cham' && Math.abs(e) < nguong ? 'Nam châm đứng yên: ' : '';
    let html;
    let loai = '';
    if (Math.abs(e) < nguong) {
      html = `${tienTo}từ thông φ = ${soCoNghia(phi * 1000)} mWb <b>không biến thiên</b> (dφ/dt ≈ 0) → <b>e ≈ 0</b>: không có sức điện động cảm ứng.`;
    } else if (dPhi > 0) {
      html = `${tienTo}φ đang <b>tăng</b> (dφ/dt > 0) → e = −w·dφ/dt = <b>${chuE(e)} &lt; 0</b>: e <b>ngược chiều dương quy ước</b> (ngược chiều kim đồng hồ); dòng cảm ứng tạo từ thông ⊙ chống lại sự tăng của φ.`;
      loai = 'canh-bao';
    } else {
      html = `${tienTo}φ đang <b>giảm</b> (dφ/dt < 0) → e = −w·dφ/dt = <b>${chuE(e)} &gt; 0</b>: e <b>cùng chiều dương quy ước</b> (chiều kim đồng hồ); dòng cảm ứng tạo từ thông ⊗ chống lại sự giảm của φ.`;
      loai = 'thanh-cong';
    }
    const c = $('#chu-thich-buoc');
    c.className = `chu-thich-buoc ${loai}`;
    c.innerHTML = `<span>${html}</span>`;
    const oTC = $('#tc-so-lieu');
    if (oTC && trinhChieu.idHienTai) oTC.textContent = `φ = ${soCoNghia(phi * 1000)} mWb · dφ/dt = ${soCoNghia(dPhi)} Wb/s · w = ${w} · e = ${chuE(e)}`;
  }

  // ---------- Trình chiếu & câu hỏi ----------
  const apDungTrangThai = (s) => {
    if (!s) return;
    if (s.kichBan && s.kichBan !== tt.kichBan) chonKichBan(s.kichBan);
    if (s.w) datW(s.w);
    if (s.hienQuyUoc !== undefined) { tt.hienQuyUoc = s.hienQuyUoc; oQuyUoc.checked = s.hienQuyUoc; }
    if (s.hienLenz !== undefined) { tt.hienLenz = s.hienLenz; oLenz.checked = s.hienLenz; }
    if (s.tuDong !== undefined && tt.kichBan === 'nam-cham') datTuDong(s.tuDong);
  };
  const trinhChieu = khoiTaoTrinhChieu({
    noiDung: null,
    cacBuocTrinhChieu: nd.trinhChieu,
    lamNoiBat: (id, b) => apDungTrangThai(b?.trangThai),
  });
  khoiTaoCauHoi(cauHoi);
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, select, textarea, dialog')) return;
    if (trinhChieu.xuLyPhim(e)) return;
    if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); datChay(!tt.dangChay); }
  });

  // ---------- Vòng lặp ----------
  let tTruoc = performance.now();
  function khung(bayGio) {
    const dtThuc = Math.min(0.1, Math.max(0, (bayGio - tTruoc) / 1000));
    tTruoc = bayGio;
    const dt = tt.dangChay ? dtThuc * tt.tocDo : 0;
    const ts = thongSoKichBan();
    let tien = 0;
    if (tt.kichBan === 'nam-cham') {
      const nc = tt.namCham;
      tien = nc.dangKeo ? dtThuc : dt;
      if (nc.tuDong && !nc.dangKeo && dt > 0) {
        nc.tTuDong += dt;
        nc.x = X_NAM_CHAM.giua + X_NAM_CHAM.bienDo * Math.sin((2 * Math.PI * nc.tTuDong) / nd.namCham.chuKyTuDong_s);
      }
      const d = NGANG.xCuon - (nc.x + 80);
      tt.phi = tuThongNamCham(d, { Phimax: nd.namCham.Phimax_Wb, d0: nd.namCham.d0_px }, nc.cuc);
      if (tien > 0) tt.dPhi = boDaoHam.capNhat(tt.phi, tien);
      tt.giaiDoan = '';
    } else if (tt.kichBan === 'hinh-thang') {
      tien = dt;
      const p = tt.hinhThang;
      const k = tuThongHinhThang(tt.t + tien, { Phim: p.Phim_Wb, tTang: p.tTang_s, tGiu: p.tGiu_s, tGiam: p.tGiam_s, tNghi: p.tNghi_s });
      tt.phi = k.phi;
      tt.dPhi = k.dPhiDt;
      tt.giaiDoan = k.giaiDoan;
    } else {
      const p = tt.hinhSin;
      tien = dt / p.heSoCham;
      const omega = 2 * Math.PI * p.f_Hz;
      const t = tt.t + tien;
      tt.phi = p.Phim_Wb * Math.sin(omega * t);
      tt.dPhi = omega * p.Phim_Wb * Math.cos(omega * t);
      tt.giaiDoan = '';
    }
    tt.e = sddCamUng(tt.w, tt.dPhi);
    if (tien > 0 || !tt.lichSu.length) {
      tt.t += tien;
      tt.lichSu.push([tt.t, tt.phi, tt.e]);
      while (tt.lichSu.length > 2 && tt.lichSu[0][0] < tt.t - ts.khoang * 1.02) tt.lichSu.shift();
    }
    // Thang đo e: cố định theo lý thuyết (b, c), tự co giãn theo dữ liệu (a)
    const maxE = tt.lichSu.reduce((m, p) => Math.max(m, Math.abs(p[2])), 0);
    eRange = lamTronDep(ts.codinh ? ts.eDanhDinh * 1.1 : Math.max(ts.eDanhDinh, maxE * 1.1));

    // ----- Hình 1.1 -----
    const tiPhi = Math.min(1, Math.abs(tt.phi) / ts.phiRef);
    const soKH = tiPhi * ref.tuThong.length;
    ref.tuThong.forEach((k, i) => k.dat(Math.sign(tt.phi), Math.max(0, Math.min(1, soKH - i))));
    ref.nhanPhi.textContent = `φ = ${soCoNghia(tt.phi * 1000)} mWb`;
    const tiE = Math.min(1.2, Math.abs(tt.e) / eRange);
    ref.lopLenz.style.display = tt.hienLenz ? '' : 'none';
    if (tt.hienLenz) {
      const soL = Math.min(1, tiE) * ref.lenz.length;
      ref.lenz.forEach((k, i) => k.dat(Math.sign(tt.e), Math.max(0, Math.min(1, soL - i))));
    }
    tt.phaMui = (tt.phaMui + dtThuc * (tt.dangChay ? 1.2 * tiE : 0)) % 1;
    datMuiE(ref, tt.phaMui, Math.sign(tt.e), tiE < 0.015 ? 0 : Math.min(1, 0.35 + tiE * 2));
    ref.lopQuyUoc.style.display = tt.hienQuyUoc ? '' : 'none';
    const goc = (Math.max(-1.12, Math.min(1.12, tt.e / eRange)) * 55 * Math.PI) / 180;
    ref.kim.setAttribute('x2', (Number(ref.kim.getAttribute('x1')) + 72 * Math.sin(goc)).toFixed(1));
    ref.kim.setAttribute('y2', (Number(ref.kim.getAttribute('y1')) - 72 * Math.cos(goc)).toFixed(1));
    ref.chuVonKe.textContent = `e = ${chuE(tt.e)}`;
    ref.chiQuaThang.textContent = Math.abs(tt.e) > eRange * 1.12 ? 'quá thang' : '';

    // ----- Nguồn nhìn ngang -----
    if (tt.kichBan === 'nam-cham') ref.namCham.g.setAttribute('transform', `translate(${tt.namCham.x.toFixed(1)} ${NGANG.truc})`);
    if (tt.kichBan === 'hinh-sin') {
      // φ = Φm·sin ωt = Φm·cos(ωt − 90°): góc giữa trục N của nam châm và trục cuộn dây là ωt − 90°
      const gocQuay = (360 * tt.hinhSin.f_Hz * tt.t - 90) % 360;
      ref.namChamQuay.g.setAttribute('transform', `rotate(${gocQuay.toFixed(1)})`);
    }
    if (tt.kichBan === 'hinh-thang') {
      const p = tt.hinhThang;
      // dòng điện tỉ lệ với từ thông; Φmax lớn nhất của thanh trượt ứng với dòng điện cực đại
      const iHienThi = (tt.phi / p.PhimMax_Wb) * p.dongDienMax_A;
      ref.chuDongDien.textContent = `i = ${dinhDangSo(iHienThi, 2)} A`;
      ref.duongSucDien.setAttribute('opacity', (Math.abs(tt.phi) / p.PhimMax_Wb).toFixed(2));
      const coTu = tt.phi > 1e-6;
      ref.cucDienPhai.textContent = coTu ? 'N' : '';
      ref.cucDienTrai.textContent = coTu ? 'S' : '';
    }
    ref.muiTuThong.setAttribute('opacity', (tiPhi < 0.02 ? 0 : 0.35 + 0.65 * tiPhi).toFixed(2));
    ref.thanMuiTT.setAttribute('stroke-width', (3 + 9 * tiPhi).toFixed(1));
    ref.muiTuThong.setAttribute('transform', tt.phi < 0 ? `translate(${2 * 1443} 0) scale(-1 1)` : '');
    ref.chuPhiNgang.setAttribute('opacity', tiPhi < 0.02 ? 0 : 1);
    ref.chuPhiNgang.setAttribute('x', tt.phi < 0 ? 1346 : 1540);

    // ----- Đồ thị -----
    const dinhDangT = (t) => {
      if (Math.abs(t) < 1e-9) return 'bây giờ';
      return ts.ms ? `${dinhDangSo(t * 1000, 0)} ms` : `${dinhDangSo(t, t % 1 ? 1 : 0)} s`;
    };
    ref.tieuDePhi.textContent = 'φ (mWb)';
    ref.tieuDeE.textContent = `e (${donViE().ten})`;
    ref.doThiPhi.capNhat(tt.lichSu.map((p) => [p[0], p[1]]), {
      tCuoi: tt.t, khoang: ts.khoang, yMax: ts.phiRef, dinhDangY: (v) => dinhDangSo(v * 1000, 0), dinhDangT, doDoc: tt.dPhi,
      chuDoDoc: `tiếp tuyến: dφ/dt = ${soCoNghia(tt.dPhi)} Wb/s`,
    });
    const k = donViE().k;
    ref.doThiE.capNhat(tt.lichSu.map((p) => [p[0], p[2]]), {
      tCuoi: tt.t, khoang: ts.khoang, yMax: eRange, dinhDangY: (v) => soCoNghia(v * k, 2), dinhDangT,
    });
    veSoLieu();
    requestAnimationFrame(khung);
  }

  datW(tt.w);
  chonKichBan(tt.kichBan);
  document.body.classList.add('da-san-sang');
  requestAnimationFrame(khung);
}

khoiDong().catch((loi) => {
  console.error(loi);
  const tb = document.querySelector('#thong-bao-loi');
  if (tb) { tb.hidden = false; tb.innerHTML = `<h2>Lỗi khởi động mô phỏng</h2><p>${loi.message}</p>`; }
});
