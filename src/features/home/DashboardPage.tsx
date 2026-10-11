import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { VisaBadge } from '@/components/shared/VisaBadge';
import { RevisionTag } from '@/components/shared/RevisionTag';
import { ActorChip } from '@/components/shared/ActorChip';
import { DocCode } from '@/components/shared/DocCode';
import { DueChip } from '@/components/shared/DueChip';
import { ProjectPresentationModal } from '@/components/shared/ProjectPresentationModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatAmount } from '@/utils/format';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Coins,
  HardHat,
  MessageSquareWarning,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Map,
  Mail,
  Calculator,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useSession();
  const navigate = useNavigate();
  const { selectedLot } = (useOutletContext() as { selectedLot: string }) || { selectedLot: 'all' };
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Filtrage des données selon le lot sélectionné
  const docs = db.documents.filter((d) => selectedLot === 'all' || d.lotId === selectedLot);
  const ncrList = db.ncr.filter((n) => selectedLot === 'all' || n.lotId === selectedLot);
  const incidentsList = db.incidents.filter((i) => selectedLot === 'all' || i.lotId === selectedLot);
  const ipcList = db.ipc.filter((i) => selectedLot === 'all' || i.lotId === selectedLot);
  const noRequests = db.noRequests.filter((r) => selectedLot === 'all' || r.lotId === selectedLot);
  const comments = db.comments;
  const grievances = db.grievances.filter((g) => selectedLot === 'all' || g.lotId === selectedLot);

  // KPIs transverses
  const openNcrCount = ncrList.filter((n) => n.status !== 'Cloturee').length;
  const criticalNcrCount = ncrList.filter((n) => n.severity === 'Critique' && n.status !== 'Cloturee').length;
  const sharedDocsCount = docs.filter((d) => d.state === 'Shared').length;
  const blockingCommentsCount = comments.filter((c) => c.severity === 'bloquant' && c.status !== 'clos').length;
  const totalPaidTnd = ipcList
    .filter((i) => i.status === 'Paye')
    .reduce((sum, i) => sum + i.amountNetTnd, 0);

  const activeRoadStops = (db.roadStops || []).filter((s) => s.state === 'ArreteBloque');

  // Graphique d'avancement par Lot
  const lotsProgressData = db.lots.map((l) => ({
    name: l.id,
    physique: l.progressPhysicalPct,
    financier: l.progressFinancialPct,
  }));

  // Graphique réparition des états documentaires
  const docStateData = [
    { name: 'En préparation (WIP)', count: docs.filter((d) => d.state === 'WIP').length, color: '#64748b' },
    { name: 'En revue (Shared)', count: docs.filter((d) => d.state === 'Shared').length, color: '#2563eb' },
    { name: 'Approuvé (Published)', count: docs.filter((d) => d.state === 'Published').length, color: '#16a34a' },
  ];

  // Contenu du Panneau Besoin Métier contextuel
  const needContent: NeedPanelContent = {
    screenId: `dashboard-${currentUser.actor}`,
    title: `Tableau de bord ${currentUser.actorLabel}`,
    purpose: `Cet écran présente la synthèse des actions immédiates et des indicateurs clés requis pour le profil ${currentUser.actorLabel} sur le projet routier RN13.`,
    actors: [
      { letter: 'A', actorName: 'Bailleur', action: 'Suit les demandes de non-objection et la conformité globale E&S.' },
      { letter: 'B', actorName: 'Maître d\'ouvrage', action: 'Valide les publications, approuve les paiements et supervise les délais.' },
      { letter: 'C', actorName: 'AMO', action: 'Vérifie la complétude documentaire et instruit les avis techniques.' },
      { letter: 'D', actorName: 'Maîtrise d\'œuvre', action: 'Vise les études de l\'entreprise, certifie les décomptes et gère les NCR.' },
      { letter: 'E', actorName: 'Entreprise', action: 'Suit ses documents soumis, corrige les non-conformités et dépose ses attachements.' },
    ],
    donorRequirement: 'La Banque Mondiale et les co-bailleurs exigent une visibilité continue sur le chemin critique des revues, le respect des délais contractuels et l\'absence de blocage des paiements des entreprises.',
    seeAlso: [
      { label: 'Sous-Projets par Lot & Tâches', href: '#/lots' },
      { label: 'Mes tâches à exécuter', href: '#/taches' },
      { label: 'Matrice d\'avancement du DAO', href: '#/conception/dao' },
      { label: 'Registre des Non-Objections', href: '#/revues/non-objection' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title={
            currentUser.actor === 'bailleur'
              ? 'Accueil Bailleur de Fonds — Ce qui attend votre avis'
              : currentUser.actor === 'mo'
              ? 'Accueil Maître d\'Ouvrage — Ce que vous devez décider'
              : currentUser.actor === 'amo'
              ? 'Accueil AMO — Ce que vous devez vérifier'
              : currentUser.actor === 'moe'
              ? 'Accueil Maîtrise d\'Œuvre — Ce que vous devez viser et contrôler'
              : 'Accueil Entreprise de Travaux — Ce que vous devez faire'
          }
          subtitle={`Connecté en tant que ${currentUser.fullName} (${currentUser.subRoleLabel}) • Périmètre : ${
            selectedLot === 'all' ? 'Tous les lots (PK 0+000 à 42+000)' : selectedLot
          }`}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/carte-chantier')}
                className="gap-1.5 font-bold text-xs border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
              >
                <Map className="h-4 w-4" />
                <span>Carte OSM (7 Couches)</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/securite-routiere')}
                className="gap-1.5 font-bold text-xs border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Sécurité Routière (ASR)</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/correspondance-reunions')}
                className="gap-1.5 font-bold text-xs border-sky-500/40 text-sky-600 hover:bg-sky-500/10"
              >
                <Mail className="h-4 w-4" />
                <span>Réunions & Courriers</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/budget-chiffrage')}
                className="gap-1.5 font-bold text-xs border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
              >
                <Calculator className="h-4 w-4" />
                <span>Budget V1 (92.9k DT)</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/bailleurs-conformite')}
                className="gap-1.5 font-bold text-xs border-blue-500/40 text-blue-500 hover:bg-blue-500/10"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Conformité BM/BEI</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/lots')}
                className="gap-1.5 font-bold text-xs"
              >
                <Layers className="h-4 w-4 text-sky-500" />
                <span>Sous-Projets</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/taches')}
                className="gap-1.5 font-bold text-xs"
              >
                <span>Mes tâches</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          }
        />

        {/* BANNIÈRE DE PRÉSENTATION DU PROJET ROUTIER RN13 & BESOINS MÉTIER */}
        <div className="p-4 sm:p-5 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-sky-500/10 to-indigo-500/10 backdrop-blur-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-md shrink-0 mt-0.5">
              <Sparkles className="h-5 w-5 animate-pulse text-amber-300" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-wider">
                  RN13 • 2x2 Voies
                </Badge>
                <span className="font-extrabold text-sm text-foreground">
                  Projet Routier National Sfax — Sidi Bouzid — Kasserine (181 km • 650 MDT)
                </span>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  5+ Années de Travaux
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                Plateforme numérique unifiée pour la gestion documentaire (ISO 19650), la traçabilité des arrêts de chantier, les 14 000 oliviers du PAR (Norme ESS5) et les visas contradictoires des 5 acteurs (A, B, C, D, E).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsProjectModalOpen(true)}
              className="gap-2 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm h-9 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Présentation du Projet & Besoins</span>
            </Button>
          </div>
        </div>

        {/* BANNIÈRE D'ALERTE DES ARRÊTS DE CHANTIER (OÙ LE CHANTIER EST ARRÊTÉ) */}
        {activeRoadStops.length > 0 && (
          <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/40 text-foreground shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-extrabold text-xs text-rose-900 dark:text-rose-200 uppercase tracking-wide">
                    Alerte Chantier Linéaire : {activeRoadStops.length} section(s) routière(s) actuellement à l'arrêt
                  </h4>
                  <Badge variant="outline" className="bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-300 text-[10px] font-mono">
                    Impact cumulé : {activeRoadStops.reduce((a, b) => a + (b.daysStopped || 0), 0)} jours perdus
                  </Badge>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-300/90 leading-relaxed">
                  Blocages en cours : {activeRoadStops.map((s) => `PK ${s.pkStart}-${s.pkEnd} (${s.stopReason})`).join(' • ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/social/par')}
                className="text-xs h-8 bg-card border-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-semibold"
              >
                Foncier (PAR)
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/execution/blocages')}
                className="text-xs h-8 bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5 shadow-xs"
              >
                <span>Inspecter les Arrêts & Reprise</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* 1. BLOC ACCUEIL SPÉCIFIQUE PAR RÔLE */}

        {/* --- ACTEUR A : BAILLEUR --- */}
        {currentUser.actor === 'bailleur' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Non-Objections à traiter"
                value={noRequests.filter((r) => r.status === 'NO_DEMANDEE').length}
                subtitle="En attente de votre décision"
                icon={ShieldAlert}
                color="warning"
                onClick={() => navigate('/revues/non-objection')}
              />
              <KpiCard
                title="Incidents graves récents"
                value={incidentsList.filter((i) => i.severity === 'Grave').length}
                subtitle="Délai 48h sous surveillance"
                icon={AlertTriangle}
                color="danger"
                onClick={() => navigate('/execution/incidents')}
              />
              <KpiCard
                title="Rapports officiels reçus"
                value={db.reports.filter((r) => r.status === 'Published' || r.status === 'TransmisBailleur').length}
                subtitle="Disponibles pour audit"
                icon={FileText}
                color="primary"
                onClick={() => navigate('/rapports')}
              />
              <KpiCard
                title="Paiements décomptes validés"
                value={formatAmount(totalPaidTnd)}
                subtitle="Montant cumulé décaissé"
                icon={Coins}
                color="success"
                onClick={() => navigate('/execution/decomptes')}
              />
            </div>

            {/* Demandes de NO prioritaires */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Demandes de Non-Objection transmises à la Banque Mondiale</span>
                  <Link to="/revues/non-objection" className="text-xs text-primary font-semibold hover:underline">
                    Voir tout le registre →
                  </Link>
                </CardTitle>
                <CardDescription className="text-xs">
                  Pièces contractuelles soumises pour avis formel de non-objection.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {noRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-lg border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{req.number}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          Lot {req.lotId}
                        </span>
                        <DueChip dueDate={req.deadline} />
                      </div>
                      <h4 className="font-semibold text-xs sm:text-sm text-foreground">{req.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{req.object}</p>
                    </div>

                    <Button
                      variant={req.status === 'NO_DEMANDEE' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => navigate('/revues/non-objection')}
                      className="shrink-0 text-xs h-8"
                    >
                      {req.status === 'NO_DEMANDEE' ? 'Instruire la demande' : 'Consulter l\'avis'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- ACTEUR B : MAÎTRE D'OUVRAGE (MO) --- */}
        {currentUser.actor === 'mo' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Documents à publier (Shared)"
                value={sharedDocsCount}
                subtitle="En attente de votre visa final"
                icon={FileText}
                color="primary"
                onClick={() => navigate('/documents')}
              />
              <KpiCard
                title="Décomptes à approuver & payer"
                value={ipcList.filter((i) => i.status === 'Certifie' || i.status === 'Soumis').length}
                subtitle="Facturations travaux en cours"
                icon={Coins}
                color="success"
                onClick={() => navigate('/execution/decomptes')}
              />
              <KpiCard
                title="Commentaires bloquants CRD"
                value={blockingCommentsCount}
                subtitle="Empêchent la publication du DAO"
                icon={AlertTriangle}
                color="danger"
                onClick={() => navigate('/revues/crd')}
              />
              <KpiCard
                title="Plaintes riverains ouvertes"
                value={grievances.filter((g) => g.status !== 'Cloturee').length}
                subtitle="Mécanisme MGP actif"
                icon={MessageSquareWarning}
                color="warning"
                onClick={() => navigate('/social/plaintes')}
              />
            </div>

            {/* Pipeline de décisions rapides MO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Documents en attente de publication finale</span>
                    <Link to="/documents" className="text-xs text-primary font-semibold hover:underline">
                      Tous les documents →
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {docs
                    .filter((d) => d.state === 'Shared')
                    .slice(0, 4)
                    .map((d) => (
                      <div
                        key={d.id}
                        onClick={() => navigate(`/documents/${d.id}`)}
                        className="p-2.5 rounded-lg border border-border/80 hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <DocCode code={d.code} showCopy={false} />
                            <StatusBadge state={d.state} />
                          </div>
                          <p className="font-semibold text-xs text-foreground truncate">{d.title}</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-7 text-xs shrink-0">
                          Examiner
                        </Button>
                      </div>
                    ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Conditions de démarrage par tronçon (Gates)</span>
                    <Link to="/execution/demarrage" className="text-xs text-primary font-semibold hover:underline">
                      Gérer les Gates →
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {db.gates.map((g) => (
                    <div
                      key={g.id}
                      className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-xs text-foreground">{g.sectionTitle}</span>
                          <span className="text-[11px] font-mono px-1.5 py-0.5 bg-muted rounded">
                            {g.pkRange}
                          </span>
                        </div>
                        {g.blockReason ? (
                          <p className="text-[11px] text-destructive font-medium line-clamp-1">
                            ⚠️ {g.blockReason}
                          </p>
                        ) : (
                          <p className="text-[11px] text-emerald-600 font-medium">
                            ✓ Toutes conditions remplies (Travaux autorisés)
                          </p>
                        )}
                      </div>

                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold shrink-0 ${
                          g.canStart
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {g.canStart ? 'Autorisé' : 'Bloqué'}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* --- ACTEUR C : AMO --- */}
        {currentUser.actor === 'amo' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Avis AMO à formuler"
                value={docs.filter((d) => d.state === 'Shared').length}
                subtitle="Examen de complétude & technique"
                icon={FileText}
                color="primary"
                onClick={() => navigate('/revues')}
              />
              <KpiCard
                title="Commentaires ouverts CRD"
                value={comments.filter((c) => c.status === 'ouvert').length}
                subtitle="Suivi des réponses auteurs"
                icon={MessageSquareWarning}
                color="warning"
                onClick={() => navigate('/revues/crd')}
              />
              <KpiCard
                title="Rapports d'état à consolider"
                value={db.reports.length}
                subtitle="Synthèse mensuelle & E&S"
                icon={Activity}
                color="success"
                onClick={() => navigate('/rapports')}
              />
              <KpiCard
                title="Conformité E&S globale"
                value="94%"
                subtitle="Score de suivi environnemental"
                icon={CheckCircle2}
                color="info"
                onClick={() => navigate('/social')}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Derniers commentaires enregistrés au registre CRD</span>
                  <Link to="/revues/crd" className="text-xs text-primary font-semibold hover:underline">
                    Ouvrir le registre complet →
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {comments.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-1 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">{c.docCode}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            c.severity === 'bloquant'
                              ? 'bg-red-100 text-red-800'
                              : c.severity === 'majeur'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {c.severity}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{c.pageOrArticle}</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{c.commentText}</p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                      <span>Auteur : {c.authorName} ({c.authorLetter})</span>
                      <span className="font-semibold text-primary capitalize">{c.status}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- ACTEUR D : MAÎTRISE D'ŒUVRE CONTRÔLE (MOE) --- */}
        {currentUser.actor === 'moe' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Documents Entreprise à viser"
                value={docs.filter((d) => d.category === 'EXE' && d.state === 'Shared').length}
                subtitle="Notes de calcul, plans, PAQ"
                icon={FileText}
                color="primary"
                onClick={() => navigate('/execution')}
              />
              <KpiCard
                title="Décomptes à certifier"
                value={ipcList.filter((i) => i.status === 'Soumis').length}
                subtitle="Contrôle des attachements"
                icon={Coins}
                color="warning"
                onClick={() => navigate('/execution/decomptes')}
              />
              <KpiCard
                title="Fiches NCR ouvertes"
                value={openNcrCount}
                subtitle={`${criticalNcrCount} critique(s) sous 48h`}
                icon={AlertTriangle}
                color="danger"
                onClick={() => navigate('/execution/qualite')}
              />
              <KpiCard
                title="Essais laboratoire conformes"
                value={`${Math.round((db.labTests.filter((t) => t.isConform).length / db.labTests.length) * 100)}%`}
                subtitle="Surveillance géotechnique"
                icon={CheckCircle2}
                color="success"
                onClick={() => navigate('/execution/qualite')}
              />
            </div>

            {/* Bloc Décomptes & NCR à traiter d'urgence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Décomptes mensuels soumis par l'Entreprise</span>
                    <Link to="/execution/decomptes" className="text-xs text-primary font-semibold hover:underline">
                      Certifier →
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ipcList
                    .filter((i) => i.status === 'Soumis')
                    .map((ipc) => (
                      <div
                        key={ipc.id}
                        className="p-3 rounded-lg border border-border bg-card space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-primary">{ipc.number}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            En attente de certification MOE
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{ipc.contractorName} • {ipc.month}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-extrabold text-foreground">{formatAmount(ipc.amountNetTnd)}</span>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => navigate('/execution/decomptes')}
                            className="h-7 text-xs font-bold"
                          >
                            Examiner & Certifier
                          </Button>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Non-Conformités de chantier en cours</span>
                    <Link to="/execution/qualite" className="text-xs text-primary font-semibold hover:underline">
                      Toutes les NCR →
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {ncrList.slice(0, 3).map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-lg border border-border bg-card space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-foreground">{n.number}</span>
                        <DueChip dueDate={n.deadline} />
                      </div>
                      <h5 className="font-semibold text-xs text-foreground truncate">{n.title}</h5>
                      <p className="text-[11px] text-muted-foreground truncate">PK {n.pk} • {n.severity}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* --- ACTEUR E : ENTREPRISE TRAVAUX --- */}
        {currentUser.actor === 'entreprise' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Études d'exécution à soumettre"
                value={docs.filter((d) => d.category === 'EXE').length}
                subtitle="Plans, notes, PAQ, PGES-E"
                icon={FileText}
                color="primary"
                onClick={() => navigate('/execution')}
              />
              <KpiCard
                title="Documents refusés (Visa C)"
                value={docs.filter((d) => d.visa === 'C' || (d.category === 'EXE' && d.state === 'WIP')).length}
                subtitle="À corriger en révision P02"
                icon={AlertTriangle}
                color="danger"
                onClick={() => navigate('/execution')}
              />
              <KpiCard
                title="Mon décompte en cours"
                value={formatAmount(1245800)}
                subtitle="IPC N°04 (Septembre 2026)"
                icon={Coins}
                color="success"
                onClick={() => navigate('/execution/decomptes')}
              />
              <KpiCard
                title="Non-Conformités à solder"
                value={openNcrCount}
                subtitle="Actions correctives exigées"
                icon={HardHat}
                color="warning"
                onClick={() => navigate('/execution/qualite')}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Conditions de démarrage de mes tronçons (Lots L01)</span>
                  <Link to="/execution/demarrage" className="text-xs text-primary font-semibold hover:underline">
                    Détails des autorisations →
                  </Link>
                </CardTitle>
                <CardDescription className="text-xs">
                  Vérifiez si les emprises sont libérées avant d'engager vos engins et équipes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {db.gates.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 rounded-lg border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground">{g.sectionTitle}</span>
                        <span className="font-mono text-xs px-1.5 py-0.5 bg-muted rounded">PK {g.pkRange}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {g.canStart
                          ? '✅ Travaux autorisés sur ce tronçon.'
                          : `🚫 ${g.blockReason}`}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        g.canStart
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {g.canStart ? 'Chantier Ouvert' : 'Arrêt Travaux'}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 2. GRAPHIQUES GLOBAUX DU CHANTIER ROUTIER RN13 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
          <Card className="lg:col-span-8">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Avancement Physique (%) et Financier (%) par Lot Routier
              </CardTitle>
              <CardDescription className="text-xs">
                Mise à 2x2 voies de la RN13 sur 42 km (Lot L01, L02, L03).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lotsProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="physique" name="Physique (%)" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="financier" name="Financier (%)" fill="#15803D" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Cycle CDE des Documents
              </CardTitle>
              <CardDescription className="text-xs">
                Répartition des états documentaires.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={docStateData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={4}
                    >
                      {docStateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 w-full text-xs pt-2">
                {docStateData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-bold font-mono">{d.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Panneau Besoin Métier contextuel sur la droite */}
      <NeedPanel content={needContent} />

      {/* Modal de Présentation Officielle du Projet & Besoins */}
      <ProjectPresentationModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
};
