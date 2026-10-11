import React, { createContext, useContext, useState } from 'react';
import { useSession } from './sessionStore';
import { db } from '../mock/db';
import { toast } from 'sonner';

export interface GuideStep {
  stepNumber: number;
  title: string;
  targetUserUsername: string;
  targetUserLabel: string;
  route: string;
  description: string;
  expectedAction: string;
  actorLetter: 'A' | 'B' | 'C' | 'D' | 'E';
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    stepNumber: 1,
    title: '1. Cockpit DAO & Conception — Maître d\'ouvrage (B)',
    targetUserUsername: 'mo.chef',
    targetUserLabel: 'Hichem Gharbi (B — Maître d\'ouvrage)',
    route: '/conception/dao',
    description: 'Visualisation de la matrice d\'avancement du Dossier d\'Appel d\'Offres (DAO) du Lot L03 (PK 28+000 à 42+000). Vérification des pièces attendues et en revue.',
    expectedAction: 'Examiner le pipeline documentaire du lot L03.',
    actorLetter: 'B',
  },
  {
    stepNumber: 2,
    title: '2. Dépôt d\'un document routier normalisé',
    targetUserUsername: 'mo.chef',
    targetUserLabel: 'Hichem Gharbi (B — Maître d\'ouvrage)',
    route: '/documents/new',
    description: 'Assistant de dépôt en 4 étapes avec génération automatique de la codification normalisée RN13 et calcul d\'empreinte SHA-256.',
    expectedAction: 'Saisir les métadonnées et simuler le dépôt d\'une pièce écrite.',
    actorLetter: 'B',
  },
  {
    stepNumber: 3,
    title: '3. Fiche Document & Circuit de Revue (WIP → Shared)',
    targetUserUsername: 'mo.chef',
    targetUserLabel: 'Hichem Gharbi (B — Maître d\'ouvrage)',
    route: '/documents/doc-001',
    description: 'Consultation du CCTP révision P02. Chaîne de traçabilité, assignation des réviseurs C, D et A, et passage en revue partagée.',
    expectedAction: 'Observer l\'état Shared et les réviseurs notifiés.',
    actorLetter: 'B',
  },
  {
    stepNumber: 4,
    title: '4. Contrôle de complétude par l\'AMO (C)',
    targetUserUsername: 'amo.dc',
    targetUserLabel: 'Rim Cherif (C — Gestionnaire documentaire AMO)',
    route: '/revues',
    description: 'Vérification de conformité formelle sous 2 jours ouvrés par l\'AMO : présence du sommaire, signatures, conformité au cadre de classement.',
    expectedAction: 'Valider la complétude documentaire.',
    actorLetter: 'C',
  },
  {
    stepNumber: 5,
    title: '5. Poste de Revue & Commentaires bloquants (D)',
    targetUserUsername: 'moe.chef',
    targetUserLabel: 'Walid Jaziri (D — Maîtrise d\'œuvre Contrôle)',
    route: '/revues/crd',
    description: 'Poste de revue technique avec écran partagé. Émission d\'un commentaire bloquant sur la vitesse géométrique et l\'épaisseur de chaussée dans le registre CRD.',
    expectedAction: 'Consulter les commentaires bloquants ouverts qui interdisent la publication.',
    actorLetter: 'D',
  },
  {
    stepNumber: 6,
    title: '6. Prise en compte et réponse aux observations (B)',
    targetUserUsername: 'mo.chef',
    targetUserLabel: 'Hichem Gharbi (B — Maître d\'ouvrage)',
    route: '/revues/crd',
    description: 'L\'auteur rédige sa réponse technique dans le fil de discussion, joint la justification géométrique et lève les réserves.',
    expectedAction: 'Répondre au commentaire bloquant.',
    actorLetter: 'B',
  },
  {
    stepNumber: 7,
    title: '7. Demande de Non-Objection au Bailleur (B → A)',
    targetUserUsername: 'mo.chef',
    targetUserLabel: 'Hichem Gharbi (B — Maître d\'ouvrage)',
    route: '/revues/non-objection',
    description: 'Constitution du transmittal numérique groupant le CCTP, CCAP, plans et PGES. Envoi officiel de la demande NO-2026-0012 à la Banque Mondiale.',
    expectedAction: 'Vérifier la transmission de la demande avec transmittal sécurisé.',
    actorLetter: 'B',
  },
  {
    stepNumber: 8,
    title: '8. Examen et Décision de Non-Objection — Bailleur (A)',
    targetUserUsername: 'ba.sp',
    targetUserLabel: 'Amel Dridi (A — Banque Mondiale)',
    route: '/revues/non-objection',
    description: 'Instruction de la demande côté bailleur. La Banque Mondiale donne son avis favorable de non-objection avec référence de lettre officielle.',
    expectedAction: 'Cliquer sur « Donner la non-objection » pour valider le DAO.',
    actorLetter: 'A',
  },
  {
    stepNumber: 9,
    title: '9. Confirmation & Publication finale (C01)',
    targetUserUsername: 'mo.chef',
    targetUserLabel: 'Hichem Gharbi (B — Maître d\'ouvrage)',
    route: '/documents/doc-001',
    description: 'Le Maître d\'ouvrage applique le Visa A final. Le document bascule à l\'état Published (Approuvé et verrouillé), la révision P02 devient la révision contractuelle C01.',
    expectedAction: 'Publier la révision définitive.',
    actorLetter: 'B',
  },
  {
    stepNumber: 10,
    title: '10. Soumission du Décompte Mensuel N°04 — Entreprise (E)',
    targetUserUsername: 'ent.chef',
    targetUserLabel: 'Mourad Bouzid (E — Entreprise Travaux)',
    route: '/execution/decomptes',
    description: 'L\'Entreprise soumet le décompte mensuel IPC-L01-N04 d\'un montant net de 1 245 800 TND avec attachements métrés contradictoires.',
    expectedAction: 'Constater le décompte soumis en attente de certification.',
    actorLetter: 'E',
  },
  {
    stepNumber: 11,
    title: '11. Certification MOE & Alerte Incident 48h (D)',
    targetUserUsername: 'moe.chef',
    targetUserLabel: 'Walid Jaziri (D — Maîtrise d\'œuvre)',
    route: '/execution/decomptes',
    description: 'La MOE certifie les quantités du décompte. Suivi de l\'alerte critique d\'incident grave au PK 5+850 avec compte à rebours de notification au bailleur sous 48h.',
    expectedAction: 'Certifier le décompte et observer le compte à rebours incident.',
    actorLetter: 'D',
  },
  {
    stepNumber: 12,
    title: '12. Approbation Paiement & Consultation Détaillée du Rapport d\'État (B / C)',
    targetUserUsername: 'mo.chef',
    targetUserLabel: 'Hichem Gharbi (B — Maître d\'ouvrage)',
    route: '/rapports/rpt-001',
    description: 'Le Maître d\'ouvrage consulte la fiche détaillée du rapport d\'avancement : cadences physiques pour chaque lot (L01, L02, L03), liste complète des fichiers téléchargeables avec empreintes SHA-256 et état de validation des documents (visas MOE, approbation DGPC, bailleurs).',
    expectedAction: 'Consulter la décomposition physique des 3 lots, examiner les pièces jointes et certifier le rapport.',
    actorLetter: 'B',
  },
  {
    stepNumber: 13,
    title: '13. Suivi Linéaire du Tracé & Postes d\'Arrêt (Où s\'arrêter ?)',
    targetUserUsername: 'moe.chef',
    targetUserLabel: 'Walid Jaziri (D — Maîtrise d\'œuvre)',
    route: '/execution/blocages',
    description: 'Cartographie des 5 arrêts critiques du chantier (crues de l\'Oued Fekka, parcelles d\'oliviers non libérées, conduite SONEDE DN600). Définition des conditions impératives de reprise.',
    expectedAction: 'Examiner les blocages par PK et les 6 conditions préalables pour autoriser la reprise des travaux.',
    actorLetter: 'D',
  },
  {
    stepNumber: 14,
    title: '14. Registre des Ordres de Service (OS) & Avenants (5+ ans)',
    targetUserUsername: 'mo.chef',
    targetUserLabel: 'Hichem Gharbi (B — Maître d\'ouvrage)',
    route: '/execution/os',
    description: 'Gestion contractuelle des OS d\'Arrêt (météo, crues, libération emprise), OS de Reprise, et avenants prolongeant le calendrier de réalisation jusqu\'en 2029 (durée > 5 ans).',
    expectedAction: 'Vérifier la traçabilité des OS notifiés par huissier ou recommandé et leur impact calendaire.',
    actorLetter: 'B',
  },
  {
    stepNumber: 15,
    title: '15. Foncier & Indemnisations du PAR (14 000 Oliviers)',
    targetUserUsername: 'mo.chef',
    targetUserLabel: 'Hichem Gharbi (B — Maître d\'ouvrage)',
    route: '/social/par',
    description: 'Suivi des 48 ménages touchés par l\'expropriation et barème d\'indemnisation des 14 000 oliviers (450 DT/arbre adulte) selon la norme ESS5 de la Banque Mondiale.',
    expectedAction: 'Consulter le registre des parcelles, le statut des chèques et les PV de Libération d\'Emprise (PVLE).',
    actorLetter: 'B',
  },
  {
    stepNumber: 16,
    title: '16. Cockpit Sous-Projet par Lot : 5 Acteurs, Deadlines & Citoyens',
    targetUserUsername: 'moe.chef',
    targetUserLabel: 'Walid Jaziri (D — Maîtrise d\'œuvre)',
    route: '/lots',
    description: 'Chaque lot routier est un sous-projet autonome : gestion des tâches avec deadlines contractuelles, double validation (Visa technique MOE puis approbation finale DGPC), documents des 5 acteurs (Excel métrés, DWG plans, PDF contrats, photos) et protection des droits des citoyens riverains.',
    expectedAction: 'Examiner le cockpit du Lot 01, tester la double validation contradictoire et télécharger un livrable technique scellé.',
    actorLetter: 'D',
  },
  {
    stepNumber: 17,
    title: '17. Sécurité Routière & SST : Audits ASR, Déviations & Dispositifs GS2/GS4',
    targetUserUsername: 'moe.hse',
    targetUserLabel: 'Saiefeddine (Expert en Sécurité Routière)',
    route: '/securite-routiere',
    description: 'Cockpit dédié conçu pour l\'expert Saiefeddine : audits ASR aux différentes phases (conception, travaux, pré-mise en service), homologation des déviations temporaires avec limitations à 50 km/h, contrôle de la rétro-réflexion Classe 2 (RL >= 150) et visites de terrain diurnes/nocturnes géolocalisées.',
    expectedAction: 'Consulter l\'audit ASR du Lot 1, examiner le plan de basculement de chaussée et tester la validation d\'un constat d\'inspection.',
    actorLetter: 'D',
  },
  {
    stepNumber: 18,
    title: '18. Matrice de Conformité Bailleurs : 10 Domaines Banque Mondiale (NES) vs BEI',
    targetUserUsername: 'ba.sp',
    targetUserLabel: 'Marc Dubois (A — Spécialiste Principal Bailleur)',
    route: '/bailleurs-conformite',
    description: 'Table comparative complète des 10 exigences contractuelles (E&S, riverains MGP, travail, santé publique, foncier 14 000 oliviers, pollution, biodiversité Sbeitla, climat Q100, vulnérabilité, passation). Revue interactive des pièces probantes avec empreintes SHA-256 et export d\'audit probant.',
    expectedAction: 'Examiner la matrice comparative BM/BEI, ouvrir une revue d\'exigence et exporter le manifeste officiel d\'audit JSON.',
    actorLetter: 'A',
  },
  {
    stepNumber: 19,
    title: '19. Bordereaux de Transmission (Transmittals) & Réception/DOE',
    targetUserUsername: 'mo.chef',
    targetUserLabel: 'Hichem Gharbi (B — Maître d\'ouvrage)',
    route: '/bordereaux-transmission',
    description: 'Bordereaux de transmission numériques figeant les révisions exactes des plans et pièces (codes normalisés TN-R2X2-...), enregistrement des accusés de réception et transmission du Dossier des Ouvrages Exécutés (DOE) récolé pour la DGPC.',
    expectedAction: 'Consulter le bordereau TR-0045, tester l\'accusé de réception et vérifier les pièces As-built du DOE.',
    actorLetter: 'B',
  },
  {
    stepNumber: 20,
    title: '20. Carte Chantier OSM & Pilotage Géographique (7 Couches)',
    targetUserUsername: 'moe.hse',
    targetUserLabel: 'Saiefeddine (Expert en Sécurité Routière)',
    route: '/carte-chantier',
    description: 'Section 15 v2.1 : Cockpit cartographique OpenStreetMap du tracé RN13 (PK 0 à 42) avec 7 couches (Accidents, Incidents HSE, Plaintes MGP, Avancement PK, Inspections, Audits ASR, Actions correctives), acquisition par GPS smartphone/EXIF et données privées protégées.',
    expectedAction: 'Filtrer les couches métier, cliquer sur un point kilométrique pour afficher sa fiche et simuler l\'enregistrement d\'un nouveau constat.',
    actorLetter: 'D',
  },
  {
    stepNumber: 21,
    title: '21. Réunions, Notes d\'Observations NO-000045 & Courriers',
    targetUserUsername: 'moe.chef',
    targetUserLabel: 'Walid Jaziri (D — Maîtrise d\'œuvre)',
    route: '/correspondance-reunions',
    description: 'Section 23 v2.1 : Registres probants contractuels comprenant les PV de réunions hebdomadaires avec décisions uniques tracées, notes d\'observations normalisées (TN-R2X2-L01-NO-000045) avec réponse obligatoire de l\'entreprise, courriers entrants/sortants et rapport mensuel 12-points à date de coupure.',
    expectedAction: 'Examiner le PV N° 24, répondre à une observation de chantier et consulter la synthèse du rapport mensuel officiel.',
    actorLetter: 'D',
  },
  {
    stepNumber: 22,
    title: '22. Budget Prévisionnel, Devis V1 (92.9k DT) & Modèle SaaS',
    targetUserUsername: 'mo.chef',
    targetUserLabel: 'Hichem Gharbi (B — Maître d\'ouvrage)',
    route: '/budget-chiffrage',
    description: 'Sections 18 à 20 v2.1 : Estimation analytique détaillée de 140 jours-personnes (budget cible 92 920 DT HT avec aléas 15%), grille tarifaire par poste (400 à 800 DT/j), scénarios Prototype vs V1 vs Socle Complet, offres de souscription SaaS et coûts d\'hébergement cloud Azure.',
    expectedAction: 'Examiner la décomposition des 140 j/h, tester le simulateur de marge commerciale et vérifier l\'enveloppe cloud Azure.',
    actorLetter: 'B',
  },
];

interface GuideContextType {
  isGuideActive: boolean;
  currentStepIndex: number;
  currentStep: GuideStep;
  startGuide: () => void;
  stopGuide: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const GuideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { switchUser } = useSession();
  const [isGuideActive, setIsGuideActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const currentStep = GUIDE_STEPS[currentStepIndex] || GUIDE_STEPS[0];

  const applyStep = (index: number) => {
    const step = GUIDE_STEPS[index];
    if (!step) return;

    setCurrentStepIndex(index);
    const targetUser = db.getUserByUsername(step.targetUserUsername);
    if (targetUser) {
      switchUser(targetUser);
    }
    window.location.hash = step.route;
    toast.info(`Étape ${step.stepNumber}/${GUIDE_STEPS.length} : ${step.title}`, {
      description: step.expectedAction,
      duration: 6000,
    });
  };

  const startGuide = () => {
    setIsGuideActive(true);
    applyStep(0);
  };

  const stopGuide = () => {
    setIsGuideActive(false);
    toast('Scénario de démonstration arrêté.');
  };

  const nextStep = () => {
    if (currentStepIndex < GUIDE_STEPS.length - 1) {
      applyStep(currentStepIndex + 1);
    } else {
      toast.success(`Félicitations ! Vous avez complété avec succès le parcours d'ingénierie routière en ${GUIDE_STEPS.length} étapes de GED-RN13 !`);
      setIsGuideActive(false);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      applyStep(currentStepIndex - 1);
    }
  };

  const goToStep = (index: number) => {
    applyStep(index);
  };

  return (
    <GuideContext.Provider
      value={{
        isGuideActive,
        currentStepIndex,
        currentStep,
        startGuide,
        stopGuide,
        nextStep,
        prevStep,
        goToStep,
      }}
    >
      {children}
    </GuideContext.Provider>
  );
};

export const useGuide = () => {
  const ctx = useContext(GuideContext);
  if (!ctx) throw new Error('useGuide must be used within GuideProvider');
  return ctx;
};
