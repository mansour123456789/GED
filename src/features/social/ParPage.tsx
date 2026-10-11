import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { HouseholdItem, ParcelDocument } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { formatAmount } from '@/utils/format';
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
  MapPin,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Upload,
  Plus,
  Search,
  Filter,
  Check,
  Lock,
  Unlock,
  Eye,
  TreeDeciduous,
  Home,
  UserCheck,
  Download,
  FileCheck2,
} from 'lucide-react';
import { toast } from 'sonner';

export const ParPage: React.FC = () => {
  const { currentUser } = useSession();
  const [households, setHouseholds] = useState<HouseholdItem[]>(() => [...db.households]);

  // Filtres
  const [search, setSearch] = useState('');
  const [filterGov, setFilterGov] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLot, setFilterLot] = useState<string>('all');

  // Modales
  const [selectedHh, setSelectedHh] = useState<HouseholdItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isPvleOpen, setIsPvleOpen] = useState(false);

  // Formulaire Paiement
  const [payAmount, setPayAmount] = useState<number>(0);

  // Formulaire Nouvelle Parcelle
  const [newCode, setNewCode] = useState(`HH-L01-00${db.households.length + 10}`);
  const [newParcelNum, setNewParcelNum] = useState(`RN13-PARC-L01-0${db.households.length + 10}`);
  const [newLotId, setNewLotId] = useState<'L01' | 'L02' | 'L03'>('L01');
  const [newGov, setNewGov] = useState<'Sfax' | 'Sidi Bouzid' | 'Kasserine'>('Sfax');
  const [newDelegation, setNewDelegation] = useState('Menzel Chaker');
  const [newImada, setNewImada] = useState('Bou Thadi');
  const [newPk, setNewPk] = useState('14+100');
  const [newName, setNewName] = useState('Kamel Ben Hassen');
  const [newCin, setNewCin] = useState('06129844');
  const [newPhone, setNewPhone] = useState('+216 98 700 120');
  const [newFamily, setNewFamily] = useState(4);
  const [newVulnerable, setNewVulnerable] = useState(false);
  const [newVulnerableReason, setNewVulnerableReason] = useState('');

  // Détails des biens et barèmes
  const [newLandArea, setNewLandArea] = useState(3000); // m²
  const [newLandPrice, setNewLandPrice] = useState(25); // DT/m²
  const [newOlivesAdult, setNewOlivesAdult] = useState(50); // oliviers adultes
  const [newOlivesYoung, setNewOlivesYoung] = useState(10);
  const [newOtherTrees, setNewOtherTrees] = useState(5);
  const [newBuiltArea, setNewBuiltArea] = useState(0); // m² bâti
  const [newFencesLength, setNewFencesLength] = useState(80); // ml clôture
  const [newWells, setNewWells] = useState(0); // puits

  // Calcul automatique du total selon le barème officiel tunisien
  const calculatedLand = newLandArea * newLandPrice;
  const calculatedOlives = newOlivesAdult * 450 + newOlivesYoung * 120 + newOtherTrees * 180;
  const calculatedBuilt = newBuiltArea * 450 + newFencesLength * 35 + newWells * 12000;
  const calculatedVuln = newVulnerable ? 3000 : 0;
  const calculatedTotal = calculatedLand + calculatedOlives + calculatedBuilt + calculatedVuln;

  const canManage =
    currentUser.actor === 'mo' ||
    currentUser.subRole === 'mo_foncier' ||
    currentUser.subRole === 'mo_chef' ||
    currentUser.subRole === 'admin';

  // Filtrage
  const filtered = households.filter((h) => {
    if (filterGov !== 'all' && h.governorate !== filterGov) return false;
    if (filterLot !== 'all' && h.lotId !== filterLot) return false;
    if (filterStatus !== 'all' && h.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        h.headName.toLowerCase().includes(q) ||
        h.cin.includes(q) ||
        h.parcelNumber.toLowerCase().includes(q) ||
        h.pk.toLowerCase().includes(q) ||
        h.delegation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPIs
  const totalParcels = households.length;
  const totalOlives = households.reduce((sum, h) => sum + (h.olivesAdultCount || 0) + (h.olivesYoungCount || 0), 0);
  const totalBudgetTnd = households.reduce((sum, h) => sum + h.totalCompensationTnd, 0);
  const totalPaidTnd = households.reduce((sum, h) => sum + h.paidTnd, 0);
  const freeParcelsCount = households.filter((h) => h.empriseFree).length;
  const freePct = totalParcels > 0 ? Math.round((freeParcelsCount / totalParcels) * 100) : 0;

  // Actions
  const handleCreateParcel = () => {
    const item: HouseholdItem = {
      id: `hh-${Date.now().toString(36)}`,
      code: newCode,
      parcelNumber: newParcelNum,
      lotId: newLotId,
      governorate: newGov,
      delegation: newDelegation,
      imada: newImada,
      pk: newPk,
      headName: newName,
      cin: newCin,
      phone: newPhone,
      familyMembers: newFamily,
      vulnerable: newVulnerable,
      vulnerabilityReason: newVulnerableReason || undefined,
      landAreaSqm: newLandArea,
      landUnitPriceTnd: newLandPrice,
      olivesAdultCount: newOlivesAdult,
      olivesYoungCount: newOlivesYoung,
      otherTreesCount: newOtherTrees,
      builtAreaSqm: newBuiltArea,
      fencesLengthM: newFencesLength,
      wellsCount: newWells,
      totalCompensationTnd: calculatedTotal,
      paidTnd: 0,
      status: 'Recense',
      empriseFree: false,
      documents: [
        {
          id: `doc-init-${Date.now().toString(36)}`,
          name: `Fiche d'identification et copie CIN`,
          type: 'CIN',
          date: new Date().toISOString().slice(0, 10),
          fileName: `CIN_${newCin}.pdf`,
          fileSize: '1.2 Mo',
        },
      ],
    };

    db.addHousehold(item, currentUser);
    setHouseholds([...db.households]);
    setIsNewOpen(false);
    toast.success(`Parcelle ${item.parcelNumber} enregistrée avec succès pour ${item.headName} (${formatAmount(item.totalCompensationTnd)})`);
  };

  const handleSignAgreement = (h: HouseholdItem) => {
    db.signHouseholdAgreement(h.id, currentUser);
    setHouseholds([...db.households]);
    if (selectedHh && selectedHh.id === h.id) {
      setSelectedHh({ ...selectedHh, status: 'AccordSigne' });
    }
    toast.success(`Procès-verbal de conciliation amiable signé pour ${h.headName} (${h.parcelNumber})`);
  };

  const handleOpenPay = (h: HouseholdItem) => {
    setSelectedHh(h);
    setPayAmount(h.totalCompensationTnd - h.paidTnd);
    setIsPayOpen(true);
  };

  const handleConfirmPay = () => {
    if (!selectedHh) return;
    db.payHouseholdCompensation(selectedHh.id, payAmount, currentUser);
    setHouseholds([...db.households]);
    setIsPayOpen(false);
    toast.success(`Quittance de paiement enregistrée : ${formatAmount(payAmount)} versés à ${selectedHh.headName}`);
  };

  const handleOpenPvle = (h: HouseholdItem) => {
    setSelectedHh(h);
    setIsPvleOpen(true);
  };

  const handleConfirmPvle = () => {
    if (!selectedHh) return;
    db.issueLiberationPv(selectedHh.id, currentUser);
    setHouseholds([...db.households]);
    setIsPvleOpen(false);
    toast.success(`PV de Libération d'Emprise (PVLE) délivré pour le PK ${selectedHh.pk} ! Les travaux de terrassement sont désormais autorisés.`);
  };

  const needContent: NeedPanelContent = {
    screenId: 'social-par',
    title: 'Foncier, Expropriations & Indemnisations (« Arathi l\'3bed w Ta3widh »)',
    purpose: 'Gestion exhaustive des emprises foncières sur les 181 km de l\'axe RN13 (Sfax - Sidi Bouzid - Kasserine). Recensement des parcelles, barème des oliveraies, signature des conciliations amiables, versement des indemnités et délivrance du PV de libération d\'emprise (PVLE) qui débloque les travaux de terrassement.',
    actors: [
      { letter: 'B', actorName: 'Maître d\'ouvrage (Foncier)', action: 'Recense les parcelles, négocie les accords amiables, ordonne les paiements et signe les PVLE.' },
      { letter: 'C', actorName: 'AMO E&S', action: 'Audite la conformité du Plan d\'Action de Réinstallation (PAR) et vérifie les barèmes équitables.' },
      { letter: 'D', actorName: 'MOE Contrôle', action: 'Supervise le bornage topographique et refuse tout début de terrassement sans PVLE signé.' },
      { letter: 'E', actorName: 'Entreprise Travaux', action: 'Accède aux sections libérées uniquement après notification officielle du PVLE.' },
      { letter: 'A', actorName: 'Bailleur (Banque Mondiale)', action: 'Exige l\'indemnisation préalable intégrale à 100% au coût de remplacement (Norme ESS5).' },
    ],
    donorRequirement: 'Norme environnementale et sociale ESS5 de la Banque Mondiale : Aucune expulsion ni début de travaux physiques sans compensation préalable intégrale et protocole d\'accord signé.',
    seeAlso: [
      { label: 'Conditions préalables de démarrage (Gates)', href: '#/execution/jalons' },
      { label: 'Mécanisme de gestion des plaintes (MGP)', href: '#/social/plaintes' },
      { label: 'Rapports d\'état E&S', href: '#/rapports' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Foncier & Indemnisations des Parcelles (« Arathi l'3bed w Ta3widh »)"
          description="Axe RN13 (181 km) : Recensement foncier, indemnisation des oliveraies et délivrance des PV de libération d'emprise (PVLE) conditionnant les terrassements."
          actions={
            canManage && (
              <Button
                onClick={() => setIsNewOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Recenser une nouvelle parcelle
              </Button>
            )
          }
        />

        {/* 4 Cartes de Synthèse Métier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Parcelles recensées</p>
                <p className="text-xl font-black text-foreground">{totalParcels} ménages</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <TreeDeciduous className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Oliviers recensés</p>
                <p className="text-xl font-black text-foreground">{totalOlives} pieds</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Budget indemnisé</p>
                <p className="text-xl font-black text-foreground">{formatAmount(totalPaidTnd)}</p>
                <p className="text-[10px] text-muted-foreground">sur {formatAmount(totalBudgetTnd)} total</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
                <Unlock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Emprise libérée travaux</p>
                <p className="text-xl font-black text-foreground">{freePct}% libéré</p>
                <p className="text-[10px] text-emerald-600 font-semibold">{freeParcelsCount} sur {totalParcels} parcelles</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barre de filtres et recherche */}
        <Card className="border-border">
          <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher nom, CIN, parcelle, PK..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <select
                value={filterGov}
                onChange={(e) => setFilterGov(e.target.value)}
                className="h-8 rounded-md border border-input bg-card px-2.5 text-xs text-foreground font-medium"
              >
                <option value="all">Tous Gouvernorats (181 km)</option>
                <option value="Sfax">Sfax (Lot 1 & 2)</option>
                <option value="Sidi Bouzid">Sidi Bouzid (Lot 2 & 3)</option>
                <option value="Kasserine">Kasserine (Lot 3)</option>
              </select>

              <select
                value={filterLot}
                onChange={(e) => setFilterLot(e.target.value)}
                className="h-8 rounded-md border border-input bg-card px-2.5 text-xs text-foreground font-medium"
              >
                <option value="all">Tous les Lots</option>
                <option value="L01">Lot 01 (Sfax - Menzel Chaker)</option>
                <option value="L02">Lot 02 (Bir Ali - Sidi Bouzid)</option>
                <option value="L03">Lot 03 (Sidi Bouzid - Kasserine)</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-8 rounded-md border border-input bg-card px-2.5 text-xs text-foreground font-medium"
              >
                <option value="all">Tous les Statuts</option>
                <option value="Recense">Recensé (Enquête)</option>
                <option value="OffreProposee">Offre Proposée</option>
                <option value="AccordSigne">Accord Amiable Signé</option>
                <option value="PayePartiel">Payé Partiellement</option>
                <option value="Solde">Indemnité Soldée</option>
              </select>
            </div>

            <span className="text-xs text-muted-foreground self-center">
              {filtered.length} parcelle(s) affichée(s)
            </span>
          </CardContent>
        </Card>

        {/* Tableau des parcelles et propriétaires */}
        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted text-muted-foreground border-b border-border font-semibold">
                <tr>
                  <th className="p-3 w-36">Code & Parcelle</th>
                  <th className="p-3 w-48">Propriétaire / CIN</th>
                  <th className="p-3 w-44">Localisation & PK</th>
                  <th className="p-3">Consistance des Biens</th>
                  <th className="p-3 w-36 text-right">Indemnité (DT)</th>
                  <th className="p-3 w-36 text-center">Statut Foncier</th>
                  <th className="p-3 w-36 text-center">Chantier BTP</th>
                  <th className="p-3 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Aucun dossier foncier ne correspond à vos filtres.
                    </td>
                  </tr>
                ) : (
                  filtered.map((h) => (
                    <tr key={h.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-mono">
                        <span className="font-bold text-foreground block text-[11px]">{h.parcelNumber}</span>
                        <span className="text-[10px] text-muted-foreground">{h.code}</span>
                      </td>

                      <td className="p-3">
                        <p className="font-bold text-foreground text-xs">{h.headName}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">CIN : {h.cin}</p>
                        {h.vulnerable && (
                          <span className="inline-block mt-0.5 text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1 rounded font-semibold">
                            Ménage vulnérable
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <p className="font-semibold text-foreground text-xs">
                          {h.governorate} — {h.delegation}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          PK {h.pk} • {h.imada}
                        </p>
                      </td>

                      <td className="p-3 space-y-0.5 text-[11px]">
                        <p className="text-foreground">
                          Terrain : <strong>{(h.landAreaSqm ?? 0).toLocaleString()} m²</strong>
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                          Oliviers : <strong>{h.olivesAdultCount ?? 0} adultes</strong> (+{h.olivesYoungCount ?? 0} jeunes)
                        </p>
                        {((h.builtAreaSqm ?? 0) > 0 || (h.wellsCount ?? 0) > 0) && (
                          <p className="text-muted-foreground text-[10px]">
                            {(h.builtAreaSqm ?? 0) > 0 && `Bâti : ${h.builtAreaSqm} m² • `}
                            {(h.wellsCount ?? 0) > 0 && `Puits : ${h.wellsCount}`}
                          </p>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <span className="font-bold font-mono text-xs text-foreground block">
                          {formatAmount(h.totalCompensationTnd)}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Payé : {formatAmount(h.paidTnd)}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            h.status === 'Solde'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                              : h.status === 'AccordSigne'
                              ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                              : h.status === 'OffreProposee'
                              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {h.status === 'Solde'
                            ? 'Indemnité Soldée'
                            : h.status === 'AccordSigne'
                            ? 'Accord Amiable Signé'
                            : h.status === 'OffreProposee'
                            ? 'Offre Proposée'
                            : 'Recensé (Enquête)'}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        {h.empriseFree ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200">
                            <Unlock className="h-3 w-3" />
                            Emprise Libérée
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                            <Lock className="h-3 w-3" />
                            Travaux Bloqués
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon-xs"
                            onClick={() => {
                              setSelectedHh(h);
                              setIsDetailOpen(true);
                            }}
                            title="Consulter le dossier et les documents uploadés"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {canManage && h.status === 'OffreProposee' && (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleSignAgreement(h)}
                              className="text-[10px] h-6 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                              title="Signer l'accord de conciliation amiable"
                            >
                              Signer
                            </Button>
                          )}

                          {canManage && h.status === 'AccordSigne' && h.paidTnd < h.totalCompensationTnd && (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleOpenPay(h)}
                              className="text-[10px] h-6 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                              title="Enregistrer un paiement de compensation"
                            >
                              Payer
                            </Button>
                          )}

                          {canManage && !h.empriseFree && h.status === 'Solde' && (
                            <Button
                              variant="default"
                              size="xs"
                              onClick={() => handleOpenPvle(h)}
                              className="text-[10px] h-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                              title="Délivrer le PV de Libération Totale d'Emprise (PVLE)"
                            >
                              Émettre PVLE
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Panneau d'explication Métier obligatoire */}
      <NeedPanel content={needContent} />

      {/* Modal 1 : Détail Dossier & Fichiers Uploadés */}
      {selectedHh && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-primary">{selectedHh.parcelNumber}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                  Gouvernorat de {selectedHh.governorate}
                </span>
              </div>
              <DialogTitle className="text-base font-bold mt-1">
                Dossier d'Expropriation : {selectedHh.headName}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Localisation : PK {selectedHh.pk} • Délégation de {selectedHh.delegation} ({selectedHh.imada})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              {/* Récapitulatif consistance et calcul */}
              <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-lg border border-border">
                <div>
                  <p className="text-muted-foreground text-[11px]">Bénéficiaire :</p>
                  <p className="font-bold text-foreground">{selectedHh.headName}</p>
                  <p className="text-muted-foreground font-mono text-[10px]">CIN : {selectedHh.cin} • Tél : {selectedHh.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[11px]">Consistance de l'emprise :</p>
                  <p className="font-semibold text-foreground">
                    {(selectedHh.landAreaSqm ?? 0).toLocaleString()} m² de terrain agricole
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {selectedHh.olivesAdultCount ?? 0} oliviers adultes + {selectedHh.olivesYoungCount ?? 0} jeunes
                  </p>
                </div>
              </div>

              {/* Tableau du décompte financier */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted font-bold text-foreground">
                    <tr>
                      <th className="p-2.5">Poste d'Indemnisation</th>
                      <th className="p-2.5 text-center">Quantité</th>
                      <th className="p-2.5 text-right">Barème Unitaire</th>
                      <th className="p-2.5 text-right">Total (DT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-2">Terrain agricole empiété</td>
                      <td className="p-2 text-center">{selectedHh.landAreaSqm} m²</td>
                      <td className="p-2 text-right">{selectedHh.landUnitPriceTnd} DT/m²</td>
                      <td className="p-2 text-right font-bold">{formatAmount(selectedHh.landAreaSqm * selectedHh.landUnitPriceTnd)}</td>
                    </tr>
                    <tr>
                      <td className="p-2">Oliviers adultes en pleine production</td>
                      <td className="p-2 text-center">{selectedHh.olivesAdultCount} pieds</td>
                      <td className="p-2 text-right">450 DT / pied</td>
                      <td className="p-2 text-right font-bold">{formatAmount(selectedHh.olivesAdultCount * 450)}</td>
                    </tr>
                    <tr>
                      <td className="p-2">Jeunes plants d'oliviers / Amandiers</td>
                      <td className="p-2 text-center">{selectedHh.olivesYoungCount + (selectedHh.otherTreesCount || 0)} pieds</td>
                      <td className="p-2 text-right">120 - 180 DT / pied</td>
                      <td className="p-2 text-right font-bold">{formatAmount(selectedHh.olivesYoungCount * 120 + (selectedHh.otherTreesCount || 0) * 180)}</td>
                    </tr>
                    {selectedHh.vulnerable && (
                      <tr className="bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200">
                        <td className="p-2">Allocation de vulnérabilité (BM ESS5)</td>
                        <td className="p-2 text-center">Forfait</td>
                        <td className="p-2 text-right">3 000 DT</td>
                        <td className="p-2 text-right font-bold">3 000 DT</td>
                      </tr>
                    )}
                    <tr className="bg-muted/50 font-bold">
                      <td colSpan={3} className="p-2.5 text-right">TOTAL GÉNÉRAL DÉDOMMAGEMENT :</td>
                      <td className="p-2.5 text-right font-mono text-primary text-sm">
                        {formatAmount(selectedHh.totalCompensationTnd)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Documents de la chaîne de traçabilité */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <FileCheck2 className="h-4 w-4 text-primary" />
                    Pièces Justificatives & Actes Officiels ({selectedHh.documents?.length || 0})
                  </h4>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => toast.info('Sélectionnez un fichier PDF ou plan DWG à ajouter au dossier.')}
                    className="text-[10px] gap-1"
                  >
                    <Upload className="h-3 w-3" />
                    Ajouter un document
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {selectedHh.documents && selectedHh.documents.length > 0 ? (
                    selectedHh.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-2 rounded border border-border flex items-center justify-between bg-card text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-semibold text-foreground text-[11px]">{doc.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {doc.fileName} • {doc.fileSize} • Date : {doc.date}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => toast.success(`Téléchargement de ${doc.fileName}`)}
                          className="text-[10px] gap-1 text-primary"
                        >
                          <Download className="h-3 w-3" />
                          Ouvrir
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4 text-xs">
                      Aucun document attaché.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)} className="text-xs">
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal 2 : Nouveau Recensement avec Calculateur Automatique */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-600" />
              Nouveau Recensement Parcellaire & Dédommagement
            </DialogTitle>
            <DialogDescription className="text-xs">
              Saisie des relevés topographiques et calcul automatique de l'indemnisation selon les barèmes officiels tunisiens.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            {/* Étape 1 : Localisation et Propriétaire */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-muted/30 rounded-lg border border-border">
              <div>
                <label className="font-bold text-foreground block mb-1">Gouvernorat</label>
                <select
                  value={newGov}
                  onChange={(e) => {
                    const g = e.target.value as any;
                    setNewGov(g);
                    if (g === 'Sfax') setNewDelegation('Menzel Chaker');
                    else if (g === 'Sidi Bouzid') setNewDelegation('Ouled Haffouz');
                    else setNewDelegation('Sbeitla');
                  }}
                  className="w-full h-8 rounded-md border border-input bg-card px-2 text-xs"
                >
                  <option value="Sfax">Sfax (Lot 1)</option>
                  <option value="Sidi Bouzid">Sidi Bouzid (Lot 2)</option>
                  <option value="Kasserine">Kasserine (Lot 3)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Délégation</label>
                <Input
                  value={newDelegation}
                  onChange={(e) => setNewDelegation(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Point Kilométrique (PK)</label>
                <Input
                  value={newPk}
                  onChange={(e) => setNewPk(e.target.value)}
                  placeholder="Ex: 14+100"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Nom du Chef de Famille</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nom et prénom"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Numéro CIN (8 chiffres)</label>
                <Input
                  value={newCin}
                  onChange={(e) => setNewCin(e.target.value)}
                  placeholder="Ex: 06129844"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Numéro de Téléphone</label>
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+216 ...."
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Étape 2 : Biens affectés & Calculateur */}
            <div className="space-y-3 p-3 bg-card rounded-lg border border-border">
              <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <TreeDeciduous className="h-4 w-4" />
                Détail des Biens Touchés & Barème d'Indemnisation
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-muted-foreground block text-[11px] mb-1">Terrain nu (m²)</label>
                  <Input
                    type="number"
                    value={newLandArea}
                    onChange={(e) => setNewLandArea(Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block text-[11px] mb-1">Prix unitaire (DT/m²)</label>
                  <Input
                    type="number"
                    value={newLandPrice}
                    onChange={(e) => setNewLandPrice(Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block text-[11px] mb-1">Oliviers adultes (450 DT)</label>
                  <Input
                    type="number"
                    value={newOlivesAdult}
                    onChange={(e) => setNewOlivesAdult(Number(e.target.value))}
                    className="h-8 text-xs font-mono text-emerald-600 font-bold"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block text-[11px] mb-1">Jeunes oliviers (120 DT)</label>
                  <Input
                    type="number"
                    value={newOlivesYoung}
                    onChange={(e) => setNewOlivesYoung(Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block text-[11px] mb-1">Puits / Majel (12 000 DT)</label>
                  <Input
                    type="number"
                    value={newWells}
                    onChange={(e) => setNewWells(Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block text-[11px] mb-1">Clôture (ml à 35 DT)</label>
                  <Input
                    type="number"
                    value={newFencesLength}
                    onChange={(e) => setNewFencesLength(Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block text-[11px] mb-1">Bâti / Local (m² à 450 DT)</label>
                  <Input
                    type="number"
                    value={newBuiltArea}
                    onChange={(e) => setNewBuiltArea(Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-amber-700">
                    <input
                      type="checkbox"
                      checked={newVulnerable}
                      onChange={(e) => setNewVulnerable(e.target.checked)}
                      className="rounded"
                    />
                    <span>Vulnérable (+3000 DT)</span>
                  </label>
                </div>
              </div>

              {/* Total calculé en direct */}
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-md flex items-center justify-between">
                <div>
                  <span className="text-emerald-800 dark:text-emerald-200 font-bold block">
                    Montant Total Calculé de l'Indemnité :
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Terrain : {(calculatedLand ?? 0).toLocaleString()} DT • Arbres : {(calculatedOlives ?? 0).toLocaleString()} DT • Bâti/Puits : {(calculatedBuilt ?? 0).toLocaleString()} DT
                  </span>
                </div>
                <span className="font-mono font-black text-lg text-emerald-700 dark:text-emerald-300">
                  {formatAmount(calculatedTotal)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsNewOpen(false)} className="text-xs">
              Annuler
            </Button>
            <Button size="sm" onClick={handleCreateParcel} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Enregistrer la parcelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 3 : Paiement d'Indemnité */}
      {selectedHh && (
        <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-primary">
                <Coins className="h-4 w-4" />
                Règlement de l'Indemnité d'Expropriation
              </DialogTitle>
              <DialogDescription className="text-xs">
                Enregistrement de la quittance de paiement pour {selectedHh.headName} ({selectedHh.parcelNumber}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2 text-xs bg-muted/30 p-3 rounded-lg border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Indemnité totale :</span>
                <span className="font-bold text-foreground">{formatAmount(selectedHh.totalCompensationTnd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Déjà versé :</span>
                <span className="font-bold text-emerald-600">{formatAmount(selectedHh.paidTnd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reste à payer :</span>
                <span className="font-bold text-amber-600">{formatAmount(selectedHh.totalCompensationTnd - selectedHh.paidTnd)}</span>
              </div>

              <div className="pt-2 border-t border-border">
                <label className="font-bold block text-foreground mb-1">Montant à verser (DT)</label>
                <Input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="h-8 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsPayOpen(false)} className="text-xs">
                Annuler
              </Button>
              <Button size="sm" onClick={handleConfirmPay} className="text-xs bg-primary text-primary-foreground font-bold">
                Valider le versement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal 4 : Émission Officielle du Procès-Verbal de Libération d'Emprise (PVLE) */}
      {selectedHh && (
        <Dialog open={isPvleOpen} onOpenChange={setIsPvleOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-600">
                <Unlock className="h-5 w-5" />
                Délivrance du Procès-Verbal de Libération d'Emprise (PVLE)
              </DialogTitle>
              <DialogDescription className="text-xs">
                Acte officiel autorisant formellement l'Entreprise de travaux à entamer les terrassements sur la section.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2 text-xs p-3 bg-muted/40 rounded-lg border border-border">
              <div className="p-2.5 bg-background rounded border border-border space-y-1">
                <p className="font-bold text-foreground text-xs uppercase tracking-wider text-center border-b pb-1">
                  RÉPUBLIQUE TUNISIENNE — MINISTÈRE DE L'ÉQUIPEMENT ET DE L'HABITAT
                </p>
                <p className="text-[11px] text-center font-semibold text-primary">
                  Projet de Dédoublement de la RN13 (Sfax — Sidi Bouzid — Kasserine)
                </p>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <p>
                  <strong>Parcelle :</strong> {selectedHh.parcelNumber} (PK {selectedHh.pk}) — Gouvernorat de {selectedHh.governorate}.
                </p>
                <p>
                  <strong>Propriétaire :</strong> {selectedHh.headName} (CIN : {selectedHh.cin}).
                </p>
                <p>
                  <strong>Constat :</strong> L'indemnité légale de <strong>{formatAmount(selectedHh.totalCompensationTnd)}</strong> a été intégralement soldée (Quittance N°Q-{Date.now().toString().slice(-6)}).
                </p>
                <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  <strong>Décision :</strong> La parcelle est déclarée libre de toute occupation humaine, agricole ou matérielle. L'accès des engins de chantier est officiellement autorisé.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-[10px] text-muted-foreground">
                <div>
                  <p className="font-bold text-foreground">Signataire Ministère :</p>
                  <p>{currentUser.fullName} ({currentUser.subRoleLabel})</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">Mission de Contrôle :</p>
                  <p>SCET-Tunisie / Bureau agréé</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsPvleOpen(false)} className="text-xs">
                Annuler
              </Button>
              <Button size="sm" onClick={handleConfirmPvle} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Signer & Débloquer les Travaux
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
