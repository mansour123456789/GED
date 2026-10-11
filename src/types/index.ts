// Types complets pour GED-RN13-V2 (Génie Civil - Projet routier 2x2 voies)

export type ActorKey = 'bailleur' | 'mo' | 'amo' | 'moe' | 'entreprise';
export type ActorLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export type UserSubRole =
  | 'admin'
  | 'mo_chef'
  | 'mo_es'
  | 'mo_foncier'
  | 'mo_grm'
  | 'amo_dc'
  | 'amo_ing'
  | 'amo_es'
  | 'moe_chef'
  | 'moe_hse'
  | 'ent_chef'
  | 'ent_hse'
  | 'ent_qualite'
  | 'ba_sp';

export interface User {
  id: string;
  username: string;
  fullName: string;
  actor: ActorKey;
  actorLetter: ActorLetter;
  actorLabel: string;
  subRole: UserSubRole;
  subRoleLabel: string;
  lots: string[]; // ['L01', 'L02', 'L03'] ou ['*']
  email: string;
  phone?: string;
  avatarColor?: string;
}

export type TechnicalFileFormat = 'PDF' | 'EXCEL' | 'IMAGE' | 'AUTOCAD' | 'AUTRE';

export interface Lot {
  id: string; // 'L01', 'L02', 'L03'
  code: string;
  name: string;
  pkStart: string; // '0+000'
  pkEnd: string;   // '14+000'
  phase: 'Conception' | 'Passation' | 'Exécution' | 'Garantie' | 'Clôture';
  progressPhysicalPct: number;
  progressFinancialPct: number;
  contractorName?: string;
  supervisorName?: string;
  governorate?: string;
  linearKm?: number;
  budgetTnd?: number;
  contractStartDate?: string;
  contractEndDate?: string;
  revisedEndDate?: string;
  description?: string;
  contractorInfo?: {
    name: string;
    director: string;
    contact: string;
  };
  supervisorInfo?: {
    name: string;
    missionChief: string;
    contact: string;
  };
  citizenStats?: {
    householdsCount: number;
    indemnifiedCount: number;
    oliveTreesCount: number;
    oliveTreesIndemnified: number;
    openGrievances: number;
    resolvedGrievances: number;
  };
}

export interface LotTask {
  id: string;
  lotId: string; // 'L01' | 'L02' | 'L03' | 'GLOBAL'
  code: string;  // 'TSK-L01-01'
  title: string;
  description: string;
  phase: 'Conception' | 'Foncier_PAR' | 'Passation' | 'Execution' | 'Reception';
  corpsEtat: 'Terrassements' | 'Ouvrages' | 'Chaussees' | 'Assainissement' | 'Foncier' | 'HSE' | 'General';
  assignedActor: ActorLetter; // 'E' | 'D' | 'B' | 'C' | 'A'
  assignedActorLabel: string;
  deadline: string; // ISO date '2026-10-25'
  status: 'A_Faire' | 'Soumis_Controle' | 'Vise_MOE' | 'Approuve_MO' | 'Bloque';
  moeValidation: {
    validated: boolean;
    validatedBy?: string;
    visa?: 'A' | 'B' | 'C' | 'D';
    date?: string;
    remarks?: string;
  };
  moValidation: {
    approved: boolean;
    approvedBy?: string;
    date?: string;
    orderNumber?: string;
  };
  linkedDocumentsCount: number;
  isMilestoneCritical: boolean;
  citizenImpactSummary?: string;
  fileFormatSample?: TechnicalFileFormat;
}

// 2. Documents GED
export type DocState = 'WIP' | 'Shared' | 'Published' | 'Archived';
export type VisaCode = 'A' | 'B' | 'C' | 'D';
export type NoStatus = 'NON_REQUISE' | 'NO_REQUISE' | 'NO_DEMANDEE' | 'NO_OBTENUE' | 'NO_OBSERVATIONS' | 'NO_REFUSEE';
export type ConfidentialityLevel = 'Public' | 'Projet' | 'Restreint';

export type DocCategory =
  | 'PEC' // Pièces écrites
  | 'PLN' // Plans
  | 'ETU' // Études (APS, APD, géotech...)
  | 'ESI' // Instruments E&S (PGES, EIES, PAR...)
  | 'EXE' // Études d'exécution (PAQ, PGES-E, PGT...)
  | 'QUA' // Qualité (PAQ, essais, NCR...)
  | 'HSE' // HSE & Incidents
  | 'TRV' // Suivi travaux & Décomptes
  | 'CTR' // Contrat, avenants, OS
  | 'RAP'; // Rapports d'état

export interface Revision {
  revisionTag?: string; // 'P01', 'P02', 'C01', 'AB01'
  revisionNumber?: string;
  versionNumber?: number;
  fileName: string;
  sizeBytes?: number;
  fileSize?: string;
  sha256?: string;
  fileHash?: string;
  uploadedBy?: string;
  uploadedByName?: string;
  uploadedByActor?: ActorLetter;
  authorName?: string;
  authorLetter?: ActorLetter;
  uploadedAt?: string;
  date?: string;
  cdeState?: string;
  visaCode?: VisaCode;
  note?: string;
  changeDescription?: string;
}

export interface DocumentItem {
  id: string;
  code: string; // 'RN13-L03-PEC-CCTP-0001-P02'
  title: string;
  description?: string;
  lotId: string;
  category: DocCategory;
  categoryLabel: string;
  typeCode: string; // CCTP, CCAP, TGO, PTL, PTT, OHA, PAQ...
  state: DocState;
  currentRevision: string;
  revisions: Revision[];
  visa?: VisaCode;
  noStatus: NoStatus;
  confidentiality: ConfidentialityLevel;
  authorId: string;
  authorName: string;
  authorActor: ActorKey;
  authorLetter: ActorLetter;
  assignedReviewerActors: ActorLetter[];
  pkRange?: string; // '12+400 → 12+650'
  hasBlockingComments: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// 3. Commentaires & Revue (CRD)
export type CommentSeverity = 'bloquant' | 'majeur' | 'mineur' | 'observation';
export type CommentStatus = 'ouvert' | 'repondu' | 'clos';

export interface CommentItem {
  id: string;
  docId: string;
  docCode: string;
  revision: string;
  authorId: string;
  authorName: string;
  authorActor: ActorKey;
  authorLetter: ActorLetter;
  pageOrArticle: string;
  severity: CommentSeverity;
  commentText: string;
  responseText?: string;
  responseAuthorName?: string;
  responseAuthorLetter?: ActorLetter;
  status: CommentStatus;
  createdAt: string;
  answeredAt?: string;
  closedAt?: string;
}

// 4. Demandes de Non-Objection (Bailleur)
export interface NoRequest {
  id: string;
  number: string; // 'NO-2026-0012'
  lotId: string;
  title: string;
  object: string;
  docIds: string[];
  docCodes: string[];
  submittedBy: string;
  submittedAt: string;
  status: 'NO_DEMANDEE' | 'NO_OBTENUE' | 'NO_OBSERVATIONS' | 'NO_REFUSEE';
  donorObservations?: string;
  decidedAt?: string;
  decidedBy?: string;
  letterRef?: string;
  deadline: string;
}

// 5. Conditions de Démarrage (Gates) par tronçon
export interface SectionGate {
  id: string;
  lotId: string;
  sectionTitle: string; // 'Tronçon 1 (PK 0+000 à 3+500)'
  pkRange: string;
  parFree: boolean;        // Emprise libérée (PAR soldé)
  pgeseApproved: boolean;  // PGES-E visé bon pour exécution
  pgtApproved: boolean;    // Plan de trafic validé
  ppspsApproved: boolean;  // PPSPS approuvé
  paqApproved: boolean;    // PAQ visé A
  huissierDone: boolean;   // Constat d'huissier préalable
  canStart: boolean;
  blockReason?: string;
}

// 6. Qualité & Fiches de Non-Conformité (NCR)
export type NcrSeverity = 'Critique' | 'Majeure' | 'Mineure';
export type NcrStatus = 'Ouverte' | 'EnVerification' | 'Cloturee';

export interface NcrItem {
  id: string;
  number: string; // 'NCR-2026-0042'
  lotId: string;
  pk: string;
  title: string;
  description: string;
  severity: NcrSeverity;
  emitterId: string;
  emitterName: string;
  emitterActor: ActorLetter;
  responsibleActor: ActorLetter; // Entreprise 'E'
  deadline: string;
  status: NcrStatus;
  correctiveAction?: string;
  evidenceSummary?: string;
  closedAt?: string;
}

export interface LabTest {
  id: string;
  lotId: string;
  testType: 'Proctor (Compacité)' | 'Portance CBR' | 'Équivalent de Sable' | 'Béton 28j (Dalot)' | 'Teneur en Liant Bitume';
  pk: string;
  date: string;
  result: string;
  threshold: string;
  isConform: boolean;
  labName: string;
}

// 7. HSE & Incidents
export type IncidentSeverity = 'Faible' | 'Moyenne' | 'Grave';

export interface IncidentItem {
  id: string;
  number: string; // 'INC-2026-0008'
  lotId: string;
  pk: string;
  date: string;
  title: string;
  nature: 'Accident engin' | 'Chute de hauteur' | 'Pollution accidentelle hydrocarbures' | 'Éboulement tranchée';
  severity: IncidentSeverity;
  injuredCount: number;
  description: string;
  declaredBy: string;
  declaredByActor: ActorLetter;
  donorNotificationDeadline?: string; // 48h
  donorNotifiedAt?: string;
  status: 'Declare' | 'BailleurNotifie' | 'RapportTransmis' | 'Cloture';
}

// 8. Décomptes Mensuels (IPC)
export type IpcStatus = 'Brouillon' | 'Soumis' | 'Certifie' | 'Approuve' | 'Paye' | 'TransmisBailleur';

export interface IpcItem {
  id: string;
  number: string; // 'IPC-L01-N04'
  lotId: string;
  month: string; // 'Septembre 2026'
  contractorName: string;
  amountGrossTnd: number;
  retentionTnd: number;
  amountNetTnd: number;
  status: IpcStatus;
  submittedAt?: string;
  certifiedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  transmittalId?: string;
}

// 9. PAR (Plan d'Action de Réinstallation & Foncier / Arathi w Ta3widh)
export interface ParcelDocument {
  id: string;
  name: string;
  type: 'CIN' | 'Plan_Bornage' | 'PV_Expertise' | 'Accord_Conciliation' | 'Quittance_Paiement' | 'PV_Liberation_Emprise';
  date: string;
  fileName: string;
  fileSize: string;
  sha256?: string;
}

export interface HouseholdItem {
  id: string;
  code: string; // 'HH-L01-0042'
  parcelNumber: string; // 'RN13-PARC-042'
  lotId: string;
  governorate: 'Sfax' | 'Sidi Bouzid' | 'Kasserine';
  delegation: string; // 'Menzel Chaker', 'Bir Ali Ben Khelifa', 'Ouled Haffouz', 'Sbeitla'
  imada: string;
  pk: string; // '12+450'
  headName: string;
  cin: string;
  phone?: string;
  familyMembers: number;
  vulnerable: boolean;
  vulnerabilityReason?: string;
  // Consistance des biens
  landAreaSqm: number;
  landUnitPriceTnd: number;
  olivesAdultCount: number;
  olivesYoungCount: number;
  otherTreesCount: number;
  builtAreaSqm: number;
  fencesLengthM: number;
  wellsCount: number;
  // Montants & Statuts
  totalCompensationTnd: number;
  paidTnd: number;
  status: 'Recense' | 'OffreProposee' | 'AccordSigne' | 'PayePartiel' | 'Solde';
  empriseFree: boolean;
  pvLiberationNumber?: string;
  pvLiberationDate?: string;
  documents?: ParcelDocument[];
}

export interface OfferItem {
  id: string;
  householdId: string;
  householdCode: string;
  lotId: string;
  pk: string;
  amountLandTnd: number;
  amountBatiTnd: number;
  amountCropsTnd: number;
  vulnerabilityAllowanceTnd: number;
  totalTnd: number;
  status: 'Proposee' | 'Acceptee' | 'Approuvee' | 'Soldee';
  paidTnd: number;
}

// 10. Plaintes (MGP)
export type GrievanceStatus = 'Recue' | 'EnInstruction' | 'SolutionProposee' | 'Acceptee' | 'Cloturee';

export interface GrievanceItem {
  id: string;
  number: string; // 'GRIEF-2026-0054'
  lotId: string;
  pk: string;
  date: string;
  category: 'Poussière et arrosage' | 'Accès riverain coupé' | 'Bruit nocturne' | 'Fissures sur bâti' | 'Sécurité passage piéton';
  complainantName: string;
  isAnonymous: boolean;
  description: string;
  assignedTo: string;
  slaDueDate: string;
  status: GrievanceStatus;
  proposedSolution?: string;
  satisfactionRecorded?: 'Satisfait' | 'Non satisfait';
}

// 11. VBG (Restreint / Anonymisé)
export interface VbgCaseItem {
  id: string;
  caseCode: string; // 'VBG-2026-CONF-003'
  lotId: string;
  date: string;
  assistanceType: 'Prise en charge médicale' | 'Soutien psychologique' | 'Assistance juridique';
  referredProvider: string;
  status: 'Reçu' | 'Orienté' | 'Accompagné' | 'Clôturé';
  restrictedToUser: 'mo.grm';
}

// 12. Rapports consolidés d'état
export type ReportType = 'RPT-ETA' | 'RPT-AVA' | 'RPT-ES' | 'RPT-ACH';
export type ReportStatus = 'Brouillon' | 'Shared' | 'Published' | 'TransmisBailleur';

export interface ReportItem {
  id: string;
  code: string; // 'RN13-L01-RAP-ETA-2026-M09'
  type: ReportType;
  lotId: string;
  period: string; // 'Septembre 2026'
  title: string;
  progressPhysicalPct: number;
  progressFinancialPct: number;
  openNcrCount: number;
  incidentCount: number;
  empriseLiberationPct: number;
  generatedBy: string;
  generatedAt: string;
  status: ReportStatus;
  executiveSummary: string;
}

// 13. Audit & Notifications
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  actorLetter: ActorLetter;
  action: string;
  targetObject: string;
  details: string;
}

export interface DemoAlert {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  targetActors: ActorKey[];
  linkRoute: string;
  isRead: boolean;
  hasCountdown?: boolean;
  countdownMinutes?: number;
}

// 14. Ordres de Service (OS) & Arrêts de Chantier
export type ServiceOrderType = 'Demarrage' | 'ArretPartiel' | 'ArretTotal' | 'Reprise' | 'AvenantDelai' | 'ModificationTechnique';

export interface ServiceOrder {
  id: string;
  number: string; // 'OS-RN13-2026-002'
  type: ServiceOrderType;
  title: string;
  lotId: string;
  pkRange: string; // 'PK 12+450 à 13+200'
  dateNotification: string;
  signatory: string;
  reason: string;
  impactDelayDays?: number;
  linkedDocumentCode?: string;
  linkedParcels?: string[];
  status: 'Notifie' | 'EnExecution' | 'Leve' | 'Cloture';
  fileName?: string;
}

// 15. État Linéaire du Tracé & Postes d'Arrêt (Où s'arrêter ?)
export type SectionWorkState = 'EnCours' | 'Ralenti' | 'ArreteBloque';

export interface RoadSectionStop {
  id: string;
  lotId: string;
  pkStart: string; // '12+450'
  pkEnd: string;   // '13+200'
  title: string;
  currentWork: 'Terrassements (Déblais/Remblais)' | 'Ouvrage Hydraulique (Dalot)' | 'Couche de Fondation (GNT)' | 'Enrobé Bitumineux';
  state: SectionWorkState;
  stopReason?: 'Litige Foncier / Parcelle non libérée' | 'Intempéries / Crue d\'Oued' | 'Réseau Concessionnaire (SONEDE/STEG)' | 'Non-Conformité Critique (Béton non résistant)' | 'Enquête Accident HSE';
  stopDate?: string;
  daysStopped?: number;
  activeOsNumber?: string; // 'OS-RN13-2026-002'
  requiredConditionsToRestart: string[];
  allConditionsMet: boolean;
  contractorName: string;
  supervisorName: string;
}

// 16. Sécurité Routière et SST (Spécification Saiefeddine - Module 7)
export type AsrPhase = 'Conception' | 'Travaux' | 'PreMiseEnService';
export type AsrRiskLevel = 'Faible' | 'Moyen' | 'Eleve' | 'Critique';

export interface RoadSafetyAudit {
  id: string;
  code: string; // 'ASR-RN13-2026-004'
  lotId: string;
  phase: AsrPhase;
  title: string;
  auditorName: string; // 'Saiefeddine & Experts Associés'
  dateAudit: string;
  pkStart: string;
  pkEnd: string;
  riskLevel: AsrRiskLevel;
  findingsCount: number;
  criticalDefects: string[];
  recommendations: string[];
  status: 'Rapport_Emis' | 'Plan_Action_Valide' | 'Mesures_En_Cours' | 'Cloture_Conforme';
  linkedDocumentCode?: string;
  attachmentName?: string;
}

export type DiversionStatus = 'En_Preparation' | 'Soumis_MOE' | 'Approuve_MO' | 'En_Service' | 'Depose';

export interface TrafficDiversion {
  id: string;
  code: string; // 'DEV-RN13-L01-012'
  lotId: string;
  title: string;
  pkStart: string;
  pkEnd: string;
  direction: 'Kasserine -> Sfax' | 'Sfax -> Kasserine' | 'Bidirectionnel Dévié';
  speedLimitKmh: 50 | 70 | 90;
  startDate: string;
  endDatePlan: string;
  status: DiversionStatus;
  // Spécifications techniques signalisation temporaire
  retroreflectivityClass: 'Classe 2 (RL >= 150)' | 'Classe 1 (RL >= 50)';
  balisageType: string; // 'Balises K5a + K8 + Séparateurs béton DBA/GBA'
  containmentDevices: 'GS2' | 'GS4' | 'GBA Béton'; // Dispositifs de retenue
  nightLightingConfirmed: boolean;
  policeAuthorizationRef: string; // 'Garde Nationale Sfax / Kasserine N° 84/2026'
  planDrawingCode: string; // 'DWG-DEV-012-R02'
  fileName?: string;
}

export interface RoadInspection {
  id: string;
  lotId: string;
  date: string;
  inspectorName: string; // 'Saiefeddine (Expert Sécurité Routière)'
  period: 'Visite Diurne (Jour)' | 'Visite Nocturne (Nuit)';
  pk: string;
  gpsCoords: string; // '34.7405° N, 10.7602° E'
  weather: 'Clair' | 'Vent de sable' | 'Pluie';
  findingCategory: 'Signalisation Dégradée' | 'Balisage Incomplet' | 'Glissière Déformée' | 'Poussière Visibilité' | 'Conflit Usagers-Engins';
  urgency: 'Immédiate (< 24h)' | 'Urgent (48h)' | 'Normal (7j)';
  description: string;
  correctiveAction: string;
  status: 'Signalé' | 'Ordre_Donné' | 'Rectifié_Terrain' | 'Vérifié';
  photoName?: string;
}

// 17. Conformité Bailleurs & Matrice de Preuves (Section 7 & Module 11)
export type ComplianceStatus = 'Conforme' | 'Partiellement_Conforme' | 'En_Revue' | 'Action_Requise';

export interface DonorRequirement {
  id: string;
  domainNumber: number; // 1 à 10
  domainTitle: string;  // 'Risques E&S', 'Parties prenantes', 'Travail', etc.
  worldBankRef: string; // 'NES 1'
  eibRef: string;       // 'Norme 1'
  description: string;
  applicableFunding: 'BM_Pret_9122' | 'BEI_Finance_2024' | 'Cofinancement_Conjoint';
  deliverableName: string;
  responsibleActor: ActorLetter; // 'B' | 'D' | 'E' | 'C'
  deadline: string;
  evidenceDocCode: string;
  evidenceDocVersion: string;
  evidenceTitle: string;
  evidenceFormat: TechnicalFileFormat;
  complianceStatus: ComplianceStatus;
  lastReviewDate: string;
  reviewerName: string;
  reviewRemarks: string;
  isAuditExportReady: boolean;
}

// 18. Bordereaux de Transmission / Transmittals (Module 3 & Section 5)
export type TransmittalPurpose = 'Pour Approbation' | 'Pour Information' | 'Pour Bon pour Exécution' | 'Pour Recolement';
export type TransmittalStatus = 'Emis' | 'Accuse_Receptionne' | 'En_Examen' | 'Traite_Vise' | 'Rejete';

export interface TransmittalItemDetail {
  id: string;
  docCode: string; // 'TN-R2X2-L01-CHA-PLN-000123'
  title: string;
  revision: 'R00' | 'R01' | 'R02' | 'R03';
  fileFormat: TechnicalFileFormat;
  fileName: string;
  fileSizeMb: number;
  purpose: TransmittalPurpose;
  status: 'Approuve' | 'Approuve_Avec_Reserves' | 'A_Reprendre' | 'En_Attente';
}

export interface TransmittalSlip {
  id: string;
  slipNumber: string; // 'TR-RN13-L01-2026-0045'
  lotId: string;
  lotName: string;
  objectTitle: string;
  senderOrg: string; // 'SOROUBAT BTP' ou 'SCET-TUNISIE'
  senderActor: ActorLetter;
  senderUser: string;
  recipientOrg: string; // 'Mission de Contrôle SCET' ou 'DGPC / Ministère'
  recipientActor: ActorLetter;
  recipientUser: string;
  submissionDate: string;
  dueDate: string;
  status: TransmittalStatus;
  items: TransmittalItemDetail[];
  ackDate?: string;
  ackUser?: string;
  ackReference?: string;
  downloadSlipFileName: string;
}

// 19. Réception et Dossier des Ouvrages Exécutés - DOE (Module 12)
export type ReceptionType = 'Reception_Provisoire' | 'Reception_Definitive' | 'Pre_Visite_Technique';
export type ReceptionStatus = 'Planifiee' | 'Prononcee_Avec_Reserves' | 'Prononcee_Sans_Reserve' | 'Ajournee';
export type ReserveCategory = 'Majeure_Bloquante' | 'Mineure_Finitions';

export interface ReceptionReserve {
  id: string;
  receptionId: string;
  lotId: string;
  pk: string;
  description: string;
  category: ReserveCategory;
  responsibleContractor: string;
  deadlineResolution: string;
  status: 'Ouverte' | 'En_Cours_Reprise' | 'Levee_Verifiee';
  levéeDate?: string;
  proofDocCode?: string;
  proofFileName?: string;
}

export interface ReceptionRecord {
  id: string;
  pvNumber: string; // 'PV-REC-PROV-RN13-L01'
  lotId: string;
  lotName: string;
  type: ReceptionType;
  dateCommission: string;
  commissionMembers: { name: string; org: string; role: string }[];
  status: ReceptionStatus;
  summaryVerdict: string;
  reservesCount: number;
  openReservesCount: number;
  guaranteeStartDate: string;
  guaranteeEndDate: string; // +1 an ou +10 ans
  transferDgpcStatus: 'En_Attente' | 'Dossier_Transmis' | 'Valide_DGPC';
  officialPvFileName: string;
}

export type DoeCategory = 'Plans_As_Built' | 'Notes_Calcul_Recollement' | 'Essais_Finaux_Laboratoire' | 'Fiches_Ouvrages_Art' | 'Garanties_Fabricants' | 'Guide_Entretien_DGPC';

export interface DoeItem {
  id: string;
  lotId: string;
  category: DoeCategory;
  categoryLabel: string;
  code: string; // 'DOE-RN13-L01-OA-01'
  title: string;
  revision: string; // 'R_DOE'
  format: TechnicalFileFormat;
  fileName: string;
  fileSizeMb: number;
  moeValidation: boolean;
  moApproval: boolean;
  dgpcTransferReady: boolean;
  updatedAt: string;
}

// 20. Cartographie OSM & Pilotage Géographique (Section 15 - Version 2.1)
export type GeoLayerType = 'Accidents' | 'Incidents' | 'Plaintes' | 'Avancement' | 'Inspections' | 'Audits' | 'Actions';
export type GeoPointSource = 'GPS_Smartphone' | 'Photo_EXIF' | 'Selection_Carte';

export interface GeoFeatureItem {
  id: string;
  layer: GeoLayerType;
  title: string;
  lotId: string; // 'L01' | 'L02' | 'L03'
  pk: string;    // 'PK 12+450'
  lat: number;
  lng: number;
  accuracyMeters?: number;
  source: GeoPointSource;
  date: string;
  severity?: 'Mortel' | 'Grave' | 'Matériel' | 'Critique' | 'Majeur' | 'Mineur';
  status: 'En_Cours' | 'En_Traitement' | 'Cloture_Verifie' | 'Valide' | 'Non_Conforme';
  description: string;
  responsibleOrg?: string;
  linkedDocCode?: string;
  photoUrl?: string;
  isSensitive?: boolean; // Plaintes sensibles anonymisées sur carte générale
  quantityPlanned?: number;
  quantityExecuted?: number;
  quantityAccepted?: number;
  unit?: string;
}

// 21. Réunions, PV et Décisions (Section 23.1 & 23.2)
export type MeetingType = 'Chantier' | 'Technique' | 'HSE_ES' | 'Coordination_DGPC';
export type MeetingStatus = 'Brouillon' | 'Diffuse_Commentaires' | 'Valide' | 'Signe';

export interface MeetingDecision {
  id: string;
  decisionNumber: string; // 'DEC-PV24-01'
  subject: string;
  assignedTo: string;
  deadline: string;
  status: 'En_Cours' | 'Realise' | 'En_Retard';
  linkedActionCode?: string;
}

export interface MeetingMinute {
  id: string;
  number: string; // 'PV-CH-2026-024'
  type: MeetingType;
  title: string;
  lotId: string;
  date: string;
  location: string;
  attendees: { name: string; org: string; role: string; present: boolean }[];
  agenda: string[];
  decisions: MeetingDecision[];
  status: MeetingStatus;
  signedPdfFile: string;
  notes: string;
}

// 22. Notes d'Observations NO (Section 23.3 - Réf. stable TN-R2X2-L01-NO-000045)
export interface ObservationItemDetail {
  itemNumber: string; // 'NO-000045/01'
  factualFinding: string;
  clauseRef: string;
  requestedMeasure: string;
  riskPriority: 'Critique' | 'Majeur' | 'Normal';
  responseStatus: 'En_Attente' | 'Accord_Propose' | 'Desaccord_Motive';
  contractorResponse?: string;
  verificationResult: 'En_Verification' | 'Conforme_Cloture' | 'A_Reprendre';
  proofDocCode?: string;
}

export interface ObservationNote {
  id: string;
  code: string; // 'TN-R2X2-L01-NO-000045'
  lotId: string;
  domain: 'Signalisation' | 'Chaussee' | 'Ouvrage_Art' | 'Securite_Usagers' | 'Environnement' | 'Laboratoire';
  title: string;
  authorName: string; // 'Saiefeddine / Mission Contrôle SCET'
  authorOrg: string;
  recipientOrg: string; // 'Entreprise SOROUBAT'
  dateEmission: string;
  deadline: string;
  pk: string;
  examinedDocCode?: string;
  examinedRevision?: string;
  status: 'Ouverte' | 'Reponse_Recue' | 'En_Verification' | 'Cloturee' | 'Rouvert';
  items: ObservationItemDetail[];
  closureProofFile?: string;
}

// 23. Courriers & Correspondances (Section 23.4)
export interface CorrespondenceLetter {
  id: string;
  direction: 'Entrant' | 'Sortant';
  internalNumber: string; // 'COR-2026-ENT-0142' / 'COR-2026-SOR-0098'
  externalRef: string;   // 'SOR-TUN-LTR-482'
  lotId: string;
  objectTitle: string;
  senderOrg: string;
  senderPerson: string;
  recipientOrg: string;
  recipientPerson: string;
  dateDocument: string;
  dateReceivedSent: string;
  channel: 'Porteur_Decharge' | 'Courrier_Recommande' | 'Courriel_Officiel';
  hasDeadline: boolean;
  deadlineDate?: string;
  status: 'En_Attente_Reponse' | 'Repondu' | 'Sans_Suite' | 'Clos';
  threadParentId?: string;
  attachments: { name: string; sizeMb: number }[];
  downloadFileName: string;
}

// 24. Rapport Mensuel Structuré en 12 Points (Section 23.5)
export interface MonthlyReportSectionKpi {
  label: string;
  value: string;
}

export interface MonthlyReport12Point {
  id: string;
  code: string; // 'RN13-RAP-MENS-2026-M09'
  period: string; // 'Septembre 2026'
  cutoffDate: string; // '2026-09-30'
  preparedBy: string;
  validatedBy: string;
  status: 'Brouillon' | 'En_Revue_DGPC' | 'Valide_Approuve' | 'Transmis_Bailleurs';
  sections: {
    num: number;
    title: string;
    summary: string;
    status: 'Complet' | 'En_Attente_Chiffres' | 'Valide';
    keyKpis?: MonthlyReportSectionKpi[];
  }[];
}

// 25. Budget & Chiffrage Prévisionnel v2.1 (Sections 18-20)
export interface DevisPoste {
  id: string;
  poste: string;
  chargeJoursPersonnes: number;
  tarifUnitaireTnd: number;
  montantTnd: number;
  description: string;
}

export interface DevisScenario {
  version: 'Prototype' | 'V1_Professionnelle' | 'Plateforme_Complete';
  titre: string;
  delaiEstime: string;
  budgetMinTnd: number;
  budgetMaxTnd: number;
  perimetre: string;
}

export interface OffreCommerciale {
  offre: 'Essentielle' | 'Professionnelle' | 'Institutionnelle';
  perimetre: string;
  setupMinTnd: number;
  setupMaxTnd: number;
  abonnementMinTnd: number;
  abonnementMaxTnd: number;
  usersCount: number;
  lotsCount: string;
}


