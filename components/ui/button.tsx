import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function Button({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'btn-press inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50';

  const variantClasses = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    outline: 'border border-black bg-white text-black hover:border-blue-500 hover:text-blue-600',
    ghost: 'bg-white text-black hover:text-blue-600',
    destructive: 'border border-black bg-black text-white hover:bg-blue-500 hover:border-blue-500',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 px-5 py-2',
    lg: 'h-12 px-8 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
