'use client';

import { useState, useEffect } from 'react';
import { WriteupData } from '@/lib/markdown';
import Link from 'next/link';
import LangToggle from './lang_toggle';

export default function WriteupsList({ allWriteups }: { allWriteups: WriteupData[] }) {
  const [lang, setLang] = useState<'ru' | 'en'>('ru');

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as 'ru' | 'en';
    if (savedLang) setLang(savedLang);
  }, []);

  const handleLangChange = (newLang: 'ru' | 'en') => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const filtered = allWriteups.filter((w) => w.lang === lang);

  return (
    <>
      <div className="flex justify-end mb-6">
        <LangToggle currentLang={lang} onLangChange={handleLangChange} />
      </div>

      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {filtered.length === 0 ? (
          <p className="text-sm font-mono text-zinc-500 py-6">No entries found for this language.</p>
        ) : (
          filtered.map(({ slug, title, date, category, summary }) => (
            <article key={slug} className="py-6 first:pt-0">
              <div className="flex items-center space-x-4 text-xs font-mono text-zinc-500 mb-2">
                <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {category}
                </span>
                <span>{date}</span>
              </div>
              <h2 className="text-lg font-semibold tracking-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Link href={`/writeups/${slug}`}>{title}</Link>
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                {summary}
              </p>
            </article>
          ))
        )}
      </div>
    </>
  );
}