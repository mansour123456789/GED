import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { Lot, LotTask, DocumentItem, ActorLetter, TechnicalFileFormat } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { ActorChip } from '@/components/shared/ActorChip';
import { DocCode } from '@/components/shared/DocCode';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  FolderTree,
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Building2,
  HardHat,
  FileText,
  FileSpreadsheet,
  Image,
  Compass,
  Download,
  Upload,
  Plus,
  ShieldCheck,
  Calendar,
  MapPin,
  Coins,
  ChevronRight,
  Filter,
  Eye,
  Layers,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useOutletContext } from 'react-router-dom';

export const LotsManagementPage: React.FC = () => {
  const { currentUser } = useSession();
  const navigate = useNavigate();
  const outletContext = useOutletContext() as { selectedLot?: string; onSelectLot?: (lot: string) => void } | undefined;
  
  const [selectedLotId, setSelectedLotId] = useState<string>(
    outletContext?.selectedLot && outletContext.selectedLot !== 'all' ? outletContext.selectedLot : 'L01'
  );
  const [activeTab, setActiveTab] = useState<'taches' | 'documents' | 'citoyens' | 'multilots'>('taches');
  
  // Filtres
  const [taskCorpsFilter, setTaskCorpsFilter] = useState<string>('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [docActorFilter, setDocActorFilter] = useState<string>('all');
  const [docFormatFilter, setDocFormatFilter] = useState<string>('all');

  // Modales
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [selectedTaskToValidate, setSelectedTaskToValidate] = useState<LotTask | null>(null);
  const [validationVisa, setValidationVisa] = useState<'A' | 'B' | 'C'>('A');
  const [validationRemarks, setValidationRemarks] = useState('');
  const [validationOrderNumber, setValidationOrderNumber] = useState('');

  // Nouvelle Tâche Form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCorps, setNewTaskCorps] = useState<LotTask['corpsEtat']>('Chaussees');
  const [newTaskActor, setNewTaskActor] = useState<ActorLetter>('E');
  const [newTaskDeadline, setNewTaskDeadline] = useState('2026-11-15');
  const [newTaskCitizenImpact, setNewTaskCitizenImpact] = useState('');
  const [newTaskFormat, setNewTaskFormat] = useState<TechnicalFileFormat>('EXCEL');

  const lots = db.lots;
  const currentLot = lots.find((l) => l.id === selectedLotId) || lots[0];
  const allTasks = db.getLotTasks(selectedLotId);
  const lotDocuments = db.documents.filter((d) => d.lotId === selectedLotId || d.lotId === 'GLOBAL');
  const lotHouseholds = db.households.filter((h) => h.lotId === selectedLotId);
  const lotGrievances = db.grievances.filter((g) => g.lotId === selectedLotId);

  // Filtrage des Tâches
  const filteredTasks = allTasks.filter((t) => {
    const matchCorps = taskCorpsFilter === 'all' || t.corpsEtat === taskCorpsFilter;
    const matchStatus = taskStatusFilter === 'all' || t.status === taskStatusFilter;
    return matchCorps && matchStatus;
  });

  // Filtrage des Documents
  const filteredDocuments = lotDocuments.filter((d) => {
    const matchActor = docActorFilter === 'all' || d.authorLetter === docActorFilter;
    const rev = d.revisions[0];
    const fileName = (rev?.fileName || '').toLowerCase();
    let format = 'PDF';
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || d.typeCode === 'METRE' || d.typeCode === 'BPU') format = 'EXCEL';
    else if (fileName.endsWith('.jpg') || fileName.endsWith('.png') || fileName.endsWith('.jpeg')) format = 'IMAGE';
    else if (fileName.endsWith('.dwg') || fileName.endsWith('.dxf') || d.category === 'PLN') format = 'AUTOCAD';

    const matchFormat = docFormatFilter === 'all' || format === docFormatFilter;
    return matchActor && matchFormat;
  });

  // Calcul des Deadlines (Jours restants)
  const getDaysRemaining = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr).getTime();
    const now = new Date('2026-10-11T12:00:00').getTime();
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Actions de Validation
  const handleOpenValidation = (task: LotTask) => {
    setSelectedTaskToValidate(task);
    setValidationVisa('A');
    setValidationRemarks('');
    setValidationOrderNumber(`OS-RN13-${task.lotId}-${Date.now().toString().slice(-3)}`);
    setIsValidationModalOpen(true);
  };

  const handleSubmitValidation = () => {
    if (!selectedTaskToValidate) return;

    if (currentUser.actor === 'moe' || currentUser.actor === 'amo') {
      db.validateLotTaskMoe(selectedTaskToValidate.id, validationVisa, validationRemarks, currentUser);
      toast.success(`Visa technique ${validationVisa} accordé par la Mission de Contrôle.`);
    } else if (currentUser.actor === 'mo') {
      db.approveLotTaskMo(selectedTaskToValidate.id, validationOrderNumber, currentUser);
      toast.success(`Tâche approuvée définitivement par le Maître d'Ouvrage (Ordre ${validationOrderNumber}).`);
    } else {
      toast.info('Seule la Maîtrise d\'œuvre (Visa) ou le Maître d\'ouvrage (Approbation) peut valider.');
    }
    setIsValidationModalOpen(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error('Veuillez spécifier le titre de la tâche.');
      return;
    }

    const taskCount = allTasks.length + 1;
    const newTask = db.addLotTask(
      {
        lotId: selectedLotId,
        code: `TSK-${selectedLotId}-${String(taskCount).padStart(2, '0')}`,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || 'Tâche contractuelle du lot routier sous contrôle MOE.',
        phase: 'Execution',
        corpsEtat: newTaskCorps,
        assignedActor: newTaskActor,
        assignedActorLabel:
          newTaskActor === 'E'
            ? 'Entreprise de Travaux'
            : newTaskActor === 'D'
            ? 'Maîtrise d\'Œuvre (SCET)'
            : newTaskActor === 'B'
            ? 'Maître d\'Ouvrage (DGPC)'
            : newTaskActor === 'C'
            ? 'AMO'
            : 'Bailleur de Fonds',
        deadline: new Date(newTaskDeadline).toISOString(),
        status: 'Soumis_Controle',
        moeValidation: { validated: false },
        moValidation: { approved: false },
        linkedDocumentsCount: 1,
        isMilestoneCritical: true,
        citizenImpactSummary: newTaskCitizenImpact.trim() || undefined,
        fileFormatSample: newTaskFormat,
      },
      currentUser
    );

    toast.success(`Nouvelle tâche créée : ${newTask.code}`);
    setIsNewTaskModalOpen(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  // Téléchargement réel contextuel (Excel, PDF, DWG, Image)
  const handleDownloadSampleFile = (title: string, format: string, code: string) => {
    const ext = format === 'EXCEL' ? 'xlsx' : format === 'AUTOCAD' ? 'dwg' : format === 'IMAGE' ? 'jpg' : 'pdf';
    const content = `================================================================================
RÉPUBLIQUE TUNISIENNE — MINISTÈRE DE L'ÉQUIPEMENT ET DE L'HABITAT
DIRECTION GÉNÉRALE DES PONTS ET CHAUSSÉES (DGPC)
PROJET DE DÉDOUBLEMENT DE LA RN13 EN 2x2 VOIES (SFAX — KASSERINE)
================================================================================
SOUS-PROJET : ${currentLot.name} (${currentLot.code})
RÉFÉRENCE PIÈCE : ${code}
INTITULÉ : ${title}
FORMAT CERTIFIÉ : ${format} (Extension .${ext})
DATE DE GÉNÉRATION : ${new Date().toLocaleString('fr-FR')}
SIGNATAIRE / CONTRÔLE : Groupement SCET-Tunisie (MOE) & DGPC (MO)

--------------------------------------------------------------------------------
DONNÉES DU CORPS D'ÉTAT & ATTACHEMENTS CONTRADICTOIRES :
- Section linéaire : PK ${currentLot.pkStart} à PK ${currentLot.pkEnd} (${currentLot.linearKm} km)
- Budget alloué : ${(currentLot.budgetTnd || 0).toLocaleString()} TND
- Entreprise titulaire : ${currentLot.contractorName}
- Mission de contrôle : ${currentLot.supervisorName}
- Conformité de compactage : Minimum 98% Optimum Proctor Modifié (OPM)
- Norme environnementale : ESS5 Banque Mondiale (Libération d'emprise préalable)
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${code}_${title.slice(0, 20).replace(/\s+/g, '_')}.${ext === 'xlsx' ? 'txt' : ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Fichier ${format} téléchargé : ${link.download}`);
  };

  const needContent: NeedPanelContent = {
    screenId: 'lots-management',
    title: 'Gestion des Sous-Projets par Lot & Multi-Lots RN13',
    purpose: 'Chaque lot routier constitue un sous-projet contractuel autonome doté de son marché, de ses tâches, de ses pièces techniques déposées par les 5 acteurs (A, B, C, D, E), de son calendrier avec deadlines et de ses liens directs avec les citoyens riverains.',
    actors: [
      { letter: 'E', actorName: 'Entreprise de Travaux', action: 'Dépose les attachements métrés (Excel), plans d\'exécution (DWG) et réalise les tâches du lot.' },
      { letter: 'D', actorName: 'Mission de Contrôle (MOE)', action: 'Vérifie les tolérances, contrôle les essais labo et délivre le Visa technique (A, B, C).' },
      { letter: 'B', actorName: 'Maître d\'Ouvrage (DGPC)', action: 'Donne l\'approbation définitive, émet les ordres de service et ordonne les paiements.' },
      { letter: 'C', actorName: 'AMO', action: 'Assure le suivi de complétude des livrables et la cohérence multi-lots.' },
      { letter: 'A', actorName: 'Bailleur (Banque Mondiale)', action: 'Émet les Avis de Non-Objection (ANO) et contrôle la conformité des indemnisations riveraines.' },
    ],
    donorRequirement: 'Norme FIDIC & Banque Mondiale ESS5 : Double approbation obligatoire (MOE + MO) sur chaque tâche critique avant déblocage des décomptes et interdiction de travaux sans indemnisation préalable des citoyens.',
    seeAlso: [
      { label: 'Suivi des Arrêts Linéaires (PK)', href: '#/execution/blocages' },
      { label: 'Foncier & Indemnisations du PAR', href: '#/social/par' },
      { label: 'Décomptes Mensuels (IPC)', href: '#/execution/decomptes' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        {/* En-tête */}
        <PageHeader
          title="Sous-Projets par Lot Routier & Traçabilité Multi-Lots"
          subtitle="Gérez chaque lot comme un projet complet : pièces des 5 parties prenantes, deadlines, validations doubles (MOE & MO) et relations citoyens."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('multilots')}
                className="text-xs font-bold gap-1.5"
              >
                <Layers className="h-4 w-4 text-sky-500" />
                <span>Vue Transversale Multi-Lots</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsNewTaskModalOpen(true)}
                className="text-xs font-bold bg-primary text-primary-foreground gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Créer une Tâche sur ce Lot</span>
              </Button>
            </div>
          }
        />

        {/* --- SÉLECTEUR DE SOUS-PROJET (LOT ROUTIER) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {lots.map((lot) => {
            const isSelected = selectedLotId === lot.id;
            const lotTasksCount = db.getLotTasks(lot.id).length;
            const lotBlockedCount = db.getLotTasks(lot.id).filter((t) => t.status === 'Bloque').length;

            return (
              <Card
                key={lot.id}
                onClick={() => {
                  setSelectedLotId(lot.id);
                  if (outletContext?.onSelectLot) outletContext.onSelectLot(lot.id);
                }}
                className={`cursor-pointer transition-all border p-4 rounded-xl relative overflow-hidden ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/40 bg-card hover:bg-muted/30'
                }`}
              >
                {/* Ruban de phase */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-primary text-primary-foreground">
                      {lot.id}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-semibold border-border">
                      {lot.phase}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground">
                    PK {lot.pkStart} → {lot.pkEnd}
                  </span>
                </div>

                <h4 className="font-extrabold text-xs sm:text-sm text-foreground line-clamp-1 mb-1">
                  {lot.name}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">
                  {lot.description || 'Sous-projet routier autonome de dédoublement 2x2 voies.'}
                </p>

                {/* Métriques clés */}
                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-border/80 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Budget :</span>
                    <span className="font-bold font-mono text-foreground">
                      {Math.round((lot.budgetTnd || 180000000) / 1000000)} MDT
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Tâches :</span>
                    <span className="font-bold text-foreground flex items-center gap-1">
                      {lotTasksCount}
                      {lotBlockedCount > 0 && (
                        <span className="text-rose-600 text-[10px] font-extrabold">({lotBlockedCount} bloq.)</span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Avanc. Phys. :</span>
                    <span className="font-bold text-emerald-600 font-mono">
                      {lot.progressPhysicalPct}%
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* --- CARTE D'IDENTITÉ DU SOUS-PROJET SÉLECTIONNÉ --- */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-primary text-primary-foreground text-xs font-mono">
                  Sous-Projet {currentLot.code}
                </Badge>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  {currentLot.name}
                </h3>
                <Badge variant="outline" className="text-xs font-bold border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                  Gouvernorat : {currentLot.governorate || 'Centre-Ouest'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Linéaire : {currentLot.linearKm} km • Budget Marché : {(currentLot.budgetTnd || 0).toLocaleString()} TND • Délai : {currentLot.contractStartDate} au {currentLot.revisedEndDate || currentLot.contractEndDate}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Avancement Global
                </span>
                <span className="text-base font-black text-emerald-600 font-mono">
                  {currentLot.progressPhysicalPct}% Physique • {currentLot.progressFinancialPct}% Financier
                </span>
              </div>
            </div>
          </div>

          {/* Acteurs du Lot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">
                🏗️ Entreprise Adjudicataire (E)
              </span>
              <p className="font-bold text-foreground truncate">{currentLot.contractorName}</p>
              <p className="text-[10px] text-muted-foreground">{currentLot.contractorInfo?.director || 'Direction Travaux'}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">
                📐 Mission de Contrôle (MOE - D)
              </span>
              <p className="font-bold text-foreground truncate">{currentLot.supervisorName}</p>
              <p className="text-[10px] text-muted-foreground">{currentLot.supervisorInfo?.missionChief || 'Chef de Mission'}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">
                🏛️ Maître d'Ouvrage (MO - B)
              </span>
              <p className="font-bold text-foreground truncate">DGPC / Ministère Équipement</p>
              <p className="text-[10px] text-muted-foreground">Hichem Gharbi (Directeur Projet)</p>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
              <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">
                👥 Volet Citoyens & Foncier (PAR)
              </span>
              <p className="font-bold text-emerald-600">
                {currentLot.citizenStats?.indemnifiedCount || 45} / {currentLot.citizenStats?.householdsCount || 48} indemnisés
              </p>
              <p className="text-[10px] text-muted-foreground">
                {(currentLot.citizenStats?.oliveTreesIndemnified || 13850).toLocaleString()} oliviers compensés
              </p>
            </div>
          </div>
        </div>

        {/* --- ONGLETS PRINCIPAUX DU SOUS-PROJET --- */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-muted/60">
            <TabsTrigger value="taches" className="text-xs font-bold py-2 gap-1.5">
              <CheckSquare className="h-4 w-4" />
              <span>Tâches & Validations ({allTasks.length})</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs font-bold py-2 gap-1.5">
              <FolderTree className="h-4 w-4" />
              <span>Documents des 5 Acteurs ({lotDocuments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="citoyens" className="text-xs font-bold py-2 gap-1.5">
              <Users className="h-4 w-4" />
              <span>Volet Citoyens & Riverains</span>
            </TabsTrigger>
            <TabsTrigger value="multilots" className="text-xs font-bold py-2 gap-1.5">
              <Layers className="h-4 w-4" />
              <span>Coordination Multi-Lots</span>
            </TabsTrigger>
          </TabsList>

          {/* ========================================================================= */}
          {/* ONGLET 1 : TÂCHES, JALONS, DEADLINES & DOUBLE VALIDATION                   */}
          {/* ========================================================================= */}
          <TabsContent value="taches" className="space-y-4">
            {/* Barre de filtres */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <span className="text-xs font-bold text-muted-foreground">Corps d'état :</span>
                <select
                  value={taskCorpsFilter}
                  onChange={(e) => setTaskCorpsFilter(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground cursor-pointer"
                >
                  <option value="all">Tous les corps d'état</option>
                  <option value="Terrassements">Terrassements</option>
                  <option value="Ouvrages">Ouvrages d'Art / Dalots</option>
                  <option value="Chaussees">Chaussées / Enrobés</option>
                  <option value="Assainissement">Assainissement</option>
                  <option value="Foncier">Foncier & Emprise</option>
                  <option value="HSE">HSE & Sécurité</option>
                </select>

                <span className="text-xs font-bold text-muted-foreground ml-2">Statut :</span>
                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground cursor-pointer"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="Soumis_Controle">En contrôle MOE</option>
                  <option value="Vise_MOE">Visé MOE (Attente MO)</option>
                  <option value="Approuve_MO">Approuvé par MO</option>
                  <option value="Bloque">Bloqué / Réserves</option>
                  <option value="A_Faire">À faire</option>
                </select>
              </div>

              <span className="text-xs font-semibold text-muted-foreground">
                {filteredTasks.length} tâche(s) affichée(s)
              </span>
            </div>

            {/* Liste des Tâches */}
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const daysRemaining = getDaysRemaining(task.deadline);
                const isOverdue = daysRemaining < 0;
                const isNearDue = daysRemaining >= 0 && daysRemaining <= 3;

                return (
                  <Card
                    key={task.id}
                    className={`p-4 border transition-all rounded-xl ${
                      task.status === 'Bloque'
                        ? 'border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20'
                        : task.status === 'Approuve_MO'
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Partie Gauche : Infos Tâche */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border">
                            {task.code}
                          </span>
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            {task.corpsEtat}
                          </Badge>
                          <ActorChip actorLetter={task.assignedActor} name={task.assignedActorLabel} size="sm" />
                          {task.isMilestoneCritical && (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] border-amber-300">
                              Jalon Critique
                            </Badge>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-foreground">
                          {task.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {task.description}
                        </p>

                        {/* Lien Citoyen si présent */}
                        {task.citizenImpactSummary && (
                          <div className="p-2 rounded bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-800 dark:text-sky-300 flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                            <span><strong>Impact Citoyen / Riverains :</strong> {task.citizenImpactSummary}</span>
                          </div>
                        )}

                        {/* Circuit de Double Validation */}
                        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
                          {/* 1. Validation MOE */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-muted-foreground">
                              1. Contrôle MOE :
                            </span>
                            {task.moeValidation.validated ? (
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-none font-bold text-[10px]">
                                ✓ Visé (Visa {task.moeValidation.visa || 'A'}) • {task.moeValidation.validatedBy}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-700 dark:text-amber-400 border-amber-300 text-[10px]">
                                ⏳ En cours d'instruction
                              </Badge>
                            )}
                          </div>

                          {/* 2. Validation MO */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-muted-foreground">
                              2. Approbation MO :
                            </span>
                            {task.moValidation.approved ? (
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-none font-bold text-[10px]">
                                ✓ Approuvé DGPC • {task.moValidation.orderNumber}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground text-[10px]">
                                ⏳ En attente Visa MOE
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Partie Droite : Deadlines & Actions */}
                      <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                            Échéance Contractuelle
                          </span>
                          <div className="flex items-center gap-1.5 justify-end">
                            <Clock className={`h-3.5 w-3.5 ${isOverdue ? 'text-rose-600 animate-pulse' : isNearDue ? 'text-amber-500' : 'text-muted-foreground'}`} />
                            <span className={`font-mono text-xs font-bold ${isOverdue ? 'text-rose-600' : isNearDue ? 'text-amber-600' : 'text-foreground'}`}>
                              {new Date(task.deadline).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold ${isOverdue ? 'text-rose-600' : isNearDue ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            {isOverdue ? `En retard de ${Math.abs(daysRemaining)} jour(s)` : `${daysRemaining} jour(s) restants`}
                          </span>
                        </div>

                        {/* Bouton de Validation selon le rôle */}
                        <div className="flex items-center gap-1.5">
                          {task.fileFormatSample && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadSampleFile(task.title, task.fileFormatSample || 'PDF', task.code)}
                              className="text-xs h-7 gap-1 px-2"
                              title={`Télécharger le livrable technique associé (${task.fileFormatSample})`}
                            >
                              <Download className="h-3 w-3" />
                              <span className="font-mono text-[10px]">{task.fileFormatSample}</span>
                            </Button>
                          )}

                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleOpenValidation(task)}
                            className="text-xs h-7 font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Statuer / Valider</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* ONGLET 2 : DOCUMENTS DU LOT PAR PARTIE PRENANTE (5 ACTEURS & MULTI-FORMATS)*/}
          {/* ========================================================================= */}
          <TabsContent value="documents" className="space-y-4">
            {/* Filtres par Acteur et par Format */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-muted-foreground">Partie Prenante :</span>
                <select
                  value={docActorFilter}
                  onChange={(e) => setDocActorFilter(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground cursor-pointer"
                >
                  <option value="all">Tous les acteurs (A, B, C, D, E)</option>
                  <option value="E">Acteur E — Entreprise (Travaux / Métrés)</option>
                  <option value="D">Acteur D — Maîtrise d'Œuvre (Visas / Labo)</option>
                  <option value="B">Acteur B — Maître d'Ouvrage (OS / Mandats)</option>
                  <option value="C">Acteur C — AMO (Audits / Complétude)</option>
                  <option value="A">Acteur A — Bailleur (Banque Mondiale)</option>
                </select>

                <span className="text-xs font-bold text-muted-foreground ml-2">Format de fichier :</span>
                <select
                  value={docFormatFilter}
                  onChange={(e) => setDocFormatFilter(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground cursor-pointer"
                >
                  <option value="all">Tous les formats (Excel, PDF, Images, DWG)</option>
                  <option value="EXCEL">Excel (.xlsx, .xls) — Métrés & BPU</option>
                  <option value="PDF">PDF (.pdf) — Pièces contractuelles</option>
                  <option value="IMAGE">Images (.jpg, .png) — Photos Chantier</option>
                  <option value="AUTOCAD">AutoCAD (.dwg) — Plans DAO</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/documents/new')}
                className="text-xs h-8 gap-1.5 font-bold"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Téléverser sur ce Lot</span>
              </Button>
            </div>

            {/* Grille des Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDocuments.map((doc) => {
                const rev = doc.revisions[0];
                const fileName = rev?.fileName || `${doc.code}.pdf`;
                const isExcel = fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls');
                const isImage = fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.png');
                const isDwg = fileName.toLowerCase().endsWith('.dwg') || doc.category === 'PLN';

                return (
                  <Card
                    key={doc.id}
                    className="p-3.5 border border-border bg-card hover:bg-muted/20 transition-all rounded-xl flex items-start gap-3"
                  >
                    {/* Icône selon format */}
                    <div className="p-2.5 rounded-lg shrink-0 mt-0.5" style={{
                      backgroundColor: isExcel ? '#dcfce7' : isImage ? '#f3e8ff' : isDwg ? '#e0f2fe' : '#fee2e2',
                      color: isExcel ? '#15803d' : isImage ? '#7e22ce' : isDwg ? '#0369a1' : '#b91c1c'
                    }}>
                      {isExcel ? <FileSpreadsheet className="h-5 w-5" /> : isImage ? <Image className="h-5 w-5" /> : isDwg ? <Compass className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <DocCode code={doc.code} />
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                          {isExcel ? 'EXCEL' : isImage ? 'IMAGE' : isDwg ? 'DWG' : 'PDF'}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-foreground line-clamp-1">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        Fichier : {fileName} • {doc.categoryLabel}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <ActorChip actorLetter={doc.authorLetter} name={doc.authorName} size="sm" />
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDownloadSampleFile(doc.title, isExcel ? 'EXCEL' : isImage ? 'IMAGE' : isDwg ? 'AUTOCAD' : 'PDF', doc.code)}
                            title="Télécharger la pièce scellée"
                          >
                            <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => navigate(`/documents/${doc.id}`)}
                            title="Consulter le document"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* ONGLET 3 : VOLET CITOYENS & RIVERAINS DU LOT                              */}
          {/* ========================================================================= */}
          <TabsContent value="citoyens" className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <h4 className="font-extrabold text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                Interactions Citoyennes & Droits des Riverains sur le Lot {currentLot.id}
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Ce sous-projet traverse le gouvernorat de <strong>{currentLot.governorate}</strong>. Conformément aux exigences de la Banque Mondiale (Norme ESS5 & MGP), chaque citoyen touché par le tracé fait l'objet d'un dossier d'indemnisation formalisé, et chaque réclamation est traitée dans un délai maximal de 7 jours.
              </p>
            </div>

            {/* Métriques Citoyens */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-border bg-card">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">Familles Expropriées</span>
                <span className="text-2xl font-black text-foreground">
                  {currentLot.citizenStats?.indemnifiedCount} / {currentLot.citizenStats?.householdsCount}
                </span>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  94% d'accords amiables signés
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">Oliviers Indemnisés (450 DT)</span>
                <span className="text-2xl font-black text-emerald-600 font-mono">
                  {(currentLot.citizenStats?.oliveTreesIndemnified || 0).toLocaleString()}
                </span>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Sur un total recensé de {(currentLot.citizenStats?.oliveTreesCount || 14200).toLocaleString()} arbres
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">Plaintes Riverains (MGP)</span>
                <span className="text-2xl font-black text-foreground">
                  {currentLot.citizenStats?.resolvedGrievances} résolues
                </span>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">
                  {currentLot.citizenStats?.openGrievances} réclamation(s) en cours de médiation
                </p>
              </div>
            </div>

            {/* Liste des Plaintes Citoyennes du Lot */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Registre des Plaintes & Doléances Citoyennes sur le Tracé du Lot</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/social/plaintes')}
                  className="text-xs h-7"
                >
                  Ouvrir Mécanisme MGP Complet
                </Button>
              </h4>

              <div className="space-y-2">
                {lotGrievances.slice(0, 4).map((g) => (
                  <div
                    key={g.id}
                    className="p-3 rounded-lg border border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">{g.number}</span>
                        <Badge variant="outline" className="text-[10px]">{g.category}</Badge>
                        <span className="text-muted-foreground text-[10px]">PK {g.pk}</span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">{g.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={g.status === 'Cloturee' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                        {g.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/social/plaintes')}
                        className="text-xs h-7 text-primary"
                      >
                        Traiter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* ONGLET 4 : COORDINATION TRANSVERSALE MULTI-LOTS                            */}
          {/* ========================================================================= */}
          <TabsContent value="multilots" className="space-y-4">
            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-2">
              <h4 className="font-extrabold text-sky-900 dark:text-sky-200 text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-sky-600" />
                Logique Métier Inter-Lots & Consolidation du Corridor RN13 (181 km)
              </h4>
              <p className="text-xs text-sky-800 dark:text-sky-300 leading-relaxed">
                Le corridor autoroutier RN13 nécessite une synchronisation continue entre les 3 lots : fourniture centralisée des enrobés bitumineux, approvisionnement depuis la carrière de Jebel Oust, et consolidation des rapports pour le conseil d'administration de la Banque Mondiale.
              </p>
            </div>

            {/* Matrice Comparative des Lots */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                  Tableau Comparatif des Sous-Projets Routiers RN13
                </h4>
              </div>

              <div className="divide-y divide-border text-xs">
                {lots.map((l) => (
                  <div key={l.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-primary text-primary-foreground">
                          {l.id}
                        </span>
                        <h4 className="font-bold text-sm text-foreground">{l.name}</h4>
                        <Badge variant="outline">{l.phase}</Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        Entreprise : {l.contractorName} • Mission : {l.supervisorName}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-sans">Budget</span>
                        <span className="font-bold text-foreground">
                          {Math.round((l.budgetTnd || 0) / 1000000)} MDT
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-sans">Avanc. Physique</span>
                        <span className="font-bold text-emerald-600">{l.progressPhysicalPct}%</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLotId(l.id);
                          setActiveTab('taches');
                        }}
                        className="text-xs h-8 gap-1"
                      >
                        <span>Ouvrir Cockpit</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NeedPanel content={needContent} />

      {/* --- MODAL CRÉATION DE NOUVELLE TÂCHE DE LOT --- */}
      <Dialog open={isNewTaskModalOpen} onOpenChange={setIsNewTaskModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Créer une Nouvelle Tâche pour le Lot {selectedLotId}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Définissez la tâche, son acteur responsable, son échéance contractuelle et son livrable technique.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-3.5 pt-2">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Intitulé de la Tâche *
              </label>
              <Input
                type="text"
                placeholder="Ex: Couche d'enrobé BB 0/14 du PK 8+000 au 11+000..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Description Technique & Prescriptions
              </label>
              <textarea
                rows={2}
                placeholder="Précisez les exigences CCTP, contrôles labo ou contraintes particulières..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Corps d'État *
                </label>
                <select
                  value={newTaskCorps}
                  onChange={(e) => setNewTaskCorps(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground cursor-pointer"
                >
                  <option value="Terrassements">Terrassements</option>
                  <option value="Ouvrages">Ouvrages / Dalots</option>
                  <option value="Chaussees">Chaussées</option>
                  <option value="Assainissement">Assainissement</option>
                  <option value="Foncier">Foncier</option>
                  <option value="HSE">HSE</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Acteur Responsable *
                </label>
                <select
                  value={newTaskActor}
                  onChange={(e) => setNewTaskActor(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground cursor-pointer"
                >
                  <option value="E">Acteur E — Entreprise Travaux</option>
                  <option value="D">Acteur D — Maîtrise d'Œuvre (SCET)</option>
                  <option value="B">Acteur B — Maître d'Ouvrage (DGPC)</option>
                  <option value="C">Acteur C — AMO</option>
                  <option value="A">Acteur A — Bailleur</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Date Limite (Deadline) *
                </label>
                <Input
                  type="date"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Format du Fichier Associé
                </label>
                <select
                  value={newTaskFormat}
                  onChange={(e) => setNewTaskFormat(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground cursor-pointer"
                >
                  <option value="EXCEL">Excel (.xlsx) — Métrés / BPU</option>
                  <option value="PDF">PDF (.pdf) — Document Officiel</option>
                  <option value="IMAGE">Image (.jpg) — Photo Chantier</option>
                  <option value="AUTOCAD">AutoCAD (.dwg) — Plan DAO</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Impact Citoyen / Riverains (Optionnel)
              </label>
              <Input
                type="text"
                placeholder="Ex: Déviation riveraine, coupure d'accès agricole temporaire..."
                value={newTaskCitizenImpact}
                onChange={(e) => setNewTaskCitizenImpact(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewTaskModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" size="sm" className="font-bold bg-primary text-primary-foreground">
                Créer la Tâche
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL STATUER / VALIDER LA TÂCHE (DOUBLE VALIDATION) --- */}
      <Dialog open={isValidationModalOpen} onOpenChange={setIsValidationModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Circuit de Validation Contradictoire de la Tâche
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedTaskToValidate?.code} — {selectedTaskToValidate?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            {/* Si MOE ou AMO : Visa Technique */}
            {(currentUser.actor === 'moe' || currentUser.actor === 'amo') && (
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300">
                  <p className="font-bold">Étape 1 : Visa Technique de la Mission de Contrôle (MOE)</p>
                  <p className="text-[11px] mt-0.5">Apposez votre visa technique contradictoire après contrôle des essais et métrés.</p>
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">Choix du Visa *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setValidationVisa('A')}
                      className={`p-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                        validationVisa === 'A'
                          ? 'border-emerald-600 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-600/30'
                          : 'border-border bg-card hover:bg-muted'
                      }`}
                    >
                      Visa A (Bon)
                    </button>
                    <button
                      type="button"
                      onClick={() => setValidationVisa('B')}
                      className={`p-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                        validationVisa === 'B'
                          ? 'border-amber-600 bg-amber-100 text-amber-800 ring-2 ring-amber-600/30'
                          : 'border-border bg-card hover:bg-muted'
                      }`}
                    >
                      Visa B (Réserves)
                    </button>
                    <button
                      type="button"
                      onClick={() => setValidationVisa('C')}
                      className={`p-2 rounded-lg border text-center font-bold transition-all cursor-pointer ${
                        validationVisa === 'C'
                          ? 'border-rose-600 bg-rose-100 text-rose-800 ring-2 ring-rose-600/30'
                          : 'border-border bg-card hover:bg-muted'
                      }`}
                    >
                      Visa C (Refusé)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">Remarques & Observations du Contrôle</label>
                  <textarea
                    rows={2}
                    placeholder="Indiquez les tolérances mesurées, conformité des essais à la plaque ou réserves..."
                    value={validationRemarks}
                    onChange={(e) => setValidationRemarks(e.target.value)}
                    className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Si MO : Approbation Finale */}
            {currentUser.actor === 'mo' && (
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  <p className="font-bold">Étape 2 : Approbation Définitive du Maître d'Ouvrage (DGPC)</p>
                  <p className="text-[11px] mt-0.5">En tant que Maître d'Ouvrage, validez formellement l'achèvement de la tâche ou ordonnez le paiement.</p>
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">Référence d'Ordre de Service ou Mandat *</label>
                  <Input
                    type="text"
                    value={validationOrderNumber}
                    onChange={(e) => setValidationOrderNumber(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>
              </div>
            )}

            {/* Si Entreprise ou Bailleur */}
            {currentUser.actor !== 'mo' && currentUser.actor !== 'moe' && currentUser.actor !== 'amo' && (
              <div className="p-3 rounded-lg bg-muted border text-muted-foreground text-center">
                Seule la Maîtrise d'Œuvre (SCET) ou le Maître d'Ouvrage (DGPC) peut statuer sur cette étape.
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsValidationModalOpen(false)}>
              Fermer
            </Button>
            {(currentUser.actor === 'mo' || currentUser.actor === 'moe' || currentUser.actor === 'amo') && (
              <Button size="sm" onClick={handleSubmitValidation} className="font-bold bg-primary text-primary-foreground">
                Confirmer la Validation
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
