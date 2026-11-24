import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const require = createRequire(new URL('../frontend/package.json', import.meta.url));
const { chromium } = require('@playwright/test');
function arg(name, fallback) { const index = process.argv.indexOf(name); return index < 0 ? fallback : process.argv[index + 1]; }
const baseURL = arg('--base-url', 'http://127.0.0.1:4173');
const url = new URL(baseURL);
if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(url.hostname) || url.username || url.password) throw new Error('Only the local production preview is supported.');
const samples = Number(arg('--samples', '20'));
if (!Number.isInteger(samples) || samples < 10) throw new Error('Use at least ten measured samples.');
const output = resolve(arg('--output', 'docs/artifacts/browser-performance.json'));
const browser = await chromium.launch({ channel: 'chromium' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(baseURL + '/editor');
  await page.locator('.machine-node').first().waitFor();
  await page.getByRole('button', { name: 'Validate machine' }).click();
  await page.getByText('All formal checks passed.').waitFor();
  const workloads = [];
  async function measure(name, endpoint, button, ready) {
    const times = [];
    for (let i = -2; i < samples; i++) {
      const started = performance.now();
      await Promise.all([page.waitForResponse(response => response.url().endsWith('/api/v1/' + endpoint) && response.request().method() === 'POST'), button.click()]);
      await ready();
      if (i >= 0) times.push(performance.now() - started);
    }
    times.sort((a, b) => a - b);
    const p95 = times[Math.ceil(.95 * times.length) - 1];
    const result = { workload: name, measuredRequests: samples, warmups: 2, p50Ms: Number(times[Math.floor(times.length / 2)].toFixed(3)), p95Ms: Number(p95.toFixed(3)), maxMs: Number(times.at(-1).toFixed(3)), targetMs: 2000, targetMet: p95 <= 2000 };
    workloads.push(result);
    console.log(`${name}: p95=${result.p95Ms} ms`);
  }
  await page.getByLabel('Input string').fill('01'.repeat(50));
  await measure('D01-100-token-simulation-click-to-trace', 'simulate', page.getByRole('button', { name: 'Run input' }), () => page.getByRole('button', { name: 'Go to step 100', exact: true }).waitFor());
  await page.getByLabel('Conversion', { exact: true }).selectOption('dfa_to_regex');
  await measure('D01-regex-click-to-verified-artifact-and-diagrams', 'convert', page.getByRole('button', { name: 'Convert machine' }), async () => { await page.getByRole('button', { name: 'Download regex JSON' }).waitFor(); await page.waitForFunction(() => document.querySelectorAll('.conversion .machine-node').length === 6); });
  const report = { schemaVersion: 1, frontend: 'Vite production build served with vite preview', browser: `Chromium ${browser.version()}`, viewport: { width: 1440, height: 1050 }, methodology: 'Sequential warmed click-to-render timings including loopback request, response parsing and visible result creation; no public-network or cold-load claim. API hardware is in performance.json.', workloads, pageErrors: errors, allTargetsMet: !errors.length && workloads.every(row => row.targetMet) };
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  if (!report.allTargetsMet) process.exitCode = 1;
} finally { await browser.close(); }
