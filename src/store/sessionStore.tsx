import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../mock/db';
import { toast } from 'sonner';

interface SessionContextType {
  currentUser: User;
  isAuthenticated: boolean;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  switchUser: (targetUser: User | string) => void;
  failedAttempts: number;
  isLocked: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_KEY = 'gedrn13_session_user';

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Par défaut, connecter Karim Ben Salah (Admin) ou Hichem Gharbi (Chef de projet)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      const savedId = sessionStorage.getItem(SESSION_KEY);
      if (savedId) {
        const found = db.getUserById(savedId);
        if (found) return found;
      }
    }
    // Par défaut Hichem Gharbi (Chef MO) ou Karim Ben Salah (Admin)
    return db.users.find((u) => u.username === 'mo.chef') || db.users[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem(SESSION_KEY, currentUser.id);
    }
  }, [currentUser]);

  const login = (username: string, pass: string): boolean => {
    if (isLocked) {
      toast.error('Compte temporairement verrouillé suite à 5 tentatives erronées. Réessayez dans 15 minutes.');
      return false;
    }

    const expectedPass = username === 'admin' ? 'Admin#2026' : 'Demo#2026';
    const found = db.getUserByUsername(username);

    if (found && pass === expectedPass) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      setFailedAttempts(0);
      db.logAudit('Connexion utilisateur', found.username, `Connexion réussie sous le rôle ${found.subRoleLabel}`, found);
      toast.success(`Bienvenue, ${found.fullName} (${found.actorLabel})`);
      return true;
    }

    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    db.logAudit('Échec de connexion', username, `Tentative ${nextAttempts}/5 échouée`, null);

    if (nextAttempts >= 5) {
      setIsLocked(true);
      toast.error('Sécurité : 5 échecs consécutifs. Compte verrouillé pendant 15 minutes.');
    } else {
      toast.error(`Identifiants incorrects. (${5 - nextAttempts} tentatives restantes)`);
    }

    return false;
  };

  const logout = () => {
    db.logAudit('Déconnexion', currentUser.username, 'Déconnexion volontaire', currentUser);
    setIsAuthenticated(false);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const switchUser = (targetUser: User | string) => {
    let userObj: User | undefined;
    if (typeof targetUser === 'string') {
      userObj = db.getUserById(targetUser) || db.getUserByUsername(targetUser);
    } else {
      userObj = targetUser;
    }
    if (!userObj) return;

    setCurrentUser(userObj);
    setIsAuthenticated(true);
    db.logAudit('Bascule de rôle (Voir en tant que)', userObj.username, `Utilisateur actif modifié pour ${userObj.fullName} (${userObj.actorLetter} — ${userObj.actorLabel})`, userObj);
    toast.info(`Vous voyez maintenant l'application comme ${userObj.fullName} (${userObj.actorLetter} — ${userObj.actorLabel})`, {
      duration: 4000,
    });
  };

  return (
    <SessionContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        switchUser,
        failedAttempts,
        isLocked,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export function useSession(): SessionContextType {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return ctx;
}
