import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6',
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

interface PageHeaderWithBackProps extends PageHeaderProps {
  backHref?: string;
  backLabel?: string;
}

export function PageHeaderWithBack({
  title,
  description,
  actions,
  backHref = '/',
  backLabel = 'Back',
  className,
}: PageHeaderWithBackProps) {
  return (
    <div className={cn('mb-6', className)}>
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="text-gray-600"
        >
          ← {backLabel}
        </Button>
      </div>
      <PageHeader title={title} description={description} actions={actions} />
    </div>
  );
}
