/**
 * he-thong-dien.js — Trang 1.1 "Hệ thống năng lượng điện": nạp dữ liệu, vòng lặp mô phỏng, tương tác.
 */
import { veSoDo, taoNhan, canChinhNhan, el } from './so-do.js';
import { HatCongSuat, Khoi, SongMBA, TiaLua, capNhatCuaSo, capNhatBauTroi } from './hoat-hinh.js';
import { veDoThiPhuTai, dinhDangGio } from './do-thi.js';
import { tinhHeThong, dinhDangSo } from './tinh-toan.js';
import { taoKichBan } from './kich-ban.js';
import { khoiTaoTrinhChieu } from './trinh-chieu.js';
import { khoiTaoCauHoi } from './kiem-tra.js';

const $ = (s) => document.querySelector(s);

async function napJSON(duongDan) {
  const r = await fetch(duongDan, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${duongDan}: HTTP ${r.status}`);
  return r.json();
}

/** Vị trí nhãn các bộ phận (tọa độ viewBox). */
const NHAN = [
  { id: 'nguon-phat', ma: 'A', x: 190, y: 425 },
  { id: 'mba-tang-ap', x: 395, y: 425 },
  { id: 'duong-day-truyen-tai', ma: 'B', x: 800, y: 108 },
  { id: 'tba-truyen-tai', x: 1275, y: 425 },
  { id: 'tba-phan-phoi', x: 1512, y: 868 },
  { id: 'duong-day-phan-phoi', ma: 'D', x: 735, y: 614 },
  { id: 'thiet-bi-tu-dong', ma: 'E', x: 1322, y: 614, tro: [1412, 700] },
  { id: 'khu-tieu-thu', ma: 'C', x: 1060, y: 868 },
  { id: 'ho-tieu-thu', ma: 'F', x: 330, y: 868 },
];
/** Nhãn cấp điện áp đặt trực tiếp trên đường dây (mã hóa phụ ngoài màu). */
const NHAN_DIEN_AP = [
  { cap: 'truyenTai', x: 670, y: 300, id: 'duong-day-truyen-tai' },
  { cap: 'caoAp', x: 1540, y: 432, id: 'duong-day-truyen-tai' },
  { cap: 'trungAp', x: 1328, y: 740, id: 'duong-day-phan-phoi' },
  { cap: 'haAp', x: 385, y: 696, id: 'duong-day-phan-phoi' },
];

async function khoiDong() {
  let cauHinh, noiDung, cauHoi;
  try {
    [cauHinh, noiDung, cauHoi] = await Promise.all([
      napJSON('du-lieu/cau-hinh.json'), napJSON('du-lieu/bo-phan.json'), napJSON('du-lieu/cau-hoi.json'),
    ]);
  } catch (loi) {
    const tb = $('#thong-bao-loi');
    tb.hidden = false;
    tb.innerHTML = `<h2>Không nạp được dữ liệu</h2><p>${loi.message}</p>
      <p>Trình duyệt chặn đọc file JSON khi mở trực tiếp bằng <code>file://</code>.
      Hãy mở trang qua GitHub Pages hoặc chạy máy chủ cục bộ, ví dụ: <code>npx http-server .</code>
      hoặc <code>python3 -m http.server</code> rồi truy cập <code>http://localhost:8080</code> (xem README).</p>`;
    console.error(loi);
    return;
  }

  const thayBien = (s) => String(s).replace(/\{\{(\w+)\}\}/g, (_, k) => cauHinh.capDienAp[k]?.hienThi ?? `{{${k}}}`);
  const boPhanTheoId = Object.fromEntries(noiDung.boPhan.map((b) => [b.id, b]));
  const svg = $('#so-do');
  const ref = veSoDo(svg, cauHinh);

  // ---------- Nhãn, chú giải, đồ thị phụ tải ----------
  for (const n of NHAN) {
    const b = boPhanTheoId[n.id];
    if (n.tro) el('line', { x1: n.x + 40, y1: n.y + 18, x2: n.tro[0], y2: n.tro[1], class: 'duong-tro', 'data-id': n.id }, ref.lopNhan);
    ref.nhan.push(taoNhan(ref.lopNhan, { x: n.x, y: n.y, chu: b ? b.tenNgan : n.id, ma: n.ma, id: n.id }));
  }
  for (const n of NHAN_DIEN_AP) {
    const c = cauHinh.capDienAp[n.cap];
    const g = taoNhan(ref.lopNhan, { x: n.x, y: n.y, chu: c.hienThi, id: n.id, lopCss: 'nhan-dien-ap' });
    g.querySelector('.nen-nhan').style.fill = c.mau;
    g.dataset.cap = n.cap;
    ref.nhan.push(g);
  }
  veChuGiai(ref.lopNhan, cauHinh);
  const doThi = veDoThiPhuTai(ref.lopNhan, cauHinh.phuTai, (gio) => datGio(gio));

  // ---------- Hoạt hình ----------
  const hat = new HatCongSuat({ matDo: cauHinh.hoatHinh.matDoHat, tocDo: cauHinh.hoatHinh.tocDoHat_px_s });
  for (const [id, d] of Object.entries(ref.duong)) hat.dangKy(id, d);
  const khoi = new Khoi(ref.lopKhoi, ref.khoi);
  const songMBA = new SongMBA(ref.mba);
  const tiaLua = new TiaLua(ref.lopHieuUng);

  const Pmax = Object.fromEntries(cauHinh.phuTai.map((p) => [p.id, p.Pmax_MW]));
  const PmaxTong = cauHinh.phuTai.reduce((s, p) => s + p.Pmax_MW, 0);
  const Pref = PmaxTong * 1.05;

  // ---------- Trạng thái ----------
  const tt = {
    dangChay: true,
    tocDo: 1,
    gio: cauHinh.hoatHinh.gioMacDinh,
    tuChayGio: false,
    chuyenMach: { R: true, LBS1: true, LBS2: true },
    Pthem: {},
    ghiDePhat: null, // kịch bản d: công suất tuabin
    tanSo: null,
    kq: null,
  };

  const ung = {
    cauHinh, noiDung, ref, tt, hat, tiaLua, thayBien, svg,
    datChuThich, datGio, lamNoiBat,
    coDien() {
      const s1 = tt.chuyenMach.R;
      const s2 = s1 && tt.chuyenMach.LBS1;
      const s3 = s2 && tt.chuyenMach.LBS2;
      return { s1, s2, s3 };
    },
  };
  const kichBan = taoKichBan(ung);
  const trinhChieu = khoiTaoTrinhChieu(ung);
  khoiTaoCauHoi(cauHoi);

  // ---------- Điều khiển ----------
  const nutChay = $('#nut-chay');
  const datChay = (chay) => {
    tt.dangChay = chay;
    nutChay.innerHTML = chay ? '<span aria-hidden="true">⏸</span> Tạm dừng' : '<span aria-hidden="true">▶</span> Chạy';
    nutChay.setAttribute('aria-pressed', String(!chay));
    document.body.classList.toggle('tam-dung', !chay);
  };
  nutChay.addEventListener('click', () => datChay(!tt.dangChay));
  const oTocDo = $('#toc-do');
  oTocDo.addEventListener('input', () => {
    tt.tocDo = Number(oTocDo.value);
    $('#gia-tri-toc-do').textContent = `${dinhDangSo(tt.tocDo, tt.tocDo % 1 ? 2 : 0)}×`;
  });
  const oGio = $('#thoi-gian');
  oGio.value = tt.gio;
  oGio.addEventListener('input', () => datGio(Number(oGio.value)));
  $('#tu-chay-gio').addEventListener('change', (e) => { tt.tuChayGio = e.target.checked; });
  function datGio(gio) {
    tt.gio = ((gio % 24) + 24) % 24;
    oGio.value = tt.gio;
    $('#gia-tri-gio').textContent = dinhDangGio(tt.gio);
  }
  datGio(tt.gio);

  $('#chon-kich-ban').addEventListener('change', (e) => kichBan.chon(e.target.value));

  const nutTMH = $('#nut-toan-man-hinh');
  if (!document.fullscreenEnabled) nutTMH.hidden = true;
  nutTMH.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  });
  document.addEventListener('fullscreenchange', () => {
    nutTMH.classList.toggle('dang-bat', !!document.fullscreenElement);
    nutTMH.title = document.fullscreenElement ? 'Thoát toàn màn hình' : 'Toàn màn hình';
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, select, textarea, dialog')) return;
    if (trinhChieu.xuLyPhim(e)) return;
    if (e.key === ' ' && !e.target.closest('button')) {
      e.preventDefault();
      datChay(!tt.dangChay);
    } else if (e.key === 'Escape') {
      dongThongTin();
    }
  });

  // ---------- Rê chuột / chạm / bấm ----------
  const chuGiaiNoi = $('#chu-giai-noi');
  let idDangChi = null;
  const chiVao = (id) => {
    if (idDangChi === id) return;
    if (idDangChi) for (const g of ref.boPhan[idDangChi] || []) g.classList.remove('dang-chi');
    idDangChi = id;
    if (id) for (const g of ref.boPhan[id] || []) g.classList.add('dang-chi');
  };
  const hienChuGiai = (e, dich) => {
    const id = dich.closest('[data-id]')?.dataset.id;
    const b = boPhanTheoId[id];
    if (!b) { anChuGiai(); return; }
    chiVao(id);
    const doan = dich.closest('[data-doan]')?.dataset.doan;
    let them = '';
    if (kichBan.hienTai === 'su-co' && doan && doan !== 's0') them = `<em>Bấm để tạo sự cố ngắn mạch tại ${kichBan.tenDoan(doan)}</em>`;
    chuGiaiNoi.innerHTML = `<strong>${b.ma ? b.ma + '. ' : ''}${b.ten}</strong><span>Cấp điện áp: ${thayBien(b.capDienAp)}</span>${them}`;
    chuGiaiNoi.hidden = false;
    const r = chuGiaiNoi.getBoundingClientRect();
    let x = e.clientX + 16;
    let y = e.clientY + 18;
    if (x + r.width > innerWidth - 8) x = e.clientX - r.width - 12;
    if (y + r.height > innerHeight - 8) y = e.clientY - r.height - 12;
    chuGiaiNoi.style.transform = `translate(${Math.max(4, x)}px, ${Math.max(4, y)}px)`;
  };
  const anChuGiai = () => { chuGiaiNoi.hidden = true; chiVao(null); };
  let henAn;
  svg.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') hienChuGiai(e, e.target); });
  svg.addEventListener('pointerleave', anChuGiai);
  svg.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    hienChuGiai(e, e.target);
    clearTimeout(henAn);
    henAn = setTimeout(anChuGiai, 2200);
  });
  svg.addEventListener('click', (e) => {
    const doan = e.target.closest('[data-doan]')?.dataset.doan;
    if (kichBan.hienTai === 'su-co' && doan && doan !== 's0') {
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
      kichBan.taoSuCo(doan, p.x);
      return;
    }
    const id = e.target.closest('[data-id]')?.dataset.id;
    if (id && boPhanTheoId[id]) moThongTin(id);
  });

  // ---------- Bảng thông tin bộ phận ----------
  const bangTT = $('#bang-thong-tin');
  let idThongTin = null;
  function moThongTin(id) {
    const b = boPhanTheoId[id];
    idThongTin = id;
    bangTT.querySelector('.tieu-de-thong-tin').innerHTML = `${b.ma ? `<span class="huy-hieu-html">${b.ma}</span>` : ''}${b.ten}`;
    bangTT.querySelector('.noi-dung-thong-tin').innerHTML = `
      <p class="dong-dien-ap"><span>Cấp điện áp</span><strong>${thayBien(b.capDienAp)}</strong></p>
      <h3>Chức năng</h3><p>${thayBien(b.chucNang)}</p>
      <h3>Thiết bị chính</h3><ul>${b.thietBiChinh.map((x) => `<li>${thayBien(x)}</li>`).join('')}</ul>
      <h3>Ghi chú thực tế</h3><ul class="ghi-chu">${b.ghiChu.map((x) => `<li>${thayBien(x)}</li>`).join('')}</ul>
      <h3>Số liệu hiện tại</h3><p class="so-lieu-bo-phan" id="so-lieu-bo-phan"></p>`;
    bangTT.hidden = false;
    requestAnimationFrame(() => bangTT.classList.add('mo'));
    capNhatSoLieu(true);
    bangTT.querySelector('.nut-dong').focus({ preventScroll: true });
  }
  function dongThongTin() {
    if (bangTT.hidden) return;
    bangTT.classList.remove('mo');
    idThongTin = null;
    setTimeout(() => { if (!idThongTin) bangTT.hidden = true; }, 250);
  }
  bangTT.querySelector('.nut-dong').addEventListener('click', dongThongTin);
  ung.dongThongTin = dongThongTin;

  // ---------- Chú thích dưới sơ đồ ----------
  // Kịch bản có chú thích riêng (từng bước sự cố…); nếu không, hiện tóm tắt trạng thái hệ thống.
  let coChuThichRieng = false;
  function datChuThich(html, loai = '') {
    const c = $('#chu-thich-buoc');
    coChuThichRieng = !!html;
    c.className = `chu-thich-buoc ${loai}`;
    if (html) c.innerHTML = `<span>${html}</span>`;
    else capNhatSoLieu(true);
  }
  function chuThichTomTat(kq, Pphat) {
    const c = $('#chu-thich-buoc');
    const html = `<span><b>${dinhDangGio(tt.gio)}</b> · Phụ tải <b>${dinhDangSo(kq.P_tai, 1)} MW</b> · Nhà máy phát <b>${dinhDangSo(Pphat, 1)} MW</b> · Tổn thất truyền tải <b>${dinhDangSo(kq.phanTramTonThatTT, 2)} %</b>. <span class="chu-mo">Rê chuột/chạm vào bộ phận để xem cấp điện áp, bấm để xem chi tiết.</span></span>`;
    if (c.innerHTML !== html) c.innerHTML = html;
  }

  function lamNoiBat(id) {
    svg.classList.toggle('dang-lam-noi', !!id);
    svg.querySelectorAll('.noi-bat').forEach((e) => e.classList.remove('noi-bat'));
    if (!id) return;
    const ds = [...svg.querySelectorAll(`[data-id="${id}"]`)];
    ds.forEach((e) => e.classList.add('noi-bat'));
    // Trên màn hình hẹp (sơ đồ cuộn ngang): cuộn tới bộ phận đang được làm nổi bật
    const cuon = $('#cuon-so-do');
    if (cuon.scrollWidth > cuon.clientWidth + 4) {
      const hop = ds.filter((e) => e.classList.contains('bo-phan')).map((e) => e.getBoundingClientRect());
      if (hop.length) {
        const trai = Math.min(...hop.map((r) => r.left));
        const phai = Math.max(...hop.map((r) => r.right));
        const goc = cuon.getBoundingClientRect().left;
        cuon.scrollTo({ left: cuon.scrollLeft + (trai + phai) / 2 - goc - cuon.clientWidth / 2, behavior: 'smooth' });
      }
    }
  }

  // ---------- Bảng số liệu trực tiếp ----------
  let lanCapNhatCuoi = 0;
  const datText = (sel, txt) => { const e = $(sel); if (e && e.textContent !== txt) e.textContent = txt; };
  function capNhatSoLieu(ngay = false) {
    const bayGio = performance.now();
    if (!ngay && bayGio - lanCapNhatCuoi < 200) return;
    lanCapNhatCuoi = bayGio;
    const kq = tt.kq;
    if (!kq) return;
    const Pphat = tt.ghiDePhat ?? kq.P_phat;
    datText('#sl-gio', dinhDangGio(tt.gio));
    datText('#sl-p-phat', `${dinhDangSo(Pphat, 1)} MW`);
    datText('#sl-i-tt', `${dinhDangSo(kq.I_tt, 0)} A`);
    datText('#sl-dp-tt', `${dinhDangSo(kq.dP_tt, 2)} MW (${dinhDangSo(kq.phanTramTonThatTT, 2)} %)`);
    datText('#sl-eta-tt', `${dinhDangSo(kq.hieuSuatTT * 100, 2)} %`);
    datText('#sl-dp-pp', `${dinhDangSo(kq.dP_pp, 2)} MW`);
    datText('#sl-p-tai', `${dinhDangSo(kq.P_tai, 1)} MW`);
    datText('#sl-eta-tong', kq.P_phat > 0 ? `${dinhDangSo(kq.hieuSuatTong * 100, 2)} %` : '—');
    datText('#sl-u-tt', cauHinh.capDienAp[cauHinh.truyenTai.capDienAp].hienThi);
    for (const p of cauHinh.phuTai) {
      const P = kq.tai[p.id];
      datText(`#sl-tai-${p.id}`, P > 0 ? `${dinhDangSo(P, 1)} MW` : 'Mất điện');
      const thanh = $(`#thanh-${p.id}`);
      if (thanh) {
        const PmaxThanh = p.Pmax_MW + (cauHinh.kichBanTangTai.khuVuc === p.id ? cauHinh.kichBanTangTai.deltaP_MW : 0);
        thanh.style.width = `${Math.min(100, (P / PmaxThanh) * 100)}%`;
        thanh.parentElement.classList.toggle('mat-dien', !(P > 0));
      }
    }
    $('#hang-tan-so').hidden = !tt.tanSo;
    if (tt.tanSo) datText('#sl-tan-so', `${dinhDangSo(tt.tanSo.f, 2)} Hz`);
    $('#hang-p-yeu-cau').hidden = tt.ghiDePhat == null;
    if (tt.ghiDePhat != null) datText('#sl-p-yeu-cau', `${dinhDangSo(kq.P_phat, 1)} MW`);
    if (idThongTin) {
      const o = $('#so-lieu-bo-phan');
      if (o) o.textContent = soLieuBoPhan(idThongTin, kq, Pphat);
    }
    if (!coChuThichRieng) chuThichTomTat(kq, Pphat);
    const oTC = $('#tc-so-lieu');
    if (oTC && trinhChieu.idHienTai) oTC.textContent = soLieuBoPhan(trinhChieu.idHienTai, kq, Pphat);
    doThi.capNhat(tt.gio, kq.P_tai);
  }

  function soLieuBoPhan(id, kq, Pphat) {
    const mw = (x, s = 1) => `${dinhDangSo(x, s)} MW`;
    const ten = Object.fromEntries(cauHinh.phuTai.map((p) => [p.id, p.ten]));
    switch (id) {
      case 'nguon-phat': return `Công suất phát: ${mw(Pphat)}`;
      case 'mba-tang-ap': return `Công suất qua MBA: ${mw(kq.P_phat)}`;
      case 'duong-day-truyen-tai': return `Dòng điện ${dinhDangSo(kq.I_tt, 0)} A; tổn thất ${mw(kq.dP_tt, 2)} (${dinhDangSo(kq.phanTramTonThatTT, 2)} %); hiệu suất ${dinhDangSo(kq.hieuSuatTT * 100, 2)} %`;
      case 'tba-truyen-tai':
      case 'tba-phan-phoi': return `Công suất qua trạm: ${mw(kq.P_nhan)}`;
      case 'duong-day-phan-phoi': return `Tổn thất lưới phân phối (ước tính): ${mw(kq.dP_pp, 2)}`;
      case 'thiet-bi-tu-dong': {
        const ts = (b) => (b ? 'Đóng' : 'Mở');
        return `Recloser: ${ts(tt.chuyenMach.R)} · LBS1: ${ts(tt.chuyenMach.LBS1)} · LBS2: ${ts(tt.chuyenMach.LBS2)}`;
      }
      case 'khu-tieu-thu': return `${ten['cong-nghiep']}: ${mw(kq.tai['cong-nghiep'])} · ${ten['toa-nha']}: ${mw(kq.tai['toa-nha'])}`;
      case 'ho-tieu-thu': return `${ten['dan-cu']}: ${mw(kq.tai['dan-cu'])}`;
      default: return '';
    }
  }

  // ---------- Vòng lặp mô phỏng ----------
  let tTruoc = performance.now();
  let gocTuabin = 0;
  function khung(bayGio) {
    const dtThuc = Math.min(0.1, Math.max(0, (bayGio - tTruoc) / 1000));
    tTruoc = bayGio;
    const dt = tt.dangChay ? dtThuc * tt.tocDo : 0;
    if (tt.tuChayGio && dt > 0) datGio(tt.gio + dt / cauHinh.hoatHinh.giayThucMoiGio);

    kichBan.capNhat(dt);
    const cd = ung.coDien();
    const coDien = { 'cong-nghiep': cd.s1, 'toa-nha': cd.s2, 'dan-cu': cd.s3 };
    const kq = tinhHeThong(cauHinh, { gio: tt.gio, coDien, Pthem: tt.Pthem });
    tt.kq = kq;
    kichBan.sauTinhToan(dt, kq);
    const Pphat = tt.ghiDePhat ?? kq.P_phat;
    const tai = kq.tai;
    const PmaxC1 = Pmax['cong-nghiep'] + (tt.Pthem['cong-nghiep'] || 0);

    // Hạt công suất: các đường trục dùng chung thang đo để thấy công suất giảm dần về cuối lưới
    const tuyen = tai['cong-nghiep'] + tai['toa-nha'] + tai['dan-cu'];
    hat.datTiLe('phat', Pphat / Pref);
    if (!kichBan.ghiDeTruyenTai) hat.datTiLe('truyen-tai', Pphat / Pref);
    hat.datTiLe('cao-ap', kq.P_nhan / Pref);
    hat.datTiLe('s0', tuyen / Pref);
    hat.datTiLe('s1', cd.s1 ? tuyen / Pref : 0);
    hat.datTiLe('s2', cd.s2 ? (tai['toa-nha'] + tai['dan-cu']) / Pref : 0);
    hat.datTiLe('s3', cd.s3 ? tai['dan-cu'] / Pref : 0);
    hat.datTiLe('re-cong-nghiep', tai['cong-nghiep'] / Pmax['cong-nghiep']);
    hat.datTiLe('re-toa-nha', tai['toa-nha'] / Pmax['toa-nha']);
    hat.datTiLe('ha-ap', tai['dan-cu'] / Pmax['dan-cu']);
    hat.datTiLe('vao-nha', (tai['dan-cu'] / Pmax['dan-cu']) * 0.8);
    hat.capNhat(dt);

    // Đường dây mất điện → xám, nét đứt
    const matDien = { s1: !cd.s1, s2: !cd.s2, s3: !cd.s3, 're-cong-nghiep': !cd.s1, 're-toa-nha': !cd.s2, 'ha-ap': !cd.s3, 'vao-nha': !cd.s3 };
    for (const [id, md] of Object.entries(matDien)) {
      for (const p of ref.duong[id].paths) p.classList.toggle('mat-dien', md);
    }
    for (const [id, tb] of Object.entries(ref.thietBi)) {
      tb.den.classList.toggle('dong', tt.chuyenMach[id]);
      tb.den.classList.toggle('mo', !tt.chuyenMach[id]);
      tb.hop.classList.toggle('dang-mo', !tt.chuyenMach[id]);
    }

    // Tuabin, khói, MBA, đèn
    gocTuabin = (gocTuabin + dt * (60 + 600 * (Pphat / Pref))) % 360;
    ref.tuabin.setAttribute('transform', `rotate(${gocTuabin.toFixed(1)})`);
    khoi.datMuc('khoi', Pphat / Pref);
    khoi.datMuc('hoi', Pphat / Pref);
    khoi.datMuc('khoi-nho', tai['cong-nghiep'] / PmaxC1);
    khoi.capNhat(dt);
    songMBA.datTai('mba-tang-ap', Pphat / Pref);
    songMBA.datTai('tba-truyen-tai', kq.P_nhan / Pref);
    songMBA.datTai('tba-phan-phoi', kq.P_nhan / Pref);
    songMBA.datTai('mba-cong-nghiep', tai['cong-nghiep'] / PmaxC1);
    songMBA.datTai('mba-toa-nha', tai['toa-nha'] / Pmax['toa-nha']);
    songMBA.datTai('mba-treo-cot', tai['dan-cu'] / Pmax['dan-cu']);
    songMBA.capNhat(dt);
    for (const id of Object.keys(ref.cuaSo)) {
      const muc = id === 'cong-nghiep' ? tai[id] / PmaxC1 : tai[id] / Pmax[id];
      capNhatCuaSo(ref.cuaSo[id], muc);
    }
    capNhatBauTroi(ref, tt.gio);
    if (tt.dangChay) tiaLua.capNhat();
    capNhatSoLieu();
    requestAnimationFrame(khung);
  }

  // Căn lại nền nhãn sau khi phông chữ tải xong (độ rộng chữ có thể thay đổi)
  document.fonts?.ready.then(() => ref.nhan.forEach(canChinhNhan));
  kichBan.chon($('#chon-kich-ban').value || 'binh-thuong');
  document.body.classList.add('da-san-sang');
  requestAnimationFrame(khung);
}

function veChuGiai(lop, cauHinh) {
  const g = el('g', { class: 'chu-giai', transform: 'translate(24 458)' }, lop);
  const cap = ['phat', 'truyenTai', 'caoAp', 'trungAp', 'haAp'];
  const doDay = { phat: 5, truyenTai: 3.2, caoAp: 2.8, trungAp: 2.4, haAp: 2 };
  const cao = 44 + cap.length * 26 + 30;
  const nen = el('rect', { x: 0, y: 0, width: 352, height: cao, rx: 12, class: 'nen-chu-giai' }, g);
  el('text', { x: 14, y: 26, class: 'tieu-de-chu-giai' }, g).textContent = 'Chú giải cấp điện áp';
  cap.forEach((k, i) => {
    const c = cauHinh.capDienAp[k];
    const y = 50 + i * 26;
    el('line', { x1: 16, x2: 58, y1: y, y2: y, stroke: c.mau, 'stroke-width': doDay[k], 'stroke-linecap': 'round' }, g);
    const t = el('text', { x: 70, y: y + 5, class: 'chu-chu-giai' }, g);
    el('tspan', { 'font-weight': 700 }, t).textContent = c.hienThi;
    el('tspan', {}, t).textContent = ` – ${c.ten}`;
  });
  const y = 50 + cap.length * 26;
  el('circle', { cx: 37, cy: y, r: 4, class: 'hat', stroke: '#888' }, g);
  el('text', { x: 70, y: y + 5, class: 'chu-chu-giai' }, g).textContent = 'Hạt sáng: dòng công suất (∝ P)';
  const coGian = () => {
    const rong = Math.max(...[...g.querySelectorAll('text')].map((t) => t.getBBox().x + t.getBBox().width));
    nen.setAttribute('width', Math.ceil(rong + 16));
  };
  coGian();
  document.fonts?.ready.then(coGian);
}

khoiDong().catch((loi) => {
  console.error(loi);
  const tb = document.querySelector('#thong-bao-loi');
  if (tb) { tb.hidden = false; tb.innerHTML = `<h2>Lỗi khởi động mô phỏng</h2><p>${loi.message}</p>`; }
});
