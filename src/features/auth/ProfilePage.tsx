import React from 'react';
import { useSession } from '@/store/sessionStore';
import { permissions } from '@/mock/permissions';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel } from '@/components/shared/NeedPanel';
import { ActorChip } from '@/components/shared/ActorChip';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  UserCheck,
  ShieldCheck,
  Key,
  FolderTree,
  FileCheck2,
  AlertOctagon,
  HardHat,
  HeartHandshake,
  Lock,
  Check,
  X,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useSession();

  const rights = [
    {
      category: 'Gestion Documentaire & Visas',
      items: [
        { label: 'Déposer des documents en CDE (WIP)', allowed: currentUser.actor === 'entreprise' || currentUser.actor === 'moe' },
        { label: 'Émettre un visa formel (A, B, C, D)', allowed: currentUser.actor === 'moe' },
        { label: 'Publier officiellement un document (Published)', allowed: currentUser.actor === 'mo' },
        { label: 'Formuler des commentaires au registre CRD', allowed: currentUser.actor !== 'entreprise' || true },
        { label: 'Lever des commentaires bloquants', allowed: currentUser.actor === 'moe' || currentUser.actor === 'mo' },
      ],
    },
    {
      category: 'Validation Financière & Décomptes (IPC)',
      items: [
        { label: 'Soumettre un décompte mensuel IPC', allowed: currentUser.actor === 'entreprise' },
        { label: 'Certifier le métré et montants (MOE)', allowed: currentUser.actor === 'moe' },
        { label: 'Approuver et ordonnancer le paiement (MO)', allowed: currentUser.actor === 'mo' },
        { label: 'Consulter les états financiers de prêt (Bailleur)', allowed: currentUser.actor === 'bailleur' || currentUser.actor === 'mo' },
      ],
    },
    {
      category: 'Sauvegarde Sociale, PAR & Confidentialité',
      items: [
        { label: 'Accéder aux dossiers fonciers des ménages PAP', allowed: currentUser.actor === 'mo' || currentUser.actor === 'amo' || currentUser.actor === 'bailleur' },
        { label: 'Instruire les plaintes citoyennes (MGP)', allowed: currentUser.actor === 'mo' || currentUser.actor === 'amo' },
        { label: 'Module restreint VBG (Violences Basées sur le Genre)', allowed: currentUser.subRole === 'mo_grm' },
      ],
    },
    {
      category: 'Bailleurs & Non-Objection',
      items: [
        { label: 'Soumettre une demande de non-objection (ANO)', allowed: currentUser.actor === 'mo' },
        { label: 'Délivrer un avis d’Avis de Non-Objection formel', allowed: currentUser.actor === 'bailleur' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon Profil & Droits d'Accès Sécurisés"
        description="Fiche d'identité contractuelle, habilitations CDE et matrice RACI active pour votre session de travail."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte Identité */}
        <Card className="border-border lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-2">
              <ActorChip actorLetter={currentUser.actorLetter} size="lg" showName={false} />
            </div>
            <CardTitle className="text-base font-bold text-foreground">
              {currentUser.fullName}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {currentUser.email}
            </CardDescription>
            <div className="pt-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                {currentUser.subRoleLabel}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-4 border-t border-border text-xs">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Acteur contractuel :</span>
              <span className="font-bold text-foreground">
                Groupe {currentUser.actorLetter} — {currentUser.actorLabel}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Identifiant session :</span>
              <span className="font-mono text-muted-foreground">{currentUser.id}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Périmètre géographique :</span>
              <span className="font-bold text-foreground">
                {currentUser.lots.includes('*') ? 'Tous les lots (PK 0 à 42)' : `Lots ${currentUser.lots.join(', ')}`}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Niveau d'accréditation :</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Vérifié CDE ISO 19650
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Matrice des droits */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Habilitations RACI actives pour ce rôle
              </CardTitle>
              <CardDescription className="text-xs">
                Droits d'émission, de visa, de consultation et de validation accordés selon le plan de management du projet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rights.map((grp, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
                    {grp.category}
                  </h4>
                  <div className="divide-y divide-border/60 border border-border rounded-md overflow-hidden bg-card">
                    {grp.items.map((it, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 text-xs">
                        <span className={it.allowed ? 'text-foreground font-medium' : 'text-muted-foreground line-through'}>
                          {it.label}
                        </span>
                        {it.allowed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                            <Check className="h-3 w-3" />
                            Autorisé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                            <X className="h-3 w-3" />
                            Refusé
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <NeedPanel
        what="Fiche profil et matrice des habilitations de l'utilisateur connecté."
        why="Garantir l'étanchéité des responsabilités et éviter les conflits d'intérêts sur le chantier (la MOE ne peut pas modifier un document de l'entreprise sans émettre un visa formel, le bailleur ne signe pas les décomptes à la place du Maître d'Ouvrage)."
        actors="Consultable par chacun des 14 comptes utilisateurs pour vérifier ses droits d'action."
        paperVsGed="Sur les anciens projets, n'importe qui envoyait des courriers sans délégation de pouvoir officielle. Dans la GED-RN13, les droits sont vérifiés cryptographiquement sur chaque écran."
      />
    </div>
  );
};
