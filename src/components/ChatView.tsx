import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, Send, User, Database, Search, Library, 
  Mic, MicOff, Volume2, VolumeX, Square, Radio, Play, Headphones, AlertCircle, RefreshCw, ExternalLink,
  Sliders, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FULL_FOUR_YEAR_CURRICULUM } from '../data/readingPlanData';
import { POETS_COLLECTION_FULL } from '../data/poetryData';
import { buildVectorRAGContext } from '../utils/ragEngine';
import type { RobiChatMode, RobiChatReply } from '../utils/robiChat';

interface Message {
  role: 'user' | 'model';
  text: string;
  ragSummary?: string[];
  model?: string;
  isFallback?: boolean;
  sourceUrls?: string[];
}

const CHAT_MODES: Record<RobiChatMode, { label: string; description: string }> = {
  balanced: { label: 'Dengeli', description: 'Doğrudan açıklamalar, gerektiğinde örnek ve okuma önerisi.' },
  deep: { label: 'Derin tahlil', description: 'Kavram, gerekçe, karşı görüş ve metin bağlamı üzerinden ayrıntılı inceleme.' },
  source: { label: 'Kaynak incele', description: 'Soruna herkese açık bir bağlantı ekle. Arşiv kayıtların ve önceki sohbet bu isteğe eklenmez.' },
};

export interface VoicePreset {
  id: 'bilge' | 'dogal' | 'canli';
  name: string;
  tagline: string;
  rate: number;
  pitch: number;
  description: string;
}

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'bilge',
    name: 'Bilge & Dingin',
    tagline: 'Tefekkür ve İlim Tonu (Önerilen)',
    rate: 0.94,
    pitch: 0.95,
    description: 'Ağırbaşlı, sıcak ve derin bir bilge sincap koçu üslubu. Tane tane, dinlendirici ve hikmetli akış.'
  },
  {
    id: 'dogal',
    name: 'Doğal Anlatıcı',
    tagline: 'Radyo & Kitap Seslendirmesi',
    rate: 0.98,
    pitch: 0.99,
    description: 'Berrak, akıcı ve dengeli edebiyat anlatıcısı tonu.'
  },
  {
    id: 'canli',
    name: 'Canlı & Neşeli',
    tagline: 'Motivasyon & Dinamik Hasbihal',
    rate: 1.03,
    pitch: 1.02,
    description: 'Okuma hedefleri ve sohbet için enerjik ve neşeli bir tempo.'
  }
];

// Cihazdaki en estetik ve kaliteli Türkçe sesi puanlayarak seçen algoritma
function getBestTurkishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  if (!voices || voices.length === 0) return undefined;
  
  const trVoices = voices.filter(v => {
    const l = v.lang.toLowerCase();
    return l.startsWith('tr') || l.includes('tr');
  });

  if (trVoices.length === 0) return voices[0];

  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    let score = 0;
    const name = v.name.toLowerCase();
    if (name.includes('natural') || name.includes('doğal')) score += 100;
    if (name.includes('online')) score += 80;
    if (name.includes('neural')) score += 70;
    if (name.includes('enhanced') || name.includes('gelişmiş') || name.includes('premium')) score += 60;
    if (name.includes('google')) score += 50;
    if (name.includes('ahmet') || name.includes('emel') || name.includes('yelda') || name.includes('cem')) score += 40;
    if (name.includes('seda') || name.includes('murat') || name.includes('filiz')) score += 20;
    return score;
  };

  return [...trVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

// Metni Türkçe seslendirme için estetik, akıcı ve doğal telaffuza dönüştüren temizleme fonksiyonu
function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    // Markdown başlıklarını ve sembollerini ayıkla
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    // Türkçe kısaltmaları doğal okunuşa dönüştür (Robotik telaffuzu önler)
    .replace(/\bHz\.\s*/gi, 'Hazretleri ')
    .replace(/\bvb\.\s*/gi, 've benzeri, ')
    .replace(/\bvs\.\s*/gi, 've saire, ')
    .replace(/\bsyf\.\s*/gi, 'sayfa ')
    .replace(/\bc\.\s*(\d+)/gi, '$1. cilt, ')
    .replace(/%(\d+)/g, 'yüzde $1')
    // Matematiksel ve kitap sayfa oranları: "0/382" -> "382 sayfada 0"
    .replace(/(\d+)\/(\d+)/g, '$2 sayfadan $1')
    // Emojiler ve sembolleri kaldır
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ')
    .replace(/[🐿️📖🏛️📜🇹🇷🔍📚📌🤔💡🌿🖋️🎯✨🌰📊•>—_~]/gu, ' ')
    // İki nokta üst üste sonrasındaki satır atlamalarını yumuşak duraklatma noktasına çevir
    .replace(/:\s*\n/g, '. ')
    .replace(/:\s*/g, ', ')
    .replace(/---/g, ' ')
    .replace(/\[.*?\]/g, '')
    // Fazla boşlukları temizle
    .replace(/\s+/g, ' ')
    .trim();
}

export const ChatView: React.FC = () => {
  const { userBooks, readingSessions, quotations, userProfile, reviews, vocabulary } = useApp();
  const fullPoetryCollection = POETS_COLLECTION_FULL;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Selâmün aleyküm, ${userProfile.displayName}. Ben Robi. Bir eserin pasajını yorumlayabilir, iki düşünürün gerekçelerini karşılaştırabilir veya kütüphanenden bir okuma yolu çıkarabiliriz. İstersen bir bağlantı üzerinden de çalışabiliriz.`
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showRagDetails, setShowRagDetails] = useState<boolean>(false);
  const [chatMode, setChatMode] = useState<RobiChatMode>('deep');
  const chatModeRef = useRef<RobiChatMode>('deep');
  
  // Sesli Sohbet, Estetik Ses Tonu ve Karşılıklı Konuşma Durumları
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeSpeakingIdx, setActiveSpeakingIdx] = useState<number | null>(null);
  const [voiceChatMode, setVoiceChatMode] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [permissionError, setPermissionError] = useState<boolean>(false);
  const [generalSpeechError, setGeneralSpeechError] = useState<string | null>(null);

  // Estetik Ses Seçici ve Ton Ayarları
  const [voiceTone, setVoiceTone] = useState<'bilge' | 'dogal' | 'canli'>(() => {
    try {
      return (localStorage.getItem('robi_voice_tone') as any) || 'bilge';
    } catch {
      return 'bilge';
    }
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>(() => {
    try {
      return localStorage.getItem('robi_voice_uri') || '';
    } catch {
      return '';
    }
  });
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const isSpeechActiveRef = useRef<boolean>(false);
  const voiceChatModeRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);

  // Sync refs with state
  useEffect(() => {
    voiceChatModeRef.current = voiceChatMode;
  }, [voiceChatMode]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Mobil Chrome & Masaüstü için ses motorunu (TTS) ve ses listesini önceden hazırla
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
          // Eğer önceden seçilmemişse en iyi doğal Türkçe sesini varsayılan yap
          if (!selectedVoiceUri) {
            const best = getBestTurkishVoice(voices);
            if (best) {
              setSelectedVoiceUri(best.voiceURI);
              try { localStorage.setItem('robi_voice_uri', best.voiceURI); } catch {}
            }
          }
        }
      };

      window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
      updateVoices();
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
      };
    }
  }, [selectedVoiceUri]);

  // Web Speech API desteğini kontrol et
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;
    if (!SpeechRec && !hasTTS) {
      setSpeechSupported(false);
    }
  }, []);

  // Ses motorunu mobil kullanıcı dokunmasıyla kilidini açma (Audio Context Unlock)
  const primeSpeechSynthesis = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
  }, []);

  // Sesli Yanıtı Durdurma
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setActiveSpeakingIdx(null);
    isSpeechActiveRef.current = false;
  }, []);

  // Metni Estetik, Doğal ve Cümle Cümle Soluklanarak Seslendirme (Yüksek Kalite)
  const speakMessage = useCallback((text: string, msgIdx?: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Eğer zaten aynı mesaj konuşuluyorsa durdur
    if (isSpeaking && activeSpeakingIdx === msgIdx) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    primeSpeechSynthesis();

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;

    const allVoices = window.speechSynthesis.getVoices();
    let chosenVoice: SpeechSynthesisVoice | undefined;
    if (selectedVoiceUri) {
      chosenVoice = allVoices.find(v => v.voiceURI === selectedVoiceUri);
    }
    if (!chosenVoice) {
      chosenVoice = getBestTurkishVoice(allVoices);
    }

    const currentPreset = VOICE_PRESETS.find(p => p.id === voiceTone) || VOICE_PRESETS[0];

    // Cümleleri doğal nefes duraklarına bölerek robotik hızlanmayı engelle
    const rawChunks = cleanText
      .split(/(?<=[.!?;\n])\s+/)
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const sentenceChunks: string[] = [];
    let buffer = '';
    for (const chunk of rawChunks) {
      if (buffer.length === 0) {
        buffer = chunk;
      } else if (buffer.length + chunk.length < 130) {
        buffer += ' ' + chunk;
      } else {
        sentenceChunks.push(buffer);
        buffer = chunk;
      }
    }
    if (buffer.length > 0) {
      sentenceChunks.push(buffer);
    }

    if (sentenceChunks.length === 0) return;

    setIsSpeaking(true);
    if (typeof msgIdx === 'number') {
      setActiveSpeakingIdx(msgIdx);
    }
    isSpeechActiveRef.current = true;

    sentenceChunks.forEach((chunkText, idx) => {
      const isLast = idx === sentenceChunks.length - 1;
      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.lang = 'tr-TR';
      utterance.rate = currentPreset.rate;
      utterance.pitch = currentPreset.pitch;
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      if (isLast) {
        utterance.onend = () => {
          setIsSpeaking(false);
          setActiveSpeakingIdx(null);
          isSpeechActiveRef.current = false;

          // Eller Serbest Modu: Robi konuşmayı bitirdiğinde otomatik olarak mikrofonu tekrar aç
          if (voiceChatModeRef.current) {
            setTimeout(() => {
              try {
                if (voiceChatModeRef.current && !isSpeechActiveRef.current && !isListeningRef.current) {
                  startListening();
                }
              } catch (e) {
                console.warn("Handsfree mic restart note:", e);
              }
            }, 700);
          }
        };

        utterance.onerror = (e) => {
          console.warn("SpeechSynthesis error:", e);
          setIsSpeaking(false);
          setActiveSpeakingIdx(null);
          isSpeechActiveRef.current = false;
        };
      }

      window.speechSynthesis.speak(utterance);
    });
  }, [isSpeaking, activeSpeakingIdx, stopSpeaking, primeSpeechSynthesis, selectedVoiceUri, voiceTone]);

  // Ses Tonu Örnek Denemesi
  const testVoiceSample = (toneId?: 'bilge' | 'dogal' | 'canli') => {
    stopSpeaking();
    primeSpeechSynthesis();
    const targetTone = toneId || voiceTone;
    const preset = VOICE_PRESETS.find(p => p.id === targetTone) || VOICE_PRESETS[0];
    const sample = `Selâmün aleyküm kıymetli okur dostum! Ben senin bilge sincap arkadaşın Robi. ${preset.description}`;
    speakMessage(sample, -1);
  };

  // Mikrofon Dinlemesini Başlatma (Android Chrome ve Modern Tarayıcılarda Doğrudan Web Speech API)
  const startListening = () => {
    stopSpeaking();
    primeSpeechSynthesis();
    setPermissionError(false);
    setGeneralSpeechError(null);

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setGeneralSpeechError("Tarayıcınız ses tanıma özelliğini desteklemiyor. Güncel Chrome veya Edge önerilir.");
      return;
    }

    if (isListening) return;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRec();
      recognition.lang = 'tr-TR';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let finalTranscribed = '';

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setPermissionError(false);
        setGeneralSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscribed += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInputMessage(finalTranscribed || interim);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        isListeningRef.current = false;

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionError(true);
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setGeneralSpeechError(`Mikrofon uyarısı: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
        const textToSubmit = finalTranscribed.trim();
        if (textToSubmit.length > 0) {
          handleSendMessage(textToSubmit);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Speech recognition start failed:", err);
      setIsListening(false);
      isListeningRef.current = false;
      if (err?.name === 'NotAllowedError' || err?.message?.includes('not-allowed')) {
        setPermissionError(true);
      } else {
        setGeneralSpeechError(err?.message || "Mikrofon başlatılamadı.");
      }
    }
  };

  // Dinlemeyi Durdur
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    isListeningRef.current = false;
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setVoiceChatMode(true);
      startListening();
    }
  };

  // Mesaj Gönderme
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    // Kullanıcı yeni mesaj gönderirken ses motorunu hazırla
    primeSpeechSynthesis();
    stopSpeaking();
    stopListening();

    const userMsg: Message = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const mode = chatModeRef.current;
      const ragResult = mode === 'source' ? undefined : buildVectorRAGContext({
        query: text.trim(),
        userBooks,
        readingSessions,
        quotations,
        reviews,
        vocabulary,
        curriculum: FULL_FOUR_YEAR_CURRICULUM,
        poetry: fullPoetryCollection,
        displayName: userProfile.displayName,
        dailyTargetPages: userProfile.dailyTargetPages
      });

      const activeSources = ragResult ? [
        ...ragResult.retrievedBooks.slice(0, 2),
        ...ragResult.retrievedQuotes.slice(0, 2),
        ...ragResult.retrievedReviews.slice(0, 1),
        ...ragResult.retrievedCurriculum.slice(0, 2),
        ...ragResult.retrievedPoetry.slice(0, 1),
        ...ragResult.retrievedVocab.slice(0, 1),
      ].slice(0, 6) : [];

      const history = mode === 'source' ? undefined : messages.slice(-12).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          mode,
          history,
          densePromptContext: ragResult?.densePromptContext,
          userSummary: ragResult?.summary,
        })
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Sunucu geçerli bir JSON yanıtı döndürmedi.");
      }

      const data: RobiChatReply & { error?: string } = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Yapay zeka sunucusu hata döndürdü.");
      }

      const replyText = data.reply || 'Yanıt alınamadı.';
      const newModelIdx = messages.length + 1;

      const modelMsg: Message = { 
        role: 'model', 
        text: replyText,
        ragSummary: !data.isFallback && activeSources.length > 0 ? activeSources : undefined,
        model: data.model,
        isFallback: data.isFallback,
        sourceUrls: data.sourceUrls,
      };
      
      setMessages(prev => [...prev, modelMsg]);

      // Eğer Eller Serbest Modu açıksa, Robi cevabı otomatik olarak seslendirir!
      if (voiceChatModeRef.current) {
        setTimeout(() => {
          speakMessage(replyText, newModelIdx);
        }, 150);
      }

    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMsg = err.message || 'Yanıt alınamadı. Yeniden deneyebilirsin.';
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
      if (voiceChatModeRef.current) {
        speakMessage(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "🐿️ 12 Ana kategoriye ve kütüphaneme göre bana derin bir okuma haritası sun.",
    "Gazâlî ve Kant’ın aklın sınırlarına yaklaşımını, temel ayrımları ve okunabilecek birincil eserleriyle karşılaştır.",
    "📚 40 Yıllık okuma planımdaki ilk yıl klasiklerinden birini detaylandır.",
    "🖋️ Antolojimizdeki şiirlerden ve alıntılarımdan bana bir tefekkür mısrası seç."
  ];

  return (
    <div className="space-y-4 pb-28 md:pb-20 max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-140px)] animate-in fade-in duration-300">
      {/* Header Banner with Animated Robi Squirrel Badge & Voice Chat Controls */}
      <div className="bg-gradient-to-r from-[#742C3C] via-[#602332] to-[#4B1E2B] text-white rounded-3xl p-4 md:p-5 shadow-xl relative overflow-hidden shrink-0 border border-[#B79A63]/30">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#B79A63]/25 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-[#B79A63] text-slate-950 font-bold flex items-center justify-center text-2xl shadow-xl shrink-0 animate-bounce duration-1000 border-2 border-white/20">
              🐿️
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-[10px] md:text-xs font-semibold uppercase tracking-widest text-amber-300">
                <Sparkles className="w-3.5 h-3.5 fill-current animate-spin" />
                <span>Robi · Bilge Sincap & Sesli Asistan</span>
              </div>
              <h1 className="text-base md:text-lg font-serif-title font-bold flex items-center gap-2">
                <span>Robi ile Eller Serbest İlim Hasbihali</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h1>
              <p className="text-[11px] text-white/80">
                12 Kategori, 1920 Eserlik Müfredat, 256 Şiir ve Sesli Diyalog.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
            {/* Eller Serbest Sesli Sohbet Toggle Butonu */}
            <button
              onClick={() => {
                const nextMode = !voiceChatMode;
                setVoiceChatMode(nextMode);
                if (!nextMode) {
                  stopSpeaking();
                  stopListening();
                } else if (!isListening && !isSpeaking) {
                  startListening();
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                voiceChatMode 
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 font-bold animate-pulse' 
                  : 'bg-white/10 hover:bg-white/20 text-amber-200 border border-white/10'
              }`}
              title="Açıldığında karşılıklı konuşma tamamen sesli ve eller serbest olarak devam eder"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>{voiceChatMode ? 'Eller Serbest: AÇIK' : 'Eller Serbest Modu'}</span>
            </button>

            {/* Estetik Ses Ayarları Butonu */}
            <button
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                showVoiceSettings 
                  ? 'bg-amber-300 text-slate-950 font-bold' 
                  : 'bg-white/10 hover:bg-white/20 text-amber-200 border border-white/10'
              }`}
              title="Doğal ve Estetik Ses Tonu Seçimi"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Ses Ayarı</span>
            </button>

            {/* RAG Katmanı Detay Butonu */}
            <button
              onClick={() => setShowRagDetails(!showRagDetails)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-amber-200 border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <Database className="w-3.5 h-3.5 text-amber-300" />
              <span>Okur arşivi</span>
            </button>

            {/* Konuşuyorsa Sustur Butonu */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-2.5 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1 transition-all animate-pulse"
                title="Sesli Okumayı Durdur"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Sustur</span>
              </button>
            )}
          </div>
        </div>

        {/* Estetik ve Doğal Ses Tonu Ayar Paneli */}
        {showVoiceSettings && (
          <div className="mt-3 p-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl text-xs text-white space-y-3 animate-in fade-in duration-200 relative z-10">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 font-bold text-amber-200">
                <Sliders className="w-4 h-4 text-amber-300" />
                <span>Robi Ses Kalitesi & Estetik Ton Seçimi</span>
              </div>
              <button 
                onClick={() => setShowVoiceSettings(false)}
                className="text-white/60 hover:text-white text-[11px] underline"
              >
                Kapat
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {VOICE_PRESETS.map((preset) => {
                const isSelected = voiceTone === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setVoiceTone(preset.id);
                      try { localStorage.setItem('robi_voice_tone', preset.id); } catch {}
                      testVoiceSample(preset.id);
                    }}
                    className={`p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-medium' 
                        : 'bg-black/20 hover:bg-black/30 border-white/10 text-white/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between font-bold text-xs mb-0.5">
                        <span>{preset.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-slate-950 shrink-0 stroke-[3]" />}
                      </div>
                      <div className={`text-[10px] line-clamp-1 ${isSelected ? 'text-slate-800 font-semibold' : 'text-amber-300'}`}>
                        {preset.tagline}
                      </div>
                    </div>
                    <div className={`text-[10px] mt-1.5 leading-tight ${isSelected ? 'text-slate-900' : 'text-white/70'}`}>
                      {preset.description}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/10 text-[11px]">
              <div className="flex items-center gap-2 text-white/80">
                <Volume2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>
                  Kullanılan Ses: <strong>{
                    availableVoices.find(v => v.voiceURI === selectedVoiceUri)?.name || 'Doğal Türkçe Sentezleyici'
                  }</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Çoklu Türkçe ses varsa seçtir */}
                {availableVoices.filter(v => v.lang.toLowerCase().startsWith('tr')).length > 1 && (
                  <select
                    value={selectedVoiceUri}
                    onChange={(e) => {
                      setSelectedVoiceUri(e.target.value);
                      try { localStorage.setItem('robi_voice_uri', e.target.value); } catch {}
                    }}
                    className="bg-black/40 text-white border border-white/20 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
                  >
                    {availableVoices.filter(v => v.lang.toLowerCase().startsWith('tr')).map(v => (
                      <option key={v.voiceURI} value={v.voiceURI} className="bg-slate-900 text-white">
                        {v.name}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={() => testVoiceSample()}
                  className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow-xs active:scale-95"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Sesi Test Et</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mikrofon İzni Yardım Kartı (not-allowed Çözümü & Yeni Sekme Desteği) */}
        {permissionError && (
          <div className="mt-3 p-3.5 bg-amber-500/25 border border-amber-300/50 rounded-2xl text-xs text-amber-100 space-y-2.5 animate-in fade-in duration-200 relative z-10 backdrop-blur-md">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-md">
                <Mic className="w-4 h-4" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Mikrofon İzni Gerekli (Android / Tarayıcı)</span>
                  <button 
                    onClick={() => setPermissionError(false)}
                    className="text-amber-200/80 hover:text-white text-[11px] underline"
                  >
                    Kapat
                  </button>
                </div>
                <p className="text-amber-100/95 leading-relaxed text-[11px]">
                  Android Chrome veya önizleme çerçevesi mikrofona erişimi kısıtlamış olabilir. 
                  En hızlı ve sorunsuz konuşma için uygulamayı <strong>doğrudan yeni sekmede açabilir</strong> veya izin verip tekrar deneyebilirsiniz:
                </p>
                <ol className="list-decimal list-inside text-[11px] text-amber-200/90 space-y-0.5">
                  <li>Önizleme çerçevesi izni engelliyorsa aşağıdaki sarı butona basarak <strong>Yeni Sekmede Açın</strong>.</li>
                  <li>Chrome adres çubuğundaki kilit 🔒 veya ayar simgesinden <strong>Mikrofon: İzin Ver</strong> yapın.</li>
                </ol>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {/* Doğrudan bağımsız sekmede açma (Iframe kısıtlamasını sıfırlar, mikrofonu anında etkinleştirir) */}
              <button
                onClick={() => {
                  try {
                    window.open(window.location.href, '_blank');
                  } catch (e) {
                    window.location.reload();
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Yeni Sekmede Aç & Konuş (Kesin Çözüm)</span>
              </button>

              <button
                onClick={startListening}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tekrar Dene</span>
              </button>

              <button
                onClick={() => {
                  setVoiceChatMode(false);
                  setPermissionError(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white/80 text-xs transition-all"
              >
                Yazarak Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Canlı Dinleme / Konuşma Durum Bildirimi */}
        {(isListening || isSpeaking || generalSpeechError) && !permissionError && (
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs animate-in fade-in duration-200">
            {isListening && (
              <div className="flex items-center gap-2 text-amber-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                <span>Mikrofon Aktif: Sizi dinliyorum, konuşabilirsiniz...</span>
              </div>
            )}
            {isSpeaking && !isListening && (
              <div className="flex items-center gap-2 text-emerald-300 font-medium">
                <Radio className="w-3.5 h-3.5 animate-spin" />
                <span>Robi konuşuyor...</span>
              </div>
            )}
            {generalSpeechError && (
              <div className="flex items-center gap-1 text-rose-300 text-[11px]">
                <AlertCircle className="w-3 h-3" />
                <span>{generalSpeechError}</span>
              </div>
            )}
            {isListening && (
              <button 
                onClick={stopListening} 
                className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px]"
              >
                Dinlemeyi Bitir
              </button>
            )}
          </div>
        )}

        {/* Optional RAG Info Dropdown */}
        {showRagDetails && (
          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-amber-100 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-semibold">
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Soruyla ilgili okur arşivi kayıtları</span>
            </div>
            <p className="text-white/70 leading-relaxed">
              Robi, {userBooks.length} eser ve {quotations.length} alıntı içeren arşivinden ilgili kayıtları bulabilir. İncelemelerin, sözlüğün, şiir koleksiyonu ve okuma müfredatı da eşleştirmeye katılır.
            </p>
          </div>
        )}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white dark:bg-[#1E1E1E] rounded-3xl p-4 md:p-6 shadow-md border border-black/5 dark:border-white/5 overflow-y-auto space-y-4 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            className={`flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 shadow-md ${
              msg.role === 'user' 
                ? 'bg-[#742C3C] text-white' 
                : 'bg-gradient-to-br from-amber-500 to-[#B79A63] text-slate-950 border border-white/20'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : '🐿️'}
            </div>

            <div className={`max-w-[85%] p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-xs transition-all relative group ${
              msg.role === 'user'
                ? 'bg-[#742C3C] text-white rounded-tr-none shadow-rose-950/20'
                : 'bg-[#F8F5EF] dark:bg-[#141414] text-slate-800 dark:text-slate-200 rounded-tl-none border border-black/5 dark:border-white/5 font-serif'
            }`}>
              {/* Message Header with Read Aloud Button for Robi */}
              {msg.role === 'model' && (
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-black/5 dark:border-white/5">
                  <span className="text-[11px] font-sans font-semibold text-amber-700 dark:text-amber-400 flex flex-wrap items-center gap-1">
                    <span>Robi Bilge Sincap</span>
                    {msg.isFallback && <span className="text-slate-500 dark:text-slate-400">Sınırlı yanıt</span>}
                    {msg.model && <span className="text-slate-500 dark:text-slate-400">{msg.model}</span>}
                    {activeSpeakingIdx === idx && isSpeaking && (
                      <span className="flex items-center gap-0.5 text-emerald-600 animate-pulse text-[10px]">
                        <Radio className="w-3 h-3 animate-spin" />
                        <span>Seslendiriliyor...</span>
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => speakMessage(msg.text, idx)}
                    className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all flex items-center gap-1 text-[11px] font-sans"
                    title={activeSpeakingIdx === idx && isSpeaking ? "Seslendirmeyi Durdur" : "Sesli Dinle"}
                  >
                    {activeSpeakingIdx === idx && isSpeaking ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current text-rose-500" />
                        <span className="text-rose-500 font-semibold text-[10px]">Durdur</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">Sesli Dinle</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="whitespace-pre-line break-words">
                {msg.text}
              </div>

              {msg.sourceUrls && msg.sourceUrls.length > 0 && (
                <div className="mt-3 space-y-1 border-t border-black/10 pt-2 font-sans text-[11px] dark:border-white/10">
                  <p className="font-semibold">Erişilebilen kaynaklar</p>
                  {msg.sourceUrls.map(url => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block break-all underline">{url}</a>
                  ))}
                </div>
              )}

              {msg.ragSummary && msg.ragSummary.length > 0 && (
                <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10 text-[11px] text-amber-700 dark:text-amber-400/90 space-y-1">
                  <div className="flex items-center gap-1 font-sans font-semibold">
                    <Library className="w-3 h-3 text-amber-600" />
                    <span>Soruyla eşleşen arşiv kayıtları</span>
                  </div>
                  {msg.ragSummary.map((src, sIdx) => (
                    <div key={sIdx} className="line-clamp-1 font-sans opacity-90">{src}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 items-center animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-[#B79A63] text-slate-950 flex items-center justify-center text-base shadow-md">
              🐿️
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F8F5EF] dark:bg-[#141414] text-xs text-slate-500 italic flex items-center gap-2">
              <span className="animate-spin">🌰</span>
              <span>{chatMode === 'source' ? 'Bağlantı inceleniyor…' : 'Robi yanıtı hazırlıyor…'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-2 rounded-2xl border border-black/10 bg-white p-3 text-xs dark:border-white/10 dark:bg-[#1E1E1E]">
        <label className="flex flex-wrap items-center gap-2 font-semibold">
          Yanıt biçimi
          <select
            value={chatMode}
            onChange={event => {
              const mode = event.target.value as RobiChatMode;
              chatModeRef.current = mode;
              setChatMode(mode);
            }}
            disabled={isLoading}
            className="rounded-lg border border-black/10 bg-[#F8F5EF] px-2 py-1.5 dark:border-white/10 dark:bg-[#141414]"
          >
            {Object.entries(CHAT_MODES).map(([mode, option]) => <option key={mode} value={mode}>{option.label}</option>)}
          </select>
        </label>
        <p className="text-slate-600 dark:text-slate-300">{CHAT_MODES[chatMode].description}</p>
      </div>

      {/* Quick Prompts */}
      {chatMode !== 'source' && <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1E1E] hover:bg-[#742C3C] hover:text-white dark:hover:bg-[#742C3C] text-slate-700 dark:text-slate-300 border border-black/10 dark:border-white/10 text-xs font-semibold whitespace-nowrap shadow-xs transition-all shrink-0 active:scale-95"
          >
            {prompt}
          </button>
        ))}
      </div>}

      {/* Input Form with Web Speech Microphone & Voice Action */}
      <form 
        onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
        className={`flex items-center gap-2 bg-white dark:bg-[#1E1E1E] rounded-2xl p-2 shadow-2xl border transition-all shrink-0 sticky bottom-16 md:bottom-2 z-20 ${
          isListening ? 'border-rose-500 ring-4 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/10' : 'border-black/10 dark:border-white/10'
        }`}
      >
        {/* Mikrofon Butonu (STT) */}
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2.5 rounded-xl transition-all shadow-md active:scale-90 flex items-center justify-center relative shrink-0 ${
            isListening 
              ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-400/50' 
              : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
          }`}
          title={isListening ? "Dinlemeyi bitir ve gönder" : "Mikrofonla konuş (Sesli Soru)"}
        >
          {isListening ? (
            <>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
              <MicOff className="w-4 h-4" />
            </>
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        <textarea
          rows={1}
          aria-label="Robi'ye mesaj"
          placeholder={isListening ? 'Seni dinliyorum…' : chatMode === 'source' ? 'Herkese açık bağlantıyı ve sorunu yaz…' : 'Sorunu veya incelemek istediğin pasajı yaz…'}
          value={inputMessage}
          maxLength={12000}
          onChange={e => setInputMessage(e.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          className={`min-w-0 flex-1 max-h-32 resize-y px-3 py-2 text-xs md:text-sm bg-transparent focus:outline-none transition-colors ${
            isListening ? 'text-rose-700 dark:text-rose-300 font-medium italic' : 'text-slate-800 dark:text-slate-100'
          }`}
        />

        {/* Gönder Butonu */}
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="p-2.5 rounded-xl bg-[#742C3C] hover:bg-[#4B1E2B] disabled:opacity-50 text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
          title="Mesaj Gönder"
        >
          <span className="text-xs font-bold hidden sm:inline">Gönder</span>
          <Send className="w-4 h-4 text-[#B79A63]" />
        </button>
      </form>
    </div>
  );
};
