import React from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, FileCheck, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProcurementPage: React.FC = () => {
  const { currentUser } = useSession();
  const navigate = useNavigate();

  // Étapes de passation pour le Lot L02 (Rohia Centre PK 14+000 à 28+000)
  const steps = [
    { num: 1, title: 'Publication de l\'Avis d\'Appel d\'Offres International (AOI)', date: '15/06/2026', status: 'done', ref: 'AOI-RN13-2026-002', actor: 'B' },
    { num: 2, title: 'Réponses aux clarifications & Addenda N°01 et 02', date: '12/07/2026', status: 'done', ref: 'ADD-L02-001', actor: 'B / C' },
    { num: 3, title: 'Visite des lieux contradictoire et réunion préparatoire', date: '25/07/2026', status: 'done', ref: 'PV-VIS-2026', actor: 'B / C' },
    { num: 4, title: 'Séance publique d\'ouverture des offres & PV de dépouillement', date: '18/08/2026', status: 'done', ref: 'PV-OUV-L02', actor: 'B' },
    { num: 5, title: 'Évaluation technique, financière et déclarations E&S', date: '05/09/2026', status: 'done', ref: 'EVL-TECH-L02', actor: 'C' },
    { num: 6, title: 'Rapport d\'évaluation des offres et proposition d\'attribution', date: '12/09/2026', status: 'done', ref: 'RN13-L02-RAP-EVL-0001', actor: 'B' },
    { num: 7, title: 'Demande et obtention de la Non-Objection de la Banque Mondiale', date: '24/09/2026', status: 'done', ref: 'WB-TUN-RN13-NO-2026-048', actor: 'A' },
    { num: 8, title: 'Notification d\'attribution et période de statu quo (Standstill 10j)', date: '05/10/2026', status: 'done', ref: 'NOTIF-L02-2026', actor: 'B' },
    { num: 9, title: 'Signature formelle du Marché des Travaux', date: 'En cours', status: 'current', ref: 'CTR-MAR-L02', actor: 'B' },
    { num: 10, title: 'Émission de l\'Ordre de Service (OS) de démarrage', date: 'Prévu 25/10', status: 'pending', ref: 'OS-DEM-L02-001', actor: 'B / D' },
  ];

  const needContent: NeedPanelContent = {
    screenId: 'procurement',
    title: 'Passation des Marchés Routiers',
    purpose: 'Ce module retrace chaque jalon de la sélection des entreprises de travaux routiers, de la publication de l\'appel d\'offres international à la notification et signature contractuelle.',
    actors: [
      { letter: 'B', actorName: 'Maître d\'ouvrage', action: 'Gère la commission d\'ouverture, notifie les soumissionnaires et signe le marché.' },
      { letter: 'C', actorName: 'AMO', action: 'Rédige le rapport d\'évaluation des offres et vérifie les critères E&S des candidats.' },
      { letter: 'A', actorName: 'Bailleur', action: 'Délivre l\'avis de Non-Objection obligatoire sur la proposition d\'attribution.' },
      { letter: 'D', actorName: 'MOE', action: 'Prépare l\'Ordre de Service (OS) de démarrage des travaux.' },
    ],
    donorRequirement: 'Respect strict des Directives de Passation de Marchés de la Banque Mondiale, notamment la période de statu quo (standstill) et la publication du tableau récapitulatif des offres.',
    seeAlso: [
      { label: 'Non-Objection attribution', href: '#/revues/non-objection' },
      { label: 'Conditions de démarrage des travaux', href: '#/execution/demarrage' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Suivi de la Passation des Marchés — Lot L02"
          subtitle="Processus de sélection internationale pour la section Rohia Centre (PK 14+000 à 28+000)."
        />

        {/* Fiche récapitulative du marché en cours d'attribution */}
        <Card className="border-l-4 border-l-primary bg-card">
          <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-primary uppercase">Marché en cours de signature</span>
              <h3 className="font-extrabold text-base text-foreground">
                RN13-L02 : Dédoublement de chaussée PK 14+000 au PK 28+000
              </h3>
              <p className="text-xs text-muted-foreground">
                Attributaire provisoire : Groupement International Chaussées & Travaux Publics • Montant : 48 500 000 TND HT
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                Avis NO Favorable (Accord BM)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Chronologie des 10 étapes de passation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" />
              Traçabilité chronologique des étapes de passation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((st) => (
              <div
                key={st.num}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                  st.status === 'done'
                    ? 'border-emerald-200 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : st.status === 'current'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border bg-card opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      st.status === 'done'
                        ? 'bg-emerald-600 text-white'
                        : st.status === 'current'
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {st.status === 'done' ? '✓' : st.num}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-foreground truncate">{st.title}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">Réf : {st.ref} • Acteur : {st.actor}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs">
                  <span className="font-semibold text-muted-foreground">{st.date}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      st.status === 'done'
                        ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'
                        : st.status === 'current'
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground bg-muted'
                    }`}
                  >
                    {st.status === 'done' ? 'Validé' : st.status === 'current' ? 'En cours' : 'À venir'}
                  </span>
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
