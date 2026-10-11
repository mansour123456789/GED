import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, MapPin, MessageSquareWarning, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { db } from '@/mock/db';

export const SocialDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const hhCount = db.households.length;
  const grievancesOpen = db.grievances.filter((g) => g.status !== 'Cloturee').length;
  const vbgCount = db.vbgCases.length;

  const needContent: NeedPanelContent = {
    screenId: 'social-hub',
    title: 'Pôle Social & Conformité E&S Bailleurs',
    purpose: 'Ce centre de pilotage regroupe la gestion des indemnisations foncières (PAR), le guichet de réclamation des citoyens (MGP) et la prévention des risques sociétaux.',
    actors: [
      { letter: 'B', actorName: 'Maître d\'ouvrage', action: 'Met en œuvre les indemnisations foncières et instruit les doléances citoyennes.' },
      { letter: 'C', actorName: 'AMO', action: 'Audite la conformité des plans d\'action et évalue les indicateurs sociaux.' },
      { letter: 'E', actorName: 'Entreprise', action: 'Applique le code de conduite chantier et assure les mesures de mitigation.' },
      { letter: 'A', actorName: 'Bailleur', action: 'Supervise le respect des normes ESS5 (réinstallation) et ESS10 (parties prenantes).' },
    ],
    donorRequirement: 'Normes de performance E&S de la Banque Mondiale pour les projets d\'infrastructure de transport à fort impact communautaire.',
    seeAlso: [
      { label: 'Plan d\'Action de Réinstallation (PAR)', href: '#/social/par' },
      { label: 'Mécanisme de gestion des plaintes', href: '#/social/plaintes' },
      { label: 'Module restreint VBG', href: '#/social/vbg' },
    ],
  };

  const sections = [
    {
      title: 'Plan d\'Action de Réinstallation (PAR & Emprises)',
      desc: 'Recensement des ménages PAP, calcul des compensations au coût de remplacement et libération des tronçons.',
      icon: MapPin,
      stat: `${hhCount} ménages PAP enregistrés`,
      route: '/social/par',
      color: 'border-l-emerald-500',
    },
    {
      title: 'Mécanisme de Gestion des Plaintes (MGP)',
      desc: 'Enregistrement des doléances riveraines, engagement sur les délais de traitement SLA et clôture avec satisfaction.',
      icon: MessageSquareWarning,
      stat: `${grievancesOpen} plainte(s) en cours`,
      route: '/social/plaintes',
      color: 'border-l-amber-500',
    },
    {
      title: 'Prévention VBG / EAS / HS (Module Restreint)',
      desc: 'Espace confidentiel de recueil, cartographie des prestataires et accompagnement centré sur la personne.',
      icon: Lock,
      stat: `${vbgCount} cas accompagnés`,
      route: '/social/vbg',
      color: 'border-l-purple-500',
    },
  ];

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Module Social & Environnemental (E&S)"
          subtitle="Gouvernance des impacts communautaires, indemnisations foncières et écoute riveraine."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <Card
                key={sec.title}
                onClick={() => navigate(sec.route)}
                className={`border-l-4 ${sec.color} hover:shadow-md cursor-pointer transition-all hover:border-primary/50`}
              >
                <CardContent className="p-5 flex flex-col justify-between h-full gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-muted text-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-sm text-foreground">{sec.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {sec.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="font-mono font-bold text-xs text-primary">
                      {sec.stat}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
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
