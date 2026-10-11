import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import {
  RoadSafetyAudit,
  TrafficDiversion,
  RoadInspection,
  AsrRiskLevel,
  AsrPhase,
} from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  MapPin,
  Calendar,
  User,
  Plus,
  CheckCircle2,
  Download,
  Lightbulb,
  Radio,
  FileText,
  Truck,
  Sun,
  Moon,
  ShieldCheck,
  AlertOctagon,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

export const SecuriteRoutierePage: React.FC = () => {
  const { currentUser } = useSession();
  const [activeTab, setActiveTab] = useState<'audits' | 'deviations' | 'inspections' | 'normes'>('audits');
  const [lotFilter, setLotFilter] = useState<string>('ALL');

  // Données
  const [audits, setAudits] = useState<RoadSafetyAudit[]>(() => db.roadSafetyAudits);
  const [diversions, setDiversions] = useState<TrafficDiversion[]>(() => db.trafficDiversions);
  const [inspections, setInspections] = useState<RoadInspection[]>(() => db.roadInspections);

  // Modals
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [showDevModal, setShowDevModal] = useState<boolean>(false);
  const [showInspModal, setShowInspModal] = useState<boolean>(false);

  // Formulaire Nouvel Audit ASR
  const [newAuditTitle, setNewAuditTitle] = useState('');
  const [newAuditLot, setNewAuditLot] = useState('L01');
  const [newAuditPhase, setNewAuditPhase] = useState<AsrPhase>('Travaux');
  const [newAuditRisk, setNewAuditRisk] = useState<AsrRiskLevel>('Eleve');
  const [newAuditPkStart, setNewAuditPkStart] = useState('0+000');
  const [newAuditPkEnd, setNewAuditPkEnd] = useState('14+000');
  const [newAuditDefect, setNewAuditDefect] = useState('');
  const [newAuditRecom, setNewAuditRecom] = useState('');

  // Formulaire Nouvelle Déviation
  const [newDevTitle, setNewDevTitle] = useState('');
  const [newDevLot, setNewDevLot] = useState('L01');
  const [newDevPkStart, setNewDevPkStart] = useState('12+450');
  const [newDevPkEnd, setNewDevPkEnd] = useState('13+800');
  const [newDevDirection, setNewDevDirection] = useState<'Kasserine -> Sfax' | 'Sfax -> Kasserine' | 'Bidirectionnel Dévié'>('Kasserine -> Sfax');
  const [newDevSpeed, setNewDevSpeed] = useState<50 | 70 | 90>(50);
  const [newDevRetro, setNewDevRetro] = useState<'Classe 2 (RL >= 150)' | 'Classe 1 (RL >= 50)'>('Classe 2 (RL >= 150)');
  const [newDevBalisage, setNewDevBalisage] = useState('Balises K5a + K8 + Séparateurs béton GBA');
  const [newDevDispositif, setNewDevDispositif] = useState<'GS2' | 'GS4' | 'GBA Béton'>('GS4');
  const [newDevPolice, setNewDevPolice] = useState('Autorisation Garde Nationale N° 84/2026');

  // Formulaire Inspection
  const [newInspLot, setNewInspLot] = useState('L01');
  const [newInspPeriod, setNewInspPeriod] = useState<'Visite Diurne (Jour)' | 'Visite Nocturne (Nuit)'>('Visite Diurne (Jour)');
  const [newInspPk, setNewInspPk] = useState('12+800');
  const [newInspCat, setNewInspCat] = useState<any>('Signalisation Dégradée');
  const [newInspUrg, setNewInspUrg] = useState<any>('Immédiate (< 24h)');
  const [newInspDesc, setNewInspDesc] = useState('');
  const [newInspAction, setNewInspAction] = useState('');

  // Filtrage
  const filteredAudits = audits.filter((a) => (lotFilter === 'ALL' ? true : a.lotId === lotFilter));
  const filteredDeviations = diversions.filter((d) => (lotFilter === 'ALL' ? true : d.lotId === lotFilter));
  const filteredInspections = inspections.filter((i) => (lotFilter === 'ALL' ? true : i.lotId === lotFilter));

  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuditTitle) return;
    const item: RoadSafetyAudit = {
      id: `ASR-${Date.now().toString(36)}`,
      code: `ASR-RN13-2026-00${audits.length + 1}`,
      lotId: newAuditLot,
      phase: newAuditPhase,
      title: newAuditTitle,
      auditorName: currentUser.fullName || 'Saiefeddine (Expert Sécurité Routière)',
      dateAudit: new Date().toISOString().slice(0, 10),
      pkStart: newAuditPkStart,
      pkEnd: newAuditPkEnd,
      riskLevel: newAuditRisk,
      findingsCount: 1,
      criticalDefects: newAuditDefect ? [newAuditDefect] : ['Observation de sécurité à traiter'],
      recommendations: newAuditRecom ? [newAuditRecom] : ['Mise en conformité selon CCTP'],
      status: 'Rapport_Emis',
      linkedDocumentCode: `TN-R2X2-${newAuditLot}-HSE-ASR-00${audits.length + 1}`,
      attachmentName: `Rapport_ASR_${newAuditLot}_${Date.now()}.pdf`,
    };
    db.addRoadSafetyAudit(item, currentUser);
    setAudits([item, ...audits]);
    setShowAuditModal(false);
    setNewAuditTitle('');
    setNewAuditDefect('');
    setNewAuditRecom('');
    toast.success(`Audit ${item.code} enregistré avec succès`);
  };

  const handleCreateDeviation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevTitle) return;
    const item: TrafficDiversion = {
      id: `DEV-${Date.now().toString(36)}`,
      code: `DEV-RN13-${newDevLot}-0${diversions.length + 10}`,
      lotId: newDevLot,
      title: newDevTitle,
      pkStart: newDevPkStart,
      pkEnd: newDevPkEnd,
      direction: newDevDirection,
      speedLimitKmh: newDevSpeed,
      startDate: new Date().toISOString().slice(0, 10),
      endDatePlan: '2026-12-31',
      status: 'Soumis_MOE',
      retroreflectivityClass: newDevRetro,
      balisageType: newDevBalisage,
      containmentDevices: newDevDispositif,
      nightLightingConfirmed: true,
      policeAuthorizationRef: newDevPolice,
      planDrawingCode: `DWG-DEV-${newDevLot}-R01`,
      fileName: `Plan_Circulation_${newDevLot}_Signe.pdf`,
    };
    db.addTrafficDiversion(item, currentUser);
    setDiversions([item, ...diversions]);
    setShowDevModal(false);
    setNewDevTitle('');
    toast.success(`Plan de déviation ${item.code} soumis pour validation`);
  };

  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInspDesc) return;
    const item: RoadInspection = {
      id: `INSP-${Date.now().toString(36)}`,
      lotId: newInspLot,
      date: new Date().toISOString().slice(0, 10),
      inspectorName: currentUser.fullName || 'Saiefeddine (Expert Sécurité Routière)',
      period: newInspPeriod,
      pk: newInspPk,
      gpsCoords: '34.7410° N, 10.7580° E',
      weather: 'Clair',
      findingCategory: newInspCat,
      urgency: newInspUrg,
      description: newInspDesc,
      correctiveAction: newInspAction || 'Intervention immédiate par l\'entreprise sous 24h',
      status: 'Signalé',
      photoName: 'constat_terrain_recent.jpg',
    };
    db.addRoadInspection(item, currentUser);
    setInspections([item, ...inspections]);
    setShowInspModal(false);
    setNewInspDesc('');
    setNewInspAction('');
    toast.success(`Constat terrain enregistré au PK ${item.pk}`);
  };

  const handleUpdateAuditStatus = (id: string, newStatus: any) => {
    db.updateRoadSafetyAuditStatus(id, newStatus, currentUser);
    setAudits(audits.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    toast.success('Statut de l\'audit ASR mis à jour');
  };

  const handleUpdateInspectionStatus = (id: string, newStatus: any) => {
    db.updateRoadInspectionStatus(id, newStatus, currentUser);
    setInspections(inspections.map((i) => (i.id === id ? { ...i, status: newStatus } : i)));
    toast.success('Statut du constat d\'inspection mis à jour');
  };

  const handleDownloadReport = (filename: string) => {
    const dummy = `RAPPORT D'AUDIT DE SÉCURITÉ ROUTIÈRE - PROJET RN13 2x2 VOIES\nExpert Rédacteur: Saiefeddine\nDate d'émission: 11 Octobre 2026\nConformité: CCTP DGPC & Norme EN 1317\nFichier: ${filename}\nEmpreinte SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069\n\nStatut: Validé conforme pour diffusion chantier.`;
    const blob = new Blob([dummy], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.info(`Téléchargement de ${filename}`);
  };

  const needContent: NeedPanelContent = {
    screenId: 'securite-routiere',
    title: 'Sécurité Routière, SST & Audits ASR',
    purpose: 'Module officiel préparé pour Saiefeddine (Expert Sécurité Routière). Il pilote les audits ASR, homologue les plans de circulation temporaires, contrôle la rétroréflexion Classe 2 (RL >= 150 mcd/lx/m²) et les dispositifs de retenue GS2/GS4.',
    actors: [
      { letter: 'D', actorName: 'MOE / Expert', action: 'Réalise les visites diurnes et nocturnes, émet les rapports ASR et valide les balisages.' },
      { letter: 'E', actorName: 'Entreprise', action: 'Met en œuvre les déviations, pose les glissières GS2/GS4 et rectifie les anomalies sous 24h.' },
      { letter: 'B', actorName: 'Maître d\'Ouvrage', action: 'Approuve les arrêtés de déviation après concertation avec la Garde Nationale.' },
      { letter: 'A', actorName: 'Bailleurs', action: 'Contrôle le respect de la norme ESS4 (Santé et sécurité des usagers de la route).' },
    ],
    donorRequirement: 'La Banque Mondiale et la BEI exigent un audit de sécurité routière (ASR) indépendant à chaque phase et l\'interdiction de basculement sans signalisation certifiée Classe 2.',
    seeAlso: [
      { label: 'Sous-Projets par Lot', href: '#/lots' },
      { label: 'Matrice Bailleurs BM / BEI', href: '#/bailleurs-conformite' },
      { label: 'Bordereaux de Transmission', href: '#/bordereaux-transmission' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Sécurité Routière & SST de Chantier"
          subtitle="Spécification Saiefeddine — Audits ASR, Déviations & Dispositifs GS2/GS4"
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="text-xs text-muted-foreground font-semibold">Lot :</span>
                <select
                  value={lotFilter}
                  onChange={(e) => setLotFilter(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-bold text-foreground shadow-2xs focus:outline-none"
                >
                  <option value="ALL">Tous les lots (L01, L02, L03)</option>
                  <option value="L01">Lot 1 (Sfax - Menzel Chaker)</option>
                  <option value="L02">Lot 2 (Menzel Chaker - Ouled Haffouz)</option>
                  <option value="L03">Lot 3 (Ouled Haffouz - Kasserine)</option>
                </select>
              </div>

              {activeTab === 'audits' && (
                <Button
                  size="sm"
                  onClick={() => setShowAuditModal(true)}
                  className="gap-1.5 font-bold text-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouvel Audit ASR</span>
                </Button>
              )}
              {activeTab === 'deviations' && (
                <Button
                  size="sm"
                  onClick={() => setShowDevModal(true)}
                  className="gap-1.5 font-bold text-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouveau Plan Déviation</span>
                </Button>
              )}
              {activeTab === 'inspections' && (
                <Button
                  size="sm"
                  onClick={() => setShowInspModal(true)}
                  className="gap-1.5 font-bold text-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Constat Géo-localisé</span>
                </Button>
              )}
            </div>
          }
        />

        {/* 4 Cartes d'indicateurs clés harmonisées avec le thème */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border border-border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">Audits ASR Réalisés</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-primary">{audits.length}</span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 font-bold">
                  100% tracés
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Conception, Travaux & Réception</span>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">Déviations en Service</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-sky-600">
                  {diversions.filter((d) => d.status === 'En_Service').length}
                </span>
                <Badge variant="outline" className="text-[10px] text-sky-600 border-sky-300 font-bold">
                  Homologuées
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Accord Garde Nationale OK</span>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">Conformité Rétro-réflexion</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-600">94.8%</span>
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 font-bold">
                  RL ≥ 150
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Classe 2 vérifiée au réflectomètre</span>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">Visites Saiefeddine</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-foreground">{inspections.length}</span>
                <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-300 font-bold">
                  Diurne & Nuit
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Délai d'action &lt; 24h</span>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <TabsList className="grid grid-cols-4 max-w-2xl mb-4">
            <TabsTrigger value="audits" className="gap-1.5 font-bold text-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>Audits ASR ({audits.length})</span>
            </TabsTrigger>
            <TabsTrigger value="deviations" className="gap-1.5 font-bold text-xs">
              <Truck className="h-4 w-4" />
              <span>Déviations ({diversions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="inspections" className="gap-1.5 font-bold text-xs">
              <MapPin className="h-4 w-4" />
              <span>Inspections ({inspections.length})</span>
            </TabsTrigger>
            <TabsTrigger value="normes" className="gap-1.5 font-bold text-xs">
              <FileText className="h-4 w-4" />
              <span>Normes & CCTP</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet 1 : Audits ASR */}
          <TabsContent value="audits" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAudits.map((item) => (
                <Card key={item.id} className="border hover:border-primary/40 transition-all shadow-2xs flex flex-col justify-between">
                  <CardContent className="p-5 space-y-3.5">
                    <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-primary">{item.code}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {item.lotId} • PK {item.pkStart} à {item.pkEnd}
                          </Badge>
                          <Badge
                            className={`text-[10px] font-extrabold uppercase ${
                              item.phase === 'Travaux'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : item.phase === 'PreMiseEnService'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                            }`}
                          >
                            Phase {item.phase}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-bold text-foreground mt-1.5 leading-snug">
                          {item.title}
                        </h3>
                      </div>

                      <Badge
                        className={`text-[10px] font-bold uppercase shrink-0 ${
                          item.riskLevel === 'Critique'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : item.riskLevel === 'Eleve'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        Risque {item.riskLevel}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      <span>Auditeur : <strong className="text-foreground">{item.auditorName}</strong></span>
                      <span>•</span>
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{item.dateAudit}</span>
                    </p>

                    {/* Constats */}
                    <div className="p-3 bg-muted/40 rounded-xl border border-border/60 space-y-1">
                      <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Écarts critiques constatés ({item.criticalDefects.length})</span>
                      </div>
                      <ul className="space-y-1">
                        {item.criticalDefects.map((def, idx) => (
                          <li key={idx} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                            <span className="text-rose-500 shrink-0 font-bold">•</span>
                            <span>{def}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Prescriptions */}
                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-1">
                      <div className="text-[11px] font-bold text-primary flex items-center gap-1.5 mb-1">
                        <Lightbulb className="h-3.5 w-3.5 shrink-0" />
                        <span>Prescriptions techniques</span>
                      </div>
                      <ul className="space-y-1">
                        {item.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-[11px] text-foreground flex items-start gap-1.5">
                            <span className="text-primary shrink-0 font-bold">✓</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground font-medium">Statut :</span>
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateAuditStatus(item.id, e.target.value)}
                          className="h-7 rounded border border-input bg-background px-2 text-[11px] font-bold text-foreground focus:outline-none"
                        >
                          <option value="Rapport_Emis">Rapport Émis</option>
                          <option value="Plan_Action_Valide">Plan Validé</option>
                          <option value="Mesures_En_Cours">Mesures en Cours</option>
                          <option value="Cloture_Conforme">Clôturé Conforme</option>
                        </select>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(item.attachmentName || 'Rapport_ASR.pdf')}
                        className="text-xs h-7 gap-1.5 font-bold"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Rapport PDF</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Onglet 2 : Déviations & Plans */}
          <TabsContent value="deviations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDeviations.map((dev) => (
                <Card key={dev.id} className="border hover:border-primary/40 transition-all shadow-2xs flex flex-col justify-between">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-border/70 pb-2.5">
                      <span className="font-mono text-xs font-bold text-primary">{dev.code}</span>
                      <Badge
                        className={`text-[10px] font-extrabold uppercase ${
                          dev.status === 'En_Service'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {dev.status === 'En_Service' ? 'En Service' : dev.status}
                      </Badge>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                      {dev.title}
                    </h4>

                    <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Linéaire :</span>
                        <span className="font-bold text-foreground">PK {dev.pkStart} à {dev.pkEnd}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Sens :</span>
                        <span className="font-bold text-primary">{dev.direction}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Vitesse :</span>
                        <Badge variant="outline" className="font-mono text-xs font-bold text-rose-600 border-rose-300">
                          {dev.speedLimitKmh} km/h
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>Signalisation : <strong className="text-foreground">{dev.retroreflectivityClass}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-primary font-bold">✓</span>
                        <span>Dispositif : <strong className="text-foreground">{dev.containmentDevices}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <ShieldCheck className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                        <span className="truncate">{dev.policeAuthorizationRef}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-mono">{dev.planDrawingCode}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(dev.fileName || 'Plan_Deviation.pdf')}
                        className="text-xs h-7 gap-1 font-bold"
                      >
                        <Download className="h-3 w-3" />
                        <span>Plan Signé</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Onglet 3 : Inspections Terrain */}
          <TabsContent value="inspections" className="space-y-4">
            <Card className="border shadow-2xs">
              <CardHeader className="pb-3 border-b border-border/70">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Radio className="h-4 w-4 text-emerald-600 animate-pulse" />
                      <span>Registre des Visites de Contrôle Terrain (Diurnes & Nocturnes)</span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Relevé des anomalies de balisage, glissières et signalisation avec coordonnées GPS et délai d'intervention.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/70">
                {filteredInspections.map((insp) => (
                  <div key={insp.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            insp.period.includes('Nuit')
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {insp.period.includes('Nuit') ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-foreground text-xs sm:text-sm">PK {insp.pk}</span>
                            <span className="text-[11px] font-mono text-muted-foreground">({insp.gpsCoords})</span>
                            <Badge variant="outline" className="text-[10px]">{insp.lotId}</Badge>
                            <Badge
                              className={`text-[10px] font-bold uppercase ${
                                insp.urgency.includes('< 24h')
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {insp.urgency}
                            </Badge>
                          </div>

                          <p className="text-xs text-foreground font-semibold">{insp.description}</p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            <span>Action requise : {insp.correctiveAction}</span>
                          </p>

                          <div className="text-[11px] text-muted-foreground flex items-center gap-3 pt-0.5">
                            <span>Inspecteur : <strong className="text-foreground">{insp.inspectorName}</strong></span>
                            <span>•</span>
                            <span>Date : {insp.date} ({insp.period})</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <select
                          value={insp.status}
                          onChange={(e) => handleUpdateInspectionStatus(insp.id, e.target.value)}
                          className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-bold text-foreground focus:outline-none"
                        >
                          <option value="Signalé">Signalé</option>
                          <option value="Ordre_Donné">Ordre Donné</option>
                          <option value="Rectifié_Terrain">Rectifié Terrain</option>
                          <option value="Vérifié">Vérifié Conforme</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet 4 : Normes & CCTP */}
          <TabsContent value="normes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border shadow-2xs">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-primary" />
                    <span>Prescriptions Contractuelles CCTP & Sécurité</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                    <strong className="text-foreground font-bold block">Rétro-réflexion (RL ≥ 150 mcd/lx/m²)</strong>
                    <p>Toute signalisation temporaire de chantier doit être certifiée en Classe 2 avec microbilles de verre à indice élevé. Contrôle nocturne hebdomadaire au rétro-réflectomètre.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                    <strong className="text-foreground font-bold block">Dispositifs de Retenue EN 1317 (GS2 / GS4 / GBA)</strong>
                    <p>Obligation de glissières métalliques GS4 avec poteaux espacés de 2.00m pour les talus de remblai supérieurs à 3.00m et abords d'ouvrages hydrauliques.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                    <strong className="text-foreground font-bold block">Arrosage et Limitation de Poussière</strong>
                    <p>Minimum 4 passages quotidiens de camions-citernes sur les pistes de déviation et abords d'oliveraies pour garantir une distance de visibilité d'arrêt Dv ≥ 120 m.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-2xs">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-indigo-600" />
                    <span>Cadre Légal & Réglementaire Tunisien</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                    <strong className="text-foreground font-bold block">Loi Organique n° 2004-63</strong>
                    <p>Protection des données personnelles et traçabilité des signalements d'incidents routiers et riverains.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                    <strong className="text-foreground font-bold block">Circulaire Ministérielle DGPC 2018</strong>
                    <p>Guide technique de signalisation temporaire des grands chantiers autoroutiers et voies express 2x2 voies en Tunisie.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                    <strong className="text-foreground font-bold block">Accord Préalable Garde Nationale</strong>
                    <p>Aucun basculement de chaussée ou fermeture de carrefour ne peut être mis en service sans arrêté du Gouverneur et PV contradictoire du District de la Garde Nationale.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal Nouvel Audit ASR */}
        <Dialog open={showAuditModal} onOpenChange={setShowAuditModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <ShieldAlert className="h-5 w-5 text-primary" />
                <span>Enregistrer un Audit ASR (Saiefeddine)</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateAudit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Titre de l'audit *</label>
                <Input
                  required
                  placeholder="ex: Audit de sécurité - Giratoire PK 12+450"
                  value={newAuditTitle}
                  onChange={(e) => setNewAuditTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Lot</label>
                  <select
                    value={newAuditLot}
                    onChange={(e) => setNewAuditLot(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="L01">Lot 1 (Sfax - Menzel Chaker)</option>
                    <option value="L02">Lot 2 (Menzel Chaker - Ouled Haffouz)</option>
                    <option value="L03">Lot 3 (Ouled Haffouz - Kasserine)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Phase</label>
                  <select
                    value={newAuditPhase}
                    onChange={(e) => setNewAuditPhase(e.target.value as AsrPhase)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="Conception">Conception (DAO)</option>
                    <option value="Travaux">Travaux (Chantier)</option>
                    <option value="PreMiseEnService">Pré-mise en service</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">PK Début</label>
                  <Input
                    value={newAuditPkStart}
                    onChange={(e) => setNewAuditPkStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">PK Fin</label>
                  <Input
                    value={newAuditPkEnd}
                    onChange={(e) => setNewAuditPkEnd(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Niveau de risque</label>
                  <select
                    value={newAuditRisk}
                    onChange={(e) => setNewAuditRisk(e.target.value as AsrRiskLevel)}
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Eleve">Élevé</option>
                    <option value="Critique">Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Constat d'écart majeur</label>
                <textarea
                  rows={2}
                  placeholder="Défaut constaté..."
                  value={newAuditDefect}
                  onChange={(e) => setNewAuditDefect(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Prescription technique corrective</label>
                <textarea
                  rows={2}
                  placeholder="Recommandation technique..."
                  value={newAuditRecom}
                  onChange={(e) => setNewAuditRecom(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAuditModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Enregistrer l'Audit
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Nouvelle Déviation */}
        <Dialog open={showDevModal} onOpenChange={setShowDevModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Truck className="h-5 w-5 text-primary" />
                <span>Créer un Plan de Déviation Temporaire</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateDeviation} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Intitulé du plan *</label>
                <Input
                  required
                  placeholder="ex: Basculement de chaussée Oued Amor"
                  value={newDevTitle}
                  onChange={(e) => setNewDevTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Lot</label>
                  <select
                    value={newDevLot}
                    onChange={(e) => setNewDevLot(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="L01">Lot 1</option>
                    <option value="L02">Lot 2</option>
                    <option value="L03">Lot 3</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Sens dévié</label>
                  <select
                    value={newDevDirection}
                    onChange={(e) => setNewDevDirection(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="Kasserine -> Sfax">Kasserine → Sfax</option>
                    <option value="Sfax -> Kasserine">Sfax → Kasserine</option>
                    <option value="Bidirectionnel Dévié">Bidirectionnel Dévié</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">PK Début</label>
                  <Input value={newDevPkStart} onChange={(e) => setNewDevPkStart(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">PK Fin</label>
                  <Input value={newDevPkEnd} onChange={(e) => setNewDevPkEnd(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Vitesse (km/h)</label>
                  <select
                    value={newDevSpeed}
                    onChange={(e) => setNewDevSpeed(Number(e.target.value) as any)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value={50}>50 km/h</option>
                    <option value={70}>70 km/h</option>
                    <option value={90}>90 km/h</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Dispositif retenue</label>
                  <select
                    value={newDevDispositif}
                    onChange={(e) => setNewDevDispositif(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="GS4">Glissière GS4 (Renforcée)</option>
                    <option value="GS2">Glissière GS2 (Standard)</option>
                    <option value="GBA Béton">Séparateur Béton GBA</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Rétro-réflexion</label>
                  <select
                    value={newDevRetro}
                    onChange={(e) => setNewDevRetro(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="Classe 2 (RL >= 150)">Classe 2 (RL ≥ 150)</option>
                    <option value="Classe 1 (RL >= 50)">Classe 1 (RL ≥ 50)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Autorisation Garde Nationale</label>
                <Input value={newDevPolice} onChange={(e) => setNewDevPolice(e.target.value)} />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowDevModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Soumettre pour Approbation
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Constat Terrain */}
        <Dialog open={showInspModal} onOpenChange={setShowInspModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <span>Constat Terrain Géo-localisé</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateInspection} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Lot</label>
                  <select
                    value={newInspLot}
                    onChange={(e) => setNewInspLot(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="L01">Lot 1</option>
                    <option value="L02">Lot 2</option>
                    <option value="L03">Lot 3</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Période</label>
                  <select
                    value={newInspPeriod}
                    onChange={(e) => setNewInspPeriod(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="Visite Diurne (Jour)">Visite Diurne (Jour)</option>
                    <option value="Visite Nocturne (Nuit)">Visite Nocturne (Nuit)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">PK Relevé</label>
                  <Input required value={newInspPk} onChange={(e) => setNewInspPk(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Urgence</label>
                  <select
                    value={newInspUrg}
                    onChange={(e) => setNewInspUrg(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="Immédiate (< 24h)">Immédiate (&lt; 24h)</option>
                    <option value="Urgent (48h)">Urgent (48h)</option>
                    <option value="Normal (7j)">Normal (7j)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Catégorie</label>
                <select
                  value={newInspCat}
                  onChange={(e) => setNewInspCat(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="Signalisation Dégradée">Signalisation Dégradée</option>
                  <option value="Balisage Incomplet">Balisage Incomplet</option>
                  <option value="Glissière Déformée">Glissière Déformée</option>
                  <option value="Poussière Visibilité">Poussière Visibilité Réduite</option>
                  <option value="Conflit Usagers-Engins">Conflit Usagers-Engins</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Description de l'anomalie *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="ex: Panneau de déviation incliné à 45°..."
                  value={newInspDesc}
                  onChange={(e) => setNewInspDesc(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Action corrective immédiate</label>
                <Input
                  placeholder="ex: Remise en place et lestage sous 2h..."
                  value={newInspAction}
                  onChange={(e) => setNewInspAction(e.target.value)}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowInspModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Enregistrer Constat
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
