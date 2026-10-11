import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { PageHeader } from '@/components/layout/PageHeader';
import { NoBadge } from '@/components/shared/NoBadge';
import { DueChip } from '@/components/shared/DueChip';
import { DocCode } from '@/components/shared/DocCode';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ShieldCheck, ShieldAlert, FileText, Send, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const NonObjectionPage: React.FC = () => {
  const { currentUser } = useSession();
  const [requests, setRequests] = useState(() => db.noRequests);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [donorModalOpen, setDonorModalOpen] = useState(false);
  const [observations, setObservations] = useState('');
  const [letterRef, setLetterRef] = useState('');

  const isBailleur = currentUser.actor === 'bailleur';

  const handleOpenDecision = (req: any) => {
    setSelectedReq(req);
    setObservations(req.donorObservations || '');
    setLetterRef(req.letterRef || `WB-DEC-${Date.now().toString().slice(-4)}`);
    setDonorModalOpen(true);
  };

  const handleApplyDecision = (decision: 'NO_OBTENUE' | 'NO_OBSERVATIONS' | 'NO_REFUSEE') => {
    if (!selectedReq) return;
    db.decideNoRequest(selectedReq.id, decision, observations, letterRef, currentUser);
    setRequests([...db.noRequests]);
    setDonorModalOpen(false);
    toast.success(`Décision formelle de Non-Objection enregistrée : ${decision}`);
  };

  const needContent: NeedPanelContent = {
    screenId: 'non-objection',
    title: 'Avis de Non-Objection du Bailleur',
    purpose: 'Cet écran gère le circuit formel de demande et d\'octroi de la Non-Objection (Banque Mondiale) sur les pièces critiques : DAO, rapports d\'évaluation des offres, et avenants.',
    actors: [
      { letter: 'B', actorName: 'Maître d\'ouvrage', action: 'Constitue le dossier, rédige la lettre d\'accompagnement et transmet au Bailleur.' },
      { letter: 'A', actorName: 'Bailleur (Banque Mondiale)', action: 'Instruit le dossier et délivre formellement son avis : accord, observations ou refus.' },
      { letter: 'C', actorName: 'AMO', action: 'Vérifie au préalable qu\'aucun commentaire bloquant ne subsiste.' },
    ],
    donorRequirement: 'La convention de financement stipule qu\'aucun marché ne peut être publié ni attribué sans l\'avis écrit préalable de Non-Objection de l\'institution financière.',
    seeAlso: [
      { label: 'Cockpit du DAO', href: '#/conception/dao' },
      { label: 'Suivi de la passation', href: '#/passation' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-5">
        <PageHeader
          title="Circuit des Demandes de Non-Objection (Bailleurs)"
          subtitle="Instruction formelle Banque Mondiale / BEI / AFD sur le DAO et les marchés."
        />

        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="border hover:border-primary/40 transition-all shadow-2xs">
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">{req.number}</span>
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-muted">
                        Lot {req.lotId}
                      </span>
                      <NoBadge status={req.status as any} />
                      <DueChip dueDate={req.deadline} />
                    </div>
                    <h3 className="font-bold text-base text-foreground mt-1">{req.title}</h3>
                  </div>

                  {/* Bouton Décision pour Bailleur A ou consultation */}
                  {isBailleur && req.status === 'NO_DEMANDEE' ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleOpenDecision(req)}
                      className="font-bold text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Décider la Non-Objection</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDecision(req)}
                      className="text-xs shrink-0"
                    >
                      Détails de la décision
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {req.object}
                </p>

                {/* Pièces jointes à la demande */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-foreground">
                    Pièces contractuelles attachées à la demande :
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {req.docCodes.map((code: string) => (
                      <DocCode key={code} code={code} />
                    ))}
                  </div>
                </div>

                {/* Avis du bailleur s'il a été émis */}
                {req.donorObservations && (
                  <div className="p-3 bg-muted/50 rounded-lg border border-border/80 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span className="flex items-center gap-1.5 text-primary">
                        <ShieldCheck className="h-4 w-4" />
                        Décision rendue par : {req.decidedBy}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        Réf : {req.letterRef}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {req.donorObservations}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modale de décision du Bailleur A */}
        <Dialog open={donorModalOpen} onOpenChange={setDonorModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-600" />
                <span>Instruction de la Non-Objection — {selectedReq?.number}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedReq?.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Référence de la lettre officielle du Bailleur</label>
                <Input
                  type="text"
                  value={letterRef}
                  onChange={(e) => setLetterRef(e.target.value)}
                  placeholder="ex: WB-TUN-RN13-NO-2026-052"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Motif ou observations de l'institution</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Formulez vos observations détaillées ou conditions préalables à la publication..."
                  className="w-full h-24 p-2 text-xs rounded-md border border-input bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleApplyDecision('NO_REFUSEE')}
                className="text-xs"
              >
                Refuser la NO
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApplyDecision('NO_OBSERVATIONS')}
                className="text-xs border-amber-400 text-amber-800 hover:bg-amber-50"
              >
                NO avec observations
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleApplyDecision('NO_OBTENUE')}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Accorder la Non-Objection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
