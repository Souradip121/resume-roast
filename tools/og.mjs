// Makes assets/og.png (1200 x 630), the link preview: the label on its butter backdrop.
//   node tools/og.mjs [url]
import { writeFileSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';
const b = await launch();
try {
  await b.send('Page.enable');
  await b.send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
  await b.send('Page.navigate', { url: process.argv[2] || 'http://127.0.0.1:8806/' });
  await sleep(1500);
  await b.run('document.fonts.ready.then(() => true)');
  const { data } = await b.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(new URL('../assets/og.png', import.meta.url), Buffer.from(data, 'base64'));
  console.log('saved assets/og.png');
} finally { b.close(); }
