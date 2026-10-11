import React from 'react';
import { useGuide } from '@/store/guideStore';
import { ActorChip } from '@/components/shared/ActorChip';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X, Sparkles, Compass } from 'lucide-react';

export const GuideModal: React.FC = () => {
  const { isGuideActive, currentStep, currentStepIndex, stopGuide, nextStep, prevStep } = useGuide();

  if (!isGuideActive) return null;

  const totalSteps = 12;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl bg-card border-2 border-primary/50 shadow-2xl rounded-xl p-4 animate-slide-up backdrop-blur-md">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-primary text-primary-foreground font-bold">
            <Compass className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Scénario Démo Guidé — Étape {currentStep.stepNumber} sur {totalSteps}
              </span>
              <ActorChip actorLetter={currentStep.actorLetter} size="sm" showName={false} />
            </div>
            <h3 className="font-bold text-foreground text-sm sm:text-base">
              {currentStep.title}
            </h3>
          </div>
        </div>

        <Button variant="ghost" size="icon-sm" onClick={stopGuide} title="Quitter le guide">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-muted/50 rounded-lg p-3 my-2 border border-border/60 text-xs text-foreground space-y-1.5">
        <p className="leading-relaxed">
          {currentStep.description}
        </p>
        <div className="flex items-center gap-1.5 pt-1 text-primary font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Action attendue : {currentStep.expectedAction}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-muted-foreground">
          Acteur actif : <strong className="text-foreground">{currentStep.targetUserLabel}</strong>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={isFirst}
            className="text-xs h-8"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Précédent
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={nextStep}
            className="text-xs h-8 font-bold"
          >
            {isLast ? 'Terminer le guide' : 'Étape suivante'}
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
