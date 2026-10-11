import React from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ShieldAlert, HeartHandshake, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const VbgPage: React.FC = () => {
  const { currentUser } = useSession();

  const isRestrictedUser = currentUser.subRole === 'mo_grm' || currentUser.subRole === 'admin';
  const vbgCases = db.vbgCases;

  const needContent: NeedPanelContent = {
    screenId: 'social-vbg',
    title: 'Module Restreint VBG / EAS / HS',
    purpose: 'Ce registre hautement confidentiel gère la prévention des Violences Basées sur le Genre (VBG), de l\'Exploitation et Abus Sexuels (EAS) et du Harcèlement Sexuel (HS) selon l\'approche centrée sur la personne survivante.',
    actors: [
      { letter: 'B', actorName: 'Référente VBG (Leïla Trabelsi)', action: 'Accès exclusif au registre confidentiel, orientation vers la cartographie des prestataires d\'aide.' },
      { letter: 'E', actorName: 'Entreprise', action: 'Met en œuvre les formations obligatoires et fait signer les codes de conduite.' },
      { letter: 'C', actorName: 'AMO', action: 'Audite les statistiques anonymisées et les plans de prévention.' },
      { letter: 'A', actorName: 'Bailleur', action: 'Supervise les indicateurs consolidés sans accès aux identités.' },
    ],
    donorRequirement: 'Politique de Tolérance Zéro de la Banque Mondiale : stricte confidentialité, aucun nom de victime consigné dans les systèmes ouverts, et prise en charge médicale/psychologique garantie sous 72h.',
    seeAlso: [
      { label: 'Rapports E&S trimestriels', href: '#/rapports' },
      { label: 'Mécanisme de gestion des plaintes', href: '#/social/plaintes' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Module VBG / EAS / HS (Accès Restreint & Confidentiel)"
          subtitle="Prévention des Violences Basées sur le Genre et protection des communautés riveraines."
        />

        {/* Bannière de confidentialité stricte */}
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 flex items-center justify-between gap-3 text-xs text-purple-900 dark:text-purple-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-purple-200 dark:bg-purple-900/50 text-purple-800 shrink-0">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold">Espace hautement confidentiel et sécurisé</p>
              <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80">
                Toutes les consultations et opérations sont tracées au journal d'audit conformément à la directive BM.
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-purple-200/60 font-bold shrink-0">
            Tolérance Zéro
          </span>
        </div>

        {/* Indicateurs de Prévention (Visibles par tous) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Salariés formés au code de conduite</p>
              <p className="text-2xl font-black text-foreground font-mono">100%</p>
              <p className="text-[11px] text-emerald-600 font-medium">145 ouvriers et encadrants signataires</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Prestataires d'orientation conventionnés</p>
              <p className="text-2xl font-black text-foreground font-mono">3 centres</p>
              <p className="text-[11px] text-primary font-medium">Santé, soutien psycho et aide juridique</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Cas accompagnés et orientés</p>
              <p className="text-2xl font-black text-foreground font-mono">{vbgCases.length} cas</p>
              <p className="text-[11px] text-muted-foreground">Prise en charge intégrale assurée</p>
            </CardContent>
          </Card>
        </div>

        {/* Registre : Nominatif si mo.grm, Anonymisé pour les autres */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>Registre des signalements et accompagnements</span>
              {!isRestrictedUser && (
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <EyeOff className="h-3.5 w-3.5" />
                  Affichage Anonymisé pour votre profil
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {vbgCases.map((cs) => (
              <div
                key={cs.id}
                className="p-3.5 rounded-lg border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{cs.caseCode}</span>
                    <span className="font-mono text-muted-foreground">Lot {cs.lotId}</span>
                    <span className="px-2 py-0.5 rounded bg-muted font-semibold">{cs.assistanceType}</span>
                  </div>
                  <p className="text-muted-foreground">
                    Structure référente partenaire : <strong className="text-foreground">{cs.referredProvider}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                    {cs.status}
                  </span>
                  {isRestrictedUser && (
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Fiche confidentielle
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
