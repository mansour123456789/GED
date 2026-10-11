import React from 'react';
import { DocState } from '@/types';
import { cn } from '@/utils/cn';
import { FileEdit, Share2, CheckCircle2, Archive } from 'lucide-react';

interface StatusBadgeProps {
  state: DocState | string;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ state, className, showIcon = true }) => {
  const config = (() => {
    switch (state) {
      case 'WIP':
        return {
          label: 'En préparation (WIP)',
          icon: FileEdit,
          bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
        };
      case 'Shared':
        return {
          label: 'En revue (Shared)',
          icon: Share2,
          bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300',
        };
      case 'Published':
        return {
          label: 'Approuvé (Published)',
          icon: CheckCircle2,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300',
        };
      case 'Archived':
        return {
          label: 'Archivé',
          icon: Archive,
          bg: 'bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-900 dark:text-zinc-400',
        };
      default:
        return {
          label: state,
          icon: FileEdit,
          bg: 'bg-muted text-muted-foreground border-border',
        };
    }
  })();

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.bg,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};
