import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ShieldCheck, Cloud, Download, Upload, CheckCircle2, 
  Moon, Sun, RefreshCw, Database, AlertCircle, LogIn, LogOut, ChevronDown, ChevronUp, FileCode, Check,
  Bell, Clock, Plus, Trash2, Volume2, Sparkles, ExternalLink, Copy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { loginWithGoogle, logoutUser, auth } from '../lib/firebase';
import { ValidationResult } from '../lib/jsonValidator';
import { AVAILABLE_BADGES } from '../data/badgeData';

import { playNotificationChime } from '../utils/audioUtils';
import { 
  subscribeToCloudPush,
  disableCloudPush,
  sendServerTestPush, 
  isRunningInIframe, 
  isAndroidWebView, 
  openInChrome 
} from '../utils/notificationService';

export const ProfileView: React.FC = () => {
  const { 
    userProfile, 
    setUserProfile, 
    exportUserDataJSON, 
    importUserDataJSON, 
    syncAllDataToCloud,
    cloudSyncStatus,
    verifyDataIntegrity,
    userBooks,
    theme,
    toggleTheme
  } = useApp();

  const [openSection, setOpenSection] = useState<'info' | 'sync' | 'reminders'>('reminders');
  const [importStatusMessage, setImportStatusMessage] = useState<{ success: boolean; message: string; validation?: ValidationResult } | null>(null);
  const [syncStatusMessage, setSyncStatusMessage] = useState<{ success: boolean; message: string } | null>(null);
  const [integrityResult, setIntegrityResult] = useState<ReturnType<typeof verifyDataIntegrity> | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const [newReminderTime, setNewReminderTime] = useState<string>('12:00');
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<{
    type: 'success' | 'error' | 'webview' | 'info';
    message: string;
  } | null>(null);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const currentUser = auth.currentUser;

  const handleCopyUrl = async () => {
    try {
      const url = window.location.href.split('#')[0];
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 4000);
    } catch {
      setCopiedLink(false);
    }
  };

  const handleToggleReminders = async () => {
    const nextState = !userProfile.reminderEnabled;
    try {
      if (nextState) {
        const result = await subscribeToCloudPush(userProfile.reminderTimes || ['08:30', '14:00', '21:30']);
        setTestNotificationFeedback({ type: result.isWebView ? 'webview' : result.success ? 'success' : 'error', message: result.message });
        if (!result.success) return;
      } else {
        await disableCloudPush();
      }
      setUserProfile(previous => ({ ...previous, reminderEnabled: nextState }));
    } catch {
      setTestNotificationFeedback({ type: 'error', message: 'Bildirim ayarı değiştirilemedi. Tekrar dene.' });
    }
  };

  const handleToggleSound = () => {
    const nextSound = !userProfile.reminderSound;
    if (nextSound) {
      playNotificationChime();
    }
    setUserProfile(prev => ({
      ...prev,
      reminderSound: nextSound
    }));
  };

  const handleAddTime = async () => {
    if (!newReminderTime) return;
    const currentTimes = userProfile.reminderTimes || [];
    if (!currentTimes.includes(newReminderTime)) {
      const updated = [...currentTimes, newReminderTime].sort();
      setUserProfile(prev => ({
        ...prev,
        reminderTimes: updated
      }));
      if (userProfile.reminderEnabled) {
        await subscribeToCloudPush(updated);
      }
    }
  };

  const handleRemoveTime = async (timeToRemove: string) => {
    const currentTimes = userProfile.reminderTimes || [];
    const updated = currentTimes.filter(t => t !== timeToRemove);
    setUserProfile(prev => ({
      ...prev,
      reminderTimes: updated
    }));
    if (userProfile.reminderEnabled) {
      await subscribeToCloudPush(updated);
    }
  };

  const handleSendTestNotification = async () => {
    setIsSendingTest(true);
    playNotificationChime();

    try {
      const result = await sendServerTestPush(userProfile.reminderEnabled ? userProfile.reminderTimes || ['08:30', '14:00', '21:30'] : []);
      if (result.isWebView) {
        setTestNotificationFeedback({ type: 'webview', message: result.message });
      } else if (result.success) {
        setTestNotificationFeedback({ type: 'success', message: result.message });
        setTimeout(() => setTestNotificationFeedback(null), 10000);
      } else {
        setTestNotificationFeedback({ type: 'error', message: result.message });
      }
    } catch (err: any) {
      setTestNotificationFeedback({ type: 'error', message: err?.message || 'Bildirim gönderilemedi.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      if (currentUser) {
        await logoutUser();
      } else {
        const user = await loginWithGoogle();
        if (user) {
          setUserProfile(prev => ({
            ...prev,
            displayName: user.displayName || prev.displayName,
            email: user.email || prev.email,
            photoURL: user.photoURL || undefined
          }));
        }
      }
    } catch (err) {
      setSyncStatusMessage({ success: false, message: err instanceof Error ? err.message : 'Google oturumu açılamadı.' });
    }
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    setSyncProgress(0);
    setSyncStatusMessage(null);
    try {
      const res = await syncAllDataToCloud((prog) => {
        setSyncProgress(prog);
      });
      setIsManualSyncing(false);
      setSyncStatusMessage({
        success: res.success,
        message: res.message
      });
      setTimeout(() => {
        setSyncStatusMessage(null);
      }, 8000);
    } catch (err: any) {
      setIsManualSyncing(false);
      setSyncStatusMessage({
        success: false,
        message: `Senkronizasyon hatası: ${err?.message || 'Bilinmeyen hata'}`
      });
      setTimeout(() => {
        setSyncStatusMessage(null);
      }, 8000);
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportUserDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DijitalKutuphanem_Yedek_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadApkIcon = (format: 'png' | 'svg') => {
    const a = document.createElement('a');
    a.href = format === 'svg' ? '/icon.png' : '/icon-512.png';
    a.download = 'ic_launcher_dijital_kutuphanem.png';
    a.click();
  };

  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  const [importProgress, setImportProgress] = useState<number>(0);
  const [syncProgress, setSyncProgress] = useState<number>(0);

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setImportStatusMessage(null);
    setImportProgress(0);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        if (content) {
          const res = await importUserDataJSON(content, (progress) => {
              setImportProgress(progress);
          });
          setImportStatusMessage(res);
        } else {
          setImportStatusMessage({
            success: false,
            message: 'Seçilen dosya boş görünüyor.'
          });
        }
      } catch (err: any) {
        setImportStatusMessage({
          success: false,
          message: `Yedek yükleme hatası: ${err?.message || 'Bilinmeyen hata'}`
        });
      } finally {
        setIsRestoring(false);
      }
    };
    reader.onerror = () => {
      setImportStatusMessage({
        success: false,
        message: 'Dosya okunurken bir hata meydana geldi.'
      });
      setIsRestoring(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRunIntegrityCheck = () => {
    const res = verifyDataIntegrity();
    setIntegrityResult(res);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 shadow-md border border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#742C3C] text-[#B79A63] font-serif-title font-bold text-2xl flex items-center justify-center border-4 border-[#B79A63]/30 shadow-xl overflow-hidden shrink-0">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                userProfile.displayName.charAt(0).toUpperCase()
              )}
            </div>

            {/* Badge Display next to photo */}
            <div className="flex gap-2">
                <AnimatePresence>
                    {userProfile.badges?.map(badgeId => {
                        const badge = AVAILABLE_BADGES.find(b => b.id === badgeId);
                        if (!badge) return null;
                        return (
                          <motion.div 
                            key={badge.id}
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            className="bg-[#B79A63] text-white p-2 rounded-full shadow-lg text-lg"
                            title={`${badge.name}: ${badge.description}`}
                          >
                            {badge.icon}
                          </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h1 className="text-2xl font-serif-title font-bold text-[#742C3C] dark:text-[#B79A63]">
              {currentUser?.displayName || userProfile.displayName}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              currentUser ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
            }`}>
              {currentUser ? 'Firebase Bulut Etkin' : 'Yerel Cihaz Hesabı'}
            </span>
          </div>
          <p className="text-xs text-slate-500">{currentUser?.email || userProfile.email}</p>
          <p className="text-[11px] text-slate-400">Kütüphanedeki Toplam Eser: {userBooks.length} Kitap</p>
        </div>

        <button
          onClick={handleGoogleAuth}
          className="px-4 py-2.5 rounded-xl bg-[#742C3C] text-white text-xs font-semibold hover:bg-[#4B1E2B] transition-colors flex items-center gap-2 shrink-0 shadow-md"
        >
          {currentUser ? (
            <>
              <LogOut className="w-4 h-4 text-[#B79A63]" />
              <span>Çıkış Yap</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 text-[#B79A63]" />
              <span>Google ile Bulut Senkronizasyonu</span>
            </>
          )}
        </button>
      </div>

      {/* Accordion 0: Günlük Okuma Hatırlatıcıları ve Bildirim Kontrol Paneli */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl overflow-hidden shadow-md border border-black/5 dark:border-white/5 transition-all">
        <button
          onClick={() => setOpenSection(openSection === 'reminders' ? '' as any : 'reminders')}
          className="w-full p-6 flex justify-between items-center text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-title font-bold text-lg text-slate-900 dark:text-slate-100">
                1. Günlük Okuma Hatırlatıcıları ve Bildirim Kontrol Paneli
              </h2>
              <p className="text-xs text-slate-500">Belirlediğiniz saatlerde günlük okuma hedefleri için sesli ve görsel hatırlatıcılar.</p>
            </div>
          </div>
          {openSection === 'reminders' ? <ChevronUp className="w-5 h-5 opacity-60" /> : <ChevronDown className="w-5 h-5 opacity-60" />}
        </button>

        {openSection === 'reminders' && (
          <div className="p-6 pt-0 border-t border-black/5 dark:border-white/5 space-y-6 animate-in fade-in duration-200">
            {/* Android WebView Advisory Banner */}
            {isAndroidWebView() && (
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                      Android APK (WebView) Kullanıyorsunuz:
                    </h5>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      'dijital.kutuphanem.iz' APK'sı bir Android WebView uygulamasıdır. Android işletim sistemi mimarisi gereği, WebView içindeki uygulamalar kapalıyken Google Push servisine bağlanamaz.
                      <br /><br />
                      <strong>24 Saat Kesintisiz Kilit Ekranı Bildirimi İçin:</strong> Uygulamayı <strong>Google Chrome</strong>'da açıp sağ üst menüden <strong>"Ana Ekrana Ekle" (PWA)</strong> yaptığınızda, Google'ın resmi WebAPK sistemi devreye girer ve uygulama tamamen kapalıyken de bildirimler gelir!
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={openInChrome}
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#742C3C] to-[#501e29] hover:from-[#5e2330] hover:to-[#3e1720] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#B79A63]" />
                    <span>🌐 Google Chrome'da Aç (24/7 Bildirim)</span>
                  </button>
                  <button
                    onClick={handleCopyUrl}
                    className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#1E1E1E] border border-amber-500/30 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-black/5 active:scale-95 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-600" />
                    <span>{copiedLink ? 'Kopyalandı! ✓' : 'Bağlantıyı Kopyala'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Master Toggle */}
            <div className="flex justify-between items-center p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 pt-4">
              <div className="space-y-1">
                <h4 className="font-serif-title font-bold text-sm text-slate-900 dark:text-slate-100">
                  Okuma Hatırlatıcı Bildirimleri
                </h4>
                <p className="text-xs text-slate-500">
                  Belirtilen saatlerde cihazınızda bildirim alarak okuma serinizi (streak) canlı tutun.
                </p>
              </div>

              <button
                onClick={handleToggleReminders}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  userProfile.reminderEnabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  userProfile.reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Sound Toggle */}
            <div className="flex justify-between items-center p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif-title font-bold text-sm text-slate-900 dark:text-slate-100">
                    Bildirim Ses Efekti
                  </h4>
                  <p className="text-xs text-slate-500">Hatırlatıcı çaldığında zarif bir uyarı sesi çal</p>
                </div>
              </div>

              <button
                onClick={handleToggleSound}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  userProfile.reminderSound ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  userProfile.reminderSound ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Reminder Times Management */}
            <div className="p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#742C3C] dark:text-[#B79A63] flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Aktif Okuma Saatleri ({userProfile.reminderTimes?.length || 0} Zaman Dilimi)</span>
                </span>
              </div>

              {/* Add Time Form */}
              <div className="flex gap-2 items-center">
                <input
                  type="time"
                  value={newReminderTime}
                  onChange={e => setNewReminderTime(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E1E] border border-black/10 text-xs font-bold"
                />
                <button
                  onClick={handleAddTime}
                  className="px-4 py-2 rounded-xl bg-[#742C3C] hover:bg-[#4B1E2B] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-[#B79A63]" />
                  <span>Saat Ekle</span>
                </button>
              </div>

              {/* Time Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {(userProfile.reminderTimes || []).map((t, idx) => (
                  <div 
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1E1E] border border-black/10 dark:border-white/10 flex items-center gap-2 shadow-xs text-xs font-bold"
                  >
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t}</span>
                    <button
                      onClick={() => handleRemoveTime(t)}
                      className="text-rose-500 hover:text-rose-700 ml-1 transition-colors"
                      title="Saati Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {(!userProfile.reminderTimes || userProfile.reminderTimes.length === 0) && (
                  <p className="text-xs text-slate-500 italic">Henüz tanımlı okuma saati yok.</p>
                )}
              </div>
            </div>

            {/* Test Notification Button & Information */}
            <div className="space-y-3 pt-1">
              <button
                onClick={handleSendTestNotification}
                disabled={isSendingTest}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-[#044B35] hover:from-emerald-500 hover:to-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-75"
              >
                <Bell className="w-4 h-4 text-emerald-200" />
                <span>{isSendingTest ? 'Push İletiliyor...' : '🔔 Şimdi Anlık Push Gönder'}</span>
              </button>

              {/* Dynamic Notification Feedback Banner */}
              {testNotificationFeedback && testNotificationFeedback.type === 'webview' && (
                <div className="p-4 rounded-2xl bg-amber-500/15 dark:bg-amber-950/40 border border-amber-500/35 space-y-3 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h5 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                        Android WebView APK Tespiti (dijital.kutuphanem.iz)
                      </h5>
                      <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                        {testNotificationFeedback.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      onClick={openInChrome}
                      className="flex-1 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#742C3C] to-[#501e29] hover:from-[#5e2330] hover:to-[#3e1720] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#B79A63]" />
                      <span>🌐 Google Chrome'da Aç (Tam Bildirim)</span>
                    </button>
                    
                    <button
                      onClick={handleCopyUrl}
                      className="py-2.5 px-3.5 rounded-xl bg-white dark:bg-[#1E1E1E] border border-amber-500/30 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-black/5 active:scale-95 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5 text-amber-600" />
                      <span>{copiedLink ? 'Kopyalandı! ✓' : 'Bağlantıyı Kopyala'}</span>
                    </button>
                  </div>
                </div>
              )}

              {testNotificationFeedback && testNotificationFeedback.type === 'success' && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{testNotificationFeedback.message}</span>
                </div>
              )}

              {testNotificationFeedback && testNotificationFeedback.type === 'error' && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{testNotificationFeedback.message}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>



      {/* Accordion 1: Güvenli Çift Yönlü Eşitleme ve Bulut Kalıcılığı */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl overflow-hidden shadow-md border border-black/5 dark:border-white/5 transition-all">
        <button
          onClick={() => setOpenSection(openSection === 'sync' ? '' as any : 'sync')}
          className="w-full p-6 flex justify-between items-center text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#B79A63]/20 text-[#B79A63]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-title font-bold text-lg text-slate-900 dark:text-slate-100">
                2. Yerel JSON Yedekleme ve Firestore Bulut Aktarımı
              </h2>
              <p className="text-xs text-slate-500">Tam veri doğrulamalı JSON aktarımı, Firestore eşitlenmesi ve yedek yükleme.</p>
            </div>
          </div>
          {openSection === 'sync' ? <ChevronUp className="w-5 h-5 opacity-60" /> : <ChevronDown className="w-5 h-5 opacity-60" />}
        </button>

        {openSection === 'sync' && (
          <div className="p-6 pt-0 border-t border-black/5 dark:border-white/5 space-y-6 animate-in fade-in duration-200">
            {/* Cloud Status */}
            <div className="p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 space-y-2 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-[#742C3C] dark:text-[#B79A63]" />
                  <span>Firestore Veritabanı Kalıcılık Durumu</span>
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  cloudSyncStatus === 'synced' ? 'bg-emerald-500/10 text-emerald-600' :
                  cloudSyncStatus === 'syncing' ? 'bg-amber-500/10 text-amber-600' : 'bg-gray-500/10 text-gray-500'
                }`}>
                  {cloudSyncStatus === 'synced' ? 'Eşitlendi (Firestore Active)' : cloudSyncStatus === 'syncing' ? 'Eşitleniyor...' : 'Yerel Cihaz Ön Önbelleği'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Geri yüklenen veya eklenen tüm kitap kapakları, sayfa konumları ve alıntılar Firestore üzerinde güvenle saklanır.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500">
                  {currentUser ? 'Google Hesabınız bağlı.' : 'Hesabınız bağlı değil; yerel veriler cihazda saklanır.'}
                </span>
                {currentUser ? (
                  <button
                    onClick={handleManualSync}
                    disabled={isManualSyncing}
                    className="px-3.5 py-2 rounded-xl bg-[#742C3C] text-white text-xs font-semibold hover:bg-[#4B1E2B] transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-80"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin' : ''}`} />
                    <span>{isManualSyncing ? `Buluta Aktarılıyor: %${syncProgress}` : 'Buluta Şimdi Senkronize Et'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleAuth}
                    className="px-3.5 py-2 rounded-xl bg-[#742C3C] text-white text-xs font-semibold hover:bg-[#4B1E2B] transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#B79A63]" />
                    <span>Google ile Bağlan ve Eşitle</span>
                  </button>
                )}
              </div>

              {/* Live Cloud Sync Progress Bar */}
              {isManualSyncing && (
                <div className="mt-2 space-y-1 animate-in fade-in">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <span>Bulut Eşitleme İlerlemesi</span>
                    <span className="text-[#742C3C] dark:text-[#B79A63]">%{syncProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#742C3C] dark:bg-[#B79A63] h-full rounded-full transition-all duration-300"
                      style={{ width: `${syncProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Immediate sync result feedback banner */}
              {syncStatusMessage && (
                <div className={`mt-2 p-3 rounded-xl text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in ${
                  syncStatusMessage.success
                    ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {syncStatusMessage.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    <span>{syncStatusMessage.message}</span>
                  </div>
                  <button 
                    onClick={() => setSyncStatusMessage(null)}
                    className="text-[10px] opacity-70 hover:opacity-100 font-bold px-1.5 py-0.5 rounded"
                  >
                    Kapat
                  </button>
                </div>
              )}
            </div>

            {/* Actions: Download Backup & Restore */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Export */}
              <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-[#742C3C] dark:text-[#B79A63]" />
                  <h4 className="font-serif-title font-bold text-sm">JSON Yedek İndir (Export)</h4>
                </div>
                <p className="text-xs text-slate-500">
                  Tüm kitaplarınızı, okuma oturumlarınızı, alıntıları ve kelime defterinizi tam şema formatında yerel olarak indirin.
                </p>
                <button
                  onClick={handleDownloadBackup}
                  className="w-full py-2.5 rounded-xl bg-[#742C3C] text-white text-xs font-semibold hover:bg-[#4B1E2B] transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#B79A63]" />
                  <span>Tam Kütüphane Yedeğini İndir</span>
                </button>
              </div>

              {/* Restore */}
              <div className="p-5 rounded-2xl border border-black/10 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#B79A63]" />
                  <h4 className="font-serif-title font-bold text-sm">Doğrulamalı Yedek Yükle (Import)</h4>
                </div>
                <p className="text-xs text-slate-500">
                  Dosya şema bütünlüğü kontrol edildikten sonra veriler kütüphanenize ve Firestore veritabanına aktarılır.
                </p>
                <label className={`cursor-pointer w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isRestoring 
                    ? 'bg-amber-600 text-white cursor-wait opacity-90' 
                    : 'bg-[#B79A63] text-slate-900 hover:bg-[#a38752] active:scale-[0.99]'
                }`}>
                  {isRestoring ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Yedek yükleniyor: %{importProgress}</span>
                    </>
                  ) : (
                    <>
                      <FileCode className="w-4 h-4" />
                      <span>JSON Yedeği Seç ve Geri Yükle</span>
                    </>
                  )}
                  <input 
                    type="file"
                    accept=".json"
                    disabled={isRestoring}
                    onChange={handleRestoreBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Validation & Import Result Reporting */}
            {importStatusMessage && (
              <div className="p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/10 space-y-3 animate-in fade-in">
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  importStatusMessage.success 
                    ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                }`}>
                  {importStatusMessage.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                  <span>{importStatusMessage.message}</span>
                </div>

                {importStatusMessage.validation?.summary && (
                  <div className="p-3 rounded-xl bg-white dark:bg-[#1E1E1E] text-xs font-mono space-y-1">
                    <p className="font-bold text-[#742C3C] dark:text-[#B79A63]">✔ Doğrulanan Veri Özeti:</p>
                    <p>• {importStatusMessage.validation.summary.booksCount} Kitap</p>
                    <p>• {importStatusMessage.validation.summary.sessionsCount} Okuma Oturumu</p>
                    <p>• {importStatusMessage.validation.summary.quotesCount} Alıntı</p>
                    <p>• {importStatusMessage.validation.summary.wordsCount} Kelime</p>
                  </div>
                )}
              </div>
            )}

            {/* Data Integrity Verification */}
            <div className="p-5 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-black/5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#742C3C] dark:text-[#B79A63]" />
                  <h4 className="font-serif-title font-bold text-sm">Veri Bütünlüğü Doğrulaması</h4>
                </div>

                <button
                  onClick={handleRunIntegrityCheck}
                  className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-xs font-semibold hover:bg-black/10"
                >
                  Bütünlük Testi Çalıştır
                </button>
              </div>

              {integrityResult && (
                <div className="p-3 rounded-xl bg-white dark:bg-[#1E1E1E] text-xs space-y-1 font-mono">
                  <p>✔ Toplam Kayıtlı Eser: {integrityResult.totalBooks}</p>
                  <p>✔ Okuma Oturumu Sayısı: {integrityResult.totalSessions}</p>
                  <p>✔ Kayıtlı Alıntı Sayısı: {integrityResult.totalQuotes}</p>
                  <p>✔ Kelime Defteri Kayıtları: {integrityResult.totalWords}</p>
                  <p className="font-bold text-emerald-600 mt-1">
                    {integrityResult.integrityOk ? '✔ Veri bütünlüğü ve şema yapısı %100 doğrulandı.' : '❌ Hatalı veya eksik veri tespit edildi.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Accordion 2: Profil Bilgilerim */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl overflow-hidden shadow-md border border-black/5 dark:border-white/5 transition-all">
        <button
          onClick={() => setOpenSection(openSection === 'info' ? '' as any : 'info')}
          className="w-full p-6 flex justify-between items-center text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#742C3C]/10 text-[#742C3C] dark:text-[#B79A63]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-title font-bold text-lg text-slate-900 dark:text-slate-100">
                2. Profil Bilgilerim ve Okuma Hedeflerim
              </h2>
              <p className="text-xs text-slate-500">Kişisel hedefleriniz ve görünüm modları.</p>
            </div>
          </div>
          {openSection === 'info' ? <ChevronUp className="w-5 h-5 opacity-60" /> : <ChevronDown className="w-5 h-5 opacity-60" />}
        </button>

        {openSection === 'info' && (
          <div className="p-6 pt-0 border-t border-black/5 dark:border-white/5 space-y-6 animate-in fade-in duration-200">
            {/* Goal form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Toplam Günlük Hedef (Sayfa)
                </label>
                <input 
                  type="number"
                  min={10}
                  max={500}
                  value={userProfile.dailyTargetPages}
                  onChange={e => setUserProfile({ ...userProfile, dailyTargetPages: parseInt(e.target.value, 10) || 40 })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E1E] border border-black/10 font-bold text-center"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tek Ciltli Eser Hedefi
                </label>
                <input 
                  type="number"
                  min={5}
                  value={userProfile.singleVolumeTargetPages}
                  onChange={e => setUserProfile({ ...userProfile, singleVolumeTargetPages: parseInt(e.target.value, 10) || 20 })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E1E] border border-black/10 font-bold text-center"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Çok Ciltli Eser Hedefi
                </label>
                <input 
                  type="number"
                  min={5}
                  value={userProfile.multiVolumeTargetPages}
                  onChange={e => setUserProfile({ ...userProfile, multiVolumeTargetPages: parseInt(e.target.value, 10) || 20 })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E1E1E] border border-black/10 font-bold text-center"
                />
              </div>
            </div>

            {/* Gece / Gündüz Modu Toggle */}
            <div className="flex justify-between items-center p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414]">
              <div>
                <h4 className="font-serif-title font-bold text-sm">Gece / Gündüz Görünüm Modu</h4>
                <p className="text-xs text-slate-500">Gözünüzü yormayan aydınlık ve karanlık tema geçişi</p>
              </div>

              <button
                onClick={toggleTheme}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-md active:scale-95 ${
                  theme === 'dark'
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 ring-2 ring-amber-300/50'
                    : 'bg-[#742C3C] text-white hover:bg-[#5a222f] ring-2 ring-rose-900/30'
                }`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 fill-current text-slate-950" />
                    <span>Gündüz Modu ☀️</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 fill-current text-[#B79A63]" />
                    <span>Gece Modu 🌙</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Badges Section */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl overflow-hidden shadow-md border border-black/5 dark:border-white/5 transition-all">
        <div className="p-6">
          <h2 className="font-serif-title font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">
            🏆 Kazandığınız Rozetler
          </h2>
          {userProfile.badges && userProfile.badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userProfile.badges.map(badgeId => {
                const badge = AVAILABLE_BADGES.find(b => b.id === badgeId);
                if (!badge) return null;
                return (
                  <motion.div 
                    key={badge.id}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] border border-[#B79A63]/30 flex flex-col items-center text-center gap-2"
                  >
                    <span className="text-3xl">{badge.icon}</span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{badge.name}</p>
                    <p className="text-[10px] text-slate-500">{badge.description}</p>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Henüz rozet kazanmadınız. Okumaya devam edin!</p>
          )}
        </div>
      </div>
    </div>
  );
};
