import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sparkles,
  MapPin,
  Clock,
  Coins,
  ShieldCheck,
  AlertTriangle,
  FolderTree,
  HardHat,
  Trees,
  CheckCircle2,
  FileCheck2,
  Layers,
  ArrowRight,
  ExternalLink,
  Users,
} from 'lucide-react';
import { useGuide } from '@/store/guideStore';
import { useNavigate } from 'react-router-dom';

interface ProjectPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectPresentationModal: React.FC<ProjectPresentationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('besoin');
  const { startGuide } = useGuide();
  const navigate = useNavigate();

  const handleStartDemo = () => {
    onClose();
    startGuide();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border-border">
        {/* En-tête avec dégradé et logo */}
        <div className="bg-gradient-to-r from-primary/95 via-sky-800 to-indigo-900 text-white p-6 rounded-t-lg relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-none font-mono text-[10px] tracking-wider uppercase">
                Projet Routier National • Tunisie
              </Badge>
              <Badge className="bg-amber-400 text-amber-950 border-none font-bold text-[10px]">
                Co-financement Banque Mondiale & BEI
              </Badge>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-white">
              RN13 : Mise à 2x2 Voies Sfax — Sidi Bouzid — Kasserine (181 km)
            </DialogTitle>
            <DialogDescription className="text-white/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Présentation du besoin stratégique national, des 5 rôles contractuels (A, B, C, D, E), du plan de classement documentaire ISO 19650 et du mécanisme de traçabilité des arrêts de chantier.
            </DialogDescription>
          </div>
          {/* Filigrane discret */}
          <div className="absolute -bottom-8 -right-8 opacity-10 text-white font-black text-9xl select-none pointer-events-none">
            RN13
          </div>
        </div>

        {/* Corps avec onglets interactifs */}
        <div className="p-6 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-auto p-1 bg-muted/60 mb-6">
              <TabsTrigger value="besoin" className="text-xs font-bold py-2">
                1. Le Besoin Métier
              </TabsTrigger>
              <TabsTrigger value="acteurs" className="text-xs font-bold py-2">
                2. Les 5 Acteurs (A-E)
              </TabsTrigger>
              <TabsTrigger value="technique" className="text-xs font-bold py-2">
                3. Corps d'État & Couches
              </TabsTrigger>
              <TabsTrigger value="foncier" className="text-xs font-bold py-2">
                4. Foncier & Oliviers
              </TabsTrigger>
              <TabsTrigger value="arrets" className="text-xs font-bold py-2">
                5. Arrêts & Traçabilité
              </TabsTrigger>
            </TabsList>

            {/* ONGLET 1 : LE BESOIN MÉTIER */}
            <TabsContent value="besoin" className="space-y-4 text-xs leading-relaxed">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>Linéaire & Périmètre</span>
                  </div>
                  <p className="text-2xl font-black text-foreground">181 km</p>
                  <p className="text-[11px] text-muted-foreground">3 Gouvernorats traversés : Sfax, Sidi Bouzid, Kasserine.</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Durée du Projet</span>
                  </div>
                  <p className="text-2xl font-black text-foreground">5 à 7 ans</p>
                  <p className="text-[11px] text-muted-foreground">Phasage en 3 lots majeurs (L01, L02, L03) avec cycle de garantie.</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <Coins className="h-4 w-4" />
                    <span>Budget & Bailleurs</span>
                  </div>
                  <p className="text-2xl font-black text-foreground">650 MDT</p>
                  <p className="text-[11px] text-muted-foreground">Ministère de l'Équipement + Banque Mondiale (BIRD) + BEI.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <h4 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Pourquoi ce projet est-il indispensable pour la Tunisie ?
                </h4>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-foreground">1. Désenclavement Économique :</span>
                    Relie les bassins intérieurs agricoles et miniers (Sidi Bouzid, Kasserine) au deuxième pôle économique, industriel et portuaire du pays (Sfax). Le temps de trajet passe de 3h45 à 1h50.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-foreground">2. Sécurité Routière Vitale :</span>
                    L'ancienne route RN13 à chaussée unique de 7 m enregistrait un taux d'accidents mortels critique. La séparation physique par Terre-Plein Central (TPC de 2.50 m) élimine les chocs frontaux.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-foreground">3. Traçabilité Contractuelle Zéro Litige :</span>
                    Sur un chantier de 5 ans, les litiges de retards et les réclamations financières des entreprises représentent des millions de dinars. L'application GED-RN13 assure la traçabilité intégrale de chaque décision, essai et arrêt.
                  </li>
                </ul>
              </div>
            </TabsContent>

            {/* ONGLET 2 : LES 5 ACTEURS */}
            <TabsContent value="acteurs" className="space-y-3 text-xs">
              <p className="text-muted-foreground">
                L'application respecte la matrice de séparation des responsabilités imposée par les accords de prêt internationaux (FIDIC & CCAG Travaux tunisien) :
              </p>

              <div className="space-y-2.5">
                <div className="p-3 rounded-lg border border-border bg-card flex items-start gap-3">
                  <span className="h-7 w-7 rounded-full bg-[#FDE9CC] text-[#B45309] font-black flex items-center justify-center shrink-0">A</span>
                  <div>
                    <h5 className="font-bold text-foreground">Bailleurs de Fonds (Banque Mondiale / BEI)</h5>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Vérifie l'orthodoxie des marchés et la conformité aux normes environnementales et sociales (ESS5 pour les expropriations, ESS2 pour la sécurité). Délivre les <strong>Avis de Non-Objection (NO)</strong> indispensables pour tout avenant ou jalon majeur.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card flex items-start gap-3">
                  <span className="h-7 w-7 rounded-full bg-[#DCE9FA] text-[#1D4ED8] font-black flex items-center justify-center shrink-0">B</span>
                  <div>
                    <h5 className="font-bold text-foreground">Maître d'Ouvrage (Ministère de l'Équipement — DGPC)</h5>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Propriétaire de l'infrastructure. Approuve les pièces du DAO, liquide les expropriations, signe les <strong>Ordres de Service (OS)</strong> de démarrage, d'arrêt ou de reprise, ordonnance le paiement des décomptes mensuels (IPC).
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card flex items-start gap-3">
                  <span className="h-7 w-7 rounded-full bg-[#E1F0E4] text-[#15803D] font-black flex items-center justify-center shrink-0">C</span>
                  <div>
                    <h5 className="font-bold text-foreground">Assistance à Maîtrise d'Ouvrage (AMO — Direction de Projet)</h5>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Assure le contrôle formel de complétude sous 48h (présence des visas, conformité ISO 19650), suit la matrice d'avancement et consolide les <strong>Rapports d'État Mensuels</strong> officiels.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card flex items-start gap-3">
                  <span className="h-7 w-7 rounded-full bg-[#EBE1F3] text-[#7E22CE] font-black flex items-center justify-center shrink-0">D</span>
                  <div>
                    <h5 className="font-bold text-foreground">Maîtrise d'Œuvre & Mission de Contrôle (SCET-Tunisie)</h5>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Surveillance technique quotidienne sur le terrain. Appose les <strong>Visas contractuels (A: Bon pour exécution, B: Observations, C: Rejeté)</strong>, réalise les contre-essais laboratoire, dresse les constats contradictoires d'arrêt et certifie les métrés.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card flex items-start gap-3">
                  <span className="h-7 w-7 rounded-full bg-[#D6EEF3] text-[#0E7490] font-black flex items-center justify-center shrink-0">E</span>
                  <div>
                    <h5 className="font-bold text-foreground">Entreprise Titulaire des Travaux (Soroubat / Groupement BTP)</h5>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Dépose les études d'exécution (EXE), réalise l'autocontrôle qualité, déclare immédiatement les contraintes de chantier (oueds, réseaux SONEDE/STEG) et transmet les décomptes mensuels des travaux.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ONGLET 3 : CORPS D'ÉTAT & COUCHES */}
            <TabsContent value="technique" className="space-y-3 text-xs leading-relaxed">
              <p className="text-muted-foreground">
                L'application décompose le génie civil routier en 5 macro-lots élémentaires avec suivi précis des points d'arrêt :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-primary" />
                    1. Terrassements & Plateforme
                  </span>
                  <p className="text-muted-foreground text-[11px]">
                    Décapage de la terre végétale (25 cm), remblais méthodiques compactés par couches successives de 30 cm. Exigence : compacité ≥ 95% en corps de remblai et ≥ 98% OPM sous chaussée.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <HardHat className="h-4 w-4 text-amber-600" />
                    2. Ouvrages d'Art Hydrauliques
                  </span>
                  <p className="text-muted-foreground text-[11px]">
                    Franchissement des crues : 14 dalots cadres béton armé (double cadre 3.00 × 2.50 m) et pont sur pieux sur l'Oued Zitoun. Béton dosé à 350 kg/m³ Ciment HRS (fc28 ≥ 30 MPa).
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    3. Corps de Chaussée 2x2 Voies
                  </span>
                  <p className="text-muted-foreground text-[11px]">
                    Couche de fondation GNT 0/31.5 (20 cm, Ev2 ≥ 80 MPa) + Couche de base Grave-Bitume GB 0/20 (12 cm, Bitume STIR 40/50 à 4.2%) + Couche de roulement Béton Bitumineux BB 0/14 (6 cm).
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <FileCheck2 className="h-4 w-4 text-sky-600" />
                    4. Assainissement & Signalisation
                  </span>
                  <p className="text-muted-foreground text-[11px]">
                    Fossés trapézoïdaux bétonnés, descentes d'eau préfabriquées, glissières métalliques GS2/GS4 et marquage thermoplastique rétroréfléchissant (RL ≥ 150 mcd/lx/m²).
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* ONGLET 4 : FONCIER & OLIVIERS */}
            <TabsContent value="foncier" className="space-y-3 text-xs leading-relaxed">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <h4 className="font-extrabold text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-2">
                  <Trees className="h-4 w-4 text-emerald-600" />
                  Règle d'Or ESS5 : Zéro Terrassement sans Indemnisation Préalable
                </h4>
                <p className="text-emerald-800 dark:text-emerald-300 text-xs">
                  En Tunisie centrale (Sfax et Sidi Bouzid), les oliveraies sont le patrimoine vital des familles. La norme ESS5 de la Banque Mondiale stipule formellement qu'aucun engin de terrassement ne peut pénétrer sur une parcelle tant que les propriétaires n'ont pas touché 100% de leur compensation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Barème Olivier Productif</span>
                  <span className="text-lg font-black text-emerald-600">450 DT / arbre</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Variété Chemlali adulte avec compensation de récolte perdue.</p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Terres Agricoles Nues</span>
                  <span className="text-lg font-black text-foreground">25 à 30 DT / m²</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Valeur de remplacement basée sur les transactions notariales locales.</p>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Document Débloquant (Gate)</span>
                  <span className="text-lg font-black text-primary">PVLE Officiel</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Procès-Verbal de Libération d'Emprise signé par le Gouverneur.</p>
                </div>
              </div>
            </TabsContent>

            {/* ONGLET 5 : ARRÊTS & TRAÇABILITÉ */}
            <TabsContent value="arrets" className="space-y-3 text-xs leading-relaxed">
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                <h4 className="font-extrabold text-rose-900 dark:text-rose-200 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  Protection Juridique contre les Pénalités : Les Ordres de Service (OS)
                </h4>
                <p className="text-rose-800 dark:text-rose-300 text-xs">
                  Lorsque des intempéries (crues de l'Oued Chaffar) ou un litige foncier bloquent un tronçon, l'Entreprise risque des pénalités de retard injustifiées. L'application formalise l'arrêt par un <strong>Ordre de Service d'Arrêt Partiel</strong>, quantifie les jours perdus (ex: 26 jours au PK 12), et prépare l'<strong>Avenant de Prorogation de Délai (45 jours)</strong> approuvé par la Banque Mondiale.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                <span className="font-bold text-foreground block">Les 6 Conditions Précises pour Notifier la Reprise :</span>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Accord amiable signé et virement bancaire effectué pour les propriétaires fonciers.</li>
                  <li>PV de Libération d'Emprise (PVLE) notifié par la commission régionale.</li>
                  <li>PV contradictoire de dévoiement des canalisations SONEDE ou câbles STEG.</li>
                  <li>Contre-essai laboratoire certifiant la conformité géotechnique (≥ 98% OPM ou fc28 ≥ 30 MPa).</li>
                  <li>Levée écrite des réserves par le Chef de Mission de la Maîtrise d'Œuvre (SCET).</li>
                  <li><strong>Signature de l'Ordre de Service de Reprise par le Maître d'Ouvrage (DGPC)</strong>.</li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Pied de Modale avec Boutons d'Action Rapide */}
        <DialogFooter className="p-4 bg-muted/40 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-muted-foreground">
            Maquette 100% conforme au cahier des charges génie civil RN13.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Fermer
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleStartDemo}
              className="text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Lancer le Guide Démo Guidé (16 Étapes)</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
