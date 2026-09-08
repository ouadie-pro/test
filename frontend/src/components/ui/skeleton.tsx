import { cn } from '../../lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('vf-skeleton rounded-md', className)} {...props} />;
}

export { Skeleton };
