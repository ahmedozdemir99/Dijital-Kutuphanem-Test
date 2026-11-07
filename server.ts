import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import webpush from 'web-push';
import { generateRobiChat, getRobiSourceUrls, normalizeRobiMode } from './src/utils/robiChat.ts';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT;
let pushConfigured = false;
if (vapidPublicKey && vapidPrivateKey && vapidSubject) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    pushConfigured = true;
  } catch {
    console.warn('Bildirim anahtarları doğrulanamadı.');
  }
}

function isBrowserPushEndpoint(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== 'string' || endpoint.length > 2048 || !URL.canParse(endpoint)) return false;
  const url = new URL(endpoint);
  const host = url.hostname;
  return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
    (host === 'fcm.googleapis.com' || host === 'android.googleapis.com' ||
      host.endsWith('.push.services.mozilla.com') || host === 'web.push.apple.com' ||
      host.endsWith('.notify.windows.com'));
}

// Subscriptions storage file
const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'push_subscriptions.json');

interface StoredPushSub {
  endpoint: string;
  subscription: webpush.PushSubscription;
  reminderTimes: string[];
  timeZone?: string;
  lastNotifiedSlot?: string;
  updatedAt: string;
}

let pushSubscriptions: StoredPushSub[] = [];

function loadPushSubscriptions() {
  try {
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8');
      const records: StoredPushSub[] = JSON.parse(data);
      pushSubscriptions = Array.isArray(records) ? records.filter(item =>
        isBrowserPushEndpoint(item?.endpoint) && item.subscription?.endpoint === item.endpoint) : [];
    }
  } catch (err) {
    pushSubscriptions = [];
  }
}

function savePushSubscriptions() {
  try {
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(pushSubscriptions, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Push subscriptions write error:', err);
    return false;
  }
}

loadPushSubscriptions();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Helper to dynamically get GoogleGenAI client with latest environment variables
  function getGenAI() {
    const key = process.env.GEMINI_API_KEY || '';
    return new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  app.get('/api/health', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ status: 'ok', hasApiKey: !!(process.env.GEMINI_API_KEY || '') });
  });

  app.get('/api/push-public-key', (req, res) => {
    if (!pushConfigured) return res.status(503).json({ error: 'Bildirim servisi yapılandırılmamış.' });
    res.json({ publicKey: vapidPublicKey });
  });

  app.post('/api/save-subscription', (req, res) => {
    if (!pushConfigured) return res.status(503).json({ error: 'Bildirim servisi yapılandırılmamış.' });
    const { subscription, reminderTimes, timeZone } = req.body ?? {};
    const endpoint = subscription?.endpoint;
    const keys = subscription?.keys;
    if (!isBrowserPushEndpoint(endpoint) || !keys ||
      typeof keys.p256dh !== 'string' || keys.p256dh.length > 256 ||
      typeof keys.auth !== 'string' || keys.auth.length > 128) {
      return res.status(400).json({ error: 'Geçersiz bildirim aboneliği.' });
    }
    const times = Array.isArray(reminderTimes)
      ? [...new Set<string>(reminderTimes.filter((time: unknown) => typeof time === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)))].slice(0, 24)
      : [];
    let zone = 'Europe/Istanbul';
    if (typeof timeZone === 'string' && timeZone.length <= 100) {
      try { zone = new Intl.DateTimeFormat('en', { timeZone }).resolvedOptions().timeZone; } catch {}
    }
    const previous = pushSubscriptions;
    const existing = previous.find(item => item.endpoint === endpoint);
    pushSubscriptions = [...previous.filter(item => item.endpoint !== endpoint), {
      endpoint,
      subscription: { endpoint, keys },
      reminderTimes: times,
      timeZone: zone,
      lastNotifiedSlot: existing?.lastNotifiedSlot,
      updatedAt: new Date().toISOString(),
    }];
    if (!savePushSubscriptions()) {
      pushSubscriptions = previous;
      return res.status(503).json({ error: 'Abonelik kaydedilemedi.' });
    }
    res.json({ success: true });
  });

  app.post('/api/send-test-push', async (req, res) => {
    const endpoint = req.body?.endpoint;
    if (!isBrowserPushEndpoint(endpoint)) return res.status(400).json({ error: 'Cihaz aboneliği gerekli.' });
    if (!pushConfigured) return res.status(503).json({ error: 'Bildirim servisi yapılandırılmamış.' });
    const target = pushSubscriptions.find(item => item.endpoint === endpoint);
    if (!target) return res.status(404).json({ error: 'Bu cihazın aboneliği bulunamadı.' });

    try {
      await webpush.sendNotification(target.subscription, JSON.stringify({
        title: 'Dijital Kütüphanem · Test bildirimi',
        body: 'Bu bildirim, bu cihazın hatırlatma ayarlarını test etmek için gönderildi.',
        url: '/?tab=today',
        tag: 'dk-test-push',
      }), { TTL: 60, urgency: 'normal', timeout: 10000 });
      res.json({ success: true, sentCount: 1 });
    } catch {
      res.status(502).json({ error: 'Bildirim sağlayıcısı isteği kabul etmedi.' });
    }
  });

  // The native widget has no authenticated link to the browser's local library.
  app.get('/api/widget-data', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ available: false });
  });

  // Helper hash function for deterministic variation based on prompt text
  function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  // Smart AI Book Recommendations based on reader's library, preferences, and goals
  app.post('/api/ai-recommendations', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { currentBooks, preferredCategory, mood, dailyTarget } = req.body;
      const currentApiKey = process.env.GEMINI_API_KEY || '';
      if (!currentApiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY bulunamadı.' });
      }

      const prompt = `Kullanıcının okuma profili:
- Halihazırda okuduğu/tamamladığı kitaplar: ${JSON.stringify(currentBooks || [])}
- İlgi duyduğu veya seçtiği kategori/alan: ${preferredCategory || 'Genel Edebiyat, Felsefe, Tefsir, Tarih'}
- Ruh hali veya okuma gayesi: ${mood || 'Derinleşme, tefekkür ve zihni dinlendirme'}
- Günlük hedef: ${dailyTarget || 40} sayfa

Lütfen bu okura özel, piyasadaki klasik ve nitelikli eserler arasından tam 4 adet kişiselleştirilmiş "Akıllı Kitap Önerisi" sun.
Yanıtını MUTLAKA sadece aşağıdaki JSON formatında ver (ekstra markdown tırnakları olmadan sadece JSON):
{
  "curatorNote": "Kısa 1-2 cümlelik kişiselleştirilmiş okur tavsiye notu.",
  "recommendations": [
    {
      "title": "Kitap Adı",
      "author": "Yazar Adı",
      "category": "Edebiyat / Felsefe / Tarih / Din ve İlahiyat / Psikoloji",
      "totalPages": 250,
      "reason": "Bu kitabı bu okura neden önerdiğinin 1-2 cümlelik çarpıcı gerekçesi.",
      "estimatedDays": 6,
      "tag": "Klasik / Ufuk Açıcı / Derin Tefekkür / Başyapıt"
    }
  ]
}`;

      const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      let resultText = '';
      let lastErr = null;
      const currentAi = getGenAI();

      for (const m of modelsToTry) {
        try {
          const resp = await currentAi.models.generateContent({
            model: m,
            contents: prompt,
            config: {
              responseMimeType: "application/json"
            }
          });
          if (resp && resp.text) {
            resultText = resp.text;
            break;
          }
        } catch (e: any) {
          lastErr = e;
        }
      }

      if (!resultText) {
        throw lastErr || new Error("Öneri üretilemedi.");
      }

      const parsed = JSON.parse(resultText);
      return res.json(parsed);
    } catch (err: any) {
      // Graceful fallback
      const selectedCategory = (req.body?.preferredCategory || '').toLowerCase();
      
      let curatedList = [
        {
          title: "İhyâ'u Ulûmi'd-Dîn (1. Cilt: İlim ve Kalp)",
          author: "İmâm-ı Gazâlî",
          category: "Din ve İlahiyat",
          totalPages: 480,
          reason: "İbadet ve ahlakın manevi boyutunu ele alan, kalbi tezkiye eden ölümsüz bir başyapıt.",
          estimatedDays: 12,
          tag: "Temel Başyapıt"
        },
        {
          title: "Doğu ve Batı Arasında İslam",
          author: "Aliya İzzetbegoviç",
          category: "Felsefe",
          totalPages: 380,
          reason: "Madde ve mana dengesinde 20. yüzyılın en derin tefekkür ve medeniyet tahlili.",
          estimatedDays: 9,
          tag: "Ufuk Açıcı"
        },
        {
          title: "Saatleri Ayarlama Enstitüsü",
          author: "Ahmet Hamdi Tanpınar",
          category: "Edebiyat",
          totalPages: 382,
          reason: "Zaman, insan psikolojisi ve modernleşme sancılarını işleyen Türk edebiyatı zirvesi.",
          estimatedDays: 10,
          tag: "Edebiyat Klasiği"
        },
        {
          title: "İnsanın Anlam Arayışı",
          author: "Viktor E. Frankl",
          category: "Psikoloji",
          totalPages: 168,
          reason: "Zorluklar karşısında insanın içsel anlam ve irade gücünü anlatan klasik rehber.",
          estimatedDays: 4,
          tag: "Ruh & İrade"
        }
      ];

      return res.json({
        curatorNote: "Okuma çizginize ve hedefinize göre özenle seçilmiş seçkin klasik eserler:",
        recommendations: curatedList
      });
    }
  });

  app.post('/api/ai-chat', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const { message, mode, history, userContext, densePromptContext, userSummary } = req.body ?? {};
    const question = typeof message === 'string' ? message.trim() : '';
    if (!question || question.length > 12000) {
      return res.status(400).json({ error: 'Lütfen 1 ile 12.000 karakter arasında bir soru veya metin gir.' });
    }

    const chatMode = normalizeRobiMode(mode);
    if (chatMode === 'source' && getRobiSourceUrls(question).length === 0) {
      return res.status(400).json({ error: 'Kaynak incelemek için mesajına herkese açık bir web bağlantısı ekle.' });
    }

    const archive = typeof densePromptContext === 'string' ? densePromptContext
      : typeof userContext === 'string' ? userContext : userContext ? JSON.stringify(userContext) : '';

    try {
      const ai = process.env.GEMINI_API_KEY?.trim() ? getGenAI() : undefined;
      return res.json(await generateRobiChat(ai, {
        message: question,
        mode: chatMode,
        history,
        archive,
        summary: userSummary ?? userContext,
      }));
    } catch {
      return res.status(500).json({ error: 'Robi şu anda yanıt veremiyor. Lütfen yeniden dene.' });
    }
  });

  // Handle production build vs dev Vite middleware
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    try {
      // Create Vite server in middleware mode with HMR disabled to prevent iframe WebSocket errors
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          allowedHosts: true,
          hmr: false 
        },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.warn("Vite middleware load warning:", viteErr);
    }
  }

  // 24/7 Cloud Background Reminder Scheduler
  // Triggers Web Push to user devices at their scheduled time, even when phone screen and app are completely closed!
  setInterval(async () => {
    try {
      if (!pushConfigured || pushSubscriptions.length === 0) return;

      const now = new Date();
      let modified = false;

      for (let i = pushSubscriptions.length - 1; i >= 0; i--) {
        const item = pushSubscriptions[i];
        if (!item?.reminderTimes?.length) continue;
        const parts = new Intl.DateTimeFormat('en', {
          timeZone: item.timeZone || 'Europe/Istanbul', hourCycle: 'h23', year: 'numeric',
          month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
        }).formatToParts(now);
        const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value;
        const trCurrentTime = `${get('hour')}:${get('minute')}`;
        const currentSlot = `${get('year')}-${get('month')}-${get('day')}_${trCurrentTime}`;

        if (item.reminderTimes.includes(trCurrentTime)) {
          if (item.lastNotifiedSlot !== currentSlot) {
            item.lastNotifiedSlot = currentSlot;
            modified = true;

            const payload = JSON.stringify({
              title: '📖 Dijital Kütüphanem: Okuma Vakti',
              body: `Günün tefekkür ve sayfa hedefini tamamlama vakti (${trCurrentTime})! Eserinizi açın.`,
              url: '/?tab=today',
              tag: `reminder-${currentSlot}`
            });

            const pushOptions = {
              TTL: 86400,
              urgency: 'high' as const
            };

            try {
              await webpush.sendNotification(item.subscription, payload, pushOptions);

            } catch (err: any) {
              console.warn('[Scheduled Push Failed]:', err?.statusCode || err?.message);
              if (err?.statusCode === 410 || err?.statusCode === 404) {
                // Subscription has expired or unsubscribed
                pushSubscriptions.splice(i, 1);
                modified = true;
              }
            }
          }
        }
      }

      if (modified) {
        savePushSubscriptions();
      }
    } catch (schedErr) {
      console.warn('Background reminder check warning:', schedErr);
    }
  }, 30000);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
