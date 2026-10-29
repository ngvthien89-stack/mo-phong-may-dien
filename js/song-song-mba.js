/**
 * song-song-mba.js — Trang 5.3–5.4 "MBA làm việc song song, lưu ý vận hành" (slide 73–75).
 *
 * Kịch bản a (dieu-kien): hai MBA nối song song, kiểm tra ba điều kiện.
 * Kịch bản b (phan-tai): phân bố tải theo điện áp ngắn mạch, máy nào quá tải trước (bài tập 3).
 * Kịch bản c (luu-y): năm lưu ý vận hành, liên hệ các bài trước.
 */
import { el } from './so-do.js';
import { $, napBai, dieuKhienChung, trinhChieuVaCauHoi, vongLap, chayTrang, hienKichBan } from './khung-trang.js';
import { taoMarker, veThe, veTruc, duongGap, veBang } from './hinh-mba.js';
import { phanBoTai, taiToiDa, kiemTraDieuKien } from './song-song.js';
import { dongDinhMuc } from './may-bien-ap.js';
import { dinhDangSo } from './tinh-toan.js';
import { soCoNghia, veCongThuc } from './tien-ich.js';

const so = (x, k = 3) => soCoNghia(x, k);
const MAU = ['#2a78d6', '#eb6834'];

/** Ký hiệu MBA (hai vòng tròn) nằm dọc. */
function kyHieuDoc(cha, cx, cy, mau) {
  el('circle', { cx, cy: cy - 22, r: 30, fill: 'none', stroke: mau, 'stroke-width': 4 }, cha);
  el('circle', { cx, cy: cy + 22, r: 30, fill: 'none', stroke: mau, 'stroke-width': 4 }, cha);
}

function veSanKhau(svg) {
  svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  taoMarker(defs, 'mui-den', '#13202b');
  el('rect', { x: -2000, y: -1200, width: 5600, height: 3300, class: 'nen-san-khau' }, svg);
  const r = { a: {}, b: {}, c: {} };

  // sơ đồ song song dùng chung cho a, b
  const veSoDo = (cha, y0) => {
    const g = el('g', {}, cha);
    el('line', { x1: 80, x2: 940, y1: y0, y2: y0, class: 'thanh-cai' }, g);
    el('line', { x1: 80, x2: 940, y1: y0 + 300, y2: y0 + 300, class: 'thanh-cai' }, g);
    el('text', { x: 70, y: y0 + 8, class: 'chu-svg dam', 'text-anchor': 'end' }, g).textContent = 'CA';
    el('text', { x: 70, y: y0 + 308, class: 'chu-svg dam', 'text-anchor': 'end' }, g).textContent = 'HA';
    const may = [300, 620].map((x, k) => {
      el('line', { x1: x, x2: x, y1: y0, y2: y0 + 98, class: 'day-mach' }, g);
      el('line', { x1: x, x2: x, y1: y0 + 202, y2: y0 + 300, class: 'day-mach' }, g);
      kyHieuDoc(g, x, y0 + 150, MAU[k]);
      const ten = el('text', { x: x + 50, y: y0 + 120, class: 'chu-svg dam' }, g);
      const tt = el('text', { x: x + 50, y: y0 + 148, class: 'chu-svg' }, g);
      const tt2 = el('text', { x: x + 50, y: y0 + 176, class: 'chu-svg' }, g);
      return { ten, tt, tt2 };
    });
    el('line', { x1: 860, x2: 860, y1: y0 + 300, y2: y0 + 360, class: 'day-mach', 'marker-end': 'url(#mui-den)' }, g);
    const tai = el('text', { x: 860, y: y0 + 390, class: 'chu-kq dam', 'text-anchor': 'middle' }, g);
    const vong = el('path', { d: `M300 ${y0 + 250} H620`, class: 'dong-can', 'marker-end': 'url(#mui-den)' }, g);
    return { g, may, tai, vong };
  };

  // ======================= A: ĐIỀU KIỆN =======================
  const gA = el('g', {}, svg);
  r.a.g = gA;
  const a1 = veThe(gA, 20, 20, 1000, 870, 'Hai MBA làm việc song song');
  r.a.soDo = veSoDo(a1, 140);
  r.a.dk = [0, 1, 2].map((k) => {
    const y = 600 + k * 80;
    el('rect', { x: 44, y, width: 952, height: 64, rx: 12, class: 'o-gia-tri' }, a1);
    return { dau: el('text', { x: 80, y: y + 42, class: 'dau-dk', 'text-anchor': 'middle' }, a1), chu: el('text', { x: 116, y: y + 28, class: 'chu-svg dam' }, a1), phu: el('text', { x: 116, y: y + 52, class: 'chu-svg' }, a1) };
  });
  const a2 = veThe(gA, 1040, 20, 540, 870, 'Thông số hai máy');
  r.a.bang = veBang(a2, 1056, 70, [{ w: 190 }, { w: 160, canh: 'end' }, { w: 158, canh: 'end' }], 46, ['', 'Máy 1', 'Máy 2'], 6);
  r.a.ket = [0, 1, 2, 3].map((k) => el('text', { x: 1064, y: 440 + k * 36, class: 'chu-svg' }, a2));

  // ======================= B: PHÂN TẢI =======================
  const gB = el('g', {}, svg);
  r.b.g = gB;
  const b1 = veThe(gB, 20, 20, 1000, 480, 'Phân bố tải giữa hai máy');
  r.b.soDo = veSoDo(b1, 100);
  const b2 = veThe(gB, 20, 520, 1000, 370, 'Hệ số tải β theo tổng tải S');
  r.b.truc = veTruc(b2, { x0: 100, x1: 980, y0: 580, y1: 840, xMin: 0, xMax: 2600, yMin: 0, yMax: 1.3 }, {
    nhanX: [[0, '0'], [500, '500'], [1000, '1000'], [1500, '1500'], [2000, '2000'], [2500, '2500 kVA']],
    nhanY: [[0, '0'], [0.5, '0,5'], [1, '1,0'], [1.3, '1,3']],
  });
  r.b.d = [0, 1].map((k) => el('path', { class: 'duong-dt', stroke: MAU[k] }, b2));
  r.b.cham = [0, 1].map((k) => el('circle', { r: 7, fill: MAU[k], class: 'cham-dt' }, b2));
  r.b.con = el('line', { y1: 580, y2: 840, class: 'duong-cham' }, b2);
  r.b.vachMax = el('line', { y1: 580, y2: 840, stroke: '#c62828', 'stroke-width': 2, 'stroke-dasharray': '6 4' }, b2);
  r.b.chuMax = el('text', { y: 572, class: 'chu-svg dam', fill: '#c62828', 'text-anchor': 'middle' }, b2);
  const b3 = veThe(gB, 1040, 20, 540, 870, 'Lời giải (slide 80–81)');
  r.b.dong = Array.from({ length: 17 }, (_, k) => el('text', { x: 1064, y: 96 + k * 38, class: 'chu-svg' }, b3));

  // ======================= C: LƯU Ý =======================
  const gC = el('g', {}, svg);
  r.c.g = gC;
  const c1 = veThe(gC, 20, 20, 1560, 870, '5.4. Một số vấn đề cần lưu ý khi sử dụng, vận hành MBA (slide 75)');
  r.c.the = [];
  for (let k = 0; k < 5; k++) {
    const x = 44 + (k % 3) * 512;
    const y = 90 + Math.floor(k / 3) * 390;
    const g = el('g', { class: 'the-luu-y', 'data-luu-y': k }, c1);
    el('rect', { x, y, width: 488, height: 360, rx: 16, class: 'nen-luu-y' }, g);
    el('circle', { cx: x + 44, cy: y + 44, r: 26, class: 'so-luu-y' }, g);
    el('text', { x: x + 44, y: y + 53, class: 'chu-so-luu-y', 'text-anchor': 'middle' }, g).textContent = k + 1;
    const bt = el('g', { transform: `translate(${x + 244} ${y + 140})` }, g);
    const chu = el('foreignObject', { x: x + 20, y: y + 220, width: 448, height: 130 }, g);
    r.c.the.push({ g, bt, chu });
  }
  return r;
}

/** Biểu tượng minh họa cho từng lưu ý. */
function veBieuTuongLuuY(g, id) {
  g.innerHTML = '';
  if (id === 'non-tai') {
    el('rect', { x: -90, y: -50, width: 180, height: 90, rx: 10, class: 'bt-khung' }, g);
    el('rect', { x: -78, y: -38, width: 30, height: 66, fill: '#c62828' }, g);
    el('text', { x: 10, y: 0, class: 'chu-svg dam', 'text-anchor': 'middle' }, g).textContent = 'β ≈ 0';
    el('text', { x: 10, y: 26, class: 'chu-svg', 'text-anchor': 'middle' }, g).textContent = 'η thấp';
  } else if (id === 'gan-tai') {
    el('circle', { cx: 0, cy: 0, r: 26, fill: 'none', stroke: '#1d3557', 'stroke-width': 4 }, g);
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      el('line', { x1: 30 * Math.cos(a), y1: 30 * Math.sin(a), x2: 90 * Math.cos(a), y2: 60 * Math.sin(a), class: 'day-mach' }, g);
      el('rect', { x: 90 * Math.cos(a) - 12, y: 60 * Math.sin(a) - 12, width: 24, height: 24, rx: 4, fill: '#ffd166', stroke: '#b5651d' }, g);
    }
  } else if (id === 'hieu-suat') {
    el('path', { d: 'M-90 40 Q-60 -40 -10 -50 T90 -30', fill: 'none', stroke: '#2e7d32', 'stroke-width': 5 }, g);
    el('text', { x: 0, y: 30, class: 'chu-svg dam', 'text-anchor': 'middle' }, g).textContent = 'η(β)';
  } else if (id === 'muc-dau') {
    el('rect', { x: -80, y: -40, width: 160, height: 50, rx: 25, class: 'bt-khung' }, g);
    el('rect', { x: -72, y: -14, width: 144, height: 18, rx: 9, fill: '#e8a33a' }, g);
    el('line', { x1: 60, x2: 60, y1: -36, y2: 6, stroke: '#c62828', 'stroke-width': 4 }, g);
    el('text', { x: 0, y: 44, class: 'chu-svg', 'text-anchor': 'middle' }, g).textContent = 'bình giãn dầu';
  } else {
    for (const [x, mau] of [[-40, MAU[0]], [40, MAU[1]]]) kyHieuDoc(g, x, 0, mau);
    el('line', { x1: -100, x2: 100, y1: -60, y2: -60, class: 'thanh-cai' }, g);
    el('line', { x1: -100, x2: 100, y1: 60, y2: 60, class: 'thanh-cai' }, g);
  }
}

async function khoiDong() {
  const kq = await napBai('du-lieu/song-song-mba.json', 'du-lieu/cau-hoi-song-song-mba.json');
  if (!kq) return;
  const [nd, cauHoi] = kq;
  const svg = $('#so-do');
  const r = veSanKhau(svg);
  const s = { kichBan: nd.macDinh.kichBan, dangChay: true, tocDo: 1, t: 0, may: nd.may.map((m) => ({ ...m })), S: nd.tai_kVA, chonLuuY: 0 };
  const { datChay, chuThich, soLieuTC } = dieuKhienChung(s, (id) => chonKichBan(id));

  const lt = nd.lyThuyet;
  $('#the-ly-thuyet').innerHTML = `
    <p class="muc-nho">${lt.muc}</p>
    <h2>5.3. MBA làm việc song song</h2>
    <p class="dong-ly-thuyet">${lt.songSong}</p>
    <p class="dong-ly-thuyet">Điều kiện để các MBA làm việc song song:</p>
    <ul class="ghi-chu-ly-thuyet">${lt.dieuKien.map((x) => `<li>${x}</li>`).join('')}</ul>
    <p class="quy-tac">${lt.phanTai}</p>
    ${lt.congThuc.map((c, k) => `<div class="cong-thuc" data-ct="${k}"></div>`).join('')}
    <p class="ghi-chu-nho">${lt.kyHieu}</p>
    <h2>5.4. Lưu ý khi sử dụng, vận hành MBA</h2>
    <ul class="ghi-chu-ly-thuyet">${lt.luuY.map((x) => `<li>${x.chu}</li>`).join('')}</ul>`;
  const veLyThuyet = () => lt.congThuc.forEach((c, k) => veCongThuc($(`[data-ct="${k}"]`), c.tex, c.duPhong));
  veLyThuyet();
  if (!window.katex) document.querySelector('script[src*="katex"]')?.addEventListener('load', veLyThuyet, { once: true });

  const kV = (u) => `${dinhDangSo(u, u < 1 ? 1 : 0)} kV`;
  function ghiMay(soDo, beta) {
    s.may.forEach((m, k) => {
      soDo.may[k].ten.textContent = `${m.ten}: ${dinhDangSo(m.Sdm, 0)} kVA`;
      soDo.may[k].tt.textContent = `${kV(m.U1)}/${kV(m.U2)}, ${m.to}`;
      soDo.may[k].tt2.textContent = beta ? `un = ${dinhDangSo(m.un, 1)} %, β = ${so(beta[k].beta)}` : `un = ${dinhDangSo(m.un, 1)} %`;
    });
  }

  // ======================= A =======================
  function capNhatA() {
    const dk = kiemTraDieuKien(s.may, nd.saiUnChoPhep);
    ghiMay(r.a.soDo);
    r.a.soDo.tai.textContent = 'Tải chung';
    const ds = [
      [dk.cungTo, 'Cùng tổ nối dây', `${s.may[0].to} và ${s.may[1].to}`],
      [dk.cungDienAp, 'Cùng cấp điện áp và hệ số biến đổi', `${kV(s.may[0].U1)}/${kV(s.may[0].U2)} và ${kV(s.may[1].U1)}/${kV(s.may[1].U2)}`],
      [dk.cungUn, 'Cùng điện áp ngắn mạch', `${dinhDangSo(s.may[0].un, 1)} % và ${dinhDangSo(s.may[1].un, 1)} % (sai lệch cho phép do giảng viên đặt: ${dinhDangSo(nd.saiUnChoPhep, 1)} %)`],
    ];
    r.a.dk.forEach((o, i) => {
      o.dau.textContent = ds[i][0] ? '✓' : '✗';
      o.dau.setAttribute('class', `dau-dk ${ds[i][0] ? 'dat' : 'khong'}`);
      o.chu.textContent = ds[i][1];
      o.phu.textContent = ds[i][2];
    });
    r.a.soDo.vong.style.display = dk.cungTo && dk.cungDienAp ? 'none' : '';
    const bang = [
      ['Sđm (kVA)', dinhDangSo(s.may[0].Sdm, 0), dinhDangSo(s.may[1].Sdm, 0)],
      ['U₁/U₂ (kV)', `${dinhDangSo(s.may[0].U1, 0)}/${dinhDangSo(s.may[0].U2, 1)}`, `${dinhDangSo(s.may[1].U1, 0)}/${dinhDangSo(s.may[1].U2, 1)}`],
      ['k = U₁/U₂', so(s.may[0].U1 / s.may[0].U2), so(s.may[1].U1 / s.may[1].U2)],
      ['f (Hz)', s.may[0].f, s.may[1].f],
      ['Tổ nối dây', s.may[0].to, s.may[1].to],
      ['un (%)', dinhDangSo(s.may[0].un, 1), dinhDangSo(s.may[1].un, 1)],
    ];
    r.a.bang.o.forEach((h, i) => h.forEach((o, j) => { o.textContent = bang[i][j]; }));
    const ket = dk.dat
      ? ['✓ Đủ ba điều kiện:', 'hai máy làm việc song song được.', 'Máy 1, 2: số liệu bài tập 3 (slide 80).', '']
      : ['✗ Không đủ điều kiện làm việc song song.', !dk.cungTo || !dk.cungDienAp ? 'Mũi tên đỏ: giữa hai máy có dòng điện' : 'Un khác nhau: phân tải không đều,', !dk.cungTo || !dk.cungDienAp ? 'chạy quẩn (minh họa định tính).' : 'máy un nhỏ quá tải trước (kịch bản b).', ''];
    r.a.ket.forEach((o, i) => { o.textContent = ket[i]; o.setAttribute('class', i === 0 ? `chu-kq ${dk.dat ? 'dam' : 'xau'}` : 'chu-svg'); });
    $('#sl-1').textContent = dk.dat ? 'Đạt' : 'Không đạt';
    $('#sl-2').textContent = `${[dk.cungTo, dk.cungDienAp, dk.cungUn].filter(Boolean).length}/3`;
    $('#sl-3').textContent = '—';
    chuThich(dk.dat ? 'Hai máy thỏa ba điều kiện: cùng tổ nối dây, cùng cấp điện áp và hệ số biến đổi, cùng điện áp ngắn mạch.'
      : `Vi phạm: ${ds.filter((x) => !x[0]).map((x) => x[1].toLowerCase()).join('; ')}.`, dk.dat ? 'thanh-cong' : 'canh-bao');
    soLieuTC(`Điều kiện: ${[dk.cungTo, dk.cungDienAp, dk.cungUn].filter(Boolean).length}/3 · ${dk.dat ? 'được làm việc song song' : 'không đạt'}`);
  }

  // ======================= B =======================
  function capNhatB() {
    const pb = phanBoTai(s.S, s.may);
    ghiMay(r.b.soDo, pb);
    r.b.soDo.tai.textContent = `S = ${dinhDangSo(s.S, 0)} kVA`;
    r.b.soDo.vong.style.display = 'none';
    const { X, Y } = r.b.truc;
    const dsS = Array.from({ length: 53 }, (_, i) => i * 50);
    r.b.d.forEach((d, k) => d.setAttribute('d', duongGap(dsS.map((S) => [X(S), Y(Math.min(1.3, phanBoTai(S, s.may)[k].beta))]))));
    r.b.cham.forEach((c, k) => { c.setAttribute('cx', X(s.S)); c.setAttribute('cy', Y(Math.min(1.3, pb[k].beta))); });
    r.b.con.setAttribute('x1', X(s.S)); r.b.con.setAttribute('x2', X(s.S));
    const Smax = taiToiDa(s.may);
    r.b.vachMax.setAttribute('x1', X(Math.min(2600, Smax))); r.b.vachMax.setAttribute('x2', X(Math.min(2600, Smax)));
    r.b.chuMax.setAttribute('x', X(Math.min(2550, Smax)));
    r.b.chuMax.textContent = `S max = ${dinhDangSo(Smax, 0)} kVA`;
    const tong = s.may.reduce((t, m) => t + m.Sdm / m.un, 0);
    const I = s.may.map((m) => dongDinhMuc(m.Sdm * 1000, m.U2 * 1000));
    const quaTai = pb.findIndex((x) => x.beta > 1.0001);
    const dong = [
      `Σ(Sđmi/uni%) = ${dinhDangSo(s.may[0].Sdm, 0)}/${dinhDangSo(s.may[0].un, 1)} + ${dinhDangSo(s.may[1].Sdm, 0)}/${dinhDangSo(s.may[1].un, 1)} = ${so(tong, 4)}`,
      `β₁ = ${dinhDangSo(s.S, 0)}/(${dinhDangSo(s.may[0].un, 1)}·${so(tong, 4)}) = ${so(pb[0].beta)}`,
      `S₁ = β₁·Sđm1 = ${so(pb[0].S, 4)} kVA`,
      `β₂ = ${dinhDangSo(s.S, 0)}/(${dinhDangSo(s.may[1].un, 1)}·${so(tong, 4)}) = ${so(pb[1].beta)}`,
      `S₂ = β₂·Sđm2 = ${so(pb[1].S, 4)} kVA`,
      '',
      'Dòng điện mỗi máy (phía 0,4 kV):',
      `I₁đm = ${dinhDangSo(s.may[0].Sdm * 1000, 0)}/(√3·${dinhDangSo(s.may[0].U2 * 1000, 0)}) = ${so(I[0], 5)} A`,
      `I₁ = β₁·I₁đm = ${so(pb[0].beta * I[0], 5)} A`,
      `I₂đm = ${dinhDangSo(s.may[1].Sdm * 1000, 0)}/(√3·${dinhDangSo(s.may[1].U2 * 1000, 0)}) = ${so(I[1], 5)} A`,
      `I₂ = β₂·I₂đm = ${so(pb[1].beta * I[1], 4)} A`,
      '',
      `β₁/β₂ = ${so(pb[0].beta / pb[1].beta)} = un2/un1 = ${so(s.may[1].un / s.may[0].un)}`,
      quaTai >= 0 ? `⚠ ${s.may[quaTai].ten} quá tải (β > 1)!` : 'Không máy nào quá tải.',
      `Tổng dung lượng ${dinhDangSo(s.may[0].Sdm + s.may[1].Sdm, 0)} kVA nhưng chỉ`,
      `tải được ${dinhDangSo(Smax, 0)} kVA khi un khác nhau.`,
      'Slide 81 ghi I₁đm = S/(√3·U1đm) nhưng tính với 400 V (U₂).',
    ];
    r.b.dong.forEach((o, i) => { o.textContent = dong[i]; o.setAttribute('class', i === 13 ? `chu-kq ${quaTai >= 0 ? 'xau' : 'dam'}` : i === 16 ? 'nho-xam' : 'chu-svg'); });
    $('#sl-1').textContent = `${so(pb[0].beta)} / ${so(pb[1].beta)}`;
    $('#sl-2').textContent = `${so(pb[0].S, 4)} / ${so(pb[1].S, 4)} kVA`;
    $('#sl-3').textContent = `${dinhDangSo(Smax, 0)} kVA`;
    chuThich(`Tải ${dinhDangSo(s.S, 0)} kVA: β₁ = <b>${so(pb[0].beta)}</b> (S₁ = ${so(pb[0].S, 4)} kVA), β₂ = <b>${so(pb[1].beta)}</b> (S₂ = ${so(pb[1].S, 4)} kVA). ${quaTai >= 0 ? `<b>${s.may[quaTai].ten} quá tải!</b>` : ''}`, quaTai >= 0 ? 'canh-bao' : 'thanh-cong');
    soLieuTC(`S = ${dinhDangSo(s.S, 0)} kVA · β₁ = ${so(pb[0].beta)} · β₂ = ${so(pb[1].beta)}`);
  }

  // ======================= C =======================
  function capNhatC() {
    lt.luuY.forEach((l, k) => {
      const o = r.c.the[k];
      veBieuTuongLuuY(o.bt, l.id);
      o.chu.innerHTML = `<div xmlns="http://www.w3.org/1999/xhtml" class="chu-luu-y"><p><b>${l.chu}</b></p><p class="lien-he">${l.baiHoc ? `<a href="${l.baiHoc}">${l.lienHe}</a>` : l.lienHe}</p></div>`;
      o.g.classList.toggle('chon', k === s.chonLuuY);
    });
    const l = lt.luuY[s.chonLuuY];
    $('#sl-1').textContent = `${s.chonLuuY + 1}/5`;
    $('#sl-2').textContent = '—';
    $('#sl-3').textContent = '—';
    chuThich(`<b>Lưu ý ${s.chonLuuY + 1}:</b> ${l.chu} <i>${l.lienHe}</i>`);
    soLieuTC(`Lưu ý ${s.chonLuuY + 1}: ${l.chu}`);
  }
  svg.addEventListener('click', (e) => {
    const g = e.target.closest('[data-luu-y]');
    if (g && s.kichBan === 'luu-y' && !e.target.closest('a')) { s.chonLuuY = Number(g.dataset.luuY); capNhatC(); }
  });

  // ---------- Điều khiển ----------
  const NHAN = { 'dieu-kien': ['Làm việc song song', 'Điều kiện đạt', '—'], 'phan-tai': ['β₁ / β₂', 'S₁ / S₂', 'Tải tối đa'], 'luu-y': ['Lưu ý', '—', '—'] };
  function capNhat() {
    NHAN[s.kichBan].forEach((t, k) => { $(`#sl-${k + 1}`).previousElementSibling.textContent = t; });
    if (s.kichBan === 'dieu-kien') capNhatA();
    if (s.kichBan === 'phan-tai') capNhatB();
    if (s.kichBan === 'luu-y') capNhatC();
  }
  function chonKichBan(id) {
    s.kichBan = id;
    hienKichBan(id, { 'dieu-kien': r.a.g, 'phan-tai': r.b.g, 'luu-y': r.c.g });
    veDieuKhien();
    capNhat();
  }
  function veDieuKhien() {
    const dk = $('#dieu-khien-kich-ban');
    const m2 = s.may[1];
    if (s.kichBan === 'luu-y') { dk.innerHTML = '<p class="mo-ta">Bấm vào từng thẻ lưu ý; liên kết dẫn về bài liên quan.</p>'; return; }
    dk.innerHTML = `
      <p class="mo-ta">Máy 1 cố định theo bài tập 3. Thay đổi thông số máy 2.</p>
      <label class="dieu-khien doc"><span>Sđm máy 2 (kVA)</span> <input type="range" id="ss-s2" min="250" max="2000" step="50" value="${m2.Sdm}"><output id="ss-s2-gt">${m2.Sdm}</output></label>
      <label class="dieu-khien doc"><span>un máy 2 (%)</span> <input type="range" id="ss-un2" min="3" max="8" step="0.1" value="${m2.un}"><output id="ss-un2-gt">${dinhDangSo(m2.un, 1)}</output></label>
      ${s.kichBan === 'dieu-kien' ? `
      <label class="dieu-khien doc"><span>Tổ nối dây máy 2</span> <select id="ss-to">${nd.dsTo.map((t) => `<option ${t === m2.to ? 'selected' : ''}>${t}</option>`).join('')}</select><span></span></label>
      <label class="dieu-khien doc"><span>U₁ máy 2 (kV)</span> <select id="ss-u1">${nd.dsU1.map((u) => `<option value="${u}" ${u === m2.U1 ? 'selected' : ''}>${u}</option>`).join('')}</select><span></span></label>`
    : `<label class="dieu-khien doc"><span>Tổng tải S (kVA)</span> <input type="range" id="ss-s" min="100" max="2600" step="50" value="${s.S}"><output id="ss-s-gt">${s.S}</output></label>`}
      <div class="hang-nut"><button type="button" class="nut" id="ss-goc">↺ Số liệu bài tập 3</button></div>`;
    $('#ss-s2').addEventListener('input', (e) => { m2.Sdm = Number(e.target.value); $('#ss-s2-gt').textContent = m2.Sdm; capNhat(); });
    $('#ss-un2').addEventListener('input', (e) => { m2.un = Number(e.target.value); $('#ss-un2-gt').textContent = dinhDangSo(m2.un, 1); capNhat(); });
    $('#ss-to')?.addEventListener('change', (e) => { m2.to = e.target.value; capNhat(); });
    $('#ss-u1')?.addEventListener('change', (e) => { m2.U1 = Number(e.target.value); capNhat(); });
    $('#ss-s')?.addEventListener('input', (e) => { s.S = Number(e.target.value); $('#ss-s-gt').textContent = s.S; capNhat(); });
    $('#ss-goc').addEventListener('click', () => { s.may = nd.may.map((m) => ({ ...m })); s.S = nd.tai_kVA; veDieuKhien(); capNhat(); });
  }

  trinhChieuVaCauHoi(nd, cauHoi, (id, b) => {
    const tt = b?.trangThai;
    if (!tt) return;
    if (tt.S) s.S = tt.S;
    chonKichBan(tt.kichBan);
  }, datChay, s);

  vongLap(s, (dt) => {
    s.t += dt;
    const o = s.kichBan === 'dieu-kien' ? r.a.soDo : s.kichBan === 'phan-tai' ? r.b.soDo : null;
    if (o) o.vong.style.strokeDashoffset = (-(s.t * 40) % 24).toFixed(1);
  });

  chonKichBan(s.kichBan);
  document.body.classList.add('da-san-sang');
}

chayTrang(khoiDong);
