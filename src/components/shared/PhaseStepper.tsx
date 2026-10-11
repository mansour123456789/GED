import React from 'react';
import { cn } from '@/utils/cn';

interface PhaseStepperProps {
  currentPhase: 'Conception' | 'Passation' | 'Exécution' | 'Garantie' | 'Clôture';
  className?: string;
}

export const PhaseStepper: React.FC<PhaseStepperProps> = ({ currentPhase, className }) => {
  const phases = ['Conception', 'Passation', 'Exécution', 'Garantie', 'Clôture'] as const;
  const currentIndex = phases.indexOf(currentPhase);

  return (
    <div className={cn("flex items-center gap-1 sm:gap-2 text-xs", className)}>
      {phases.map((phase, idx) => {
        const isCurrent = idx === currentIndex;
        const isPast = idx < currentIndex;

        return (
          <React.Fragment key={phase}>
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium select-none",
                isCurrent
                  ? "bg-primary text-primary-foreground font-bold shadow-xs scale-102"
                  : isPast
                  ? "bg-muted/70 text-foreground"
                  : "text-muted-foreground/60"
              )}
            >
              <span
                className={cn(
                  "h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                  isCurrent ? "bg-white text-primary" : isPast ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {idx + 1}
              </span>
              <span className="hidden sm:inline">{phase}</span>
            </div>
            {idx < phases.length - 1 && (
              <span className="text-muted-foreground/40 font-bold">›</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
