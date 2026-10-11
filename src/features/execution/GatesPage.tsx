import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { SectionGate } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const GatesPage: React.FC = () => {
  const { currentUser } = useSession();
  const [gates, setGates] = useState<SectionGate[]>(() => db.gates);

  const canEdit = currentUser.actor === 'mo' || currentUser.actor === 'moe';

  const handleToggleGateCondition = (gateId: string, field: keyof SectionGate) => {
    if (!canEdit) {
      toast.error('Droits insuffisants : seuls le Maître d\'ouvrage (B) et la MOE (D) peuvent valider les conditions de démarrage.');
      return;
    }
    const target = gates.find((g) => g.id === gateId);
    if (!target) return;

    const newVal = !target[field];
    const updated = db.updateGate(gateId, { [field]: newVal }, currentUser);
    if (updated) {
      setGates([...db.gates]);
      toast.success(`Condition mise à jour pour ${updated.sectionTitle}`);
    }
  };

  const needContent: NeedPanelContent = {
    screenId: 'execution-gates',
    title: 'Conditions de Démarrage par Tronçon (Gates)',
    purpose: 'Ce tableau de contrôle vérifie que les 6 conditions préalables impératives sont réunies tronçon par tronçon avant tout engagement des travaux de terrassement ou de chaussée.',
    actors: [
      { letter: 'B', actorName: 'Maître d\'ouvrage', action: 'Délivre l\'attestation de libération d\'emprise (PAR soldé) et le constat d\'huissier.' },
      { letter: 'D', actorName: 'MOE', action: 'Vise bon pour exécution le PAQ, le PGES-E, le Plan de trafic (PGT) et le PPSPS.' },
      { letter: 'E', actorName: 'Entreprise', action: 'Consulte l\'autorisation avant de déplacer ses engins sur la section routière.' },
      { letter: 'A', actorName: 'Bailleur', action: 'Surveille le respect du principe « zéro expropriation non indemnisée avant travaux ».' },
    ],
    donorRequirement: 'Norme ESS5 de la Banque Mondiale : aucun travail physique ne peut débuter sur une parcelle tant que les personnes affectées n\'ont pas perçu l\'intégralité de leur indemnisation de remplacement.',
    seeAlso: [
      { label: 'Indemnisation des ménages (PAR)', href: '#/social/par' },
      { label: 'Plan d\'Assurance Qualité (PAQ)', href: '#/documents' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Conditions de Démarrage des Travaux (Gates)"
          subtitle="Contrôle des autorisations d'intervention par tronçon routier sur le Lot L01."
        />

        <div className="space-y-4">
          {gates.map((g) => (
            <Card
              key={g.id}
              className={`border transition-all shadow-2xs ${
                g.canStart
                  ? 'border-emerald-300 bg-emerald-50/15 dark:bg-emerald-950/15'
                  : 'border-rose-300 bg-rose-50/15 dark:bg-rose-950/15'
              }`}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-foreground">{g.sectionTitle}</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted font-semibold">
                        PK {g.pkRange}
                      </span>
                    </div>
                    {g.blockReason && (
                      <p className="text-xs font-semibold text-destructive mt-1 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{g.blockReason}</span>
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold shrink-0 ${
                      g.canStart
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {g.canStart ? '✓ Travaux Autorisés' : '🚫 Chantier Bloqué'}
                  </span>
                </div>

                {/* Grille des 6 conditions préalables */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {[
                    { key: 'parFree', label: '1. Emprise libérée (PAR soldé)', desc: 'Indemnités foncières versées', val: g.parFree },
                    { key: 'pgeseApproved', label: '2. PGES-Chantier approuvé', desc: 'Mesures environnementales validées', val: g.pgeseApproved },
                    { key: 'pgtApproved', label: '3. Plan de Gestion de Trafic', desc: 'Signalisation & déviations visées', val: g.pgtApproved },
                    { key: 'ppspsApproved', label: '4. PPSPS Sécurité validé', desc: 'Dispositif de sécurité approuvé', val: g.ppspsApproved },
                    { key: 'paqApproved', label: '5. Plan Assurance Qualité (PAQ)', desc: 'Laboratoire et fréquences d\'essais', val: g.paqApproved },
                    { key: 'huissierDone', label: '6. Constat d\'Huissier préalable', desc: 'État des lieux des riverains établi', val: g.huissierDone },
                  ].map((cond) => (
                    <div
                      key={cond.key}
                      onClick={() => handleToggleGateCondition(g.id, cond.key as any)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                        cond.val
                          ? 'border-emerald-200 bg-card hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
                          : 'border-rose-200 bg-card hover:bg-rose-50/50 dark:hover:bg-rose-950/30'
                      }`}
                      title={canEdit ? 'Cliquez pour basculer cette condition' : ''}
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-foreground text-[11px] truncate">{cond.label}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{cond.desc}</p>
                      </div>

                      {cond.val ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
