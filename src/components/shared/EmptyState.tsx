import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderOpen } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = FolderOpen,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-card/50",
        className
      )}
    >
      <div className="p-3 rounded-full bg-muted/60 text-muted-foreground mb-3">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="font-bold text-base text-foreground mb-1">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="default" size="sm" onClick={onAction} className="font-semibold text-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
