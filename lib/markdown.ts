import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const writeupsDirectory = path.join(process.cwd(), '_writeups');

export interface WriteupData {
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  contentHtml?: string;
}

export function getSortedWriteupsData(): WriteupData[] {
  if (!fs.existsSync(writeupsDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(writeupsDirectory);
  const allWriteupsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(writeupsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      return {
        slug,
        ...(matterResult.data as { title: string; date: string; category: string; summary: string }),
      };
    });

  return allWriteupsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getWriteupData(slug: string): Promise<WriteupData> {
  const fullPath = path.join(writeupsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    ...(matterResult.data as { title: string; date: string; category: string; summary: string }),
  };
}
