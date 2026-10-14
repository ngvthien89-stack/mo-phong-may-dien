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

async function moTrang(kichThuoc, duongDan, ten) {
  const ctx = await trinhDuyet.newContext({ viewport: kichThuoc, deviceScaleFactor: 1, hasTouch: kichThuoc.width < 600, isMobile: kichThuoc.width < 600 });
  const trang = await ctx.newPage();
  trang.on('pageerror', (e) => { console.error(`lỗi JS (${ten}): ${e.message}`); loi.push(`${ten}: lỗi JS: ${e.message}`); });
  trang.on('console', (m) => { if (m.type() === 'error' && !/katex|cdnjs|ERR_|net::/i.test(m.text())) loi.push(`${ten}: console: ${m.text()}`); });
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
  // Trang mô phỏng
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
