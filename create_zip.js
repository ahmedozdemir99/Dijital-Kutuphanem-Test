import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

async function buildZip() {
  const zip = new JSZip();

  const publicDir = path.resolve('public');

  const standaloneHtml = fs.readFileSync(path.join(publicDir, 'standalone_widget.html'), 'utf8');
  const instructions = fs.readFileSync(path.join(publicDir, 'KURULUM_TALIMATLARI.txt'), 'utf8');
  const widgetHtml = fs.readFileSync(path.join(publicDir, 'widget.html'), 'utf8');

  const configJson = {
    name: "Dijital Kütüphanem Canlı Widget",
    version: "2.0",
    url: "https://dijitalkutuphanem.ai.studio/?widget=true",
    type: "webview",
    refreshIntervalMinutes: 30,
    dimensions: "4x2"
  };

  zip.file("standalone_widget.html", standaloneHtml);
  zip.file("KURULUM_TALIMATLARI.txt", instructions);
  zip.file("widget.html", widgetHtml);
  zip.file("widget_config.json", JSON.stringify(configJson, null, 2));

  const content = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(path.join(publicDir, 'dijital_kutuphanem_widget.zip'), content);
  console.log('✅ /public/dijital_kutuphanem_widget.zip successfully generated!');
}

buildZip().catch(console.error);
