import React from 'react';
import { getDueStatus, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Clock, AlertTriangle } from 'lucide-react';

interface DueChipProps {
  dueDate?: string;
  className?: string;
}

export const DueChip: React.FC<DueChipProps> = ({ dueDate, className }) => {
  if (!dueDate) return null;
  const status = getDueStatus(dueDate);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors",
        status.colorClass,
        className
      )}
      title={`Échéance : ${formatDate(dueDate)}`}
    >
      {status.isLate ? (
        <AlertTriangle className="h-3 w-3 shrink-0" />
      ) : (
        <Clock className="h-3 w-3 shrink-0" />
      )}
      <span>{status.label}</span>
    </span>
  );
};
