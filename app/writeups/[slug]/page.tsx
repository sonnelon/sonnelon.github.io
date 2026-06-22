import { getWriteupData, getSortedWriteupsData } from '@/lib/markdown';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

// Генерируем статические пути при сборке (обязательно для SSG/GitHub Pages)
export async function generateStaticParams() {
  const writeups = getSortedWriteupsData();
  return writeups.map((w) => ({ slug: w.slug }));
}

export default async function Writeup({ params }: Props) {
  const { slug } = await params;
  
  try {
    const data = await getWriteupData(slug);

    return (
      <main className="min-h-screen bg-black text-zinc-300 font-mono p-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-green-500 hover:underline text-sm">&lt;-- BACK TO BASE_</Link>
        </div>

        <article>
          <header className="border-b border-zinc-800 pb-4 mb-6">
            <div className="text-xs text-green-500 mb-2">[{data.category.toUpperCase()}] // {data.date}</div>
            <h1 className="text-3xl font-bold text-white font-mono">{data.title}</h1>
          </header>

          {/* Рендеринг контента из Markdown */}
          <div 
            className="prose prose-invert max-w-none 
              prose-headings:text-green-400 prose-headings:font-mono
              prose-code:text-green-300 prose-code:bg-zinc-900 prose-code:px-1 prose-code:rounded
              prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800"
            dangerouslySetInnerHTML={{ __html: data.contentHtml || '' }} 
          />
        </article>
      </main>
    );
  } catch {
    notFound();
  }
}
