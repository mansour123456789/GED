import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { formatAmount } from '@/utils/format';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Coins, CheckCircle2, ArrowRight, ShieldCheck, FileSpreadsheet, Download } from 'lucide-react';
import { toast } from 'sonner';

export const DecomptesPage: React.FC = () => {
  const { currentUser } = useSession();
  const [ipcList, setIpcList] = useState(() => db.ipc);

  const handleCertify = (id: string) => {
    db.certifyIpc(id, currentUser);
    setIpcList([...db.ipc]);
    toast.success('Décompte certifié avec succès par la maîtrise d\'œuvre.');
  };

  const handleApproveAndPay = (id: string) => {
    db.approveAndPayIpc(id, currentUser);
    setIpcList([...db.ipc]);
    toast.success('Décompte approuvé et ordonnancé pour paiement bancaire !');
  };

  const needContent: NeedPanelContent = {
    screenId: 'execution-decomptes',
    title: 'Cycle de Règlement des Décomptes Mensuels (IPC)',
    purpose: 'Ce module trace la chaîne complète de validation financière des travaux : de la soumission de l\'attachement par l\'entreprise, au visa de la MOE, jusqu\'au paiement effectif par le Maître d\'Ouvrage.',
    actors: [
      { letter: 'E', actorName: 'Entreprise', action: 'Soumet le décompte mensuel appuyé des attachements métrés signés contradictoirement.' },
      { letter: 'D', actorName: 'MOE', action: 'Vérifie les quantités, applique les retenues de garantie (10%) et certifie le montant net.' },
      { letter: 'B', actorName: 'Maître d\'ouvrage', action: 'Approuve le paiement et émet l\'ordre de virement bancaire.' },
      { letter: 'A', actorName: 'Bailleur', action: 'Consulte les attestations de décaissement dans le cadre du suivi financier.' },
    ],
    donorRequirement: 'La clause FIDIC et les règles de la Banque Mondiale fixent un délai maximal strict de 56 jours entre la soumission du décompte par l\'entreprise et son paiement effectif.',
    seeAlso: [
      { label: 'Attachements contradictoires', href: '#/execution' },
      { label: 'Rapports d\'état financiers', href: '#/rapports' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Décomptes Mensuels des Travaux (IPC)"
          subtitle="Certification des attachements et ordonnancement des paiements sur le Lot L01."
        />

        {/* Tableau récapitulatif */}
        <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Décompte</TableHead>
                <TableHead>Mois de prestation</TableHead>
                <TableHead>Entreprise titulaire</TableHead>
                <TableHead>Montant Brut HT</TableHead>
                <TableHead>Retenue Garantie (10%)</TableHead>
                <TableHead>Montant Net Payé</TableHead>
                <TableHead>Statut Actuel</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ipcList.map((ipc) => (
                <TableRow key={ipc.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono font-bold text-xs text-primary">
                    {ipc.number}
                  </TableCell>

                  <TableCell className="font-semibold text-xs text-foreground">
                    {ipc.month}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {ipc.contractorName}
                  </TableCell>

                  <TableCell className="font-mono text-xs font-semibold">
                    {formatAmount(ipc.amountGrossTnd)}
                  </TableCell>

                  <TableCell className="font-mono text-xs text-muted-foreground">
                    -{formatAmount(ipc.retentionTnd)}
                  </TableCell>

                  <TableCell className="font-mono text-sm font-black text-foreground">
                    {formatAmount(ipc.amountNetTnd)}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        ipc.status === 'Paye'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : ipc.status === 'Certifie'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {ipc.status === 'Paye' ? 'Payé' : ipc.status === 'Certifie' ? 'Certifié MOE' : 'Soumis (En attente)'}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {/* Action MOE : Certifier */}
                      {ipc.status === 'Soumis' && (currentUser.actor === 'moe' || currentUser.subRole === 'admin') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCertify(ipc.id)}
                          className="h-7 text-xs font-bold text-primary hover:bg-primary/10"
                        >
                          Certifier (MOE)
                        </Button>
                      )}

                      {/* Action MO : Approuver et Payer */}
                      {ipc.status === 'Certifie' && (currentUser.actor === 'mo' || currentUser.subRole === 'admin') && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApproveAndPay(ipc.id)}
                          className="h-7 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Approuver & Payer
                        </Button>
                      )}

                      <a
                        href="/samples/tableau.xlsx"
                        download
                        className="p-1 rounded text-muted-foreground hover:text-foreground"
                        title="Télécharger l'attachement métré Excel"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
