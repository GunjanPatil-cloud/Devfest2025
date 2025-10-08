import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BlogPost, BlogPostWithContent } from '@/types/blog';

const blogDirectory = path.join(process.cwd(), 'data/blog');

const images: Record<string, () => Promise<typeof import('*.jpg')>> = {
  'aws-hero': () => import('@/images/blog/aws-hero.png'),
  'aws-mini': () => import('@/images/blog/aws-mini.png'),
  'bouygues-mini': () => import('@/images/blog/bouygues-mini.png'),
  'bouygues-hero': () => import('@/images/blog/bouygues-hero.png'),
  'capgemini-hero': () => import('@/images/blog/capgemini-hero.png'),
  'capgemini-mini': () => import('@/images/blog/capgemini-mini.png'),
  'cgi-hero': () => import('@/images/blog/cgi-hero.png'),
  'cgi-mini': () => import('@/images/blog/cgi-mini.png'),
  'dataiku-hero': () => import('@/images/blog/dataiku-hero.png'),
  'dataiku-mini': () => import('@/images/blog/dataiku-mini.png'),
  'devfest-hero': () => import('@/images/blog/devfest-hero.jpg'),
  'devfest-mini': () => import('@/images/blog/devfest-mini.jpg'),
  'generali-hero': () => import('@/images/blog/generali-hero.png'),
  'generali-mini': () => import('@/images/blog/generali-mini.png'),
  'google-hero': () => import('@/images/blog/google-hero.png'),
  'google-mini': () => import('@/images/blog/google-mini.png'),
  'onepoint-hero': () => import('@/images/blog/onepoint-hero.png'),
  'onepoint-mini': () => import('@/images/blog/onepoint-mini.png'),
  'proginov-hero': () => import('@/images/blog/proginov-hero.png'),
  'proginov-mini': () => import('@/images/blog/proginov-mini.png'),
  'soprasteria-mini': () => import('@/images/blog/soprasteria-mini.png'),
  'soprasteria-hero': () => import('@/images/blog/soprasteria-hero.png'),
  'thales-hero': () => import('@/images/blog/thales-hero.png'),
  'thales-mini': () => import('@/images/blog/thales-mini.png'),
  'u-tech-hero': () => import('@/images/blog/u-tech-hero.png'),
  'u-tech-mini': () => import('@/images/blog/u-tech-mini.png'),
  'checklist-participant-hero': () =>
    import('@/images/blog/checklist-participant-hero.png'),
  'checklist-participant-mini': () =>
    import('@/images/blog/checklist-participant-mini.png'),
};

async function loadBlogImage(path: string): Promise<string | undefined> {
  const imageLoader = images[path];
  if (imageLoader) {
    const imageModule = await imageLoader();
    return imageModule.default?.src;
  }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const filenames = fs.readdirSync(blogDirectory);

  const posts = await Promise.all(
    filenames
      .filter((name) => name.endsWith('.mdx') && !name.endsWith('-en.mdx'))
      .map(async (filename) => {
        const fullPath = path.join(blogDirectory, filename);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        const slug = filename.replace(/\.(mdx|md)$/, '');

        // Extraire un extrait du contenu (premiers paragraphes)
        const excerpt = extractExcerpt(content);

        // Gérer les images automatiquement avec await import
        const imageBase = data.image || slug;
        const miniImage = await loadBlogImage(imageBase + '-mini');

        return {
          title: data.title || '',
          key: data.key || slug,
          image: miniImage,
          date: data.date || '',
          slug,
          content: excerpt,
        } as BlogPost;
      })
  );

  return posts.sort((a, b) => {
    // Trier par date décroissante (plus récent en premier)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

function extractExcerpt(content: string): string {
  // Supprimer le frontmatter et les titres principaux
  const cleanContent = content
    .replace(/^---[\s\S]*?---/, '')
    .replace(/^#.*$/gm, '')
    .trim();

  // Prendre les premiers paragraphes (environ 200 caractères)
  const paragraphs = cleanContent
    .split('\n\n')
    .filter((p) => p.trim().length > 0);
  let excerpt = '';

  for (const paragraph of paragraphs) {
    if (excerpt.length + paragraph.length < 200) {
      excerpt += paragraph + '\n\n';
    } else {
      // Couper proprement au niveau des mots
      const remainingLength = 200 - excerpt.length;
      const words = paragraph.split(' ');
      let truncated = '';

      for (const word of words) {
        if (truncated.length + word.length + 1 < remainingLength) {
          truncated += (truncated ? ' ' : '') + word;
        } else {
          break;
        }
      }

      excerpt += truncated + '...';
      break;
    }
  }

  return excerpt.trim() || cleanContent.substring(0, 200) + '...';
}

export async function getBlogPostBySlug(
  slug: string,
  locale: string
): Promise<BlogPostWithContent | null> {
  try {
    const fullPath = path.join(blogDirectory, `${slug}.mdx`);
    const fullPathEn = path.join(blogDirectory, `${slug}-en.mdx`);

    // Prioriser la version anglaise si la locale est 'en' et que le fichier existe
    const isEnglish =
      locale.toLowerCase().startsWith('en') && fs.existsSync(fullPathEn);
    const pathToUse = isEnglish ? fullPathEn : fullPath;

    const fileContents = fs.readFileSync(pathToUse, 'utf8');

    const { data, content } = matter(fileContents);

    // Gérer les images automatiquement avec await import
    const imageBase = data.image || slug;
    const heroImage = await loadBlogImage(imageBase + '-hero');

    return {
      title: data.title || '',
      key: data.key || slug,
      image: heroImage,
      date: data.date || '',
      slug,
      content,
      hideTitle: data.hideTitle || false,
    } as BlogPostWithContent;
  } catch {
    return null;
  }
}
