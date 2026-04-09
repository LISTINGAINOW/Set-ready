import blogPostsData from '@/data/blog-posts.json';

const SITE_URL = 'https://setvenue.com';
const BLOG_PATH = '/blog';
const DEFAULT_OG_IMAGE = '/api/og?type=default&title=Blog';

export type BlogAuthor = {
  name: string;
  role: string;
  bio: string;
  image: string;
};

export type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: BlogAuthor;
  date: string;
  image: string;
  tags: string[];
};

const blogPosts = (blogPostsData as BlogPost[])
  .filter(isBlogPost)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getAllBlogPosts() {
  return blogPosts;
}

export function getBlogPostBySlug(slug: string) {
  if (!isValidSlug(slug)) return null;
  return blogPosts.find((post) => post.slug === slug) ?? null;
}

export function getRelatedBlogPosts(post: BlogPost, limit = 2) {
  return blogPosts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      post: candidate,
      score: candidate.tags.filter((tag) => post.tags.includes(tag)).length,
    }))
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .slice(0, limit)
    .map(({ post: relatedPost }) => relatedPost);
}

export function isValidSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function getBlogCanonicalUrl(slug?: string) {
  return slug ? `${SITE_URL}${BLOG_PATH}/${slug}` : `${SITE_URL}${BLOG_PATH}`;
}

export function getOgImage(post?: BlogPost) {
  if (!post) return DEFAULT_OG_IMAGE;
  return post.image || DEFAULT_OG_IMAGE;
}

export function formatBlogDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function renderContentBlocks(content: string) {
  return content
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (/^\d+\.\s/.test(block)) {
        return { type: 'ordered-list' as const, items: block.split(/\n/).map((item) => item.replace(/^\d+\.\s*/, '').trim()).filter(Boolean) };
      }

      if (block.startsWith('- ')) {
        return { type: 'unordered-list' as const, items: block.split(/\n/).map((item) => item.replace(/^-\s*/, '').trim()).filter(Boolean) };
      }

      return { type: 'paragraph' as const, text: block };
    });
}

function isBlogPost(value: unknown): value is BlogPost {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<BlogPost>;

  return (
    typeof candidate.title === 'string' &&
    typeof candidate.slug === 'string' &&
    isValidSlug(candidate.slug) &&
    typeof candidate.excerpt === 'string' &&
    typeof candidate.content === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.image === 'string' &&
    Array.isArray(candidate.tags) &&
    candidate.tags.every((tag) => typeof tag === 'string') &&
    !!candidate.author &&
    typeof candidate.author.name === 'string' &&
    typeof candidate.author.role === 'string' &&
    typeof candidate.author.bio === 'string' &&
    typeof candidate.author.image === 'string'
  );
}
