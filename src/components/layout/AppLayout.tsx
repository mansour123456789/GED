import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DemoBanner } from '@/components/shared/DemoBanner';
import { GuideModal } from '@/components/shared/GuideModal';
import { useSession } from '@/store/sessionStore';
import { Toaster } from 'sonner';

export const AppLayout: React.FC = () => {
  const { isAuthenticated } = useSession();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState('all');

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Toaster position="top-right" richColors closeButton expand={false} />

      {/* Guide de Démo Coachmark Modal */}
      <GuideModal />

      {/* Barre latérale (Sidebar) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Zone Principale */}
      <div className="flex flex-1 flex-col transition-all duration-200 lg:pl-72 min-w-0">
        {/* Topbar supérieure */}
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          selectedLot={selectedLot}
          onSelectLot={setSelectedLot}
        />

        {/* Contenu principal de la page */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1500px] w-full mx-auto animate-fade-in">
          <Outlet context={{ selectedLot }} />
        </main>

        {/* Bandeau de démonstration inférieur */}
        <DemoBanner />
      </div>
    </div>
  );
};
