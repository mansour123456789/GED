import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { ServiceOrder, ServiceOrderType } from '@/types';
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
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  FileText,
  FileCheck2,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RefreshCw,
  Clock,
  MapPin,
  Calendar,
  Building2,
  HardHat,
  Search,
  Plus,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

export const OrdresServicePage: React.FC = () => {
  const { currentUser } = useSession();
  const [orders, setOrders] = useState<ServiceOrder[]>(() => db.serviceOrders);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // Formulaire Nouvel OS
  const [newType, setNewType] = useState<ServiceOrderType>('ArretPartiel');
  const [newTitle, setNewTitle] = useState('');
  const [newLot, setNewLot] = useState('L01');
  const [newPkRange, setNewPkRange] = useState('PK 14+200 à 15+800');
  const [newReason, setNewReason] = useState('');
  const [newDays, setNewDays] = useState('15');
  const [newSignatory, setNewSignatory] = useState('Hichem Gharbi (Directeur Général MO / DGPC)');

  const canCreate = currentUser.actor === 'mo' || currentUser.actor === 'moe';

  // Statistiques
  const totalOrders = orders.length;
  const activeStops = orders.filter((o) => (o.type === 'ArretPartiel' || o.type === 'ArretTotal') && o.status === 'EnExecution');
  const totalDaysLost = orders.reduce((acc, curr) => acc + (curr.impactDelayDays || 0), 0);
  const avenants = orders.filter((o) => o.type === 'AvenantDelai');

  // Filtrage
  const filteredOrders = orders.filter((o) => {
    if (typeFilter !== 'all' && o.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.number.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        o.reason.toLowerCase().includes(q) ||
        o.pkRange.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newReason.trim()) {
      toast.error('Veuillez renseigner un titre et un motif circonstancié.');
      return;
    }

    const seq = String(orders.length + 1).padStart(3, '0');
    const orderNumber = newType === 'AvenantDelai' ? `AVENANT-RN13-2026-${seq}` : `OS-RN13-2026-${seq}`;

    const newOs: ServiceOrder = {
      id: `os-${Date.now().toString(36)}`,
      number: orderNumber,
      type: newType,
      title: newTitle,
      lotId: newLot,
      pkRange: newPkRange,
      dateNotification: new Date().toISOString().slice(0, 10),
      signatory: newSignatory,
      reason: newReason,
      impactDelayDays: parseInt(newDays) || 0,
      status: newType === 'Reprise' ? 'Cloture' : 'EnExecution',
      fileName: `${orderNumber}_Signe.pdf`,
    };

    db.addServiceOrder(newOs, currentUser);
    setOrders([...db.serviceOrders]);
    setIsNewOrderModalOpen(false);
    toast.success(`Ordre de Service ${orderNumber} notifié avec succès !`);

    // Reset form
    setNewTitle('');
    setNewReason('');
  };

  const getTypeBadge = (type: ServiceOrderType) => {
    switch (type) {
      case 'Demarrage':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"><PlayCircle className="h-3 w-3" /> Démarrage</Badge>;
      case 'ArretPartiel':
        return <Badge className="bg-amber-600 hover:bg-amber-700 text-white gap-1"><PauseCircle className="h-3 w-3" /> Arrêt Partiel</Badge>;
      case 'ArretTotal':
        return <Badge className="bg-rose-600 hover:bg-rose-700 text-white gap-1"><StopCircle className="h-3 w-3" /> Arrêt Total</Badge>;
      case 'Reprise':
        return <Badge className="bg-sky-600 hover:bg-sky-700 text-white gap-1"><RefreshCw className="h-3 w-3" /> Reprise</Badge>;
      case 'AvenantDelai':
        return <Badge className="bg-purple-600 hover:bg-purple-700 text-white gap-1"><Clock className="h-3 w-3" /> Avenant Délai</Badge>;
      case 'ModificationTechnique':
        return <Badge className="bg-slate-600 hover:bg-slate-700 text-white gap-1"><FileText className="h-3 w-3" /> Modif. Technique</Badge>;
    }
  };

  const needContent: NeedPanelContent = {
    screenId: 'execution-os',
    title: 'Registre Officiel des Ordres de Service (OS) & Avenants',
    purpose: 'Dans les marchés publics tunisiens (CCAG Travaux), tout arrêt, suspension de délai, ordre de dévoiement ou reprise des travaux doit impérativement faire l\'objet d\'un Ordre de Service notifié par le Maître d\'Ouvrage (DGPC) avec l\'avis de la MOE (SCET-Tunisie).',
    actors: [
      { letter: 'B', actorName: 'Maître d\'ouvrage (DGPC)', action: 'Signe et notifie officiellement les OS d\'arrêt, de reprise et les avenants de prolongation de délai.' },
      { letter: 'D', actorName: 'MOE (SCET-Tunisie)', action: 'Propose les constats d\'arrêt contradictoires (intempéries, blocages fonciers, non-conformités).' },
      { letter: 'E', actorName: 'Entreprise (Soroubat)', action: 'Reçoit l\'OS, contresigne et suspend immédiatement les engins sur le tronçon pour éviter les pénalités.' },
      { letter: 'A', actorName: 'Bailleur (Banque Mondiale)', action: 'Vérifie que les suspensions foncières respectent la clause d\'indemnisation préalable (ESS5).' },
    ],
    donorRequirement: 'Exigence de transparence contractuelle : Tout glissement de délai supérieur à 30 jours calendaires nécessite une demande formelle d\'approbation et de Non-Objection auprès de la Banque Mondiale.',
    seeAlso: [
      { label: 'Postes d\'Arrêt & Blocages Linéaires', href: '#/execution/blocages' },
      { label: 'Foncier & Emprises (PAR)', href: '#/social/par' },
      { label: 'Documents & Pièces CDE', href: '#/documents' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Registre des Ordres de Service (OS) & Avenants Contractuels"
          subtitle="Suivi juridique des instructions de chantier, arrêts partiels, reprises et avenants de prolongation de délai de la RN13."
          actions={
            canCreate ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsNewOrderModalOpen(true)}
                className="gap-2 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Émettre un Ordre de Service</span>
              </Button>
            ) : undefined
          }
        />

        {/* --- KPI COCKPIT OS & SUSPENSIONS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Total Ordres & Avenants</p>
                <p className="text-2xl font-black text-foreground mt-0.5">{totalOrders}</p>
                <span className="text-[10px] text-muted-foreground">Enregistrés au registre</span>
              </div>
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <FileCheck2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Arrêts Partiels Actifs</p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{activeStops.length}</p>
                <span className="text-[10px] text-muted-foreground">Sections actuellement gelées</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
                <PauseCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Jours d'Arrêt Imputables</p>
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{totalDaysLost} j</p>
                <span className="text-[10px] text-muted-foreground">Foncier, météo & réseaux</span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-600">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Avenants Accordés</p>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
                  +{avenants.reduce((a, b) => a + (b.impactDelayDays || 0), 0)} j
                </p>
                <span className="text-[10px] text-purple-600 font-medium">Approuvé Banque Mondiale</span>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- RECHERCHE ET FILTRES --- */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-card p-3 rounded-xl border border-border shadow-2xs">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher par N° OS, motif, PK ou signataire..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9 bg-background"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">Tous les types d'Ordres</option>
              <option value="Demarrage">OS de Démarrage</option>
              <option value="ArretPartiel">OS d'Arrêt Partiel</option>
              <option value="ArretTotal">OS d'Arrêt Total</option>
              <option value="Reprise">OS de Reprise des Travaux</option>
              <option value="AvenantDelai">Avenant de Délai Contractuel</option>
            </select>
          </div>
        </div>

        {/* --- REGISTRE DES ORDRES DE SERVICE --- */}
        <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[180px]">N° Enregistrement</TableHead>
                <TableHead>Type d'Ordre</TableHead>
                <TableHead className="w-[320px]">Objet & Motif Circonstancié</TableHead>
                <TableHead>Linéaire (PK)</TableHead>
                <TableHead>Date Notif.</TableHead>
                <TableHead>Impact Délai</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                    Aucun ordre de service ne correspond à ces critères.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((os) => (
                  <TableRow
                    key={os.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedOrder(os)}
                  >
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      {os.number}
                    </TableCell>

                    <TableCell>
                      {getTypeBadge(os.type)}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-foreground line-clamp-1">{os.title}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {os.reason}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800 w-fit">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{os.pkRange}</span>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {os.dateNotification}
                    </TableCell>

                    <TableCell>
                      {os.impactDelayDays ? (
                        <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
                          +{os.impactDelayDays} jours
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          os.status === 'EnExecution'
                            ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                            : os.status === 'Cloture'
                            ? 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {os.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(os);
                        }}
                      >
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <NeedPanel content={needContent} />

      {/* --- MODAL DE DÉTAIL / APERÇU OFFICIEL DE L'ORDRE DE SERVICE (FORMAT MINISTÈRE) --- */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        {selectedOrder && (
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-border pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Document Officiel CCAG Travaux
                </span>
                {getTypeBadge(selectedOrder.type)}
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                {selectedOrder.number} : {selectedOrder.title}
              </DialogTitle>
            </DialogHeader>

            {/* Fiche Officielle stylisée Ministère de l'Équipement */}
            <div className="p-4 rounded-xl border border-border bg-muted/15 space-y-4 text-xs font-sans">
              <div className="text-center border-b border-border/80 pb-3 space-y-0.5">
                <p className="font-extrabold uppercase text-[11px] text-foreground tracking-wide">
                  République Tunisienne — Ministère de l'Équipement et de l'Habitat
                </p>
                <p className="text-muted-foreground text-[10px]">
                  Direction Générale des Ponts et Chaussées (DGPC) • Unité de Gestion du Projet RN13
                </p>
                <p className="font-semibold text-primary text-[11px] mt-1">
                  Projet de Dédoublement en 2x2 voies de la Route Nationale 13 (Sfax - Kasserine)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-muted-foreground block">Lot Contractuel :</span>
                  <span className="font-bold text-foreground">{selectedOrder.lotId}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Date de Notification :</span>
                  <span className="font-bold text-foreground">{selectedOrder.dateNotification}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Linéaire & Repère (PK) :</span>
                  <span className="font-bold text-foreground font-mono">{selectedOrder.pkRange}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Signataire Autorisé :</span>
                  <span className="font-bold text-foreground">{selectedOrder.signatory}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border space-y-1.5">
                <h5 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  Motif Contractuel Circonstancié & Justificatifs :
                </h5>
                <p className="text-muted-foreground leading-relaxed text-xs">
                  {selectedOrder.reason}
                </p>
              </div>

              {selectedOrder.impactDelayDays ? (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] flex items-center justify-between">
                  <span className="font-bold text-rose-800 dark:text-rose-300">
                    Incidence sur le délai global d'exécution du marché :
                  </span>
                  <span className="font-mono font-black text-rose-700 dark:text-rose-400">
                    +{selectedOrder.impactDelayDays} jours calendaires
                  </span>
                </div>
              ) : null}

              {selectedOrder.linkedDocumentCode && (
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span>Pièce liée : </span>
                  <span className="font-mono font-bold text-foreground">{selectedOrder.linkedDocumentCode}</span>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2 border-t border-border flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('Impression du procès-verbal officiel au format PDF')}
                className="gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Imprimer PV</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => toast.success(`Téléchargement de ${selectedOrder.fileName || selectedOrder.number + '.pdf'}`)}
                className="gap-1.5 font-bold"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Télécharger l'original scellé</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* --- MODAL DE CRÉATION D'UN NOUVEL ORDRE DE SERVICE --- */}
      <Dialog open={isNewOrderModalOpen} onOpenChange={setIsNewOrderModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <FileCheck2 className="h-5 w-5 text-primary" />
              Émission d'un Ordre de Service (OS) / Avenant Contractuel
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Instruction officielle notifiée par le Maître d'Ouvrage (DGPC) à l'Entreprise de Travaux.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOrder} className="space-y-3.5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Type d'Ordre de Service *
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as ServiceOrderType)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground font-medium focus:ring-1 focus:ring-primary"
                >
                  <option value="ArretPartiel">OS d'Arrêt Partiel (Foncier / Réseaux / Non-conformité)</option>
                  <option value="ArretTotal">OS d'Arrêt Total (Force Majeure / Crues d'Oued)</option>
                  <option value="Reprise">OS de Reprise des Travaux (Blocage levé)</option>
                  <option value="Demarrage">OS de Démarrage d'une nouvelle phase</option>
                  <option value="AvenantDelai">Avenant de Prorogation de Délai (Bailleur)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Lot Contractuel *
                </label>
                <select
                  value={newLot}
                  onChange={(e) => setNewLot(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground font-medium focus:ring-1 focus:ring-primary"
                >
                  <option value="L01">Lot L01 · Sfax - Menzel Chaker</option>
                  <option value="L02">Lot L02 · Bir Ali Ben Khelifa</option>
                  <option value="L03">Lot L03 · Sidi Bouzid - Kasserine</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Titre officiel de l'Ordre de Service *
              </label>
              <Input
                type="text"
                placeholder="Ex : Ordre de Service d'Arrêt Partiel des Travaux — Conduite SONEDE PK 22"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Linéaire concerné (PK Début à PK Fin) *
                </label>
                <Input
                  type="text"
                  placeholder="PK 14+200 à 15+800"
                  value={newPkRange}
                  onChange={(e) => setNewPkRange(e.target.value)}
                  className="text-xs h-9 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Incidence estimée en jours de délai
                </label>
                <Input
                  type="number"
                  placeholder="15"
                  value={newDays}
                  onChange={(e) => setNewDays(e.target.value)}
                  className="text-xs h-9 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Motif juridique & technique circonstancié *
              </label>
              <textarea
                rows={3}
                placeholder="Explicitez les circonstances précises imposant l'arrêt ou la reprise, les parcelles impactées ou les non-conformités relevées..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Autorité Signataire
              </label>
              <Input
                type="text"
                value={newSignatory}
                onChange={(e) => setNewSignatory(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-border flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNewOrderModalOpen(false)}
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
                <span>Signer & Notifier au Titulaire</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
