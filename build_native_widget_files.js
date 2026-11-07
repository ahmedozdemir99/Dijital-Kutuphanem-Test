import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

async function generateNativeWidgetFiles() {
  const publicDir = path.resolve('public');

  const presetObject = {
    "preset_info": {
      "title": "Dijital Kütüphanem 3 Sütunlu Canlı Widget",
      "author": "Dijital Kütüphanem",
      "description": "Günün Vecizesi + 1. Kitap, 2. Kur'an, 3. İlim Takibi",
      "version": 2,
      "features": ["3_COLUMNS_PROGRESS", "DAILY_WISDOM", "ONE_CLICK_LAUNCH"]
    },
    "name": "Dijital Kütüphanem 3 Sütunlu Yatay Widget",
    "author": "Dijital Kütüphanem",
    "description": "Kitap, Kur'an ve İlim Yolculuğum 3 Sütunlu Canlı Premium Android Widget",
    "version": 2,
    "config": {
      "width": 720,
      "height": 340,
      "bgColor": "#18050B",
      "borderColor": "#B79A63",
      "borderWidth": 4,
      "borderRadius": 48
    },
    "columns": [
      {
        "id": "col_kitap",
        "title": "1. KİTAP",
        "actionUrl": "https://dijitalkutuphanem.ai.studio/?tab=today",
        "badge": "Bugün",
        "percentFormula": "$wg(\"https://dijitalkutuphanem.ai.studio/api/widget-data\", json, .bookPercent)$",
        "detailFormula": "$wg(\"https://dijitalkutuphanem.ai.studio/api/widget-data\", json, .todayPages)$ / 40 syf"
      },
      {
        "id": "col_quran",
        "title": "2. KUR'AN",
        "actionUrl": "https://dijitalkutuphanem.ai.studio/?tab=explore&sub=quran",
        "badge": "Kur'an",
        "percentFormula": "$wg(\"https://dijitalkutuphanem.ai.studio/api/widget-data\", json, .hatimPercent)$",
        "detailFormula": "$wg(\"https://dijitalkutuphanem.ai.studio/api/widget-data\", json, .currentHizb)$. Hizb"
      },
      {
        "id": "col_ilim",
        "title": "3. İLİM",
        "actionUrl": "https://dijitalkutuphanem.ai.studio/?tab=explore&sub=curriculum",
        "badge": "40 Yıl",
        "percentFormula": "$wg(\"https://dijitalkutuphanem.ai.studio/api/widget-data\", json, .ilimPercent)$",
        "detailFormula": "$wg(\"https://dijitalkutuphanem.ai.studio/api/widget-data\", json, .completedBooks)$ Eser"
      }
    ],
    "root_touch": "https://dijitalkutuphanem.ai.studio"
  };

  const zip = new JSZip();
  zip.file("preset.json", JSON.stringify(presetObject, null, 2));
  zip.file("one4_preset.json", JSON.stringify(presetObject, null, 2));

  const buffer = await zip.generateAsync({ type: 'nodebuffer' });

  fs.writeFileSync(path.join(publicDir, 'dijital_kutuphanem.one4'), buffer);
  fs.writeFileSync(path.join(publicDir, 'dijital_kutuphanem.one4kwgt'), buffer);
  fs.writeFileSync(path.join(publicDir, 'dijital_kutuphanem.kwgt'), buffer);

  console.log('✅ Generated dijital_kutuphanem.one4, dijital_kutuphanem.one4kwgt, dijital_kutuphanem.kwgt successfully!');
}

generateNativeWidgetFiles().catch(console.error);
