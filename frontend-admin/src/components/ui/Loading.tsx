import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

function Loading({ size = 'md', className }: LoadingProps) {
  return (
    <Loader2
      className={cn('animate-spin text-blue-600', sizeStyles[size], className)}
    />
  );
}

interface LoadingOverlayProps {
  message?: string;
}

function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <Loading size="lg" />
      <p className="mt-4 text-sm text-gray-600">{message}</p>
    </div>
  );
}

interface LoadingSpinnerProps {
  className?: string;
}

function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <Loading size="lg" />
    </div>
  );
}

export { Loading, LoadingOverlay, LoadingSpinner };
