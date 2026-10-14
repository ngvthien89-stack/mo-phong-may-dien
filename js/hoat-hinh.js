/**
 * hoat-hinh.js — Các hiệu ứng chuyển động: hạt công suất, tuabin, khói, MBA "hoạt động",
 * đèn cửa sổ, bầu trời ngày/đêm, tia lửa sự cố.
 */
import { el } from './so-do.js';

const BUOC_MAU = 4; // px giữa hai điểm lấy mẫu trên đường dây

/** Hệ thống hạt sáng chạy dọc đường dây. Mật độ và tốc độ hạt tỉ lệ với công suất. */
export class HatCongSuat {
  constructor({ matDo = 1, tocDo = 90 } = {}) {
    this.matDo = matDo;
    this.tocDo = tocDo;
    this.duong = new Map();
  }

  dangKy(id, { paths, lopHat, mau }) {
    const ds = paths.map((p) => {
      const L = p.getTotalLength();
      const n = Math.max(2, Math.ceil(L / BUOC_MAU));
      const mau_ = new Float32Array((n + 1) * 2);
      for (let i = 0; i <= n; i++) {
        const pt = p.getPointAtLength((L * i) / n);
        mau_[2 * i] = pt.x;
        mau_[2 * i + 1] = pt.y;
      }
      return { L, n, mau: mau_, hat: [] };
    });
    this.duong.set(id, { ds, lopHat, mau, tiLe: 0, tocDoRieng: 1 });
  }

  /** tiLe = P / P_tham_chiếu (0 = mất điện / không có công suất). */
  datTiLe(id, tiLe) {
    const d = this.duong.get(id);
    if (d) d.tiLe = Math.max(0, Math.min(tiLe, 1.8));
  }

  capNhat(dt) {
    for (const d of this.duong.values()) {
      const v = this.tocDo * (0.35 + 0.65 * d.tiLe);
      for (const p of d.ds) {
        const can = d.tiLe <= 0.001 ? 0 : Math.max(1, Math.round((this.matDo * p.L / 36) * d.tiLe));
        while (p.hat.length < can) {
          const c = el('circle', { r: 3.4, class: 'hat', stroke: d.mau }, d.lopHat);
          p.hat.push({ s: Math.random() * p.L, c });
        }
        while (p.hat.length > can) p.hat.pop().c.remove();
        for (const h of p.hat) {
          h.s = (h.s + v * dt) % p.L;
          const f = (h.s / p.L) * p.n;
          const i = Math.floor(f);
          const t = f - i;
          const x = p.mau[2 * i] * (1 - t) + p.mau[2 * i + 2] * t;
          const y = p.mau[2 * i + 1] * (1 - t) + p.mau[2 * i + 3] * t;
          h.c.setAttribute('cx', x.toFixed(1));
          h.c.setAttribute('cy', y.toFixed(1));
        }
      }
    }
  }
}

/** Khói ống khói / hơi nước tháp làm mát: tốc độ và độ đậm theo công suất phát. */
export class Khoi {
  constructor(lop, nguon) {
    this.dsNguon = nguon.map((n) => {
      const hat = [];
      const so = n.loai === 'khoi-nho' ? 4 : 6;
      for (let i = 0; i < so; i++) {
        hat.push({ pha: i / so, c: el('circle', { class: `khoi ${n.loai}` }, lop) });
      }
      return { ...n, hat, muc: 1 };
    });
  }

  datMuc(loai, muc) {
    for (const n of this.dsNguon) if (n.loai === loai) n.muc = muc;
  }

  capNhat(dt) {
    for (const n of this.dsNguon) {
      const lon = n.loai === 'hoi' ? 1.6 : n.loai === 'khoi-nho' ? 0.6 : 1;
      for (const h of n.hat) {
        h.pha = (h.pha + dt * (0.12 + 0.3 * n.muc)) % 1;
        const t = h.pha;
        h.c.setAttribute('cx', (n.x + 22 * t * lon + Math.sin(t * 6) * 3).toFixed(1));
        h.c.setAttribute('cy', (n.y - 60 * t * lon).toFixed(1));
        h.c.setAttribute('r', ((4 + 12 * t) * lon).toFixed(1));
        h.c.setAttribute('opacity', (n.muc <= 0.001 ? 0 : (0.25 + 0.5 * n.muc) * (1 - t)).toFixed(2));
      }
    }
  }
}

/** Vòng sóng quanh MBA: nhịp và độ đậm theo mức mang tải. */
export class SongMBA {
  constructor(dsMBA) {
    this.ds = dsMBA.map((m, i) => ({ ...m, pha: i * 0.17, tai: 0 }));
  }

  datTai(id, tai) {
    for (const m of this.ds) if (m.id === id) m.tai = Math.max(0, Math.min(tai, 1.5));
  }

  capNhat(dt) {
    for (const m of this.ds) {
      m.pha = (m.pha + dt * (0.6 + 0.8 * m.tai)) % 1;
      m.vong.setAttribute('r', (m.r0 * (0.9 + 0.5 * m.pha)).toFixed(1));
      m.vong.setAttribute('opacity', (m.tai <= 0.001 ? 0 : (1 - m.pha) * (0.35 + 0.5 * m.tai)).toFixed(2));
    }
  }
}

/** Bật/tắt đèn cửa sổ: cửa sổ sáng nếu mức tải > ngưỡng ngẫu nhiên riêng của nó. */
export function capNhatCuaSo(dsCuaSo, mucTai) {
  for (const c of dsCuaSo) {
    const sang = mucTai > Number(c.dataset.nguong) * 0.95 + 0.03;
    c.classList.toggle('sang', sang);
  }
}

function tronMau(a, b, t) {
  const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return '#' + pa.map((x, i) => Math.round(x + (pb[i] - x) * t).toString(16).padStart(2, '0')).join('');
}

/** Mức sáng ban ngày 0…1 theo giờ. */
export function mucSangNgay(gio) {
  const s = Math.sin((Math.PI * (gio - 6)) / 12);
  return Math.max(0, Math.min(1, s * 1.6 + 0.1));
}

/** Màu trời, mặt trời / mặt trăng theo giờ. */
export function capNhatBauTroi(ref, gio) {
  const ngay = mucSangNgay(gio);
  const hoang = Math.max(0, 1 - Math.abs(ngay - 0.35) / 0.35) * (gio > 4 && gio < 20 ? 1 : 0);
  let tren = tronMau('#0b1d3a', '#6ec1ef', ngay);
  let duoi = tronMau('#22385e', '#d9f1ff', ngay);
  duoi = tronMau(duoi, '#ffb38a', hoang * 0.7);
  tren = tronMau(tren, '#8f7bb8', hoang * 0.3);
  ref.troiTren.setAttribute('stop-color', tren);
  ref.troiDuoi.setAttribute('stop-color', duoi);
  ref.lopDem.setAttribute('opacity', ((1 - ngay) * 0.38).toFixed(2));
  ref.sao.setAttribute('opacity', Math.max(0, 1 - ngay * 2).toFixed(2));
  // Mặt trời đi từ 6h (trái) đến 18h (phải); mặt trăng ngược lại
  const viTri = (t) => ({ x: 120 + t * 1060, y: 330 - Math.sin(Math.PI * t) * 280 });
  const tMT = (gio - 6) / 12;
  const p = viTri(Math.min(1, Math.max(0, tMT)));
  ref.matTroi.setAttribute('cx', p.x);
  ref.matTroi.setAttribute('cy', p.y);
  ref.matTroi.setAttribute('opacity', tMT > -0.05 && tMT < 1.05 ? 1 : 0);
  const tTr = (((gio + 6) % 24) / 12);
  const q = viTri(Math.min(1, Math.max(0, tTr)));
  ref.matTrang.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`);
  ref.matTrang.setAttribute('opacity', tTr >= 0 && tTr <= 1 ? (1 - ngay) : 0);
}

/** Tia lửa ngắn mạch tại một điểm. */
export class TiaLua {
  constructor(lop) {
    this.lop = lop;
    this.g = null;
  }

  batDau(x, y) {
    this.dung();
    this.g = el('g', { class: 'tia-lua' }, this.lop);
    this.x = x;
    this.y = y;
    this.chop = el('circle', { cx: x, cy: y, r: 18, class: 'chop' }, this.g);
    this.tia = [];
    for (let i = 0; i < 10; i++) this.tia.push(el('path', { class: 'tia' }, this.g));
  }

  capNhat() {
    if (!this.g) return;
    this.chop.setAttribute('r', (10 + Math.random() * 22).toFixed(1));
    this.chop.setAttribute('opacity', (0.4 + Math.random() * 0.6).toFixed(2));
    for (const p of this.tia) {
      const goc = Math.random() * Math.PI * 2;
      const dai = 10 + Math.random() * 28;
      const gx = this.x + Math.cos(goc) * dai * 0.5 + (Math.random() - 0.5) * 8;
      const gy = this.y + Math.sin(goc) * dai * 0.5 + (Math.random() - 0.5) * 8;
      p.setAttribute('d', `M${this.x} ${this.y} L${gx.toFixed(1)} ${gy.toFixed(1)} L${(this.x + Math.cos(goc) * dai).toFixed(1)} ${(this.y + Math.sin(goc) * dai).toFixed(1)}`);
    }
  }

  dung() {
    if (this.g) this.g.remove();
    this.g = null;
  }
}
