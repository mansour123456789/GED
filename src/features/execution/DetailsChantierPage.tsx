import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Layers,
  HardHat,
  FlaskConical,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Upload,
  Eye,
  FileText,
  ShieldCheck,
  Compass,
  ArrowRight,
  TrendingUp,
  Activity,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

interface RoadWorkPackage {
  id: string;
  code: string;
  name: string;
  shortDesc: string;
  linearProgressKm: number;
  totalKm: number;
  progressPct: number;
  status: 'Conforme' | 'Attention' | 'BloqueArrete';
  layersDetails: {
    title: string;
    thicknessSpec: string;
    criticalTests: string[];
    blockingGate: string;
    status: 'Terminé' | 'En cours' | 'En attente' | 'Arrêté';
    completedKm: number;
    totalKm: number;
  }[];
  materialsApproved: string[];
  keyLabThresholds: {
    testName: string;
    requiredStandard: string;
    lastResult: string;
    compliant: boolean;
  }[];
  activeStopsCount: number;
  documentsCount: number;
}

const ROAD_PACKAGES_DATA: RoadWorkPackage[] = [
  {
    id: 'pkg-terrassement',
    code: 'LOT-TERR',
    name: '1. Plateforme & Terrassements Généraux',
    shortDesc: 'Décapage terre végétale, déblais meubles/rocheux, remblais méthodiques par couches de 30 cm.',
    linearProgressKm: 32.4,
    totalKm: 42.0,
    progressPct: 77,
    status: 'Attention',
    layersDetails: [
      {
        title: 'Décapage terre végétale (e = 20-30 cm)',
        thicknessSpec: '0.25 m moyen',
        criticalTests: ['Relevé contradictoire topo TN', 'Stockage cordons réutilisation'],
        blockingGate: 'PV de réception TN signé DGPC/SCET',
        status: 'Terminé',
        completedKm: 42.0,
        totalKm: 42.0,
      },
      {
        title: 'Remblais méthodiques sélectionné (CBR > 8)',
        thicknessSpec: 'Couches successives de 30 cm',
        criticalTests: ['Compacité Proctor modifié ≥ 95% OPM', 'Teneur en eau wOPM ± 1.5%'],
        blockingGate: 'Fiche d\'autocontrôle par levée de 30 cm',
        status: 'Arrêté',
        completedKm: 28.2,
        totalKm: 42.0,
      },
      {
        title: 'Couche de forme traitée ou sélectionnée',
        thicknessSpec: '35 cm d\'épaisseur',
        criticalTests: ['Compacité ≥ 98% OPM', 'Essai à la plaque Westergaard Ev2 ≥ 50 MPa', 'Déflexion Benkelman'],
        blockingGate: 'PV de réception de la plateforme support',
        status: 'En cours',
        completedKm: 24.0,
        totalKm: 42.0,
      },
    ],
    materialsApproved: [
      'Grave siliceuse carrière Sfax Nord (Agrément MOE-2026-AGR-01)',
      'Matériaux d\'apport emprunt PK 18 (CBR = 14, IP = 9)',
    ],
    keyLabThresholds: [
      {
        testName: 'Compacité Remblai (Proctor Modifié)',
        requiredStandard: '≥ 95% OPM (corps) / ≥ 98% (arase)',
        lastResult: '98.4% OPM (Conforme)',
        compliant: true,
      },
      {
        testName: 'Teneur en eau de compactage',
        requiredStandard: 'wOPM ± 1.5%',
        lastResult: 'w = 8.2% (optimum 7.8%)',
        compliant: true,
      },
      {
        testName: 'Module de déformation à la plaque (Ev2)',
        requiredStandard: 'Ev2 ≥ 50 MPa & Ev2/Ev1 < 2.0',
        lastResult: 'Ev2 = 58.2 MPa / k = 1.62',
        compliant: true,
      },
    ],
    activeStopsCount: 1, // Arrêt foncier PK 12
    documentsCount: 14,
  },
  {
    id: 'pkg-ouvrages',
    code: 'LOT-OA',
    name: '2. Ouvrages d\'Art Hydrauliques & Dalots',
    shortDesc: 'Franchissement des bassins versants : 14 dalots cadres béton armé et pont sur Oued Zitoun.',
    linearProgressKm: 18.0,
    totalKm: 42.0,
    progressPct: 43,
    status: 'BloqueArrete',
    layersDetails: [
      {
        title: 'Dalot double cadre 3.00 x 2.50 m (PK 12+500)',
        thicknessSpec: 'Radier 40 cm, Pieds-droits 35 cm, Tablier 40 cm',
        criticalTests: ['Ferraillage avant coulage', 'Écrasement compression béton fc28 ≥ 30 MPa'],
        blockingGate: 'Autorisation écrite de coulage SCET-Tunisie',
        status: 'Terminé',
        completedKm: 1.0,
        totalKm: 1.0,
      },
      {
        title: 'Dalot cadre 3.00 x 2.00 m (PK 22+100)',
        thicknessSpec: 'Béton dosé à 350 kg/m³ Ciment HRS',
        criticalTests: ['Résistance fc28 contractuelle 28 MPa (Échec : 21.2 MPa)'],
        blockingGate: 'Arrêt sous OS-2026-005 suite Fiche NCR-2026-0042',
        status: 'Arrêté',
        completedKm: 0.2,
        totalKm: 1.0,
      },
      {
        title: 'Pont à poutres précontraintes Oued Zitoun (PK 09+800)',
        thicknessSpec: '3 travées de 24 m, Fondations profondes sur pieux',
        criticalTests: ['Essai de chargement statique', 'Carottage d\'auscultation sonique pieux'],
        blockingGate: 'Dossier de récolement et épreuve de charge',
        status: 'En cours',
        completedKm: 0.5,
        totalKm: 1.0,
      },
    ],
    materialsApproved: [
      'Ciment HRS Ciments de Gabès (Agrément MOE-2026-AGR-04)',
      'Aciers haute adhérence FeE500 El Fouladh Menzel Bourguiba',
      'Centrale à béton mobile Soroubat PK 15 certifiée ISO 9001',
    ],
    keyLabThresholds: [
      {
        testName: 'Résistance Béton Dalot PK 22 (fc28)',
        requiredStandard: '≥ 28.0 MPa à 28 jours',
        lastResult: '21.2 MPa (NON CONFORME - En arrêt)',
        compliant: false,
      },
      {
        testName: 'Affaissement au cône d\'Abrams (Slump)',
        requiredStandard: '7 à 9 cm (Béton plastique S2)',
        lastResult: '8.0 cm (Conforme)',
        compliant: true,
      },
      {
        testName: 'Contrôle d\'intégrité des pieux par impédance',
        requiredStandard: 'Absence d\'anomalie de section',
        lastResult: '12 pieux sondés : conformes',
        compliant: true,
      },
    ],
    activeStopsCount: 1, // Dalot PK 22
    documentsCount: 9,
  },
  {
    id: 'pkg-assainissement',
    code: 'LOT-ASS',
    name: '3. Assainissement Longitudinal & Drainage',
    shortDesc: 'Fossés bétonnés trapézoïdaux, descentes d\'eau, buses métalliques et bassins de décantation.',
    linearProgressKm: 26.5,
    totalKm: 42.0,
    progressPct: 63,
    status: 'Conforme',
    layersDetails: [
      {
        title: 'Fossés trapézoïdaux bétonnés en crête et pied de talus',
        thicknessSpec: 'Béton B20 coulé en place ép. 10 cm avec barbacanes',
        criticalTests: ['Vérification des pentes d\'écoulement i ≥ 0.5%', 'Joints de retrait tous les 3 m'],
        blockingGate: 'Constat d\'écoulement sans stagnation',
        status: 'En cours',
        completedKm: 28.0,
        totalKm: 42.0,
      },
      {
        title: 'Descentes d\'eau préfabriquées & têtes de buses',
        thicknessSpec: 'Éléments demi-ronds emboîtés',
        criticalTests: ['Agrément usine de préfabrication', 'Calage béton de propreté'],
        blockingGate: 'Attachement contradictoire métré',
        status: 'En cours',
        completedKm: 22.0,
        totalKm: 42.0,
      },
    ],
    materialsApproved: [
      'Buses béton armé DN 800 à 1200 SOTUVER Préfab',
      'Géotextile non tissé anticontaminant 200 g/m²',
    ],
    keyLabThresholds: [
      {
        testName: 'Pente longitudinale minimale',
        requiredStandard: '≥ 0.50 % vers exutoires',
        lastResult: '0.65 % mesuré au niveau de chantier',
        compliant: true,
      },
      {
        testName: 'Résistance béton de cunette (fc28)',
        requiredStandard: '≥ 20.0 MPa',
        lastResult: '22.8 MPa (Conforme)',
        compliant: true,
      },
    ],
    activeStopsCount: 0,
    documentsCount: 6,
  },
  {
    id: 'pkg-chaussee',
    code: 'LOT-CH',
    name: '4. Corps de Chaussée 2x2 Voies & Enrobés',
    shortDesc: 'Couche de fondation GNT 0/31.5, Couche de base Grave-Bitume (GB), Couche de roulement BB 0/14.',
    linearProgressKm: 19.8,
    totalKm: 42.0,
    progressPct: 47,
    status: 'Attention',
    layersDetails: [
      {
        title: 'Couche de fondation en Grave Non Traitée (GNT 0/31.5)',
        thicknessSpec: 'Épaisseur compactée 20 cm',
        criticalTests: ['Compacité ≥ 100% OPM', 'Module Westergaard Ev2 ≥ 80 MPa', 'Équivalent de sable ES > 50'],
        blockingGate: 'PV de réception de la couche de fondation',
        status: 'En cours',
        completedKm: 22.4,
        totalKm: 42.0,
      },
      {
        title: 'Couche de base en Grave-Bitume (GB 0/20 classe 3)',
        thicknessSpec: 'Épaisseur 12 cm, Taux de liant 4.2% Bitume 40/50',
        criticalTests: ['Température de répandage ≥ 140°C', 'Compacité Marshall ≥ 97%', 'Carottage d\'épaisseur'],
        blockingGate: 'PV de réception couche de base avant couche d\'accrochage',
        status: 'En cours',
        completedKm: 18.0,
        totalKm: 42.0,
      },
      {
        title: 'Couche de roulement en Béton Bitumineux (BB 0/14)',
        thicknessSpec: 'Épaisseur 6 cm, Bitume pur 40/50 STIR Bizerte',
        criticalTests: ['Essai Duriez r/R ≥ 0.75', 'Uni longitudinal APL (Cap 25 < 10)', 'Macrotexture rugosité HS > 0.6 mm'],
        blockingGate: 'PV de réception définitive de la couche de roulement',
        status: 'En attente',
        completedKm: 14.5,
        totalKm: 42.0,
      },
    ],
    materialsApproved: [
      'Bitume pur 40/50 STIR Bizerte certifié conforme NT',
      'Granulats concassés calcaires durs Carrière Jebel Oust (Los Angeles LA < 20, MDE < 15)',
      'Centrale d\'enrobage continue Ermont 240 t/h Soroubat PK 08',
    ],
    keyLabThresholds: [
      {
        testName: 'Compacité Carottage Grave-Bitume GB 0/20',
        requiredStandard: '≥ 97.0 % de la densité Marshall',
        lastResult: '98.1 % (Conforme)',
        compliant: true,
      },
      {
        testName: 'Température de fabrication enrobé',
        requiredStandard: '150°C à 165°C',
        lastResult: '158°C contrôlé au thermomètre infrarouge',
        compliant: true,
      },
      {
        testName: 'Teneur en liant (Bitume 40/50)',
        requiredStandard: '4.20 % ± 0.25 %',
        lastResult: '4.28 % (Conforme)',
        compliant: true,
      },
    ],
    activeStopsCount: 0,
    documentsCount: 18,
  },
  {
    id: 'pkg-securite',
    code: 'LOT-EQ',
    name: '5. Équipements de Sécurité & Signalisation',
    shortDesc: 'Glissières métalliques GS2/GS4, signalisation thermoplastique blanche et balisage échangeurs.',
    linearProgressKm: 12.0,
    totalKm: 42.0,
    progressPct: 28,
    status: 'Conforme',
    layersDetails: [
      {
        title: 'Glissières métalliques de sécurité en TPC et accotements',
        thicknessSpec: 'Profil W galvanisé à chaud avec écarteurs',
        criticalTests: ['Hauteur de pose 75 cm ± 2 cm', 'Ancrage battage poteaux dans remblai'],
        blockingGate: 'Certificat de conformité CE / Norme NT',
        status: 'En cours',
        completedKm: 14.0,
        totalKm: 42.0,
      },
      {
        title: 'Signalisation horizontale thermoplastique rétroréfléchissante',
        thicknessSpec: 'Résine avec microbilles de verre',
        criticalTests: ['Coefficient de rétroréflexion RL ≥ 150 mcd/m²/lx', 'Épaisseur du film humide ≥ 1.5 mm'],
        blockingGate: 'Contrôle nocturne par réflectomètre',
        status: 'En cours',
        completedKm: 12.0,
        totalKm: 42.0,
      },
    ],
    materialsApproved: [
      'Glissières métalliques galvanisées ArcelorMittal certifiées NF058',
      'Peinture thermoplastique Plastiroute homologuée Ministère Équipement',
    ],
    keyLabThresholds: [
      {
        testName: 'Rétroréflexion marquage au sol (RL)',
        requiredStandard: '≥ 150 mcd/lx/m²',
        lastResult: '185 mcd/lx/m² (Conforme)',
        compliant: true,
      },
      {
        testName: 'Épaisseur galvanisation glissières',
        requiredStandard: '≥ 70 µm',
        lastResult: '82 µm mesuré au micromètre',
        compliant: true,
      },
    ],
    activeStopsCount: 0,
    documentsCount: 5,
  },
];

export const DetailsChantierPage: React.FC = () => {
  const { currentUser } = useSession();
  const [packages, setPackages] = useState<RoadWorkPackage[]>(ROAD_PACKAGES_DATA);
  const [selectedPkg, setSelectedPkg] = useState<RoadWorkPackage>(ROAD_PACKAGES_DATA[0]);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Formulaire Nouvel Essai Labo
  const [testPkgId, setTestPkgId] = useState(selectedPkg.id);
  const [testName, setTestName] = useState('');
  const [testPk, setTestPk] = useState('14+200');
  const [testStandard, setTestStandard] = useState('≥ 98% OPM');
  const [testResult, setTestResult] = useState('98.6% OPM');
  const [testCompliant, setTestCompliant] = useState(true);

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) {
      toast.error('Veuillez renseigner le nom de l\'essai.');
      return;
    }

    const updated = packages.map((pkg) => {
      if (pkg.id === testPkgId) {
        return {
          ...pkg,
          keyLabThresholds: [
            {
              testName,
              requiredStandard: testStandard,
              lastResult: testResult,
              compliant: testCompliant,
            },
            ...pkg.keyLabThresholds,
          ],
        };
      }
      return pkg;
    });

    setPackages(updated);
    const active = updated.find((p) => p.id === selectedPkg.id);
    if (active) setSelectedPkg(active);

    setIsTestModalOpen(false);
    toast.success(`Essai laboratoire pour ${testName} enregistré avec succès !`);
  };

  const needContent: NeedPanelContent = {
    screenId: 'execution-details',
    title: 'Détail Technique par Corps d\'État de la RN13',
    purpose: 'Ce module décompose avec précision chirurgicale l\'ensemble des couches de la route 2x2 voies (Terrassements, Dalots hydrauliques, Assainissement, GNT, Grave-Bitume, Béton Bitumineux et Glissières). Chaque sous-couche possède ses seuils d\'acceptation géotechniques et ses points d\'arrêt obligatoires.',
    actors: [
      { letter: 'E', actorName: 'Entreprise (Soroubat)', action: 'Exécute les couches, réalise l\'autocontrôle et dépose les fiches de levée de points d\'arrêt.' },
      { letter: 'D', actorName: 'MOE (SCET-Tunisie)', action: 'Effectue le contrôle contradictoire externe (essais de laboratoire, réceptions de couche).' },
      { letter: 'B', actorName: 'Maître d\'ouvrage (DGPC)', action: 'Délivre l\'autorisation de passage à la couche supérieure après visa favorable de la MOE.' },
      { letter: 'A', actorName: 'Bailleur (Banque Mondiale)', action: 'Vérifie la conformité technique aux spécifications du DAO et la durabilité de la chaussée.' },
    ],
    donorRequirement: 'Spécifications techniques du CCTP : Aucune couche de chaussée (GNT, GB, BB) ne peut être mise en œuvre sans PV écrit de réception de la couche sous-jacente par la Mission de Contrôle.',
    seeAlso: [
      { label: 'Postes d\'Arrêt & Blocages Linéaires', href: '#/execution/blocages' },
      { label: 'Registre des Ordres de Service (OS)', href: '#/execution/os' },
      { label: 'Plan de Classement des Documents CDE', href: '#/documents' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Détail Technique d'Exécution par Corps d'État"
          subtitle="Suivi granulaire des 5 macro-lots de génie civil routier : couches de structure, seuils de compactage et réceptions."
          actions={
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsTestModalOpen(true)}
              className="gap-2 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Enregistrer un essai laboratoire</span>
            </Button>
          }
        />

        {/* --- SÉLECTEUR DES 5 CORPS D'ÉTAT ROUTIERS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {packages.map((pkg) => {
            const isSelected = selectedPkg.id === pkg.id;
            return (
              <Card
                key={pkg.id}
                onClick={() => setSelectedPkg(pkg)}
                className={`cursor-pointer transition-all border p-3 rounded-xl ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-xs'
                    : 'border-border hover:border-primary/40 bg-card hover:bg-muted/30'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground">{pkg.code}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-bold ${
                        pkg.status === 'Conforme'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : pkg.status === 'Attention'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}
                    >
                      {pkg.status === 'Conforme' ? 'Conforme' : pkg.status === 'Attention' ? 'À surveiller' : 'Arrêté'}
                    </Badge>
                  </div>

                  <h4 className="font-bold text-xs text-foreground line-clamp-1">{pkg.name}</h4>

                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">{pkg.linearProgressKm} / {pkg.totalKm} km</span>
                      <span className="font-mono font-bold text-foreground">{pkg.progressPct}%</span>
                    </div>
                    <Progress value={pkg.progressPct} className="h-1.5" />
                  </div>

                  {pkg.activeStopsCount > 0 && (
                    <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      <span>{pkg.activeStopsCount} section(s) arrêtée(s)</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* --- FICHE DÉTAILLÉE DU CORPS D'ÉTAT SÉLECTIONNÉ --- */}
        <div className="space-y-5">
          {/* En-tête du Corps d'État */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  {selectedPkg.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedPkg.shortDesc}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Avancement linéaire :</span>
                <span className="font-mono font-black text-sm text-primary">
                  {selectedPkg.linearProgressKm} km / {selectedPkg.totalKm} km ({selectedPkg.progressPct}%)
                </span>
              </div>
            </div>

            {/* Agréments matériaux validés */}
            <div className="pt-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Agréments Fournisseurs & Formules Validés par la MOE (SCET-Tunisie) :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedPkg.materialsApproved.map((mat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-[11px] bg-muted/60 px-2.5 py-1 rounded-md border border-border text-foreground"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{mat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DÉCOMPOSITION COUCHE PAR COUCHE */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <HardHat className="h-4 w-4 text-amber-500" />
              Sous-Couches & Spécifications Géotechniques CCTP
            </h4>

            <div className="space-y-3">
              {selectedPkg.layersDetails.map((layer, index) => (
                <Card key={index} className="border border-border shadow-2xs overflow-hidden">
                  <div className="p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <h5 className="font-bold text-xs text-foreground">{layer.title}</h5>
                          <span className="text-[11px] text-muted-foreground">
                            Spécification épaisseur : <strong className="text-foreground">{layer.thicknessSpec}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[11px] text-muted-foreground block">
                            {layer.completedKm} / {layer.totalKm} km
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            {Math.round((layer.completedKm / layer.totalKm) * 100)}%
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            layer.status === 'Terminé'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : layer.status === 'En cours'
                              ? 'bg-sky-50 text-sky-700 border-sky-300'
                              : layer.status === 'Arrêté'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {layer.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Contrôles critiques & Point d'arrêt */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60 text-xs">
                      <div>
                        <span className="text-muted-foreground font-semibold block mb-1">
                          Essais de contrôle laboratoire obligatoires :
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-foreground">
                          {layer.criticalTests.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-2.5 rounded-lg bg-muted/40 border border-border space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          Point d'Arrêt Contractuel (Gate) :
                        </span>
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <FileCheck2 className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{layer.blockingGate}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* TABLEAU DES DERNIERS ESSAIS LABORATOIRE DU CORPS D'ÉTAT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FlaskConical className="h-4 w-4 text-purple-500" />
                Derniers Contrôles & Seuils Laboratoire du Corps d'État
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTestModalOpen(true)}
                className="h-8 gap-1.5 text-xs font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Ajouter un essai</span>
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="p-3">Paramètre & Essai Géotechnique</th>
                    <th className="p-3">Exigence Contractuelle CCTP</th>
                    <th className="p-3">Dernière Valeur Relevée</th>
                    <th className="p-3 text-right">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedPkg.keyLabThresholds.map((test, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      <td className="p-3 font-semibold text-foreground">{test.testName}</td>
                      <td className="p-3 font-mono text-muted-foreground">{test.requiredStandard}</td>
                      <td className="p-3 font-mono font-bold text-foreground">{test.lastResult}</td>
                      <td className="p-3 text-right">
                        {test.compliant ? (
                          <Badge className="bg-emerald-600 text-white gap-1 text-[10px]">
                            <CheckCircle2 className="h-3 w-3" /> Conforme
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-600 text-white gap-1 text-[10px]">
                            <AlertTriangle className="h-3 w-3" /> Non Conforme
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <NeedPanel content={needContent} />

      {/* --- MODAL AJOUT D'UN ESSAI DE LABORATOIRE --- */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <FlaskConical className="h-5 w-5 text-purple-600" />
              Saisie d'un Résultat d'Essai de Laboratoire
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enregistrez le résultat d'un autocontrôle ou contrôle contradictoire pour le corps d'état sélectionné.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddTest} className="space-y-3.5 pt-2">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Corps d'État concerné *
              </label>
              <select
                value={testPkgId}
                onChange={(e) => setTestPkgId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground font-medium focus:ring-1 focus:ring-primary"
              >
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Nom de l'essai géotechnique *
              </label>
              <Input
                type="text"
                placeholder="Ex : Essai à la plaque Westergaard Ev2"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Repère Linéaire (PK)
                </label>
                <Input
                  type="text"
                  placeholder="14+200"
                  value={testPk}
                  onChange={(e) => setTestPk(e.target.value)}
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Norme CCTP exigée
                </label>
                <Input
                  type="text"
                  placeholder="≥ 50 MPa"
                  value={testStandard}
                  onChange={(e) => setTestStandard(e.target.value)}
                  className="text-xs h-9 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Valeur mesurée laboratoire
                </label>
                <Input
                  type="text"
                  placeholder="58.2 MPa"
                  value={testResult}
                  onChange={(e) => setTestResult(e.target.value)}
                  className="text-xs h-9 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Verdict de conformité
                </label>
                <select
                  value={testCompliant ? 'yes' : 'no'}
                  onChange={(e) => setTestCompliant(e.target.value === 'yes')}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground font-medium focus:ring-1 focus:ring-primary"
                >
                  <option value="yes">Conforme aux spécifications</option>
                  <option value="no">Non Conforme (Ouverture NCR requise)</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTestModalOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                className="gap-2 font-bold bg-primary text-primary-foreground"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Enregistrer & Valider</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
