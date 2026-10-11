import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { db } from '@/mock/db';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel } from '@/components/shared/NeedPanel';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { VisaBadge } from '@/components/shared/VisaBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  FolderTree,
  AlertTriangle,
  MessageSquareWarning,
  FileSpreadsheet,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const GlobalSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryFromUrl = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(queryFromUrl);
  const [activeTab, setActiveTab] = useState<'all' | 'docs' | 'ncrs' | 'griefs' | 'ipcs'>('all');

  useEffect(() => {
    setSearchTerm(queryFromUrl);
  }, [queryFromUrl]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(searchTerm.trim() ? { q: searchTerm.trim() } : {});
  };

  const q = searchTerm.toLowerCase().trim();

  // Recherche dans les documents
  const docResults = q
    ? db.documents.filter(
        (d) =>
          d.code.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q) ||
          d.emitterName.toLowerCase().includes(q) ||
          d.lotId.toLowerCase().includes(q)
      )
    : [];

  // Recherche dans les NCRs
  const ncrResults = q
    ? db.ncr.filter(
        (n) =>
          n.number.toLowerCase().includes(q) ||
          n.title.toLowerCase().includes(q) ||
          n.pk.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q)
      )
    : [];

  // Recherche dans les Plaintes
  const griefResults = q
    ? db.grievances.filter(
        (g) =>
          g.number.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.complainantName.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q)
      )
    : [];

  // Recherche dans les Décomptes IPC
  const ipcResults = q
    ? db.ipc.filter(
        (i) =>
          i.number.toLowerCase().includes(q) ||
          i.month.toLowerCase().includes(q) ||
          i.contractorName.toLowerCase().includes(q)
      )
    : [];

  const totalResults = docResults.length + ncrResults.length + griefResults.length + ipcResults.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recherche Globale & Indexation CDE"
        description="Indexation transverse de tous les plans, fiches de non-conformité, plaintes citoyennes et décomptes par code, PK, entreprise ou mot-clé."
      />

      {/* Barre de recherche principale */}
      <Card className="border-border">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher par code RN13 (ex: CCTP, PK 12+450, terrassement, dalot, bitume)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
            </div>
            <Button type="submit" className="bg-primary text-primary-foreground h-10 px-5 text-xs">
              Rechercher
            </Button>
          </form>

          {/* Onglets de filtrage */}
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border">
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className="text-xs h-7"
            >
              Tous les résultats ({totalResults})
            </Button>
            <Button
              variant={activeTab === 'docs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('docs')}
              className="text-xs h-7 gap-1"
            >
              <FolderTree className="h-3 w-3" />
              Documents ({docResults.length})
            </Button>
            <Button
              variant={activeTab === 'ncrs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('ncrs')}
              className="text-xs h-7 gap-1"
            >
              <AlertTriangle className="h-3 w-3" />
              Non-Conformités ({ncrResults.length})
            </Button>
            <Button
              variant={activeTab === 'griefs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('griefs')}
              className="text-xs h-7 gap-1"
            >
              <MessageSquareWarning className="h-3 w-3" />
              Plaintes MGP ({griefResults.length})
            </Button>
            <Button
              variant={activeTab === 'ipcs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('ipcs')}
              className="text-xs h-7 gap-1"
            >
              <FileSpreadsheet className="h-3 w-3" />
              Décomptes IPC ({ipcResults.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      <div className="space-y-4">
        {!searchTerm ? (
          <Card className="border-border p-12 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">Saisissez un mot-clé pour lancer une recherche transverse.</p>
            <p className="text-xs mt-1">Exemples : "CCTP", "dalot", "PK 12", "retard", "bitume", "Douar".</p>
          </Card>
        ) : totalResults === 0 ? (
          <Card className="border-border p-12 text-center text-muted-foreground">
            <p className="text-sm font-semibold">Aucun élément ne correspond à votre recherche "{searchTerm}".</p>
            <p className="text-xs mt-1">Vérifiez l'orthographe ou essayez un identifiant comme "RN13" ou "L01".</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* 1. Documents */}
            {(activeTab === 'all' || activeTab === 'docs') && docResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FolderTree className="h-4 w-4 text-emerald-600" />
                  Documents & Plans ({docResults.length})
                </h3>
                <div className="space-y-2">
                  {docResults.map((d) => (
                    <Card
                      key={d.id}
                      onClick={() => navigate(`/documents/${d.id}`)}
                      className="border hover:border-primary/50 transition-all cursor-pointer p-3.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-primary">{d.code}</span>
                            <StatusBadge state={d.state} />
                            {d.lastVisa && <VisaBadge visa={d.lastVisa} />}
                          </div>
                          <p className="text-xs font-semibold text-foreground">{d.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Lot {d.lotId} • Émetteur : {d.emitterName} • Rév. {d.currentRevision}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 2. NCRs */}
            {(activeTab === 'all' || activeTab === 'ncrs') && ncrResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  Fiches de Non-Conformité ({ncrResults.length})
                </h3>
                <div className="space-y-2">
                  {ncrResults.map((n) => (
                    <Card
                      key={n.id}
                      onClick={() => navigate('/execution')}
                      className="border hover:border-primary/50 transition-all cursor-pointer p-3.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-rose-600">{n.number}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {n.severity}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              PK {n.pk}
                            </Badge>
                          </div>
                          <p className="text-xs font-semibold text-foreground">{n.title}</p>
                          <p className="text-[11px] text-muted-foreground">{n.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Plaintes */}
            {(activeTab === 'all' || activeTab === 'griefs') && griefResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquareWarning className="h-4 w-4 text-amber-600" />
                  Plaintes Citoyennes MGP ({griefResults.length})
                </h3>
                <div className="space-y-2">
                  {griefResults.map((g) => (
                    <Card
                      key={g.id}
                      onClick={() => navigate('/social')}
                      className="border hover:border-primary/50 transition-all cursor-pointer p-3.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-amber-600">{g.number}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {g.category}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">PK {g.pk}</span>
                          </div>
                          <p className="text-xs font-semibold text-foreground">{g.description}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Plaignant : {g.isAnonymous ? 'Anonyme' : g.complainantName} • Statut : {g.status}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 4. IPCs */}
            {(activeTab === 'all' || activeTab === 'ipcs') && ipcResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="h-4 w-4 text-purple-600" />
                  Décomptes Mensuels Travaux ({ipcResults.length})
                </h3>
                <div className="space-y-2">
                  {ipcResults.map((i) => (
                    <Card
                      key={i.id}
                      onClick={() => navigate('/execution')}
                      className="border hover:border-primary/50 transition-all cursor-pointer p-3.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-purple-600">{i.number}</span>
                            <Badge variant="outline" className="text-[10px]">
                              Lot {i.lotId}
                            </Badge>
                            <span className="text-[10px] font-bold text-foreground">{i.status}</span>
                          </div>
                          <p className="text-xs font-semibold text-foreground">
                            {i.month} — {i.contractorName}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            Montant net : {(i.amountNetTnd ?? 0).toLocaleString('fr-FR')} TND
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <NeedPanel
        what="Moteur de recherche unifié capable d'interroger instantanément l'ensemble des bases du projet RN13 (fichiers techniques, réclamations riveraines, non-conformités géotechniques, décomptes financiers)."
        why="Lors d'une réunion de chantier ou d'un audit de la Banque Mondiale, retrouver en 5 secondes le CCTP d'un PK spécifique ou la plainte associée évite des blocages et démontre la rigueur du management de projet."
        actors="Accessible à tous les intervenants (A, B, C, D, E) selon leurs droits de lecture."
        paperVsGed="Sur support papier, chercher un document nécessite de fouiller dans 15 classeurs d'archives physiques. Dans la GED-RN13, la recherche plein texte est instantanée."
      />
    </div>
  );
};
