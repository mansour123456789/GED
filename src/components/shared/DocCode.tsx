import React, { useState } from 'react';
import { parseDocCode } from '@/utils/docCode';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

interface DocCodeProps {
  code: string;
  className?: string;
  showCopy?: boolean;
}

export const DocCode: React.FC<DocCodeProps> = ({ code, className, showCopy = true }) => {
  const parts = parseDocCode(code);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Code copié : ${code}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-xs bg-muted/60 hover:bg-muted p-1 px-1.5 rounded border border-border transition-colors group",
        className
      )}
    >
      <span className="font-bold text-primary">{parts.project}</span>
      <span className="text-muted-foreground">-</span>
      <span className="font-semibold text-sky-600 dark:text-sky-400">{parts.lot}</span>
      <span className="text-muted-foreground">-</span>
      <span className="text-purple-600 dark:text-purple-400 font-medium">{parts.category}</span>
      <span className="text-muted-foreground">-</span>
      <span className="text-foreground font-semibold">{parts.type}</span>
      <span className="text-muted-foreground">-</span>
      <span className="text-foreground">{parts.number}</span>
      <span className="text-muted-foreground">-</span>
      <span
        className={cn(
          "font-bold px-1 rounded text-[11px]",
          parts.revision.startsWith('C')
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
        )}
      >
        {parts.revision}
      </span>

      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="ml-1 p-0.5 text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100 transition-opacity"
          title="Copier le code complet"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
        </button>
      )}
    </span>
  );
};
