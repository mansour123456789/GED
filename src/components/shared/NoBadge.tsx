import React from 'react';
import { NoStatus } from '@/types';
import { cn } from '@/utils/cn';
import { ShieldAlert, ShieldCheck, Shield, Clock, XCircle } from 'lucide-react';

interface NoBadgeProps {
  status: NoStatus;
  className?: string;
}

export const NoBadge: React.FC<NoBadgeProps> = ({ status, className }) => {
  if (status === 'NON_REQUISE') return null;

  const config = (() => {
    switch (status) {
      case 'NO_REQUISE':
        return {
          label: 'NO requise',
          icon: ShieldAlert,
          bg: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
        };
      case 'NO_DEMANDEE':
        return {
          label: 'NO demandée',
          icon: Clock,
          bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
        };
      case 'NO_OBTENUE':
        return {
          label: 'NO obtenue (Accord)',
          icon: ShieldCheck,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
        };
      case 'NO_OBSERVATIONS':
        return {
          label: 'NO avec observations',
          icon: Shield,
          bg: 'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300',
        };
      case 'NO_REFUSEE':
        return {
          label: 'NO refusée',
          icon: XCircle,
          bg: 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300',
        };
      default:
        return {
          label: status,
          icon: Shield,
          bg: 'bg-muted text-muted-foreground border-border',
        };
    }
  })();

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border shadow-2xs",
        config.bg,
        className
      )}
      title="Avis de Non-Objection du Bailleur de fonds (Banque Mondiale)"
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
