import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import {
  TransmittalSlip,
  TransmittalItemDetail,
  TechnicalFileFormat,
  TransmittalPurpose,
} from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  FolderArchive,
  FileCheck2,
  Send,
  Download,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
  Inbox,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

export const TransmittalsPage: React.FC = () => {
  const { currentUser } = useSession();
  const [slips, setSlips] = useState<TransmittalSlip[]>(() => db.transmittals);
  const [selectedSlipId, setSelectedSlipId] = useState<string | null>(slips[0]?.id || null);
  const [filterLot, setFilterLot] = useState<string>('ALL');

  // Modals
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [showAckModal, setShowAckModal] = useState<boolean>(false);
  const [ackSlipTarget, setAckSlipTarget] = useState<TransmittalSlip | null>(null);
  const [ackRefInput, setAckRefInput] = useState('');

  // Formulaire nouveau bordereau
  const [newLot, setNewLot] = useState('L01');
  const [newObject, setNewObject] = useState('');
  const [newRecipientOrg, setNewRecipientOrg] = useState('SCET-TUNISIE (Mission de Contrôle MOE)');
  const [newRecipientUser, setNewRecipientUser] = useState('Ing. Nizar (Chef de Mission)');
  const [newDocCode, setNewDocCode] = useState('TN-R2X2-L01-CHA-PLN-000124');
  const [newDocTitle, setNewDocTitle] = useState('Profils en long et assainissement');
  const [newDocRev, setNewDocRev] = useState<'R00' | 'R01' | 'R02' | 'R03'>('R01');
  const [newDocFormat, setNewDocFormat] = useState<TechnicalFileFormat>('AUTOCAD');
  const [newDocPurpose, setNewDocPurpose] = useState<TransmittalPurpose>('Pour Approbation');

  const filteredSlips = slips.filter((s) => (filterLot === 'ALL' ? true : s.lotId === filterLot));
  const activeSlip = slips.find((s) => s.id === selectedSlipId) || slips[0];

  const handleOpenAck = (slip: TransmittalSlip) => {
    setAckSlipTarget(slip);
    setAckRefInput(`AR-${currentUser.actorLabel.slice(0, 4).toUpperCase()}-RN13-${Date.now().toString().slice(-4)}`);
    setShowAckModal(true);
  };

  const handleConfirmAck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ackSlipTarget || !ackRefInput) return;
    const updated = db.acknowledgeTransmittal(ackSlipTarget.id, ackRefInput, currentUser);
    if (updated) {
      setSlips(slips.map((s) => (s.id === updated.id ? updated : s)));
    }
    setShowAckModal(false);
    setAckSlipTarget(null);
    toast.success(`Accusé de réception enregistré sous réf. ${ackRefInput}`);
  };

  const handleCreateSlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObject) return;
    const itemDetail: TransmittalItemDetail = {
      id: `ITEM-${Date.now().toString(36)}`,
      docCode: newDocCode,
      title: newDocTitle,
      revision: newDocRev,
      fileFormat: newDocFormat,
      fileName: `${newDocCode}_${newDocRev}.${newDocFormat === 'AUTOCAD' ? 'dwg' : newDocFormat === 'EXCEL' ? 'xlsx' : 'pdf'}`,
      fileSizeMb: 8.5,
      purpose: newDocPurpose,
      status: 'En_Attente',
    };

    const newSlip: TransmittalSlip = {
      id: `TR-${Date.now().toString(36)}`,
      slipNumber: `TR-RN13-${newLot}-2026-00${slips.length + 50}`,
      lotId: newLot,
      lotName: newLot === 'L01' ? 'Lot 1 (Sfax - Menzel Chaker)' : newLot === 'L02' ? 'Lot 2 (Menzel Chaker - Ouled Haffouz)' : 'Lot 3 (Ouled Haffouz - Kasserine)',
      objectTitle: newObject,
      senderOrg: `${currentUser.actorLabel} (${currentUser.fullName})`,
      senderActor: currentUser.actorLetter,
      senderUser: currentUser.fullName,
      recipientOrg: newRecipientOrg,
      recipientActor: 'D',
      recipientUser: newRecipientUser,
      submissionDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
      status: 'Emis',
      items: [itemDetail],
      downloadSlipFileName: `Bordereau_Transmission_${newLot}_${Date.now()}.pdf`,
    };

    db.addTransmittal(newSlip, currentUser);
    setSlips([newSlip, ...slips]);
    setSelectedSlipId(newSlip.id);
    setShowNewModal(false);
    setNewObject('');
    toast.success(`Bordereau ${newSlip.slipNumber} émis avec succès`);
  };

  const handleDownloadSlip = (slip: TransmittalSlip) => {
    const text = `RÉPUBLIQUE TUNISIENNE - MINISTÈRE DE L'ÉQUIPEMENT ET DE L'HABITAT
DIRECTION GÉNÉRALE DES PONTS ET CHAUSSÉES (DGPC)
PROJET DE MISE À 2x2 VOIES DE LA RN13 (KASSERINE - SFAX)

BORDEREAU DE TRANSMISSION NUMÉRIQUE (SECTION 5 CCTP)
Réf. Bordereau : ${slip.slipNumber}
Lot de projet  : ${slip.lotName}
Objet          : ${slip.objectTitle}

ÉMETTEUR       : ${slip.senderOrg} (Signataire: ${slip.senderUser})
DESTINATAIRE   : ${slip.recipientOrg} (À l'attention de: ${slip.recipientUser})
Date d'envoi   : ${slip.submissionDate}
Échéance revue : ${slip.dueDate}
Statut actuel  : ${slip.status}
Accusé de réc. : ${slip.ackDate ? `Enregistré le ${slip.ackDate} sous réf: ${slip.ackReference} par ${slip.ackUser}` : 'En attente d\'accusé de réception'}

--------------------------------------------------------------------------------
PIÈCES TRANSMISES ET RÉVISIONS EXACTES :
--------------------------------------------------------------------------------
${slip.items
  .map(
    (it, idx) =>
      `[${idx + 1}] Code: ${it.docCode} | Rév: ${it.revision} | Format: ${it.fileFormat} | Taille: ${it.fileSizeMb} Mo\n    Titre: ${it.title}\n    Objet: ${it.purpose} | Statut: ${it.status}`
  )
  .join('\n\n')}

--------------------------------------------------------------------------------
Certifié conforme aux exigences contractuelles. Empreinte SHA-256 : a8f9e7c3b21045da98e20f124`;

    const blob = new Blob([text], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slip.slipNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.info(`Téléchargement du bordereau ${slip.slipNumber}`);
  };

  const needContent: NeedPanelContent = {
    screenId: 'bordereaux-transmission',
    title: 'Bordereaux de Transmission (Transmittals)',
    purpose: 'Module officiel selon la Section 5 du CCTP et le Module 3 de la conception v1.0. Il garantit la traçabilité juridique des envois formels de plans (DWG), notes de calcul (PDF) et essais (Excel). Chaque bordereau fige les révisions exactes et conserve l\'accusé de réception du bureau d\'ordre.',
    actors: [
      { letter: 'E', actorName: 'Entreprise', action: 'Transmet les plans d\'exécution et notes de dimensionnement à la mission de contrôle.' },
      { letter: 'D', actorName: 'MOE (SCET)', action: 'Accuse réception, examine sous 10 jours et renvoie avec visa technique A/B/C/D.' },
      { letter: 'B', actorName: 'Maître d\'Ouvrage', action: 'Reçoit pour bon à exécuter et approbations contractuelles.' },
      { letter: 'A', actorName: 'Bailleurs', action: 'Consulte l\'historique contradictoire en cas d\'audit ou réclamation.' },
    ],
    donorRequirement: 'La conservation probante de la preuve de notification avec horodatage et accusé de réception est une exigence contractuelle pour tout document soumis à délai d\'approbation.',
    seeAlso: [
      { label: 'Sous-Projets par Lot', href: '#/lots' },
      { label: 'Plans & Documents GED', href: '#/documents' },
      { label: 'Réception & DOE', href: '#/reception-doe' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Bordereaux de Transmission (Transmittals)"
          subtitle="Module 3 & Section 5 — Suivi probant des révisions contractuelles et accusés de réception"
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="text-xs text-muted-foreground font-semibold">Lot :</span>
                <select
                  value={filterLot}
                  onChange={(e) => setFilterLot(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="ALL">Tous les lots (L01, L02, L03)</option>
                  <option value="L01">Lot 1 (Sfax - Menzel Chaker)</option>
                  <option value="L02">Lot 2 (Menzel Chaker - Ouled Haffouz)</option>
                  <option value="L03">Lot 3 (Ouled Haffouz - Kasserine)</option>
                </select>
              </div>

              <Button
                size="sm"
                onClick={() => setShowNewModal(true)}
                className="gap-1.5 font-bold text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Émettre un Bordereau</span>
              </Button>
            </div>
          }
        />

        {/* 4 Indicateurs Clés */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">Bordereaux Émis</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-primary">{slips.length}</span>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30 font-bold">
                  Numérotés TR
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Archives opposables</span>
            </CardContent>
          </Card>

          <Card className="border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">Accusés de Réception</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-600">
                  {slips.filter((s) => s.status === 'Accuse_Receptionne' || s.status === 'Traite_Vise').length}
                </span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 font-bold">
                  Enregistrés
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Bureau d'ordre validé</span>
            </CardContent>
          </Card>

          <Card className="border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">En Examen / Visa</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-600">
                  {slips.filter((s) => s.status === 'En_Examen' || s.status === 'Emis').length}
                </span>
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 font-bold">
                  SLA &lt; 10j
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Délais respectés</span>
            </CardContent>
          </Card>

          <Card className="border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">Pièces Rattachées</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-foreground">
                  {slips.reduce((acc, s) => acc + s.items.length, 0)}
                </span>
                <Badge variant="outline" className="text-[10px] font-bold">
                  DWG &amp; PDF
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Révisions figées</span>
            </CardContent>
          </Card>
        </div>

        {/* Disposition Master - Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Liste à gauche */}
          <div className="lg:col-span-5 space-y-3">
            {filteredSlips.map((slip) => {
              const isSelected = slip.id === selectedSlipId;
              return (
                <Card
                  key={slip.id}
                  onClick={() => setSelectedSlipId(slip.id)}
                  className={`border cursor-pointer transition-all shadow-2xs ${
                    isSelected
                      ? 'border-primary ring-1 ring-primary/30 bg-primary/5'
                      : 'hover:border-primary/40'
                  }`}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-primary">
                        {slip.slipNumber}
                      </span>
                      <Badge
                        className={`text-[9px] font-bold uppercase ${
                          slip.status === 'Accuse_Receptionne' || slip.status === 'Traite_Vise'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {slip.status === 'Accuse_Receptionne'
                          ? 'Accusé Reçu'
                          : slip.status === 'Traite_Vise'
                          ? 'Traité Visé'
                          : 'En Examen'}
                      </Badge>
                    </div>

                    <h4 className="text-xs font-bold text-foreground line-clamp-2">
                      {slip.objectTitle}
                    </h4>

                    <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1 border-t border-border/60">
                      <div className="flex items-center justify-between">
                        <span>De : <strong className="text-foreground">{slip.senderOrg}</strong></span>
                        <span className="text-[10px]">{slip.submissionDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>À : <strong className="text-foreground">{slip.recipientOrg}</strong></span>
                        <span className="text-[10px] font-bold text-primary">{slip.items.length} pièces</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Détail à droite */}
          {activeSlip && (
            <div className="lg:col-span-7">
              <Card className="border shadow-2xs">
                <CardHeader className="pb-3 border-b border-border/70">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-primary block">
                        {activeSlip.slipNumber}
                      </span>
                      <CardTitle className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                        {activeSlip.objectTitle}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground font-medium">
                        {activeSlip.lotName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSlip(activeSlip)}
                        className="text-xs h-8 gap-1.5 font-bold"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Bordereau PDF</span>
                      </Button>

                      {activeSlip.status !== 'Accuse_Receptionne' && activeSlip.status !== 'Traite_Vise' && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenAck(activeSlip)}
                          className="text-xs h-8 gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Accuser Réception</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Méta-infos transmission */}
                  <div className="grid grid-cols-2 gap-3 text-xs p-3.5 bg-muted/40 rounded-xl border border-border/70">
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Émetteur officiel :</span>
                      <span className="font-bold text-foreground block">{activeSlip.senderOrg}</span>
                      <span className="text-[11px] text-muted-foreground">{activeSlip.senderUser}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Destinataire officiel :</span>
                      <span className="font-bold text-foreground block">{activeSlip.recipientOrg}</span>
                      <span className="text-[11px] text-muted-foreground">{activeSlip.recipientUser}</span>
                    </div>
                    <div className="pt-2 border-t border-border/60">
                      <span className="text-muted-foreground block mb-0.5">Date d'émission :</span>
                      <span className="font-bold text-foreground">{activeSlip.submissionDate}</span>
                    </div>
                    <div className="pt-2 border-t border-border/60">
                      <span className="text-muted-foreground block mb-0.5">Échéance de réponse :</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{activeSlip.dueDate}</span>
                    </div>
                  </div>

                  {/* Accusé de réception enregistré */}
                  {activeSlip.ackDate && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="block">Accusé de réception contradictoire enregistré :</strong>
                        <span>Réf. bureau d'ordre : <strong>{activeSlip.ackReference}</strong> par {activeSlip.ackUser} le {new Date(activeSlip.ackDate).toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                  )}

                  {/* Pièces jointes */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <span>Pièces jointes et révisions contractuelles ({activeSlip.items.length})</span>
                    </h4>

                    <div className="space-y-2.5">
                      {activeSlip.items.map((it) => (
                        <div
                          key={it.id}
                          className="p-3.5 bg-card border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                className={`text-[9px] font-black uppercase ${
                                  it.fileFormat === 'AUTOCAD'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                    : it.fileFormat === 'EXCEL'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                }`}
                              >
                                {it.fileFormat}
                              </Badge>
                              <span className="font-mono text-xs font-bold text-primary">
                                {it.docCode}
                              </span>
                              <Badge variant="outline" className="text-[10px] font-bold">
                                Rév. {it.revision}
                              </Badge>
                              <span className="text-[11px] text-muted-foreground">
                                ({it.fileSizeMb} Mo)
                              </span>
                            </div>

                            <h5 className="text-xs font-bold text-foreground mt-1">
                              {it.title}
                            </h5>

                            <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2">
                              <span>Objet : <strong className="text-foreground">{it.purpose}</strong></span>
                              <span>•</span>
                              <span>Fichier : <span className="font-mono">{it.fileName}</span></span>
                            </div>
                          </div>

                          <Badge
                            className={`text-[9px] font-bold uppercase self-start sm:self-center shrink-0 ${
                              it.status === 'Approuve'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : it.status === 'Approuve_Avec_Reserves'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {it.status === 'Approuve_Avec_Reserves' ? 'Visa B (Réserves)' : it.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Modal Accuser Réception */}
        {showAckModal && ackSlipTarget && (
          <Dialog open={showAckModal} onOpenChange={setShowAckModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Accuser Réception du Bordereau</span>
                </DialogTitle>
              </DialogHeader>

              <p className="text-xs text-muted-foreground">
                Confirmer la réception contradictoire du bordereau <strong>{ackSlipTarget.slipNumber}</strong> ({ackSlipTarget.items.length} pièces jointes).
              </p>

              <form onSubmit={handleConfirmAck} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Numéro d'enregistrement au bureau d'ordre *
                  </label>
                  <Input
                    required
                    value={ackRefInput}
                    onChange={(e) => setAckRefInput(e.target.value)}
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAckModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" size="sm" className="font-bold bg-emerald-600 hover:bg-emerald-500 text-white">
                    Signer l'Accusé de Réception
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal Nouveau Bordereau */}
        <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Send className="h-5 w-5 text-primary" />
                <span>Créer un Bordereau de Transmission</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateSlip} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Lot</label>
                  <select
                    value={newLot}
                    onChange={(e) => setNewLot(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="L01">Lot 1 (Sfax - Menzel Chaker)</option>
                    <option value="L02">Lot 2 (Menzel Chaker - Ouled Haffouz)</option>
                    <option value="L03">Lot 3 (Ouled Haffouz - Kasserine)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Objet de la transmission</label>
                  <Input
                    required
                    placeholder="ex: Soumission des profils en long..."
                    value={newObject}
                    onChange={(e) => setNewObject(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Organisme destinataire</label>
                  <Input value={newRecipientOrg} onChange={(e) => setNewRecipientOrg(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">À l'attention de</label>
                  <Input value={newRecipientUser} onChange={(e) => setNewRecipientUser(e.target.value)} />
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-2">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                  Pièce principale à transmettre
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground block mb-0.5">Code Document normalisé</label>
                    <Input value={newDocCode} onChange={(e) => setNewDocCode(e.target.value)} className="font-mono text-xs" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-0.5">Révision</label>
                    <select
                      value={newDocRev}
                      onChange={(e) => setNewDocRev(e.target.value as any)}
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs font-bold text-foreground focus:outline-none"
                    >
                      <option value="R00">R00</option>
                      <option value="R01">R01</option>
                      <option value="R02">R02</option>
                      <option value="R03">R03</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-0.5">Titre du plan / document</label>
                  <Input value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-0.5">Format</label>
                    <select
                      value={newDocFormat}
                      onChange={(e) => setNewDocFormat(e.target.value as any)}
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs font-bold text-foreground focus:outline-none"
                    >
                      <option value="AUTOCAD">AutoCAD DWG</option>
                      <option value="PDF">PDF Normalisé</option>
                      <option value="EXCEL">Classeur Excel</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-0.5">Objet de la soumission</label>
                    <select
                      value={newDocPurpose}
                      onChange={(e) => setNewDocPurpose(e.target.value as any)}
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs font-bold text-foreground focus:outline-none"
                    >
                      <option value="Pour Approbation">Pour Approbation</option>
                      <option value="Pour Bon pour Exécution">Pour Bon pour Exécution</option>
                      <option value="Pour Information">Pour Information</option>
                      <option value="Pour Recolement">Pour Récolement</option>
                    </select>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowNewModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Émettre le Bordereau
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
