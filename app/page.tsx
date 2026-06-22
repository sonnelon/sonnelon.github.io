import { getSortedWriteupsData } from '@/lib/markdown';
import Link from 'next/link';

export default function Home() {
  const writeups = getSortedWriteupsData();

  return (
    <main className="min-h-screen bg-black text-green-500 font-mono p-8 max-w-4xl mx-auto selection:bg-green-500 selection:text-black">
      <header className="border-b border-green-800 pb-4 mb-8">
        <h1 className="text-3xl font-bold tracking-wider animate-pulse">[☠️] RM -RF /WRITEUPS</h1>
        <p className="text-xs text-green-700 mt-1">Logged in as: anonymous // Active sessions: 1</p>
      </header>

      <section className="space-y-6">
        {writeups.length === 0 ? (
          <p className="text-red-500">No logs found in _writeups/ directory.</p>
        ) : (
          writeups.map(({ slug, title, date, category, summary }) => (
            <article key={slug} className="border border-green-900 p-4 rounded bg-zinc-950 hover:border-green-500 transition-colors">
              <div className="flex justify-between text-xs text-green-600 mb-2">
                <span>[{category.toUpperCase()}]</span>
                <span>{date}</span>
              </div>
              <h2 className="text-xl font-semibold mb-2 hover:underline">
                <Link href={`/writeups/${slug}`}>&gt; {title}</Link>
              </h2>
              <p className="text-zinc-400 text-sm">{summary}</p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
