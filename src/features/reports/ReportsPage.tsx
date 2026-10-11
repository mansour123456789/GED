import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { ReportItem, ReportType, ReportStatus } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel } from '@/components/shared/NeedPanel';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  FileText,
  BarChart3,
  Calendar,
  Send,
  CheckCircle2,
  Download,
  Plus,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Eye,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';
import { formatPercent, formatDate } from '@/utils/format';
import { toast } from 'sonner';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useSession();
  const [reports, setReports] = useState<ReportItem[]>(() => [...db.reports]);
  const [selectedLot, setSelectedLot] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Modales
  const [previewReport, setPreviewReport] = useState<ReportItem | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isTransmittalOpen, setIsTransmittalOpen] = useState(false);
  const [reportToTransmit, setReportToTransmit] = useState<ReportItem | null>(null);

  // Formulaire nouveau rapport
  const [newLotId, setNewLotId] = useState<'L01' | 'L02' | 'L03'>('L01');
  const [newType, setNewType] = useState<ReportType>('RPT-ETA');
  const [newPeriod, setNewPeriod] = useState('Octobre 2026');
  const [newSummary, setNewSummary] = useState(
    "Synthèse mensuelle des travaux : terrassements réguliers, cadences conformes au planning de référence. Vigilance maintenue sur les passages hydrauliques et la maîtrise de l'arrosage contre les poussières."
  );

  const canGenerate = currentUser.actor === 'mo' || currentUser.actor === 'amo';
  const canPublish = currentUser.actor === 'mo' || currentUser.subRole === 'mo_directeur';
  const canTransmitDonor = currentUser.actor === 'mo';

  // Filtrage
  const filtered = reports.filter((r) => {
    if (selectedLot !== 'all' && r.lotId !== selectedLot) return false;
    if (selectedType !== 'all' && r.type !== selectedType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.code.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.period.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculs KPIs
  const totalCount = reports.length;
  const publishedCount = reports.filter((r) => r.status === 'Published' || r.status === 'TransmisBailleur').length;
  const transmittedCount = reports.filter((r) => r.status === 'TransmisBailleur').length;
  const avgPhysical =
    reports.length > 0
      ? Math.round(reports.reduce((acc, r) => acc + r.progressPhysicalPct, 0) / reports.length)
      : 0;

  const handleGenerate = () => {
    // Calcul automatique basé sur la base de données actuelle
    const openNcrs = db.ncr.filter((n) => n.lotId === newLotId && n.status !== 'Cloturee').length;
    const incidents = db.incidents.filter((i) => i.lotId === newLotId).length;
    const empriseLiberated = newLotId === 'L01' ? 85 : newLotId === 'L02' ? 62 : 100;

    const newRep: ReportItem = {
      id: `rpt-${Date.now().toString(36)}`,
      code: `RN13-${newLotId}-${newType === 'RPT-ETA' ? 'RAP-ETA' : 'RAP-ES'}-2026-${Date.now().toString().slice(-4)}`,
      type: newType,
      lotId: newLotId,
      period: newPeriod,
      title: `${
        newType === 'RPT-ETA'
          ? "Rapport Mensuel d'État et d'Avancement des Travaux"
          : "Rapport Périodique de Surveillance Environnementale et Sociale"
      } — Lot ${newLotId}`,
      progressPhysicalPct: newLotId === 'L01' ? 71 : 12,
      progressFinancialPct: newLotId === 'L01' ? 65 : 10,
      openNcrCount: openNcrs,
      incidentCount: incidents,
      empriseLiberationPct: empriseLiberated,
      generatedBy: `${currentUser.fullName} (${currentUser.actorLetter})`,
      generatedAt: new Date().toISOString(),
      status: 'Brouillon',
      executiveSummary: newSummary,
    };

    db.addReport(newRep, currentUser);
    setReports([...db.reports]);
    setIsGenerateOpen(false);
    toast.success(`Rapport ${newRep.code} généré avec succès en mode Brouillon`);
  };

  const handlePublish = (id: string) => {
    db.validateReport(id, currentUser);
    setReports([...db.reports]);
    if (previewReport && previewReport.id === id) {
      setPreviewReport({ ...previewReport, status: 'Published' });
    }
    toast.success('Rapport validé et publié avec signature électronique');
  };

  const handleOpenTransmit = (rep: ReportItem) => {
    setReportToTransmit(rep);
    setIsTransmittalOpen(true);
  };

  const handleConfirmTransmit = () => {
    if (!reportToTransmit) return;
    db.transmitDonorReport(reportToTransmit.id, currentUser);
    setReports([...db.reports]);
    if (previewReport && previewReport.id === reportToTransmit.id) {
      setPreviewReport({ ...previewReport, status: 'TransmisBailleur' });
    }
    setIsTransmittalOpen(false);
    toast.success(`Rapport ${reportToTransmit.code} officiellement transmis au Bailleur (Banque Mondiale)`);
    setReportToTransmit(null);
  };

  const getStatusBadgeVariant = (st: ReportStatus) => {
    switch (st) {
      case 'TransmisBailleur':
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200';
      case 'Published':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200';
      case 'Shared':
        return 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapports d'État & Consolidations Officielles"
        description="Génération périodique des synthèses physiques, financières, contractuelles et E&S consolidées pour le Maître d'Ouvrage et les Bailleurs de Fonds."
        actions={
          canGenerate && (
            <Button
              onClick={() => setIsGenerateOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Générer un rapport consolidé
            </Button>
          )
        }
      />

      {/* 4 KPIs de synthèse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Rapports au catalogue</p>
              <p className="text-xl font-black text-foreground">{totalCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Publiés & Signés</p>
              <p className="text-xl font-black text-foreground">{publishedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Transmis Bailleur</p>
              <p className="text-xl font-black text-foreground">{transmittedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Avancement physique moy.</p>
              <p className="text-xl font-black text-foreground">{avgPhysical}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de filtres */}
      <Card className="border-border">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="text"
              placeholder="Rechercher par référence, titre, mois..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 h-8 text-xs"
            />
            <select
              value={selectedLot}
              onChange={(e) => setSelectedLot(e.target.value)}
              className="h-8 rounded-md border border-input bg-card px-2.5 text-xs text-foreground"
            >
              <option value="all">Tous les lots</option>
              <option value="L01">Lot 01 (PK 0-14)</option>
              <option value="L02">Lot 02 (PK 14-28)</option>
              <option value="L03">Lot 03 (PK 28-42)</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-8 rounded-md border border-input bg-card px-2.5 text-xs text-foreground"
            >
              <option value="all">Tous types</option>
              <option value="RPT-ETA">RPT-ETA (État & Travaux)</option>
              <option value="RPT-ES">RPT-ES (Surveillance E&S)</option>
            </select>
          </div>
          <div className="text-xs text-muted-foreground self-center">
            {filtered.length} rapport(s) affiché(s)
          </div>
        </CardContent>
      </Card>

      {/* Grille des rapports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((rep) => (
          <Card key={rep.id} className="border-border hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="outline" className="font-mono text-[10px]">
                  {rep.code}
                </Badge>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeVariant(
                    rep.status
                  )}`}
                >
                  {rep.status === 'TransmisBailleur'
                    ? 'Transmis Bailleur'
                    : rep.status === 'Published'
                    ? 'Publié Officiel'
                    : rep.status}
                </span>
              </div>
              <CardTitle
                onClick={() => navigate(`/rapports/${rep.id}`)}
                className="text-sm font-bold text-foreground mt-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
              >
                {rep.title}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                <Calendar className="h-3 w-3" />
                Période : {rep.period} | Lot {rep.lotId}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-1 flex-1 flex flex-col justify-between space-y-4">
              {/* Jauges d'indicateurs */}
              <div className="space-y-2.5 pt-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">Avancement physique</span>
                    <span className="font-bold text-foreground">{rep.progressPhysicalPct}%</span>
                  </div>
                  <Progress value={rep.progressPhysicalPct} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">Consommation financière</span>
                    <span className="font-bold text-foreground">{rep.progressFinancialPct}%</span>
                  </div>
                  <Progress value={rep.progressFinancialPct} className="h-1.5 bg-muted" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">Libération emprise foncière</span>
                    <span className="font-bold text-foreground">{rep.empriseLiberationPct}%</span>
                  </div>
                  <Progress value={rep.empriseLiberationPct} className="h-1.5" />
                </div>
              </div>

              {/* Badges de contrôle chantier */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-muted/40 p-2 rounded-md">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle
                    className={`h-3 w-3 ${rep.openNcrCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}
                  />
                  <span>NCR ouvertes : <strong>{rep.openNcrCount}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck
                    className={`h-3 w-3 ${rep.incidentCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}
                  />
                  <span>Incidents HSE : <strong>{rep.incidentCount}</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/80">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/rapports/${rep.id}`)}
                  className="text-xs h-7 gap-1 font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Eye className="h-3 w-3" />
                  Consulter
                </Button>

                <div className="flex items-center gap-1.5">
                  {canPublish && rep.status === 'Brouillon' && (
                    <Button
                      size="sm"
                      onClick={() => handlePublish(rep.id)}
                      className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Valider
                    </Button>
                  )}

                  {canTransmitDonor && rep.status === 'Published' && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenTransmit(rep)}
                      className="text-xs h-7 bg-amber-600 hover:bg-amber-700 text-white gap-1"
                    >
                      <Send className="h-3 w-3" />
                      Au Bailleur
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Consultation Détail & Signature */}
      {previewReport && (
        <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-primary font-bold">{previewReport.code}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeVariant(
                    previewReport.status
                  )}`}
                >
                  {previewReport.status}
                </span>
              </div>
              <DialogTitle className="text-base font-bold mt-1">
                {previewReport.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Généré par {previewReport.generatedBy} le {formatDate(previewReport.generatedAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              {/* Synthèse exécutive */}
              <div className="p-3 bg-muted/30 rounded-md border border-border">
                <h4 className="font-bold text-foreground mb-1 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  Synthèse exécutive & Conclusions
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {previewReport.executiveSummary}
                </p>
              </div>

              {/* Tableau comparatif des indicateurs */}
              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted font-bold text-foreground">
                    <tr>
                      <th className="p-2.5">Indicateur Clé</th>
                      <th className="p-2.5 text-right">Valeur Actuelle</th>
                      <th className="p-2.5 text-right">Objectif / Seuil</th>
                      <th className="p-2.5 text-center">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-2.5">Avancement Physique Cumulé</td>
                      <td className="p-2.5 text-right font-bold">{previewReport.progressPhysicalPct}%</td>
                      <td className="p-2.5 text-right text-muted-foreground">65%</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">Conforme</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Consommation Financière Décomptes (IPC)</td>
                      <td className="p-2.5 text-right font-bold">{previewReport.progressFinancialPct}%</td>
                      <td className="p-2.5 text-right text-muted-foreground">60%</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">Conforme</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Fiches de Non-Conformité (NCR) Actives</td>
                      <td className="p-2.5 text-right font-bold">{previewReport.openNcrCount}</td>
                      <td className="p-2.5 text-right text-muted-foreground">&lt; 5</td>
                      <td className="p-2.5 text-center text-emerald-600 font-bold">Maîtrisé</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Incidents HSE Déclarés</td>
                      <td className="p-2.5 text-right font-bold">{previewReport.incidentCount}</td>
                      <td className="p-2.5 text-right text-muted-foreground">0 grave</td>
                      <td className="p-2.5 text-center text-amber-600 font-bold">Surveillé</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Libération de l'Emprise (PAR)</td>
                      <td className="p-2.5 text-right font-bold">{previewReport.empriseLiberationPct}%</td>
                      <td className="p-2.5 text-right text-muted-foreground">100%</td>
                      <td className="p-2.5 text-center text-amber-600 font-bold">2 PAP en cours</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures et chaîne de traçabilité */}
              <div className="p-3 bg-muted/40 rounded-md border border-border flex items-center justify-between text-[11px]">
                <div>
                  <span className="font-semibold block text-foreground">Émetteur certifié :</span>
                  <span className="text-muted-foreground">{previewReport.generatedBy}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold block text-foreground">Sceau d'intégrité :</span>
                  <span className="font-mono text-[10px] text-muted-foreground">SHA256: 8f4c...3e1a</span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success('Rapport téléchargé en format PDF officiel avec horodatage.');
                }}
                className="text-xs gap-1"
              >
                <Download className="h-3 w-3" />
                Exporter PDF
              </Button>

              {canPublish && previewReport.status === 'Brouillon' && (
                <Button
                  size="sm"
                  onClick={() => handlePublish(previewReport.id)}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Valider et Signer
                </Button>
              )}

              {canTransmitDonor && previewReport.status === 'Published' && (
                <Button
                  size="sm"
                  onClick={() => {
                    setPreviewReport(null);
                    handleOpenTransmit(previewReport);
                  }}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1"
                >
                  <Send className="h-3 w-3" />
                  Transmettre au Bailleur
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Génération d'un nouveau rapport */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Générer un rapport d'état consolidé
            </DialogTitle>
            <DialogDescription className="text-xs">
              Agrégation automatique des indicateurs physiques, financiers, qualité et E&S du projet RN13.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div>
              <label className="font-semibold block text-foreground mb-1">Lot Routier</label>
              <select
                value={newLotId}
                onChange={(e) => setNewLotId(e.target.value as any)}
                className="w-full h-8 rounded-md border border-input bg-card px-2 text-xs"
              >
                <option value="L01">Lot 01 — PK 0+000 à 14+000 (Exécution active)</option>
                <option value="L02">Lot 02 — PK 14+000 à 28+000 (Passation / Attribution)</option>
                <option value="L03">Lot 03 — PK 28+000 à 42+000 (Conception / DAO)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block text-foreground mb-1">Type de Rapport</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full h-8 rounded-md border border-input bg-card px-2 text-xs"
              >
                <option value="RPT-ETA">RPT-ETA — Rapport Mensuel d'État et d'Avancement des Travaux</option>
                <option value="RPT-ES">RPT-ES — Rapport Trimestriel Surveillance E&S</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block text-foreground mb-1">Période concernée</label>
              <Input
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value)}
                placeholder="Ex: Octobre 2026"
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold block text-foreground mb-1">Synthèse & Commentaires de synthèse</label>
              <textarea
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-card p-2 text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsGenerateOpen(false)} className="text-xs">
              Annuler
            </Button>
            <Button size="sm" onClick={handleGenerate} className="text-xs bg-primary text-primary-foreground">
              Compiler et Générer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Bordereau d'envoi / Lettre de transmission au Bailleur */}
      {reportToTransmit && (
        <Dialog open={isTransmittalOpen} onOpenChange={setIsTransmittalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Send className="h-4 w-4" />
                Transmission Officielle au Bailleur de Fonds
              </DialogTitle>
              <DialogDescription className="text-xs">
                Émission du bordereau d'envoi officiel pour la Banque Mondiale (Projet RN13 - Accord de Prêt N°8924-TN).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2 text-xs bg-muted/30 p-3 rounded-md border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document transmis :</span>
                <span className="font-mono font-bold text-foreground">{reportToTransmit.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destinataire :</span>
                <span className="font-bold text-foreground">Banque Mondiale — Équipe Transport & Infrastructures</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Signataire :</span>
                <span className="font-bold text-foreground">{currentUser.fullName} (Directeur Général MO)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Canal de transmission :</span>
                <span className="text-foreground">Portail Sécurisé Client-Bailleur (CDE Interconnecté)</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsTransmittalOpen(false)} className="text-xs">
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmTransmit}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                Signer & Transmettre
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Bloc explicatif NeedPanel obligatoire */}
      <NeedPanel
        what="Consolidation périodique des données du chantier RN13 en rapports officiels d'état (RPT-ETA, RPT-ES) intégrant l'avancement physique, la consommation financière, le registre qualité (NCR) et le respect des clauses de sauvegarde sociale et environnementale."
        why="Les bailleurs de fonds internationaux (Banque Mondiale, BEI) et les tutelles ministérielles exigent une traçabilité inviolable, des indicateurs vérifiables et des bordereaux d'envoi horodatés avant tout déblocage de fonds ou approbation de phase."
        actors="Généré par l'AMO (C) et le MO (B). Validé et signé par le Directeur de Projet MO (B). Transmis avec bordereau d'envoi officiel au Chargé de Projet Bailleur (A)."
        paperVsGed="Sur support papier, la collecte des métriques prend 3 semaines avec des tableurs Excel divergents non audités. Dans la GED-RN13, la compilation est instantanée, verrouillée par signature numérique et historisée dans la piste d'audit cryptographique."
      />
    </div>
  );
};
