import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import {
  Home,
  CheckSquare,
  FolderTree,
  FileCheck2,
  Compass,
  FileSpreadsheet,
  HardHat,
  HeartHandshake,
  BarChart3,
  Settings,
  X,
  Layers,
  MapPin,
  AlertTriangle,
  FileText,
  Send,
  ShieldAlert,
  Award,
  Scale,
  Map,
  Mail,
  Calculator,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useSession();

  // Calcul du nombre de tâches en attente pour l'utilisateur
  const myPendingTasksCount = (() => {
    let count = 0;
    if (currentUser.actor === 'mo') {
      // Docs à publier + NO en cours + Décomptes à approuver
      count += db.documents.filter((d) => d.state === 'Shared').length;
      count += db.ipc.filter((i) => i.status === 'Certifie').length;
    } else if (currentUser.actor === 'moe') {
      // Docs à viser + NCR ouvertes + Décomptes à certifier
      count += db.documents.filter((d) => d.state === 'Shared').length;
      count += db.ipc.filter((i) => i.status === 'Soumis').length;
      count += db.ncr.filter((n) => n.status === 'Ouverte').length;
    } else if (currentUser.actor === 'amo') {
      // Avis à donner + complétude
      count += db.comments.filter((c) => c.status === 'ouvert').length;
    } else if (currentUser.actor === 'entreprise') {
      // Mes NCR ouvertes + documents à reprendre
      count += db.ncr.filter((n) => n.status === 'Ouverte').length;
      count += db.documents.filter((d) => d.state === 'WIP').length;
    } else if (currentUser.actor === 'bailleur') {
      // Demandes de NO en attente
      count += db.noRequests.filter((r) => r.status === 'NO_DEMANDEE').length;
    }
    return count;
  })();

  const activeStopsCount = (db.roadStops || []).filter((s) => s.state === 'ArreteBloque').length;

  const actor = currentUser.actor;
  const isAdmin = currentUser.subRole === 'admin';

  return (
    <>
      {/* Overlay sur mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-lg lg:shadow-none select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* En-tête Sidebar : Logo & Projet coordonné avec Topbar */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-sidebar-border bg-card/80 backdrop-blur-md">
          <NavLink to="/" onClick={() => onClose()} className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-black text-xs shadow-xs tracking-wider transition-transform group-hover:scale-105">
              RN13
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-foreground block group-hover:text-primary transition-colors">
                GED-RN13
              </span>
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Mise à 2×2 voies • 42 km
              </span>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation principale à défilement */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin text-xs">
          {/* Section 1 : Général & Cockpit */}
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Général & Cockpit
          </div>

          <NavLink
            to="/"
            end
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <Home className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400 group-hover:text-primary transition-colors" />
            <span className="truncate flex-1">Accueil & Tableau de bord</span>
          </NavLink>

          <NavLink
            to="/taches"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <CheckSquare className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 group-hover:text-amber-500 transition-colors" />
            <span className="truncate flex-1">Mes tâches</span>
            {myPendingTasksCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shrink-0 shadow-2xs">
                {myPendingTasksCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/lots"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <Layers className="h-4 w-4 shrink-0 text-primary group-hover:text-primary transition-colors" />
            <span className="truncate flex-1">Sous-Projets par Lot</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
              3 Lots
            </span>
          </NavLink>

          {/* Section 2 : Gestion Documentaire & Études */}
          <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Gestion Documentaire & Études
          </div>

          <NavLink
            to="/documents"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <FolderTree className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 transition-colors" />
            <span className="truncate flex-1">Plan & Documents</span>
          </NavLink>

          <NavLink
            to="/revues"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <FileCheck2 className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 transition-colors" />
            <span className="truncate flex-1">Revues & CRD</span>
          </NavLink>

          <NavLink
            to="/bordereaux-transmission"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <Send className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-500 transition-colors" />
            <span className="truncate flex-1">Bordereaux (Transmittals)</span>
          </NavLink>

          {actor !== 'entreprise' && (
            <NavLink
              to="/conception/dao"
              onClick={() => onClose()}
              className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
            >
              <Compass className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400 group-hover:text-teal-500 transition-colors" />
              <span className="truncate flex-1">Cockpit DAO & Conception</span>
            </NavLink>
          )}

          {actor !== 'entreprise' && (
            <NavLink
              to="/passation"
              onClick={() => onClose()}
              className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
            >
              <FileSpreadsheet className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-500 transition-colors" />
              <span className="truncate flex-1">Marchés & Passation</span>
            </NavLink>
          )}

          {/* Section 3 : Chantier, Sécurité & SIG */}
          <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Chantier, Sécurité & SIG
          </div>

          <NavLink
            to="/carte-chantier"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <Map className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 transition-colors" />
            <span className="truncate flex-1">Carte OSM & Tracé SIG</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
              7 Couches
            </span>
          </NavLink>

          <NavLink
            to="/correspondance-reunions"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <Mail className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400 group-hover:text-sky-500 transition-colors" />
            <span className="truncate flex-1">Réunions & Courriers</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shrink-0">
              NO-45
            </span>
          </NavLink>

          <NavLink
            to="/securite-routiere"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 group-hover:text-amber-500 transition-colors" />
            <span className="truncate flex-1">Sécurité Routière & SST</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
              ASR
            </span>
          </NavLink>

          <NavLink
            to="/execution/blocages"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 group-hover:text-rose-500 transition-colors" />
            <span className="truncate flex-1">Arrêts & Blocages (PK)</span>
            {activeStopsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shrink-0 animate-pulse shadow-2xs">
                {activeStopsCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/execution/os"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <FileText className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400 group-hover:text-sky-500 transition-colors" />
            <span className="truncate flex-1">Ordres de Service (OS)</span>
          </NavLink>

          <NavLink
            to="/execution/details"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <Layers className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400 group-hover:text-teal-500 transition-colors" />
            <span className="truncate flex-1">Détails Travaux & Couches</span>
          </NavLink>

          <NavLink
            to="/execution"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <HardHat className="h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400 group-hover:text-orange-500 transition-colors" />
            <span className="truncate flex-1">Hub Travaux & Démarrage</span>
          </NavLink>

          <NavLink
            to="/reception-doe"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <Award className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 transition-colors" />
            <span className="truncate flex-1">Réception & DOE</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
              DGPC
            </span>
          </NavLink>

          {/* Section 4 : Social & Environnement */}
          <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Social & Environnement
          </div>

          <NavLink
            to="/social/par"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 transition-colors" />
            <span className="truncate flex-1">Foncier & Indemnisations (PAR)</span>
          </NavLink>

          <NavLink
            to="/social"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <HeartHandshake className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 group-hover:text-rose-500 transition-colors" />
            <span className="truncate flex-1">Social, Plaintes & VBG</span>
          </NavLink>

          {/* Section 5 : Pilotage, Bailleurs & Finances */}
          <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Pilotage, Bailleurs & Finances
          </div>

          <NavLink
            to="/bailleurs-conformite"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <Scale className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 group-hover:text-blue-500 transition-colors" />
            <span className="truncate flex-1">Conformité Bailleurs</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
              BM/BEI
            </span>
          </NavLink>

          <NavLink
            to="/rapports"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <BarChart3 className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400 group-hover:text-purple-500 transition-colors" />
            <span className="truncate flex-1">Rapports d'état officiels</span>
          </NavLink>

          <NavLink
            to="/budget-chiffrage"
            onClick={() => onClose()}
            className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
          >
            <Calculator className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 group-hover:text-amber-500 transition-colors" />
            <span className="truncate flex-1">Budget & Devis (V1)</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
              92.9k DT
            </span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => onClose()}
              className={({ isActive }) => cn("sidebar-item group", isActive && "active")}
            >
              <Settings className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-foreground transition-colors" />
              <span className="truncate flex-1">Administration & Audit</span>
            </NavLink>
          )}
        </nav>

        {/* Pied de Sidebar : Rôle et profil de l'acteur actif */}
        <div className="p-3 border-t border-sidebar-border bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/40 border border-border/70 hover:bg-muted/70 transition-colors">
            <span
              className={cn(
                "h-8 w-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 select-none shadow-2xs",
                currentUser.actorLetter === 'A'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                  : currentUser.actorLetter === 'B'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                  : currentUser.actorLetter === 'C'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  : currentUser.actorLetter === 'D'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                  : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700'
              )}
            >
              {currentUser.actorLetter}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate leading-tight">
                {currentUser.fullName}
              </p>
              <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                {currentUser.subRoleLabel}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
