import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const writeupsDirectory = path.resolve(process.cwd(), '_writeups');

export interface WriteupData {
  id: string;
  slug: string;
  lang: 'ru' | 'en';
  title: string;
  date: string;
  category: string;
  summary: string;
  contentHtml?: string;
  availableLangs: string[];
}

function parseFileName(fileName: string) {
  const cleanName = fileName.replace(/\.md$/, '');
  const match = cleanName.match(/(.+)(_(ru|en))$/);
  
  if (match) {
    return { id: match[1], lang: match[3] as 'ru' | 'en' };
  }
  return { id: cleanName, lang: 'ru' as 'ru' | 'en' };
}

export function getSortedWriteupsData(): WriteupData[] {
  if (!fs.existsSync(writeupsDirectory)) {
    fs.mkdirSync(writeupsDirectory, { recursive: true });
    return [];
  }
  
  const fileNames = fs.readdirSync(writeupsDirectory).filter(f => f.endsWith('.md'));
  
  const langMap: Record<string, string[]> = {};
  fileNames.forEach((fileName) => {
    const { id, lang } = parseFileName(fileName);
    if (!langMap[id]) langMap[id] = [];
    langMap[id].push(lang);
  });

  const allWriteupsData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const { id, lang } = parseFileName(fileName);
    const fullPath = path.join(writeupsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      id,
      slug,
      lang,
      availableLangs: langMap[id] || [lang],
      ...(matterResult.data as { title: string; date: string; category: string; summary: string }),
    };
  });

  return allWriteupsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getWriteupData(slug: string): Promise<WriteupData> {
  const fullPath = path.join(writeupsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const { id, lang } = parseFileName(`${slug}.md`);

  const fileNames = fs.readdirSync(writeupsDirectory).filter(f => f.endsWith('.md'));
  const availableLangs = fileNames
    .map(f => parseFileName(f))
    .filter(item => item.id === id)
    .map(item => item.lang);

  const processedContent = await remark().use(html).process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id,
    slug,
    lang,
    availableLangs,
    contentHtml,
    ...(matterResult.data as { title: string; date: string; category: string; summary: string }),
  };
}