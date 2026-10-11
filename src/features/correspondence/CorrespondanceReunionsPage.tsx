import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { db } from '@/mock/db';
import { useSession } from '@/store/sessionStore';
import {
  MeetingMinute,
  ObservationNote,
  CorrespondenceLetter,
  MonthlyReport12Point,
} from '@/types';
import {
  Users,
  FileText,
  Mail,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Paperclip,
  Download,
  Plus,
  Send,
  Eye,
  CheckSquare,
  Building2,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export const CorrespondanceReunionsPage: React.FC = () => {
  const { currentUser } = useSession();
  const [activeTab, setActiveTab] = useState('reunions');

  // État local réactif depuis db
  const [meetings, setMeetings] = useState<MeetingMinute[]>(db.meetings);
  const [observationNotes, setObservationNotes] = useState<ObservationNote[]>(db.observationNotes);
  const [correspondence, setCorrespondence] = useState<CorrespondenceLetter[]>(db.correspondence);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport12Point[]>(db.monthlyReports);

  // Sélections pour modales de détails
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingMinute | null>(null);
  const [selectedNote, setSelectedNote] = useState<ObservationNote | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<CorrespondenceLetter | null>(null);

  // Modales de création
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [isNewLetterOpen, setIsNewLetterOpen] = useState(false);

  // Réponses entreprise aux observations
  const [respondingItemId, setRespondingItemId] = useState<string | null>(null);
  const [contractorResponseText, setContractorResponseText] = useState('');

  // Formulaire Réunion
  const [formMtgTitle, setFormMtgTitle] = useState('');
  const [formMtgType, setFormMtgType] = useState<'Chantier' | 'Technique' | 'HSE_ES'>('Chantier');
  const [formMtgLot, setFormMtgLot] = useState('L01');
  const [formMtgDate, setFormMtgDate] = useState('2026-10-15');
  const [formMtgLocation, setFormMtgLocation] = useState('Base vie Soroubat - PK 06+500');

  // Formulaire Note d'observation
  const [formNoDomain, setFormNoDomain] = useState<'Signalisation' | 'Chaussee' | 'Ouvrage_Art' | 'Securite_Usagers' | 'Environnement'>('Signalisation');
  const [formNoTitle, setFormNoTitle] = useState('');
  const [formNoLot, setFormNoLot] = useState('L01');
  const [formNoPk, setFormNoPk] = useState('PK 03+200');
  const [formNoFinding, setFormNoFinding] = useState('');
  const [formNoClause, setFormNoClause] = useState('CCTP Fascicule 1 Art. 7.3');
  const [formNoMeasure, setFormNoMeasure] = useState('');

  // Formulaire Courrier
  const [formCorDirection, setFormCorDirection] = useState<'Entrant' | 'Sortant'>('Sortant');
  const [formCorExtRef, setFormCorExtRef] = useState('');
  const [formCorObject, setFormCorObject] = useState('');
  const [formCorSender, setFormCorSender] = useState('Mission de Contrôle SCET-Tunisie');
  const [formCorRecipient, setFormCorRecipient] = useState('Entreprise SOROUBAT');
  const [formCorChannel, setFormCorChannel] = useState<'Porteur_Decharge' | 'Courrier_Recommande' | 'Courriel_Officiel'>('Porteur_Decharge');
  const [formCorDeadline, setFormCorDeadline] = useState('2026-10-25');

  const needContent: NeedPanelContent = {
    title: 'Section 23 : Réunions, Notes d\'Observations & Correspondances',
    purpose:
      "Gestion centralisée des registres contractuels de la RN13 : PV de chantiers et comités techniques, notes d'observations formelles numérotées (TN-R2X2-L01-NO-000045) avec réponses obligatoires, fil de correspondances officielles et rapport mensuel structuré en 12 points arrêté à date de coupure.",
    actors: [
      { letter: 'B', actorName: 'Maître d\'Ouvrage (DGPC)', action: 'Approbation des décisions structurantes et visa des rapports mensuels' },
      { letter: 'D', actorName: 'Mission de Contrôle (SCET)', action: 'Rédaction des PV, émission des notes d\'observations et courriers de mise en demeure' },
      { letter: 'E', actorName: 'Entreprise (Soroubat/ETEP)', action: 'Réponse motivée aux observations, transmission des décomptes et preuves de levée' },
      { letter: 'C', actorName: 'AMO / Experts Spécialisés', action: 'Observations techniques, sécurité routière et suivi des délais' },
    ],
    donorRequirement:
      'Gouvernance transparente BEI / Banque Mondiale : Tout arbitrage ou engagement financier/délai doit être étayé par un PV signé ou une notification contractuelle probante.',
    seeAlso: [
      { label: 'Bordereaux de Transmission', href: '/bordereaux-transmission' },
      { label: 'Rapports d\'état officiels', href: '/rapports' },
      { label: 'Ordres de Service (OS)', href: '/execution/os' },
    ],
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const newMtg: MeetingMinute = {
      id: `MTG-${Date.now().toString(36).toUpperCase()}`,
      number: `PV-${formMtgType.slice(0, 2).toUpperCase()}-2026-${String(meetings.length + 25).padStart(3, '0')}`,
      type: formMtgType,
      title: formMtgTitle,
      lotId: formMtgLot,
      date: formMtgDate,
      location: formMtgLocation,
      attendees: [
        { name: currentUser.fullName, org: currentUser.actorLabel, role: currentUser.subRoleLabel, present: true },
        { name: 'M. Saiefeddine', org: 'Expert Sécurité Routière', role: 'Auditeur ASR', present: true },
        { name: 'Ing. Mehdi Riahi', org: 'DGPC / Ministère', role: 'Chef de Projet', present: true },
      ],
      agenda: ['Examen des travaux de la semaine', 'Points d\'arrêt et levée des réserves', 'Sécurité de la circulation'],
      decisions: [
        {
          id: `DEC-${Date.now().toString(36)}`,
          decisionNumber: `DEC-${meetings.length + 25}/01`,
          subject: 'Transmission du planning recalé sous 7 jours ouvrés',
          assignedTo: 'SOROUBAT BTP',
          deadline: '2026-10-22',
          status: 'En_Cours',
        },
      ],
      status: 'Diffuse_Commentaires',
      signedPdfFile: `PV_${formMtgType}_Chantier_${formMtgDate}.pdf`,
      notes: 'Rédigé en séance et diffusé pour commentaires.',
    };

    db.addMeeting(newMtg, currentUser);
    setMeetings([...db.meetings]);
    setIsNewMeetingOpen(false);
    setFormMtgTitle('');
    toast.success(`PV de réunion ${newMtg.number} enregistré`);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    const noteCode = `TN-R2X2-${formNoLot}-NO-${String(observationNotes.length + 47).padStart(6, '0')}`;
    const newNote: ObservationNote = {
      id: `NO-${Date.now().toString(36).toUpperCase()}`,
      code: noteCode,
      lotId: formNoLot,
      domain: formNoDomain,
      title: formNoTitle,
      authorName: `${currentUser.fullName} (${currentUser.actorLabel})`,
      authorOrg: currentUser.actorLabel,
      recipientOrg: 'Entreprise SOROUBAT',
      dateEmission: new Date().toISOString().slice(0, 10),
      deadline: '2026-10-18',
      pk: formNoPk,
      status: 'Ouverte',
      items: [
        {
          itemNumber: `${noteCode.split('-').pop()}/01`,
          factualFinding: formNoFinding,
          clauseRef: formNoClause,
          requestedMeasure: formNoMeasure,
          riskPriority: 'Critique',
          responseStatus: 'En_Attente',
          verificationResult: 'En_Verification',
        },
      ],
    };

    db.addObservationNote(newNote, currentUser);
    setObservationNotes([...db.observationNotes]);
    setIsNewNoteOpen(false);
    setFormNoTitle('');
    setFormNoFinding('');
    setFormNoMeasure('');
    toast.success(`Note d'observations ${newNote.code} émise vers l'entreprise`);
  };

  const handleCreateLetter = (e: React.FormEvent) => {
    e.preventDefault();
    const internalNum = `COR-2026-${formCorDirection === 'Entrant' ? 'ENT' : 'SOR'}-${String(correspondence.length + 150).padStart(4, '0')}`;
    const newLetter: CorrespondenceLetter = {
      id: `COR-${Date.now().toString(36).toUpperCase()}`,
      direction: formCorDirection,
      internalNumber: internalNum,
      externalRef: formCorExtRef || 'REF-EXT-AUTO',
      lotId: 'L01',
      objectTitle: formCorObject,
      senderOrg: formCorSender,
      senderPerson: currentUser.fullName,
      recipientOrg: formCorRecipient,
      recipientPerson: 'Direction de Projet',
      dateDocument: new Date().toISOString().slice(0, 10),
      dateReceivedSent: new Date().toISOString().slice(0, 10),
      channel: formCorChannel,
      hasDeadline: true,
      deadlineDate: formCorDeadline,
      status: 'En_Attente_Reponse',
      attachments: [{ name: 'Lettre_Officielle_Signee.pdf', sizeMb: 1.8 }],
      downloadFileName: `${internalNum}.pdf`,
    };

    db.addCorrespondence(newLetter, currentUser);
    setCorrespondence([...db.correspondence]);
    setIsNewLetterOpen(false);
    setFormCorObject('');
    setFormCorExtRef('');
    toast.success(`Courrier ${newLetter.internalNumber} enregistré au registre probant`);
  };

  const handleSubmitContractorResponse = (noteId: string, itemNum: string) => {
    if (!contractorResponseText.trim()) {
      toast.error('Veuillez saisir les dispositions prises par l\'entreprise');
      return;
    }
    db.updateObservationItemResponse(noteId, itemNum, contractorResponseText, currentUser);
    setObservationNotes([...db.observationNotes]);
    setRespondingItemId(null);
    setContractorResponseText('');
    toast.success(`Réponse enregistrée pour l'observation ${itemNum}`);
  };

  const handleVerifyNote = (noteId: string, isApproved: boolean) => {
    const newStatus = isApproved ? 'Cloturee' : 'Rouvert';
    db.updateObservationNoteStatus(noteId, newStatus, currentUser);
    setObservationNotes([...db.observationNotes]);
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote({ ...selectedNote, status: newStatus as any });
    }
    toast.success(isApproved ? 'Note d\'observations validée et clôturée sur preuve' : 'Note rouverte pour reprise');
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Réunions, Notes d'Observations & Correspondances"
          subtitle="Registres probants contractuels : PV de chantier, comités techniques, notes formelles NO-000045, courriers entrants/sortants et rapport mensuel à date de coupure."
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewNoteOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5 text-amber-600" />
                Note d'Observations
              </Button>
              <Button
                size="sm"
                onClick={() => setIsNewMeetingOpen(true)}
                className="gap-1.5 text-xs bg-primary text-primary-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                Nouveau PV de Réunion
              </Button>
            </div>
          }
        />

        {/* Système d'onglets pour les 4 volets de la Section 23 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full bg-muted/50 p-1 rounded-lg border border-border h-auto gap-1">
            <TabsTrigger value="reunions" className="text-xs font-semibold gap-1.5 py-2">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>PV Réunions ({meetings.length})</span>
            </TabsTrigger>
            <TabsTrigger value="observations" className="text-xs font-semibold gap-1.5 py-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Notes NO ({observationNotes.length})</span>
            </TabsTrigger>
            <TabsTrigger value="courriers" className="text-xs font-semibold gap-1.5 py-2">
              <Mail className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span>Courriers ({correspondence.length})</span>
            </TabsTrigger>
            <TabsTrigger value="rapport" className="text-xs font-semibold gap-1.5 py-2">
              <BarChart3 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Rapport 12-Points</span>
            </TabsTrigger>
          </TabsList>

          {/* ===================== ONGLET 1 : PV DE RÉUNIONS & DÉCISIONS ===================== */}
          <TabsContent value="reunions" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meetings.map((mtg) => (
                <Card
                  key={mtg.id}
                  className="border border-border shadow-xs hover:border-primary/40 transition-all cursor-pointer bg-card"
                  onClick={() => setSelectedMeeting(mtg)}
                >
                  <CardHeader className="p-4 pb-2 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-mono font-bold bg-primary/10 text-primary"
                      >
                        {mtg.number}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        Lot {mtg.lotId}
                      </Badge>
                    </div>
                    <Badge
                      className={`text-[10px] font-semibold ${
                        mtg.status === 'Signe'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {mtg.status.replace('_', ' ')}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs">
                    <div>
                      <h4 className="font-bold text-foreground text-sm leading-tight">
                        {mtg.title}
                      </h4>
                      <div className="flex items-center gap-4 text-muted-foreground text-[11px] mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {mtg.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {mtg.location}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                        Décisions Contractuelles Traçables ({mtg.decisions.length}) :
                      </span>
                      {mtg.decisions.map((dec) => (
                        <div
                          key={dec.id}
                          className="p-2 rounded bg-muted/40 border border-border/80 flex items-start justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <span className="font-mono font-extrabold text-[10px] text-primary">
                              {dec.decisionNumber}
                            </span>
                            <p className="text-[11px] text-foreground font-medium">{dec.subject}</p>
                            <span className="text-[10px] text-muted-foreground">
                              Responsable : {dec.assignedTo} • Échéance : {dec.deadline}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[9px] shrink-0 ${
                              dec.status === 'Realise'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-amber-50 text-amber-700 border-amber-300'
                            }`}
                          >
                            {dec.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border text-[11px] text-muted-foreground">
                      <span>{mtg.attendees.length} participants émargés</span>
                      <span className="flex items-center gap-1 text-primary font-semibold">
                        <Paperclip className="h-3 w-3" /> {mtg.signedPdfFile}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ===================== ONGLET 2 : NOTES D'OBSERVATIONS (NO) ===================== */}
          <TabsContent value="observations" className="space-y-4 pt-3">
            <div className="space-y-3">
              {observationNotes.map((note) => (
                <Card key={note.id} className="border border-border shadow-xs bg-card">
                  <CardHeader className="p-4 pb-2 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-extrabold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        {note.code}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        Domaine : {note.domain}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {note.pk}
                      </Badge>
                    </div>
                    <Badge
                      className={`text-[10px] font-bold ${
                        note.status === 'Cloturee'
                          ? 'bg-emerald-100 text-emerald-800'
                          : note.status === 'Reponse_Recue'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {note.status.replace('_', ' ')}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{note.title}</h4>
                        <p className="text-[11px] text-muted-foreground">
                          Émise le {note.dateEmission} par {note.authorName} • Échéance réponse :{' '}
                          <span className="font-bold text-rose-600">{note.deadline}</span>
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {note.status !== 'Cloturee' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-emerald-600 border-emerald-300"
                            onClick={() => handleVerifyNote(note.id, true)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Clôturer sur Preuve
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Liste des constats détaillés NO-000045/01, /02 */}
                    <div className="space-y-2 pt-1">
                      {note.items.map((item) => (
                        <div
                          key={item.itemNumber}
                          className="p-3 rounded-lg bg-muted/30 border border-border space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-primary text-xs">
                              {item.itemNumber}
                            </span>
                            <div className="flex gap-2 items-center">
                              <Badge variant="secondary" className="text-[9px]">
                                {item.clauseRef}
                              </Badge>
                              <Badge
                                className={`text-[9px] ${
                                  item.riskPriority === 'Critique'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {item.riskPriority}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-foreground font-medium">
                              <span className="font-bold text-muted-foreground">Constat : </span>
                              {item.factualFinding}
                            </p>
                            <p className="text-blue-700 dark:text-blue-300">
                              <span className="font-bold">Mesure exigée : </span>
                              {item.requestedMeasure}
                            </p>
                          </div>

                          {/* Réponse de l'entreprise */}
                          {item.contractorResponse ? (
                            <div className="p-2 rounded bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] space-y-1">
                              <div className="flex justify-between items-center text-emerald-800 dark:text-emerald-300 font-semibold">
                                <span>Réponse de l'Entreprise (Soroubat) :</span>
                                <span className="font-mono text-[10px]">Preuve : {item.proofDocCode}</span>
                              </div>
                              <p className="text-foreground">{item.contractorResponse}</p>
                            </div>
                          ) : (
                            <div className="pt-1">
                              {respondingItemId === item.itemNumber ? (
                                <div className="space-y-2 p-2 bg-background border border-border rounded">
                                  <textarea
                                    rows={2}
                                    placeholder="Indiquer les dispositions prises par l'entreprise et la référence de la preuve..."
                                    value={contractorResponseText}
                                    onChange={(e) => setContractorResponseText(e.target.value)}
                                    className="w-full text-xs p-1.5 border border-border rounded bg-muted/20"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 text-xs"
                                      onClick={() => setRespondingItemId(null)}
                                    >
                                      Annuler
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="h-6 text-xs bg-primary text-primary-foreground"
                                      onClick={() =>
                                        handleSubmitContractorResponse(note.id, item.itemNumber)
                                      }
                                    >
                                      Transmettre la Réponse
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => setRespondingItemId(item.itemNumber)}
                                >
                                  Proposer une Réponse Entreprise
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ===================== ONGLET 3 : COURRIER ET CORRESPONDANCE ===================== */}
          <TabsContent value="courriers" className="space-y-4 pt-3">
            <div className="flex justify-between items-center pb-1">
              <span className="text-xs text-muted-foreground font-medium">
                Registres officiels de correspondance (Entrant & Sortant) conformément à la Section 23.4
              </span>
              <Button
                size="sm"
                onClick={() => setIsNewLetterOpen(true)}
                className="text-xs gap-1.5 bg-primary text-primary-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                Enregistrer un Courrier
              </Button>
            </div>

            <Card className="border border-border shadow-xs bg-card">
              <CardContent className="p-0">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">Numéro & Sens</th>
                      <th className="py-2.5 px-3">Réf. Externe</th>
                      <th className="py-2.5 px-3">Objet & Contenu</th>
                      <th className="py-2.5 px-3">Émetteur → Destinataire</th>
                      <th className="py-2.5 px-3">Canal</th>
                      <th className="py-2.5 px-3">Échéance</th>
                      <th className="py-2.5 px-3 text-right">Pièces</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {correspondence.map((cor) => (
                      <tr
                        key={cor.id}
                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedLetter(cor)}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {cor.direction === 'Entrant' ? (
                              <ArrowDownLeft className="h-4 w-4 text-emerald-600 shrink-0" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-blue-600 shrink-0" />
                            )}
                            <div>
                              <span className="font-mono font-bold text-foreground block">
                                {cor.internalNumber}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {cor.direction} • {cor.dateDocument}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-muted-foreground">
                          {cor.externalRef}
                        </td>
                        <td className="py-3 px-3 max-w-sm">
                          <p className="font-medium text-foreground truncate">{cor.objectTitle}</p>
                          {cor.threadParentId && (
                            <span className="text-[10px] text-primary font-semibold">
                              Fil lié : {cor.threadParentId}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-[11px]">
                            <span className="font-semibold text-foreground block">
                              {cor.senderOrg}
                            </span>
                            <span className="text-muted-foreground">→ {cor.recipientOrg}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="text-[10px]">
                            {cor.channel.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          {cor.deadlineDate ? (
                            <Badge className="text-[10px] bg-rose-100 text-rose-800 font-bold">
                              <Clock className="h-2.5 w-2.5 mr-1" />
                              {cor.deadlineDate}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">Sans délai</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(`Téléchargement de ${cor.downloadFileName}`);
                            }}
                          >
                            <Download className="h-3.5 w-3.5 text-primary" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===================== ONGLET 4 : RAPPORT MENSUEL 12-POINTS ===================== */}
          <TabsContent value="rapport" className="space-y-4 pt-3">
            {monthlyReports.map((rpt) => (
              <Card key={rpt.id} className="border border-border shadow-xs bg-card">
                <CardHeader className="p-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {rpt.code}
                      </span>
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {rpt.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-bold text-foreground mt-1">
                      Rapport Mensuel Officiel d'Avancement - Période {rpt.period}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Instantané à date de coupure : <span className="font-bold text-foreground">{rpt.cutoffDate}</span> • Préparé par {rpt.preparedBy} • Validé par {rpt.validatedBy}
                    </CardDescription>
                  </div>

                  <Button
                    size="sm"
                    className="text-xs gap-1.5 bg-primary text-primary-foreground"
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rpt, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `${rpt.code}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                      toast.success(`Export probant ${rpt.code}.json généré`);
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Exporter Manifeste Probant (JSON/PDF)
                  </Button>
                </CardHeader>
                <CardContent className="p-4 space-y-4 text-xs">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Trame contractuelle standardisée en 12 sections conforme aux exigences du Ministère de l'Équipement (DGPC) et des bailleurs de fonds (Banque Mondiale & BEI).
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {rpt.sections.map((sec) => (
                      <div
                        key={sec.num}
                        className="p-3 rounded-lg border border-border bg-muted/30 space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-primary">
                              Section {sec.num}
                            </span>
                            <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700">
                              {sec.status}
                            </Badge>
                          </div>
                          <h5 className="font-bold text-foreground text-xs">{sec.title}</h5>
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            {sec.summary}
                          </p>
                        </div>

                        {sec.keyKpis && sec.keyKpis.length > 0 && (
                          <div className="pt-2 border-t border-border/80 flex gap-2">
                            {sec.keyKpis.map((kpi, idx) => (
                              <div key={idx} className="flex-1 bg-background p-1.5 rounded border border-border/60 text-center">
                                <span className="text-[9px] text-muted-foreground block truncate">{kpi.label}</span>
                                <span className="font-bold text-[11px] text-foreground block">{kpi.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Modal Création Nouveau PV de Réunion */}
        <Dialog open={isNewMeetingOpen} onOpenChange={setIsNewMeetingOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Rédiger un Nouveau Procès-Verbal de Réunion
              </DialogTitle>
              <DialogDescription className="text-xs">
                Enregistrement de la séance, des participants et des engagements uniques
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateMeeting} className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Type de Réunion</label>
                  <select
                    value={formMtgType}
                    onChange={(e) => setFormMtgType(e.target.value as any)}
                    className="w-full border border-border rounded-md px-2.5 py-1.5 bg-background text-xs"
                  >
                    <option value="Chantier">PV de Chantier Hebdomadaire</option>
                    <option value="Technique">Comité Technique Ouvrages</option>
                    <option value="HSE_ES">Comité HSE / E&S</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Lot Concerné</label>
                  <select
                    value={formMtgLot}
                    onChange={(e) => setFormMtgLot(e.target.value)}
                    className="w-full border border-border rounded-md px-2.5 py-1.5 bg-background text-xs"
                  >
                    <option value="L01">Lot 1 (PK 0 à 14)</option>
                    <option value="L02">Lot 2 (PK 14 à 28)</option>
                    <option value="L03">Lot 3 (PK 28 à 42)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Titre de la Séance</label>
                <Input
                  required
                  placeholder="Ex: Réunion N° 25 - Coordination des déviations et terrassement"
                  value={formMtgTitle}
                  onChange={(e) => setFormMtgTitle(e.target.value)}
                  className="text-xs bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Date de la Réunion</label>
                  <Input
                    type="date"
                    value={formMtgDate}
                    onChange={(e) => setFormMtgDate(e.target.value)}
                    className="text-xs bg-background"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Lieu</label>
                  <Input
                    value={formMtgLocation}
                    onChange={(e) => setFormMtgLocation(e.target.value)}
                    className="text-xs bg-background"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewMeetingOpen(false)}
                  className="text-xs"
                >
                  Annuler
                </Button>
                <Button type="submit" className="text-xs bg-primary text-primary-foreground">
                  Créer et Diffuser le PV
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Création Note d'Observations */}
        <Dialog open={isNewNoteOpen} onOpenChange={setIsNewNoteOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Émettre une Note d'Observations Formelle (NO)
              </DialogTitle>
              <DialogDescription className="text-xs">
                Format standardisé avec référence unique TN-R2X2-L01-NO-000045 et CCTP
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateNote} className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Domaine</label>
                  <select
                    value={formNoDomain}
                    onChange={(e) => setFormNoDomain(e.target.value as any)}
                    className="w-full border border-border rounded-md px-2.5 py-1.5 bg-background text-xs"
                  >
                    <option value="Signalisation">Signalisation & Sécurité</option>
                    <option value="Chaussee">Chaussée & Matériaux</option>
                    <option value="Ouvrage_Art">Ouvrages d'Art</option>
                    <option value="Securite_Usagers">Sécurité Usagers / ASR</option>
                    <option value="Environnement">Environnement & Social</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">PK / Localisation</label>
                  <Input
                    value={formNoPk}
                    onChange={(e) => setFormNoPk(e.target.value)}
                    placeholder="Ex: PK 04+200"
                    className="text-xs font-mono bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Objet de la Note</label>
                <Input
                  required
                  placeholder="Ex: Absence de biseau de rabattement K8 et balises K5a sales"
                  value={formNoTitle}
                  onChange={(e) => setFormNoTitle(e.target.value)}
                  className="text-xs bg-background"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Constat Factuel Relevé</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Détail du défaut constaté de jour ou de nuit sur chantier..."
                  value={formNoFinding}
                  onChange={(e) => setFormNoFinding(e.target.value)}
                  className="w-full border border-border rounded-md p-2 bg-background text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Clause Contractuelle / CCTP</label>
                  <Input
                    value={formNoClause}
                    onChange={(e) => setFormNoClause(e.target.value)}
                    className="text-xs bg-background"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Mesure Exigée sous 48h</label>
                  <Input
                    required
                    placeholder="Ex: Remplacement des panneaux par classe 2"
                    value={formNoMeasure}
                    onChange={(e) => setFormNoMeasure(e.target.value)}
                    className="text-xs bg-background"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewNoteOpen(false)}
                  className="text-xs"
                >
                  Annuler
                </Button>
                <Button type="submit" className="text-xs bg-primary text-primary-foreground">
                  Émettre la Note d'Observations
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Enregistrement Courrier */}
        <Dialog open={isNewLetterOpen} onOpenChange={setIsNewLetterOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Enregistrer un Courrier Officiel
              </DialogTitle>
              <DialogDescription className="text-xs">
                Registre probant des correspondances avec accusé de réception
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateLetter} className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Sens du Courrier</label>
                  <select
                    value={formCorDirection}
                    onChange={(e) => setFormCorDirection(e.target.value as any)}
                    className="w-full border border-border rounded-md px-2.5 py-1.5 bg-background text-xs"
                  >
                    <option value="Sortant">Sortant (Émis)</option>
                    <option value="Entrant">Entrant (Reçu)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Réf. Externe de la Lettre</label>
                  <Input
                    placeholder="Ex: SOR-TUN-LTR-485"
                    value={formCorExtRef}
                    onChange={(e) => setFormCorExtRef(e.target.value)}
                    className="text-xs font-mono bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Objet Contractuel</label>
                <Input
                  required
                  placeholder="Ex: Mise en demeure pour retard de transmission des fiches d'agrément"
                  value={formCorObject}
                  onChange={(e) => setFormCorObject(e.target.value)}
                  className="text-xs bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Émetteur</label>
                  <Input
                    value={formCorSender}
                    onChange={(e) => setFormCorSender(e.target.value)}
                    className="text-xs bg-background"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Destinataire</label>
                  <Input
                    value={formCorRecipient}
                    onChange={(e) => setFormCorRecipient(e.target.value)}
                    className="text-xs bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Canal de Transmission</label>
                  <select
                    value={formCorChannel}
                    onChange={(e) => setFormCorChannel(e.target.value as any)}
                    className="w-full border border-border rounded-md px-2.5 py-1.5 bg-background text-xs"
                  >
                    <option value="Porteur_Decharge">Porteur avec Décharge</option>
                    <option value="Courrier_Recommande">Lettre Recommandée AR</option>
                    <option value="Courriel_Officiel">Courriel Officiel Sécurisé</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Échéance de Réponse</label>
                  <Input
                    type="date"
                    value={formCorDeadline}
                    onChange={(e) => setFormCorDeadline(e.target.value)}
                    className="text-xs bg-background"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewLetterOpen(false)}
                  className="text-xs"
                >
                  Annuler
                </Button>
                <Button type="submit" className="text-xs bg-primary text-primary-foreground">
                  Enregistrer au Registre
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
