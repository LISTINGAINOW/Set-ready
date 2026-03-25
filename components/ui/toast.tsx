'use client';

import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastVariant = 'success' | 'error' | 'info';

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-white text-black shadow-[0_18px_50px_rgba(16,185,129,0.14)]',
  error: 'border-red-200 bg-white text-black shadow-[0_18px_50px_rgba(239,68,68,0.14)]',
  info: 'border-blue-200 bg-white text-black shadow-[0_18px_50px_rgba(59,130,246,0.16)]',
};

const iconStyles: Record<ToastVariant, string> = {
  success: 'bg-emerald-50 text-emerald-600',
  error: 'bg-red-50 text-red-600',
  info: 'bg-blue-50 text-blue-600',
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const className = `h-5 w-5 ${iconStyles[variant]}`;

  if (variant === 'success') return <CheckCircle2 className={className} />;
  if (variant === 'error') return <TriangleAlert className={className} />;
  return <Info className={className} />;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(({ title, description, variant = 'info' }: ToastInput) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, title, description, variant }]);
    window.setTimeout(() => removeToast(id), 3200);
  }, [removeToast]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex justify-center px-4 sm:justify-end sm:px-6">
        <div className="flex w-full max-w-sm flex-col gap-3">
          {toasts.map((item) => (
            <div key={item.id} className={`pointer-events-auto rounded-3xl border p-4 ${variantStyles[item.variant]} animate-toast-in`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-2xl p-2">
                  <ToastIcon variant={item.variant} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold tracking-[-0.02em] text-black">{item.title}</p>
                  {item.description ? <p className="mt-1 text-sm leading-6 text-black/65">{item.description}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(item.id)}
                  className="rounded-full border border-black/10 p-1 text-black/50 transition hover:border-blue-200 hover:text-blue-600"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
