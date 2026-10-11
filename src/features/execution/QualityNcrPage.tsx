import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { PageHeader } from '@/components/layout/PageHeader';
import { DueChip } from '@/components/shared/DueChip';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { HardHat, AlertTriangle, CheckCircle2, FlaskConical, Plus } from 'lucide-react';
import { toast } from 'sonner';

export const QualityNcrPage: React.FC = () => {
  const { currentUser } = useSession();
  const [ncrList, setNcrList] = useState(() => db.ncr);
  const [labTests, setLabTests] = useState(() => db.labTests);
  const [selectedNcr, setSelectedNcr] = useState<any | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [correctiveText, setCorrectiveText] = useState('');

  const handleOpenAction = (ncr: any) => {
    setSelectedNcr(ncr);
    setCorrectiveText(ncr.correctiveAction || '');
    setActionModalOpen(true);
  };

  const handleSaveAction = (newStatus: 'EnVerification' | 'Cloturee') => {
    if (!selectedNcr) return;
    db.updateNcrStatus(selectedNcr.id, newStatus, correctiveText, currentUser);
    setNcrList([...db.ncr]);
    setActionModalOpen(false);
    toast.success(`Fiche ${selectedNcr.number} mise à jour : Statut ${newStatus}`);
  };

  const needContent: NeedPanelContent = {
    screenId: 'execution-quality',
    title: 'Contrôle Qualité & Fiches de Non-Conformité (NCR)',
    purpose: 'Ce module centralise les résultats des essais de laboratoire (compacité Proctor, portance CBR, résistance béton) et le suivi des fiches de non-conformité émises sur le chantier.',
    actors: [
      { letter: 'D', actorName: 'MOE', action: 'Émet les NCR, fixe le délai de résolution et vérifie l\'efficacité avant clôture.' },
      { letter: 'E', actorName: 'Entreprise', action: 'Met en œuvre les actions correctives et fournit les preuves de remise en conformité.' },
      { letter: 'C', actorName: 'AMO', action: 'Audite le registre qualité et s\'assure du respect des tolérances géométriques.' },
      { letter: 'A', actorName: 'Bailleur', action: 'Consulte le taux de clôture des non-conformités critiques.' },
    ],
    donorRequirement: 'Aucune couche de chaussée ne peut être recouverte sans validation formelle des essais de compacité de la couche sous-jacente.',
    seeAlso: [
      { label: 'Conditions de démarrage des tronçons', href: '#/execution/demarrage' },
      { label: 'Décomptes mensuels des travaux', href: '#/execution/decomptes' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Qualité, Laboratoire & Non-Conformités (NCR)"
          subtitle="Surveillance des matériaux, compacités et résolutions d'anomalies sur le Lot L01."
        />

        <Tabs defaultValue="ncr" className="w-full">
          <TabsList className="grid grid-cols-2 max-w-sm mb-4">
            <TabsTrigger value="ncr" className="gap-1.5 font-bold">
              <AlertTriangle className="h-4 w-4" />
              <span>Fiches NCR ({ncrList.length})</span>
            </TabsTrigger>
            <TabsTrigger value="lab" className="gap-1.5 font-bold">
              <FlaskConical className="h-4 w-4" />
              <span>Essais Labo ({labTests.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet 1 : Fiches de Non-Conformité */}
          <TabsContent value="ncr" className="space-y-4">
            <div className="space-y-3">
              {ncrList.map((n) => (
                <Card key={n.id} className="border hover:border-primary/40 transition-all shadow-2xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/70 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{n.number}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            n.severity === 'Critique'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : n.severity === 'Majeure'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {n.severity}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted">PK {n.pk}</span>
                        <DueChip dueDate={n.deadline} />
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            n.status === 'Cloturee'
                              ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'
                              : n.status === 'EnVerification'
                              ? 'text-primary bg-primary/10'
                              : 'text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {n.status}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAction(n)}
                          className="text-xs h-7"
                        >
                          {currentUser.actor === 'moe' ? 'Gérer / Clôturer' : 'Traiter l\'action'}
                        </Button>
                      </div>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-foreground">{n.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{n.description}</p>

                    {n.correctiveAction && (
                      <div className="p-2.5 bg-muted/50 rounded-lg text-xs space-y-1">
                        <span className="font-bold text-foreground text-[11px]">Action corrective programmée :</span>
                        <p className="text-muted-foreground">{n.correctiveAction}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Onglet 2 : Essais de Laboratoire */}
          <TabsContent value="lab">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Registre des essais géotechniques et de formulation béton</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type d'essai</TableHead>
                      <TableHead>Localisation PK</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Résultat obtenu</TableHead>
                      <TableHead>Seuil contractuel CCTP</TableHead>
                      <TableHead>Laboratoire</TableHead>
                      <TableHead className="text-right">Conformité</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labTests.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-bold text-xs text-foreground">{t.testType}</TableCell>
                        <TableCell className="font-mono text-xs">PK {t.pk}</TableCell>
                        <TableCell className="text-xs">{t.date}</TableCell>
                        <TableCell className="font-mono text-xs font-bold">{t.result}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{t.threshold}</TableCell>
                        <TableCell className="text-xs">{t.labName}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                              t.isConform
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {t.isConform ? '✓ Conforme' : '✗ Non Conforme'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modale d'action corrective */}
        <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                Traitement de la Fiche {selectedNcr?.number}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <p className="font-semibold text-foreground">{selectedNcr?.title}</p>
              <div className="space-y-1">
                <label className="font-bold">Plan d'action corrective et preuves de levée</label>
                <textarea
                  value={correctiveText}
                  onChange={(e) => setCorrectiveText(e.target.value)}
                  placeholder="Détaillez les mesures prises (reprise, scarification, contre-essai)..."
                  className="w-full h-24 p-2 text-xs rounded border border-input bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSaveAction('EnVerification')}
                className="text-xs"
              >
                Soumettre pour vérification
              </Button>
              {currentUser.actor === 'moe' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleSaveAction('Cloturee')}
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Valider et Clôturer la NCR
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
