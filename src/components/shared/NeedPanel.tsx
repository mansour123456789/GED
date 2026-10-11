import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronRight, ChevronLeft, ShieldCheck, ExternalLink, Users, FileText, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { useGuide } from '@/store/guideStore';

export interface NeedPanelActorAction {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  actorName: string;
  action: string;
}

export interface NeedPanelContent {
  screenId?: string;
  title: string;
  purpose: string;
  actors: NeedPanelActorAction[];
  donorRequirement: string;
  seeAlso?: { label: string; href: string }[];
}

export interface NeedPanelProps {
  content?: NeedPanelContent;
  title?: string;
  what?: string;
  why?: string;
  actors?: string | NeedPanelActorAction[];
  paperVsGed?: string;
  donorRequirement?: string;
  defaultOpen?: boolean;
}

const ACTOR_STYLES: Record<string, { bg: string; text: string }> = {
  A: { bg: 'bg-[#FDE9CC]', text: 'text-[#B45309]' },
  B: { bg: 'bg-[#DCE9FA]', text: 'text-[#1D4ED8]' },
  C: { bg: 'bg-[#E1F0E4]', text: 'text-[#15803D]' },
  D: { bg: 'bg-[#EBE1F3]', text: 'text-[#7E22CE]' },
  E: { bg: 'bg-[#D6EEF3]', text: 'text-[#0E7490]' },
};

export const NeedPanel: React.FC<NeedPanelProps> = ({
  content,
  title,
  what,
  why,
  actors,
  paperVsGed,
  donorRequirement,
  defaultOpen,
}) => {
  const config = (window as any).__APP_CONFIG__ || {};
  const isDefaultOpen = defaultOpen !== undefined ? defaultOpen : config.SHOW_NEED_PANEL_DEFAULT !== false;
  const [isOpen, setIsOpen] = useState(isDefaultOpen);
  const { startGuide } = useGuide();

  // Raccourci clavier '?' pour ouvrir/fermer le panneau
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const displayTitle = content?.title || title || 'Besoin Métier & Conformité';
  const displayPurpose = content?.purpose || what || 'Gestion et traçabilité des opérations du projet routier RN13.';
  const displayDonor = content?.donorRequirement || donorRequirement || why || 'Normes environnementales et sociales Bailleurs (Banque Mondiale, BEI) et CDE ISO 19650.';
  const seeAlsoList = content?.seeAlso || [];

  return (
    <>
      {/* Bouton d'ouverture flottant si le panneau est fermé */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-24 z-40 bg-primary text-primary-foreground py-2 px-2.5 rounded-l-lg shadow-lg flex items-center gap-1.5 hover:bg-primary/90 transition-all text-xs font-semibold"
          title="Ouvrir le panneau Besoin Métier (Touche ?)"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Besoin Métier</span>
        </button>
      )}

      {/* Volet latéral Besoin Métier */}
      {isOpen && (
        <aside
          className={cn(
            "w-80 md:w-88 shrink-0 bg-card border-l border-border h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto p-4 flex flex-col gap-4 text-xs shadow-md transition-all duration-300 z-30"
          )}
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-primary/10 text-primary font-bold">
                <HelpCircle className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-bold text-foreground text-sm">Besoin Métier</h3>
                <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{displayTitle}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsOpen(false)}
              title="Fermer le panneau (Touche ?)"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Bloc 1 : À quoi sert cet écran ? */}
          <div className="bg-muted/40 p-3 rounded-lg border border-border/60">
            <h4 className="font-bold text-foreground mb-1 text-xs flex items-center gap-1.5">
              <span>🎯</span> À quoi sert cet écran ?
            </h4>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              {displayPurpose}
            </p>
          </div>

          {/* Bloc 2 : Qui fait quoi ici ? (A, B, C, D, E) */}
          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              Qui fait quoi ici ?
            </h4>
            {content?.actors && content.actors.length > 0 ? (
              <div className="space-y-1.5">
                {content.actors.map((act) => {
                  const style = ACTOR_STYLES[act.letter] || ACTOR_STYLES['B'];
                  return (
                    <div
                      key={act.letter}
                      className="p-2 rounded border border-border/70 bg-card flex items-start gap-2"
                    >
                      <span
                        className={cn(
                          "h-5 w-5 rounded-full font-bold flex items-center justify-center shrink-0 text-[10px] select-none",
                          style.bg,
                          style.text
                        )}
                      >
                        {act.letter}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-[11px] truncate">
                          {act.actorName}
                        </p>
                        <p className="text-muted-foreground text-[10px] leading-snug">
                          {act.action}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : typeof actors === 'string' ? (
              <div className="p-2.5 rounded border border-border/70 bg-card text-[11px] text-muted-foreground leading-relaxed">
                {actors}
              </div>
            ) : (
              <div className="p-2.5 rounded border border-border/70 bg-card text-[11px] text-muted-foreground">
                Intervention concertée des 5 acteurs contractuels (Bailleur A, Maître d'Ouvrage B, AMO C, MOE Contrôle D et Entreprise E).
              </div>
            )}
          </div>

          {/* Bloc 3 : Exigence Bailleur & Normes */}
          <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-3 rounded-lg">
            <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-1 text-xs flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              Exigence du Bailleur / Bonne pratique
            </h4>
            <p className="text-amber-800 dark:text-amber-200/90 text-[11px] leading-relaxed">
              {displayDonor}
            </p>
          </div>

          {/* Bloc 4 : Papier vs GED RN13 */}
          {paperVsGed && (
            <div className="bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 p-3 rounded-lg">
              <h4 className="font-bold text-sky-900 dark:text-sky-300 mb-1 text-xs flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                Papier vs GED RN13
              </h4>
              <p className="text-sky-800 dark:text-sky-200/90 text-[11px] leading-relaxed">
                {paperVsGed}
              </p>
            </div>
          )}

          {/* Voir aussi */}
          {seeAlsoList.length > 0 && (
            <div className="border-t border-border pt-3">
              <h4 className="font-bold text-foreground text-xs mb-2">Voir aussi</h4>
              <ul className="space-y-1 text-[11px]">
                {seeAlsoList.map((item, idx) => (
                  <li key={idx}>
                    <a
                      href={item.href}
                      className="text-primary hover:underline flex items-center gap-1 truncate"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Guide interactif lanceur */}
          <div className="mt-auto pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={startGuide}
              className="w-full text-xs font-semibold gap-1.5"
            >
              <span>🚀</span> Lancer le Guide de démonstration
            </Button>
          </div>
        </aside>
      )}
    </>
  );
};
