// Horloge simulée pour GED-RN13-V2
// Utilise DEMO_DATE ("2026-10-10T09:00:00") et avance avec le temps réel depuis le chargement

const config = (window as any).__APP_CONFIG__ || {};
const BASE_DEMO_DATE = config.DEMO_DATE ? new Date(config.DEMO_DATE).getTime() : new Date('2026-10-10T09:00:00').getTime();
const START_REAL_TIME = Date.now();

export const clock = {
  now(): Date {
    const elapsed = Date.now() - START_REAL_TIME;
    return new Date(BASE_DEMO_DATE + elapsed);
  },
  
  toISOString(): string {
    return this.now().toISOString();
  },

  formatDemoDate(): string {
    const d = this.now();
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};
