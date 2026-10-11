import React from 'react';
import { db } from '@/mock/db';
import { clock } from '@/mock/clock';
import { useGuide } from '@/store/guideStore';
import { useNotifications } from '@/store/notificationsStore';
import { RotateCcw, Play, Bell, Calendar, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const DemoBanner: React.FC = () => {
  const { startGuide } = useGuide();
  const { triggerAlertNow, secondsUntilNextAlert } = useNotifications();

  const handleReset = () => {
    if (window.confirm('Réinitialiser toutes les données de démonstration à l\'état d\'origine ?')) {
      db.reset();
      toast.success('Données de démonstration réinitialisées avec succès.');
      window.location.reload();
    }
  };

  const minutes = Math.floor(secondsUntilNextAlert / 60);
  const seconds = secondsUntilNextAlert % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <footer className="demo-banner border-t border-border bg-card/95 backdrop-blur-xs py-2 px-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-40 shadow-xs">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px]">
          <Sparkles className="h-3 w-3" />
          MAQUETTE STATIQUE V2
        </span>
        <span className="hidden sm:inline text-muted-foreground/60">•</span>
        <span className="flex items-center gap-1 text-[11px]">
          <Calendar className="h-3 w-3" />
          Date simulée : <strong className="text-foreground">{clock.formatDemoDate()}</strong>
        </span>
        <span className="hidden sm:inline text-muted-foreground/60">•</span>
        <span className="flex items-center gap-1 text-[11px]">
          <Bell className="h-3 w-3 text-amber-500" />
          Prochaine alerte démo dans : <span className="font-mono font-semibold text-foreground">{timeFormatted}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={triggerAlertNow}
          className="text-[11px] font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
          title="Déclencher manuellement l'alerte suivante de la file de 16 alertes"
        >
          <Bell className="h-3 w-3" />
          Simuler alerte
        </button>

        <span className="text-muted-foreground/60">|</span>

        <button
          type="button"
          onClick={handleReset}
          className="text-[11px] font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          title="Remettre la base de données de démo à l'état initial"
        >
          <RotateCcw className="h-3 w-3" />
          Réinitialiser
        </button>

        <span className="text-muted-foreground/60">|</span>

        <button
          type="button"
          onClick={startGuide}
          className="text-[11px] font-bold text-primary hover:text-primary-hover hover:underline flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
          title="Lancer le scénario de démonstration interactif en 12 étapes"
        >
          <Play className="h-3 w-3 fill-current" />
          Guide de démo (12 étapes)
        </button>
      </div>
    </footer>
  );
};
