import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const routes = [
    { name: 'landing', url: 'http://localhost:5173/' },
    { name: 'cases', url: 'http://localhost:5173/cases' },
    { name: 'case_intro', url: 'http://localhost:5173/case/case-01' },
    { name: 'custody', url: 'http://localhost:5173/case/case-01/custody' },
    { name: 'edit', url: 'http://localhost:5173/case/case-01/edit' },
    { name: 'status', url: 'http://localhost:5173/case/case-01/status' },
    { name: 'reveal', url: 'http://localhost:5173/case/case-01/reveal' },
  ];

  for (const r of routes) {
    try {
      console.log(`Navigating to ${r.url}...`);
      await page.goto(r.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
      const filePath = path.join(outDir, `${r.name}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`Saved screenshot to ${filePath}`);
    } catch (err) {
      console.error(`Error capturing ${r.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('Capture complete!');
}

capture();
