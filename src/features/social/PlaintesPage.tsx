import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { GrievanceItem } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { DueChip } from '@/components/shared/DueChip';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MessageSquareWarning, Plus, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const PlaintesPage: React.FC = () => {
  const { currentUser } = useSession();
  const [grievances, setGrievances] = useState<GrievanceItem[]>(() => db.grievances);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<GrievanceItem | null>(null);
  const [solveModalOpen, setSolveModalOpen] = useState(false);
  const [proposedSolution, setProposedSolution] = useState('');

  // Nouvelle plainte
  const [pk, setPk] = useState('12+450');
  const [category, setCategory] = useState<any>('Poussière et arrosage');
  const [complainant, setComplainant] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newG: GrievanceItem = {
      id: `grv-${Date.now().toString(36)}`,
      number: `GRIEF-2026-00${grievances.length + 50}`,
      lotId: 'L01',
      pk,
      date: new Date().toISOString(),
      category,
      complainantName: complainant.trim() || 'Anonyme',
      isAnonymous: !complainant.trim(),
      description: description.trim(),
      assignedTo: 'Leïla Trabelsi (Responsable MGP)',
      slaDueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      status: 'Recue',
    };

    db.addGrievance(newG, currentUser);
    setGrievances([...db.grievances]);
    setModalOpen(false);
    setDescription('');
    toast.success(`Plainte citoyenne enregistrée sous le numéro de suivi : ${newG.number}`);
  };

  const handleOpenSolve = (g: GrievanceItem) => {
    setSelectedGrievance(g);
    setProposedSolution(g.proposedSolution || '');
    setSolveModalOpen(true);
  };

  const handleConfirmSolve = () => {
    if (!selectedGrievance) return;
    db.updateGrievanceStatus(selectedGrievance.id, 'Cloturee', proposedSolution, currentUser);
    setGrievances([...db.grievances]);
    setSolveModalOpen(false);
    toast.success(`Plainte ${selectedGrievance.number} traitée et clôturée avec procès-verbal de satisfaction riverain.`);
  };

  const needContent: NeedPanelContent = {
    screenId: 'social-plaintes',
    title: 'Mécanisme de Gestion des Plaintes (MGP)',
    purpose: 'Ce registre enregistre et instruit les doléances des riverains et usagers (poussière, accès agricoles coupés, fissurations, bruits nocturnes) avec engagement sur les délais de traitement (SLA).',
    actors: [
      { letter: 'B', actorName: 'Maître d\'ouvrage (Resp. MGP)', action: 'Enregistre, qualifie, affecte et clôture les plaintes avec procès-verbal de satisfaction.' },
      { letter: 'E', actorName: 'Entreprise', action: 'Met en œuvre les mesures correctives sur le terrain (arrosage, passerelles provisoires).' },
      { letter: 'D', actorName: 'MOE', action: 'Constaste la résolution effective sur le chantier.' },
      { letter: 'A', actorName: 'Bailleur', action: 'Examine le taux de clôture dans les rapports d\'avancement E&S.' },
    ],
    donorRequirement: 'Norme ESS10 : obligation de maintenir un guichet d\'écoute accessible, confidentiel et impartial permettant le recours sans frais des communautés locales.',
    seeAlso: [
      { label: 'Non-Conformités de chantier (NCR)', href: '#/execution/qualite' },
      { label: 'Plan d\'Action de Réinstallation (PAR)', href: '#/social/par' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Mécanisme de Gestion des Plaintes (MGP)"
          subtitle="Suivi des réclamations citoyennes et riveraines conformément aux exigences des Bailleurs."
          actions={
            <Button
              variant="default"
              size="sm"
              onClick={() => setModalOpen(true)}
              className="gap-1.5 font-bold shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Enregistrer une plainte</span>
            </Button>
          }
        />

        <div className="space-y-4">
          {grievances.map((g) => (
            <Card key={g.id} className="border hover:border-primary/40 transition-all shadow-2xs">
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">{g.number}</span>
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-muted">
                        PK {g.pk}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {g.category}
                      </span>
                      <DueChip dueDate={g.slaDueDate} />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-foreground mt-1">
                      Plaignant : {g.complainantName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        g.status === 'Cloturee'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : g.status === 'SolutionProposee'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {g.status}
                    </span>

                    {g.status !== 'Cloturee' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenSolve(g)}
                        className="text-xs h-7 font-semibold"
                      >
                        Traiter / Clôturer
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {g.description}
                </p>

                {g.proposedSolution && (
                  <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-foreground text-[11px]">Mesure corrective adoptée :</span>
                    <p className="text-muted-foreground">{g.proposedSolution}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                  <span>Affecté à : {g.assignedTo}</span>
                  <span>Date d'enregistrement : {new Date(g.date).toLocaleDateString('fr-FR')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modale d'enregistrement de plainte */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquareWarning className="h-5 w-5 text-amber-600" />
                <span>Enregistrement d'une Plainte Citoyenne</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold">Localisation PK</label>
                  <Input type="text" value={pk} onChange={(e) => setPk(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full h-9 rounded border border-input bg-card px-2 font-semibold text-xs"
                  >
                    <option value="Poussière et arrosage">Poussière et arrosage</option>
                    <option value="Accès riverain coupé">Accès riverain coupé</option>
                    <option value="Bruit nocturne">Bruit nocturne</option>
                    <option value="Fissures sur bâti">Fissures sur bâti</option>
                    <option value="Sécurité passage piéton">Sécurité passage piéton</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Nom du plaignant (ou laisser vide pour anonyme)</label>
                <Input
                  type="text"
                  placeholder="ex: Ahmed Ben Amor ou laisser vide"
                  value={complainant}
                  onChange={(e) => setComplainant(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Description de la doléance</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Détaillez la réclamation exprimée par le citoyen..."
                  className="w-full h-24 p-2 text-xs rounded border border-input bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="default" size="sm" className="font-bold">
                  Enregistrer et émettre accusé
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modale de clôture avec solution */}
        <Dialog open={solveModalOpen} onOpenChange={setSolveModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                Clôture de la Plainte {selectedGrievance?.number}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <p className="font-semibold">{selectedGrievance?.description}</p>
              <div className="space-y-1">
                <label className="font-bold">Solution apportée & constat de satisfaction</label>
                <textarea
                  value={proposedSolution}
                  onChange={(e) => setProposedSolution(e.target.value)}
                  placeholder="Mesures de chantier réalisées et accord verbal ou signé du riverain..."
                  className="w-full h-24 p-2 rounded border border-input bg-card text-xs"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setSolveModalOpen(false)}>
                Annuler
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleConfirmSolve}
                className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Clôturer la plainte avec PV
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
