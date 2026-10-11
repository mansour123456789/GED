// Base de données simulée pour GED-RN13-V2
// Persistance en mémoire et dans localStorage sous la clé gedrn13_db_v2

import {
  User,
  Lot,
  DocumentItem,
  CommentItem,
  NoRequest,
  SectionGate,
  NcrItem,
  LabTest,
  IncidentItem,
  IpcItem,
  HouseholdItem,
  OfferItem,
  GrievanceItem,
  VbgCaseItem,
  ReportItem,
  AuditLog,
  DemoAlert,
  DocState,
  VisaCode,
  ActorLetter,
  ServiceOrder,
  RoadSectionStop,
  LotTask,
  RoadSafetyAudit,
  TrafficDiversion,
  RoadInspection,
  DonorRequirement,
  TransmittalSlip,
  ReceptionRecord,
  ReceptionReserve,
  DoeItem,
  GeoFeatureItem,
  MeetingMinute,
  ObservationNote,
  CorrespondenceLetter,
  MonthlyReport12Point,
  DevisPoste,
  DevisScenario,
  OffreCommerciale,
} from '../types';

import seedUsers from './seed/users.json';
import seedLots from './seed/lots.json';
import seedDocuments from './seed/documents.json';
import seedComments from './seed/comments.json';
import seedNoRequests from './seed/no_requests.json';
import seedGates from './seed/gates.json';
import seedNcr from './seed/ncr.json';
import seedLabTests from './seed/lab_tests.json';
import seedIncidents from './seed/incidents.json';
import seedIpc from './seed/ipc.json';
import seedHouseholds from './seed/par_households.json';
import seedOffers from './seed/par_offers.json';
import seedGrievances from './seed/grievances.json';
import seedVbg from './seed/vbg_cases.json';
import seedReports from './seed/reports.json';
import seedAlerts from './seed/alerts.json';
import seedAuditLogs from './seed/audit_logs.json';
import seedServiceOrders from './seed/service_orders.json';
import seedRoadStops from './seed/road_stops.json';
import { seedLotTasks } from './seed/lotTasks';
import seedRoadSafety from './seed/road_safety.json';
import seedDonorMatrix from './seed/donor_matrix.json';
import seedTransmittals from './seed/transmittals.json';
import seedReceptionDoe from './seed/reception_doe.json';
import seedGeoFeatures from './seed/geo_features.json';
import seedMeetingsCorrespondence from './seed/meetings_correspondence.json';
import seedBudgetPlans from './seed/budget_plans.json';
import { clock } from './clock';

const DB_KEY = 'gedrn13_db_v2';

interface DbSchema {
  users: User[];
  lots: Lot[];
  documents: DocumentItem[];
  comments: CommentItem[];
  noRequests: NoRequest[];
  gates: SectionGate[];
  ncr: NcrItem[];
  labTests: LabTest[];
  incidents: IncidentItem[];
  ipc: IpcItem[];
  households: HouseholdItem[];
  offers: OfferItem[];
  grievances: GrievanceItem[];
  vbgCases: VbgCaseItem[];
  reports: ReportItem[];
  alerts: DemoAlert[];
  auditLogs: AuditLog[];
  serviceOrders: ServiceOrder[];
  roadStops: RoadSectionStop[];
  lotTasks: LotTask[];
  roadSafetyAudits: RoadSafetyAudit[];
  trafficDiversions: TrafficDiversion[];
  roadInspections: RoadInspection[];
  donorRequirements: DonorRequirement[];
  transmittals: TransmittalSlip[];
  receptionRecords: ReceptionRecord[];
  receptionReserves: ReceptionReserve[];
  doeItems: DoeItem[];
  geoFeatures: GeoFeatureItem[];
  meetings: MeetingMinute[];
  observationNotes: ObservationNote[];
  correspondence: CorrespondenceLetter[];
  monthlyReports: MonthlyReport12Point[];
  budgetPostes: DevisPoste[];
  budgetScenarios: DevisScenario[];
  commercialOffers: OffreCommerciale[];
}

function loadInitialData(): DbSchema {
  const config = (window as any).__APP_CONFIG__ || {};
  if (config.PERSIST_LOCAL !== false && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(DB_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.serviceOrders) parsed.serviceOrders = seedServiceOrders;
        if (!parsed.roadStops) parsed.roadStops = seedRoadStops;
        if (!parsed.lotTasks || !Array.isArray(parsed.lotTasks) || parsed.lotTasks.length === 0) {
          parsed.lotTasks = seedLotTasks;
        }
        if (!parsed.roadSafetyAudits) parsed.roadSafetyAudits = (seedRoadSafety as any).audits;
        if (!parsed.trafficDiversions) parsed.trafficDiversions = (seedRoadSafety as any).diversions;
        if (!parsed.roadInspections) parsed.roadInspections = (seedRoadSafety as any).inspections;
        if (!parsed.donorRequirements) parsed.donorRequirements = seedDonorMatrix;
        if (!parsed.transmittals) parsed.transmittals = seedTransmittals;
        if (!parsed.receptionRecords) parsed.receptionRecords = (seedReceptionDoe as any).receptions;
        if (!parsed.receptionReserves) parsed.receptionReserves = (seedReceptionDoe as any).reserves;
        if (!parsed.doeItems) parsed.doeItems = (seedReceptionDoe as any).doeItems;
        if (!parsed.geoFeatures) parsed.geoFeatures = seedGeoFeatures;
        if (!parsed.meetings) parsed.meetings = (seedMeetingsCorrespondence as any).meetings;
        if (!parsed.observationNotes) parsed.observationNotes = (seedMeetingsCorrespondence as any).observationNotes;
        if (!parsed.correspondence) parsed.correspondence = (seedMeetingsCorrespondence as any).correspondence;
        if (!parsed.monthlyReports) parsed.monthlyReports = (seedMeetingsCorrespondence as any).monthlyReports;
        if (!parsed.budgetPostes) parsed.budgetPostes = (seedBudgetPlans as any).postesV1;
        if (!parsed.budgetScenarios) parsed.budgetScenarios = (seedBudgetPlans as any).scenarios;
        if (!parsed.commercialOffers) parsed.commercialOffers = (seedBudgetPlans as any).offresCommerciales;

        if (parsed.lots) {
          parsed.lots = (seedLots as any[]).map((seedL: any, idx: number) => {
            const storedL = parsed.lots[idx] || {};
            return { ...seedL, ...storedL };
          });
        }
        if (parsed.households) {
          parsed.households = parsed.households.map((h: any, idx: number) => {
            const seed = (seedHouseholds as any)[idx] || {};
            return {
              ...seed,
              ...h,
              landAreaSqm: h.landAreaSqm ?? seed.landAreaSqm ?? 2000,
              landUnitPriceTnd: h.landUnitPriceTnd ?? seed.landUnitPriceTnd ?? 25,
              olivesAdultCount: h.olivesAdultCount ?? seed.olivesAdultCount ?? 20,
              olivesYoungCount: h.olivesYoungCount ?? seed.olivesYoungCount ?? 5,
              otherTreesCount: h.otherTreesCount ?? seed.otherTreesCount ?? 0,
              builtAreaSqm: h.builtAreaSqm ?? seed.builtAreaSqm ?? 0,
              wellsCount: h.wellsCount ?? seed.wellsCount ?? 0,
              fencesLengthM: h.fencesLengthM ?? seed.fencesLengthM ?? 0,
              governorate: h.governorate ?? seed.governorate ?? 'Sfax',
              delegation: h.delegation ?? seed.delegation ?? 'Menzel Chaker',
              imada: h.imada ?? seed.imada ?? 'Bou Thadi',
              documents: h.documents ?? seed.documents ?? [],
            };
          });
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Erreur de lecture du localStorage, chargement du jeu initial', e);
    }
  }

  return {
    users: seedUsers as unknown as User[],
    lots: seedLots as unknown as Lot[],
    documents: seedDocuments as unknown as DocumentItem[],
    comments: seedComments as unknown as CommentItem[],
    noRequests: seedNoRequests as unknown as NoRequest[],
    gates: seedGates as unknown as SectionGate[],
    ncr: seedNcr as unknown as NcrItem[],
    labTests: seedLabTests as unknown as LabTest[],
    incidents: seedIncidents as unknown as IncidentItem[],
    ipc: seedIpc as unknown as IpcItem[],
    households: seedHouseholds as unknown as HouseholdItem[],
    offers: seedOffers as unknown as OfferItem[],
    grievances: seedGrievances as unknown as GrievanceItem[],
    vbgCases: seedVbg as unknown as VbgCaseItem[],
    reports: seedReports as unknown as ReportItem[],
    alerts: seedAlerts as unknown as DemoAlert[],
    auditLogs: seedAuditLogs as unknown as AuditLog[],
    serviceOrders: seedServiceOrders as unknown as ServiceOrder[],
    roadStops: seedRoadStops as unknown as RoadSectionStop[],
    lotTasks: seedLotTasks as unknown as LotTask[],
    roadSafetyAudits: (seedRoadSafety as any).audits as RoadSafetyAudit[],
    trafficDiversions: (seedRoadSafety as any).diversions as TrafficDiversion[],
    roadInspections: (seedRoadSafety as any).inspections as RoadInspection[],
    donorRequirements: seedDonorMatrix as unknown as DonorRequirement[],
    transmittals: seedTransmittals as unknown as TransmittalSlip[],
    receptionRecords: (seedReceptionDoe as any).receptions as ReceptionRecord[],
    receptionReserves: (seedReceptionDoe as any).reserves as ReceptionReserve[],
    doeItems: (seedReceptionDoe as any).doeItems as DoeItem[],
    geoFeatures: seedGeoFeatures as unknown as GeoFeatureItem[],
    meetings: (seedMeetingsCorrespondence as any).meetings as MeetingMinute[],
    observationNotes: (seedMeetingsCorrespondence as any).observationNotes as ObservationNote[],
    correspondence: (seedMeetingsCorrespondence as any).correspondence as CorrespondenceLetter[],
    monthlyReports: (seedMeetingsCorrespondence as any).monthlyReports as MonthlyReport12Point[],
    budgetPostes: (seedBudgetPlans as any).postesV1 as DevisPoste[],
    budgetScenarios: (seedBudgetPlans as any).scenarios as DevisScenario[],
    commercialOffers: (seedBudgetPlans as any).offresCommerciales as OffreCommerciale[],
  };
}

class DatabaseManager {
  private data: DbSchema;

  constructor() {
    this.data = loadInitialData();
  }

  private save() {
    const config = (window as any).__APP_CONFIG__ || {};
    if (config.PERSIST_LOCAL !== false && typeof window !== 'undefined') {
      try {
        localStorage.setItem(DB_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.error('Erreur lors de la sauvegarde dans localStorage', e);
      }
    }
  }

  public reset() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DB_KEY);
    }
    this.data = {
      users: seedUsers as unknown as User[],
      lots: seedLots as unknown as Lot[],
      documents: seedDocuments as unknown as DocumentItem[],
      comments: seedComments as unknown as CommentItem[],
      noRequests: seedNoRequests as unknown as NoRequest[],
      gates: seedGates as unknown as SectionGate[],
      ncr: seedNcr as unknown as NcrItem[],
      labTests: seedLabTests as unknown as LabTest[],
      incidents: seedIncidents as unknown as IncidentItem[],
      ipc: seedIpc as unknown as IpcItem[],
      households: seedHouseholds as unknown as HouseholdItem[],
      offers: seedOffers as unknown as OfferItem[],
      grievances: seedGrievances as unknown as GrievanceItem[],
      vbgCases: seedVbg as unknown as VbgCaseItem[],
      reports: seedReports as unknown as ReportItem[],
      alerts: seedAlerts as unknown as DemoAlert[],
      auditLogs: seedAuditLogs as unknown as AuditLog[],
      serviceOrders: seedServiceOrders as unknown as ServiceOrder[],
      roadStops: seedRoadStops as unknown as RoadSectionStop[],
      lotTasks: seedLotTasks as unknown as LotTask[],
      roadSafetyAudits: (seedRoadSafety as any).audits as RoadSafetyAudit[],
      trafficDiversions: (seedRoadSafety as any).diversions as TrafficDiversion[],
      roadInspections: (seedRoadSafety as any).inspections as RoadInspection[],
      donorRequirements: seedDonorMatrix as unknown as DonorRequirement[],
      transmittals: seedTransmittals as unknown as TransmittalSlip[],
      receptionRecords: (seedReceptionDoe as any).receptions as ReceptionRecord[],
      receptionReserves: (seedReceptionDoe as any).reserves as ReceptionReserve[],
      doeItems: (seedReceptionDoe as any).doeItems as DoeItem[],
      geoFeatures: seedGeoFeatures as unknown as GeoFeatureItem[],
      meetings: (seedMeetingsCorrespondence as any).meetings as MeetingMinute[],
      observationNotes: (seedMeetingsCorrespondence as any).observationNotes as ObservationNote[],
      correspondence: (seedMeetingsCorrespondence as any).correspondence as CorrespondenceLetter[],
      monthlyReports: (seedMeetingsCorrespondence as any).monthlyReports as MonthlyReport12Point[],
      budgetPostes: (seedBudgetPlans as any).postesV1 as DevisPoste[],
      budgetScenarios: (seedBudgetPlans as any).scenarios as DevisScenario[],
      commercialOffers: (seedBudgetPlans as any).offresCommerciales as OffreCommerciale[],
    };
    this.save();
  }

  // --- Logs d'Audit ---
  public logAudit(action: string, targetObject: string, details: string, user?: User | null) {
    const log: AuditLog = {
      id: `aud-${Date.now().toString(36)}`,
      timestamp: clock.toISOString(),
      userId: user?.id || 'sys',
      userName: user?.fullName || 'Système',
      actorLetter: (user?.actorLetter || 'B') as ActorLetter,
      action,
      targetObject,
      details,
    };
    this.data.auditLogs.unshift(log);
    this.save();
    return log;
  }

  public get auditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  // --- Users & Lots ---
  public get users(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByUsername(username: string): User | undefined {
    return this.data.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  public get lots(): Lot[] {
    return this.data.lots;
  }

  public getLotById(id: string): Lot | undefined {
    return this.data.lots.find((l) => l.id === id);
  }

  // --- Tâches et Jalons par Lot (Sous-Projets) ---
  public get lotTasks(): LotTask[] {
    return this.data.lotTasks || [];
  }

  public getLotTasks(lotId?: string): LotTask[] {
    if (!lotId || lotId === 'all') return this.data.lotTasks || [];
    return (this.data.lotTasks || []).filter((t) => t.lotId === lotId || t.lotId === 'GLOBAL');
  }

  public getLotTaskById(taskId: string): LotTask | undefined {
    return (this.data.lotTasks || []).find((t) => t.id === taskId);
  }

  public validateLotTaskMoe(
    taskId: string,
    visa: 'A' | 'B' | 'C' | 'D',
    remarks: string,
    user?: User
  ): LotTask | null {
    const task = this.getLotTaskById(taskId);
    if (!task) return null;
    task.moeValidation = {
      validated: true,
      validatedBy: user ? `${user.fullName} (${user.actorLabel})` : 'Mission de Contrôle SCET',
      visa,
      date: clock.toISOString().slice(0, 10),
      remarks: remarks || `Visa technique ${visa} accordé après vérification contradictoire.`,
    };
    task.status = visa === 'C' ? 'Bloque' : 'Vise_MOE';
    this.logAudit(
      'Validation MOE Tâche',
      task.code,
      `Visa ${visa} attribué par la mission de contrôle pour la tâche ${task.title}`,
      user
    );
    this.save();
    return task;
  }

  public approveLotTaskMo(
    taskId: string,
    orderNumber: string,
    user?: User
  ): LotTask | null {
    const task = this.getLotTaskById(taskId);
    if (!task) return null;
    task.moValidation = {
      approved: true,
      approvedBy: user ? `${user.fullName} (DGPC)` : 'Direction Générale des Ponts et Chaussées',
      date: clock.toISOString().slice(0, 10),
      orderNumber: orderNumber || `ORD-RN13-${Date.now().toString().slice(-4)}`,
    };
    task.status = 'Approuve_MO';
    this.logAudit(
      'Approbation Finale MO Tâche',
      task.code,
      `Approbation formelle Maître d'Ouvrage (Ordre ${task.moValidation.orderNumber})`,
      user
    );
    this.save();
    return task;
  }

  public addLotTask(
    newTask: Omit<LotTask, 'id'>,
    user?: User
  ): LotTask {
    const task: LotTask = {
      ...newTask,
      id: `tsk-${Date.now().toString(36)}`,
    };
    if (!this.data.lotTasks) this.data.lotTasks = [];
    this.data.lotTasks.unshift(task);
    this.logAudit(
      'Création Tâche de Lot',
      task.code,
      `Nouvelle tâche créée pour le lot ${task.lotId} par ${user?.fullName || 'Utilisateur'}`,
      user
    );
    this.save();
    return task;
  }

  // --- Documents ---
  public get documents(): DocumentItem[] {
    return this.data.documents;
  }

  public getDocumentById(id: string): DocumentItem | undefined {
    return this.data.documents.find((d) => d.id === id);
  }

  public getDocumentByCode(code: string): DocumentItem | undefined {
    return this.data.documents.find((d) => d.code === code);
  }

  public addDocument(doc: DocumentItem, user?: User): DocumentItem {
    this.data.documents.unshift(doc);
    this.logAudit('Dépôt document', doc.code, `Nouveau document créé en révision ${doc.currentRevision}`, user);
    this.save();
    return doc;
  }

  public updateDocumentState(id: string, newState: DocState, user?: User): DocumentItem | undefined {
    const doc = this.getDocumentById(id);
    if (!doc) return undefined;
    const oldState = doc.state;
    doc.state = newState;
    doc.updatedAt = clock.toISOString();
    this.logAudit('Changement état document', doc.code, `Transition d'état de ${oldState} vers ${newState}`, user);
    this.save();
    return doc;
  }

  public visaDocument(id: string, visa: VisaCode, user?: User): DocumentItem | undefined {
    const doc = this.getDocumentById(id);
    if (!doc) return undefined;
    doc.visa = visa;
    doc.updatedAt = clock.toISOString();

    if (visa === 'A' || visa === 'B') {
      // Si visa favorable, passage à Published (ou si NO demandée, publication après NO)
      if (doc.noStatus === 'NON_REQUISE' || doc.noStatus === 'NO_OBTENUE') {
        doc.state = 'Published';
        // Passage de révision provisoire P à révision contractuelle C01
        if (doc.currentRevision.startsWith('P')) {
          doc.currentRevision = 'C01';
        }
      }
    } else if (visa === 'C') {
      // Refusé, retour à l'auteur WIP avec nouvelle révision attendue
      doc.state = 'WIP';
    }

    this.logAudit('Visa document', doc.code, `Attribution du visa ${visa} par ${user?.fullName}`, user);
    this.save();
    return doc;
  }

  public publishDocument(id: string, user?: User): DocumentItem | undefined {
    const doc = this.getDocumentById(id);
    if (!doc) return undefined;
    doc.state = 'Published';
    if (doc.currentRevision.startsWith('P')) {
      doc.currentRevision = 'C01';
    }
    doc.hasBlockingComments = false;
    doc.updatedAt = clock.toISOString();
    this.logAudit('Publication définitive', doc.code, `Document verrouillé et publié en révision ${doc.currentRevision}`, user);
    this.save();
    return doc;
  }

  // --- Commentaires (CRD) ---
  public get comments(): CommentItem[] {
    return this.data.comments;
  }

  public getCommentsByDocId(docId: string): CommentItem[] {
    return this.data.comments.filter((c) => c.docId === docId);
  }

  public addComment(comment: CommentItem, user?: User): CommentItem {
    this.data.comments.push(comment);
    if (comment.severity === 'bloquant') {
      const doc = this.getDocumentById(comment.docId);
      if (doc) doc.hasBlockingComments = true;
    }
    this.logAudit('Émission commentaire CRD', comment.docCode, `Nouveau commentaire ${comment.severity} sur ${comment.pageOrArticle}`, user);
    this.save();
    return comment;
  }

  public answerComment(id: string, responseText: string, user?: User): CommentItem | undefined {
    const com = this.data.comments.find((c) => c.id === id);
    if (!com) return undefined;
    com.responseText = responseText;
    com.responseAuthorName = user?.fullName || 'Auteur';
    com.responseAuthorLetter = user?.actorLetter || 'B';
    com.status = 'repondu';
    com.answeredAt = clock.toISOString();
    this.logAudit('Réponse commentaire CRD', com.docCode, `Réponse apportée au commentaire ${com.id}`, user);
    this.save();
    return com;
  }

  public closeComment(id: string, user?: User): CommentItem | undefined {
    const com = this.data.comments.find((c) => c.id === id);
    if (!com) return undefined;
    com.status = 'clos';
    com.closedAt = clock.toISOString();

    // Vérifier si le doc a encore des bloquants ouverts
    const docComments = this.getCommentsByDocId(com.docId);
    const hasOpenBlockers = docComments.some((c) => c.severity === 'bloquant' && c.status !== 'clos');
    const doc = this.getDocumentById(com.docId);
    if (doc) {
      doc.hasBlockingComments = hasOpenBlockers;
    }

    this.logAudit('Clôture commentaire CRD', com.docCode, `Commentaire ${com.id} clos et accepté`, user);
    this.save();
    return com;
  }

  // --- Non-Objection ---
  public get noRequests(): NoRequest[] {
    return this.data.noRequests;
  }

  public addNoRequest(req: NoRequest, user?: User): NoRequest {
    this.data.noRequests.unshift(req);
    // Mettre à jour les documents joints
    req.docIds.forEach((dId) => {
      const doc = this.getDocumentById(dId);
      if (doc) doc.noStatus = 'NO_DEMANDEE';
    });
    this.logAudit('Demande de Non-Objection', req.number, req.title, user);
    this.save();
    return req;
  }

  public decideNoRequest(
    id: string,
    decision: 'NO_OBTENUE' | 'NO_OBSERVATIONS' | 'NO_REFUSEE',
    observations?: string,
    letterRef?: string,
    user?: User
  ): NoRequest | undefined {
    const req = this.data.noRequests.find((r) => r.id === id);
    if (!req) return undefined;
    req.status = decision;
    req.donorObservations = observations;
    req.letterRef = letterRef || `WB-DEC-${Date.now().toString().slice(-4)}`;
    req.decidedAt = clock.toISOString();
    req.decidedBy = user?.fullName || 'Bailleur de fonds';

    // Mettre à jour les statuts des documents
    req.docIds.forEach((dId) => {
      const doc = this.getDocumentById(dId);
      if (doc) {
        doc.noStatus = decision;
        if (decision === 'NO_OBTENUE') {
          doc.state = 'Published';
          if (doc.currentRevision.startsWith('P')) {
            doc.currentRevision = 'C01';
          }
        }
      }
    });

    this.logAudit('Décision de Non-Objection', req.number, `Avis émis : ${decision}`, user);
    this.save();
    return req;
  }

  // --- Conditions de Démarrage (Gates) ---
  public get gates(): SectionGate[] {
    return this.data.gates;
  }

  public updateGate(id: string, partial: Partial<SectionGate>, user?: User): SectionGate | undefined {
    const gate = this.data.gates.find((g) => g.id === id);
    if (!gate) return undefined;
    Object.assign(gate, partial);
    gate.canStart =
      gate.parFree &&
      gate.pgeseApproved &&
      gate.pgtApproved &&
      gate.ppspsApproved &&
      gate.paqApproved &&
      gate.huissierDone;
    if (gate.canStart) {
      gate.blockReason = undefined;
    }
    this.logAudit('Mise à jour condition de démarrage', gate.sectionTitle, `CanStart: ${gate.canStart}`, user);
    this.save();
    return gate;
  }

  // --- Qualité & NCR ---
  public get ncr(): NcrItem[] {
    return this.data.ncr;
  }

  public addNcr(ncr: NcrItem, user?: User): NcrItem {
    this.data.ncr.unshift(ncr);
    this.logAudit('Émission Fiche Non-Conformité', ncr.number, `${ncr.severity} au PK ${ncr.pk}`, user);
    this.save();
    return ncr;
  }

  public updateNcrStatus(id: string, status: 'Ouverte' | 'EnVerification' | 'Cloturee', correctiveAction?: string, user?: User): NcrItem | undefined {
    const item = this.data.ncr.find((n) => n.id === id);
    if (!item) return undefined;
    item.status = status;
    if (correctiveAction) item.correctiveAction = correctiveAction;
    if (status === 'Cloturee') item.closedAt = clock.toISOString();
    this.logAudit('Statut NCR', item.number, `Passage au statut ${status}`, user);
    this.save();
    return item;
  }

  public get labTests(): LabTest[] {
    return this.data.labTests;
  }

  // --- HSE & Incidents ---
  public get incidents(): IncidentItem[] {
    return this.data.incidents;
  }

  public addIncident(inc: IncidentItem, user?: User): IncidentItem {
    this.data.incidents.unshift(inc);
    this.logAudit('Déclaration incident HSE', inc.number, `${inc.severity} : ${inc.title}`, user);
    this.save();
    return inc;
  }

  public notifyDonorIncident(id: string, user?: User): IncidentItem | undefined {
    const inc = this.data.incidents.find((i) => i.id === id);
    if (!inc) return undefined;
    inc.donorNotifiedAt = clock.toISOString();
    inc.status = 'BailleurNotifie';
    this.logAudit('Notification bailleur incident grave', inc.number, `Bailleur notifié avant échéance 48h`, user);
    this.save();
    return inc;
  }

  // --- Décomptes (IPC) ---
  public get ipc(): IpcItem[] {
    return this.data.ipc;
  }

  public addIpc(item: IpcItem, user?: User): IpcItem {
    this.data.ipc.unshift(item);
    this.logAudit('Soumission Décompte IPC', item.number, `Montant : ${item.amountNetTnd} TND`, user);
    this.save();
    return item;
  }

  public certifyIpc(id: string, user?: User): IpcItem | undefined {
    const item = this.data.ipc.find((p) => p.id === id);
    if (!item) return undefined;
    item.status = 'Certifie';
    item.certifiedAt = clock.toISOString();
    this.logAudit('Certification Décompte IPC', item.number, `Certifié par la maîtrise d'œuvre (${user?.fullName})`, user);
    this.save();
    return item;
  }

  public approveAndPayIpc(id: string, user?: User): IpcItem | undefined {
    const item = this.data.ipc.find((p) => p.id === id);
    if (!item) return undefined;
    item.status = 'Paye';
    item.approvedAt = clock.toISOString();
    item.paidAt = clock.toISOString();
    this.logAudit('Paiement Décompte IPC', item.number, `Approuvé et mandaté pour paiement par le Maître d'ouvrage`, user);
    this.save();
    return item;
  }

  // --- PAR & Foncier ---
  public get households(): HouseholdItem[] {
    return this.data.households;
  }

  public get offers(): OfferItem[] {
    return this.data.offers;
  }

  public addHousehold(item: HouseholdItem, user?: User): HouseholdItem {
    this.data.households.unshift(item);
    // Créer automatiquement l'offre associée
    const offer: OfferItem = {
      id: `off-${Date.now().toString(36)}`,
      householdId: item.id,
      householdCode: item.code,
      lotId: item.lotId,
      pk: item.pk,
      amountLandTnd: Math.round(item.landAreaSqm * item.landUnitPriceTnd),
      amountBatiTnd: item.builtAreaSqm * 450 + item.fencesLengthM * 35 + item.wellsCount * 12000,
      amountCropsTnd: item.olivesAdultCount * 450 + item.olivesYoungCount * 120 + item.otherTreesCount * 180,
      vulnerabilityAllowanceTnd: item.vulnerable ? 3000 : 0,
      totalTnd: item.totalCompensationTnd,
      status: 'Proposee',
      paidTnd: item.paidTnd || 0,
    };
    this.data.offers.unshift(offer);
    this.logAudit('Recensement parcelle foncière', item.parcelNumber, `${item.headName} au PK ${item.pk} (${item.governorate}) — ${item.olivesAdultCount} oliviers`, user);
    this.save();
    return item;
  }

  public signHouseholdAgreement(id: string, user?: User): HouseholdItem | undefined {
    const hh = this.data.households.find((h) => h.id === id);
    if (!hh) return undefined;
    hh.status = 'AccordSigne';
    const off = this.data.offers.find((o) => o.householdId === id);
    if (off) off.status = 'Acceptee';
    // Document accord automatique
    if (!hh.documents) hh.documents = [];
    hh.documents.push({
      id: `doc-acc-${Date.now().toString(36)}`,
      name: `PV de Conciliation Amiable N°${hh.parcelNumber}`,
      type: 'Accord_Conciliation',
      date: new Date().toISOString().slice(0, 10),
      fileName: `Accord_${hh.code}.pdf`,
      fileSize: '2.3 Mo',
      sha256: '9f8b4a22c1e8...d3e1'
    });
    this.logAudit('Signature accord conciliation foncière', hh.parcelNumber, `Accord amiable signé par ${hh.headName}`, user);
    this.save();
    return hh;
  }

  public payHouseholdCompensation(id: string, amount: number, user?: User): HouseholdItem | undefined {
    const hh = this.data.households.find((h) => h.id === id);
    if (!hh) return undefined;
    hh.paidTnd += amount;
    const off = this.data.offers.find((o) => o.householdId === id);
    if (off) off.paidTnd = hh.paidTnd;

    if (hh.paidTnd >= hh.totalCompensationTnd) {
      hh.status = 'Solde';
      if (off) off.status = 'Soldee';
    } else {
      hh.status = 'PayePartiel';
    }

    if (!hh.documents) hh.documents = [];
    hh.documents.push({
      id: `doc-quit-${Date.now().toString(36)}`,
      name: `Quittance de Virement N°Q-${Date.now().toString().slice(-6)}`,
      type: 'Quittance_Paiement',
      date: new Date().toISOString().slice(0, 10),
      fileName: `Quittance_${amount}DT_${hh.code}.pdf`,
      fileSize: '1.4 Mo'
    });

    this.logAudit('Paiement indemnité d\'expropriation', hh.parcelNumber, `Versement de ${amount} DT à ${hh.headName}`, user);
    this.save();
    return hh;
  }

  public issueLiberationPv(id: string, user?: User): HouseholdItem | undefined {
    const hh = this.data.households.find((h) => h.id === id);
    if (!hh) return undefined;
    hh.empriseFree = true;
    hh.status = 'Solde';
    hh.pvLiberationNumber = `PVLE-RN13-2026-${Date.now().toString().slice(-4)}`;
    hh.pvLiberationDate = new Date().toISOString().slice(0, 10);

    if (!hh.documents) hh.documents = [];
    hh.documents.push({
      id: `doc-pvle-${Date.now().toString(36)}`,
      name: `Procès-Verbal de Libération Totale d'Emprise (PVLE)`,
      type: 'PV_Liberation_Emprise',
      date: hh.pvLiberationDate,
      fileName: `${hh.pvLiberationNumber}.pdf`,
      fileSize: '2.8 Mo',
      sha256: '7c8a34b21fae...991a'
    });

    // Débloquer la Gate de chantier correspondante si toutes les parcelles du PK sont libérées
    const gate4 = this.data.gates.find((g) => g.id === 'gate-004');
    if (gate4 && hh.pk.startsWith('12+')) {
      const allSec4Paid = this.data.households
        .filter((h) => h.pk.startsWith('12+'))
        .every((h) => h.empriseFree || h.id === id);
      if (allSec4Paid) {
        gate4.parFree = true;
        gate4.huissierDone = true;
        gate4.canStart = true;
        gate4.blockReason = undefined;
      }
    }

    this.logAudit('Délivrance PV de Libération d\'Emprise (PVLE)', hh.parcelNumber, `Emprise déclarée libre au PK ${hh.pk} — Travaux autorisés`, user);
    this.save();
    return hh;
  }

  public payOffer(offerId: string, amount: number, user?: User): OfferItem | undefined {
    const off = this.data.offers.find((o) => o.id === offerId);
    if (!off) return undefined;
    this.payHouseholdCompensation(off.householdId, amount, user);
    return off;
  }

  // --- Plaintes (MGP) ---
  public get grievances(): GrievanceItem[] {
    return this.data.grievances;
  }

  public addGrievance(item: GrievanceItem, user?: User): GrievanceItem {
    this.data.grievances.unshift(item);
    this.logAudit('Enregistrement plainte citoyenne', item.number, `${item.category} au PK ${item.pk}`, user);
    this.save();
    return item;
  }

  public updateGrievanceStatus(id: string, status: any, proposedSolution?: string, user?: User): GrievanceItem | undefined {
    const item = this.data.grievances.find((g) => g.id === id);
    if (!item) return undefined;
    item.status = status;
    if (proposedSolution) item.proposedSolution = proposedSolution;
    this.logAudit('Traitement plainte', item.number, `Statut : ${status}`, user);
    this.save();
    return item;
  }

  // --- VBG ---
  public get vbgCases(): VbgCaseItem[] {
    return this.data.vbgCases;
  }

  // --- Rapports d'état ---
  public get reports(): ReportItem[] {
    return this.data.reports;
  }

  public addReport(rep: ReportItem, user?: User): ReportItem {
    this.data.reports.unshift(rep);
    this.logAudit('Génération rapport officiel', rep.code, rep.title, user);
    this.save();
    return rep;
  }

  public validateReport(id: string, user?: User): ReportItem | undefined {
    const rep = this.data.reports.find((r) => r.id === id);
    if (!rep) return undefined;
    rep.status = 'Published';
    this.logAudit('Validation rapport officiel', rep.code, `Signé et publié`, user);
    this.save();
    return rep;
  }

  public transmitDonorReport(id: string, user?: User): ReportItem | undefined {
    const rep = this.data.reports.find((r) => r.id === id);
    if (!rep) return undefined;
    rep.status = 'TransmisBailleur';
    this.logAudit('Transmission rapport au bailleur', rep.code, `Transmis à la Banque Mondiale`, user);
    this.save();
    return rep;
  }

  // --- Alertes ---
  public get alerts(): DemoAlert[] {
    return this.data.alerts;
  }

  public markAlertAsRead(id: string) {
    const alt = this.data.alerts.find((a) => a.id === id);
    if (alt) {
      alt.isRead = true;
      this.save();
    }
  }

  public pushNextDemoAlert(): DemoAlert | null {
    // Trouve la première alerte non lue ou clone la première
    const unread = this.data.alerts.find((a) => !a.isRead);
    if (unread) {
      unread.timestamp = clock.toISOString();
      unread.isRead = false;
      this.save();
      return unread;
    }
    const cloned: DemoAlert = {
      id: `alt-${Date.now().toString(36)}`,
      timestamp: clock.toISOString(),
      title: 'Alerte périodique de démonstration',
      message: 'Surveillance continue des indicateurs d\'avancement physique, financier et E&S du projet RN13.',
      severity: 'info',
      targetActors: ['mo', 'amo', 'moe', 'entreprise', 'bailleur'],
      linkRoute: '/rapports',
      isRead: false,
    };
    this.data.alerts.unshift(cloned);
    this.save();
    return cloned;
  }

  // --- Ordres de Service (OS) ---
  public get serviceOrders(): ServiceOrder[] {
    return this.data.serviceOrders || [];
  }

  public addServiceOrder(so: ServiceOrder, user?: User): ServiceOrder {
    if (!this.data.serviceOrders) this.data.serviceOrders = [];
    this.data.serviceOrders.unshift(so);
    this.logAudit('Émission Ordre de Service', so.number, `${so.title} (${so.type})`, user);
    this.save();
    return so;
  }

  // --- Suivi Linéaire du Tracé & Arrêts de Chantier (Où s'arrêter ?) ---
  public get roadStops(): RoadSectionStop[] {
    return this.data.roadStops || [];
  }

  public restartRoadSection(sectionId: string, osNumber: string, user?: User): RoadSectionStop | undefined {
    const sec = this.data.roadStops.find((s) => s.id === sectionId);
    if (!sec) return undefined;
    sec.state = 'EnCours';
    sec.allConditionsMet = true;
    sec.stopReason = undefined;
    sec.daysStopped = 0;
    this.logAudit('Reprise des travaux sur section', `${sec.pkStart} - ${sec.pkEnd}`, `Reprise autorisée sous ${osNumber}`, user);
    this.save();
    return sec;
  }

  public stopRoadSection(sectionId: string, reason: any, osNumber: string, user?: User): RoadSectionStop | undefined {
    const sec = this.data.roadStops.find((s) => s.id === sectionId);
    if (!sec) return undefined;
    sec.state = 'ArreteBloque';
    sec.allConditionsMet = false;
    sec.stopReason = reason;
    sec.activeOsNumber = osNumber;
    sec.stopDate = clock.toISOString().slice(0, 10);
    this.logAudit('Arrêt de chantier sur section', `${sec.pkStart} - ${sec.pkEnd}`, `Arrêt notifié sous ${osNumber} (Motif: ${reason})`, user);
    this.save();
    return sec;
  }

  // --- Tâches et Sous-Projets par Lot (LotTasks) ---
  public get lotTasks(): LotTask[] {
    return this.data.lotTasks || [];
  }

  public getLotTasks(lotId?: string): LotTask[] {
    if (!this.data.lotTasks) return [];
    if (!lotId || lotId === 'GLOBAL') return this.data.lotTasks;
    return this.data.lotTasks.filter((t) => t.lotId === lotId);
  }

  public getLotTaskById(id: string): LotTask | undefined {
    return (this.data.lotTasks || []).find((t) => t.id === id);
  }

  public validateLotTaskMoe(
    taskId: string,
    visa: 'A' | 'B' | 'C' | 'D',
    remarks: string,
    user?: User
  ): LotTask | undefined {
    const task = (this.data.lotTasks || []).find((t) => t.id === taskId);
    if (!task) return undefined;
    task.moeValidation = {
      validated: true,
      validatedBy: user?.fullName || 'Mission de Contrôle SCET',
      visa,
      date: clock.toISOString().slice(0, 10),
      remarks,
    };
    task.status = 'Vise_MOE';
    this.logAudit(
      'Visa MOE accordé sur tâche de lot',
      task.code,
      `Visa ${visa} attribué: ${remarks}`,
      user
    );
    this.save();
    return task;
  }

  public approveLotTaskMo(
    taskId: string,
    orderNumber: string,
    user?: User
  ): LotTask | undefined {
    const task = (this.data.lotTasks || []).find((t) => t.id === taskId);
    if (!task) return undefined;
    task.moValidation = {
      approved: true,
      approvedBy: user?.fullName || 'Maître d\'Ouvrage DGPC',
      date: clock.toISOString().slice(0, 10),
      orderNumber,
    };
    task.status = 'Approuve_MO';
    this.logAudit(
      'Approbation finale MO sur tâche de lot',
      task.code,
      `Approbation validée sous référence ${orderNumber}`,
      user
    );
    this.save();
    return task;
  }

  public addLotTask(task: LotTask, user?: User): LotTask {
    if (!this.data.lotTasks) this.data.lotTasks = [];
    this.data.lotTasks.unshift(task);
    this.logAudit('Création nouvelle tâche de sous-projet lot', task.code, task.title, user);
    this.save();
    return task;
  }

  // --- Sécurité Routière et SST (Spécification Saiefeddine - Module 7) ---
  public get roadSafetyAudits(): RoadSafetyAudit[] {
    return this.data.roadSafetyAudits || [];
  }

  public addRoadSafetyAudit(audit: RoadSafetyAudit, user?: User): RoadSafetyAudit {
    if (!this.data.roadSafetyAudits) this.data.roadSafetyAudits = [];
    this.data.roadSafetyAudits.unshift(audit);
    this.logAudit('Enregistrement Audit de Sécurité Routière (ASR)', audit.code, audit.title, user);
    this.save();
    return audit;
  }

  public updateRoadSafetyAuditStatus(id: string, status: any, user?: User): RoadSafetyAudit | undefined {
    const item = (this.data.roadSafetyAudits || []).find((a) => a.id === id);
    if (!item) return undefined;
    item.status = status;
    this.logAudit('Mise à jour statut Audit ASR', item.code, `Nouveau statut: ${status}`, user);
    this.save();
    return item;
  }

  public get trafficDiversions(): TrafficDiversion[] {
    return this.data.trafficDiversions || [];
  }

  public addTrafficDiversion(div: TrafficDiversion, user?: User): TrafficDiversion {
    if (!this.data.trafficDiversions) this.data.trafficDiversions = [];
    this.data.trafficDiversions.unshift(div);
    this.logAudit('Création Déviation & Plan de Circulation', div.code, div.title, user);
    this.save();
    return div;
  }

  public updateTrafficDiversionStatus(id: string, status: any, user?: User): TrafficDiversion | undefined {
    const item = (this.data.trafficDiversions || []).find((d) => d.id === id);
    if (!item) return undefined;
    item.status = status;
    this.logAudit('Mise à jour Déviation routière', item.code, `Statut passé à ${status}`, user);
    this.save();
    return item;
  }

  public get roadInspections(): RoadInspection[] {
    return this.data.roadInspections || [];
  }

  public addRoadInspection(insp: RoadInspection, user?: User): RoadInspection {
    if (!this.data.roadInspections) this.data.roadInspections = [];
    this.data.roadInspections.unshift(insp);
    this.logAudit('Rapport d\'inspection terrain sécurité routière', `PK ${insp.pk}`, `${insp.findingCategory}: ${insp.description}`, user);
    this.save();
    return insp;
  }

  public updateRoadInspectionStatus(id: string, status: any, user?: User): RoadInspection | undefined {
    const item = (this.data.roadInspections || []).find((i) => i.id === id);
    if (!item) return undefined;
    item.status = status;
    this.logAudit('Rectification constat sécurité routière', `PK ${item.pk}`, `Statut: ${status}`, user);
    this.save();
    return item;
  }

  // --- Matrice Bailleurs BM / BEI (Section 7 & Module 11) ---
  public get donorRequirements(): DonorRequirement[] {
    return this.data.donorRequirements || [];
  }

  public updateDonorRequirementStatus(
    id: string,
    status: any,
    remarks: string,
    user?: User
  ): DonorRequirement | undefined {
    const req = (this.data.donorRequirements || []).find((r) => r.id === id);
    if (!req) return undefined;
    req.complianceStatus = status;
    req.reviewRemarks = remarks;
    req.lastReviewDate = clock.toISOString().slice(0, 10);
    req.reviewerName = user?.fullName || 'Auditeur Bailleur';
    this.logAudit('Revue conformité bailleurs (BM/BEI)', req.domainTitle, `Statut ${status} (${remarks})`, user);
    this.save();
    return req;
  }

  // --- Bordereaux de Transmission / Transmittals (Module 3 & Section 5) ---
  public get transmittals(): TransmittalSlip[] {
    return this.data.transmittals || [];
  }

  public getTransmittalById(id: string): TransmittalSlip | undefined {
    return (this.data.transmittals || []).find((t) => t.id === id);
  }

  public acknowledgeTransmittal(id: string, reference: string, user?: User): TransmittalSlip | undefined {
    const slip = (this.data.transmittals || []).find((t) => t.id === id);
    if (!slip) return undefined;
    slip.status = 'Accuse_Receptionne';
    slip.ackDate = clock.toISOString();
    slip.ackUser = user?.fullName || 'Destinataire Officiel';
    slip.ackReference = reference;
    this.logAudit('Accusé de réception Bordereau', slip.slipNumber, `Accusé enregistré sous réf: ${reference}`, user);
    this.save();
    return slip;
  }

  public addTransmittal(slip: TransmittalSlip, user?: User): TransmittalSlip {
    if (!this.data.transmittals) this.data.transmittals = [];
    this.data.transmittals.unshift(slip);
    this.logAudit('Émission Bordereau de transmission numérique', slip.slipNumber, slip.objectTitle, user);
    this.save();
    return slip;
  }

  // --- Réception et DOE (Module 12) ---
  public get receptionRecords(): ReceptionRecord[] {
    return this.data.receptionRecords || [];
  }

  public get receptionReserves(): ReceptionReserve[] {
    return this.data.receptionReserves || [];
  }

  public updateReserveStatus(
    reserveId: string,
    status: any,
    proofDoc?: string,
    user?: User
  ): ReceptionReserve | undefined {
    const res = (this.data.receptionReserves || []).find((r) => r.id === reserveId);
    if (!res) return undefined;
    res.status = status;
    if (status === 'Levee_Verifiee') {
      res.levéeDate = clock.toISOString().slice(0, 10);
    }
    if (proofDoc) res.proofDocCode = proofDoc;
    this.logAudit('Mise à jour Réserve de Réception', `PK ${res.pk}`, `Statut: ${status}`, user);

    // Mettre à jour le décompte des réserves ouvertes dans la réception liée
    const rec = (this.data.receptionRecords || []).find((r) => r.id === res.receptionId);
    if (rec) {
      rec.openReservesCount = (this.data.receptionReserves || []).filter(
        (r) => r.receptionId === rec.id && r.status !== 'Levee_Verifiee'
      ).length;
    }
    this.save();
    return res;
  }

  public get doeItems(): DoeItem[] {
    return this.data.doeItems || [];
  }

  public validateDoeItemMoe(id: string, user?: User): DoeItem | undefined {
    const item = (this.data.doeItems || []).find((d) => d.id === id);
    if (!item) return undefined;
    item.moeValidation = true;
    this.logAudit('Validation DOE par la Mission de Contrôle', item.code, item.title, user);
    this.save();
    return item;
  }

  public approveDoeItemMo(id: string, user?: User): DoeItem | undefined {
    const item = (this.data.doeItems || []).find((d) => d.id === id);
    if (!item) return undefined;
    item.moApproval = true;
    item.dgpcTransferReady = true;
    this.logAudit('Approbation finale DOE Maître d\'Ouvrage DGPC', item.code, item.title, user);
    this.save();
    return item;
  }

  public addDoeItem(item: DoeItem, user?: User): DoeItem {
    if (!this.data.doeItems) this.data.doeItems = [];
    this.data.doeItems.unshift(item);
    this.logAudit('Dépôt pièce DOE récolée', item.code, item.title, user);
    this.save();
    return item;
  }

  // --- Cartographie OSM & Features Géolocalisées (Section 15) ---
  public get geoFeatures(): GeoFeatureItem[] {
    return this.data.geoFeatures || [];
  }

  public addGeoFeature(feat: GeoFeatureItem, user?: User): GeoFeatureItem {
    if (!this.data.geoFeatures) this.data.geoFeatures = [];
    this.data.geoFeatures.unshift(feat);
    this.logAudit('Ajout élément cartographique', feat.title, `${feat.layer} - ${feat.pk} (${feat.source})`, user);
    this.save();
    return feat;
  }

  public updateGeoFeatureStatus(id: string, status: any, user?: User): GeoFeatureItem | undefined {
    const feat = (this.data.geoFeatures || []).find((f) => f.id === id);
    if (!feat) return undefined;
    feat.status = status;
    this.logAudit('Mise à jour statut élément carto', feat.title, `Nouveau statut: ${status}`, user);
    this.save();
    return feat;
  }

  // --- Réunions & PV de Chantier (Section 23.1 & 23.2) ---
  public get meetings(): MeetingMinute[] {
    return this.data.meetings || [];
  }

  public addMeeting(m: MeetingMinute, user?: User): MeetingMinute {
    if (!this.data.meetings) this.data.meetings = [];
    this.data.meetings.unshift(m);
    this.logAudit('Création PV de Réunion', m.number, m.title, user);
    this.save();
    return m;
  }

  public updateMeetingStatus(id: string, status: any, user?: User): MeetingMinute | undefined {
    const m = (this.data.meetings || []).find((x) => x.id === id);
    if (!m) return undefined;
    m.status = status;
    this.logAudit('Mise à jour statut PV de Réunion', m.number, `Statut: ${status}`, user);
    this.save();
    return m;
  }

  // --- Notes d'Observations NO (Section 23.3) ---
  public get observationNotes(): ObservationNote[] {
    return this.data.observationNotes || [];
  }

  public addObservationNote(note: ObservationNote, user?: User): ObservationNote {
    if (!this.data.observationNotes) this.data.observationNotes = [];
    this.data.observationNotes.unshift(note);
    this.logAudit('Émission Note d\'Observations', note.code, note.title, user);
    this.save();
    return note;
  }

  public updateObservationNoteStatus(id: string, status: any, user?: User): ObservationNote | undefined {
    const n = (this.data.observationNotes || []).find((x) => x.id === id);
    if (!n) return undefined;
    n.status = status;
    this.logAudit('Mise à jour Note d\'Observations', n.code, `Statut: ${status}`, user);
    this.save();
    return n;
  }

  public updateObservationItemResponse(
    noteId: string,
    itemNumber: string,
    contractorResponse: string,
    user?: User
  ): ObservationNote | undefined {
    const n = (this.data.observationNotes || []).find((x) => x.id === noteId);
    if (!n) return undefined;
    const itm = n.items.find((i) => i.itemNumber === itemNumber);
    if (itm) {
      itm.contractorResponse = contractorResponse;
      itm.responseStatus = 'Accord_Propose';
      itm.verificationResult = 'En_Verification';
      n.status = 'Reponse_Recue';
      this.logAudit('Réponse à observation de chantier', itemNumber, contractorResponse.slice(0, 50), user);
      this.save();
    }
    return n;
  }

  // --- Courriers & Correspondance (Section 23.4) ---
  public get correspondence(): CorrespondenceLetter[] {
    return this.data.correspondence || [];
  }

  public addCorrespondence(c: CorrespondenceLetter, user?: User): CorrespondenceLetter {
    if (!this.data.correspondence) this.data.correspondence = [];
    this.data.correspondence.unshift(c);
    this.logAudit('Enregistrement Courrier', c.internalNumber, `${c.direction} - ${c.objectTitle}`, user);
    this.save();
    return c;
  }

  public updateCorrespondenceStatus(id: string, status: any, user?: User): CorrespondenceLetter | undefined {
    const c = (this.data.correspondence || []).find((x) => x.id === id);
    if (!c) return undefined;
    c.status = status;
    this.logAudit('Mise à jour statut courrier', c.internalNumber, `Statut: ${status}`, user);
    this.save();
    return c;
  }

  // --- Rapports Mensuels Structurés (Section 23.5) ---
  public get monthlyReports(): MonthlyReport12Point[] {
    return this.data.monthlyReports || [];
  }

  public updateMonthlyReportStatus(id: string, status: any, user?: User): MonthlyReport12Point | undefined {
    const r = (this.data.monthlyReports || []).find((x) => x.id === id);
    if (!r) return undefined;
    r.status = status;
    this.logAudit('Validation Rapport Mensuel 12-Points', r.code, `Nouveau statut: ${status}`, user);
    this.save();
    return r;
  }

  // --- Devis & Chiffrage v2.1 (Sections 18-20) ---
  public get budgetPostes(): DevisPoste[] {
    return this.data.budgetPostes || [];
  }

  public get budgetScenarios(): DevisScenario[] {
    return this.data.budgetScenarios || [];
  }

  public get commercialOffers(): OffreCommerciale[] {
    return this.data.commercialOffers || [];
  }
}

export const db = new DatabaseManager();
