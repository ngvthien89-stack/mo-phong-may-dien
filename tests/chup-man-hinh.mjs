/**
 * Chụp ảnh màn hình và tự kiểm tra bố cục bằng Playwright.
 *  - Kích thước 1920×1080 (máy chiếu 16:9) và 390×844 (điện thoại)
 *  - Kiểm tra: không lỗi JavaScript, các nhãn trong sơ đồ không đè nhau, không tràn ngang trang
 * Chạy: npm run screenshot   (ảnh lưu trong thư mục anh-chup/)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const goc = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const thuMucAnh = path.join(goc, process.env.THU_MUC_ANH || 'anh-chup');
fs.mkdirSync(thuMucAnh, { recursive: true });

async function napPlaywright() {
  try { return await import('playwright'); } catch { /* thử bản cài toàn cục */ }
  const g = execSync('npm root -g').toString().trim();
  return import(path.join(g, 'playwright', 'index.mjs'));
}

const KIEU = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const mayChu = http.createServer((req, res) => {
  const p = path.join(goc, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  const tep = p.endsWith('/') ? path.join(p, 'index.html') : p;
  if (!tep.startsWith(goc) || !fs.existsSync(tep)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': KIEU[path.extname(tep)] || 'application/octet-stream' });
  fs.createReadStream(tep).pipe(res);
});
await new Promise((ok) => mayChu.listen(0, ok));
const goc_url = `http://127.0.0.1:${mayChu.address().port}`;

const { chromium } = await napPlaywright();
const trinhDuyet = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const loi = [];

/** Kiểm tra nhãn SVG đè nhau và trang tràn ngang. */
async function kiemTraBoCuc(trang, ten) {
  const kq = await trang.evaluate(() => {
    const hop = [...document.querySelectorAll('#so-do .nhan')]
      .filter((g) => g.getBoundingClientRect().width > 0 && getComputedStyle(g).display !== 'none')
      .map((g) => ({ ten: g.querySelector('.chu-nhan').textContent, r: g.querySelector('.nen-nhan').getBoundingClientRect() }));
    const khac = [...document.querySelectorAll('#so-do .nen-chu-giai, #so-do .nen-do-thi')].map((g) => ({ ten: g.getAttribute('class'), r: g.getBoundingClientRect() }));
    const de = [];
    const giao = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
    for (let i = 0; i < hop.length; i++) {
      for (let j = i + 1; j < hop.length; j++) if (giao(hop[i].r, hop[j].r)) de.push(`"${hop[i].ten}" ↔ "${hop[j].ten}"`);
      for (const k of khac) if (giao(hop[i].r, k.r)) de.push(`"${hop[i].ten}" ↔ ${k.ten}`);
    }
    const svg = document.querySelector('#so-do')?.getBoundingClientRect();
    const tran = svg ? hop.filter((h) => h.r.left < svg.left - 1 || h.r.right > svg.right + 1 || h.r.top < svg.top - 1 || h.r.bottom > svg.bottom + 1).map((h) => h.ten) : [];
    return { soNhan: hop.length, de, tran, rongTrang: document.documentElement.scrollWidth, rongCuaSo: innerWidth };
  });
  const vanDe = [];
  if (kq.de.length) vanDe.push(`nhãn đè nhau: ${kq.de.join('; ')}`);
  if (kq.tran.length) vanDe.push(`nhãn tràn khỏi sơ đồ: ${kq.tran.join('; ')}`);
  if (kq.rongTrang > kq.rongCuaSo + 1) vanDe.push(`trang tràn ngang (${kq.rongTrang}px > ${kq.rongCuaSo}px)`);
  console.log(`${vanDe.length ? '✗' : '✓'} ${ten}: ${kq.soNhan} nhãn${vanDe.length ? ' — ' + vanDe.join(' | ') : ''}`);
  if (vanDe.length) loi.push(`${ten}: ${vanDe.join(' | ')}`);
}

/** Trang 1.2.a: kiểm tra các dòng chữ SVG đang hiển thị không đè lên nhau và không tràn khỏi khung thẻ. */
// Trang dùng khung chung (js/khung-trang.js): [tệp, mã bài, các kịch bản]
const BAI_MBA = [
  ['nguyen-ly-mba', '2.5–2.7', ['nguyen-ly', 'he-so-k', 'dinh-muc']],
  ['phuong-trinh-mba', '3.1–3.2', ['dien-ap', 'std', 'quy-doi']],
  ['so-do-thay-the', '3.3', ['so-do', 'vecto', 'sai-so']],
];

async function kiemTraChuSvg(trang, ten) {
  const kq = await trang.evaluate(() => {
    const hienThi = (e) => e.checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) ?? true;
    const chu = [...document.querySelectorAll('#so-do text')]
      .filter((t) => t.textContent.trim() && hienThi(t))
      .map((t) => ({ t, r: t.getBoundingClientRect(), the: t.closest('.khu')?.querySelector('.the-svg')?.getBoundingClientRect() }))
      .filter((c) => c.r.width > 0);
    const giao = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
    const de = [];
    for (let i = 0; i < chu.length; i++) for (let j = i + 1; j < chu.length; j++) {
      if (giao(chu[i].r, chu[j].r)) de.push(`"${chu[i].t.textContent}" ↔ "${chu[j].t.textContent}"`);
    }
    const tran = chu.filter((c) => c.the && (c.r.left < c.the.left - 1 || c.r.right > c.the.right + 1 || c.r.top < c.the.top - 1 || c.r.bottom > c.the.bottom + 1)).map((c) => c.t.textContent);
    return { so: chu.length, de, tran, rongTrang: document.documentElement.scrollWidth, rongCuaSo: innerWidth };
  });
  const vanDe = [];
  if (kq.de.length) vanDe.push(`chữ đè nhau: ${kq.de.join('; ')}`);
  if (kq.tran.length) vanDe.push(`chữ tràn khỏi khung: ${kq.tran.join('; ')}`);
  if (kq.rongTrang > kq.rongCuaSo + 1) vanDe.push(`trang tràn ngang (${kq.rongTrang}px > ${kq.rongCuaSo}px)`);
  console.log(`${vanDe.length ? '✗' : '✓'} ${ten}: ${kq.so} dòng chữ SVG${vanDe.length ? ' — ' + vanDe.join(' | ') : ''}`);
  if (vanDe.length) loi.push(`${ten}: ${vanDe.join(' | ')}`);
}

async function moTrang(kichThuoc, duongDan, ten) {
  const ctx = await trinhDuyet.newContext({ viewport: kichThuoc, deviceScaleFactor: 1, hasTouch: kichThuoc.width < 600, isMobile: kichThuoc.width < 600 });
  const trang = await ctx.newPage();
  trang.on('pageerror', (e) => { console.error(`lỗi JS (${ten}): ${e.message}`); loi.push(`${ten}: lỗi JS: ${e.message}`); });
  trang.on('console', (m) => {
    if (m.type() === 'error' && !/katex|cdnjs|ERR_|net::/i.test(m.text())) {
      console.error(`lỗi console (${ten}): ${m.text()}`);
      loi.push(`${ten}: console: ${m.text()}`);
    }
  });
  // Môi trường không truy cập được CDN: có thể trỏ KATEX_DIR tới thư mục dist của gói katex để thử công thức
  await trang.route(/cdnjs\.cloudflare\.com/, (r) => {
    const thuMuc = process.env.KATEX_DIR;
    const tep = thuMuc && path.join(thuMuc, new URL(r.request().url()).pathname.split('/KaTeX/0.16.9/')[1] || '');
    if (tep && fs.existsSync(tep)) return r.fulfill({ path: tep });
    return process.env.CHO_CDN ? r.continue() : r.abort();
  });
  await trang.goto(goc_url + duongDan);
  return { ctx, trang };
}

const chup = (trang, ten, tuyChon = {}) => trang.screenshot({ path: path.join(thuMucAnh, `${ten}.png`), ...tuyChon });

for (const [nhan, kt] of [['1920x1080', { width: 1920, height: 1080 }], ['390x844', { width: 390, height: 844 }]]) {
  const laDT = kt.width < 600;
  // Trang chủ
  {
    const { ctx, trang } = await moTrang(kt, '/index.html', `trang-chu ${nhan}`);
    await trang.waitForSelector('.the-bai');
    await chup(trang, `trang-chu-${nhan}`, { fullPage: true });
    await kiemTraBoCuc(trang, `trang-chu ${nhan}`);
    await ctx.close();
  }
  // Trang 1.2.a – Định luật cảm ứng điện từ
  {
    const { ctx, trang } = await moTrang(kt, '/cam-ung-dien-tu.html', `cam-ung ${nhan}`);
    await trang.waitForSelector('body.da-san-sang');
    await trang.waitForTimeout(1600);
    await chup(trang, `faraday-a-nam-cham-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.2.a a) nam châm ${nhan}`);
    // kéo nam châm bằng chuột
    const hop = await trang.locator('#so-do .vung-keo').boundingBox();
    await trang.mouse.move(hop.x + hop.width / 2, hop.y + hop.height / 2);
    await trang.mouse.down();
    for (let k = 1; k <= 8; k++) { await trang.mouse.move(hop.x + hop.width / 2 + k * 12, hop.y + hop.height / 2); await trang.waitForTimeout(30); }
    await chup(trang, `faraday-a-keo-${nhan}`, { fullPage: laDT });
    await trang.mouse.up();
    await trang.selectOption('#chon-kich-ban', 'hinh-thang');
    await trang.locator('#hien-lenz').check();
    await trang.waitForTimeout(1200);
    await chup(trang, `faraday-b-hinh-thang-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.2.a b) hình thang ${nhan}`);
    await trang.selectOption('#chon-kich-ban', 'hinh-sin');
    await trang.waitForTimeout(1500);
    await chup(trang, `faraday-c-hinh-sin-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.2.a c) hình sin ${nhan}`);
    await trang.selectOption('#chon-kich-ban', 'thanh-dan');
    await trang.waitForTimeout(1500);
    await chup(trang, `faraday-d-thanh-dan-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.2.a d) thanh dẫn ${nhan}`);
    await trang.locator('#td-dao').click();
    await trang.waitForTimeout(800);
    await chup(trang, `faraday-d-doi-chieu-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.2.a d) đổi chiều ${nhan}`);
    await trang.locator('#nut-trinh-chieu').click();
    for (let k = 0; k < 7; k++) await trang.keyboard.press('ArrowRight');
    await trang.waitForTimeout(800);
    await chup(trang, `faraday-trinh-chieu-ban-tay-${nhan}`);
    await trang.keyboard.press('Home');
    for (let k = 0; k < 2; k++) await trang.keyboard.press('ArrowRight');
    await trang.waitForTimeout(1500);
    await chup(trang, `faraday-trinh-chieu-${nhan}`);
    await trang.keyboard.press('Escape');
    await trang.locator('#nut-cau-hoi').click();
    await trang.locator('.ch-phuong-an').nth(2).click();
    await chup(trang, `faraday-cau-hoi-${nhan}`);
    await ctx.close();
  }
  // Trang 1.2.b – Định luật lực điện từ
  {
    const { ctx, trang } = await moTrang(kt, '/luc-dien-tu.html', `luc-dien-tu ${nhan}`);
    await trang.waitForSelector('body.da-san-sang');
    await trang.waitForTimeout(1200);
    await chup(trang, `luc-a-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.2.b a) lực điện từ ${nhan}`);
    await trang.locator('#ld-dao-i').click();
    await trang.waitForTimeout(500);
    await chup(trang, `luc-a-dao-i-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.2.b a) đảo chiều i ${nhan}`);
    await trang.locator('#ld-dao-b').click();
    await trang.waitForTimeout(500);
    await chup(trang, `luc-a-dao-ca-hai-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.2.b a) đảo cả i và B ${nhan}`);
    await trang.selectOption('#chon-kich-ban', 'dong-co');
    await trang.waitForTimeout(2500);
    await chup(trang, `luc-b-dong-co-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.2.b b) động cơ ${nhan}`);
    await trang.locator('#nut-trinh-chieu').click();
    for (let k = 0; k < 2; k++) await trang.keyboard.press('ArrowRight');
    await trang.waitForTimeout(800);
    await chup(trang, `luc-trinh-chieu-${nhan}`);
    await trang.keyboard.press('Escape');
    await trang.locator('#nut-cau-hoi').click();
    await trang.locator('.ch-phuong-an').nth(1).click();
    await chup(trang, `luc-cau-hoi-${nhan}`);
    await ctx.close();
  }
  // Trang 1.2.c – Định luật toàn dòng điện
  {
    const { ctx, trang } = await moTrang(kt, '/toan-dong-dien.html', `toan-dong-dien ${nhan}`);
    await trang.waitForSelector('body.da-san-sang');
    await trang.waitForTimeout(2600);
    await chup(trang, `toan-a-ampere-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.2.c a) ampere ${nhan}`);
    await trang.locator('#td-cn').click();
    await trang.waitForTimeout(1200);
    await chup(trang, `toan-a-chu-nhat-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.2.c a) C hình chữ nhật ${nhan}`);
    await trang.selectOption('#chon-kich-ban', 'mach-tu');
    await trang.waitForTimeout(1200);
    await chup(trang, `toan-b-mach-tu-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.2.c b) mạch từ ${nhan}`);
    await trang.locator('#nut-trinh-chieu').click();
    for (let k = 0; k < 2; k++) await trang.keyboard.press('ArrowRight');
    await trang.waitForTimeout(1500);
    await chup(trang, `toan-trinh-chieu-${nhan}`);
    await trang.keyboard.press('Escape');
    await trang.locator('#nut-cau-hoi').click();
    await trang.locator('.ch-phuong-an').nth(1).click();
    await chup(trang, `toan-cau-hoi-${nhan}`);
    await ctx.close();
  }
  // Trang 1.3 – Vật liệu dùng trong máy điện
  {
    const { ctx, trang } = await moTrang(kt, '/vat-lieu.html', `vat-lieu ${nhan}`);
    await trang.waitForSelector('body.da-san-sang');
    await trang.waitForTimeout(600);
    await chup(trang, `vat-lieu-a-khay-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.3 a) khay ${nhan}`);
    // bấm chọn thẻ rồi bấm vào ô nhóm: một lần đúng, một lần sai
    const xepThe = async (ten, nhom) => {
      await trang.locator('.the-vl', { hasText: ten }).click();
      await trang.locator(`.o-nhom[data-nhom="${nhom}"] .vung-tha`).click();
    };
    await xepThe('Mica', 'cach-dien');
    await xepThe('Gang', 'dan-dien');
    await trang.waitForTimeout(600);
    await chup(trang, `vat-lieu-a-dang-xep-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.3 a) đang xếp ${nhan}`);
    await trang.locator('#pl-dap-an').click();
    await trang.waitForTimeout(400);
    await chup(trang, `vat-lieu-a-dap-an-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.3 a) đáp án ${nhan}`);
    await trang.selectOption('#chon-kich-ban', 'mba');
    await trang.locator('.hang-bp[data-bp="day-quan-cao"]').click();
    await trang.waitForTimeout(400);
    await chup(trang, `vat-lieu-b-mba-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.3 b) máy biến áp ${nhan}`);
    await trang.locator('#mba-to-mau').check();
    await trang.waitForTimeout(300);
    await chup(trang, `vat-lieu-b-to-mau-${nhan}`, { fullPage: laDT });
    await trang.selectOption('#chon-kich-ban', 'nhiet-do');
    await trang.waitForTimeout(1500);
    await chup(trang, `vat-lieu-c-nhiet-do-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `1.3 c) cấp cách điện ${nhan}`);
    await trang.locator('#nut-trinh-chieu').click();
    for (let k = 0; k < 3; k++) await trang.keyboard.press('ArrowRight');
    await trang.waitForTimeout(800);
    await chup(trang, `vat-lieu-trinh-chieu-${nhan}`);
    await trang.keyboard.press('Escape');
    await trang.locator('#nut-cau-hoi').click();
    await trang.locator('.ch-phuong-an').nth(1).click();
    await chup(trang, `vat-lieu-cau-hoi-${nhan}`);
    await ctx.close();
  }
  // Trang 2.1–2.3 – Định nghĩa, vai trò, công dụng của MBA
  {
    const { ctx, trang } = await moTrang(kt, '/khai-niem-mba.html', `khai-niem-mba ${nhan}`);
    await trang.waitForSelector('body.da-san-sang');
    await trang.waitForTimeout(1200);
    await chup(trang, `mba-a-dinh-nghia-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `2.1 a) định nghĩa ${nhan}`);
    await trang.locator('#dn-mot-chieu').check();
    await trang.waitForTimeout(600);
    await chup(trang, `mba-a-mot-chieu-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `2.1 a) một chiều ${nhan}`);
    await trang.selectOption('#chon-kich-ban', 'truyen-tai');
    await trang.locator('[data-ud="500"]').click();
    await trang.waitForTimeout(1200);
    await chup(trang, `mba-b-truyen-tai-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `2.2 b) truyền tải 500 kV ${nhan}`);
    await trang.locator('[data-ud="21"]').click();
    await trang.waitForTimeout(800);
    await chup(trang, `mba-b-21kV-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `2.2 b) truyền tải 21 kV ${nhan}`);
    await trang.selectOption('#chon-kich-ban', 'chuyen-dung');
    await trang.waitForTimeout(1500);
    await chup(trang, `mba-c-chuyen-dung-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `2.3 c) chuyên dụng ${nhan}`);
    await trang.locator('#nut-trinh-chieu').click();
    for (let k = 0; k < 4; k++) await trang.keyboard.press('ArrowRight');
    await trang.waitForTimeout(1200);
    await chup(trang, `mba-trinh-chieu-${nhan}`);
    await trang.keyboard.press('Escape');
    await trang.locator('#nut-cau-hoi').click();
    await trang.locator('.ch-phuong-an').nth(1).click();
    await chup(trang, `mba-cau-hoi-${nhan}`);
    await ctx.close();
  }
  // Trang 2.4 – Cấu tạo MBA
  {
    const { ctx, trang } = await moTrang(kt, '/cau-tao-mba.html', `cau-tao-mba ${nhan}`);
    await trang.waitForSelector('body.da-san-sang');
    await trang.waitForTimeout(800);
    await chup(trang, `cau-tao-a-ruot-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `2.4 a) ruột máy ${nhan}`);
    await trang.locator('#lr-tu-dong').click();
    await trang.waitForTimeout(2600);
    await trang.locator('#lr-la-thep').uncheck();
    await trang.waitForTimeout(400);
    await chup(trang, `cau-tao-a-dang-lap-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `2.4 a) đang lắp, lõi liền ${nhan}`);
    await trang.selectOption('#chon-kich-ban', 'day-quan');
    await trang.locator('.o-kieu[data-kieu="c"] .ten-kieu').click();
    await trang.waitForTimeout(1500);
    await chup(trang, `cau-tao-b-dong-tam-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `2.4 b) đồng tâm ${nhan}`);
    await trang.locator('[data-sx="xen-ke"]').click();
    await trang.waitForTimeout(700);
    await chup(trang, `cau-tao-b-xen-ke-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `2.4 b) xen kẽ ${nhan}`);
    await trang.selectOption('#chon-kich-ban', 'vo-may');
    await trang.locator('.hang-bp[data-bp="binh"] .nen-hang-bp').click();
    await trang.locator('#vm-nhiet').fill('90');
    await trang.waitForTimeout(1200);
    await chup(trang, `cau-tao-c-vo-may-${nhan}`, { fullPage: laDT });
    await kiemTraChuSvg(trang, `2.4 c) vỏ máy ${nhan}`);
    await trang.locator('#nut-trinh-chieu').click();
    for (let k = 0; k < 3; k++) await trang.keyboard.press('ArrowRight');
    await trang.waitForTimeout(1600);
    await chup(trang, `cau-tao-trinh-chieu-${nhan}`);
    await trang.keyboard.press('Escape');
    await trang.locator('#nut-cau-hoi').click();
    await trang.locator('.ch-phuong-an').nth(1).click();
    await chup(trang, `cau-tao-cau-hoi-${nhan}`);
    await ctx.close();
  }
  // Các trang phần II–VI dùng khung chung: chụp mỗi kịch bản, một bước trình chiếu và câu hỏi
  for (const [tep, ma, dsKichBan] of BAI_MBA) {
    const { ctx, trang } = await moTrang(kt, `/${tep}.html`, `${tep} ${nhan}`);
    await trang.waitForSelector('body.da-san-sang');
    for (const kb of dsKichBan) {
      await trang.selectOption('#chon-kich-ban', kb);
      await trang.waitForTimeout(1200);
      await chup(trang, `${tep}-${kb}-${nhan}`, { fullPage: laDT });
      await kiemTraChuSvg(trang, `${ma} ${kb} ${nhan}`);
    }
    await trang.locator('#nut-trinh-chieu').click();
    for (let k = 0; k < 2; k++) await trang.keyboard.press('ArrowRight');
    await trang.waitForTimeout(1000);
    await chup(trang, `${tep}-trinh-chieu-${nhan}`);
    await trang.keyboard.press('Escape');
    await trang.locator('#nut-cau-hoi').click();
    await trang.locator('.ch-phuong-an').nth(1).click();
    await chup(trang, `${tep}-cau-hoi-${nhan}`);
    await ctx.close();
  }
  // Trang mô phỏng 1.1
  const { ctx, trang } = await moTrang(kt, '/he-thong-dien.html', `he-thong-dien ${nhan}`);
  await trang.waitForSelector('body.da-san-sang');
  await trang.waitForTimeout(1500);
  await chup(trang, `a-binh-thuong-${nhan}`, { fullPage: laDT });
  await kiemTraBoCuc(trang, `a) bình thường ${nhan}`);

  // Ban ngày, bảng thông tin
  await trang.evaluate(() => { const o = document.querySelector('#thoi-gian'); o.value = 11; o.dispatchEvent(new Event('input')); });
  await trang.waitForTimeout(600);
  await trang.locator('#so-do .nhan[data-id="nguon-phat"]').click();
  await trang.waitForTimeout(600);
  await chup(trang, `thong-tin-${nhan}`);
  await trang.locator('#bang-thong-tin .nut-dong').click();

  // b) Điện áp truyền tải
  await trang.selectOption('#chon-kich-ban', 'dien-ap');
  await trang.locator('.nut-u[data-u="22"]').click();
  await trang.waitForTimeout(800);
  await chup(trang, `b-dien-ap-22kV-${nhan}`, { fullPage: laDT });
  await kiemTraBoCuc(trang, `b) điện áp 22 kV ${nhan}`);
  await trang.locator('.nut-u[data-u="500"]').click();
  await trang.waitForTimeout(500);
  await chup(trang, `b-dien-ap-500kV-${nhan}`, { fullPage: laDT });

  // c) Sự cố: tăng tốc độ để đi hết các bước
  await trang.selectOption('#chon-kich-ban', 'su-co');
  await trang.evaluate(() => { const o = document.querySelector('#toc-do'); o.value = 3; o.dispatchEvent(new Event('input')); });
  await kiemTraBoCuc(trang, `c) sự cố ${nhan}`);
  await trang.locator('#so-do .nhan-doan[data-doan="s2"]').click();
  await trang.waitForTimeout(250);
  await chup(trang, `c-su-co-ngan-mach-${nhan}`, { fullPage: laDT });
  await trang.waitForFunction(() => !document.querySelector('#nut-sua-chua').disabled, null, { timeout: 15000 });
  await trang.waitForTimeout(400);
  await chup(trang, `c-su-co-co-lap-${nhan}`, { fullPage: laDT });

  // d) Tăng tải
  await trang.selectOption('#chon-kich-ban', 'tang-tai');
  await trang.waitForTimeout(500);
  await trang.locator('#nut-tang-tai').click();
  await trang.waitForTimeout(3500);
  await chup(trang, `d-tang-tai-${nhan}`, { fullPage: laDT });
  await kiemTraBoCuc(trang, `d) tăng tải ${nhan}`);

  // Trình chiếu
  await trang.selectOption('#chon-kich-ban', 'binh-thuong');
  await trang.locator('#nut-trinh-chieu').click();
  for (let k = 0; k < 3; k++) await trang.keyboard.press('ArrowRight');
  await trang.waitForTimeout(700);
  await chup(trang, `trinh-chieu-B-${nhan}`);
  await trang.keyboard.press('Escape');

  // Câu hỏi
  await trang.locator('#nut-cau-hoi').click();
  await trang.locator('.ch-phuong-an').first().click();
  await trang.waitForTimeout(300);
  await chup(trang, `cau-hoi-${nhan}`);
  await ctx.close();
}

await trinhDuyet.close();
mayChu.close();
if (loi.length) {
  console.error(`\n${loi.length} vấn đề:\n - ${loi.join('\n - ')}`);
  process.exit(1);
}
console.log(`\nĐã lưu ảnh vào ${path.relative(goc, thuMucAnh)}/ — không phát hiện vấn đề.`);
