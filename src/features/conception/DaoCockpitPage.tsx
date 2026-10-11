import React from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { PageHeader } from '@/components/layout/PageHeader';
import { DocCode } from '@/components/shared/DocCode';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { NoBadge } from '@/components/shared/NoBadge';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Compass, CheckCircle2, Clock, AlertTriangle, FileText, ArrowRight } from 'lucide-react';

export const DaoCockpitPage: React.FC = () => {
  const { currentUser } = useSession();
  const navigate = useNavigate();

  // Matrice des pièces attendues du DAO pour le Lot L03 (Conception)
  const daoItems = [
    { code: 'RN13-L03-PEC-CCTP-0001', type: 'CCTP', title: 'CCTP Terrassements & Chaussées 2x2', category: 'PEC', status: 'Shared', docId: 'doc-001', noReq: 'NO_DEMANDEE' },
    { code: 'RN13-L03-PEC-CCAP-0001', type: 'CCAP', title: 'Cahier des Clauses Administratives', category: 'PEC', status: 'Published', docId: 'doc-002', noReq: 'NO_OBTENUE' },
    { code: 'RN13-L03-PEC-RPAO-0001', type: 'RPAO', title: 'Règlement Particulier Appel d\'Offres', category: 'PEC', status: 'Published', noReq: 'NO_OBTENUE' },
    { code: 'RN13-L03-PEC-BPD-0001', type: 'BPE', title: 'Bordereau des Prix & Devis Estimatif', category: 'PEC', status: 'Shared', noReq: 'NO_DEMANDEE' },
    { code: 'RN13-L03-PLN-TGO-0001', type: 'TGO', title: 'Tracé Géométrique en Plan PK 28 à 42', category: 'PLN', status: 'Shared', docId: 'doc-003', noReq: 'NO_DEMANDEE' },
    { code: 'RN13-L03-PLN-PTL-0001', type: 'PTL', title: 'Profil en Long axe 2x2 voies', category: 'PLN', status: 'Shared', noReq: 'NO_DEMANDEE' },
    { code: 'RN13-L03-PLN-PTT-0001', type: 'PTT', title: 'Profil en Travers Type 2x2 voies', category: 'PLN', status: 'Published', docId: 'doc-004', noReq: 'NO_OBTENUE' },
    { code: 'RN13-L03-PLN-OHA-0001', type: 'OHA', title: 'Plans types des Dalots Cadres Doubles', category: 'PLN', status: 'WIP', noReq: 'NO_REQUISE' },
    { code: 'RN13-L03-ETU-GEO-0001', type: 'GEO', title: 'Étude Géotechnique et Portance', category: 'ETU', status: 'Shared', docId: 'doc-005', noReq: 'NON_REQUISE' },
    { code: 'RN13-L03-ETU-HYD-0001', type: 'HYD', title: 'Étude Hydrologique Bassin Oued Hatab', category: 'ETU', status: 'Published', noReq: 'NON_REQUISE' },
    { code: 'RN13-L03-ESI-PGES-0001', type: 'PGES', title: 'Plan de Gestion Environnementale Cadre', category: 'ESI', status: 'Shared', docId: 'doc-006', noReq: 'NO_DEMANDEE' },
    { code: 'RN13-L03-ESI-PAR-0001', type: 'PAR', title: 'Plan d\'Action de Réinstallation (PAR L03)', category: 'ESI', status: 'Published', noReq: 'NO_OBTENUE' },
  ];

  const approvedCount = daoItems.filter((i) => i.status === 'Published').length;
  const inReviewCount = daoItems.filter((i) => i.status === 'Shared').length;
  const wipCount = daoItems.filter((i) => i.status === 'WIP').length;

  const needContent: NeedPanelContent = {
    screenId: 'dao-cockpit',
    title: 'Cockpit DAO & Matrice de Complétude',
    purpose: 'Ce cockpit permet de suivre en temps réel la complétude des 12 pièces contractuelles constitutives du Dossier d\'Appel d\'Offres (DAO) du Lot L03 avant publication officielle.',
    actors: [
      { letter: 'B', actorName: 'Maître d\'ouvrage', action: 'Coordonne l\'assemblage des pièces et demande l\'avis de Non-Objection du Bailleur.' },
      { letter: 'C', actorName: 'AMO', action: 'Contrôle la cohérence croisée entre pièces écrites (CCTP/CCAP) et plans.' },
      { letter: 'D', actorName: 'MOE', action: 'Donne son avis sur le dimensionnement des chaussées et ouvrages d\'art.' },
      { letter: 'A', actorName: 'Bailleur', action: 'Délivre la Non-Objection sur l\'ensemble du lot DAO.' },
    ],
    donorRequirement: 'La Banque Mondiale interdit le lancement de l\'appel d\'offres tant que 100% des pièces indispensables du DAO ne sont pas validées et sous accord de Non-Objection.',
    seeAlso: [
      { label: 'Demande de Non-Objection', href: '#/revues/non-objection' },
      { label: 'Liste de tous les documents', href: '#/documents' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Cockpit DAO — Lot 03 (PK 28+000 à 42+000)"
          subtitle="Suivi de la complétude du Dossier d'Appel d'Offres avant consultation internationale."
          actions={
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/revues/non-objection')}
              className="font-bold text-xs gap-1.5"
            >
              <span>Voir la demande de Non-Objection</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />

        {/* Compteurs d'avancement DAO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300">
                  Pièces Validées (Published)
                </p>
                <p className="text-2xl font-black text-foreground font-mono mt-1">
                  {approvedCount} / {daoItems.length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600 bg-blue-50/20 dark:bg-blue-950/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-blue-800 dark:text-blue-300">
                  En cours de Revue (Shared)
                </p>
                <p className="text-2xl font-black text-foreground font-mono mt-1">
                  {inReviewCount} pièces
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-600 bg-amber-50/20 dark:bg-amber-950/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-amber-800 dark:text-amber-300">
                  En préparation (WIP)
                </p>
                <p className="text-2xl font-black text-foreground font-mono mt-1">
                  {wipCount} pièce(s)
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </CardContent>
          </Card>
        </div>

        {/* Grille des pièces du DAO */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              Matrice de complétude des pièces constitutives du DAO
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {daoItems.map((item) => (
              <div
                key={item.code}
                onClick={() => {
                  if (item.docId) navigate(`/documents/${item.docId}`);
                }}
                className="p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-xs font-bold text-primary">{item.type}</span>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge state={item.status} />
                      <NoBadge status={item.noReq as any} />
                    </div>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{item.code}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                  <span className="font-semibold">{item.category}</span>
                  <span className="text-primary font-bold hover:underline flex items-center gap-0.5">
                    Consulter la pièce →
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
