import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ElementType;
  trend?: {
    value: string;
    positive?: boolean;
    neutral?: boolean;
  };
  className?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  color = 'primary',
  onClick,
}) => {
  const colorMap = {
    primary: 'border-l-primary text-primary',
    success: 'border-l-success text-success',
    warning: 'border-l-warning text-warning',
    danger: 'border-l-destructive text-destructive',
    info: 'border-l-info text-info',
  };

  return (
    <Card
      className={cn(
        "border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer",
        colorMap[color],
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {title}
          </span>
          {Icon && (
            <div className="p-2 rounded-lg bg-muted text-foreground">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
            {value}
          </div>

          {trend && (
            <div
              className={cn(
                "inline-flex items-center text-xs font-semibold gap-0.5",
                trend.neutral
                  ? "text-muted-foreground"
                  : trend.positive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {trend.neutral ? (
                <Minus className="h-3 w-3" />
              ) : trend.positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
