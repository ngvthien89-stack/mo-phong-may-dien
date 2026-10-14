/**
 * kich-ban.js — Bốn kịch bản mô phỏng:
 *  a) Vận hành bình thường   b) Vì sao phải truyền tải điện áp cao?
 *  c) Sự cố ngắn mạch lưới phân phối   d) Tăng phụ tải đột ngột
 */
import { tinhTruyenTai, buocTanSo, dinhDangSo } from './tinh-toan.js';
import { taoNhan, canChinhNhan } from './so-do.js';
import { veDoThiThoiGian } from './do-thi.js';

const $ = (s) => document.querySelector(s);
const MAU_P_YEU_CAU = '#2a78d6';
const MAU_P_TUABIN = '#eb6834';
const MAU_TAN_SO = '#334e68';
const TEN_DOAN = { s1: 'Đoạn 1', s2: 'Đoạn 2', s3: 'Đoạn 3' };

/** Chuỗi số kiểu Việt Nam dùng trong KaTeX: dấu phẩy thập phân viết {,} để không bị giãn cách. */
const soTex = (x, s) => dinhDangSo(x, s).replace(/\./g, '\\,').replace(',', '{,}');

function veCongThuc(o, tex, duPhong) {
  if (window.katex) {
    try {
      window.katex.render(tex, o, { throwOnError: false, displayMode: true });
      return;
    } catch { /* dùng dạng dự phòng */ }
  }
  o.innerHTML = `<span class="cong-thuc-du-phong">${duPhong}</span>`;
}

function tronMau(a, b, t) {
  const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return '#' + pa.map((x, i) => Math.round(x + (pb[i] - x) * t).toString(16).padStart(2, '0')).join('');
}

export function taoKichBan(ung) {
  const { cauHinh, ref, tt, hat, tiaLua } = ung;
  const bang = $('#bang-kich-ban');
  const bangSoLieu = $('#bang-so-lieu');

  // Nhãn "Đoạn 1/2/3" chỉ hiện trong kịch bản sự cố
  const nhanDoan = Object.entries(TEN_DOAN).map(([doan, ten]) => {
    const d = ref.doanSuCo[doan];
    const g = taoNhan(ref.lopNhan, { x: (d.x1 + d.x2) / 2, y: 662, chu: ten, id: 'duong-day-phan-phoi', lopCss: 'nhan-doan' });
    g.dataset.doan = doan;
    return g;
  });

  const ks = {
    hienTai: null,
    ghiDeTruyenTai: false,
    tenDoan: (d) => TEN_DOAN[d] || d,
    chon,
    capNhat: (dt) => kb[ks.hienTai]?.capNhat?.(dt),
    sauTinhToan: (dt, kq) => kb[ks.hienTai]?.sauTinhToan?.(dt, kq),
    taoSuCo: (doan, x) => kb['su-co'].taoSuCo(doan, x),
  };

  function chon(id) {
    if (ks.hienTai) kb[ks.hienTai].ketThuc?.();
    ung.datChuThich(null);
    ks.hienTai = id;
    $('#chon-kich-ban').value = id;
    bangSoLieu.hidden = false;
    document.body.dataset.kichBan = id;
    kb[id].batDau();
  }

  // ======================== a) Vận hành bình thường ========================
  const binhThuong = {
    batDau() {
      bang.innerHTML = `
        <h2>a) Vận hành bình thường</h2>
        <ul class="goi-y">
          <li>Kéo thanh <b>Thời gian trong ngày</b> hoặc bấm vào <b>đồ thị phụ tải</b> ở góc sơ đồ: phụ tải thay đổi, nhà máy tăng/giảm công suất phát theo.</li>
          <li>Rê chuột (hoặc chạm) vào một bộ phận để xem tên và cấp điện áp; <b>bấm</b> để mở bảng thông tin.</li>
          <li>Mật độ và tốc độ <b>hạt sáng</b> tỉ lệ với công suất truyền trên đường dây.</li>
        </ul>`;
    },
  };

  // ======================== b) Vì sao truyền tải điện áp cao ========================
  const sb = cauHinh.kichBanDienAp;
  const dienAp = {
    U: sb.dienApMacDinh_kV,
    P: sb.P_MW,
    L: sb.chieuDai_km,
    nhanGoiY: null,
    batDau() {
      ks.ghiDeTruyenTai = true;
      bangSoLieu.hidden = true;
      bang.innerHTML = `
        <h2>b) Vì sao phải truyền tải điện áp cao?</h2>
        <p class="mo-ta">Truyền <b>cùng công suất P</b> trên <b>cùng một đường dây</b> (điện trở R = r<sub>0</sub>·L), chỉ thay đổi điện áp U.
        Trên sơ đồ, <b>độ dày dây</b> thể hiện dòng điện, <b>màu dây</b> chuyển từ xám sang đỏ theo mức tổn thất.</p>
        <div class="nhom-chon-u" role="radiogroup" aria-label="Điện áp truyền tải">
          ${sb.cacDienAp_kV.map((u) => `<button type="button" class="nut-u" role="radio" data-u="${u}">${u} kV</button>`).join('')}
        </div>
        <label class="dieu-khien doc">Công suất P <input type="range" id="sb-p" min="${sb.P_min_MW}" max="${sb.P_max_MW}" step="5" value="${this.P}"><output id="sb-p-gt"></output></label>
        <label class="dieu-khien doc">Chiều dài L <input type="range" id="sb-l" min="${sb.chieuDai_min_km}" max="${sb.chieuDai_max_km}" step="5" value="${this.L}"><output id="sb-l-gt"></output></label>
        <p class="thong-so" id="sb-thong-so"></p>
        <div class="cong-thuc" id="ct-i"></div>
        <div class="cong-thuc" id="ct-dp"></div>
        <div class="cong-thuc" id="ct-pt"></div>
        <table class="bang-so-sanh">
          <thead><tr><th>U</th><th>I (A)</th><th>ΔP (MW)</th><th>ΔP/P</th></tr></thead>
          <tbody id="sb-bang"></tbody>
        </table>
        <p class="nhan-xet" id="sb-nhan-xet"></p>`;
      bang.querySelectorAll('.nut-u').forEach((n) => n.addEventListener('click', () => { this.U = Number(n.dataset.u); this.tinh(); }));
      $('#sb-p').addEventListener('input', (e) => { this.P = Number(e.target.value); this.tinh(); });
      $('#sb-l').addEventListener('input', (e) => { this.L = Number(e.target.value); this.tinh(); });
      this.nhanGoiY = taoNhan(ref.lopNhan, { x: 930, y: 322, chu: '', id: 'duong-day-truyen-tai', lopCss: 'nhan-goi-y' });
      this.tinh();
      // KaTeX tải sau (defer) → vẽ lại công thức khi sẵn sàng
      if (!window.katex) document.querySelector('script[src*="katex"]')?.addEventListener('load', () => this.tinh(), { once: true });
    },
    tinh() {
      const R = sb.r0_ohm_km * this.L;
      const chung = { P_MW: this.P, cosPhi: sb.cosPhi, R_ohm: R };
      const ds = sb.cacDienAp_kV.map((u) => ({ u, ...tinhTruyenTai({ ...chung, U_kV: u }) }));
      const kq = ds.find((d) => d.u === this.U);
      const Imax = Math.max(...ds.map((d) => d.I_A));
      $('#sb-p-gt').textContent = `${dinhDangSo(this.P, 0)} MW`;
      $('#sb-l-gt').textContent = `${dinhDangSo(this.L, 0)} km`;
      $('#sb-thong-so').innerHTML = `cosφ = ${dinhDangSo(sb.cosPhi, 2)} · r<sub>0</sub> = ${dinhDangSo(sb.r0_ohm_km, 2)} Ω/km · R = ${dinhDangSo(R, 1)} Ω/pha`;
      bang.querySelectorAll('.nut-u').forEach((n) => {
        const chon_ = Number(n.dataset.u) === this.U;
        n.classList.toggle('dang-chon', chon_);
        n.setAttribute('aria-checked', String(chon_));
      });
      veCongThuc($('#ct-i'),
        `I = \\dfrac{P}{\\sqrt{3}\\,U\\cos\\varphi} = \\dfrac{${soTex(this.P, 0)}\\cdot 10^{6}}{\\sqrt{3}\\cdot ${soTex(this.U, 0)}\\cdot 10^{3}\\cdot ${soTex(sb.cosPhi, 2)}} = \\mathbf{${soTex(kq.I_A, 1)}\\ \\text{A}}`,
        `I = P / (√3·U·cosφ) = ${dinhDangSo(this.P, 0)}·10⁶ / (√3·${dinhDangSo(this.U, 0)}·10³·${dinhDangSo(sb.cosPhi, 2)}) = <b>${dinhDangSo(kq.I_A, 1)} A</b>`);
      const soLeDP = kq.dP_MW < 1 ? 3 : 2;
      const soLePT = kq.phanTram < 1 ? 2 : 1;
      veCongThuc($('#ct-dp'),
        `\\Delta P = 3I^{2}R = 3\\cdot ${soTex(kq.I_A, 1)}^{2}\\cdot ${soTex(R, 1)} = \\mathbf{${soTex(kq.dP_MW, soLeDP)}\\ \\text{MW}}`,
        `ΔP = 3·I²·R = 3·${dinhDangSo(kq.I_A, 1)}²·${dinhDangSo(R, 1)} = <b>${dinhDangSo(kq.dP_MW, soLeDP)} MW</b>`);
      veCongThuc($('#ct-pt'),
        `\\dfrac{\\Delta P}{P} = \\dfrac{${soTex(kq.dP_MW, soLeDP)}}{${soTex(this.P, 0)}}\\cdot 100\\,\\% = \\mathbf{${soTex(kq.phanTram, soLePT)}\\,\\%}`,
        `ΔP/P = ${dinhDangSo(kq.dP_MW, soLeDP)} / ${dinhDangSo(this.P, 0)} · 100 % = <b>${dinhDangSo(kq.phanTram, soLePT)} %</b>`);
      const maxPT = Math.max(...ds.map((d) => Math.min(100, d.phanTram)));
      $('#sb-bang').innerHTML = ds.map((d) => `
        <tr class="${d.u === this.U ? 'dang-chon' : ''}">
          <td><b>${d.u} kV</b></td><td>${dinhDangSo(d.I_A, 1)}</td><td>${dinhDangSo(d.dP_MW, d.dP_MW < 1 ? 3 : 2)}</td>
          <td class="o-thanh"><span class="ray-pt"><span class="thanh-pt" style="width:${Math.max(2, (Math.min(100, d.phanTram) / maxPT) * 100)}%"></span></span>
            <span class="gt-pt">${d.coTheTruyenTai ? dinhDangSo(d.phanTram, d.phanTram < 1 ? 2 : 1) + ' %' : 'không truyền được'}</span></td>
        </tr>`).join('');
      const kThap = ds[0];
      const kCao = ds[ds.length - 1];
      const tiU = kCao.u / kThap.u;
      $('#sb-nhan-xet').innerHTML = kq.coTheTruyenTai
        ? `Tăng U từ ${kThap.u} kV lên ${kCao.u} kV (≈ ${dinhDangSo(tiU, 1)} lần) thì I giảm ${dinhDangSo(tiU, 1)} lần và ΔP giảm ≈ ${dinhDangSo(tiU * tiU, 0)} lần (ΔP ~ 1/U²). Hiệu suất truyền tải ở ${this.U} kV: <b>${dinhDangSo(kq.hieuSuat * 100, 2)} %</b>.`
        : `<b class="canh-bao">Ở ${this.U} kV tổn thất vượt quá công suất truyền: không thể truyền tải công suất này!</b>`;

      // Hiển thị trên sơ đồ
      const tiI = kq.I_A / Imax;
      const doDo = Math.min(1, kq.phanTram / 25);
      const mauDay = tronMau('#7b8794', '#ff1f1f', doDo);
      for (const p of ref.duong['truyen-tai'].paths) {
        p.style.stroke = mauDay;
        p.style.strokeWidth = (2 + 8 * Math.pow(tiI, 0.6)).toFixed(1);
      }
      hat.datTiLe('truyen-tai', Math.max(0.08, 1.3 * tiI));
      const nhanTT = ref.nhan.find((n) => n.dataset.cap === 'truyenTai');
      if (nhanTT) {
        nhanTT.querySelector('.chu-nhan').textContent = `U = ${this.U} kV`;
        nhanTT.querySelector('.nen-nhan').style.fill = '#52606d';
        canChinhNhan(nhanTT);
      }
      this.nhanGoiY.querySelector('.chu-nhan').textContent = kq.coTheTruyenTai
        ? `I = ${dinhDangSo(kq.I_A, 0)} A · Tổn thất ${dinhDangSo(kq.phanTram, kq.phanTram < 1 ? 2 : 1)} %`
        : `I = ${dinhDangSo(kq.I_A, 0)} A · Không thể truyền tải!`;
      this.nhanGoiY.classList.toggle('nguy-hiem', doDo > 0.4);
      canChinhNhan(this.nhanGoiY);
      ung.datChuThich(`Điện áp <b>${this.U} kV</b>: dòng điện <b>${dinhDangSo(kq.I_A, 0)} A</b>, tổn thất <b>${dinhDangSo(kq.phanTram, kq.phanTram < 1 ? 2 : 1)} %</b> công suất truyền.`, doDo > 0.4 ? 'canh-bao' : '');
    },
    ketThuc() {
      ks.ghiDeTruyenTai = false;
      for (const p of ref.duong['truyen-tai'].paths) { p.style.stroke = ''; p.style.strokeWidth = ''; }
      const nhanTT = ref.nhan.find((n) => n.dataset.cap === 'truyenTai');
      if (nhanTT) {
        nhanTT.querySelector('.chu-nhan').textContent = cauHinh.capDienAp.truyenTai.hienThi;
        nhanTT.querySelector('.nen-nhan').style.fill = cauHinh.capDienAp.truyenTai.mau;
        canChinhNhan(nhanTT);
      }
      this.nhanGoiY?.remove();
      this.nhanGoiY = null;
    },
  };

  // ======================== c) Sự cố ngắn mạch ========================
  const sc = cauHinh.kichBanSuCo;
  const suCo = {
    dangChay: null,
    batDau() {
      document.body.classList.add('che-do-su-co');
      ung.svg.classList.add('che-do-su-co');
      bang.innerHTML = `
        <h2>c) Sự cố ngắn mạch trên lưới phân phối</h2>
        <p class="mo-ta"><b>Bấm vào một đoạn đường dây trung áp</b> (Đoạn 1, 2 hoặc 3) trên sơ đồ để tạo sự cố ngắn mạch. Quan sát recloser (R) và các cầu dao phụ tải (LBS) tự động xử lý.</p>
        <label class="o-chon"><input type="checkbox" id="su-co-thoang-qua"> Sự cố thoáng qua (tự hết sau lần cắt đầu)</label>
        <ol class="cac-buoc" id="cac-buoc"></ol>
        <button type="button" class="nut nut-chinh" id="nut-sua-chua" disabled>Sửa chữa xong – đóng điện lại</button>
        <p class="ghi-chu-nho">Đèn trạng thái: <span class="cham xanh"></span> đóng · <span class="cham do"></span> mở. Đoạn mất điện hiển thị nét đứt màu xám.</p>`;
      $('#nut-sua-chua').addEventListener('click', () => this.khoiPhuc(true));
      this.veCacBuoc(this.buocMau(true, 's2'), -1);
      ung.datChuThich('Chế độ sự cố: <b>bấm vào một đoạn đường dây trung áp</b> (nét xanh lục) để tạo ngắn mạch.');
    },
    buocMau(duyTri, doan) {
      const lbs = doan === 's3' ? 'LBS2' : 'LBS1';
      if (!duyTri) return ['Ngắn mạch xảy ra', 'Recloser cắt (lần 1)', 'Recloser tự đóng lại – sự cố đã hết, khôi phục'];
      if (doan === 's1') return ['Ngắn mạch xảy ra', 'Recloser cắt (lần 1)', 'Tự đóng lại lần 1 – sự cố vẫn còn', 'Recloser cắt lần 2 và khóa (lockout)', 'LBS1 mở – cô lập đoạn sự cố'];
      return ['Ngắn mạch xảy ra', 'Recloser cắt (lần 1)', 'Tự đóng lại lần 1 – sự cố vẫn còn', 'Recloser cắt (lần 2)', `${lbs} tự mở – cô lập đoạn sự cố`, 'Recloser đóng lại lần 2 – khôi phục phần lưới phía trước'];
    },
    veCacBuoc(ds, hienTai) {
      $('#cac-buoc').innerHTML = ds.map((b, i) => `<li class="${i < hienTai ? 'xong' : i === hienTai ? 'dang' : ''}">${b}</li>`).join('');
    },
    danhDauDoan(doan, lop, bat) {
      for (const p of ref.duong[doan].paths) p.classList.toggle(lop, bat);
    },
    khoiPhuc(thongBao) {
      tt.chuyenMach.R = true;
      tt.chuyenMach.LBS1 = true;
      tt.chuyenMach.LBS2 = true;
      tiaLua.dung();
      for (const d of ['s1', 's2', 's3']) { this.danhDauDoan(d, 'su-co', false); this.danhDauDoan(d, 'doan-su-co', false); }
      this.dangChay = null;
      const nut = $('#nut-sua-chua');
      if (nut) nut.disabled = true;
      if (thongBao) {
        ung.datChuThich('Đội sửa chữa đã xử lý xong, các thiết bị được đóng lại: toàn bộ lưới có điện. <b>Bấm vào một đoạn đường dây</b> để thử lại.', 'thanh-cong');
        this.veCacBuoc(this.buocMau(true, 's2'), -1);
      }
    },
    taoSuCo(doan, x) {
      if (this.dangChay && !this.dangChay.xong) return;
      this.khoiPhuc(false);
      const d = ref.doanSuCo[doan];
      const xx = Math.min(Math.max(x, Math.min(d.x1, d.x2) + 20), Math.max(d.x1, d.x2) - 20);
      const duyTri = !$('#su-co-thoang-qua').checked;
      const ten = TEN_DOAN[doan];
      const lbs = doan === 's3' ? 'LBS2' : 'LBS1';
      const tc = sc.thoiGianCat_s;
      const tw = sc.thoiGianChoDongLai_s;
      const tl = sc.thoiGianCoLap_s;
      const ngan = () => { tiaLua.batDau(xx, 685); this.danhDauDoan(doan, 'su-co', true); };
      const het = () => { tiaLua.dung(); this.danhDauDoan(doan, 'su-co', false); };
      const buoc = [
        { t: 0, lam: () => { ngan(); ung.datChuThich(`⚡ <b>Ngắn mạch trên ${ten}!</b> Dòng sự cố rất lớn chạy từ nguồn qua recloser R đến điểm sự cố.`, 'canh-bao'); } },
        { t: tc, lam: () => { tt.chuyenMach.R = false; het(); ung.datChuThich('<b>Recloser R phát hiện quá dòng và CẮT (lần 1).</b> Toàn bộ lưới phía sau recloser tạm thời mất điện.', 'canh-bao'); } },
      ];
      if (!duyTri) {
        buoc.push({ t: tc + tw, lam: () => { tt.chuyenMach.R = true; ung.datChuThich('<b>Recloser TỰ ĐÓNG LẠI thành công.</b> Sự cố thoáng qua đã tự hết → toàn bộ lưới có điện trở lại sau vài giây.', 'thanh-cong'); }, ketThuc: true });
      } else {
        buoc.push({ t: tc + tw, lam: () => { tt.chuyenMach.R = true; ngan(); ung.datChuThich('<b>Recloser tự đóng lại lần 1</b> nhưng sự cố <b>vẫn còn</b> → dòng ngắn mạch xuất hiện trở lại.', 'canh-bao'); } });
        if (doan === 's1') {
          buoc.push({ t: 2 * tc + tw, lam: () => { tt.chuyenMach.R = false; het(); this.danhDauDoan(doan, 'doan-su-co', true); ung.datChuThich('<b>Recloser cắt lần 2 và KHÓA (lockout).</b> Sự cố nằm ngay sau recloser nên không thể đóng lại.', 'canh-bao'); } });
          buoc.push({ t: 2 * tc + tw + tl, lam: () => { tt.chuyenMach.LBS1 = false; ung.datChuThich(`<b>LBS1 mở → ${ten} được cô lập.</b> Khu vực phía sau recloser mất điện chờ sửa chữa; nhà máy điện, lưới truyền tải và các xuất tuyến khác vẫn vận hành bình thường.`, 'canh-bao'); }, ketThuc: true });
        } else {
          buoc.push({ t: 2 * tc + tw, lam: () => { tt.chuyenMach.R = false; het(); this.danhDauDoan(doan, 'doan-su-co', true); ung.datChuThich(`<b>Recloser cắt lần 2.</b> Trong khoảng thời gian không điện, ${lbs} (phía trước đoạn sự cố) chuẩn bị mở.`, 'canh-bao'); } });
          buoc.push({ t: 2 * tc + tw + tl, lam: () => { tt.chuyenMach[lbs] = false; ung.datChuThich(`<b>${lbs} tự động MỞ</b> khi đường dây không điện → ${ten} được cô lập khỏi lưới.`); } });
          buoc.push({ t: 2 * tc + 2 * tw + tl, lam: () => { tt.chuyenMach.R = true; ung.datChuThich(`<b>Recloser đóng lại lần 2 thành công:</b> phần lưới trước ${lbs} có điện trở lại. Khu vực phía sau đoạn sự cố mất điện, chờ đội sửa chữa; các khu vực khác vẫn có điện.`, 'thanh-cong'); }, ketThuc: true });
        }
      }
      this.dangChay = { t: 0, buoc, i: 0, ten: this.buocMau(duyTri, doan), xong: false };
      this.capNhat(0);
    },
    capNhat(dt) {
      const c = this.dangChay;
      if (!c || c.xong) return;
      c.t += dt;
      while (c.i < c.buoc.length && c.t >= c.buoc[c.i].t) {
        const b = c.buoc[c.i];
        b.lam();
        c.i += 1;
        if (b.ketThuc) {
          c.xong = true;
          $('#nut-sua-chua').disabled = false;
        }
      }
      this.veCacBuoc(c.ten, c.xong ? c.ten.length : c.i - 1);
    },
    ketThuc() {
      this.khoiPhuc(false);
      document.body.classList.remove('che-do-su-co');
      ung.svg.classList.remove('che-do-su-co');
    },
  };
  nhanDoan.forEach((g) => g.classList.add('an-ngoai-su-co'));

  // ======================== d) Tăng phụ tải đột ngột ========================
  const kt = cauHinh.kichBanTangTai;
  const tangTai = {
    mucTieu: 0,
    lichSu: null,
    tGhi: 0,
    tVe: 0,
    t: 0,
    batDau() {
      this.mucTieu = 0;
      this.lichSu = { Pe: [], Pm: [], f: [] };
      this.t = 0;
      this.tGhi = 0;
      tt.Pthem = { [kt.khuVuc]: 0 };
      tt.tanSo = null;
      bang.innerHTML = `
        <h2>d) Tăng phụ tải đột ngột</h2>
        <p class="mo-ta">Nhà máy công nghiệp khởi động thêm dây chuyền công suất <b>${dinhDangSo(kt.deltaP_MW, 0)} MW</b>. Quan sát công suất tuabin của nhà máy điện tăng theo và tần số hệ thống.</p>
        <button type="button" class="nut nut-chinh" id="nut-tang-tai">⚡ Khởi động nhà máy (+${dinhDangSo(kt.deltaP_MW, 0)} MW)</button>
        <h3>Công suất (MW)</h3>
        <p class="chu-giai-do-thi"><span class="mau" style="background:${MAU_P_YEU_CAU}"></span>Phụ tải yêu cầu (điện)
          <span class="mau" style="background:${MAU_P_TUABIN}"></span>Công suất tuabin (cơ)</p>
        <svg id="dt-cong-suat" class="do-thi-nho" viewBox="0 0 320 130" role="img" aria-label="Đồ thị công suất theo thời gian"></svg>
        <h3>Tần số (Hz)</h3>
        <svg id="dt-tan-so" class="do-thi-nho" viewBox="0 0 320 130" role="img" aria-label="Đồ thị tần số theo thời gian"></svg>
        <p class="ghi-chu-nho">Mô hình tần số rút gọn (rô-to, bộ điều tốc, điều chỉnh tần số cấp 2) chỉ mang tính minh họa định tính.</p>`;
      $('#nut-tang-tai').addEventListener('click', () => {
        const dangTang = this.mucTieu > 0;
        this.mucTieu = dangTang ? 0 : kt.deltaP_MW;
        $('#nut-tang-tai').innerHTML = dangTang
          ? `⚡ Khởi động nhà máy (+${dinhDangSo(kt.deltaP_MW, 0)} MW)`
          : `⏹ Dừng dây chuyền (−${dinhDangSo(kt.deltaP_MW, 0)} MW)`;
        this.daCanBang = false;
        ung.datChuThich(dangTang
          ? 'Dây chuyền dừng: phụ tải giảm đột ngột → thừa công suất, tần số <b>tăng</b> nhẹ; bộ điều tốc giảm công suất tuabin.'
          : `Nhà máy công nghiệp khởi động: phụ tải tăng ${dinhDangSo(kt.deltaP_MW, 0)} MW. Bộ điều tốc chưa kịp tăng công suất tuabin → phần thiếu hụt lấy từ <b>động năng quay của rô-to</b>, tần số <b>giảm</b>.`, dangTang ? '' : 'canh-bao');
      });
      ung.datChuThich('Bấm <b>Khởi động nhà máy</b> để tạo tăng tải đột ngột.');
    },
    capNhat(dt) {
      const hienTai = tt.Pthem[kt.khuVuc] || 0;
      const buoc = (kt.deltaP_MW / kt.thoiGianKhoiDong_s) * dt;
      tt.Pthem[kt.khuVuc] = hienTai < this.mucTieu ? Math.min(this.mucTieu, hienTai + buoc) : Math.max(this.mucTieu, hienTai - buoc);
    },
    sauTinhToan(dt, kq) {
      const p = kt.tanSo;
      if (!tt.tanSo) tt.tanSo = { f: p.f0, Pm: kq.P_phat, Pref: kq.P_phat };
      const n = Math.ceil(dt / 0.02);
      for (let i = 0; i < n; i++) tt.tanSo = buocTanSo(tt.tanSo, kq.P_phat, dt / n, p);
      tt.ghiDePhat = tt.tanSo.Pm;
      this.t += dt;
      if (this.t - this.tGhi >= 0.2 || !this.lichSu.Pe.length) {
        this.tGhi = this.t;
        const ls = this.lichSu;
        ls.Pe.push([this.t, kq.P_phat]);
        ls.Pm.push([this.t, tt.tanSo.Pm]);
        ls.f.push([this.t, tt.tanSo.f]);
        for (const k of ['Pe', 'Pm', 'f']) while (ls[k].length && ls[k][0][0] < this.t - 41) ls[k].shift();
        veDoThiThoiGian($('#dt-cong-suat'), [
          { ten: 'Phụ tải yêu cầu', mau: MAU_P_YEU_CAU, du: ls.Pe },
          { ten: 'Công suất tuabin', mau: MAU_P_TUABIN, du: ls.Pm },
        ], { donVi: 'MW', soLe: 0 });
        veDoThiThoiGian($('#dt-tan-so'), [{ ten: 'Tần số', mau: MAU_TAN_SO, du: ls.f }], { donVi: 'Hz', soLe: 2, yMin: Math.min(49.7, ...ls.f.map((x) => x[1])), yMax: Math.max(50.1, ...ls.f.map((x) => x[1])) });
      }
      if (!this.daCanBang && Math.abs(tt.tanSo.f - p.f0) < 0.01 && Math.abs(tt.tanSo.Pm - kq.P_phat) < 0.5 && this.t > 3 && (tt.Pthem[kt.khuVuc] === this.mucTieu)) {
        if (this.mucTieu > 0 || this.daBam) {
          ung.datChuThich(`Hệ thống đạt cân bằng mới: công suất phát ≈ ${dinhDangSo(tt.tanSo.Pm, 1)} MW = phụ tải + tổn thất; tần số trở về ≈ 50 Hz.`, 'thanh-cong');
        }
        this.daCanBang = true;
      }
      if (this.mucTieu > 0) this.daBam = true;
    },
    ketThuc() {
      tt.Pthem = {};
      tt.tanSo = null;
      tt.ghiDePhat = null;
      this.daBam = false;
    },
  };

  const kb = { 'binh-thuong': binhThuong, 'dien-ap': dienAp, 'su-co': suCo, 'tang-tai': tangTai };
  return ks;
}
