import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { DonorRequirement, ComplianceStatus } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Globe2,
  FileCheck2,
  ShieldCheck,
  Download,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Search,
  Building2,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export const BailleursMatrixPage: React.FC = () => {
  const { currentUser } = useSession();
  const [requirements, setRequirements] = useState<DonorRequirement[]>(() => db.donorRequirements);
  const [fundingFilter, setFundingFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal de Revue
  const [selectedReq, setSelectedReq] = useState<DonorRequirement | null>(null);
  const [newStatus, setNewStatus] = useState<ComplianceStatus>('Conforme');
  const [newRemarks, setNewRemarks] = useState('');

  // Filtrage
  const filteredList = requirements.filter((req) => {
    if (fundingFilter !== 'ALL' && req.applicableFunding !== fundingFilter) return false;
    if (statusFilter !== 'ALL' && req.complianceStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        req.domainTitle.toLowerCase().includes(q) ||
        req.worldBankRef.toLowerCase().includes(q) ||
        req.eibRef.toLowerCase().includes(q) ||
        req.deliverableName.toLowerCase().includes(q) ||
        req.evidenceDocCode.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const conformeCount = requirements.filter((r) => r.complianceStatus === 'Conforme').length;
  const partielCount = requirements.filter((r) => r.complianceStatus === 'Partiellement_Conforme').length;

  const handleOpenReview = (req: DonorRequirement) => {
    setSelectedReq(req);
    setNewStatus(req.complianceStatus);
    setNewRemarks(req.reviewRemarks);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    const updated = db.updateDonorRequirementStatus(selectedReq.id, newStatus, newRemarks, currentUser);
    if (updated) {
      setRequirements(requirements.map((r) => (r.id === updated.id ? updated : r)));
    }
    setSelectedReq(null);
    toast.success(`Avis d'audit enregistré pour ${selectedReq.domainTitle}`);
  };

  const handleDownloadEvidence = (req: DonorRequirement) => {
    const content = `PREUVE DE CONFORMITÉ BAILLEUR (BANQUE MONDIALE & BEI)\nCode Exigence: ${req.id} - ${req.domainTitle}\nRéférence BM: ${req.worldBankRef}\nRéférence BEI: ${req.eibRef}\nDocument: ${req.evidenceDocCode} (Version ${req.evidenceDocVersion})\nTitre: ${req.evidenceTitle}\nLivrable: ${req.deliverableName}\nResponsable: Acteur ${req.responsibleActor}\nStatut de revue: ${req.complianceStatus}\nDernière vérification: ${req.lastReviewDate} par ${req.reviewerName}\nRemarques: ${req.reviewRemarks}\nEmpreinte Probante SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`;
    const blob = new Blob([content], { type: req.evidenceFormat === 'EXCEL' ? 'text/csv' : 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${req.evidenceDocCode}_${req.evidenceDocVersion}.${req.evidenceFormat === 'EXCEL' ? 'csv' : 'pdf'}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.info(`Téléchargement de la pièce probante : ${req.evidenceDocCode}`);
  };

  const handleExportAuditManifest = () => {
    const manifest = {
      projet: "RN13 Kasserine - Sfax 2x2 Voies",
      bailleurs: [
        { nom: "Banque Mondiale (BM)", pret: "P167389 / Prêt 9122-TN", cadre: "Cadre Environnemental et Social (NES 1 à 10)" },
        { nom: "Banque Européenne d'Investissement (BEI)", contrat: "Finance 2024", cadre: "Normes Environnementales et Sociales (Normes 1 à 10)" }
      ],
      dateExport: new Date().toISOString(),
      auditeurResponsable: currentUser.fullName,
      conformiteGlobale: `${conformeCount} / ${requirements.length} Exigences Conformes`,
      matriceExigences: requirements.map((r) => ({
        domaine: r.domainTitle,
        bm: r.worldBankRef,
        bei: r.eibRef,
        livrable: r.deliverableName,
        preuveCode: r.evidenceDocCode,
        version: r.evidenceDocVersion,
        statut: r.complianceStatus,
        dateRevue: r.lastReviewDate,
        auditeur: r.reviewerName,
        sha256: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
      }))
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Manifeste_Audit_Bailleurs_RN13_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Manifeste officiel d\'audit JSON téléchargé avec succès');
  };

  const needContent: NeedPanelContent = {
    screenId: 'bailleurs-conformite',
    title: 'Matrice Bailleurs : 10 Domaines BM vs BEI',
    purpose: 'Ce tableau de bord formalise la conformité contractuelle exigée par les bailleurs de fonds (Banque Mondiale et BEI) selon la Section 7 du document de conception v1.0. Chaque domaine est audité et rattaché à une pièce probante scellée.',
    actors: [
      { letter: 'A', actorName: 'Bailleurs (BM & BEI)', action: 'Vérifie les rapports E&S, accorde les avis de non-objection (ANO) et valide les décaissements.' },
      { letter: 'B', actorName: 'Maître d\'Ouvrage', action: 'Rend compte de l\'état d\'avancement des plans d\'action et garantit la conformité foncière.' },
      { letter: 'C', actorName: 'AMO', action: 'Assiste la DGPC dans la consolidation des rapports d\'audit semestriels.' },
      { letter: 'D', actorName: 'MOE / Contrôle', action: 'Fournit les attestations de conformité technique, d\'arrosage et de sécurité des usagers.' },
    ],
    donorRequirement: 'Le maintien du statut éligible aux tirages de fonds requiert un taux de conformité supérieur ou égal à 85% sur les 10 normes environnementales et sociales.',
    seeAlso: [
      { label: 'Foncier & PAR (14 000 Oliviers)', href: '#/social/par' },
      { label: 'Sécurité Routière & SST', href: '#/securite-routiere' },
      { label: 'Bordereaux de Transmission', href: '#/bordereaux-transmission' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Matrice de Conformité & Preuves Bailleurs"
          subtitle="Banque Mondiale (NES 1 à 10) ⟷ BEI (Normes 1 à 10) • Section 7 du Document de Conception"
          actions={
            <Button
              size="sm"
              onClick={handleExportAuditManifest}
              className="gap-2 font-bold text-xs"
            >
              <Download className="h-4 w-4" />
              <span>Exporter l'Audit (JSON)</span>
            </Button>
          }
        />

        {/* 4 Indicateurs de conformité */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">Domaines Audités</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-foreground">{requirements.length} / 10</span>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30 font-bold">
                  100%
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">BM & BEI alignés</span>
            </CardContent>
          </Card>

          <Card className="border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">Livrables Conformes</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-600">{conformeCount}</span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 font-bold">
                  Validés
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Preuves rattachées</span>
            </CardContent>
          </Card>

          <Card className="border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">Partiellement Conformes</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-600">{partielCount}</span>
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 font-bold">
                  En cours
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Foncier Lot 2 en solde</span>
            </CardContent>
          </Card>

          <Card className="border shadow-2xs">
            <CardContent className="p-4">
              <span className="text-[11px] text-muted-foreground block font-medium">Taux Global de Conformité</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-primary">90%</span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 font-bold">
                  Seuil 85%
                </Badge>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">Éligibilité tirages OK</span>
            </CardContent>
          </Card>
        </div>

        {/* Barre de Filtre & Recherche */}
        <Card className="border shadow-2xs">
          <CardContent className="p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Rechercher par domaine, réf NES/BEI, code pièce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-semibold">Financement :</span>
                <select
                  value={fundingFilter}
                  onChange={(e) => setFundingFilter(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="ALL">Tous les financements</option>
                  <option value="Cofinancement_Conjoint">Cofinancement Conjoint (BM + BEI)</option>
                  <option value="BM_Pret_9122">Banque Mondiale (Prêt 9122)</option>
                  <option value="BEI_Finance_2024">BEI Finance 2024</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-semibold">Statut :</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="Conforme">Conforme</option>
                  <option value="Partiellement_Conforme">Partiellement Conforme</option>
                  <option value="En_Revue">En Revue</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table de la matrice */}
        <Card className="border shadow-2xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center font-bold">N°</TableHead>
                <TableHead className="font-bold">Domaine de Conformité</TableHead>
                <TableHead className="font-bold">Norme BM / BEI</TableHead>
                <TableHead className="font-bold">Livrable & Acteur</TableHead>
                <TableHead className="font-bold">Preuve Rattachée</TableHead>
                <TableHead className="text-center font-bold">Statut Revue</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.map((req) => (
                <TableRow key={req.id} className="hover:bg-muted/30">
                  <TableCell className="text-center font-bold text-muted-foreground">
                    {req.domainNumber}
                  </TableCell>

                  <TableCell className="font-bold text-foreground max-w-xs">
                    <div>{req.domainTitle}</div>
                    <div className="text-[11px] text-muted-foreground font-normal line-clamp-1 mt-0.5">
                      {req.description}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-[10px] font-bold text-blue-700 dark:text-blue-300 border-blue-300 block w-fit">
                        BM: {req.worldBankRef}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border-indigo-300 block w-fit">
                        BEI: {req.eibRef}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-semibold text-xs text-foreground">{req.deliverableName}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Acteur {req.responsibleActor} • Échéance : {req.deadline}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        className={`text-[9px] font-black uppercase ${
                          req.evidenceFormat === 'EXCEL'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {req.evidenceFormat}
                      </Badge>
                      <span className="font-mono text-xs font-bold text-primary">
                        {req.evidenceDocCode}
                      </span>
                      <span className="text-[10px] text-muted-foreground">({req.evidenceDocVersion})</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-xs mt-0.5">
                      {req.evidenceTitle}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      className={`text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                        req.complianceStatus === 'Conforme'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : req.complianceStatus === 'Partiellement_Conforme'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {req.complianceStatus === 'Conforme' && <CheckCircle2 className="h-3 w-3" />}
                      {req.complianceStatus === 'Partiellement_Conforme' && <AlertTriangle className="h-3 w-3" />}
                      <span>
                        {req.complianceStatus === 'Conforme'
                          ? 'Conforme'
                          : req.complianceStatus === 'Partiellement_Conforme'
                          ? 'Partiel'
                          : 'En Revue'}
                      </span>
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadEvidence(req)}
                        className="h-7 w-7 text-primary hover:text-primary/80"
                        title="Télécharger la preuve officielle"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReview(req)}
                        className="text-xs h-7 font-bold"
                      >
                        Revue
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Modal de Revue d'Exigence */}
        {selectedReq && (
          <Dialog open={!!selectedReq} onOpenChange={() => setSelectedReq(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                  <Scale className="h-5 w-5 text-primary" />
                  <span>Revue de Conformité • Domaine {selectedReq.domainNumber}</span>
                </DialogTitle>
              </DialogHeader>

              <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
                <div className="font-bold text-foreground">{selectedReq.domainTitle}</div>
                <div className="text-muted-foreground">
                  BM : <strong className="text-foreground">{selectedReq.worldBankRef}</strong> • BEI : <strong className="text-foreground">{selectedReq.eibRef}</strong>
                </div>
                <div className="text-muted-foreground font-mono">
                  Preuve : {selectedReq.evidenceDocCode} ({selectedReq.evidenceDocVersion})
                </div>
              </div>

              <form onSubmit={handleSaveReview} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Décision d'Audit & Statut de Conformité
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ComplianceStatus)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="Conforme">Conforme (Preuve probante acceptée)</option>
                    <option value="Partiellement_Conforme">Partiellement Conforme (Réserves mineures)</option>
                    <option value="En_Revue">En Cours de Revue</option>
                    <option value="Action_Requise">Action Requise / Non-Conforme</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Observations motivées de l'Auditeur
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newRemarks}
                    onChange={(e) => setNewRemarks(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                    placeholder="Justification motivée de la décision..."
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedReq(null)}>
                    Annuler
                  </Button>
                  <Button type="submit" size="sm" className="font-bold">
                    Enregistrer l'Avis de Revue
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
