import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/store/notificationsStore';
import { useSession } from '@/store/sessionStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel } from '@/components/shared/NeedPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Clock,
  Sparkles,
  CheckCheck,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

export const NotificationsPage: React.FC = () => {
  const { alerts, unreadCount, markAsRead, markAllAsRead, triggerAlertNow, secondsUntilNextAlert } =
    useNotifications();
  const { currentUser } = useSession();
  const navigate = useNavigate();

  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterOnlyUnread, setFilterOnlyUnread] = useState(false);

  const minutes = Math.floor(secondsUntilNextAlert / 60);
  const seconds = secondsUntilNextAlert % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const filtered = alerts.filter((a) => {
    if (filterOnlyUnread && a.isRead) return false;
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    return true;
  });

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-sky-600 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centre de Notifications & Alertes Métier"
        description="Système d'alerte périodique (moteur statique de 10 min) et notifications d'événements critiques (48h Bailleurs, blocages CRD, échéances de décomptes)."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={triggerAlertNow}
              className="text-xs gap-1.5 border-amber-300 text-amber-800 dark:text-amber-300 hover:bg-amber-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Déclencher alerte test
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs gap-1.5"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tout marquer comme lu
              </Button>
            )}
          </div>
        }
      />

      {/* Bannière du moteur d'alerte périodique */}
      <Card className="border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/60">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Clock className="h-5 w-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Moteur d'alerte statique actif (intervalle : 10 minutes)
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Prochaine alerte automatique programmée dans{' '}
                <span className="font-mono font-bold text-amber-900 dark:text-amber-200">{timeFormatted}</span>.
                Chaque alerte cible des rôles spécifiques selon les délais réglementaires.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={triggerAlertNow}
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white shrink-0"
          >
            Simuler maintenant
          </Button>
        </CardContent>
      </Card>

      {/* Barre de filtres */}
      <Card className="border-border">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={filterSeverity === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSeverity('all')}
              className="text-xs h-7"
            >
              Toutes ({alerts.length})
            </Button>
            <Button
              variant={filterSeverity === 'critical' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSeverity('critical')}
              className="text-xs h-7 text-rose-700 dark:text-rose-400"
            >
              Critiques
            </Button>
            <Button
              variant={filterSeverity === 'warning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSeverity('warning')}
              className="text-xs h-7 text-amber-700 dark:text-amber-400"
            >
              Avertissements
            </Button>
            <Button
              variant={filterSeverity === 'info' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSeverity('info')}
              className="text-xs h-7 text-sky-700 dark:text-sky-400"
            >
              Informations
            </Button>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={filterOnlyUnread}
              onChange={(e) => setFilterOnlyUnread(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary"
            />
            <span>Afficher uniquement les non lues ({unreadCount})</span>
          </label>
        </CardContent>
      </Card>

      {/* Liste des notifications */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="border-border p-12 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">Aucune notification pour les critères choisis.</p>
          </Card>
        ) : (
          filtered.map((al) => (
            <Card
              key={al.id}
              onClick={() => {
                markAsRead(al.id);
                if (al.linkRoute) navigate(al.linkRoute);
              }}
              className={cn(
                "border cursor-pointer transition-all hover:border-primary/50 hover:shadow-xs",
                !al.isRead && "border-l-4 border-l-primary bg-primary/5 font-medium"
              )}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(al.severity)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-xs text-foreground">{al.title}</h4>
                      {!al.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary inline-block" />
                      )}
                      {al.hasCountdown && (
                        <Badge variant="destructive" className="text-[9px] px-1.5 py-0 animate-pulse">
                          Délai 48h Bailleur
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {al.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {formatDate(al.timestamp)} • Rôles concernés : {al.targetActors.join(', ').toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  <span className="text-xs text-primary font-semibold flex items-center gap-1 group-hover:underline">
                    Ouvrir
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <NeedPanel
        what="Centre de veille opérationnelle et d'alerte en temps réel sur les jalons critiques du chantier de la RN13."
        why="Pour éviter les pénalités contractuelles, les délais de réponse légaux (ex: 48 heures pour notifier un accident grave au bailleur, 15 jours pour certifier un décompte mensuel) doivent être notifiés activement."
        actors="Tous les acteurs (A, B, C, D, E) reçoivent les alertes correspondant à leur périmètre de responsabilité."
        paperVsGed="Sur les projets sans GED, les relances se perdent dans des courriers postaux avec cachet antidaté. Dans la GED-RN13, le chronomètre tourne automatiquement avec horodatage strict."
      />
    </div>
  );
};
