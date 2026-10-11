import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { useTheme } from '@/store/themeContext';
import { useLang } from '@/store/langContext';
import { useNotifications } from '@/store/notificationsStore';
import { useGuide } from '@/store/guideStore';
import { RoleSwitcher } from '@/components/shared/RoleSwitcher';
import { ActorChip } from '@/components/shared/ActorChip';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Sun,
  Moon,
  Languages,
  Search,
  HelpCircle,
  Menu,
  Clock,
  LogOut,
  Sparkles,
  ChevronDown,
  Info,
  Layers,
} from 'lucide-react';
import { ProjectPresentationModal } from '@/components/shared/ProjectPresentationModal';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface TopbarProps {
  onToggleSidebar: () => void;
  selectedLot: string;
  onSelectLot: (lot: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, selectedLot, onSelectLot }) => {
  const { currentUser, logout } = useSession();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLang();
  const { unreadCount, alerts, secondsUntilNextAlert, markAsRead, markAllAsRead, triggerAlertNow } = useNotifications();
  const { startGuide } = useGuide();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const minutes = Math.floor(secondsUntilNextAlert / 60);
  const seconds = secondsUntilNextAlert % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/95 px-4 sm:px-6 backdrop-blur-md shadow-2xs">
      {/* Partie Gauche : Logo mobile & Sélecteur de Lot */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSidebar}
          className="lg:hidden text-foreground"
          title="Afficher/masquer le menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Sélecteur de lot global */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">Périmètre :</span>
          <select
            value={selectedLot}
            onChange={(e) => onSelectLot(e.target.value)}
            className="h-8 rounded-md border border-input bg-card px-2.5 py-1 text-xs font-bold text-foreground shadow-2xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            title="Filtrer l'application par lot routier"
          >
            <option value="all">Tous les lots (PK 0+000 à 42+000)</option>
            <option value="L01">Lot 01 — PK 0+000 à 14+000 (Exécution)</option>
            <option value="L02">Lot 02 — PK 14+000 à 28+000 (Passation)</option>
            <option value="L03">Lot 03 — PK 28+000 à 42+000 (Conception DAO)</option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/lots')}
            className="h-8 text-xs font-semibold text-primary hover:bg-primary/10 gap-1 hidden sm:flex cursor-pointer"
            title="Ouvrir le Cockpit des Sous-Projets par Lot"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Sous-Projets</span>
          </Button>
        </div>

        {/* Barre de recherche globale rapide */}
        <form onSubmit={handleSearch} className="hidden xl:flex items-center relative ml-2">
          <Search className="h-3.5 w-3.5 absolute left-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher code, CCTP, PK, entreprise... [/]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-64 rounded-md border border-input bg-muted/40 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </form>
      </div>

      {/* Partie Droite : Rôle démo, Alertes, Préférences, Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Bouton Présentation Projet & Besoins */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsProjectModalOpen(true)}
          className="hidden lg:flex items-center gap-1.5 text-xs font-bold bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 shadow-2xs h-8 cursor-pointer"
          title="Découvrir le projet routier RN13, les 5 acteurs et le besoin métier"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          <span>Besoins du Projet</span>
        </Button>

        {/* Sélecteur « Voir en tant que… » (V2 Core Feature) */}
        <RoleSwitcher />

        {/* Compte à rebours Prochaine alerte démo */}
        <div
          onClick={triggerAlertNow}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 font-medium cursor-pointer hover:bg-amber-100 transition-colors"
          title="Cliquez pour simuler une alerte instantanément"
        >
          <Clock className="h-3 w-3 text-amber-600 animate-pulse" />
          <span>Alerte dans</span>
          <span className="font-mono font-bold">{timeFormatted}</span>
        </div>

        {/* Centre de Notifications avec cloche et badge */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative text-foreground hover:bg-muted"
              title="Centre de notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 sm:w-96 p-2 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-primary" />
                <span className="font-bold text-xs text-foreground">Notifications & Alertes</span>
              </div>
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-primary hover:underline cursor-pointer"
              >
                Tout marquer lu
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-border/60 my-1">
              {alerts.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-6">
                  Aucune alerte pour votre profil.
                </p>
              ) : (
                alerts.slice(0, 6).map((al) => (
                  <div
                    key={al.id}
                    onClick={() => {
                      markAsRead(al.id);
                      if (al.linkRoute) navigate(al.linkRoute);
                    }}
                    className={cn(
                      "p-2.5 text-xs transition-colors cursor-pointer hover:bg-muted/60 rounded-sm my-0.5",
                      !al.isRead && "bg-primary/5 font-medium border-l-2 border-primary"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-foreground truncate">{al.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {al.hasCountdown ? '48h' : 'Récent'}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                      {al.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={triggerAlertNow}
                className="text-xs h-7 text-amber-700 dark:text-amber-400 gap-1"
              >
                <Sparkles className="h-3 w-3" />
                Simuler une alerte
              </Button>
              <Link to="/notifications" className="text-xs text-primary font-semibold hover:underline">
                Voir toutes ({alerts.length})
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mode Sombre / Clair */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          className="text-foreground hover:bg-muted"
          title={`Basculer en mode ${theme === 'dark' ? 'clair' : 'sombre'}`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Bascule Langue (FR / AR RTL) */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleLang}
          className="text-foreground hover:bg-muted font-bold text-xs"
          title="Basculer Français / Arabe RTL"
        >
          {lang === 'fr' ? 'AR' : 'FR'}
        </Button>

        {/* Bouton Guide de Démo */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={startGuide}
          className="text-primary hover:bg-primary/10"
          title="Lancer le guide de démonstration interactif"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>

        {/* Menu Profil Avatar Utilisateur */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-1 rounded-full hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer">
              <ActorChip
                actorLetter={currentUser.actorLetter}
                name={currentUser.fullName}
                size="md"
                showName={false}
              />
              <ChevronDown className="h-3 w-3 opacity-60 hidden sm:inline" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 p-2 shadow-xl">
            <div className="px-2 py-1.5 border-b border-border mb-1">
              <p className="font-bold text-xs text-foreground truncate">{currentUser.fullName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                {currentUser.subRoleLabel}
              </span>
            </div>

            <DropdownMenuItem onClick={() => navigate('/profil')} className="text-xs cursor-pointer">
              Mon profil & permissions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsProjectModalOpen(true)} className="text-xs cursor-pointer text-primary font-bold">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              Présentation & Besoins Projet
            </DropdownMenuItem>
            <DropdownMenuItem onClick={startGuide} className="text-xs cursor-pointer text-foreground font-medium">
              Guide de démonstration (16 étapes)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={triggerAlertNow} className="text-xs cursor-pointer text-amber-700">
              Simuler une alerte démo
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={logout} className="text-xs cursor-pointer text-destructive font-semibold">
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProjectPresentationModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </header>
  );
};
