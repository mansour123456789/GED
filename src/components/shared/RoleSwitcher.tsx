import React from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { User, ActorLetter } from '@/types';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

const ACTOR_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  A: { bg: 'bg-[#FDE9CC]', text: 'text-[#B45309]', label: 'A · Bailleur de fonds' },
  B: { bg: 'bg-[#DCE9FA]', text: 'text-[#1D4ED8]', label: 'B · Maître d\'ouvrage (MO)' },
  C: { bg: 'bg-[#E1F0E4]', text: 'text-[#15803D]', label: 'C · AMO' },
  D: { bg: 'bg-[#EBE1F3]', text: 'text-[#7E22CE]', label: 'D · Maîtrise d\'œuvre (MOE)' },
  E: { bg: 'bg-[#D6EEF3]', text: 'text-[#0E7490]', label: 'E · Entreprise Travaux' },
};

export const RoleSwitcher: React.FC = () => {
  const { currentUser, switchUser } = useSession();

  const usersByActor: Record<ActorLetter, User[]> = {
    A: db.users.filter((u) => u.actorLetter === 'A'),
    B: db.users.filter((u) => u.actorLetter === 'B'),
    C: db.users.filter((u) => u.actorLetter === 'C'),
    D: db.users.filter((u) => u.actorLetter === 'D'),
    E: db.users.filter((u) => u.actorLetter === 'E'),
  };

  const currentActorStyle = ACTOR_STYLES[currentUser.actorLetter] || ACTOR_STYLES['B'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 px-2.5 bg-card/90 border-border hover:bg-muted text-xs font-semibold shadow-2xs"
          title="Changer de rôle de démonstration instantanément"
        >
          <span className="text-muted-foreground hidden lg:inline">Voir en tant que :</span>
          <span
            className={cn(
              "h-5 w-5 rounded-full font-bold flex items-center justify-center text-[10px] select-none",
              currentActorStyle.bg,
              currentActorStyle.text
            )}
          >
            {currentUser.actorLetter}
          </span>
          <span className="font-semibold text-foreground truncate max-w-[120px] sm:max-w-[150px]">
            {currentUser.fullName}
          </span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-[85vh] overflow-y-auto p-1.5 shadow-xl">
        <DropdownMenuLabel className="text-xs font-bold text-foreground flex items-center justify-between pb-1">
          <span>Sélecteur de rôle (14 comptes démo)</span>
          <span className="text-[10px] text-muted-foreground">Mode Démo actif</span>
        </DropdownMenuLabel>
        <p className="text-[11px] text-muted-foreground px-2 pb-2">
          Changez d'acteur en 1 clic pour tester les droits et tableaux de bord.
        </p>

        {(['A', 'B', 'C', 'D', 'E'] as ActorLetter[]).map((letter) => {
          const actorUsers = usersByActor[letter] || [];
          const style = ACTOR_STYLES[letter];

          return (
            <DropdownMenuGroup key={letter}>
              <DropdownMenuSeparator />
              <div className="px-2 py-1 flex items-center gap-1.5 bg-muted/40 rounded-sm mb-1">
                <span
                  className={cn(
                    "h-4 w-4 rounded-full font-bold flex items-center justify-center text-[9px]",
                    style.bg,
                    style.text
                  )}
                >
                  {letter}
                </span>
                <span className="text-[11px] font-bold text-foreground">{style.label}</span>
              </div>

              {actorUsers.map((user) => {
                const isSelected = user.id === currentUser.id;

                return (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => switchUser(user)}
                    className={cn(
                      "flex items-center justify-between py-1.5 px-2 text-xs rounded cursor-pointer",
                      isSelected && "bg-primary/10 text-primary font-semibold"
                    )}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-foreground font-medium text-xs truncate">
                        {user.fullName}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {user.subRoleLabel} {user.lots.includes('*') ? '(Tous lots)' : `(${user.lots.join(', ')})`}
                      </span>
                    </div>

                    {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
