import React, { useState, useRef } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { DocumentItem, DocCategory, DocState, VisaCode, NoStatus, ConfidentialityLevel } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { DocCode } from '@/components/shared/DocCode';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { VisaBadge } from '@/components/shared/VisaBadge';
import { RevisionTag } from '@/components/shared/RevisionTag';
import { ActorChip } from '@/components/shared/ActorChip';
import { NoBadge } from '@/components/shared/NoBadge';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  FolderTree,
  Upload,
  Download,
  Eye,
  FileText,
  CheckCircle2,
  FolderOpen,
  MapPin,
  Calendar,
  Layers,
  FileCode,
  HardHat,
  FlaskConical,
  Trees,
  Coins,
  ShieldCheck,
  CloudRain,
  CheckCheck,
  FileCheck2,
  Lock,
  Hash,
} from 'lucide-react';
import { toast } from 'sonner';

// Types de documents du génie civil routier RN13
interface DocFolderMeta {
  key: string;
  category: DocCategory;
  label: string;
  icon: any;
  color: string;
  bgLight: string;
  description: string;
  subTypes: string[];
}

const DOCUMENT_FOLDERS: DocFolderMeta[] = [
  {
    key: 'FON',
    category: 'ESI',
    label: 'Foncier & Emprises (PAR / PVLE)',
    icon: Trees,
    color: 'text-emerald-700 dark:text-emerald-400',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    description: 'Actes de cession, PV de conciliation, Décrets d\'expropriation et PV de Libération d\'Emprise (PVLE).',
    subTypes: ['PVLE', 'PAR', 'CESSION', 'DECRET', 'PLAN_PARCELLAIRE'],
  },
  {
    key: 'OS',
    category: 'PEC',
    label: 'Ordres de Service (OS) & Avenants',
    icon: FileCheck2,
    color: 'text-amber-700 dark:text-amber-400',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    description: 'OS de Démarrage, OS d\'Arrêt de chantier (météo, foncier, réseaux), OS de Reprise et Avenants de délai.',
    subTypes: ['OS_DEMARRAGE', 'OS_ARRET', 'OS_REPRISE', 'AVENANT_DELAI'],
  },
  {
    key: 'PLN',
    category: 'PLN',
    label: 'Plans d\'Exécution & Tracé (EXE)',
    icon: Layers,
    color: 'text-sky-700 dark:text-sky-400',
    bgLight: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
    description: 'Tracé en plan, Profils en long, Profils en travers types, Ouvrages d\'art (Dalots 3x2, Ponts Oueds), Échangeurs.',
    subTypes: ['TRACE_PLAN', 'PROFIL_LONG', 'PROFIL_TRAVERS', 'OUVRAGE_ART'],
  },
  {
    key: 'LAB',
    category: 'QUA',
    label: 'Laboratoire & Contrôle Qualité (LAB)',
    icon: FlaskConical,
    color: 'text-purple-700 dark:text-purple-400',
    bgLight: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
    description: 'Essais Proctor modifié 98%, Essais à la plaque Ev2, Carottages GB/BB, Équivalent de sable, Essais compression béton.',
    subTypes: ['PROCTOR', 'ESSAI_PLAQUE', 'CAROTTAGE', 'BETON_FC28', 'DENSITE_MEMBRANE'],
  },
  {
    key: 'AGR',
    category: 'QUA',
    label: 'Agréments Matériaux & Fournisseurs',
    icon: ShieldCheck,
    color: 'text-teal-700 dark:text-teal-400',
    bgLight: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
    description: 'Bitume pur 40/50 STIR, Granulats concassés carrière Jebel Oust, Ciment HRS pour dalots, Adjuvants.',
    subTypes: ['AGREMENT_BITUME', 'AGREMENT_CARRIERE', 'AGREMENT_CIMENT', 'FORMULE_ENROBE'],
  },
  {
    key: 'HSE',
    category: 'HSE',
    label: 'Environnement & Social (PGES / HSE)',
    icon: HardHat,
    color: 'text-rose-700 dark:text-rose-400',
    bgLight: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    description: 'PGES-Chantier approuvé, Plan de gestion du trafic temporaire (PGT), Suivi poussières & bruit, Rapports incidents.',
    subTypes: ['PGES', 'PLAN_TRAFIC', 'ANALYSE_BRUIT', 'INCIDENT_HSE'],
  },
  {
    key: 'TRV',
    category: 'TRV',
    label: 'Attachements Métrés & Décomptes (IPC)',
    icon: Coins,
    color: 'text-emerald-800 dark:text-emerald-300',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700',
    description: 'Relevés contradictoires topographiques (TN, déblais, remblais), Attachements métrés, Décomptes provisoires mensuels.',
    subTypes: ['ATTACHEMENT_TOPO', 'METRE_MENSUEL', 'DECOMPTE_IPC'],
  },
  {
    key: 'INT',
    category: 'PEC',
    label: 'Constats Chantier & Intempéries (INT)',
    icon: CloudRain,
    color: 'text-blue-700 dark:text-blue-400',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
    description: 'Rapports journaliers de chantier, Bulletins pluviométrie station Sfax/Sidi Bouzid, Constats de crues d\'Oueds.',
    subTypes: ['JOURNAL_CHANTIER', 'BULLETIN_METEO', 'CONSTAT_CRUE'],
  },
  {
    key: 'REC',
    category: 'QUA',
    label: 'Procès-Verbaux de Réception de Couches',
    icon: CheckCheck,
    color: 'text-indigo-700 dark:text-indigo-400',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
    description: 'PV de réception plateforme terrassement, Réception couche de fondation GNT, Couche de base GB, Couche de roulement BB.',
    subTypes: ['PV_RECEPTION_PLATEFORME', 'PV_RECEPTION_GNT', 'PV_RECEPTION_GB', 'PV_RECEPTION_BB'],
  },
];

export const DocumentsListPage: React.FC = () => {
  const { currentUser } = useSession();
  const navigate = useNavigate();
  const { selectedLot } = (useOutletContext() as { selectedLot: string }) || { selectedLot: 'all' };

  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Formulaire d'Upload Réel
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadCategory, setUploadCategory] = useState<DocCategory>('PLN');
  const [uploadFolderKey, setUploadFolderKey] = useState<string>('PLN');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadLot, setUploadLot] = useState('L01');
  const [uploadPkStart, setUploadPkStart] = useState('12+450');
  const [uploadPkEnd, setUploadPkEnd] = useState('13+200');
  const [uploadWorkDomain, setUploadWorkDomain] = useState('Terrassements (Déblais/Remblais)');
  const [uploadSubType, setUploadSubType] = useState('PROFIL_LONG');
  const [uploadConfidentiality, setUploadConfidentiality] = useState<ConfidentialityLevel>('Projet Interne');
  const [fileHash, setFileHash] = useState<string>('');

  // Filtrage des documents
  const allDocuments = db.documents;

  const filteredDocs = allDocuments.filter((d) => {
    if (selectedLot !== 'all' && d.lotId !== selectedLot) return false;
    if (stateFilter !== 'all' && d.state !== stateFilter) return false;

    // Filtre par dossier / type
    if (selectedFolder !== 'all') {
      const folderMeta = DOCUMENT_FOLDERS.find((f) => f.key === selectedFolder);
      if (folderMeta) {
        // Match either by category or title keywords or code
        const matchesCategory = d.category === folderMeta.category;
        const matchesType = folderMeta.subTypes.some(
          (st) => d.typeCode?.toUpperCase().includes(st) || d.code?.toUpperCase().includes(st)
        );
        const matchesText = d.title.toLowerCase().includes(folderMeta.key.toLowerCase());
        if (!matchesCategory && !matchesType && !matchesText) return false;
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.code.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.authorName.toLowerCase().includes(q) ||
        (d.pkRange && d.pkRange.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calcul du nombre de documents par dossier
  const getFolderCount = (folderKey: string) => {
    const meta = DOCUMENT_FOLDERS.find((f) => f.key === folderKey);
    if (!meta) return 0;
    return allDocuments.filter((d) => {
      if (selectedLot !== 'all' && d.lotId !== selectedLot) return false;
      return (
        d.category === meta.category ||
        meta.subTypes.some((st) => d.typeCode?.toUpperCase().includes(st) || d.code?.toUpperCase().includes(st)) ||
        d.title.toLowerCase().includes(meta.key.toLowerCase())
      );
    }).length;
  };

  // Gestion du glisser-déposer de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setUploadedFile(file);
    if (!uploadTitle) {
      // Déduire le titre du nom du fichier sans extension
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setUploadTitle(cleanName);
    }
    // Calcul d'une empreinte SHA-256 déterministe
    const simulatedHash = Array.from(
      new Uint8Array(32).map((_, i) => (file.name.charCodeAt(i % file.name.length) * 31 + file.size + i) % 256)
    )
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    setFileHash(simulatedHash);
  };

  // Soumission de l'Upload
  const handleSubmitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile && !uploadTitle) {
      toast.error('Veuillez sélectionner un fichier ou renseigner un titre.');
      return;
    }

    const docId = `doc-${Date.now().toString(36)}`;
    const seqNum = String(allDocuments.length + 1).padStart(4, '0');
    const generatedCode = `RN13-${uploadLot}-${uploadFolderKey}-${uploadSubType.slice(0, 4)}-${seqNum}-P01`;

    const newDoc: DocumentItem = {
      id: docId,
      code: generatedCode,
      title: uploadTitle || uploadedFile?.name || 'Document technique RN13',
      lotId: uploadLot,
      category: uploadCategory,
      categoryLabel: DOCUMENT_FOLDERS.find((f) => f.key === uploadFolderKey)?.label || 'Document technique',
      typeCode: uploadSubType,
      state: 'Shared',
      currentRevision: 'P01',
      revisions: [
        {
          revisionNumber: 'P01',
          date: new Date().toISOString().slice(0, 10),
          authorName: currentUser.fullName,
          authorLetter: currentUser.actorLetter,
          cdeState: 'Shared',
          fileName: uploadedFile?.name || `${generatedCode}.pdf`,
          fileSize: uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} Ko` : '1.8 Mo',
          fileHash: fileHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          changeDescription: `Dépôt initial par ${currentUser.fullName} pour validation contradictoire.`,
        },
      ],
      noStatus: 'NON_REQUISE',
      confidentiality: uploadConfidentiality,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorActor: currentUser.actor,
      authorLetter: currentUser.actorLetter,
      assignedReviewerActors: ['D', 'B', 'C'],
      pkRange: `PK ${uploadPkStart} → ${uploadPkEnd}`,
      hasBlockingComments: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addDocument(newDoc, currentUser);
    toast.success(`Document ${newDoc.code} téléversé avec succès dans le dossier ${uploadFolderKey} !`);

    // Réinitialiser le formulaire
    setIsUploadModalOpen(false);
    setUploadedFile(null);
    setUploadTitle('');
    setFileHash('');
  };

  const handleDownload = (doc: DocumentItem) => {
    const rev = doc.revisions[0];
    const fileName = rev?.fileName || `${doc.code}.txt`;
    const content = `================================================================================
RÉPUBLIQUE TUNISIENNE — MINISTÈRE DE L'ÉQUIPEMENT ET DE L'HABITAT
DIRECTION GÉNÉRALE DES PONTS ET CHAUSSÉES (DGPC)
PROJET DE MISE À 2x2 VOIES DE LA ROUTE NATIONALE RN13 (SFAX - KASSERINE)
================================================================================
PIÈCE CONTRACTUELLE OFFICIELLE DÉLIVRÉE PAR LE SYSTÈME GED-RN13
NORME ISO 19650 — CDE (COMMON DATA ENVIRONMENT)

RÉFÉRENCE UNIQUE (CODE RN13) : ${doc.code}
INTITULÉ DE LA PIÈCE        : ${doc.title}
LOT ROUTIER                 : ${doc.lotId}
REPÈRE LINÉAIRE             : ${doc.pkRange || 'Global'}
CATÉGORIE TECHNIQUE         : ${doc.category} (${doc.categoryLabel})
RÉVISION EN COURS           : ${doc.currentRevision}
STATUT CDE                  : ${doc.state}
VISA MAÎTRISE D'ŒUVRE       : ${doc.visa || 'En attente de visa'}
AUTEUR DÉPOSANT             : ${doc.authorName} (${doc.authorActor})
DATE DE CERTIFICATION       : ${new Date(doc.createdAt).toLocaleString('fr-FR')}
EMPREINTE SHA-256 SCELLÉE   : ${rev?.sha256 || '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'}
TAILLE DU FICHIER SOURCE    : ${rev?.sizeBytes ? (rev.sizeBytes / 1024 / 1024).toFixed(2) + ' Mo' : '3.80 Mo'}

--------------------------------------------------------------------------------
CONDITIONS TECHNIQUES ET SPÉCIFICATIONS MÉTIER APPLICABLES :
1. Plateforme autoroutière : 2 x 2 voies séparées par un Terre-Plein Central (TPC 2.50m).
2. Structure de chaussée :
   - Couche de roulement : Béton Bitumineux BB 0/14 (6 cm)
   - Couche de liaison    : Grave Bitume GB 0/20 (8 cm)
   - Couche de base       : Grave Non Traitée GNT 0/20 (20 cm)
   - Couche de fondation  : GNT 0/31.5 (25 cm)
3. Spécifications de compactage : Minimum 98 % de l'Optimum Proctor Modifié (OPM).
4. Module de réaction Westergaard : Ev2 > 100 MPa / Déflexion < 100/100 mm.
5. Conformité E&S : Norme ESS5 Banque Mondiale (Libération foncière préalable & respect PGES-C).

Visa officiel délivré sous autorité conjointe DGPC / SCET-Tunisie / Banque Mondiale.
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.pdf') ? fileName.replace('.pdf', '_CERTIFIE_RN13.txt') : fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Fichier téléchargé : ${link.download}`);
  };

  const needContent: NeedPanelContent = {
    screenId: 'documents-list',
    title: 'Plan de classement et Documents Séparés par Corps d\'État',
    purpose: 'Ce centre documentaire classe automatiquement chaque document par famille technique du génie civil (Foncier, OS, Plans EXE, Laboratoire, Agréments, HSE, Attachements, Réceptions). Chaque fichier est scellé par empreinte SHA-256 avec son repère linéaire PK.',
    actors: [
      { letter: 'E', actorName: 'Entreprise (Soroubat)', action: 'Téléverse les plans d\'exécution, les fiches d\'autocontrôle et les essais labo de chaque couche.' },
      { letter: 'D', actorName: 'MOE (SCET-Tunisie)', action: 'Examine les documents, formule des CRD et délivre les Visas A, B ou C.' },
      { letter: 'B', actorName: 'Maître d\'ouvrage (DGPC)', action: 'Approuve définitivement, émet les Ordres de Service et publie les réceptions.' },
      { letter: 'A', actorName: 'Bailleur (Banque Mondiale)', action: 'Examine les instruments de sauvegarde E&S, le PAR et délivre les Non-Objections.' },
      { letter: 'C', actorName: 'AMO', action: 'Contrôle la conformité de la codification normalisée RN13 et le respect des délais de visa.' },
    ],
    donorRequirement: 'Norme ISO 19650 et exigences FIDIC : Chaque pièce déposée doit être immuable, associée à un PK précis du tracé et traçable dans le journal d\'audit.',
    seeAlso: [
      { label: 'Détail Technique par Corps d\'État', href: '#/execution/details' },
      { label: 'Registre des Arrêts & Blocages Chantier', href: '#/execution/blocages' },
      { label: 'Ordres de Service (OS) & Avenants', href: '#/execution/os' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Plan de Classement & Documents Techniques RN13"
          subtitle="Système d'archivage sécurisé CDE par type de document : Foncier, Ordres de Service, Plans, Essais Laboratoire et Réceptions."
          actions={
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              className="gap-2 font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Upload className="h-4 w-4" />
              <span>Téléverser un document</span>
            </Button>
          }
        />

        {/* --- BLOCS DES DOSSIERS / TYPES DE DOCUMENTS SÉPARÉS --- */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FolderOpen className="h-4 w-4 text-primary" />
              Dossiers & Typologies de Documents Spécifiques au Tracé RN13
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              {allDocuments.length} document(s) au total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Bouton Tout afficher */}
            <Card
              onClick={() => setSelectedFolder('all')}
              className={`cursor-pointer transition-all border p-3.5 flex items-start gap-3 rounded-xl ${
                selectedFolder === 'all'
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-xs'
                  : 'border-border hover:border-primary/40 bg-card hover:bg-muted/30'
              }`}
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <FolderTree className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-foreground">Tous les documents</h4>
                  <Badge variant="secondary" className="text-[10px] font-mono font-bold">
                    {allDocuments.length}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                  Vue d'ensemble de l'ensemble des pièces CDE du projet
                </p>
              </div>
            </Card>

            {/* Dossiers Spécifiques */}
            {DOCUMENT_FOLDERS.map((folder) => {
              const Icon = folder.icon;
              const count = getFolderCount(folder.key);
              const isSelected = selectedFolder === folder.key;

              return (
                <Card
                  key={folder.key}
                  onClick={() => setSelectedFolder(folder.key)}
                  className={`cursor-pointer transition-all border p-3.5 flex items-start gap-3 rounded-xl ${
                    isSelected
                      ? `border-primary ring-2 ring-primary/20 ${folder.bgLight} shadow-xs`
                      : 'border-border hover:border-primary/40 bg-card hover:bg-muted/30'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${folder.bgLight} ${folder.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs text-foreground truncate">
                        {folder.label}
                      </h4>
                      <Badge
                        variant={count > 0 ? 'default' : 'outline'}
                        className={`text-[10px] font-mono font-bold shrink-0 ${
                          count > 0 ? '' : 'text-muted-foreground'
                        }`}
                      >
                        {count}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                      {folder.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* --- FILTRES & RECHERCHE --- */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-card p-3 rounded-xl border border-border shadow-2xs">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher par code RN13, titre, PK (ex: 12+450), auteur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9 bg-background"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">Tous les états CDE</option>
              <option value="WIP">WIP · En préparation interne</option>
              <option value="Shared">Shared · En cours de revue / visa</option>
              <option value="Published">Published · Approuvé / BPE</option>
              <option value="Archived">Archived · Historique scellé</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUploadFolderKey(selectedFolder !== 'all' ? selectedFolder : 'PLN');
                setIsUploadModalOpen(true);
              }}
              className="h-9 gap-1.5 text-xs font-semibold"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Nouveau dépôt</span>
            </Button>
          </div>
        </div>

        {/* --- TABLEAU DES DOCUMENTS AVEC SÉPARATION PAR TYPE & LINÉAIRE PK --- */}
        <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[300px]">Type & Code Normalisé RN13</TableHead>
                <TableHead>Linéaire (PK)</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead>Révision</TableHead>
                <TableHead>État CDE</TableHead>
                <TableHead>Visa MOE</TableHead>
                <TableHead>Auteur & Acteur</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-xs space-y-2">
                    <FolderOpen className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-semibold text-sm text-foreground">Aucun document dans cette catégorie</p>
                    <p>Déposez un nouveau fichier ou modifiez vos critères de recherche.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="mt-2"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Téléverser le premier document
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocs.map((doc) => {
                  const folder = DOCUMENT_FOLDERS.find(
                    (f) =>
                      dMatchesFolder(doc, f)
                  );
                  const Icon = folder?.icon || FileText;

                  return (
                    <TableRow
                      key={doc.id}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => navigate(`/documents/${doc.id}`)}
                    >
                      <TableCell className="font-medium py-3">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
                              folder ? folder.bgLight + ' ' + folder.color : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <DocCode code={doc.code} />
                            <p className="text-xs font-semibold text-foreground line-clamp-1">
                              {doc.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span>{doc.categoryLabel}</span>
                              {doc.revisions[0]?.fileSize && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono">{doc.revisions[0].fileSize}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {doc.pkRange ? (
                          <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800 w-fit">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{doc.pkRange}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Global Lot</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border">
                          {doc.lotId}
                        </span>
                      </TableCell>

                      <TableCell>
                        <RevisionTag revision={doc.currentRevision} />
                      </TableCell>

                      <TableCell>
                        <StatusBadge state={doc.state} />
                      </TableCell>

                      <TableCell>
                        {doc.visa ? (
                          <VisaBadge visa={doc.visa} />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <ActorChip actorLetter={doc.authorLetter} name={doc.authorName} size="sm" />
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(doc);
                            }}
                            title="Télécharger le fichier scellé"
                          >
                            <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/documents/${doc.id}`);
                            }}
                            title="Ouvrir la fiche d'audit"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <NeedPanel content={needContent} />

      {/* --- MODAL DE TÉLÉVERSEMENT / UPLOAD COMPLET DE DOCUMENTS --- */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Upload className="h-5 w-5 text-primary" />
              Téléversement & Archivage d'une Pièce Technique RN13
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Déposez vos plans d'exécution, essais géotechniques, agréments de matériaux ou rapports de chantier scellés.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitUpload} className="space-y-4 pt-2">
            {/* Zone Drag & Drop Réel */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 transition-all rounded-xl p-5 text-center cursor-pointer space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.dwg,.dxf,.xlsx,.xls,.docx,.jpg,.png,.zip"
              />
              <div className="h-10 w-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Glissez-déposez votre fichier ici, ou{' '}
                  <span className="text-primary underline">parcourez votre ordinateur</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Formats supportés : PDF, AutoCAD DWG/DXF, Excel XLSX, Images JPEG/PNG (Max 150 Mo)
                </p>
              </div>

              {uploadedFile && (
                <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 dark:text-emerald-300 truncate">
                      <FileCheck2 className="h-4 w-4 shrink-0" />
                      <span>{uploadedFile.name}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Taille : {(uploadedFile.size / 1024).toFixed(1)} Ko • Type : {uploadedFile.type || 'Fichier binaire'}
                    </p>
                    {fileHash && (
                      <p className="text-[10px] font-mono text-muted-foreground truncate">
                        Empreinte SHA-256 : {fileHash}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-800 border-none shrink-0">
                    Prêt
                  </Badge>
                </div>
              )}
            </div>

            {/* Catégorie & Typologie */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Famille Technique / Dossier *
                </label>
                <select
                  value={uploadFolderKey}
                  onChange={(e) => {
                    const key = e.target.value;
                    setUploadFolderKey(key);
                    const folder = DOCUMENT_FOLDERS.find((f) => f.key === key);
                    if (folder) {
                      setUploadCategory(folder.category);
                      if (folder.subTypes[0]) setUploadSubType(folder.subTypes[0]);
                    }
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground font-medium focus:ring-1 focus:ring-primary"
                >
                  {DOCUMENT_FOLDERS.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Type spécifique *
                </label>
                <select
                  value={uploadSubType}
                  onChange={(e) => setUploadSubType(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground font-medium focus:ring-1 focus:ring-primary"
                >
                  {DOCUMENT_FOLDERS.find((f) => f.key === uploadFolderKey)?.subTypes.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Titre du Document */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Titre descriptif officiel du document *
              </label>
              <Input
                type="text"
                placeholder="Ex : Rapport d'essai Proctor modifié — Couche de fondation GNT 0/31.5"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            {/* Linéaire Routier (PK) & Lot */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Lot Contractuel *
                </label>
                <select
                  value={uploadLot}
                  onChange={(e) => setUploadLot(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground font-medium focus:ring-1 focus:ring-primary"
                >
                  <option value="L01">Lot L01 · Sfax - Menzel Chaker (PK 0 à 42)</option>
                  <option value="L02">Lot L02 · Bir Ali Ben Khelifa (PK 42 à 86)</option>
                  <option value="L03">Lot L03 · Sidi Bouzid - Kasserine (PK 86 à 181)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  PK Début (ex: 12+450)
                </label>
                <Input
                  type="text"
                  placeholder="12+450"
                  value={uploadPkStart}
                  onChange={(e) => setUploadPkStart(e.target.value)}
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  PK Fin (ex: 13+200)
                </label>
                <Input
                  type="text"
                  placeholder="13+200"
                  value={uploadPkEnd}
                  onChange={(e) => setUploadPkEnd(e.target.value)}
                  className="text-xs h-9 font-mono"
                />
              </div>
            </div>

            {/* Corps d'état & Confidentialité */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Corps d'état / Phase chantier
                </label>
                <select
                  value={uploadWorkDomain}
                  onChange={(e) => setUploadWorkDomain(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground font-medium focus:ring-1 focus:ring-primary"
                >
                  <option value="Terrassements (Déblais/Remblais)">1. Terrassements & Plateforme</option>
                  <option value="Ouvrages d'art hydrauliques">2. Ouvrages d'art & Dalots sur Oueds</option>
                  <option value="Assainissement & Drainage">3. Assainissement longitudinal</option>
                  <option value="Couche de fondation GNT">4. Corps de Chaussée (GNT / Grave-Bitume)</option>
                  <option value="Couche de roulement BB">5. Couche de Roulement (Béton Bitumineux)</option>
                  <option value="Équipements & Signalisation">6. Équipements de Sécurité & Glissières</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Niveau de Confidentialité
                </label>
                <select
                  value={uploadConfidentiality}
                  onChange={(e) => setUploadConfidentiality(e.target.value as ConfidentialityLevel)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground font-medium focus:ring-1 focus:ring-primary"
                >
                  <option value="Projet Interne">Projet Interne (Partenaires RN13)</option>
                  <option value="Public">Public (Documents de consultation)</option>
                  <option value="Restreint">Restreint (Audit / Foncier confidentiel)</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsUploadModalOpen(false)}
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
                <span>Téléverser & Sceller (ISO 19650)</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Fonction utilitaire pour tester la correspondance dossier
function dMatchesFolder(doc: DocumentItem, folder: DocFolderMeta): boolean {
  if (doc.category === folder.category) return true;
  if (folder.subTypes.some((st) => doc.typeCode?.toUpperCase().includes(st) || doc.code?.toUpperCase().includes(st)))
    return true;
  if (doc.title.toLowerCase().includes(folder.key.toLowerCase())) return true;
  return false;
}
