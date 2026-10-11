import React, { createContext, useContext, useState, useEffect } from 'react';
import { DemoAlert } from '../types';
import { db } from '../mock/db';
import { useSession } from './sessionStore';
import { toast } from 'sonner';

interface NotificationsContextType {
  alerts: DemoAlert[];
  unreadCount: number;
  secondsUntilNextAlert: number;
  triggerAlertNow: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  isPaused: boolean;
  setIsPaused: (val: boolean) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useSession();
  const [alerts, setAlerts] = useState<DemoAlert[]>(() => db.alerts);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Interval en secondes (par défaut 600s = 10 min)
  const config = (window as any).__APP_CONFIG__ || {};
  const alertIntervalSec = Math.floor((config.ALERT_INTERVAL_MS || 600000) / 1000);

  const [secondsUntilNextAlert, setSecondsUntilNextAlert] = useState<number>(alertIntervalSec);

  // Alertes filtrées pour le rôle actif
  const roleAlerts = alerts.filter(
    (a) => !a.targetActors || a.targetActors.includes(currentUser.actor) || a.targetActors.includes('*' as any)
  );

  const unreadCount = roleAlerts.filter((a) => !a.isRead).length;

  const showToastForAlert = (alert: DemoAlert) => {
    const toastFn =
      alert.severity === 'critical'
        ? toast.error
        : alert.severity === 'warning'
        ? toast.warning
        : toast.info;

    toastFn(`${alert.title}`, {
      description: alert.message,
      duration: 8000,
      action: {
        label: 'Consulter',
        onClick: () => {
          markAsRead(alert.id);
          if (alert.linkRoute) {
            window.location.hash = alert.linkRoute;
          }
        },
      },
    });
  };

  const triggerAlertNow = () => {
    const newAlert = db.pushNextDemoAlert();
    if (newAlert) {
      setAlerts([...db.alerts]);
      showToastForAlert(newAlert);
      db.logAudit('Alerte poussée (Manuelle)', newAlert.id, newAlert.title, currentUser);
    }
    setSecondsUntilNextAlert(alertIntervalSec);
  };

  const markAsRead = (id: string) => {
    db.markAlertAsRead(id);
    setAlerts([...db.alerts]);
  };

  const markAllAsRead = () => {
    alerts.forEach((a) => db.markAlertAsRead(a.id));
    setAlerts([...db.alerts]);
    toast.success('Toutes les alertes ont été marquées comme lues.');
  };

  // Compte à rebours du moteur d'alertes
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setSecondsUntilNextAlert((prev) => {
        if (prev <= 1) {
          // Déclencher l'alerte
          const next = db.pushNextDemoAlert();
          if (next) {
            setAlerts([...db.alerts]);
            showToastForAlert(next);
            db.logAudit('Alerte poussée (Chrono 10 min)', next.id, next.title, currentUser);
          }
          return alertIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, alertIntervalSec, currentUser]);

  return (
    <NotificationsContext.Provider
      value={{
        alerts: roleAlerts,
        unreadCount,
        secondsUntilNextAlert,
        triggerAlertNow,
        markAsRead,
        markAllAsRead,
        isPaused,
        setIsPaused,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};
