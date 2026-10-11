import React from 'react';
import { CheckCircle2, ChevronRight, FileText, GitCommit, MessageSquare, ShieldCheck, FileCheck, Layers } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TraceStep {
  label: string;
  subText?: string;
  icon: React.ElementType;
  isComplete: boolean;
  isActive?: boolean;
}

interface TraceChainProps {
  currentStage?: 'Exigence' | 'Document' | 'Révision' | 'Revue' | 'Commentaire' | 'Visa' | 'Preuve' | 'Rapport';
  className?: string;
}

export const TraceChain: React.FC<TraceChainProps> = ({ currentStage = 'Revue', className }) => {
  const steps: TraceStep[] = [
    { label: 'Exigence', subText: 'DAO / Cadre E&S', icon: ShieldCheck, isComplete: true },
    { label: 'Document', subText: 'Codifié RN13', icon: FileText, isComplete: true },
    { label: 'Révision', subText: 'P01 → P02', icon: GitCommit, isComplete: true },
    { label: 'Revue', subText: 'Avis AMO & MOE', icon: Layers, isComplete: true, isActive: currentStage === 'Revue' },
    { label: 'Commentaire', subText: 'Registre CRD', icon: MessageSquare, isComplete: ['Commentaire', 'Visa', 'Preuve', 'Rapport'].includes(currentStage), isActive: currentStage === 'Commentaire' },
    { label: 'Visa & NO', subText: 'Visa A/B + Accord', icon: CheckCircle2, isComplete: ['Visa', 'Preuve', 'Rapport'].includes(currentStage), isActive: currentStage === 'Visa' },
    { label: 'Publication', subText: 'Révision C01', icon: FileCheck, isComplete: ['Preuve', 'Rapport'].includes(currentStage), isActive: currentStage === 'Preuve' },
  ];

  return (
    <div className={cn("overflow-x-auto py-2 px-1 bg-card rounded-lg border border-border shadow-2xs", className)}>
      <div className="flex items-center min-w-[650px] justify-between text-xs">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.label}>
              <div className="flex items-center gap-2 group cursor-pointer" title={`${step.label} : ${step.subText}`}>
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center font-bold transition-all shrink-0",
                    step.isActive
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-105"
                      : step.isComplete
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "font-semibold text-xs leading-none",
                      step.isActive ? "text-primary font-bold" : "text-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{step.subText}</span>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
