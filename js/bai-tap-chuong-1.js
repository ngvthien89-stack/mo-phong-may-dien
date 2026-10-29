/**
 * bai-tap-chuong-1.js — Trang VI "Một số bài tập" (slide 77–84): lời giải từng bước, đổi số liệu đề,
 * đối chiếu kết quả slide, hình minh họa cho từng bài.
 */
import { el } from './so-do.js';
import { $, napBai, dieuKhienChung, trinhChieuVaCauHoi, vongLap, chayTrang, hienKichBan } from './khung-trang.js';
import { taoMarker, veThe, veTruc, duongGap, veDienTro, veCuonCam } from './hinh-mba.js';
import { giaiBT1, giaiBT2, giaiBT3, giaiBT4 } from './bai-tap.js';
import { hieuSuat, betaToiUu } from './che-do.js';
import { phanBoTai } from './song-song.js';
import { dinhDangSo } from './tinh-toan.js';
import { soCoNghia } from './tien-ich.js';

const GIAI = { bt1: giaiBT1, bt2: giaiBT2, bt3: giaiBT3, bt4: giaiBT4 };
const so = (x) => {
  if (Math.abs(x) > 0 && Math.abs(x) < 0.01) return `${soCoNghia(x * 1000, 3)}·10⁻³`;
  return soCoNghia(x, 4);
};

/** Hai giá trị coi như khớp nếu sai lệch tương đối không quá 0,3 %. */
function khop(giaTri, chuoiSlide) {
  if (!chuoiSlide) return true;
  const m = chuoiSlide.replace(/\s/g, '').replace(/\.(?=\d{3})/g, '').replace('·10⁻³', 'e-3').replace(',', '.').match(/[-\d.e]+/);
  if (!m) return true;
  const v = Number(m[0]);
  return Math.abs(v - giaTri) <= Math.abs(giaTri) * 0.003;
}

function veSanKhau(svg, nd) {
  svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  taoMarker(defs, 'mui-den', '#13202b');
  el('rect', { x: -2000, y: -1200, width: 5600, height: 3300, class: 'nen-san-khau' }, svg);
  const r = {};
  for (const b of nd.baiTap) {
    const g = el('g', {}, svg);
    const c1 = veThe(g, 20, 20, 1000, 870, `${b.ten} (slide ${b.slide})`);
    const de = el('foreignObject', { x: 40, y: 72, width: 960, height: 120 }, c1);
    const bang = el('foreignObject', { x: 40, y: 196, width: 960, height: 680 }, c1);
    const c2 = veThe(g, 1040, 20, 540, 870, 'Minh họa');
    const hinh = el('g', {}, c2);
    r[b.id] = { g, de, bang, hinh };
  }
  return r;
}

async function khoiDong() {
  const kq = await napBai('du-lieu/bai-tap-chuong-1.json', 'du-lieu/cau-hoi-bai-tap-chuong-1.json');
  if (!kq) return;
  const [nd, cauHoi] = kq;
  const svg = $('#so-do');
  const r = veSanKhau(svg, nd);
  const s = { kichBan: nd.macDinh.kichBan, dangChay: true, tocDo: 1, t: 0, buoc: {}, ts: {} };
  for (const b of nd.baiTap) { s.buoc[b.id] = 1; s.ts[b.id] = { ...b.thamSo }; }
  const { datChay, chuThich, soLieuTC } = dieuKhienChung(s, (id) => chonKichBan(id));

  const lt = nd.lyThuyet;
  $('#the-ly-thuyet').innerHTML = `
    <p class="muc-nho">Chương 1. Máy biến áp</p>
    <h2>${lt.muc}</h2>
    <p class="dong-ly-thuyet">${lt.gioiThieu}</p>
    <p class="dong-ly-thuyet"><b>Công thức cần dùng:</b></p>
    <ul class="ghi-chu-ly-thuyet">${lt.congThucLienQuan.map((x) => `<li>${x}</li>`).join('')}</ul>
    <p class="ghi-chu-nho">Danh sách các điểm khác slide: xem <code>docs/lo-trinh-chuong-1.md</code> (mục ghi chú rà soát).</p>`;

  const bai = () => nd.baiTap.find((b) => b.id === s.kichBan);
  const laSlideGoc = (b) => Object.entries(b.thamSo).every(([k, v]) => s.ts[b.id][k] === v);

  function capNhat() {
    const b = bai();
    const o = r[b.id];
    const goc = laSlideGoc(b);
    const ds = GIAI[b.id](s.ts[b.id], goc ? b.dapAnSlide : {});
    const n = Math.min(ds.length, s.buoc[b.id]);
    o.de.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" class="de-bai"><b>Đề bài.</b> ${b.deBai}${goc ? '' : ' <span class="da-doi">(đã đổi số liệu)</span>'}</div>`;
    const dong = ds.slice(0, n).map((x, i) => {
      const lech = goc && x.slide && !khop(x.giaTri, x.slide);
      return `<tr class="${lech ? 'lech' : ''} ${i === n - 1 ? 'moi' : ''}">
        <td>${i + 1}</td><td><b>${x.ten}</b><br><span class="ct">${x.congThuc}</span></td>
        <td class="so">${so(x.giaTri)}${x.donVi ? ` ${x.donVi}` : ''}</td>
        <td class="so">${goc ? x.slide || '' : '—'}</td></tr>
        ${lech && x.ghiChu ? `<tr class="ghi-chu-lech"><td></td><td colspan="3">⚠ ${x.ghiChu}</td></tr>` : ''}`;
    }).join('');
    o.bang.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" class="loi-giai">
      <table><thead><tr><th>#</th><th>Bước</th><th>Kết quả</th><th>Slide</th></tr></thead><tbody>${dong}</tbody></table>
      ${n < ds.length ? `<p class="con-lai">Còn ${ds.length - n} bước – bấm "Bước tiếp" (hoặc phím →/Space trong trình chiếu).</p>` : '<p class="xong">✓ Hoàn thành lời giải.</p>'}</div>`;
    const cuon = o.bang.querySelector('.loi-giai');
    if (cuon) cuon.scrollTop = cuon.scrollHeight;
    veHinh(b.id, ds, n);
    $('#sl-1').textContent = `${n}/${ds.length}`;
    const cuoi = ds[n - 1];
    $('#sl-2').textContent = `${so(cuoi.giaTri)}${cuoi.donVi ? ` ${cuoi.donVi}` : ''}`;
    $('#sl-3').textContent = ds.slice(0, n).filter((x) => goc && x.slide && !khop(x.giaTri, x.slide)).length;
    chuThich(`<b>Bước ${n}. ${cuoi.ten}:</b> ${cuoi.congThuc} = <b>${so(cuoi.giaTri)}${cuoi.donVi ? ` ${cuoi.donVi}` : ''}</b>${goc && cuoi.slide ? ` (slide: ${cuoi.slide})` : ''}.`);
    soLieuTC(`${b.ten} – bước ${n}/${ds.length}: ${cuoi.ten} = ${so(cuoi.giaTri)} ${cuoi.donVi}`);
    const nut = $('#bt-tiep');
    if (nut) { nut.disabled = n >= ds.length; $('#bt-lui').disabled = n <= 1; }
  }

  // ---------- Hình minh họa cho từng bài ----------
  function veHinh(id, ds, n) {
    const g = r[id].hinh;
    g.innerHTML = '';
    const t = s.ts[id];
    if (id === 'bt1') {
      // Δ sơ cấp và Y thứ cấp: điện áp pha, dây
      const tamGiac = [[1310, 120], [1180, 340], [1440, 340]];
      el('path', { d: `${duongGap(tamGiac)} Z`, class: 'tam-giac-u' }, g);
      tamGiac.forEach(([x, y], k) => el('text', { x, y: y + (k ? 28 : -10), class: 'nhan-dai-luong', 'text-anchor': 'middle' }, g).textContent = 'ABC'[k]);
      el('text', { x: 1310, y: 400, class: 'chu-svg dam', 'text-anchor': 'middle' }, g).textContent = `Sơ cấp Δ: Up1 = Ud1 = ${so(ds[0].giaTri)} kV`;
      const O = [1310, 600];
      for (let k = 0; k < 3; k++) {
        const a = ((90 - 120 * k) * Math.PI) / 180;
        el('line', { x1: O[0], y1: O[1], x2: O[0] + 110 * Math.cos(a), y2: O[1] - 110 * Math.sin(a), class: 'vec', stroke: ['#e6a700', '#2e9e4f', '#d62828'][k], 'marker-end': 'url(#mui-den)' }, g);
        el('text', { x: O[0] + 135 * Math.cos(a), y: O[1] - 135 * Math.sin(a) + 7, class: 'nhan-dai-luong', 'text-anchor': 'middle' }, g).textContent = 'abc'[k];
      }
      el('text', { x: 1310, y: 780, class: 'chu-svg dam', 'text-anchor': 'middle' }, g).textContent = n >= 2 ? `Thứ cấp Y₀: Up2 = ${dinhDangSo(t.U2_kV, 1)}/√3 = ${so(ds[1].giaTri)} kV` : 'Thứ cấp Y₀: Up2 = ?';
      el('text', { x: 1310, y: 840, class: 'chu-kq dam', 'text-anchor': 'middle' }, g).textContent = n >= 3 ? `kp = ${so(ds[2].giaTri)}` : '';
    } else if (id === 'bt2') {
      const S = t.S_kVA * 1000;
      const tr = veTruc(g, { x0: 1110, x1: 1560, y0: 120, y1: 500, xMin: 0, xMax: 1.2, yMin: 0, yMax: 1.2 * t.Pn_W }, {
        nhanX: [[0, '0'], [0.4, '0,4'], [0.8, '0,8'], [1.2, '1,2 β']], nhanY: [[0, '0'], [t.Pn_W / 2, `${dinhDangSo(t.Pn_W / 2000, 1)} kW`], [t.Pn_W, `${dinhDangSo(t.Pn_W / 1000, 1)} kW`]],
      });
      const dsB = Array.from({ length: 49 }, (_, i) => i * 0.025);
      el('path', { d: duongGap(dsB.map((b) => [tr.X(b), tr.Y(t.P0_W)])), class: 'duong-dt', stroke: '#7b2cbf' }, g);
      el('path', { d: duongGap(dsB.map((b) => [tr.X(b), tr.Y(Math.min(1.2 * t.Pn_W, b * b * t.Pn_W))])), class: 'duong-dt', stroke: '#eb6834' }, g);
      el('text', { x: 1560, y: tr.Y(t.P0_W) - 8, class: 'chu-truc-dt', 'text-anchor': 'end' }, g).textContent = 'pFe ≈ P₀';
      el('text', { x: 1440, y: 160, class: 'chu-truc-dt' }, g).textContent = 'pCu = β²Pn';
      const bMax = betaToiUu(t.P0_W, t.Pn_W);
      if (n >= 2) el('circle', { cx: tr.X(ds[1].giaTri), cy: tr.Y(ds[2].giaTri), r: 7, fill: '#eb6834', class: 'cham-dt' }, g);
      if (n >= 5) {
        el('line', { x1: tr.X(bMax), x2: tr.X(bMax), y1: 120, y2: 500, class: 'duong-cham' }, g);
        el('text', { x: tr.X(bMax), y: 112, class: 'chu-svg dam', 'text-anchor': 'middle' }, g).textContent = `β = ${so(bMax)}`;
        el('line', { x1: tr.X(0.294), x2: tr.X(0.294), y1: 120, y2: 500, stroke: '#c62828', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, g);
        el('text', { x: tr.X(0.294) - 6, y: 150, class: 'chu-truc-dt', fill: '#c62828', 'text-anchor': 'end' }, g).textContent = '0,294 (slide)';
      }
      const tr2 = veTruc(g, { x0: 1110, x1: 1560, y0: 600, y1: 840, xMin: 0, xMax: 1.2, yMin: 96, yMax: 99.5 }, { nhanX: [[0, '0'], [0.4, '0,4'], [0.8, '0,8'], [1.2, '1,2 β']], nhanY: [[96, '96'], [98, '98'], [99.5, '99,5 %']] });
      el('path', { d: duongGap(dsB.slice(1).map((b) => [tr2.X(b), tr2.Y(Math.max(96, hieuSuat(b, S, 1, t.P0_W, t.Pn_W).eta))])), class: 'duong-dt', stroke: '#2e7d32' }, g);
      el('text', { x: 1110, y: 590, class: 'chu-truc-dt' }, g).textContent = 'η% (cosφ₂ = 1, minh họa)';
      if (n >= 5) el('circle', { cx: tr2.X(bMax), cy: tr2.Y(hieuSuat(bMax, S, 1, t.P0_W, t.Pn_W).eta), r: 7, fill: '#2e7d32', class: 'cham-dt' }, g);
    } else if (id === 'bt3') {
      const may = [{ Sdm: t.S1_kVA, un: t.un1 }, { Sdm: t.S2_kVA, un: t.un2 }];
      const pb = phanBoTai(t.Stai_kVA, may);
      const mau = ['#2a78d6', '#eb6834'];
      pb.forEach((m, k) => {
        const x = 1140 + k * 220;
        const h = 300;
        el('rect', { x, y: 160, width: 120, height: h, rx: 8, class: 'o-gia-tri' }, g);
        const hien = n >= (k ? 5 : 3);
        el('rect', { x, y: 160 + h * (1 - Math.min(1.2, m.beta) / 1.2), width: 120, height: hien ? h * Math.min(1.2, m.beta) / 1.2 : 0, rx: 8, fill: mau[k], opacity: 0.8 }, g);
        el('line', { x1: x - 10, x2: x + 130, y1: 160 + h * (1 - 1 / 1.2), y2: 160 + h * (1 - 1 / 1.2), stroke: '#c62828', 'stroke-dasharray': '6 4', 'stroke-width': 2 }, g);
        el('text', { x: x + 60, y: 500, class: 'chu-svg dam', 'text-anchor': 'middle' }, g).textContent = `Máy ${k + 1}: ${dinhDangSo(may[k].Sdm, 0)} kVA`;
        el('text', { x: x + 60, y: 528, class: 'chu-svg', 'text-anchor': 'middle' }, g).textContent = `un = ${dinhDangSo(may[k].un, 1)} %`;
        el('text', { x: x + 60, y: 140, class: 'chu-kq dam', 'text-anchor': 'middle' }, g).textContent = hien ? `β = ${so(m.beta)}` : 'β = ?';
      });
      el('text', { x: 1064, y: 600, class: 'chu-svg' }, g).textContent = 'Vạch đỏ: β = 1 (định mức).';
      el('text', { x: 1064, y: 640, class: 'chu-svg' }, g).textContent = `Tải: ${dinhDangSo(t.Stai_kVA, 0)} kVA; máy un nhỏ hơn mang tải nặng hơn.`;
    } else {
      // sơ đồ thay thế với các giá trị đã tính
      const T = 250;
      const B = 560;
      el('path', { d: `M1070 ${T} H1100 M1146 ${T} H1170 M1216 ${T} H1300 M1300 ${T} V300 M1300 346 V370 M1300 416 V${B} M1300 ${T} H1360 M1406 ${T} H1430 M1476 ${T} H1550 V${B} H1070`, class: 'day-mach' }, g);
      veDienTro(g, 1100, T, 46);
      veCuonCam(g, 1170, T, 46);
      veDienTro(g, 1300, 300, 46, true);
      veCuonCam(g, 1300, 370, 46, true);
      veDienTro(g, 1360, T, 46);
      veCuonCam(g, 1430, T, 46);
      const v = (i) => (n > i ? `${so(ds[i].giaTri)} Ω` : '?');
      el('text', { x: 1123, y: T - 44, class: 'nhan-lk', 'text-anchor': 'middle' }, g).textContent = `R₁ = ${v(3)}`;
      el('text', { x: 1193, y: T - 18, class: 'nhan-lk', 'text-anchor': 'middle' }, g).textContent = `X₁ = ${v(7)}`;
      el('text', { x: 1383, y: T - 44, class: 'nhan-lk', 'text-anchor': 'middle' }, g).textContent = `R′₂ = ${v(3)}`;
      el('text', { x: 1453, y: T - 18, class: 'nhan-lk', 'text-anchor': 'middle' }, g).textContent = `X′₂ = ${v(7)}`;
      el('text', { x: 1320, y: 330, class: 'nhan-lk' }, g).textContent = `Rth ≈ ${n > 12 ? `${dinhDangSo(ds[12].giaTri, 0)} Ω` : '?'}`;
      el('text', { x: 1320, y: 400, class: 'nhan-lk' }, g).textContent = `Xth ≈ ${n > 14 ? `${dinhDangSo(ds[14].giaTri, 0)} Ω` : '?'}`;
      el('text', { x: 1064, y: 640, class: 'chu-svg' }, g).textContent = 'Một pha, quy đổi về sơ cấp.';
      el('text', { x: 1064, y: 680, class: 'chu-svg' }, g).textContent = n > 9 ? `Thứ cấp thực: R₂ = ${so(ds[9].giaTri)} Ω` : '';
      el('text', { x: 1064, y: 716, class: 'chu-svg' }, g).textContent = n > 10 ? `X₂ = ${so(ds[10].giaTri)} Ω` : '';
      el('text', { x: 1064, y: 780, class: 'chu-kq dam' }, g).textContent = n > 15 ? `cosφ₀ = ${so(ds[15].giaTri)}` : '';
    }
  }

  // ---------- Điều khiển ----------
  function chonKichBan(id) {
    s.kichBan = id;
    hienKichBan(id, Object.fromEntries(Object.entries(r).map(([k, o]) => [k, o.g])));
    veDieuKhien();
    capNhat();
  }
  const NHAN = {
    S_kVA: ['S (kVA)', 100, 2000, 10], U1_kV: ['U₁ (kV)', 6, 35, 1], U2_kV: ['U₂ (kV)', 0.2, 1, 0.01], Itai_A: ['I tải (A)', 50, 1200, 10],
    P0_W: ['P₀ (W)', 200, 3000, 10], Pn_W: ['Pn (W)', 1000, 12000, 100], i0: ['I₀% (%)', 0.5, 5, 0.1], un: ['un% (%)', 3, 8, 0.1],
    S1_kVA: ['Sđm1 (kVA)', 250, 2500, 50], un1: ['un1 (%)', 3, 8, 0.1], S2_kVA: ['Sđm2 (kVA)', 250, 2500, 50], un2: ['un2 (%)', 3, 8, 0.1], Stai_kVA: ['S tải (kVA)', 200, 3000, 50],
  };
  function veDieuKhien() {
    const b = bai();
    const t = s.ts[b.id];
    const truot = Object.keys(t).filter((k) => NHAN[k]).map((k) => {
      const [ten, min, max, buoc] = NHAN[k];
      return `<label class="dieu-khien doc"><span>${ten}</span> <input type="range" data-ts="${k}" min="${min}" max="${max}" step="${buoc}" value="${t[k]}"><output data-ts-gt="${k}">${dinhDangSo(t[k], buoc < 1 ? 2 : 0)}</output></label>`;
    }).join('');
    $('#dieu-khien-kich-ban').innerHTML = `
      <div class="hang-nut">
        <button type="button" class="nut" id="bt-lui">◀ Bước trước</button>
        <button type="button" class="nut nut-chinh" id="bt-tiep">Bước tiếp ▶</button>
        <button type="button" class="nut" id="bt-het">Hiện toàn bộ</button>
      </div>
      <p class="mo-ta" style="margin-top:10px">Đổi số liệu đề để luyện tập:</p>
      ${truot}
      <div class="hang-nut"><button type="button" class="nut" id="bt-goc">↺ Số liệu slide</button></div>`;
    $('#bt-tiep').addEventListener('click', () => { s.buoc[b.id] += 1; capNhat(); });
    $('#bt-lui').addEventListener('click', () => { s.buoc[b.id] = Math.max(1, s.buoc[b.id] - 1); capNhat(); });
    $('#bt-het').addEventListener('click', () => { s.buoc[b.id] = 99; capNhat(); });
    $('#bt-goc').addEventListener('click', () => { s.ts[b.id] = { ...b.thamSo }; veDieuKhien(); capNhat(); });
    document.querySelectorAll('[data-ts]').forEach((o) => o.addEventListener('input', () => {
      const k = o.dataset.ts;
      t[k] = Number(o.value);
      document.querySelector(`[data-ts-gt="${k}"]`).textContent = dinhDangSo(t[k], NHAN[k][3] < 1 ? 2 : 0);
      capNhat();
    }));
  }

  trinhChieuVaCauHoi(nd, cauHoi, (id, b) => {
    const tt = b?.trangThai;
    if (!tt) return;
    if (tt.buoc) s.buoc[tt.kichBan] = tt.buoc;
    chonKichBan(tt.kichBan);
  }, datChay, s);
  vongLap(s, () => {});

  chonKichBan(s.kichBan);
  document.body.classList.add('da-san-sang');
}

chayTrang(khoiDong);
