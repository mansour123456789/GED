import React from 'react';
import { VisaCode } from '@/types';
import { cn } from '@/utils/cn';
import { Check, AlertCircle, X, Eye } from 'lucide-react';

interface VisaBadgeProps {
  visa?: VisaCode | null;
  className?: string;
  showLabel?: boolean;
}

export const VisaBadge: React.FC<VisaBadgeProps> = ({ visa, className, showLabel = true }) => {
  if (!visa) return null;

  const config = (() => {
    switch (visa) {
      case 'A':
        return {
          letter: 'A',
          label: 'Visa A — Approuvé',
          icon: Check,
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300',
        };
      case 'B':
        return {
          letter: 'B',
          label: 'Visa B — Approuvé avec obs.',
          icon: AlertCircle,
          bg: 'bg-emerald-50 text-emerald-800 border-amber-400 dark:bg-emerald-950/40 dark:text-emerald-200 border-l-4',
        };
      case 'C':
        return {
          letter: 'C',
          label: 'Visa C — Refusé, à reprendre',
          icon: X,
          bg: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300',
        };
      case 'D':
        return {
          letter: 'D',
          label: 'Visa D — Pour information',
          icon: Eye,
          bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
        };
      default:
        return {
          letter: visa,
          label: `Visa ${visa}`,
          icon: Check,
          bg: 'bg-muted text-muted-foreground border-border',
        };
    }
  })();

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border shadow-2xs",
        config.bg,
        className
      )}
      title={config.label}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {showLabel ? config.label : `Visa ${config.letter}`}
    </span>
  );
};
