import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { User, ActorLetter } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel } from '@/components/shared/NeedPanel';
import { ActorChip } from '@/components/shared/ActorChip';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Shield,
  Key,
  CheckCircle,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

export const UsersListPage: React.FC = () => {
  const { currentUser, switchUser } = useSession();
  const [users] = useState<User[]>(() => [...db.users]);
  const [selectedActor, setSelectedActor] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter((u) => {
    if (selectedActor !== 'all' && u.actorLetter !== selectedActor) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.subRoleLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Annuaire des 14 Comptes & Rôles Démo"
        description="Gestion des intervenants du projet RN13, attribution des lots de compétences et matrice des habilitations RACI."
      />

      {/* Cartes résumé */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { letter: 'A', name: 'Bailleur (2)', count: 2, bg: 'bg-[#FDE9CC]', text: 'text-[#B45309]' },
          { letter: 'B', name: 'Maître Ouvrage (4)', count: 4, bg: 'bg-[#DCE9FA]', text: 'text-[#1D4ED8]' },
          { letter: 'C', name: 'AMO Conseil (3)', count: 3, bg: 'bg-[#E1F0E4]', text: 'text-[#15803D]' },
          { letter: 'D', name: 'MOE Contrôle (3)', count: 3, bg: 'bg-[#EBE1F3]', text: 'text-[#7E22CE]' },
          { letter: 'E', name: 'Entreprises (2)', count: 2, bg: 'bg-[#D6EEF3]', text: 'text-[#0E7490]' },
        ].map((item) => (
          <Card
            key={item.letter}
            onClick={() => setSelectedActor(selectedActor === item.letter ? 'all' : item.letter)}
            className={`border cursor-pointer transition-all ${
              selectedActor === item.letter ? 'ring-2 ring-primary shadow-sm' : 'hover:border-primary/50'
            }`}
          >
            <CardContent className="p-3 flex items-center gap-2.5">
              <span className={`h-8 w-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${item.bg} ${item.text}`}>
                {item.letter}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">{item.count} utilisateur(s)</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Barre de recherche */}
      <Card className="border-border">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-72">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher nom, fonction, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            {selectedActor !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedActor('all')}
                className="text-xs h-8 text-primary"
              >
                Réinitialiser filtre
              </Button>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {filteredUsers.length} compte(s) répertorié(s)
          </span>
        </CardContent>
      </Card>

      {/* Liste des utilisateurs en cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => {
          const isMe = u.id === currentUser.id;
          return (
            <Card
              key={u.id}
              className={`border transition-all ${
                isMe ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <ActorChip actorLetter={u.actorLetter} size="md" showName={false} />
                    <div>
                      <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        {u.fullName}
                        {isMe && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 bg-primary/10 text-primary">
                            Vous
                          </Badge>
                        )}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs bg-muted/40 p-2.5 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rôle métier :</span>
                    <span className="font-semibold text-foreground">{u.subRoleLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entité :</span>
                    <span className="text-foreground">{u.actorLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Périmètre :</span>
                    <span className="font-medium text-foreground">
                      {u.lots.includes('*') ? 'Lots 1, 2 et 3 (Tous)' : `Lots ${u.lots.join(', ')}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Key className="h-3 w-3 text-emerald-600" />
                    Mot de passe : Demo#2026
                  </span>

                  {!isMe && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        switchUser(u.id);
                        toast.success(`Vous êtes désormais connecté en tant que ${u.fullName} (${u.actorLetter})`);
                      }}
                      className="text-xs h-7 gap-1 hover:bg-primary hover:text-primary-foreground"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Basculer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <NeedPanel
        what="Annuaire de référence des 14 intervenants clés modélisant l'ensemble des parties prenantes contractuelles de la mise à 2x2 voies de la RN13."
        why="Une gouvernance collaborative exige que chaque acteur n'agisse que dans son strict périmètre contractuel (ex: l'entreprise ne peut pas viser ses propres plans, le bailleur valide uniquement les jalons soumis à non-objection)."
        actors="14 profils prédéfinis : Bailleurs A (Banque Mondiale), Maîtrise d'ouvrage B (DGPET), Assistance C (Bureau d'études AMO), Maîtrise d'œuvre D (Groupement SCET-Tunisie) et Entreprises Travaux E (Lot 1 & 2)."
        paperVsGed="Sur les chantiers traditionnels, les rôles sont flous et les envois se font par emails désordonnés. Dans la GED-RN13, la matrice RACI est appliquée strictement par l'application."
      />
    </div>
  );
};
