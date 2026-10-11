import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  taches: 'Mes tâches',
  documents: 'Documents',
  new: 'Nouveau document',
  revues: 'Revues & CRD',
  crd: 'Registre des commentaires',
  'non-objection': 'Non-objection du bailleur',
  conception: 'Conception',
  dao: 'Cockpit DAO',
  passation: 'Passation des marchés',
  execution: 'Exécution des travaux',
  demarrage: 'Conditions de démarrage (Gates)',
  qualite: 'Qualité & NCR',
  incidents: 'HSE & Incidents',
  decomptes: 'Décomptes mensuels (IPC)',
  social: 'Social & E&S',
  par: 'Plan d\'Action de Réinstallation (PAR)',
  plaintes: 'Plaintes citoyennes (MGP)',
  vbg: 'Module VBG (Restreint)',
  rapports: 'Rapports d\'état officiels',
  admin: 'Administration',
  audit: 'Journal d\'audit',
  profil: 'Mon profil',
  notifications: 'Notifications',
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground py-2 px-1 mb-2 select-none overflow-x-auto">
      <Link to="/" className="hover:text-primary flex items-center gap-1">
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Accueil</span>
      </Link>

      {segments.map((seg, idx) => {
        const path = `/${segments.slice(0, idx + 1).join('/')}`;
        const isLast = idx === segments.length - 1;
        const label = ROUTE_LABELS[seg] || seg;

        return (
          <React.Fragment key={path}>
            <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-foreground truncate max-w-[180px] sm:max-w-none">
                {label}
              </span>
            ) : (
              <Link to={path} className="hover:text-primary truncate max-w-[140px] sm:max-w-none">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
