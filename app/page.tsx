import { getSortedWriteupsData } from '@/lib/markdown';
import Link from 'next/link';
import ThemeToggle from './theme_toggle';

export default function Home() {
  const writeups = getSortedWriteupsData();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <main className="max-w-3xl mx-auto px-6 py-12">
        
        <header className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-mono">da710ff / writeups</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Automated research, vulnerability analysis and CTF logs.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <section className="space-y-8">
          {writeups.length === 0 ? (
            <p className="text-sm font-mono text-zinc-500">No entries found.</p>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {writeups.map(({ slug, title, date, category, summary }) => (
                <article key={slug} className="py-6 first:pt-0 group">
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
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
