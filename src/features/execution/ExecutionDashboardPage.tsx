import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { HardHat, ShieldAlert, Coins, FlaskConical, CheckSquare, ArrowRight, Layers, AlertTriangle, FileText } from 'lucide-react';
import { db } from '@/mock/db';
import { formatAmount } from '@/utils/format';

export const ExecutionDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const openNcr = db.ncr.filter((n) => n.status !== 'Cloturee').length;
  const blockedGates = db.gates.filter((g) => !g.canStart).length;
  const pendingIpc = db.ipc.filter((i) => i.status === 'Soumis' || i.status === 'Certifie').length;
  const graveIncidents = db.incidents.filter((i) => i.severity === 'Grave').length;
  const activeRoadStops = (db.roadStops || []).filter((s) => s.state === 'ArreteBloque').length;
  const totalOs = (db.serviceOrders || []).length;

  const needContent: NeedPanelContent = {
    screenId: 'execution-hub',
    title: 'Pôle Exécution des Travaux (Phase 3)',
    purpose: 'Ce centre de pilotage regroupe la surveillance technique, contractuelle et environnementale des chantiers de mise à 2x2 voies de la RN13.',
    actors: [
      { letter: 'D', actorName: 'MOE', action: 'Contrôle quotidien de conformité, visa des études et attachements.' },
      { letter: 'E', actorName: 'Entreprise', action: 'Réalisation des travaux, autocontrôle et transmission des décomptes.' },
      { letter: 'B', actorName: 'Maître d\'ouvrage', action: 'Règlement des acomptes mensuels et levée des blocages fonciers.' },
      { letter: 'C', actorName: 'AMO', action: 'Supervision globale de la performance et consolidation des rapports.' },
    ],
    donorRequirement: 'Exigence de rapportage mensuel exhaustif des indicateurs physiques, financiers et des incidents de chantier aux bailleurs.',
    seeAlso: [
      { label: 'Postes d\'Arrêt & Blocages Linéaires', href: '#/execution/blocages' },
      { label: 'Ordres de Service (OS) & Avenants', href: '#/execution/os' },
      { label: 'Détail Technique par Corps d\'État', href: '#/execution/details' },
      { label: 'Conditions de démarrage (Gates)', href: '#/execution/demarrage' },
      { label: 'Décomptes mensuels (IPC)', href: '#/execution/decomptes' },
      { label: 'Qualité et fiches NCR', href: '#/execution/qualite' },
    ],
  };

  const sections = [
    {
      title: 'Arrêts & Blocages Chantier (PK)',
      desc: 'Localisation exacte où le chantier est arrêté (foncier, crues d\'oued, concessionnaires SONEDE/STEG) et checklist de reprise.',
      icon: AlertTriangle,
      stat: `${activeRoadStops} tronçon(s) arrêté(s)`,
      route: '/execution/blocages',
      color: 'border-l-rose-600',
    },
    {
      title: 'Ordres de Service (OS) & Avenants',
      desc: 'Registre juridique : OS de démarrage, arrêt partiel/total, reprise et avenants de prolongation de délai (45j).',
      icon: FileText,
      stat: `${totalOs} ordre(s) notifié(s)`,
      route: '/execution/os',
      color: 'border-l-sky-500',
    },
    {
      title: 'Détail par Corps d\'État & Couches',
      desc: 'Décomposition des 5 macro-lots : terrassements, dalots hydrauliques, assainissement, chaussées (GNT/GB/BB) et glissières.',
      icon: Layers,
      stat: '5 corps d\'état tracés',
      route: '/execution/details',
      color: 'border-l-teal-500',
    },
    {
      title: 'Conditions de Démarrage (Gates)',
      desc: 'Contrôle préalable par tronçon : libération d\'emprises, PAQ, PGES-E et PGT.',
      icon: CheckSquare,
      stat: `${blockedGates} tronçon(s) bloqué(s)`,
      route: '/execution/demarrage',
      color: 'border-l-amber-500',
    },
    {
      title: 'Contrôle Qualité & Non-Conformités (NCR)',
      desc: 'Suivi des essais géotechniques (Proctor, CBR, béton) et levée des NCR de chantier.',
      icon: FlaskConical,
      stat: `${openNcr} NCR ouverte(s)`,
      route: '/execution/qualite',
      color: 'border-l-purple-500',
    },
    {
      title: 'Décomptes Mensuels des Travaux (IPC)',
      desc: 'Certification des attachements contradictoires et ordonnancement des règlements.',
      icon: Coins,
      stat: `${pendingIpc} décompte(s) en cours`,
      route: '/execution/decomptes',
      color: 'border-l-emerald-500',
    },
    {
      title: 'Hygiène, Sécurité & Incidents (HSE)',
      desc: 'Déclaration des accidents et procédure impérative de notification sous 48h au Bailleur.',
      icon: ShieldAlert,
      stat: `${graveIncidents} incident(s) grave(s)`,
      route: '/execution/incidents',
      color: 'border-l-blue-500',
    },
  ];

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Module Exécution des Travaux (Phase 3)"
          subtitle="Pilotage intégré du chantier de mise à 2x2 voies : qualité, avancement financier, HSE et conditions de démarrage."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <Card
                key={sec.title}
                onClick={() => navigate(sec.route)}
                className={`border-l-4 ${sec.color} hover:shadow-md cursor-pointer transition-all hover:border-primary/50`}
              >
                <CardContent className="p-5 flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-muted text-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-sm text-foreground truncate">{sec.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {sec.desc}
                    </p>
                    <span className="inline-block mt-2 font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {sec.stat}
                    </span>
                  </div>

                  <Button variant="ghost" size="icon-sm" className="shrink-0 mt-1">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
