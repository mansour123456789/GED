import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DueChip } from './DueChip';
import { ActorChip } from './ActorChip';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface TaskItemProps {
  id: string;
  title: string;
  objectCode: string;
  category: string;
  dueDate: string;
  isUrgent?: boolean;
  actorLetter: 'A' | 'B' | 'C' | 'D' | 'E';
  actorName: string;
  actionLabel: string;
  onAction: () => void;
  className?: string;
}

export const TaskCard: React.FC<TaskItemProps> = ({
  title,
  objectCode,
  category,
  dueDate,
  isUrgent,
  actorLetter,
  actorName,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <Card
      className={cn(
        "border hover:border-primary/40 transition-all duration-200 hover:shadow-xs",
        isUrgent && "border-amber-400 bg-amber-50/20 dark:bg-amber-950/10",
        className
      )}
    >
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
              {category}
            </span>
            <span className="font-mono text-xs font-bold text-foreground">
              {objectCode}
            </span>
            {isUrgent && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                Urgent
              </span>
            )}
            <DueChip dueDate={dueDate} />
          </div>

          <h4 className="font-semibold text-sm text-foreground leading-snug">
            {title}
          </h4>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-xs text-muted-foreground">Assigné par :</span>
            <ActorChip actorLetter={actorLetter} name={actorName} size="sm" />
          </div>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={onAction}
          className="shrink-0 font-semibold text-xs gap-1 h-8 w-full sm:w-auto"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
};
