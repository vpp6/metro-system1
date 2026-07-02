import React, { createContext, useContext } from 'react';
import { translations, TranslationKey } from './translations';

interface LanguageContextType {
  lang: 'en';
  t: (key: TranslationKey) => string;
  dir: 'ltr';
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  t: () => '',
  dir: 'ltr',
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const t = (key: TranslationKey): string => translations[key]?.en ?? key;

  return (
    <LanguageContext.Provider value={{ lang: 'en', t, dir: 'ltr' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

function parseSafeDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function parseSafeTime(timeStr?: string | null): { h: number; m: number } | null {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  if (isNaN(h) || isNaN(m)) return null;
  return { h, m };
}

export function formatLangDate(dateStr: string | null | undefined): string {
  const d = parseSafeDate(dateStr);
  if (!d) return dateStr || '-';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatLangTime(timeStr: string | null | undefined): string {
  const t = parseSafeTime(timeStr);
  if (!t) return timeStr || '-';
  const ampm = t.h >= 12 ? 'PM' : 'AM';
  const h12 = t.h % 12 || 12;
  return `${h12}:${String(t.m).padStart(2, '0')} ${ampm}`;
}
