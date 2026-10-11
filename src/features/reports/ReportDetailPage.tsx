import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { ReportItem, DocumentItem, Lot } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  FileText,
  ArrowLeft,
  Calendar,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Send,
  Eye,
  FileSpreadsheet,
  FileCode,
  Image,
  ShieldCheck,
  Building2,
  Clock,
  Compass,
  Paperclip,
  Check,
  X,
  FileCheck2,
  HardHat,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

interface AttachedFileItem {
  id: string;
  name: string;
  type: 'PDF' | 'EXCEL' | 'AUTOCAD' | 'IMAGE' | 'ZIP';
  sizeMb: number;
  lotId: string;
  sha256: string;
  description: string;
  visaCode?: 'A' | 'B' | 'C' | 'D';
  uploadDate: string;
}

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useSession();

  // Trouver le rapport sélectionné ou premier par défaut
  const report: ReportItem =
    db.reports.find((r) => r.id === id) || db.reports[0] || {
      id: 'rpt-001',
      code: 'RN13-L01-RAP-ETA-2026-M09',
      type: 'RPT-ETA',
      lotId: 'L01',
      period: 'Septembre 2026',
      title: "Rapport Mensuel d'État et d'Avancement des Travaux N°09 — Lot L01",
      progressPhysicalPct: 68,
      progressFinancialPct: 62,
      openNcrCount: 3,
      incidentCount: 1,
      empriseLiberationPct: 85,
      generatedBy: 'Rim Cherif (AMO)',
      generatedAt: '2026-10-05T17:00:00',
      status: 'Published',
      executiveSummary:
        "L'avancement physique cumulé atteint 68% contre une prévision contractuelle de 65%. La cadence des terrassements et de pose des dalots cadres est satisfaisante. Le point d'attention prioritaire concerne la libération des deux dernières parcelles au PK 12+450 (école de Douar El Khir) et la maîtrise des poussières.",
    };

  const [activeTab, setActiveTab] = useState<'avancementLots' | 'fichiers' | 'validationDocs'>('avancementLots');
  const [selectedLotFilter, setSelectedLotFilter] = useState<'ALL' | 'L01' | 'L02' | 'L03'>('ALL');
  const [previewFile, setPreviewFile] = useState<AttachedFileItem | null>(null);

  const canPublish = currentUser.actor === 'mo' || currentUser.subRole === 'mo_directeur';
  const canTransmitDonor = currentUser.actor === 'mo';

  // Fichiers et annexes exhaustives du rapport
  const attachedFiles: AttachedFileItem[] = [
    {
      id: 'F01',
      name: 'Rapport_Officiel_Avancement_M09_Signe.pdf',
      type: 'PDF',
      sizeMb: 12.4,
      lotId: 'L01',
      sha256: '9f8a32b1c4e7d80123456789abcdef0123456789abcdef0123456789abcdef01',
      description: 'Document officiel consolidé avec visas de la Mission de Contrôle SCET et DGPC.',
      visaCode: 'A',
      uploadDate: '2026-10-05',
    },
    {
      id: 'F02',
      name: 'Attachements_Metres_Decompte_IPC_04.xlsx',
      type: 'EXCEL',
      sizeMb: 4.8,
      lotId: 'L01',
      sha256: '8b21c4e7d80123456789abcdef0123456789abcdef0123456789abcdef01234a',
      description: 'Feuille de calcul métrés contradictoires terrassement, GNT et béton dalots.',
      visaCode: 'A',
      uploadDate: '2026-10-04',
    },
    {
      id: 'F03',
      name: 'Plans_Profil_En_Long_Tracé_PK0_PK14_R03.dwg',
      type: 'AUTOCAD',
      sizeMb: 26.5,
      lotId: 'L01',
      sha256: '7c32d4e7d80123456789abcdef0123456789abcdef0123456789abcdef01234b',
      description: 'Plan d\'exécution révisé avec prise en compte du calage hydraulique dalot OH 12.',
      visaCode: 'B',
      uploadDate: '2026-10-02',
    },
    {
      id: 'F04',
      name: 'PV_Essais_Laboratoire_Compacite_Proctor_CETEC.pdf',
      type: 'PDF',
      sizeMb: 3.6,
      lotId: 'L01',
      sha256: '6d43e4e7d80123456789abcdef0123456789abcdef0123456789abcdef01234c',
      description: '184 essais de compactage Proctor in-situ réalisés par le laboratoire CETEC agréé.',
      visaCode: 'A',
      uploadDate: '2026-10-03',
    },
    {
      id: 'F05',
      name: 'Rapport_Audit_Securite_ASR_Travaux_Saiefeddine.pdf',
      type: 'PDF',
      sizeMb: 5.2,
      lotId: 'L01',
      sha256: '5e54f4e7d80123456789abcdef0123456789abcdef0123456789abcdef01234d',
      description: 'Rapport d\'inspection nocturne de signalisation temporaire et biseaux de déviation K8.',
      visaCode: 'B',
      uploadDate: '2026-10-04',
    },
    {
      id: 'F06',
      name: 'Reportage_Photographique_Geolocalise_PK0_PK42.zip',
      type: 'ZIP',
      sizeMb: 42.0,
      lotId: 'GLOBAL',
      sha256: '4f65a4e7d80123456789abcdef0123456789abcdef0123456789abcdef01234e',
      description: '342 clichés haute résolution avec coordonnées GPS EXIF et repères kilométriques.',
      visaCode: 'A',
      uploadDate: '2026-10-05',
    },
    {
      id: 'F07',
      name: 'Registre_Plaintes_MGP_et_PAR_Sept2026.xlsx',
      type: 'EXCEL',
      sizeMb: 2.1,
      lotId: 'GLOBAL',
      sha256: '3a76b4e7d80123456789abcdef0123456789abcdef0123456789abcdef01234f',
      description: 'Suivi des 48 ménages indemnisés et traitement des 5 requêtes riverains sous SLA 15 jours.',
      visaCode: 'A',
      uploadDate: '2026-10-01',
    },
  ];

  // Données d'avancement physique détaillées pour chaque lot (Lot 1, Lot 2, Lot 3)
  const lotsProgressStats = [
    {
      lotId: 'L01',
      name: 'Lot 01 — PK 0+000 à 14+000 (Section Sbeïtla Ouest / Sfax)',
      governorate: 'Sfax / Kasserine',
      contractor: 'Soroubat & Bouzid Travaux',
      supervisor: 'Groupement SCET-Tunisie',
      phase: 'Exécution Travaux',
      progressPhysicalPct: 68,
      progressPlannedPct: 65,
      progressFinancialPct: 62,
      empriseLiberationPct: 85,
      budgetTnd: 182500000,
      corpsEtat: [
        { name: 'Terrassements (Déblais/Remblais)', quantitePrevue: '250 000 m³', quantiteExecutee: '210 000 m³', quantiteAcceptee: '205 000 m³', pct: 84, status: 'Conforme' },
        { name: 'Couche de Fondation & Base (GNT 0/31.5)', quantitePrevue: '120 000 m³', quantiteExecutee: '75 000 m³', quantiteAcceptee: '74 000 m³', pct: 62, status: 'Conforme' },
        { name: 'Revêtement Enrobé Bitumineux (BBSG 0/14)', quantitePrevue: '42 000 t', quantiteExecutee: '18 000 t', quantiteAcceptee: '17 500 t', pct: 42, status: 'En Cours' },
        { name: 'Dalots Hydrauliques & Ouvrages d\'Art', quantitePrevue: '14 dalots', quantiteExecutee: '11 dalots', quantiteAcceptee: '11 dalots', pct: 78, status: 'Conforme' },
        { name: 'Assainissement, Fossés & Caniveaux', quantitePrevue: '28 000 ml', quantiteExecutee: '16 500 ml', quantiteAcceptee: '16 000 ml', pct: 58, status: 'Conforme' },
        { name: 'Signalisation Temporaire & Déviations (ASR)', quantitePrevue: '14 déviations', quantiteExecutee: '14 posées', quantiteAcceptee: '12 validées', pct: 86, status: 'Réserves K8' },
      ],
      comment: 'Avance de +3% sur le planning contractuel. Blocage ponctuel au PK 12+450 (Parcelle Mansour en cours de conciliation au Trésor).',
    },
    {
      lotId: 'L02',
      name: 'Lot 02 — PK 14+000 à 28+000 (Section Rohia Centre / Menzel Chaker)',
      governorate: 'Sidi Bouzid',
      contractor: 'ETEP BTP / Commission Passation',
      supervisor: 'Groupement SCET-Tunisie',
      phase: 'Passation & Démarrage',
      progressPhysicalPct: 12,
      progressPlannedPct: 15,
      progressFinancialPct: 10,
      empriseLiberationPct: 62,
      budgetTnd: 195000000,
      corpsEtat: [
        { name: 'Débroussaillage & Dégagement d\'Emprise', quantitePrevue: '14.0 km', quantiteExecutee: '8.5 km', quantiteAcceptee: '8.0 km', pct: 60, status: 'Conforme' },
        { name: 'Décapage de Terre Végétale', quantitePrevue: '80 000 m³', quantiteExecutee: '15 000 m³', quantiteAcceptee: '14 000 m³', pct: 18, status: 'En Cours' },
        { name: 'Ouvrage Majeur sur Oued Fekka (Pont 3 Travées)', quantitePrevue: '1 Pont', quantiteExecutee: '0.1 (Pieux)', quantiteAcceptee: '0.1', pct: 10, status: 'Études BAT' },
        { name: 'Libération Foncière PAR (Oliveraies)', quantitePrevue: '42 ménages', quantiteExecutee: '26 indemnisés', quantiteAcceptee: '26', pct: 62, status: 'En Cours' },
      ],
      comment: 'Démarrage des pieux forés du pont sur Oued Fekka. Instruction des dossiers d\'indemnisation accélérée avec le gouvernorat.',
    },
    {
      lotId: 'L03',
      name: 'Lot 03 — PK 28+000 à 42+000 (Section Sidi Bouzid Est)',
      governorate: 'Sidi Bouzid',
      contractor: 'Attribution en cours (AO International BIRD/BEI)',
      supervisor: 'SCET-Tunisie / AMO Direction',
      phase: 'Conception & Préparation DAO',
      progressPhysicalPct: 41,
      progressPlannedPct: 40,
      progressFinancialPct: 0,
      empriseLiberationPct: 100,
      budgetTnd: 188000000,
      corpsEtat: [
        { name: 'Finalisation des Pièces Écrites DAO (CCTP/CCAP)', quantitePrevue: '100 %', quantiteExecutee: '100 %', quantiteAcceptee: '100 %', pct: 100, status: 'Validé' },
        { name: 'Plans d\'Exécution APS & APD Géotechnique', quantitePrevue: '100 %', quantiteExecutee: '92 %', quantiteAcceptee: '90 %', pct: 90, status: 'Visé B' },
        { name: 'Demande de Non-Objection Bailleurs (BIRD/BEI)', quantitePrevue: '1 Avis', quantiteExecutee: '1 Soumis', quantiteAcceptee: 'En attente', pct: 50, status: 'En Revue' },
        { name: 'Bornage Définitif de l\'Emprise RN13', quantitePrevue: '14.0 km', quantiteExecutee: '14.0 km', quantiteAcceptee: '14.0 km', pct: 100, status: 'Libéré' },
      ],
      comment: 'Emprise publique libérée à 100%. Dossier de passation transmis à la Banque Mondiale le 06/10/2026 pour avis de non-objection final.',
    },
  ];

  // Documents de référence et statut de validation
  const documentsValidationList: DocumentItem[] = db.documents.slice(0, 8);

  const needContent: NeedPanelContent = {
    title: 'Consultation Intégrale du Rapport d\'État & Avancement (RN13)',
    purpose:
      "Page exhaustive regroupant le rapport d'avancement consolidé, tous les fichiers techniques rattachés avec empreintes SHA-256 certifiées, l'état précis de validation des documents (visas A/B/C/D de la Mission de Contrôle, approbation DGPC, avis Bailleurs) et l'avancement physique comparatif pour chaque lot.",
    actors: [
      { letter: 'B', actorName: 'Maître d\'Ouvrage (DGPC)', action: 'Examen de l\'avancement multi-lots, signature officielle et ordonnancement des décomptes' },
      { letter: 'D', actorName: 'Mission de Contrôle (SCET)', action: 'Validation contradictoire des métrés et vérification de conformité des essais CETEC' },
      { letter: 'E', actorName: 'Entreprise (Soroubat/ETEP)', action: 'Justification des écarts de cadence et transmission des attachements métrés' },
      { letter: 'A', actorName: 'Bailleurs (Banque Mondiale & BEI)', action: 'Réception du rapport officiel d\'étape, revue de non-objection et audits probants' },
    ],
    donorRequirement:
      'Exigence Banque Mondiale NES 1 & BEI Norme 1 : Visibilité continue sur l\'avancement physique et financier certifié de chaque lot, avec conservation immuable de toutes les pièces probantes.',
    seeAlso: [
      { label: 'Tous les Rapports', href: '/rapports' },
      { label: 'Sous-Projets par Lot', href: '/lots' },
      { label: 'Bordereaux de Transmission', href: '/bordereaux-transmission' },
    ],
  };

  const getVisaBadge = (visa?: 'A' | 'B' | 'C' | 'D') => {
    switch (visa) {
      case 'A':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">Visa A (Bon pour exécution)</Badge>;
      case 'B':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-bold text-[10px]">Visa B (Avec observations)</Badge>;
      case 'C':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-[10px]">Visa C (À reprendre)</Badge>;
      case 'D':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-300 font-bold text-[10px]">Visa D (Rejeté)</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] text-muted-foreground">En examen</Badge>;
    }
  };

  const getFileIcon = (type: AttachedFileItem['type']) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-rose-600" />;
      case 'EXCEL':
        return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
      case 'AUTOCAD':
        return <FileCode className="h-5 w-5 text-sky-600" />;
      case 'IMAGE':
        return <Image className="h-5 w-5 text-purple-600" />;
      case 'ZIP':
        return <Paperclip className="h-5 w-5 text-amber-600" />;
    }
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        {/* En-tête avec bouton retour */}
        <div className="flex items-center gap-2 mb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/rapports')}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour aux rapports d'état
          </Button>
          <span className="text-muted-foreground text-xs">•</span>
          <span className="font-mono text-xs font-bold text-primary">{report.code}</span>
        </div>

        <PageHeader
          title={report.title}
          subtitle={`Période : ${report.period} • Lot : ${report.lotId} • Émetteur : ${report.generatedBy} • Statut officiel : ${report.status}`}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success(`Dossier complet ${report.code} (rapport + 7 fichiers) exporté en archive ZIP.`);
                }}
                className="text-xs gap-1.5 border-border"
              >
                <Download className="h-3.5 w-3.5 text-primary" />
                <span>Télécharger Archive (.ZIP)</span>
              </Button>

              {canPublish && report.status === 'Brouillon' && (
                <Button
                  size="sm"
                  onClick={() => {
                    db.validateReport(report.id, currentUser);
                    toast.success('Rapport validé et signé avec sceau électronique DGPC.');
                  }}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Valider & Signer (DGPC)</span>
                </Button>
              )}

              {canTransmitDonor && report.status === 'Published' && (
                <Button
                  size="sm"
                  onClick={() => {
                    db.transmitDonorReport(report.id, currentUser);
                    toast.success('Rapport transmis officiellement aux Bailleurs (Banque Mondiale & BEI).');
                  }}
                  className="text-xs bg-primary text-primary-foreground gap-1.5 shadow-sm"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Transmettre aux Bailleurs</span>
                </Button>
              )}
            </div>
          }
        />

        {/* 4 Cartes Métriques Clés Consolidées */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-border bg-card shadow-xs">
            <CardContent className="p-4 space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Avancement Physique Cumulé
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-foreground">{report.progressPhysicalPct}%</span>
                <span className="text-xs font-semibold text-emerald-600">+3% / Prévu</span>
              </div>
              <Progress value={report.progressPhysicalPct} className="h-2 bg-muted" />
            </CardContent>
          </Card>

          <Card className="border border-border bg-card shadow-xs">
            <CardContent className="p-4 space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Consommation Financière (IPC)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-primary">{report.progressFinancialPct}%</span>
                <span className="text-xs font-semibold text-muted-foreground">38.4 MDT certifiés</span>
              </div>
              <Progress value={report.progressFinancialPct} className="h-2 bg-muted" />
            </CardContent>
          </Card>

          <Card className="border border-border bg-card shadow-xs">
            <CardContent className="p-4 space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Libération Emprises (PAR)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-600">{report.empriseLiberationPct}%</span>
                <span className="text-xs font-semibold text-muted-foreground">13 850 oliviers</span>
              </div>
              <Progress value={report.empriseLiberationPct} className="h-2 bg-muted" />
            </CardContent>
          </Card>

          <Card className="border border-border bg-card shadow-xs">
            <CardContent className="p-4 space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Contrôle Qualité & HSE
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-foreground">
                  {report.openNcrCount} <span className="text-xs font-normal text-muted-foreground">NCR</span>
                </span>
                <span className="text-xs font-semibold text-amber-600">{report.incidentCount} incident(s)</span>
              </div>
              <div className="text-[10px] text-muted-foreground flex justify-between pt-0.5">
                <span>184 essais conformes</span>
                <span className="font-bold text-emerald-600">98.4% conformité</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Synthèse Exécutive du Rapport */}
        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold">Synthèse Exécutive & Constats de la Période</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>Date de coupure : 30/09/2026</span>
              <span>•</span>
              <span className="font-bold text-foreground">Sceau SHA256: 9f8a32b1...</span>
            </div>
          </CardHeader>
          <CardContent className="p-4 text-xs space-y-2">
            <p className="text-foreground leading-relaxed text-xs">
              {report.executiveSummary}
            </p>
            <div className="p-2.5 rounded bg-muted/40 border border-border/80 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                Rédigé par <strong className="text-foreground">{report.generatedBy}</strong> • Contrôle contradictoire SCET-Tunisie & Soroubat
              </span>
              <Badge variant="outline" className="font-mono text-[10px] bg-background">
                Conforme Directives DGPC & Bailleurs 2026
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Navigation par Onglets : (1) Avancement Physique par Lot, (2) Tous les Fichiers, (3) État de Validation des Documents */}
        <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
          <TabsList className="grid grid-cols-3 w-full bg-muted/50 p-1 rounded-lg border border-border">
            <TabsTrigger value="avancementLots" className="text-xs font-semibold gap-1.5">
              <HardHat className="h-3.5 w-3.5 text-amber-500" />
              Avancement Physique par Lot (L01, L02, L03)
            </TabsTrigger>
            <TabsTrigger value="fichiers" className="text-xs font-semibold gap-1.5">
              <Paperclip className="h-3.5 w-3.5 text-blue-500" />
              Tous les Fichiers & Pièces Jointes ({attachedFiles.length})
            </TabsTrigger>
            <TabsTrigger value="validationDocs" className="text-xs font-semibold gap-1.5">
              <FileCheck2 className="h-3.5 w-3.5 text-emerald-500" />
              État de Validation des Documents & Visas
            </TabsTrigger>
          </TabsList>

          {/* ======================= ONGLET 1 : AVANCEMENT PHYSIQUE POUR CHAQUE LOT ======================= */}
          <TabsContent value="avancementLots" className="space-y-4 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                Décomposition analytique des cadences physiques et quantités acceptées par corps d'état
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">Afficher :</span>
                <select
                  value={selectedLotFilter}
                  onChange={(e) => setSelectedLotFilter(e.target.value as any)}
                  className="border border-border rounded-md px-2 py-1 text-xs bg-background text-foreground"
                >
                  <option value="ALL">Tous les Lots (42 km)</option>
                  <option value="L01">Lot 1 (PK 0 à 14)</option>
                  <option value="L02">Lot 2 (PK 14 à 28)</option>
                  <option value="L03">Lot 3 (PK 28 à 42)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {lotsProgressStats
                .filter((l) => selectedLotFilter === 'ALL' || l.lotId === selectedLotFilter)
                .map((lotStat) => (
                  <Card key={lotStat.lotId} className="border border-border shadow-xs bg-card">
                    <CardHeader className="p-4 pb-2 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="font-mono font-bold text-[10px] bg-primary text-primary-foreground">
                            {lotStat.lotId}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {lotStat.phase}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-semibold">
                            Gouvernorat : {lotStat.governorate}
                          </span>
                        </div>
                        <CardTitle className="text-sm font-bold text-foreground">
                          {lotStat.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Titulaire : <span className="font-semibold text-foreground">{lotStat.contractor}</span> • Mission de Contrôle : <span className="font-semibold text-foreground">{lotStat.supervisor}</span>
                        </CardDescription>
                      </div>

                      {/* Métriques globales du lot */}
                      <div className="text-right space-y-1">
                        <div className="flex items-baseline gap-2 justify-end">
                          <span className="text-xs text-muted-foreground">Physique :</span>
                          <span className="text-xl font-black text-foreground">
                            {lotStat.progressPhysicalPct}%
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            (Prévu: {lotStat.progressPlannedPct}%)
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span>Financier : <strong>{lotStat.progressFinancialPct}%</strong></span>
                          <span>•</span>
                          <span>PAR Foncier : <strong>{lotStat.empriseLiberationPct}%</strong></span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 space-y-4 text-xs">
                      {/* Tableau par Corps d'État */}
                      <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                            <tr>
                              <th className="py-2 px-3">Corps d'État / Activité</th>
                              <th className="py-2 px-3 text-right">Quantité Prévue</th>
                              <th className="py-2 px-3 text-right">Quantité Exécutée</th>
                              <th className="py-2 px-3 text-right">Accepté Contrôle SCET</th>
                              <th className="py-2 px-3 text-center w-36">Avancement (%)</th>
                              <th className="py-2 px-3 text-center">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {lotStat.corpsEtat.map((ce, idx) => (
                              <tr key={idx} className="hover:bg-muted/20 transition-colors">
                                <td className="py-2.5 px-3 font-medium text-foreground">
                                  {ce.name}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                                  {ce.quantitePrevue}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-blue-600 font-bold">
                                  {ce.quantiteExecutee}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-bold">
                                  {ce.quantiteAcceptee}
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="font-bold">{ce.pct}%</span>
                                    </div>
                                    <Progress value={ce.pct} className="h-1.5" />
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <Badge
                                    variant="outline"
                                    className={`text-[9px] font-bold ${
                                      ce.status === 'Conforme' || ce.status === 'Validé' || ce.status === 'Libéré'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                        : 'bg-amber-50 text-amber-700 border-amber-300'
                                    }`}
                                  >
                                    {ce.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Observations spécifiques au lot */}
                      <div className="p-2.5 rounded bg-muted/40 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                        <span>{lotStat.comment}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* ======================= ONGLET 2 : TOUS LES FICHIERS & PIÈCES JOINTES ======================= */}
          <TabsContent value="fichiers" className="space-y-4 pt-3">
            <Card className="border border-border shadow-xs bg-card">
              <CardHeader className="p-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">
                    Registre des Pièces Jointes & Fichiers Techniques du Rapport
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Plans d'exécution, métrés Excel, fiches d'essais CETEC, photos géotaggées et avis officiels
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  className="text-xs gap-1.5 bg-primary text-primary-foreground"
                  onClick={() => {
                    toast.success('Archive globale de 7 fichiers téléchargée avec manifeste SHA-256.');
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                  Tout Télécharger (.ZIP)
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">Fichier & Format</th>
                      <th className="py-2.5 px-3">Description Technique</th>
                      <th className="py-2.5 px-3">Lot</th>
                      <th className="py-2.5 px-3">Taille</th>
                      <th className="py-2.5 px-3">Visa MOE</th>
                      <th className="py-2.5 px-3">Empreinte SHA-256</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {attachedFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setPreviewFile(file)}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            {getFileIcon(file.type)}
                            <div>
                              <span className="font-bold text-foreground block truncate max-w-xs">
                                {file.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                Format {file.type} • Déposé le {file.uploadDate}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 max-w-sm text-muted-foreground">
                          {file.description}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {file.lotId}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-foreground">
                          {file.sizeMb} Mo
                        </td>
                        <td className="py-3 px-3">
                          {getVisaBadge(file.visaCode)}
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] text-muted-foreground truncate max-w-[120px]">
                          {file.sha256.slice(0, 16)}...
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => setPreviewFile(file)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1 text-primary" />
                              Voir
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                toast.success(`Téléchargement direct de ${file.name}`);
                              }}
                            >
                              <Download className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ======================= ONGLET 3 : ÉTAT DE VALIDATION DES DOCUMENTS & VISAS ======================= */}
          <TabsContent value="validationDocs" className="space-y-4 pt-3">
            <Card className="border border-border shadow-xs bg-card">
              <CardHeader className="p-4 border-b border-border bg-muted/20">
                <CardTitle className="text-sm font-bold">
                  Circuit d'Approbation & État de Validation des Documents Contractuels
                </CardTitle>
                <CardDescription className="text-xs">
                  Traçabilité contradictoire : Visa technique de la Mission de Contrôle (SCET), Approbation DGPC et Non-Objection Bailleurs
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">Code & Pièce</th>
                      <th className="py-2.5 px-3">Lot & Discipline</th>
                      <th className="py-2.5 px-3">Révision</th>
                      <th className="py-2.5 px-3">État GED</th>
                      <th className="py-2.5 px-3">Visa MOE (SCET)</th>
                      <th className="py-2.5 px-3">Approbation DGPC</th>
                      <th className="py-2.5 px-3">Avis Bailleur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {documentsValidationList.map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-primary block">
                            {doc.code}
                          </span>
                          <span className="text-[11px] text-foreground font-medium truncate block max-w-xs">
                            {doc.title}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="font-mono text-[10px] mr-1">
                            {doc.lotId}
                          </Badge>
                          <span className="text-muted-foreground text-[10px]">{doc.categoryLabel}</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-foreground">
                          {doc.currentRevision}
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            className={`text-[10px] font-bold ${
                              doc.state === 'Published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : doc.state === 'Shared'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {doc.state === 'Published' ? 'Approuvé' : doc.state === 'Shared' ? 'En Revue' : 'Brouillon'}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          {getVisaBadge(doc.visa)}
                        </td>
                        <td className="py-3 px-3">
                          {doc.state === 'Published' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                              <Check className="h-3 w-3" /> Approuvé DGPC
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">En cours d'instruction</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-primary/10 text-primary border-primary/20"
                          >
                            {doc.noStatus.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal Prévisualisation d'un fichier technique avec certificat d'intégrité */}
        {previewFile && (
          <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono text-xs">
                    Format {previewFile.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Lot {previewFile.lotId}</span>
                </div>
                <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                  {getFileIcon(previewFile.type)}
                  <span>{previewFile.name}</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Pièce jointe officielle au rapport d'avancement • Déposée le {previewFile.uploadDate}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                <div className="p-3 bg-muted/40 rounded-lg space-y-2 border border-border">
                  <span className="font-semibold text-foreground block">Descriptif du contenu technique :</span>
                  <p className="text-muted-foreground leading-relaxed">
                    {previewFile.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-background rounded-md border border-border space-y-1">
                    <span className="text-muted-foreground text-[10px] block">Visa Technique (SCET)</span>
                    <div className="pt-0.5">{getVisaBadge(previewFile.visaCode)}</div>
                  </div>
                  <div className="p-2.5 bg-background rounded-md border border-border space-y-1">
                    <span className="text-muted-foreground text-[10px] block">Poids du Fichier</span>
                    <span className="font-black text-foreground text-sm">{previewFile.sizeMb} Mo</span>
                  </div>
                </div>

                <div className="p-3 bg-muted/20 rounded-lg border border-border space-y-1">
                  <span className="font-semibold text-foreground text-[11px] block">
                    Certificat d'Intégrité Probante & Horodatage :
                  </span>
                  <p className="font-mono text-[10px] text-muted-foreground break-all bg-background p-1.5 rounded border border-border/80">
                    SHA256: {previewFile.sha256}
                  </p>
                </div>
              </div>

              <DialogFooter className="border-t border-border pt-3 flex justify-between sm:justify-between">
                <Button
                  size="sm"
                  className="text-xs gap-1.5 bg-primary text-primary-foreground"
                  onClick={() => {
                    toast.success(`Téléchargement de ${previewFile.name} en cours`);
                    setPreviewFile(null);
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                  Télécharger le Fichier
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPreviewFile(null)} className="text-xs">
                  Fermer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
