import { cn } from '../../lib/utils';

interface SegmentedProps<T extends string | number> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  className?: string;
  size?: 'sm' | 'md';
}

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  className,
  size = 'md',
}: SegmentedProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border bg-muted/40 p-1',
        size === 'sm' ? 'text-xs' : 'text-sm',
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            type="button"
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all',
              size === 'sm' ? 'h-7 px-2.5' : 'h-8 px-3',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
