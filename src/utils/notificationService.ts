// Notification Service for Background Notifications & Active Reminders

import { playNotificationChime } from './audioUtils';

export interface ReminderSettings {
  enabled: boolean;
  time: string; // e.g. "21:00"
  streakAlerts: boolean;
  weekendReminders: boolean;
}

const DEFAULT_REMINDER: ReminderSettings = {
  enabled: true,
  time: '21:00',
  streakAlerts: true,
  weekendReminders: true
};

export const getReminderSettings = (): ReminderSettings => {
  try {
    const raw = localStorage.getItem('dk_reminder_settings');
    if (raw) return { ...DEFAULT_REMINDER, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_REMINDER;
};

export const saveReminderSettings = (settings: ReminderSettings): void => {
  try {
    localStorage.setItem('dk_reminder_settings', JSON.stringify(settings));
  } catch {}
};

// Helper to convert base64 to Uint8Array for PushManager
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check if running inside iframe
export const isRunningInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

// Detect if running inside an Android WebView APK (such as 'dijital.kutuphanem.iz')
export const isAndroidWebView = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isAndroid = ua.includes('android');
  const isWv = ua.includes('; wv') || ua.includes('version/4.0');
  const lacksPush = !('PushManager' in window);
  return isAndroid && (isWv || lacksPush);
};

// Force opening the URL inside Google Chrome browser on Android
export const openInChrome = () => {
  if (typeof window === 'undefined') return;
  const targetUrl = window.location.href.split('#')[0];
  const cleanUrl = targetUrl.startsWith('http') 
    ? targetUrl 
    : `https://${window.location.host}${window.location.pathname}`;

  // Android Intent specifically targeting Google Chrome
  const hostAndPath = cleanUrl.replace(/^https?:\/\//, '');
  const chromeIntent = `intent://${hostAndPath}#Intent;scheme=https;package=com.android.chrome;end`;

  try {
    window.location.href = chromeIntent;
  } catch {
    window.open(cleanUrl, '_blank');
  }
};

export interface PushActionResult {
  success: boolean;
  message: string;
  isWebView?: boolean;
}

// Request System Notification Permission
export const requestSystemNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (isRunningInIframe()) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.warn('Notification permission request error:', err);
    return false;
  }
};

// Subscribe user device to 24/7 Cloud WebPush (wakes phone up when app and screen are closed)
export const subscribeToCloudPush = async (reminderTimes: string[] = ['08:30', '14:00', '21:30']): Promise<PushActionResult> => {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Tarayıcı ortamı bulunamadı.' };
  }

  if (isRunningInIframe()) {
    return { 
      success: false, 
      message: 'Önizleme (iFrame) penceresinde sistem bildirimleri tarayıcı güvenlik duvarı nedeniyle engellenir. Lütfen uygulamayı Chrome tarayıcısında açınız.' 
    };
  }

  // Check Android WebView
  if (isAndroidWebView() || !('PushManager' in window)) {
    return { 
      success: false, 
      isWebView: true,
      message: 'Kullandığınız Android APK (dijital.kutuphanem.iz) Android WebView motoru ile çalışmaktadır. Android WebView sistemi, kapalıyken uyandırma servisini (PushManager) desteklemez. Bildirimlerin telefon kapalıyken 24 saat kesintisiz gelmesi için uygulamayı Google Chrome ile açıp "Ana Ekrana Ekle" (PWA) yapınız.' 
    };
  }

  if (!('serviceWorker' in navigator)) {
    return { success: false, message: 'Tarayıcınız Service Worker desteği sağlamıyor.' };
  }

  try {
    // Check or request permission
    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      return { 
        success: false, 
        message: 'Bildirim izni verilmedi. Telefonunuzun Ayarlar > Chrome > Bildirimler menüsünden izni etkinleştirin.' 
      };
    }

    // Ensure service worker is registered & active
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }
    const swReady = await navigator.serviceWorker.ready;

    if (!swReady || !swReady.pushManager) {
      return { success: false, message: 'PushManager bu tarayıcıda hazır değil.' };
    }

    // Get public VAPID key from backend
    const keyRes = await fetch('/api/push-public-key');
    const { publicKey } = await keyRes.json();
    if (!publicKey) {
      return { success: false, message: 'Sunucu bildirim anahtarı temin edilemedi.' };
    }

    // Subscribe to PushManager
    let subscription = await swReady.pushManager.getSubscription();
    if (!subscription) {
      subscription = await swReady.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul';

    // Send subscription & reminder times to backend server
    const saveRes = await fetch('/api/save-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON ? subscription.toJSON() : subscription,
        reminderTimes,
        timeZone
      })
    });

    if (saveRes.ok) {
      return { 
        success: true, 
        message: '✅ Cihazınız 24/7 bulut bildirim servisine bağlandı! Uygulama kapalıyken de bildirim gelecektir.' 
      };
    } else {
      return { success: false, message: 'Abonelik sunucuya kaydedilemedi.' };
    }
  } catch (err: any) {
    console.warn('Push subscription error:', err);
    return { success: false, message: err?.message || 'Push servisine bağlanırken bir hata oluştu.' };
  }
};

// Send an immediate test push via Cloud Server directly to the phone lock screen
export const sendServerTestPush = async (reminderTimes?: string[]): Promise<PushActionResult> => {
  try {
    if (isRunningInIframe()) {
      return {
        success: false,
        message: 'Önizleme iFrame içinde sistem bildirimi engellidir. Gerçek testi görebilmek için bağlantıyı doğrudan telefonunuzun Chrome tarayıcısında açınız.'
      };
    }

    if (isAndroidWebView() || !('PushManager' in window)) {
      return {
        success: false,
        isWebView: true,
        message: 'Android APK (WebView) içinde PushManager bulunmadığından bildirim kilit ekranına düşemez. Aşağıdaki butondan Google Chrome ile açıp "Ana Ekrana Ekle" (PWA) yaparak 24 saat kesintisiz bildirim alabilirsiniz.'
      };
    }

    // Ensure subscribed first
    const subResult = await subscribeToCloudPush(reminderTimes);
    if (!subResult.success) {
      return subResult;
    }

    const res = await fetch('/api/send-test-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { 
        success: true, 
        message: '✅ Bulut Push bildirimi telefonunuza gönderildi! Şimdi uygulamayı kapatıp ekranı kilitleseniz dahi bildirim doğrudan kilit ekranınıza düşecektir.' 
      };
    } else {
      return { 
        success: false, 
        message: data.error || 'Test bildirimi sunucu tarafından gönderilemedi.' 
      };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Test bildirimi gönderilirken hata oluştu.' };
  }
};

// Send a Local System Notification via Service Worker (for when tab is open/background)
export const sendSystemNotification = async (
  title: string,
  options?: {
    body?: string;
    tag?: string;
    url?: string;
  }
): Promise<boolean> => {
  try {
    playNotificationChime();
  } catch {}

  const hasPermission = await requestSystemNotificationPermission();
  if (!hasPermission) {
    return false;
  }

  const notifOptions = {
    body: options?.body || 'Bugünkü okuma hedefin seni bekliyor!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: options?.tag || 'dk-reminder',
    renotify: true,
    data: {
      url: options?.url || '/'
    }
  };

  // Method 0: Native AppBridge (AppMint, WebView JavascriptInterface)
  try {
    const w = window as any;
    const bridge = w.AppMint || w.appmint || w.Android || w.AndroidInterface || w.JSBridge;
    if (bridge) {
      if (typeof bridge.showNotification === 'function') {
        bridge.showNotification(title, options?.body || '');
        return true;
      }
      if (typeof bridge.postMessage === 'function') {
        bridge.postMessage(JSON.stringify({ type: 'NOTIFICATION', title, body: options?.body || '' }));
      }
    }
  } catch {}

  // Method 1: Through Service Worker Registration
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, notifOptions);
        return true;
      }
    } catch (swErr) {
      console.warn('SW showNotification error, falling back to window Notification:', swErr);
    }
  }

  // Method 2: Standard Window Notification fallback
  try {
    new Notification(title, notifOptions);
    return true;
  } catch (windowErr) {
    console.warn('Standard Notification fallback error:', windowErr);
    return false;
  }
};

// Active Reminder Scheduler (checks local and registers server push)
let reminderIntervalId: any = null;

export const startActiveReminderWatcher = () => {
  if (typeof window === 'undefined') return;

  // Auto-subscribe to server-side push if permission granted
  if ('Notification' in window && Notification.permission === 'granted') {
    const settings = getReminderSettings();
    if (settings.enabled) {
      subscribeToCloudPush([settings.time]).catch(() => {});
    }
  }

  if (reminderIntervalId) {
    clearInterval(reminderIntervalId);
  }

  const checkReminders = () => {
    const settings = getReminderSettings();
    if (!settings.enabled) return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    if (currentTimeStr === settings.time) {
      const todayDateStr = now.toISOString().split('T')[0];
      const lastFiredDate = localStorage.getItem('dk_last_reminder_date');

      if (lastFiredDate !== todayDateStr) {
        localStorage.setItem('dk_last_reminder_date', todayDateStr);

        sendSystemNotification('📖 Dijital Kütüphanem: Okuma Vakti', {
          body: 'Günün tefekkür ve 40 sayfalık okuma hedefini tamamlamak için harika bir vakit! Eserinizi açın.',
          tag: `daily-reading-${todayDateStr}`,
          url: '/?tab=today'
        });
      }
    }
  };

  // Check immediately, then every 30 seconds
  checkReminders();
  reminderIntervalId = setInterval(checkReminders, 30000);
};
