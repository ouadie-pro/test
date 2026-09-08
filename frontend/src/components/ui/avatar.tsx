import * as React from 'react';
import { cn, pickInitials } from '../../lib/utils';

interface AvatarProps {
  src?: string;
  name?: string;
  className?: string;
  size?: number;
}

export function Avatar({ src, name, className, size = 36 }: AvatarProps) {
  const [errored, setErrored] = React.useState(false);
  const style: React.CSSProperties = { width: size, height: size, fontSize: size * 0.4 };

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        onError={() => setErrored(true)}
        style={style}
        className={cn('rounded-full object-cover ring-1 ring-border', className)}
      />
    );
  }
  return (
    <div
      style={style}
      className={cn(
        'vf-gradient-bg flex items-center justify-center rounded-full font-semibold text-white',
        className
      )}
    >
      {pickInitials(name)}
    </div>
  );
}
