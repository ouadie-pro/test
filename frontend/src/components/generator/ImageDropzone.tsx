import { useCallback, useRef, useState } from 'react';
import { Upload, X, ImagePlus, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { assetsApi } from '../../services/endpoints';

interface Props {
  value?: string;
  onChange: (url: string) => void;
  label: string;
  hint?: string;
  optional?: boolean;
  className?: string;
}

const ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_BYTES = 20 * 1024 * 1024;

export function ImageDropzone({ value, onChange, label, hint, optional, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
        setError('Unsupported format. Use JPG, PNG, or WEBP.');
        return;
      }
      if (file.size > MAX_BYTES) {
        setError('Image is too large. Max 20MB.');
        return;
      }
      setError(null);
      setUploading(true);
      try {
        const { asset } = await assetsApi.upload(file);
        onChange(asset.url);
      } catch (e) {
        setError((e as Error)?.message || 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{label}</div>
          {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
        </div>
        {optional && (
          <span className="rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Optional
          </span>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => {
          if (!uploading) inputRef.current?.click();
        }}
        className={cn(
          'group relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-muted/30 transition-all',
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/40 hover:bg-muted/40',
          uploading && 'cursor-wait',
          value && 'border-solid border-border bg-background p-0'
        )}
        role="button"
        tabIndex={0}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-end justify-end gap-2 p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!uploading) inputRef.current?.click();
                }}
                className="grid h-8 w-8 place-items-center rounded-lg bg-background/90 text-foreground shadow-sm backdrop-blur hover:bg-background"
                aria-label="Replace image"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="grid h-8 w-8 place-items-center rounded-lg bg-background/90 text-destructive shadow-sm backdrop-blur hover:bg-background"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : uploading ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-background shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">Uploading…</div>
              <div className="mt-1 text-xs text-muted-foreground">Please wait</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-background shadow-sm">
              {dragging ? <Upload className="h-5 w-5 text-primary" /> : <ImagePlus className="h-5 w-5 text-primary" />}
            </div>
            <div>
              <div className="text-sm font-medium">
                <span className="text-primary">Click to upload</span> or drag and drop
              </div>
              <div className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP up to 20MB</div>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
          className="hidden"
        />
      </div>

      {error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
}
