'use client';

import { useEffect, useState } from 'react';

interface LangToggleProps {
  currentLang: 'ru' | 'en';
  onLangChange: (lang: 'ru' | 'en') => void;
  availableLangs?: string[]; 
}

export default function LangToggle({ currentLang, onLangChange, availableLangs }: LangToggleProps) {
  const hasRU = availableLangs ? availableLangs.includes('ru') : true;
  const hasEN = availableLangs ? availableLangs.includes('en') : true;

  return (
    <div className="flex items-center space-x-1 border border-zinc-300 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-900 p-0.5 font-mono text-xs">
      <button
        disabled={!hasRU}
        onClick={() => onLangChange('ru')}
        className={`px-2 py-0.5 rounded transition-colors ${
          currentLang === 'ru'
            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold'
            : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'
        } ${!hasRU ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        RU
      </button>
      <span className="text-zinc-300 dark:text-zinc-700">|</span>
      <button
        disabled={!hasEN}
        onClick={() => onLangChange('en')}
        className={`px-2 py-0.5 rounded transition-colors ${
          currentLang === 'en'
            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold'
            : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'
        } ${!hasEN ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        EN
      </button>
    </div>
  );
}