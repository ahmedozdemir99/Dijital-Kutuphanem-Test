import JSZip from 'jszip';
import fs from 'fs';

async function inspectKwgtFull() {
  const data = fs.readFileSync('public/dijital_kutuphanem.kwgt');
  const zip = await JSZip.loadAsync(data);
  const text = await zip.files['preset.json'].async('text');
  console.log('Full preset.json:', text);
}

inspectKwgtFull().catch(console.error);
