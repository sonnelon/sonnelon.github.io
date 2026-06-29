'use client';

import { useRouter } from 'next/navigation';
import LangToggle from './lang_toggle';

interface HeaderProps {
  id: string;
  currentLang: 'ru' | 'en';
  availableLangs: string[];
  title: string;
  category: string;
  date: string;
}

export default function ArticleHeader({ id, currentLang, availableLangs, title, category, date }: HeaderProps) {
  const router = useRouter();

  const handleLangChange = (targetLang: 'ru' | 'en') => {
    localStorage.setItem('lang', targetLang);
    router.push(`/writeups/${id}_${targetLang}`);
  };

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8">
      <div className="flex justify-between items-start mb-4">
        <div className="text-xs font-mono text-zinc-500">
          ID: {id} // CAT: {category.toUpperCase()} // DATE: {date}
        </div>
        <LangToggle currentLang={currentLang} onLangChange={handleLangChange} availableLangs={availableLangs} />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
    </header>
  );
}