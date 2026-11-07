import { readingDate } from '../utils/readingDate';
import React from 'react';
import { BookOpen, Compass, Sparkles, BookMarked, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCurriculumProgress } from '../data/readingPlanData';

export const WidgetView: React.FC = () => {
  const { userProfile: profile, userBooks, readingSessions, quranProgress } = useApp();
  const todayPagesRead = readingSessions.filter(session => session.date === readingDate()).reduce((total, session) => total + session.pagesRead, 0);
  const dailyTarget = Math.max(1, profile.dailyTargetPages || 40);
  const bookProgressPercent = Math.min(100, Math.round(todayPagesRead / dailyTarget * 100));
  const lastPage = quranProgress.lastReadPage || 1;
  const hatimPercent = Math.min(100, Math.round((quranProgress.completedJuzs?.length || 0) / 30 * 100));
  const dailyHizbGoal = quranProgress.dailyHizbGoal || 1;
  const { completedBooks: completedBooksCount, totalBooks: curriculumTotalBooks, percent } = getCurriculumProgress(userBooks);
  const curriculumProgressPercent = Number(percent.toFixed(1));

  const navigateTo = (tab: string, sub?: string) => {
    const targetUrl = sub ? `/?tab=${tab}&sub=${sub}` : `/?tab=${tab}`;
    window.location.href = targetUrl;
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        backgroundColor: '#290812',
        background: 'linear-gradient(135deg, #6B172E 0%, #400E1C 50%, #20040B 100%)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        userSelect: 'none'
      }}
    >
      {/* 
        Zero-Margin Full-Bleed Top Header Bar
        Guarantees the title is immediately visible at the very top edge of any widget crop box
      */}
      <div 
        style={{
          width: '100%',
          padding: '6px 12px',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderBottom: '1.5px solid rgba(212, 175, 55, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <span 
          style={{
            fontFamily: 'serif',
            fontWeight: 800,
            fontSize: '12px',
            letterSpacing: '1.5px',
            color: '#FFEAA7',
            textTransform: 'uppercase'
          }}
        >
          DİJİTAL KÜTÜPHANEM
        </span>

        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            fontWeight: 700,
            color: '#F9CA24'
          }}
        >
          <Sparkles style={{ width: '11px', height: '11px', color: '#F9CA24' }} />
          <span>CANLI TAKİP</span>
        </div>
      </div>

      {/* 
        3 Equal Full-Height Columns
        Takes 100% of the remaining vertical space with perfect responsive centering
      */}
      <div 
        style={{
          flex: 1,
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          alignItems: 'stretch',
          boxSizing: 'border-box'
        }}
      >
        {/* ================= 1. SÜTUN: KİTAP ================= */}
        <div 
          onClick={() => navigateTo('today')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '4px 2px',
            cursor: 'pointer',
            borderRight: '1px solid rgba(212, 175, 55, 0.35)',
            boxSizing: 'border-box'
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#FFEAA7',
              marginBottom: '4px'
            }}
          >
            <BookOpen style={{ width: '12px', height: '12px', color: '#F9CA24' }} />
            <span>1. KİTAP</span>
          </div>

          {/* Scaled Adaptive Circle */}
          <div 
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #5E1426 0%, #290812 100%)',
              border: '2.5px solid #F9CA24',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              marginBottom: '4px'
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
              %{bookProgressPercent}
            </span>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#F9CA24', marginTop: '1px' }}>
              HEDEF
            </span>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
            {todayPagesRead} <span style={{ fontSize: '10px', color: '#FFEAA7', fontWeight: 500 }}>/ {dailyTarget} syf</span>
          </div>
          <div style={{ fontSize: '9px', color: '#DFE6E9', marginTop: '2px' }}>
            Günlük Okuma
          </div>

          <div 
            style={{
              marginTop: '4px',
              fontSize: '9px',
              fontWeight: 700,
              color: '#F9CA24',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span>Bugün</span>
            <ExternalLink style={{ width: '9px', height: '9px' }} />
          </div>
        </div>

        {/* ================= 2. SÜTUN: KUR'AN ================= */}
        <div 
          onClick={() => navigateTo('explore', 'quran')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '4px 2px',
            cursor: 'pointer',
            borderRight: '1px solid rgba(212, 175, 55, 0.35)',
            boxSizing: 'border-box'
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#A8FFD8',
              marginBottom: '4px'
            }}
          >
            <BookMarked style={{ width: '12px', height: '12px', color: '#2ED573' }} />
            <span>2. KUR'AN</span>
          </div>

          {/* Scaled Adaptive Circle */}
          <div 
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #0B4A31 0%, #031F14 100%)',
              border: '2.5px solid #2ED573',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              marginBottom: '4px'
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#A8FFD8', lineHeight: 1 }}>
              %{hatimPercent}
            </span>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#2ED573', marginTop: '1px' }}>
              HATİM
            </span>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
            {dailyHizbGoal} <span style={{ fontSize: '10px', color: '#FFEAA7', fontWeight: 500 }}>/ 1 Hizb</span>
          </div>
          <div style={{ fontSize: '9px', color: '#DFE6E9', marginTop: '2px' }}>
            Sayfa {lastPage}/604
          </div>

          <div 
            style={{
              marginTop: '4px',
              fontSize: '9px',
              fontWeight: 700,
              color: '#2ED573',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span>Kur'an</span>
            <ExternalLink style={{ width: '9px', height: '9px' }} />
          </div>
        </div>

        {/* ================= 3. SÜTUN: İLİM YOLCULUĞUM ================= */}
        <div 
          onClick={() => navigateTo('explore', 'curriculum')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '4px 2px',
            cursor: 'pointer',
            boxSizing: 'border-box'
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#FFEAA7',
              marginBottom: '4px'
            }}
          >
            <Compass style={{ width: '12px', height: '12px', color: '#FFA502' }} />
            <span>3. İLİM</span>
          </div>

          {/* Scaled Adaptive Circle */}
          <div 
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #5C3202 0%, #241300 100%)',
              border: '2.5px solid #FFA502',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              marginBottom: '4px'
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#FFDF9D', lineHeight: 1 }}>
              %{curriculumProgressPercent}
            </span>
            <span style={{ fontSize: '8px', fontWeight: 700, color: '#FFA502', marginTop: '1px' }}>
              40 YIL
            </span>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
            {completedBooksCount} <span style={{ fontSize: '10px', color: '#FFEAA7', fontWeight: 500 }}>Eser</span>
          </div>
          <div style={{ fontSize: '9px', color: '#DFE6E9', marginTop: '2px' }}>
            Hedef: 4 Eser / Ay
          </div>

          <div 
            style={{
              marginTop: '4px',
              fontSize: '9px',
              fontWeight: 700,
              color: '#FFA502',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span>Müfredat</span>
            <ExternalLink style={{ width: '9px', height: '9px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
