import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import {
  ReceptionRecord,
  ReceptionReserve,
  DoeItem,
  DoeCategory,
  TechnicalFileFormat,
} from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CheckSquare,
  Award,
  AlertTriangle,
  Download,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

export const ReceptionDoePage: React.FC = () => {
  const { currentUser } = useSession();
  const [activeTab, setActiveTab] = useState<'receptions' | 'doe'>('receptions');

  const [receptions, setReceptions] = useState<ReceptionRecord[]>(() => db.receptionRecords);
  const [reserves, setReserves] = useState<ReceptionReserve[]>(() => db.receptionReserves);
  const [doeItems, setDoeItems] = useState<DoeItem[]>(() => db.doeItems);

  // Modals
  const [showResolveModal, setShowResolveModal] = useState<boolean>(false);
  const [targetReserve, setTargetReserve] = useState<ReceptionReserve | null>(null);
  const [proofDocInput, setProofDocInput] = useState('');

  const [showAddDoeModal, setShowAddDoeModal] = useState<boolean>(false);
  const [newDoeCat, setNewDoeCat] = useState<DoeCategory>('Plans_As_Built');
  const [newDoeLot, setNewDoeLot] = useState('L01');
  const [newDoeCode, setNewDoeCode] = useState('DOE-RN13-L01-DWG-008');
  const [newDoeTitle, setNewDoeTitle] = useState('Plans de recollement giratoire PK 12');
  const [newDoeFormat, setNewDoeFormat] = useState<TechnicalFileFormat>('AUTOCAD');

  const openReservesTotal = reserves.filter((r) => r.status !== 'Levee_Verifiee').length;
  const doeApprovedCount = doeItems.filter((d) => d.moApproval).length;

  const handleOpenResolveReserve = (res: ReceptionReserve) => {
    setTargetReserve(res);
    setProofDocInput(`TN-R2X2-L01-RES-LEV-0${Date.now().toString().slice(-2)}`);
    setShowResolveModal(true);
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetReserve) return;
    const updated = db.updateReserveStatus(targetReserve.id, 'Levee_Verifiee', proofDocInput, currentUser);
    if (updated) {
      setReserves(reserves.map((r) => (r.id === updated.id ? updated : r)));
      setReceptions([...db.receptionRecords]);
    }
    setShowResolveModal(false);
    setTargetReserve(null);
    toast.success(`Réserve au PK ${targetReserve.pk} marquée levée contradictoirement`);
  };

  const handleValidateDoeMoe = (id: string) => {
    const updated = db.validateDoeItemMoe(id, currentUser);
    if (updated) {
      setDoeItems(doeItems.map((d) => (d.id === id ? updated : d)));
      toast.success(`Pièce ${updated.code} visée par la Mission de Contrôle`);
    }
  };

  const handleApproveDoeMo = (id: string) => {
    const updated = db.approveDoeItemMo(id, currentUser);
    if (updated) {
      setDoeItems(doeItems.map((d) => (d.id === id ? updated : d)));
      toast.success(`Pièce ${updated.code} approuvée par la DGPC`);
    }
  };

  const handleCreateDoeItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoeTitle) return;
    const item: DoeItem = {
      id: `DOE-${Date.now().toString(36)}`,
      lotId: newDoeLot,
      category: newDoeCat,
      categoryLabel:
        newDoeCat === 'Plans_As_Built'
          ? "Plans Conformes à l'Exécution (As-Built)"
          : newDoeCat === 'Notes_Calcul_Recollement'
          ? "Notes de Calcul Définitives"
          : newDoeCat === 'Essais_Finaux_Laboratoire'
          ? "Essais Finaux de Récolement"
          : newDoeCat === 'Fiches_Ouvrages_Art'
          ? "Fiches d'Ouvrages d'Art DGPC"
          : newDoeCat === 'Garanties_Fabricants'
          ? "Garanties Fabricants & Certificats"
          : "Guide d'Entretien DGPC",
      code: newDoeCode,
      title: newDoeTitle,
      revision: 'R_DOE',
      format: newDoeFormat,
      fileName: `${newDoeCode}.${newDoeFormat === 'AUTOCAD' ? 'dwg' : newDoeFormat === 'EXCEL' ? 'xlsx' : 'pdf'}`,
      fileSizeMb: 12.4,
      moeValidation: true,
      moApproval: false,
      dgpcTransferReady: false,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    db.addDoeItem(item, currentUser);
    setDoeItems([item, ...doeItems]);
    setShowAddDoeModal(false);
    setNewDoeTitle('');
    toast.success(`Pièce ${item.code} ajoutée au DOE`);
  };

  const handleDownloadFile = (fileName: string, title: string) => {
    const content = `DOSSIER DES OUVRAGES EXÉCUTÉS (DOE) & RÉCEPTION OFFICIELLE
Projet : Mise à 2x2 voies de la RN13 (Kasserine - Sfax)
Ministère de l'Équipement et de l'Habitat / DGPC
Document : ${fileName}
Intitulé : ${title}
Certification : Conforme à l'exécution sur le terrain (As-Built)
Contrôle : SCET-Tunisie (MOE) & Approbation DGPC (MO)
Empreinte SHA-256 : d41d8cd98f00b204e9800998ecf8427e`;

    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.info(`Téléchargement de ${fileName}`);
  };

  const needContent: NeedPanelContent = {
    screenId: 'reception-doe',
    title: 'Réception des Travaux & Dossier DOE',
    purpose: 'Module officiel selon le Module 12 de la conception v1.0. Il encadre les commissions de réception provisoire, le suivi de la levée des réserves (majeures/mineures), et la constitution du Dossier des Ouvrages Exécutés (DOE) pour le transfert de propriété à la DGPC.',
    actors: [
      { letter: 'B', actorName: 'Maître d\'Ouvrage', action: 'Préside la commission de réception et valide le transfert définitif à la DGPC.' },
      { letter: 'D', actorName: 'MOE (SCET)', action: 'Vérifie les récolements géomètres, vise les plans As-built et certifie la levée des réserves.' },
      { letter: 'E', actorName: 'Entreprise', action: 'Lève les réserves dans le délai contractuel et dépose les garanties fabricants.' },
      { letter: 'A', actorName: 'Bailleurs', action: 'Reçoit le rapport d\'achèvement de projet (ICR) et solde les retenues de garantie.' },
    ],
    donorRequirement: 'Aucun paiement du décompte final (DGD) ne peut intervenir avant la levée totale des réserves majeures et la remise du DOE complet à la DGPC.',
    seeAlso: [
      { label: 'Sous-Projets par Lot', href: '#/lots' },
      { label: 'Bordereaux de Transmission', href: '#/bordereaux-transmission' },
      { label: 'Décomptes Mensuels (IPC)', href: '#/execution/decomptes' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Réception des Travaux & Dossier DOE"
          subtitle="Module 12 — Procès-verbaux contradictoires, levée des réserves et transfert DGPC"
          actions={
            activeTab === 'doe' ? (
              <Button
                size="sm"
                onClick={() => setShowAddDoeModal(true)}
                className="gap-1.5 font-bold text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Déposer une pièce DOE</span>
              </Button>
            ) : undefined
          }
        />

        {/* 4 Indicateurs Clés */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">Réception Prononcée</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-600">Section 1</span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 font-bold">
                  PK 0 à 8
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Garantie 1 an en cours</span>
            </CardContent>
          </Card>

          <Card className="border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">Réserves en Cours</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-600">{openReservesTotal}</span>
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 font-bold">
                  sur {reserves.length}
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Délai résolution &lt; 30j</span>
            </CardContent>
          </Card>

          <Card className="border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">Pièces DOE Validées</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-primary">{doeApprovedCount} / {doeItems.length}</span>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30 font-bold">
                  86%
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Plans As-built DWG</span>
            </CardContent>
          </Card>

          <Card className="border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">Transfert DGPC</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-foreground">Prêt</span>
                <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-300 font-bold">
                  Tunis
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">6 fiches normalisées</span>
            </CardContent>
          </Card>
        </div>

        {/* Onglets Réception / DOE */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <TabsList className="grid grid-cols-2 max-w-md mb-4">
            <TabsTrigger value="receptions" className="gap-1.5 font-bold text-xs">
              <Award className="h-4 w-4" />
              <span>Commissions & Réserves ({reserves.length})</span>
            </TabsTrigger>
            <TabsTrigger value="doe" className="gap-1.5 font-bold text-xs">
              <Layers className="h-4 w-4" />
              <span>Dossier DOE ({doeItems.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet 1 : Commissions & Réserves */}
          <TabsContent value="receptions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {receptions.map((rec) => (
                <Card key={rec.id} className="border hover:border-primary/40 transition-all shadow-2xs flex flex-col justify-between">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-border/70 pb-2.5">
                      <div>
                        <span className="font-mono text-xs font-bold text-primary block">
                          {rec.pvNumber}
                        </span>
                        <h4 className="text-sm font-bold text-foreground mt-0.5">
                          {rec.lotName}
                        </h4>
                      </div>

                      <Badge
                        className={`text-[10px] font-bold uppercase shrink-0 ${
                          rec.status === 'Prononcee_Avec_Reserves'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {rec.status === 'Prononcee_Avec_Reserves' ? 'Prononcée avec réserves' : 'Ajournée'}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/60 leading-relaxed italic">
                      « {rec.summaryVerdict} »
                    </p>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Date commission : <strong className="text-foreground">{rec.dateCommission}</strong></span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">{rec.openReservesCount} réserves ouvertes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Garantie :</span>
                        <span className="text-foreground">{rec.guaranteeStartDate} au {rec.guaranteeEndDate}</span>
                      </div>
                      <div className="pt-1.5 text-[11px]">
                        Commission : {rec.commissionMembers.map((m) => `${m.name} (${m.org})`).join(', ')}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-medium">DGPC: {rec.transferDgpcStatus}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadFile(rec.officialPvFileName, rec.pvNumber)}
                        className="text-xs h-7 gap-1 font-bold"
                      >
                        <Download className="h-3 w-3" />
                        <span>PV Signé</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Table des réserves */}
            <Card className="border shadow-2xs overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/70">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Registre Contradictoire de Levée des Réserves</span>
                </CardTitle>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">PK</TableHead>
                    <TableHead className="font-bold">Catégorie</TableHead>
                    <TableHead className="font-bold">Description de la réserve</TableHead>
                    <TableHead className="font-bold">Responsable & Échéance</TableHead>
                    <TableHead className="font-bold">Preuve Levée</TableHead>
                    <TableHead className="text-center font-bold">Statut</TableHead>
                    <TableHead className="text-right font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reserves.map((res) => (
                    <TableRow key={res.id} className="hover:bg-muted/30">
                      <TableCell className="font-bold text-foreground">
                        PK {res.pk}
                        <span className="block text-[10px] text-muted-foreground font-normal">{res.lotId}</span>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`text-[9px] font-black uppercase ${
                            res.category === 'Majeure_Bloquante'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                          }`}
                        >
                          {res.category === 'Majeure_Bloquante' ? 'Majeure' : 'Finitions'}
                        </Badge>
                      </TableCell>

                      <TableCell className="max-w-xs text-xs font-medium text-foreground">
                        {res.description}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-xs text-foreground">{res.responsibleContractor}</div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Délai : {res.deadlineResolution}</div>
                      </TableCell>

                      <TableCell>
                        {res.proofDocCode ? (
                          <span className="font-mono text-xs text-primary font-bold">
                            {res.proofDocCode}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">En attente</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-[9px] font-bold uppercase inline-flex items-center gap-1 ${
                            res.status === 'Levee_Verifiee'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {res.status === 'Levee_Verifiee' && <CheckCircle2 className="h-3 w-3" />}
                          <span>{res.status === 'Levee_Verifiee' ? 'Levée' : 'En cours'}</span>
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        {res.status !== 'Levee_Verifiee' ? (
                          <Button
                            size="sm"
                            onClick={() => handleOpenResolveReserve(res)}
                            className="text-xs h-7 font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            Lever Réserve
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadFile(res.proofFileName || 'Preuve_Levee.pdf', res.description)}
                            className="h-7 w-7 text-primary"
                            title="Télécharger le PV de levée"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Onglet 2 : Dossier DOE */}
          <TabsContent value="doe" className="space-y-4">
            <Card className="border shadow-2xs overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/70">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Pièces Contractuelles du Dossier des Ouvrages Exécutés (DOE)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/70">
                {doeItems.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            className={`text-[9px] font-black uppercase ${
                              item.format === 'AUTOCAD'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : item.format === 'EXCEL'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {item.format}
                          </Badge>
                          <span className="font-mono text-xs font-bold text-primary">
                            {item.code}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {item.categoryLabel}
                          </Badge>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            Rév. {item.revision}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-foreground mt-1">
                          {item.title}
                        </h4>

                        <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-3">
                          <span>Fichier : <span className="font-mono">{item.fileName}</span> ({item.fileSizeMb} Mo)</span>
                          <span>•</span>
                          <span>Mis à jour le {item.updatedAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <div className="text-right text-[11px] mr-2">
                          <span className={`block font-bold ${item.moeValidation ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                            MOE: {item.moeValidation ? 'Visé Conforme' : 'Non visé'}
                          </span>
                          <span className={`block font-bold ${item.moApproval ? 'text-primary' : 'text-amber-600'}`}>
                            MO: {item.moApproval ? 'Approuvé DGPC' : 'En attente'}
                          </span>
                        </div>

                        {!item.moeValidation && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleValidateDoeMoe(item.id)}
                            className="text-xs h-8 font-bold"
                          >
                            Viser MOE
                          </Button>
                        )}

                        {item.moeValidation && !item.moApproval && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveDoeMo(item.id)}
                            className="text-xs h-8 font-bold"
                          >
                            Approuver DGPC
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadFile(item.fileName, item.title)}
                          className="h-8 w-8 text-primary"
                          title="Télécharger la pièce du DOE"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal Résolution Réserve */}
        {showResolveModal && targetReserve && (
          <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Prononcer la Levée de la Réserve</span>
                </DialogTitle>
              </DialogHeader>

              <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
                <div className="font-bold text-foreground">PK {targetReserve.pk} ({targetReserve.lotId})</div>
                <div className="text-muted-foreground">{targetReserve.description}</div>
                <div className="text-muted-foreground">Entreprise : {targetReserve.responsibleContractor}</div>
              </div>

              <form onSubmit={handleConfirmResolve} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Référence du PV contradictoire ou photo de contrôle *
                  </label>
                  <Input
                    required
                    value={proofDocInput}
                    onChange={(e) => setProofDocInput(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowResolveModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" size="sm" className="font-bold bg-emerald-600 hover:bg-emerald-500 text-white">
                    Valider la Levée Contradictoire
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal Ajout Pièce DOE */}
        <Dialog open={showAddDoeModal} onOpenChange={setShowAddDoeModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Layers className="h-5 w-5 text-primary" />
                <span>Déposer une Pièce DOE Récolée</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateDoeItem} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Catégorie DOE</label>
                <select
                  value={newDoeCat}
                  onChange={(e) => setNewDoeCat(e.target.value as DoeCategory)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="Plans_As_Built">Plans Conformes à l'Exécution (As-Built)</option>
                  <option value="Notes_Calcul_Recollement">Notes de Calcul Définitives</option>
                  <option value="Essais_Finaux_Laboratoire">Essais Finaux de Récolement</option>
                  <option value="Fiches_Ouvrages_Art">Fiches d'Ouvrages d'Art DGPC</option>
                  <option value="Garanties_Fabricants">Garanties Fabricants & Certificats</option>
                  <option value="Guide_Entretien_DGPC">Guide d'Entretien DGPC</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Code Document normalisé</label>
                <Input required value={newDoeCode} onChange={(e) => setNewDoeCode(e.target.value)} className="font-mono text-xs" />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Titre de la pièce *</label>
                <Input required value={newDoeTitle} onChange={(e) => setNewDoeTitle(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Format</label>
                  <select
                    value={newDoeFormat}
                    onChange={(e) => setNewDoeFormat(e.target.value as any)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="AUTOCAD">AutoCAD DWG</option>
                    <option value="PDF">PDF</option>
                    <option value="EXCEL">Excel</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Lot</label>
                  <select
                    value={newDoeLot}
                    onChange={(e) => setNewDoeLot(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="L01">Lot 1</option>
                    <option value="L02">Lot 2</option>
                    <option value="L03">Lot 3</option>
                  </select>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddDoeModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Ajouter au Dossier DOE
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
