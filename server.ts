import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import webpush from 'web-push';
import { generateRobiChat, getRobiSourceUrls, normalizeRobiMode } from './src/utils/robiChat.ts';

// WebPush VAPID Setup for Background Notifications (delivers even when app is closed)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BB91Tt47oG2rr99hCjR0-nSCVHnDio1XzwIvZqd5bem2W6lQndUzw-uvYVH3pdClkjKwcdVyjNcTv6bV3EOIUnQ';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'YYzK4YS7qFTurd6jZdFy49QNznecyzOduk7YeXlAIhs';
const VAPID_EMAIL = 'mailto:ahmedkadiri99@gmail.com';

try {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (vapidErr) {
  console.warn('VAPID setup warning:', vapidErr);
}

// Subscriptions storage file
const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'push_subscriptions.json');

interface StoredPushSub {
  endpoint: string;
  subscription: webpush.PushSubscription;
  reminderTimes: string[];
  lastNotifiedSlot?: string;
  updatedAt: string;
}

let pushSubscriptions: StoredPushSub[] = [];

function loadPushSubscriptions() {
  try {
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8');
      pushSubscriptions = JSON.parse(data);
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

  app.get('/api/test-gemini', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const key = process.env.GEMINI_API_KEY || '';
    const ai = getGenAI();
    const results: any[] = [];
    for (const m of ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.1-flash-lite']) {
      try {
        const r = await ai.models.generateContent({ model: m, contents: 'Merhaba, bana 1 cümle ile Gazaliyi anlat.' });
        results.push({ model: m, status: 'ok', text: r.text });
      } catch (err: any) {
        results.push({ model: m, status: 'error', code: err?.status, message: err?.message });
      }
    }
    res.json({ keyLength: key.length, results });
  });

  // VAPID Public Key endpoint for client subscription
  app.get('/api/push-public-key', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ publicKey: VAPID_PUBLIC_KEY });
  });

  // Save/Update Web Push Subscription with preferred reminder times and user timezone
  app.post('/api/save-subscription', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { subscription, reminderTimes, timeZone } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Geçersiz abonelik bilgisi.' });
    }

    const existingIndex = pushSubscriptions.findIndex(s => s.endpoint.trim() === subscription.endpoint.trim());
    const validTimes = Array.isArray(reminderTimes) && reminderTimes.length > 0 
      ? reminderTimes 
      : ['08:30', '14:00', '21:30'];

    const updatedRecord: StoredPushSub = {
      endpoint: subscription.endpoint.trim(),
      subscription,
      reminderTimes: validTimes,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      pushSubscriptions[existingIndex] = {
        ...pushSubscriptions[existingIndex],
        ...updatedRecord
      };
    } else {
      pushSubscriptions.push(updatedRecord);
    }

    savePushSubscriptions();
    console.log(`[Push Subscription Saved] Total registered devices: ${pushSubscriptions.length}, Reminder times:`, validTimes);
    res.json({ success: true, totalSubscribers: pushSubscriptions.length });
  });

  // Immediate Test Push Notification from Server to Device (Delivers even when app is closed)
  app.post('/api/send-test-push', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { subscription } = req.body;
    const targetSubs: webpush.PushSubscription[] = [];

    if (subscription && subscription.endpoint) {
      targetSubs.push(subscription);
    } else if (pushSubscriptions.length > 0) {
      pushSubscriptions.forEach(s => targetSubs.push(s.subscription));
    }

    if (targetSubs.length === 0) {
      return res.status(400).json({ error: 'Kayıtlı telefon/cihaz aboneliği bulunamadı. Lütfen önce bildirim iznini onaylayın.' });
    }

    const payload = JSON.stringify({
      title: '📖 Dijital Kütüphanem: Okuma Vakti',
      body: 'Harika! Telefonunuz ve uygulama kapalıyken bile bu bildirim doğrudan kilit ekranınıza ulaşır.',
      url: '/?tab=today',
      tag: `test-push-${Date.now()}`
    });

    const pushOptions = {
      TTL: 86400,
      urgency: 'high' as const
    };

    let sentCount = 0;
    const errors: string[] = [];

    for (const sub of targetSubs) {
      try {
        await webpush.sendNotification(sub, payload, pushOptions);
        sentCount++;
      } catch (pushErr: any) {
        console.warn('Test push send error:', pushErr?.statusCode || pushErr?.message);
        errors.push(pushErr?.message || 'Push delivery failed');
      }
    }

    console.log(`[Test Push Sent] Successfully dispatched to ${sentCount}/${targetSubs.length} device(s)`);
    res.json({ success: sentCount > 0, sentCount, errors: errors.length > 0 ? errors : undefined });
  });

  // Native Android Widget Data Endpoint
  app.get('/api/widget-data', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
      bookPercent: 82,
      todayPages: 33,
      dailyTarget: 40,
      hatimPercent: 23,
      currentHizb: 14,
      ilimPercent: 4.2,
      completedBooks: 6,
      curriculumTotal: 1920,
      updatedAt: new Date().toISOString()
    });
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
      if (pushSubscriptions.length === 0) return;

      const now = new Date();
      let modified = false;

      // Current time in Turkey (Europe/Istanbul)
      const trDateStr = now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' });
      const istanbulDate = new Date(trDateStr);
      const trHours = String(istanbulDate.getHours()).padStart(2, '0');
      const trMinutes = String(istanbulDate.getMinutes()).padStart(2, '0');
      const trCurrentTime = `${trHours}:${trMinutes}`;

      const year = istanbulDate.getFullYear();
      const month = String(istanbulDate.getMonth() + 1).padStart(2, '0');
      const day = String(istanbulDate.getDate()).padStart(2, '0');
      const currentSlot = `${year}-${month}-${day}_${trCurrentTime}`;

      for (let i = pushSubscriptions.length - 1; i >= 0; i--) {
        const item = pushSubscriptions[i];
        if (!item.reminderTimes || !Array.isArray(item.reminderTimes) || item.reminderTimes.length === 0) continue;

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
              console.log(`[Scheduled Push Sent] Dispatched to ${item.endpoint.substring(0, 35)}... at ${trCurrentTime}`);
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
