import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getAllBlogPosts, getBlogCanonicalUrl, getBlogPostBySlug, getOgImage, getRelatedBlogPosts, isValidSlug, renderContentBlocks, formatBlogDate } from '@/lib/blog';

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  if (!isValidSlug(slug)) {
    return {
      title: 'Post not found',
      robots: { index: false, follow: false },
    };
  }

  const post = getBlogPostBySlug(slug);
  if (!post) {
    return {
      title: 'Post not found',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: getBlogCanonicalUrl(post.slug),
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
      tags: post.tags,
      images: [
        {
          url: getOgImage(post),
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [getOgImage(post)],
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const { slug } = params;

  if (!isValidSlug(slug)) {
    notFound();
  }

  const post = getBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(post, 2);
  const articleUrl = getBlogCanonicalUrl(post.slug);
  const shareLinks = {
    x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(post.title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: [post.image],
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: articleUrl,
    author: {
      '@type': 'Organization',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'SetVenue',
      logo: {
        '@type': 'ImageObject',
        url: 'https://setvenue.com/icons/icon-512.png', // logo stays as PNG for schema.org
      },
    },
    keywords: post.tags.join(', '),
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="mx-auto max-w-5xl">
        <Link href="/blog" className="text-sm font-semibold text-blue-600 transition hover:text-slate-950">
          ← Back to blog
        </Link>

        <div className="mt-6 rounded-[36px] border border-black/8 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>{formatBlogDate(post.date)}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{post.author.name}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{post.author.role}</span>
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-6xl">{post.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{post.excerpt}</p>

          <div className="relative mt-8 h-[420px] w-full">
            <Image src={post.image} alt={post.title} fill priority sizes="(max-width: 1024px) 100vw, 960px" className="rounded-[28px] object-cover" />
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
            <div className="space-y-6 text-base leading-8 text-slate-700">
              {renderContentBlocks(post.content).map((block, index) => {
                if (block.type === 'ordered-list') {
                  return (
                    <ol key={`${post.slug}-block-${index}`} className="ml-6 list-decimal space-y-3">
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  );
                }

                if (block.type === 'unordered-list') {
                  return (
                    <ul key={`${post.slug}-block-${index}`} className="ml-6 list-disc space-y-3">
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  );
                }

                return (
                  <p key={`${post.slug}-block-${index}`} className="text-base leading-8 text-slate-700">
                    {block.text}
                  </p>
                );
              })}
            </div>

            <aside className="space-y-6">
              <div className="rounded-[28px] border border-black/8 bg-slate-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Author</p>
                <div className="mt-4 flex items-center gap-4">
                  <Image src={post.author.image} alt={post.author.name} width={56} height={56} className="h-14 w-14 rounded-full border border-black/8 bg-white object-cover" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">{post.author.name}</h2>
                    <p className="text-sm text-slate-500">{post.author.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{post.author.bio}</p>
              </div>

              <div className="rounded-[28px] border border-black/8 bg-slate-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Share</p>
                <div className="mt-4 grid gap-3">
                  <a href={shareLinks.x} target="_blank" rel="noreferrer" className="rounded-full border border-black/8 bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:border-blue-200 hover:text-blue-600">Share on X</a>
                  <a href={shareLinks.linkedin} target="_blank" rel="noreferrer" className="rounded-full border border-black/8 bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:border-blue-200 hover:text-blue-600">Share on LinkedIn</a>
                  <a href={shareLinks.facebook} target="_blank" rel="noreferrer" className="rounded-full border border-black/8 bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:border-blue-200 hover:text-blue-600">Share on Facebook</a>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <section className="mt-10 rounded-[36px] border border-black/8 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Related posts</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">Keep reading</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <article key={relatedPost.slug} className="overflow-hidden rounded-[28px] border border-black/8 bg-slate-50">
                <div className="relative h-52 w-full">
                  <Image src={relatedPost.image} alt={relatedPost.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-500">{formatBlogDate(relatedPost.date)}</p>
                  <h3 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                    <Link href={`/blog/${relatedPost.slug}`} className="transition hover:text-blue-600">
                      {relatedPost.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{relatedPost.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
