import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { formatBlogDate, getAllBlogPosts, getBlogCanonicalUrl } from '@/lib/blog';

const title = 'Blog';
const description = 'Production guidance, location scouting insights, privacy best practices, and curated inspiration from the SetVenue editorial team.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: `${title} | SetVenue`,
    description,
    url: getBlogCanonicalUrl(),
    type: 'website',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'SetVenue blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} | SetVenue`,
    description,
    images: ['/icons/icon-512.png'],
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">Editorial</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-6xl">Production advice with fewer clichés.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Insights on location scouting, photogenic homes, privacy-first production planning, and what actually matters when you need the right set.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {posts.map((post, index) => (
            <article
              key={post.slug}
              className={`overflow-hidden rounded-[32px] border border-black/8 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] ${index === 0 ? 'lg:col-span-3 lg:grid lg:grid-cols-[1.1fr_0.9fr]' : ''}`}
            >
              <div className={`relative min-h-[260px] w-full ${index === 0 ? 'lg:min-h-[420px]' : ''}`}>
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes={index === 0 ? '(max-width: 1024px) 100vw, 55vw' : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                  className="object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  priority={index === 0}
                />
              </div>
              <div className="flex flex-col justify-between p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>{formatBlogDate(post.date)}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{post.author.name}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-3xl">
                    <Link href={`/blog/${post.slug}`} className="transition hover:text-blue-600">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-4 text-base leading-8 text-slate-600">{post.excerpt}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 transition hover:text-blue-600"
                >
                  Read more
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
