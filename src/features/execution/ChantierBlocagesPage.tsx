import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { RoadSectionStop, SectionWorkState } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  HardHat,
  FileText,
  Clock,
  MapPin,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Plus,
  RefreshCw,
  FileCheck,
  Building2,
  TreeDeciduous,
  Activity,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

export const ChantierBlocagesPage: React.FC = () => {
  const { currentUser } = useSession();
  const [stops, setStops] = useState<RoadSectionStop[]>(() => [...db.roadStops]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Modales
  const [selectedSection, setSelectedSection] = useState<RoadSectionStop | null>(null);
  const [isRestartOpen, setIsRestartOpen] = useState(false);
  const [isNewStopOpen, setIsNewStopOpen] = useState(false);

  // Formulaire Arrêt
  const [newLotId, setNewLotId] = useState('L01');
  const [newPkStart, setNewPkStart] = useState('18+500');
  const [newPkEnd, setNewPkEnd] = useState('19+200');
  const [newTitle, setNewTitle] = useState('Section Oued Rmel — Franchissement PK 18+500');
  const [newWork, setNewWork] = useState<'Terrassements (Déblais/Remblais)' | 'Ouvrage Hydraulique (Dalot)' | 'Couche de Fondation (GNT)' | 'Enrobé Bitumineux'>('Terrassements (Déblais/Remblais)');
  const [newReason, setNewReason] = useState<'Litige Foncier / Parcelle non libérée' | 'Intempéries / Crue d\'Oued' | 'Réseau Concessionnaire (SONEDE/STEG)' | 'Non-Conformité Critique (Béton non résistant)' | 'Enquête Accident HSE'>('Litige Foncier / Parcelle non libérée');
  const [newOsNumber, setNewOsNumber] = useState(`OS-RN13-2026-00${db.serviceOrders.length + 1}`);

  const canManage =
    currentUser.actor === 'mo' ||
    currentUser.actor === 'moe' ||
    currentUser.subRole === 'admin';

  // Statistiques
  const totalSections = stops.length;
  const stoppedSections = stops.filter((s) => s.state === 'ArreteBloque').length;
  const slowedSections = stops.filter((s) => s.state === 'Ralenti').length;
  const activeSections = stops.filter((s) => s.state === 'EnCours').length;
  const totalDaysStopped = stops.reduce((sum, s) => sum + (s.daysStopped || 0), 0);

  // Filtrage
  const filtered = stops.filter((s) => {
    if (selectedFilter === 'all') return true;
    return s.state === selectedFilter;
  });

  const handleOpenRestart = (sec: RoadSectionStop) => {
    setSelectedSection(sec);
    setIsRestartOpen(true);
  };

  const handleConfirmRestart = () => {
    if (!selectedSection) return;
    const osNum = `OS-REPRISE-2026-00${db.serviceOrders.length + 1}`;
    db.restartRoadSection(selectedSection.id, osNum, currentUser);
    setStops([...db.roadStops]);
    setIsRestartOpen(false);
    toast.success(`Ordre de Service ${osNum} émis ! Les travaux reprennent sur la section PK ${selectedSection.pkStart} à ${selectedSection.pkEnd}.`);
  };

  const handleCreateStop = () => {
    const newStop: RoadSectionStop = {
      id: `sec-${Date.now().toString(36)}`,
      lotId: newLotId,
      pkStart: newPkStart,
      pkEnd: newPkEnd,
      title: newTitle,
      currentWork: newWork,
      state: 'ArreteBloque',
      stopReason: newReason,
      stopDate: new Date().toISOString().slice(0, 10),
      daysStopped: 1,
      activeOsNumber: newOsNumber,
      allConditionsMet: false,
      requiredConditionsToRestart: [
        'Élimination complète du fait générateur d\'arrêt',
        'Constat contradictoire dressé par la MOE (SCET-Tunisie)',
        'Signature de l\'Ordre de Service de reprise par le Ministère (DGPC)',
      ],
      contractorName: 'Soroubat BTP',
      supervisorName: 'SCET-Tunisie',
    };

    // Créer également l'OS d'arrêt dans la base
    db.addServiceOrder(
      {
        id: `os-${Date.now().toString(36)}`,
        number: newOsNumber,
        type: 'ArretPartiel',
        title: `Ordre de Service d'Arrêt — Section PK ${newPkStart} à ${newPkEnd}`,
        lotId: newLotId,
        pkRange: `PK ${newPkStart} à ${newPkEnd}`,
        dateNotification: new Date().toISOString().slice(0, 10),
        signatory: `${currentUser.fullName} (${currentUser.actorLetter})`,
        reason: newReason,
        impactDelayDays: 1,
        status: 'EnExecution',
        fileName: `${newOsNumber}.pdf`,
      },
      currentUser
    );

    db.stopRoadSection(newStop.id, newReason, newOsNumber, currentUser);
    setStops([...db.roadStops, newStop]);
    setIsNewStopOpen(false);
    toast.error(`Arrêt de chantier notifié sous ${newOsNumber} pour le PK ${newPkStart} ! Section verrouillée.`);
  };

  const needContent: NeedPanelContent = {
    screenId: 'execution-blocages',
    title: "Suivi Linéaire du Tracé & Postes d'Arrêt (Où s'arrêter ?)",
    purpose: 'Ce cockpit permet de visualiser précisément où le chantier est arrêté sur les 181 km du tracé de la RN13, d\'identifier le motif exact du blocage (foncier, crues d\'oued, réseaux d\'eau, qualité du béton), et de vérifier les conditions requises avant d\'autoriser la reprise sous Ordre de Service (OS).',
    actors: [
      { letter: 'B', actorName: 'Maître d\'ouvrage (DGPC)', action: 'Notifie les Ordres de Service d\'arrêt ou de reprise et instruit les avenants de délai.' },
      { letter: 'D', actorName: 'Mission de Contrôle (MOE)', action: 'Émet les constats contradictoires d\'intempéries, audite les non-conformités et vérifie la levée des réserves.' },
      { letter: 'E', actorName: 'Entreprise Travaux', action: 'Déclare les contraintes bloquantes et applique strictement les consignes d\'arrêt des engins.' },
      { letter: 'A', actorName: 'Bailleur (Banque Mondiale)', action: 'Exige que tout retard de chemin critique supérieur à 30 jours fasse l\'objet d\'une notification officielle.' },
    ],
    donorRequirement: 'Gestion transparente des claims et traçabilité contractuelle inviolable pour éviter tout litige financier post-chantier.',
    seeAlso: [
      { label: 'Foncier & Indemnisations (PAR)', href: '#/social/par' },
      { label: 'Registre des Ordres de Service (OS)', href: '#/execution/os' },
      { label: 'Contrôle Qualité & Fiches NCR', href: '#/execution/qualite' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="État Linéaire du Tracé & Postes d'Arrêt de Chantier"
          description="Visualisation synoptique du linéaire RN13 (181 km) : localisation précise des sections arrêtées (PK), causes de blocage et conditions préalables à la reprise."
          actions={
            canManage && (
              <Button
                onClick={() => setIsNewStopOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5 shadow-sm"
              >
                <AlertTriangle className="h-4 w-4" />
                Déclarer un arrêt de section (OS)
              </Button>
            )
          }
        />

        {/* 4 Indicateurs Clés d'État du Chantier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Sections arrêtées (Bloquées)</p>
                <p className="text-xl font-black text-rose-600">{stoppedSections} section(s)</p>
                <p className="text-[10px] text-muted-foreground">{totalDaysStopped} jours d'arrêt cumulés</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Sections ralenties</p>
                <p className="text-xl font-black text-amber-600">{slowedSections} section(s)</p>
                <p className="text-[10px] text-muted-foreground">Réseaux concessionnaires</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <Unlock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Sections actives (En cours)</p>
                <p className="text-xl font-black text-emerald-600">{activeSections} section(s)</p>
                <p className="text-[10px] text-emerald-700 font-semibold">Terrassements autorisés</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Ordres de Service (OS)</p>
                <p className="text-xl font-black text-foreground">{db.serviceOrders.length} émis</p>
                <p className="text-[10px] text-muted-foreground">Dont 1 avenant de délai</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barre de synoptique visuel du tracé */}
        <Card className="border-border p-4 bg-card shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-primary" />
              Synoptique Visuel Linéaire du Tracé (PK 0+000 à PK 28+000)
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> En cours
              </span>
              <span className="flex items-center gap-1 font-semibold text-amber-600">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" /> Ralenti
              </span>
              <span className="flex items-center gap-1 font-semibold text-rose-600">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block animate-pulse" /> Arrêté / Bloqué
              </span>
            </div>
          </div>

          {/* Barre segmentée représentant les PK */}
          <div className="grid grid-cols-6 gap-1 h-9 rounded-lg overflow-hidden p-1 bg-muted/60 border border-border">
            {stops.map((sec) => (
              <div
                key={sec.id}
                onClick={() => setSelectedFilter(selectedFilter === sec.state ? 'all' : sec.state)}
                className={`h-full rounded flex items-center justify-center text-[10px] font-mono font-bold cursor-pointer transition-all ${
                  sec.state === 'ArreteBloque'
                    ? 'bg-rose-500 text-white animate-pulse shadow-sm'
                    : sec.state === 'Ralenti'
                    ? 'bg-amber-400 text-amber-950 font-bold'
                    : 'bg-emerald-500 text-white'
                }`}
                title={`${sec.title} (PK ${sec.pkStart} à ${sec.pkEnd}) : ${sec.state === 'ArreteBloque' ? 'ARRÊT TOTAL (' + sec.stopReason + ')' : sec.state}`}
              >
                PK {sec.pkStart}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
            <span>PK 0+000 (Sfax)</span>
            <span>PK 12+450 (Menzel Chaker)</span>
            <span>PK 22+100 (Ouled Haffouz)</span>
            <span>PK 28+000 (Sidi Bouzid)</span>
          </div>
        </Card>

        {/* Filtres par état */}
        <div className="flex items-center gap-2">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('all')}
            className="text-xs h-8"
          >
            Toutes les sections ({stops.length})
          </Button>
          <Button
            variant={selectedFilter === 'ArreteBloque' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('ArreteBloque')}
            className="text-xs h-8 text-rose-600 border-rose-300 dark:border-rose-900"
          >
            Arrêtées / Bloquées ({stoppedSections})
          </Button>
          <Button
            variant={selectedFilter === 'Ralenti' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('Ralenti')}
            className="text-xs h-8 text-amber-600 border-amber-300 dark:border-amber-900"
          >
            Ralenties ({slowedSections})
          </Button>
          <Button
            variant={selectedFilter === 'EnCours' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('EnCours')}
            className="text-xs h-8 text-emerald-600 border-emerald-300 dark:border-emerald-900"
          >
            En cours régulier ({activeSections})
          </Button>
        </div>

        {/* Liste détaillée des sections de travaux */}
        <div className="space-y-4">
          {filtered.map((sec) => (
            <Card
              key={sec.id}
              className={`border transition-all ${
                sec.state === 'ArreteBloque'
                  ? 'border-l-4 border-l-rose-500 bg-rose-50/20 dark:bg-rose-950/10'
                  : sec.state === 'Ralenti'
                  ? 'border-l-4 border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border-l-4 border-l-emerald-500 bg-card'
              }`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-6 px-2 rounded font-mono font-bold text-xs flex items-center justify-center ${
                        sec.state === 'ArreteBloque'
                          ? 'bg-rose-600 text-white'
                          : sec.state === 'Ralenti'
                          ? 'bg-amber-500 text-black'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      PK {sec.pkStart} ➔ {sec.pkEnd}
                    </span>
                    <h3 className="font-bold text-sm text-foreground">{sec.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-medium">
                      Lot {sec.lotId} • {sec.currentWork}
                    </Badge>

                    {sec.state === 'ArreteBloque' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-300">
                        <Lock className="h-3 w-3" />
                        ARRÊT DE CHANTIER
                      </span>
                    ) : sec.state === 'Ralenti' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-300">
                        <Clock className="h-3 w-3" />
                        CHANTIER RALENTI
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300">
                        <Unlock className="h-3 w-3" />
                        TRAVAUX EN COURS
                      </span>
                    )}
                  </div>
                </div>

                {/* Détail de l'Arrêt si présent */}
                {sec.state === 'ArreteBloque' && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row justify-between gap-1">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-200">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                        <span>Motif d'arrêt formel : {sec.stopReason}</span>
                      </div>
                      <span className="text-muted-foreground font-mono text-[11px]">
                        Arrêté le {sec.stopDate} • <strong>{sec.daysStopped} jours perdus</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-muted-foreground">Ordre de Service Actif :</span>
                      <span className="font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {sec.activeOsNumber}
                      </span>
                      <span className="text-muted-foreground">• Entreprise : {sec.contractorName} • Contrôle : {sec.supervisorName}</span>
                    </div>
                  </div>
                )}

                {/* Les Conditions de Démarrage / Reprise */}
                <div className="space-y-1.5 text-xs bg-muted/30 p-2.5 rounded-lg border border-border/70">
                  <h4 className="font-bold text-foreground text-[11px] uppercase tracking-wider flex items-center justify-between">
                    <span>Conditions préalables impératives pour autoriser les travaux :</span>
                    <span className={sec.allConditionsMet ? 'text-emerald-600' : 'text-rose-600 font-bold'}>
                      {sec.allConditionsMet ? 'Toutes les conditions réunies' : 'Conditions non remplies'}
                    </span>
                  </h4>
                  <ul className="space-y-1 pt-1">
                    {sec.requiredConditionsToRestart.map((cond, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-muted-foreground text-[11px]">
                        {sec.allConditionsMet ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        )}
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions par section */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted-foreground">
                    Entreprise titulaire : <strong>{sec.contractorName}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {sec.state === 'ArreteBloque' && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenRestart(sec)}
                        className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 shadow-xs"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Émettre Ordre de Reprise (OS)
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <NeedPanel content={needContent} />

      {/* Modal Reprise des Travaux (OS de reprise) */}
      {selectedSection && (
        <Dialog open={isRestartOpen} onOpenChange={setIsRestartOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-600">
                <RefreshCw className="h-4 w-4" />
                Notification d'Ordre de Service de Reprise
              </DialogTitle>
              <DialogDescription className="text-xs">
                Autorisation formelle de redémarrage des terrassements pour la section PK {selectedSection.pkStart} à {selectedSection.pkEnd}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2 text-xs bg-muted/30 p-3 rounded-lg border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Section concernée :</span>
                <span className="font-bold text-foreground">PK {selectedSection.pkStart} à {selectedSection.pkEnd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entreprise titulaire :</span>
                <span className="font-bold text-foreground">{selectedSection.contractorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Arrêt initial :</span>
                <span className="text-rose-600 font-semibold">{selectedSection.stopReason} ({selectedSection.daysStopped}j)</span>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 text-emerald-800 dark:text-emerald-200">
                <p className="font-bold">Attestation de levée des contraintes :</p>
                <p className="text-[11px] mt-0.5">La Mission de Contrôle (SCET) certifie que les conditions préalables sont désormais remplies et autorise la levée de l'arrêt.</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsRestartOpen(false)} className="text-xs">
                Annuler
              </Button>
              <Button size="sm" onClick={handleConfirmRestart} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Signer l'OS de Reprise
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Nouvel Arrêt de Chantier */}
      <Dialog open={isNewStopOpen} onOpenChange={setIsNewStopOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
              Notifier un Arrêt de Chantier par Ordre de Service
            </DialogTitle>
            <DialogDescription className="text-xs">
              Mise en demeure d'arrêt des travaux sur une section spécifique suite à une contrainte majeure.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold block mb-1">PK Début</label>
                <Input value={newPkStart} onChange={(e) => setNewPkStart(e.target.value)} className="h-8 text-xs font-mono" />
              </div>
              <div>
                <label className="font-bold block mb-1">PK Fin</label>
                <Input value={newPkEnd} onChange={(e) => setNewPkEnd(e.target.value)} className="h-8 text-xs font-mono" />
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1">Titre de la Section</label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="h-8 text-xs" />
            </div>

            <div>
              <label className="font-bold block mb-1">Fait Générateur / Motif de l'Arrêt</label>
              <select
                value={newReason}
                onChange={(e) => setNewReason(e.target.value as any)}
                className="w-full h-8 rounded-md border border-input bg-card px-2 text-xs"
              >
                <option value="Litige Foncier / Parcelle non libérée">Litige Foncier / Parcelle non libérée (PAR)</option>
                <option value="Intempéries / Crue d'Oued">Intempéries / Crue d'Oued (Force majeure)</option>
                <option value="Réseau Concessionnaire (SONEDE/STEG)">Réseau Concessionnaire non dévoyé (SONEDE/STEG)</option>
                <option value="Non-Conformité Critique (Béton non résistant)">Non-Conformité Critique (Béton / Compactage)</option>
                <option value="Enquête Accident HSE">Enquête Accident Grave HSE</option>
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1">Numéro d'Ordre de Service Associé</label>
              <Input value={newOsNumber} onChange={(e) => setNewOsNumber(e.target.value)} className="h-8 text-xs font-mono font-bold" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsNewStopOpen(false)} className="text-xs">
              Annuler
            </Button>
            <Button size="sm" onClick={handleCreateStop} className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold">
              Émettre l'OS d'Arrêt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
