'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Quote } from 'lucide-react';

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  location: string;
};

type TestimonialCarouselProps = {
  testimonials: Testimonial[];
};

export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-black bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:rounded-[36px] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">What people say</p>
          <div className="mt-6 overflow-hidden rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff,#ffffff_60%,#f8fafc)] p-6 sm:p-8">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <article key={`${testimonial.name}-${testimonial.location}`} className="w-full shrink-0">
                  <div className="inline-flex rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
                    <Quote className="h-5 w-5" />
                  </div>
                  <blockquote className="mt-6 max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.04em] text-black sm:text-3xl">
                    “{testimonial.quote}”
                  </blockquote>
                  <div className="mt-8">
                    <p className="text-base font-semibold text-black">{testimonial.name}</p>
                    <p className="mt-1 text-sm text-black/65">
                      {testimonial.role} · {testimonial.location}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            {testimonials.map((testimonial, index) => (
              <button
                key={`${testimonial.name}-dot`}
                type="button"
                aria-label={`Show testimonial ${index + 1}`}
                aria-pressed={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={`h-3 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-10 bg-blue-500' : 'w-3 bg-black/15 hover:bg-black/30'}`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-black bg-black p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:rounded-[36px] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">For hosts</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
            “SetVenue turned unused weekdays into serious monthly revenue.”
          </h2>
          <p className="mt-5 text-base leading-7 text-white/72 sm:text-lg">
            Hosts with camera-ready properties can earn <span className="font-semibold text-white">$3,000+/month</span> by welcoming film shoots, photo sessions, and production teams.
          </p>
          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-lg font-semibold text-white">Maya R.</p>
            <p className="mt-1 text-sm text-blue-200">Host · West Hollywood</p>
            <p className="mt-4 text-sm leading-7 text-white/70">
              “The quality of inquiries went up fast. Better guests, clear expectations, and a platform that actually makes the property feel premium.”
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/list-property"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-blue-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              List your property
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/locations"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/15 px-6 py-4 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
            >
              Explore live demand
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
