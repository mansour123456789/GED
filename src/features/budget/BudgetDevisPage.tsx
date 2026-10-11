import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { db } from '@/mock/db';
import { DevisPoste, DevisScenario, OffreCommerciale } from '@/types';
import {
  Calculator,
  Coins,
  Calendar,
  Layers,
  Server,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Briefcase,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export const BudgetDevisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chiffrageV1');

  // Données depuis db
  const postesV1: DevisPoste[] = db.budgetPostes;
  const scenarios: DevisScenario[] = db.budgetScenarios;
  const offres: OffreCommerciale[] = db.commercialOffers;

  // Calculs totaux
  const totalJours = postesV1.reduce((sum, p) => sum + p.chargeJoursPersonnes, 0);
  const sousTotalHt = postesV1.reduce((sum, p) => sum + p.montantTnd, 0);
  const provisionAleaHt = Math.round(sousTotalHt * 0.15);
  const budgetCibleHt = sousTotalHt + provisionAleaHt;

  // Simulateur de marge commerciale
  const [coutDirectMensuel, setCoutDirectMensuel] = useState(1000);
  const [margeCiblePct, setMargeCiblePct] = useState(60);
  const prixVenteSuggere = Math.round(coutDirectMensuel / (1 - margeCiblePct / 100));

  const needContent: NeedPanelContent = {
    title: 'Sections 18 à 20 : Devis prévisionnel & Modèle d\'exploitation (Tunisie)',
    purpose:
      "Estimation analytique du développement et exploitation cloud Azure de la plateforme GED-RN13 pour une équipe intervenant en Tunisie (DT HT, base octobre 2026). Ce chiffrage formalise la charge V1 (140 j/h, budget cible 92 920 DT HT), les jalons de livraison et les offres de souscription SaaS.",
    actors: [
      { letter: 'B', actorName: 'Maître d\'Ouvrage (DGPC)', action: 'Validation de l\'enveloppe budgétaire et de la propriété exclusive du code' },
      { letter: 'D', actorName: 'Mission de Contrôle (SCET)', action: 'Expression des besoins pour les modules qualité et visas probants' },
      { letter: 'C', actorName: 'Expert Sécurité (Saiefeddine)', action: 'Supervision de la conception métier et des fonctionnalités cartographiques ASR' },
      { letter: 'E', actorName: 'Entreprises & Sous-traitants', action: 'Utilisation terrain sans coût de licence par siège pour les PME' },
    ],
    donorRequirement:
      'Directives de passation Banque Mondiale & BEI (Guide 2024) : Transparence des coûts de mise en œuvre, absence de frais cachés et soutenabilité financière de l\'exploitation locale.',
    seeAlso: [
      { label: 'Sous-Projets par Lot', href: '/lots' },
      { label: 'Matrice de Conformité Bailleurs', href: '/bailleurs-conformite' },
      { label: 'Rapports d\'état officiels', href: '/rapports' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Budget Prévisionnel, Chiffrage V1 & Modèle d'Exploitation"
          subtitle="Document de conception v2.1 (11 octobre 2026) : Estimation détaillée de 140 jours-personnes (92 920 DT HT cible), grille tarifaire et modélisation SaaS."
          actions={
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-primary text-primary-foreground"
              onClick={() => {
                toast.success('Export du devis estimatif au format structuré généré');
              }}
            >
              <Download className="h-3.5 w-3.5" />
              Télécharger le Devis Prévisionnel
            </Button>
          }
        />

        {/* 3 Cartes KPI Clés Synthèse */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-border bg-card shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Charge Totale V1 Initiale
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-foreground">{totalJours}</span>
                  <span className="text-xs font-bold text-muted-foreground">jours-personnes</span>
                </div>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Équipe : 2 dévs + 1 architecte/DevOps + 1 testeur
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Calculator className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Budget Cible V1 (avec Aléas 15%)
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-primary">
                    {budgetCibleHt.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">DT HT</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  Dont 12 120 DT de provision pour aléas
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                <Coins className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Délai Calendaire Estimé
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-foreground">4 à 5</span>
                  <span className="text-xs font-bold text-muted-foreground">mois (20 semaines)</span>
                </div>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Jalon pilote & recette usine en S16-S20
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Système d'onglets pour le chiffrage et l'exploitation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full bg-muted/50 p-1 rounded-lg border border-border">
            <TabsTrigger value="chiffrageV1" className="text-xs font-semibold gap-1.5">
              <Coins className="h-3.5 w-3.5" />
              Chiffrage Détaillé V1 (Section 18.3)
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="text-xs font-semibold gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Scénarios & Périmètres (Prototype vs Socle)
            </TabsTrigger>
            <TabsTrigger value="modeleCommercial" className="text-xs font-semibold gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Modèle Commercial & Cloud Azure
            </TabsTrigger>
          </TabsList>

          {/* ===================== ONGLET 1 : CHIFFRAGE DÉTAILLÉ V1 ===================== */}
          <TabsContent value="chiffrageV1" className="space-y-4 pt-3">
            <Card className="border border-border shadow-xs bg-card">
              <CardHeader className="p-4 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold">
                      Décomposition par Poste de Travail - V1 Initiale
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Charge en jours-personnes cumulée basée sur un barème journalier de négociation (400 à 800 DT/j HT)
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    Base Octobre 2026
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">Poste & Descriptif</th>
                      <th className="py-2.5 px-3 text-center">Charge (j/p)</th>
                      <th className="py-2.5 px-3 text-right">Tarif Journalier</th>
                      <th className="py-2.5 px-3 text-right">Montant HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {postesV1.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-foreground block">{p.poste}</span>
                          <span className="text-[11px] text-muted-foreground leading-normal block mt-0.5">
                            {p.description}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-foreground">
                          {p.chargeJoursPersonnes} j
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                          {p.tarifUnitaireTnd} DT/j
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-foreground">
                          {p.montantTnd.toLocaleString()} DT
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30 border-t-2 border-border font-bold">
                    <tr>
                      <td className="py-2 px-3 text-foreground">Sous-total (Charge cumulée)</td>
                      <td className="py-2 px-3 text-center font-mono text-foreground">{totalJours} j</td>
                      <td className="py-2 px-3 text-right text-muted-foreground">-</td>
                      <td className="py-2 px-3 text-right font-mono text-foreground">
                        {sousTotalHt.toLocaleString()} DT HT
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-amber-700 dark:text-amber-300">
                        Provision pour aléas techniques et contractuels (15 %)
                      </td>
                      <td className="py-2 px-3 text-center">-</td>
                      <td className="py-2 px-3 text-right text-muted-foreground">-</td>
                      <td className="py-2 px-3 text-right font-mono text-amber-700 dark:text-amber-300">
                        {provisionAleaHt.toLocaleString()} DT HT
                      </td>
                    </tr>
                    <tr className="text-sm bg-primary/5 text-primary">
                      <td className="py-3 px-3 font-black">BUDGET CIBLE GLOBAL V1 INITIALE</td>
                      <td className="py-3 px-3 text-center font-mono font-black">{totalJours} j/p</td>
                      <td className="py-3 px-3 text-right">-</td>
                      <td className="py-3 px-3 text-right font-mono font-black text-base">
                        {budgetCibleHt.toLocaleString()} DT HT
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>

            {/* Jalons de développement S1 à S20 */}
            <Card className="border border-border shadow-xs bg-card">
              <CardHeader className="p-4 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Jalons de Livraison Calendaire (Semaines 1 à 20)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
                    <span className="font-mono text-[10px] font-extrabold text-primary">
                      Semaines 1 – 3
                    </span>
                    <h5 className="font-bold text-foreground">Cadrage & Architecture</h5>
                    <p className="text-[11px] text-muted-foreground">
                      Règles métier, circuits de visas, maquettes UI et modélisation de base PostGIS.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
                    <span className="font-mono text-[10px] font-extrabold text-primary">
                      Semaines 4 – 10
                    </span>
                    <h5 className="font-bold text-foreground">Socle GED & Versions</h5>
                    <p className="text-[11px] text-muted-foreground">
                      Authentification OIDC, référentiel projet, versions figées et chiffrement SHA-256.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
                    <span className="font-mono text-[10px] font-extrabold text-primary">
                      Semaines 8 – 15
                    </span>
                    <h5 className="font-bold text-foreground">Visas & Transmissions</h5>
                    <p className="text-[11px] text-muted-foreground">
                      Bordereaux de transmission, registre CRD, recherche sourcée et dashboard KPI.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
                    <span className="font-mono text-[10px] font-extrabold text-emerald-600">
                      Semaines 16 – 20
                    </span>
                    <h5 className="font-bold text-foreground">Recette & Pilote</h5>
                    <p className="text-[11px] text-muted-foreground">
                      14 critères de recette, tests de restauration des sauvegardes, formation et mise en production.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===================== ONGLET 2 : SCÉNARIOS & PÉRIMÈTRES ===================== */}
          <TabsContent value="scenarios" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarios.map((sc) => (
                <Card key={sc.version} className="border border-border shadow-xs bg-card flex flex-col justify-between">
                  <CardHeader className="p-4 border-b border-border bg-muted/20">
                    <Badge variant="outline" className="w-fit text-[10px] font-mono mb-1">
                      {sc.version.replace('_', ' ')}
                    </Badge>
                    <CardTitle className="text-sm font-bold text-foreground">{sc.titre}</CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Délai : {sc.delaiEstime}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4 text-xs flex-1 flex flex-col justify-between">
                    <p className="text-muted-foreground leading-relaxed">{sc.perimetre}</p>

                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                        Fourchette Budgétaire HT
                      </span>
                      <span className="text-lg font-black text-primary block mt-0.5">
                        {sc.budgetMinTnd.toLocaleString()} à {sc.budgetMaxTnd.toLocaleString()} DT
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Avertissement contractuel issu de la version 2.1 :</p>
                <p className="text-[11px] mt-0.5">
                  La carte de base est comprise dans la plateforme complète du socle. Les fonctions intelligentes avancées (analyse d'images par IA, transcription voix en dialecte) doivent être estimées comme des écarts au backlog sans double comptage, et ne font pas partie des garanties de la V1 initiale.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ===================== ONGLET 3 : MODÈLE COMMERCIAL & AZURE ===================== */}
          <TabsContent value="modeleCommercial" className="space-y-4 pt-3">
            {/* 3 Offres de souscription */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {offres.map((off) => (
                <Card key={off.offre} className="border border-border shadow-xs bg-card flex flex-col justify-between">
                  <CardHeader className="p-4 border-b border-border bg-muted/20">
                    <Badge className="w-fit text-[10px] font-bold bg-primary text-primary-foreground mb-1">
                      Offre {off.offre}
                    </Badge>
                    <CardTitle className="text-sm font-bold text-foreground">
                      {off.lotsCount} • {off.usersCount} utilisateurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4 text-xs flex-1 flex flex-col justify-between">
                    <p className="text-muted-foreground leading-relaxed">{off.perimetre}</p>

                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-[11px]">Frais de Setup :</span>
                        <span className="font-bold text-foreground">
                          {off.setupMinTnd.toLocaleString()} à {off.setupMaxTnd.toLocaleString()} DT
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-[11px]">Abonnement Mensuel :</span>
                        <span className="font-black text-primary text-sm">
                          {off.abonnementMinTnd.toLocaleString()} à {off.abonnementMaxTnd.toLocaleString()} DT/mois
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Simulateur de Marge & Coûts d'Exploitation Cloud */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border border-border shadow-xs bg-card">
                <CardHeader className="p-4 border-b border-border">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" />
                    Enveloppe d'Exploitation Cloud Azure & Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-border">
                    <span className="text-foreground font-medium">Hébergement Azure (App Service + PostgreSQL Flexible + Blob) :</span>
                    <span className="font-mono font-bold text-foreground">600 à 1 500 DT/mois</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-border">
                    <span className="text-foreground font-medium">Support technique, SLA & MCO :</span>
                    <span className="font-mono font-bold text-foreground">800 à 1 500 DT/mois</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-border">
                    <span className="text-foreground font-medium">Objectifs de continuité de service :</span>
                    <span className="font-mono font-bold text-emerald-600">RPO ≤ 24h • RTO ≤ 8h</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic">
                    Sauvegarde quotidienne automatisée et test de restauration trimestriel documenté.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border shadow-xs bg-card">
                <CardHeader className="p-4 border-b border-border">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Simulateur de Marge Brute Opérationnelle
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">
                        Coût direct mensuel (DT)
                      </label>
                      <Input
                        type="number"
                        value={coutDirectMensuel}
                        onChange={(e) => setCoutDirectMensuel(Number(e.target.value) || 0)}
                        className="text-xs font-mono h-8 bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">
                        Marge brute cible (%)
                      </label>
                      <Input
                        type="number"
                        value={margeCiblePct}
                        onChange={(e) => setMargeCiblePct(Number(e.target.value) || 0)}
                        className="text-xs font-mono h-8 bg-background"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/40 border border-border text-center space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                      Prix de vente mensuel recommandé
                    </span>
                    <span className="text-xl font-black text-primary block">
                      {prixVenteSuggere.toLocaleString()} DT HT / mois
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Formule : Coût Direct / (1 − Marge) = {coutDirectMensuel} / (1 − {margeCiblePct}%)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
