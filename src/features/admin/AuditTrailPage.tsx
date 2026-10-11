import React, { useState } from 'react';
import { db } from '@/mock/db';
import { AuditLog, ActorLetter } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel } from '@/components/shared/NeedPanel';
import { ActorChip } from '@/components/shared/ActorChip';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Lock,
  History,
  FileCheck2,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { formatDate } from '@/utils/format';
import { toast } from 'sonner';

export const AuditTrailPage: React.FC = () => {
  const [logs] = useState<AuditLog[]>(() => [...db.auditLogs]);
  const [search, setSearch] = useState('');
  const [selectedActor, setSelectedActor] = useState<string>('all');

  const filteredLogs = logs.filter((l) => {
    if (selectedActor !== 'all' && l.actorLetter !== selectedActor) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.action.toLowerCase().includes(q) ||
        l.targetObject.toLowerCase().includes(q) ||
        l.userName.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Piste d'Audit Cryptographique (Trace Chain)"
        description="Registre immuable et horodaté de toutes les actions, approbations, commentaires et transmissions intervenus sur le CDE RN13."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Export du journal d'audit certifié au format JSON signé.")}
            className="text-xs gap-1.5"
          >
            <Download className="h-4 w-4" />
            Exporter le registre scellé
          </Button>
        }
      />

      {/* Cartes de synthèse de sécurité */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <History className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Événements tracés</p>
              <p className="text-xl font-black text-foreground">{logs.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Intégrité des blocs</p>
              <p className="text-xl font-black text-foreground">100% Conforme</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Algorithme de scellement</p>
              <p className="text-xs font-mono font-bold text-foreground">SHA-256 HMAC</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Stockage WORM</p>
              <p className="text-xl font-black text-foreground">Actif (Inviolable)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche et de filtres */}
      <Card className="border-border">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-72">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Filtrer action, objet, utilisateur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            <select
              value={selectedActor}
              onChange={(e) => setSelectedActor(e.target.value)}
              className="h-8 rounded-md border border-input bg-card px-2.5 text-xs text-foreground"
            >
              <option value="all">Tous les acteurs (A, B, C, D, E)</option>
              <option value="A">Acteur A — Bailleurs</option>
              <option value="B">Acteur B — Maître d'Ouvrage</option>
              <option value="C">Acteur C — AMO</option>
              <option value="D">Acteur D — MOE Contrôle</option>
              <option value="E">Acteur E — Entreprises Travaux</option>
            </select>
          </div>

          <span className="text-xs text-muted-foreground">
            {filteredLogs.length} entrée(s) journalisée(s)
          </span>
        </CardContent>
      </Card>

      {/* Tableau détaillé du journal */}
      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-muted-foreground border-b border-border font-semibold">
              <tr>
                <th className="p-3 w-40">Horodatage</th>
                <th className="p-3 w-28">Acteur</th>
                <th className="p-3 w-44">Utilisateur</th>
                <th className="p-3 w-48">Action</th>
                <th className="p-3 w-48">Objet Cible</th>
                <th className="p-3">Détails & Preuve</th>
                <th className="p-3 w-28 text-right">Sceau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Aucun événement d'audit ne correspond à vos filtres.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="p-3">
                      <ActorChip actorLetter={log.actorLetter} size="sm" showName={false} />
                    </td>
                    <td className="p-3 font-semibold text-foreground truncate max-w-[170px]">
                      {log.userName}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] bg-background">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-primary truncate max-w-[190px]">
                      {log.targetObject}
                    </td>
                    <td className="p-3 text-muted-foreground leading-relaxed">
                      {log.details}
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded cursor-pointer"
                        title={`Scellé cryptographique vérifié pour l'événement ${log.id}`}
                      >
                        <ShieldCheck className="h-3 w-3" />
                        Validé
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bloc explicatif NeedPanel obligatoire */}
      <NeedPanel
        what="Piste d'audit inviolable (Trace Chain) qui consigne chaque action réalisée dans le CDE de la RN13 : dépôt, visa émis, commentaire levé, attestation de non-objection, validation de décompte ou signalement d'incident HSE."
        why="En génie civil et marchés publics financés par les bailleurs de fonds, l'opposabilité juridique et le principe de non-répudiation sont obligatoires pour résoudre les litiges, réclamations d'entreprises (claims) ou pénalités de retard."
        actors="Tous les acteurs (A, B, C, D, E) voient leurs actions enregistrées. Seul l'Administrateur du Maître d'Ouvrage (B) et les auditeurs financiers peuvent exporter et auditer ce registre scellé."
        paperVsGed="Sur papier, les paraphes sont contestables, les dates de remise manuelle sont sujettes à caution et les courriers s'égarent. Dans la GED-RN13, chaque événement génère une empreinte cryptographique SHA-256 avec horodatage certain."
      />
    </div>
  );
};
