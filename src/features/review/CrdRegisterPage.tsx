import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { PageHeader } from '@/components/layout/PageHeader';
import { DocCode } from '@/components/shared/DocCode';
import { ActorChip } from '@/components/shared/ActorChip';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, AlertTriangle, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const CrdRegisterPage: React.FC = () => {
  const { currentUser } = useSession();
  const navigate = useNavigate();

  const [comments, setComments] = useState(() => db.comments);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = comments.filter((c) => {
    if (severityFilter !== 'all' && c.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.docCode.toLowerCase().includes(q) ||
        c.commentText.toLowerCase().includes(q) ||
        c.authorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleClose = (id: string) => {
    db.closeComment(id, currentUser);
    setComments([...db.comments]);
    toast.success('Commentaire validé et clos.');
  };

  const needContent: NeedPanelContent = {
    screenId: 'crd-register',
    title: 'Registre des Commentaires et Décisions (CRD)',
    purpose: 'Le registre CRD centralise l\'ensemble des observations formulées lors des revues documentaires, leur criticité, les réponses apportées et leur statut de clôture.',
    actors: [
      { letter: 'C', actorName: 'AMO', action: 'Tient le registre CRD et vérifie la qualité des réponses.' },
      { letter: 'D', actorName: 'MOE', action: 'Formule les observations sur les études d\'exécution de l\'entreprise.' },
      { letter: 'B', actorName: 'Maître d\'ouvrage', action: 'Répond aux remarques et lève les réserves bloquantes.' },
      { letter: 'E', actorName: 'Entreprise', action: 'Prend en compte les demandes de modification dans ses révisions P02.' },
    ],
    donorRequirement: 'La traçabilité des commentaires contradictoires est une exigence contractuelle pour justifier des choix techniques et éviter les réclamations ultérieures.',
    seeAlso: [
      { label: 'Matrice du Cockpit DAO', href: '#/conception/dao' },
      { label: 'Espace Documents', href: '#/documents' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-5">
        <PageHeader
          title="Registre des Commentaires & Décisions (CRD)"
          subtitle="Suivi contradictoire des observations techniques et administratives."
        />

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-card p-3 rounded-xl border border-border shadow-2xs">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher par document, article, mot-clé..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-card px-3 text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="all">Toutes les criticités</option>
              <option value="bloquant">Bloquant (Priorité 1)</option>
              <option value="majeur">Majeur</option>
              <option value="mineur">Mineur</option>
              <option value="observation">Observation</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-card px-3 text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="ouvert">Ouvert</option>
              <option value="repondu">Répondu</option>
              <option value="clos">Clos</option>
            </select>
          </div>
        </div>

        {/* Tableau CRD */}
        <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Document & Rev</TableHead>
                <TableHead>Article / Réf</TableHead>
                <TableHead>Criticité</TableHead>
                <TableHead className="w-[30%]">Commentaire & Réponse</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <div className="space-y-1">
                      <DocCode code={c.docCode} showCopy={false} />
                      <span className="text-[10px] text-muted-foreground block">
                        Rév : {c.revision}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="font-semibold text-xs text-foreground">
                    {c.pageOrArticle}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        c.severity === 'bloquant'
                          ? 'bg-rose-100 text-rose-800'
                          : c.severity === 'majeur'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {c.severity}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <p className="text-foreground leading-relaxed">{c.commentText}</p>
                      {c.responseText && (
                        <p className="text-[11px] text-primary bg-primary/5 p-1.5 rounded border border-primary/20">
                          <strong>Rép ({c.responseAuthorName}) :</strong> {c.responseText}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <ActorChip actorLetter={c.authorLetter} name={c.authorName} size="sm" />
                  </TableCell>

                  <TableCell>
                    <span
                      className={`text-xs font-bold capitalize ${
                        c.status === 'clos'
                          ? 'text-emerald-600'
                          : c.status === 'repondu'
                          ? 'text-primary'
                          : 'text-rose-600'
                      }`}
                    >
                      {c.status}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {c.status !== 'clos' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClose(c.id)}
                          className="h-7 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                          Clôturer
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/revues/${c.docId}`)}
                        className="h-7 text-xs"
                      >
                        Ouvrir
                      </Button>
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
