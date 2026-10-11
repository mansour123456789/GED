import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaskCard, TaskItemProps } from '@/components/shared/TaskCard';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, AlertTriangle, CheckCircle2, Layers, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const TasksPage: React.FC = () => {
  const { currentUser } = useSession();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'todo' | 'late' | 'done'>('todo');

  // Génération dynamique des tâches prioritaires selon le rôle
  const tasks: TaskItemProps[] = [];

  if (currentUser.actor === 'mo') {
    // 1. Documents en Shared à publier
    db.documents
      .filter((d) => d.state === 'Shared')
      .forEach((d) => {
        tasks.push({
          id: `task-doc-${d.id}`,
          title: `Publier ou statuer sur ${d.title}`,
          objectCode: d.code,
          category: d.category,
          dueDate: d.dueDate || '2026-10-15',
          isUrgent: d.hasBlockingComments,
          actorLetter: d.authorLetter,
          actorName: d.authorName,
          actionLabel: 'Examiner & Publier',
          onAction: () => navigate(`/documents/${d.id}`),
        });
      });

    // 2. Décomptes certifiés en attente de paiement
    db.ipc
      .filter((i) => i.status === 'Certifie' || i.status === 'Soumis')
      .forEach((i) => {
        tasks.push({
          id: `task-ipc-${i.id}`,
          title: `Approuver et payer le décompte ${i.number} (${i.month})`,
          objectCode: i.number,
          category: 'TRV',
          dueDate: '2026-10-14',
          isUrgent: true,
          actorLetter: 'E',
          actorName: i.contractorName,
          actionLabel: 'Approuver & Payer',
          onAction: () => navigate('/execution/decomptes'),
        });
      });

    // 3. Notification incident grave sous 48h
    db.incidents
      .filter((inc) => inc.severity === 'Grave' && inc.status === 'Declare')
      .forEach((inc) => {
        tasks.push({
          id: `task-inc-${inc.id}`,
          title: `URGENT 48h : Transmettre la notification préalable au Bailleur pour l'incident ${inc.number}`,
          objectCode: inc.number,
          category: 'HSE',
          dueDate: inc.donorNotificationDeadline || '2026-10-11T07:30:00',
          isUrgent: true,
          actorLetter: inc.declaredByActor,
          actorName: inc.declaredBy,
          actionLabel: 'Notifier Bailleur',
          onAction: () => navigate('/execution/incidents'),
        });
      });
  } else if (currentUser.actor === 'moe') {
    // 1. Documents à viser
    db.documents
      .filter((d) => d.category === 'EXE' && d.state === 'Shared')
      .forEach((d) => {
        tasks.push({
          id: `task-moe-doc-${d.id}`,
          title: `Viser l'étude d'exécution de l'entreprise : ${d.title}`,
          objectCode: d.code,
          category: 'EXE',
          dueDate: d.dueDate || '2026-10-14',
          isUrgent: false,
          actorLetter: 'E',
          actorName: d.authorName,
          actionLabel: 'Viser A/B/C/D',
          onAction: () => navigate(`/revues/${d.id}`),
        });
      });

    // 2. Décomptes à certifier
    db.ipc
      .filter((i) => i.status === 'Soumis')
      .forEach((i) => {
        tasks.push({
          id: `task-moe-ipc-${i.id}`,
          title: `Vérifier et certifier les métrés du décompte ${i.number}`,
          objectCode: i.number,
          category: 'TRV',
          dueDate: '2026-10-12',
          isUrgent: true,
          actorLetter: 'E',
          actorName: i.contractorName,
          actionLabel: 'Certifier le décompte',
          onAction: () => navigate('/execution/decomptes'),
        });
      });

    // 3. NCR ouvertes
    db.ncr
      .filter((n) => n.status === 'Ouverte')
      .forEach((n) => {
        tasks.push({
          id: `task-ncr-${n.id}`,
          title: `Contrôler la levée de non-conformité : ${n.title}`,
          objectCode: n.number,
          category: 'QUA',
          dueDate: n.deadline,
          isUrgent: n.severity === 'Critique',
          actorLetter: 'E',
          actorName: 'Entreprise Bouzid',
          actionLabel: 'Vérifier l\'action',
          onAction: () => navigate('/execution/qualite'),
        });
      });
  } else if (currentUser.actor === 'amo') {
    // Commentaires CRD ouverts
    db.comments
      .filter((c) => c.status === 'ouvert' || c.status === 'repondu')
      .forEach((c) => {
        tasks.push({
          id: `task-com-${c.id}`,
          title: `Vérifier la réponse au commentaire CRD sur ${c.pageOrArticle}`,
          objectCode: c.docCode,
          category: 'CRD',
          dueDate: '2026-10-13',
          isUrgent: c.severity === 'bloquant',
          actorLetter: c.authorLetter,
          actorName: c.authorName,
          actionLabel: 'Clôturer le commentaire',
          onAction: () => navigate('/revues/crd'),
        });
      });
  } else if (currentUser.actor === 'entreprise') {
    // 1. Documents avec visa C à corriger
    db.documents
      .filter((d) => d.visa === 'C' || (d.category === 'EXE' && d.state === 'WIP'))
      .forEach((d) => {
        tasks.push({
          id: `task-ent-doc-${d.id}`,
          title: `Reprendre la note de calcul suite au Visa C et soumettre la révision P02`,
          objectCode: d.code,
          category: 'EXE',
          dueDate: '2026-10-16',
          isUrgent: true,
          actorLetter: 'D',
          actorName: 'Walid Jaziri (MOE)',
          actionLabel: 'Déposer révision P02',
          onAction: () => navigate(`/documents/${d.id}`),
        });
      });

    // 2. NCR ouvertes à traiter
    db.ncr
      .filter((n) => n.status === 'Ouverte')
      .forEach((n) => {
        tasks.push({
          id: `task-ent-ncr-${n.id}`,
          title: `Mettre en œuvre l'action corrective : ${n.title}`,
          objectCode: n.number,
          category: 'QUA',
          dueDate: n.deadline,
          isUrgent: n.severity === 'Critique',
          actorLetter: 'D',
          actorName: n.emitterName,
          actionLabel: 'Soumettre preuve levée',
          onAction: () => navigate('/execution/qualite'),
        });
      });
  } else if (currentUser.actor === 'bailleur') {
    // Demandes de NO
    db.noRequests
      .filter((r) => r.status === 'NO_DEMANDEE')
      .forEach((r) => {
        tasks.push({
          id: `task-ba-${r.id}`,
          title: `Instruire la demande de Non-Objection : ${r.title}`,
          objectCode: r.number,
          category: 'BA',
          dueDate: r.deadline,
          isUrgent: true,
          actorLetter: 'B',
          actorName: r.submittedBy,
          actionLabel: 'Donner Non-Objection',
          onAction: () => navigate('/revues/non-objection'),
        });
      });
  }

  // Intégration des tâches contractuelles par Lot (Sous-Projets)
  db.lotTasks.forEach((lt) => {
    let isForMe = false;
    if (currentUser.actor === 'mo' && (lt.status === 'Vise_MOE' || lt.assignedActor === 'B')) isForMe = true;
    if (currentUser.actor === 'moe' && (lt.status === 'Soumis_Controle' || lt.assignedActor === 'D')) isForMe = true;
    if (currentUser.actor === 'entreprise' && lt.assignedActor === 'E') isForMe = true;
    if (currentUser.actor === 'amo' && lt.assignedActor === 'C') isForMe = true;
    if (currentUser.actor === 'bailleur' && lt.assignedActor === 'A') isForMe = true;

    if (isForMe) {
      tasks.push({
        id: `task-lot-${lt.id}`,
        title: `[Lot ${lt.lotId}] ${lt.title}`,
        objectCode: lt.code,
        category: lt.corpsEtat === 'Chaussees' || lt.corpsEtat === 'Ouvrages' ? 'TRV' : lt.corpsEtat === 'Foncier' ? 'ESI' : 'PEC',
        dueDate: lt.deadline,
        isUrgent: lt.isMilestoneCritical || lt.status === 'Bloque',
        actorLetter: lt.assignedActor,
        actorName: lt.assignedActorLabel,
        actionLabel: lt.status === 'Soumis_Controle' ? 'Viser (MOE)' : lt.status === 'Vise_MOE' ? 'Approuver (MO)' : 'Consulter Lot',
        onAction: () => navigate('/lots'),
      });
    }
  });

  // Séparation À faire vs En retard
  const nowTime = new Date('2026-10-10T09:00:00').getTime();
  const lateTasks = tasks.filter((t) => new Date(t.dueDate).getTime() < nowTime);
  const todoTasks = tasks.filter((t) => new Date(t.dueDate).getTime() >= nowTime);

  const needContent: NeedPanelContent = {
    screenId: 'tasks',
    title: 'Mes tâches (Règle d\'or N°5)',
    purpose: 'Cet écran centralise l\'ensemble des actions qui attendent votre décision ou intervention, triées par ordre de priorité et d\'échéance contractuelle.',
    actors: [
      { letter: 'A', actorName: 'Bailleur', action: 'Traite les demandes d\'avis de non-objection.' },
      { letter: 'B', actorName: 'Maître d\'ouvrage', action: 'Approuve les décomptes et publie les pièces visées.' },
      { letter: 'C', actorName: 'AMO', action: 'Clôture les avis et commentaires techniques.' },
      { letter: 'D', actorName: 'MOE', action: 'Appose les visas A/B/C/D et certifie les décomptes.' },
      { letter: 'E', actorName: 'Entreprise', action: 'Lève les non-conformités et dépose les révisions P02.' },
    ],
    donorRequirement: 'Tout retard de traitement impacte les délais d\'exécution et peut déclencher des intérêts moratoires ou des réserves lors des missions de supervision de la Banque Mondiale.',
    seeAlso: [
      { label: 'Sous-Projets & Tâches par Lot', href: '#/lots' },
      { label: 'Tableau de bord général', href: '#/' },
      { label: 'Espace Documents', href: '#/documents' },
      { label: 'Registre des Décomptes', href: '#/execution/decomptes' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Mes tâches à traiter"
          subtitle={`Vous avez ${tasks.length} tâche(s) en attente directe de votre rôle ${currentUser.subRoleLabel}.`}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/lots')}
              className="gap-2 font-bold text-xs"
            >
              <Layers className="h-4 w-4 text-sky-500" />
              <span>Cockpit des Sous-Projets par Lot</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          }
        />

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md mb-4">
            <TabsTrigger value="todo" className="gap-1.5 font-bold">
              <CheckSquare className="h-3.5 w-3.5" />
              <span>À faire ({todoTasks.length})</span>
            </TabsTrigger>
            <TabsTrigger value="late" className="gap-1.5 font-bold text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>En retard ({lateTasks.length})</span>
            </TabsTrigger>
            <TabsTrigger value="done" className="gap-1.5 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Terminées (12)</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todo" className="space-y-3">
            {todoTasks.length === 0 ? (
              <EmptyState
                title="Tout est à jour !"
                description="Aucune tâche en attente pour le moment sur votre périmètre."
              />
            ) : (
              todoTasks.map((task) => <TaskCard key={task.id} {...task} />)
            )}
          </TabsContent>

          <TabsContent value="late" className="space-y-3">
            {lateTasks.length === 0 ? (
              <EmptyState
                title="Aucun retard"
                description="Toutes vos échéances contractuelles sont actuellement respectées."
              />
            ) : (
              lateTasks.map((task) => <TaskCard key={task.id} {...task} isUrgent={true} />)
            )}
          </TabsContent>

          <TabsContent value="done" className="space-y-3">
            <div className="p-4 rounded-xl border border-border bg-card/60 text-xs text-muted-foreground text-center py-8">
              Historique des 12 dernières tâches validées par votre compte cette semaine enregistré au journal d'audit.
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
