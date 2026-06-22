import { getWriteupData, getSortedWriteupsData } from '@/lib/markdown';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ThemeToggle from '@/app/theme_toggle';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const writeups = getSortedWriteupsData();
  return writeups.map((w) => ({
    slug: w.slug, 
  }));
}

export const dynamicParams = false;

export default async function Writeup({ params }: Props) {
  const { slug } = await params;
  
  try {
    const data = await getWriteupData(slug);

    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        <main className="max-w-3xl mx-auto px-6 py-12">
          
          <header className="flex justify-between items-center mb-8">
            <Link href="/" className="text-sm font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              &larr; index
            </Link>
            <ThemeToggle />
          </header>

          <article>
            <header className="border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8">
              <div className="text-xs font-mono text-zinc-500 mb-2">
                TASK: {data.slug} // CAT: {data.category.toUpperCase()} // DATE: {data.date}
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
            </header>

            <div 
              className="
                prose max-w-none text-zinc-800 dark:text-zinc-300 leading-relaxed
                [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mt-8 [&>h1]:mb-4 [&>h1]:font-mono
                [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:font-mono
                [&>p]:mb-4 [&>p]:text-sm
                [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ul]:text-sm
                [&>code]:font-mono [&>code]:text-xs [&>code]:bg-zinc-100 dark:[&>code]:bg-zinc-900 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:border [&>code]:border-zinc-200 dark:[&>code]:border-zinc-800
                [&>pre]:bg-zinc-50 dark:[&>pre]:bg-zinc-900 [&>pre]:p-4 [&>pre]:rounded [&>pre]:overflow-x-auto [&>pre]:border [&>pre]:border-zinc-200 dark:[&>pre]:border-zinc-800 [&>pre]:mb-6
                [&>pre>code]:bg-transparent [&>pre>code]:border-none [&>pre>code]:p-0
              "
              dangerouslySetInnerHTML={{ __html: data.contentHtml || '' }} 
            />
          </article>

        </main>
      </div>
    );
  } catch {
    notFound();
  }
}
