'use client';

import { useState } from 'react';
import { Share2, Check, Link as LinkIcon, Mail } from 'lucide-react';

interface Props {
  title: string;
  url?: string;
}

export default function ShareButton({ title, url }: Props) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // User cancelled or share failed, fall back to dropdown
        setIsOpen(!isOpen);
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  const emailSubject = encodeURIComponent(`Check out this location: ${title}`);
  const emailBody = encodeURIComponent(`I found this production location on SetVenue:\n\n${title}\n${shareUrl}`);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleNativeShare}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
        aria-label="Share this location"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => {
                handleCopy();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <a
              href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
              onClick={() => setIsOpen(false)}
            >
              <Mail className="h-4 w-4" />
              Email this location
            </a>
          </div>
        </>
      )}
    </div>
  );
}
