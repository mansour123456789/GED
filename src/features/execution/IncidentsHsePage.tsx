import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Clock, ShieldAlert, Send, Plus, CheckCircle2, Siren } from 'lucide-react';
import { toast } from 'sonner';

export const IncidentsHsePage: React.FC = () => {
  const { currentUser } = useSession();
  const [incidents, setIncidents] = useState(() => db.incidents);
  const [modalOpen, setModalOpen] = useState(false);

  // Formulaire de déclaration
  const [pk, setPk] = useState('5+850');
  const [nature, setNature] = useState('Accident engin');
  const [severity, setSeverity] = useState<'Faible' | 'Moyenne' | 'Grave'>('Grave');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [injuredCount, setInjuredCount] = useState(0);

  const handleDeclareIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newInc = {
      id: `inc-${Date.now().toString(36)}`,
      number: `INC-2026-00${incidents.length + 10}`,
      lotId: 'L01',
      pk,
      date: new Date().toISOString(),
      title: title.trim(),
      nature: nature as any,
      severity,
      injuredCount: Number(injuredCount),
      description: description.trim(),
      declaredBy: `${currentUser.fullName} (${currentUser.actorLabel})`,
      declaredByActor: currentUser.actorLetter,
      donorNotificationDeadline: severity === 'Grave' ? new Date(Date.now() + 48 * 3600 * 1000).toISOString() : undefined,
      status: 'Declare' as const,
    };

    db.addIncident(newInc, currentUser);
    setIncidents([...db.incidents]);
    setModalOpen(false);
    setTitle('');
    setDescription('');
    toast.success(`Incident ${newInc.number} déclaré avec succès.`);

    if (severity === 'Grave') {
      toast.error('ALERTE CRITIQUE : Compte à rebours de 48 heures déclenché pour notification au Bailleur !', {
        duration: 9000,
      });
    }
  };

  const handleNotifyDonor = (id: string) => {
    db.notifyDonorIncident(id, currentUser);
    setIncidents([...db.incidents]);
    toast.success('Le Bailleur (Banque Mondiale) a été formellement notifié par télétransmission officielle sous le délai de 48h.');
  };

  const needContent: NeedPanelContent = {
    screenId: 'execution-incidents',
    title: 'HSE & Notification d\'Incidents Graves (48h)',
    purpose: 'Ce module permet de consigner immédiatement tout incident de chantier et de gérer la procédure impérative de notification préalable au Bailleur en moins de 48 heures.',
    actors: [
      { letter: 'E', actorName: 'Entreprise', action: 'Déclare tout événement dès survenance sur le chantier (y compris sur smartphone).' },
      { letter: 'D', actorName: 'MOE', action: 'Vérifie les faits, examine les mesures d\'urgence et valide l\'analyse des causes.' },
      { letter: 'B', actorName: 'Maître d\'ouvrage', action: 'Transmet la notification préalable officielle à la Banque Mondiale sous 48h.' },
      { letter: 'A', actorName: 'Bailleur', action: 'Reçoit l\'alerte immédiate et suit les mesures correctives adoptées.' },
    ],
    donorRequirement: 'Exigence contractuelle stricte des bailleurs internationaux : tout accident grave avec dommage corporel ou pollution majeure doit être notifié au chef de projet de la Banque Mondiale sous 48 heures maximum.',
    seeAlso: [
      { label: 'Conditions de démarrage des travaux', href: '#/execution/demarrage' },
      { label: 'Rapport trimestriel E&S', href: '#/rapports' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Hygiène, Sécurité & Gestion des Incidents (HSE)"
          subtitle="Déclaration, analyse des causes et notification préalable 48h au Bailleur."
          actions={
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setModalOpen(true)}
              className="gap-1.5 font-bold shadow-sm"
            >
              <Siren className="h-4 w-4" />
              <span>Déclarer un incident</span>
            </Button>
          }
        />

        {/* Liste des incidents */}
        <div className="space-y-4">
          {incidents.map((inc) => (
            <Card
              key={inc.id}
              className={`border transition-all shadow-2xs ${
                inc.severity === 'Grave'
                  ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20'
                  : 'border-border bg-card'
              }`}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">{inc.number}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          inc.severity === 'Grave'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : inc.severity === 'Moyenne'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        Gravité {inc.severity}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted font-semibold">
                        PK {inc.pk}
                      </span>
                      <span className="text-xs text-muted-foreground">{inc.nature}</span>
                    </div>
                    <h3 className="font-bold text-base text-foreground mt-1">{inc.title}</h3>
                  </div>

                  {/* Bouton de notification 48h */}
                  {inc.severity === 'Grave' && inc.status === 'Declare' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleNotifyDonor(inc.id)}
                      className="font-bold text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shrink-0 animate-pulse"
                    >
                      <Send className="h-4 w-4" />
                      <span>Notifier le Bailleur (48h)</span>
                    </Button>
                  )}

                  {inc.status === 'BailleurNotifie' && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 rounded-full shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                      Bailleur Notifié dans les délais
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {inc.description}
                </p>

                {/* Bannière de compte à rebours 48h */}
                {inc.severity === 'Grave' && inc.status === 'Declare' && (
                  <div className="p-3 bg-rose-100/70 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-900 rounded-lg flex items-center justify-between text-xs text-rose-900 dark:text-rose-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-rose-600 animate-spin" />
                      <span>
                        <strong>Compte à rebours 48 heures :</strong> Le Bailleur doit être formellement avisé avant le <strong>11/10/2026 à 07:30</strong>.
                      </span>
                    </div>
                    <span className="font-mono font-bold text-rose-700 bg-white/60 dark:bg-rose-900/50 px-2 py-0.5 rounded">
                      Reste 22h 30min
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                  <span>Déclaré par : {inc.declaredBy}</span>
                  <span>Date : {inc.date ? new Date(inc.date).toLocaleString('fr-FR') : '—'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modale de déclaration d'incident */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
                <Siren className="h-5 w-5" />
                <span>Déclaration d'un Incident de Chantier</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleDeclareIncident} className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold">Localisation (PK)</label>
                  <Input type="text" value={pk} onChange={(e) => setPk(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="font-bold">Gravité</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full h-9 rounded border border-input bg-card px-2 font-bold"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Grave">Grave (Déclenche chrono 48h)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Nature de l'incident</label>
                <select
                  value={nature}
                  onChange={(e) => setNature(e.target.value)}
                  className="w-full h-9 rounded border border-input bg-card px-2"
                >
                  <option value="Accident engin">Accident engin / circulation</option>
                  <option value="Pollution accidentelle hydrocarbures">Pollution accidentelle hydrocarbures</option>
                  <option value="Chute de hauteur">Chute de hauteur / coffrage</option>
                  <option value="Éboulement tranchée">Éboulement de talus / tranchée</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold">Intitulé succinct</label>
                <Input
                  type="text"
                  placeholder="ex: Renversement dumper lors du déchargement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Description circonstanciée des faits</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Circonstances, blessés éventuels, mesures d'urgence immédiates..."
                  className="w-full h-20 p-2 rounded border border-input bg-card text-xs"
                  required
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="destructive" size="sm" className="font-bold">
                  Enregistrer l'incident
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
