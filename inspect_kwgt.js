import JSZip from 'jszip';
import fs from 'fs';

async function inspectKwgt() {
  const data = fs.readFileSync('public/dijital_kutuphanem.kwgt');
  const zip = await JSZip.loadAsync(data);
  console.log('KWGT entries:', Object.keys(zip.files));
  if (zip.files['preset.json']) {
    const text = await zip.files['preset.json'].async('text');
    console.log('preset.json content:', text.slice(0, 300));
  }
}

inspectKwgt().catch(console.error);
