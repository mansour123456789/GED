// Utilitaires de formatage pour GED-RN13-V2

export function formatAmount(val: number): string {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    maximumFractionDigits: 0,
  }).format(val).replace('TND', '').trim() + ' TND';
}

export function formatDate(isoStr?: string): string {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoStr;
  }
}

export function formatDateTime(isoStr?: string): string {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function getDueStatus(dueDateStr?: string): {
  label: string;
  isLate: boolean;
  colorClass: string;
} {
  if (!dueDateStr) return { label: 'Aucune échéance', isLate: false, colorClass: 'text-muted-foreground' };
  
  const now = new Date('2026-10-10T09:00:00').getTime();
  const target = new Date(dueDateStr).getTime();
  const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `+${Math.abs(diffDays)} j (En retard)`,
      isLate: true,
      colorClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400',
    };
  }
  if (diffDays === 0) {
    return {
      label: "Aujourd'hui",
      isLate: false,
      colorClass: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300',
    };
  }
  if (diffDays <= 3) {
    return {
      label: `J-${diffDays}`,
      isLate: false,
      colorClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
    };
  }
  return {
    label: `${diffDays} jours`,
    isLate: false,
    colorClass: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  };
}
