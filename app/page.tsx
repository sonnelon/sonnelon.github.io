import { getSortedWriteupsData } from '@/lib/markdown';
import ThemeToggle from './theme_toggle';
import WriteupsList from './writeups_list';

export default function Home() {
  const allWriteups = getSortedWriteupsData();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <main className="max-w-3xl mx-auto px-6 py-12">
        <header className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-mono">0xda710ff / writeups</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">ctf | pwn writeups</p>
          </div>
          <ThemeToggle />
        </header>

        <WriteupsList allWriteups={allWriteups} />
      </main>
    </div>
  );
}