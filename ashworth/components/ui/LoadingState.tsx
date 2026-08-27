import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({
  message = 'Loading…',
  className = '',
}: LoadingStateProps) {
  return (
    <div
      className={`border border-gold-light/50 bg-beige px-8 py-14 text-center flex flex-col items-center gap-4 ${className}`}
    >
      <Loader2 size={26} className="animate-spin text-gold-dark" />
      <p className="font-sans text-sm text-ink/65">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className = '' }: ErrorStateProps) {
  return (
    <div
      className={`border border-gold-light/50 bg-beige px-8 py-12 text-center flex flex-col items-center gap-4 ${className}`}
    >
      <p className="font-sans text-sm text-ink/70">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-3 border border-gold px-9 py-3 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
