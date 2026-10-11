import React from 'react';
import { cn } from '@/utils/cn';

interface RevisionTagProps {
  revision: string;
  className?: string;
}

export const RevisionTag: React.FC<RevisionTagProps> = ({ revision, className }) => {
  const isP = revision.startsWith('P');
  const isC = revision.startsWith('C');
  const isAB = revision.startsWith('AB');

  const colorClass = isP
    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
    : isC
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
    : isAB
    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
    : 'bg-muted text-muted-foreground border-border';

  const titleText = isP
    ? 'Révision préliminaire en préparation / revue'
    : isC
    ? 'Révision contractuelle approuvée (Bon pour exécution)'
    : isAB
    ? 'Révision de récolement / As-Built'
    : 'Révision';

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded font-mono text-xs font-semibold border select-none",
        colorClass,
        className
      )}
      title={titleText}
    >
      {revision}
    </span>
  );
};
