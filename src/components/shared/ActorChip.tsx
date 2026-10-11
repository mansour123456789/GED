import React from 'react';
import { ActorLetter } from '@/types';
import { cn } from '@/utils/cn';

interface ActorChipProps {
  actorLetter: ActorLetter | string;
  name?: string;
  roleLabel?: string;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ACTOR_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  A: { bg: 'bg-[#FDE9CC]', text: 'text-[#B45309]', border: 'border-[#B45309]/30', label: 'Bailleur (Banque Mondiale / BEI / AFD)' },
  B: { bg: 'bg-[#DCE9FA]', text: 'text-[#1D4ED8]', border: 'border-[#1D4ED8]/30', label: 'Maître d\'ouvrage (MO)' },
  C: { bg: 'bg-[#E1F0E4]', text: 'text-[#15803D]', border: 'border-[#15803D]/30', label: 'AMO (Assistance Maîtrise d\'ouvrage)' },
  D: { bg: 'bg-[#EBE1F3]', text: 'text-[#7E22CE]', border: 'border-[#7E22CE]/30', label: 'Maîtrise d\'œuvre Contrôle (MOE)' },
  E: { bg: 'bg-[#D6EEF3]', text: 'text-[#0E7490]', border: 'border-[#0E7490]/30', label: 'Entreprise Travaux (Bouzid Travaux)' },
};

export const ActorChip: React.FC<ActorChipProps> = ({
  actorLetter,
  name,
  roleLabel,
  showName = true,
  size = 'md',
  className,
}) => {
  const letter = (actorLetter || 'B').toUpperCase();
  const style = ACTOR_STYLES[letter] || ACTOR_STYLES['B'];

  const sizeClasses = {
    sm: 'h-5 w-5 text-[10px]',
    md: 'h-6 w-6 text-xs',
    lg: 'h-8 w-8 text-sm font-bold',
  }[size];

  return (
    <div
      className={cn("inline-flex items-center gap-1.5", className)}
      title={`${style.label}${name ? ` — ${name}` : ''}${roleLabel ? ` (${roleLabel})` : ''}`}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-bold border shadow-2xs shrink-0 select-none",
          style.bg,
          style.text,
          style.border,
          sizeClasses
        )}
      >
        {letter}
      </span>
      {showName && name && (
        <span className="text-xs font-medium text-foreground truncate max-w-[140px] sm:max-w-none">
          {name}
        </span>
      )}
    </div>
  );
};
