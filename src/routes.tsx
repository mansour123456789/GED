import React from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';

// Auth
import { LoginPage } from '@/features/auth/LoginPage';
import { ProfilePage } from '@/features/auth/ProfilePage';

// Accueil & Tâches
import { DashboardPage } from '@/features/home/DashboardPage';
import { TasksPage } from '@/features/tasks/TasksPage';

// Documents
import { DocumentsListPage } from '@/features/documents/DocumentsListPage';
import { DocumentNewPage } from '@/features/documents/DocumentNewPage';
import { DocumentDetailPage } from '@/features/documents/DocumentDetailPage';

// Revues, CRD, Visa & Non-Objection
import { ReviewSplitPage } from '@/features/review/ReviewSplitPage';
import { CrdRegisterPage } from '@/features/review/CrdRegisterPage';
import { NonObjectionPage } from '@/features/review/NonObjectionPage';

// Conception DAO & Marchés
import { DaoCockpitPage } from '@/features/conception/DaoCockpitPage';
import { ProcurementPage } from '@/features/passation/ProcurementPage';

// Exécution & Chantier
import { ExecutionDashboardPage } from '@/features/execution/ExecutionDashboardPage';
import { GatesPage } from '@/features/execution/GatesPage';
import { QualityNcrPage } from '@/features/execution/QualityNcrPage';
import { IncidentsHsePage } from '@/features/execution/IncidentsHsePage';
import { DecomptesPage } from '@/features/execution/DecomptesPage';
import { ChantierBlocagesPage } from '@/features/execution/ChantierBlocagesPage';
import { OrdresServicePage } from '@/features/execution/OrdresServicePage';
import { DetailsChantierPage } from '@/features/execution/DetailsChantierPage';
import { LotsManagementPage } from '@/features/lots/LotsManagementPage';
import { SecuriteRoutierePage } from '@/features/safety/SecuriteRoutierePage';
import { BailleursMatrixPage } from '@/features/donors/BailleursMatrixPage';
import { TransmittalsPage } from '@/features/transmittals/TransmittalsPage';
import { ReceptionDoePage } from '@/features/execution/ReceptionDoePage';

// V2.1 Nouvelles fonctionnalités (Section 15, 23 & 18-20)
import { CarteChantierOsmPage } from '@/features/map/CarteChantierOsmPage';
import { CorrespondanceReunionsPage } from '@/features/correspondence/CorrespondanceReunionsPage';
import { BudgetDevisPage } from '@/features/budget/BudgetDevisPage';

// Social, PAR & Plaintes
import { SocialDashboardPage } from '@/features/social/SocialDashboardPage';
import { ParPage } from '@/features/social/ParPage';
import { PlaintesPage } from '@/features/social/PlaintesPage';
import { VbgPage } from '@/features/social/VbgPage';

// Rapports consolidés
import { ReportsPage } from '@/features/reports/ReportsPage';
import { ReportDetailPage } from '@/features/reports/ReportDetailPage';

// Administration & Audit
import { UsersListPage } from '@/features/admin/UsersListPage';
import { AuditTrailPage } from '@/features/admin/AuditTrailPage';

// Alertes & Recherche
import { NotificationsPage } from '@/features/alerts/NotificationsPage';
import { GlobalSearchPage } from '@/features/search/GlobalSearchPage';

// Fallback
import { NotFoundPage } from '@/features/common/NotFoundPage';

export const router = createHashRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'taches',
        element: <TasksPage />,
      },
      // Sous-projets par Lot & Multi-Lots
      {
        path: 'lots',
        element: <LotsManagementPage />,
      },
      {
        path: 'sous-projets',
        element: <LotsManagementPage />,
      },
      {
        path: 'projets-lots',
        element: <LotsManagementPage />,
      },
      // Documents
      {
        path: 'documents',
        element: <DocumentsListPage />,
      },
      {
        path: 'documents/new',
        element: <DocumentNewPage />,
      },
      {
        path: 'documents/nouveau',
        element: <DocumentNewPage />,
      },
      {
        path: 'documents/:id',
        element: <DocumentDetailPage />,
      },
      // Bordereaux de transmission (Transmittals)
      {
        path: 'documents/bordereaux',
        element: <TransmittalsPage />,
      },
      {
        path: 'bordereaux-transmission',
        element: <TransmittalsPage />,
      },
      {
        path: 'transmittals',
        element: <TransmittalsPage />,
      },
      // Revues
      {
        path: 'revues',
        element: <CrdRegisterPage />,
      },
      {
        path: 'revues/crd',
        element: <CrdRegisterPage />,
      },
      {
        path: 'revues/non-objection',
        element: <NonObjectionPage />,
      },
      {
        path: 'revues/:id',
        element: <ReviewSplitPage />,
      },
      // Conception & Passation
      {
        path: 'conception/dao',
        element: <DaoCockpitPage />,
      },
      {
        path: 'passation',
        element: <ProcurementPage />,
      },
      // Exécution & Travaux
      {
        path: 'execution',
        element: <ExecutionDashboardPage />,
      },
      {
        path: 'execution/blocages',
        element: <ChantierBlocagesPage />,
      },
      {
        path: 'execution/arrets',
        element: <ChantierBlocagesPage />,
      },
      {
        path: 'execution/os',
        element: <OrdresServicePage />,
      },
      {
        path: 'execution/ordres-service',
        element: <OrdresServicePage />,
      },
      {
        path: 'execution/details',
        element: <DetailsChantierPage />,
      },
      {
        path: 'execution/corps-etat',
        element: <DetailsChantierPage />,
      },
      {
        path: 'execution/jalons',
        element: <GatesPage />,
      },
      {
        path: 'execution/demarrage',
        element: <GatesPage />,
      },
      {
        path: 'execution/qualite',
        element: <QualityNcrPage />,
      },
      {
        path: 'execution/incidents',
        element: <IncidentsHsePage />,
      },
      {
        path: 'execution/decomptes',
        element: <DecomptesPage />,
      },
      // Sécurité Routière & SST (Module 7 Saiefeddine)
      {
        path: 'securite-routiere',
        element: <SecuriteRoutierePage />,
      },
      {
        path: 'sst-securite',
        element: <SecuriteRoutierePage />,
      },
      // Réception & DOE (Module 12)
      {
        path: 'reception-doe',
        element: <ReceptionDoePage />,
      },
      {
        path: 'execution/reception-doe',
        element: <ReceptionDoePage />,
      },
      // Carte Chantier OSM (Section 15 - Version 2.1)
      {
        path: 'carte-chantier',
        element: <CarteChantierOsmPage />,
      },
      {
        path: 'carte-osm',
        element: <CarteChantierOsmPage />,
      },
      {
        path: 'sig',
        element: <CarteChantierOsmPage />,
      },
      // Réunions, Notes d'Observations & Correspondance (Section 23)
      {
        path: 'correspondance-reunions',
        element: <CorrespondanceReunionsPage />,
      },
      {
        path: 'reunions-pv',
        element: <CorrespondanceReunionsPage />,
      },
      {
        path: 'notes-observations',
        element: <CorrespondanceReunionsPage />,
      },
      {
        path: 'courriers',
        element: <CorrespondanceReunionsPage />,
      },
      // Budget & Chiffrage v2.1 (Sections 18-20)
      {
        path: 'budget-chiffrage',
        element: <BudgetDevisPage />,
      },
      {
        path: 'budget-devis',
        element: <BudgetDevisPage />,
      },
      {
        path: 'devis-previsionnel',
        element: <BudgetDevisPage />,
      },
      // Conformité Bailleurs BM / BEI (Section 7)
      {
        path: 'bailleurs',
        element: <BailleursMatrixPage />,
      },
      {
        path: 'bailleurs-conformite',
        element: <BailleursMatrixPage />,
      },
      {
        path: 'bailleurs/conformite',
        element: <BailleursMatrixPage />,
      },
      // Social & E&S
      {
        path: 'social',
        element: <SocialDashboardPage />,
      },
      {
        path: 'social/par',
        element: <ParPage />,
      },
      {
        path: 'foncier',
        element: <ParPage />,
      },
      {
        path: 'social/plaintes',
        element: <PlaintesPage />,
      },
      {
        path: 'social/vbg',
        element: <VbgPage />,
      },
      // Rapports
      {
        path: 'rapports',
        element: <ReportsPage />,
      },
      {
        path: 'rapports/:id',
        element: <ReportDetailPage />,
      },
      // Administration
      {
        path: 'admin',
        element: <UsersListPage />,
      },
      {
        path: 'admin/utilisateurs',
        element: <UsersListPage />,
      },
      {
        path: 'admin/audit',
        element: <AuditTrailPage />,
      },
      // Alertes & Recherche & Profil
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'profil',
        element: <ProfilePage />,
      },
      {
        path: 'recherche',
        element: <GlobalSearchPage />,
      },
      // 404
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
