import React, { useState } from 'react';
import { DocumentItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Stamp,
  Layers,
  FlaskConical,
  Trees,
  HardHat,
  FileCheck2,
  Calendar,
  MapPin,
  Maximize2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface DocumentViewerProps {
  document: DocumentItem;
  className?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document: doc, className }) => {
  const [viewMode, setViewMode] = useState<'sheet' | 'technical'>('sheet');

  // Téléchargement réel d'un fichier texte/données technique
  const handleRealDownload = () => {
    const content = `================================================================================
RÉPUBLIQUE TUNISIENNE — MINISTÈRE DE L'ÉQUIPEMENT ET DE L'HABITAT
DIRECTION GÉNÉRALE DES PONTS ET CHAUSSÉES (DGPC)
PROJET DE DÉDOUBLEMENT DE LA RN13 EN 2X2 VOIES (SFAX — SIDI BOUZID — KASSERINE)
================================================================================
CODE DOCUMENT   : ${doc.code}
TITRE OFFICIEL  : ${doc.title}
CATÉGORIE       : ${doc.categoryLabel} (${doc.category})
LOT CONTRACTUEL : ${doc.lotId}
LINÉAIRE REPERE : PK ${doc.pkRange || '0+000 à 42+000'}
RÉVISION ACTUELLE : ${doc.currentRevision}
ÉTAT CDE        : ${doc.state}
VISA APPOSÉ     : ${doc.visa || 'En attente de visa'}
STATUT BAILLEUR : ${doc.noStatus}
ÉMETTEUR        : ${doc.authorName} (${doc.authorLetter} - ${doc.authorActor})
DATE DE DÉPÔT   : ${new Date(doc.createdAt).toLocaleDateString('fr-FR')}
EMPREINTE SHA-256 : ${doc.revisions[doc.revisions.length - 1]?.fileHash || doc.revisions[0]?.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
================================================================================
DESCRIPTION DU CONTENU TECHNIQUE :
${doc.description || 'Document officiel approuvé sous protocole ISO 19650 et CCAG Travaux.'}

SPÉCIFICATIONS TECHNIQUES DE RÉFÉRENCE RN13 :
- Plateforme 2x2 voies : 2 x 7.00m avec Terre-Plein Central (TPC) de 2.50m
- Couche de forme : 35 cm traitée (Westergaard Ev2 >= 50 MPa)
- Couche de fondation : GNT 0/31.5 épaisseur 20 cm (Compacité >= 100% OPM)
- Couche de base : Grave-Bitume GB 0/20 classe 3 épaisseur 12 cm (Liant STIR 40/50 à 4.2%)
- Couche de roulement : Béton Bitumineux BB 0/14 épaisseur 6 cm (Marshall >= 98%)
- Ouvrages d'art hydrauliques : Béton dosé à 350 kg/m³ Ciment HRS (fc28 >= 30 MPa)
================================================================================
Document certifié conforme à l'original archivé dans le CDE GED-RN13.
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${doc.code}_OFFICIEL.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Fichier certifié ${doc.code}_OFFICIEL.txt téléchargé avec succès.`);
  };

  return (
    <div className={`rounded-xl border border-border bg-slate-950 text-slate-100 overflow-hidden flex flex-col ${className || 'h-[620px]'}`}>
      {/* Barre d'outils du Viewer */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded bg-primary/20 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-mono font-bold text-white block truncate">
              {doc.revisions[doc.revisions.length - 1]?.fileName || `${doc.code}.pdf`}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {doc.categoryLabel} • {doc.lotId} • Révision {doc.currentRevision}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-800 p-0.5 rounded-lg flex text-[11px] font-semibold">
            <button
              onClick={() => setViewMode('sheet')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'sheet' ? 'bg-primary text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Fiche Officielle
            </button>
            <button
              onClick={() => setViewMode('technical')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'technical' ? 'bg-primary text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Plan / Schéma DAO
            </button>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={handleRealDownload}
            className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Télécharger la pièce</span>
          </Button>
        </div>
      </div>

      {/* Surface de Visualisation */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/60 flex items-center justify-center">
        {viewMode === 'sheet' ? (
          /* DOCUMENT TECHNIQUE FORMAT FEUILLE MINISTÈRE */
          <div className="w-full max-w-3xl bg-white text-slate-900 rounded-lg shadow-2xl p-6 sm:p-8 space-y-6 text-xs relative font-sans border border-slate-200">
            {/* Cachets Officiels en filigrane / tampon */}
            <div className="absolute top-6 right-6 flex flex-col items-end gap-2 pointer-events-none opacity-90">
              {doc.visa === 'A' && (
                <div className="border-4 border-emerald-600 text-emerald-700 rounded-lg p-2 text-center uppercase font-black transform rotate-[-6deg] shadow-md bg-emerald-50/80">
                  <p className="text-[10px]">SCET-TUNISIE • MISSION MOE</p>
                  <p className="text-sm font-extrabold">VISA A : BON POUR EXÉCUTION</p>
                  <p className="text-[9px] font-mono">DATE: {new Date().toISOString().slice(0, 10)}</p>
                </div>
              )}
              {doc.visa === 'B' && (
                <div className="border-4 border-amber-600 text-amber-700 rounded-lg p-2 text-center uppercase font-black transform rotate-[-4deg] shadow-md bg-amber-50/80">
                  <p className="text-[10px]">SCET-TUNISIE • MISSION MOE</p>
                  <p className="text-xs font-extrabold">VISA B : OBSERVATIONS MINEURES</p>
                </div>
              )}
              {doc.noStatus === 'NO_OBTENUE' && (
                <div className="border-3 border-indigo-700 text-indigo-800 rounded-lg p-1.5 text-center uppercase font-black transform rotate-[4deg] shadow-md bg-indigo-50/80">
                  <p className="text-[9px]">BANQUE MONDIALE • WORLD BANK</p>
                  <p className="text-[11px] font-extrabold">NON-OBJECTION ACCORDÉE</p>
                  <p className="text-[8px] font-mono">REF: WB-TUN-RN13-2026</p>
                </div>
              )}
              {doc.state === 'Published' && (
                <div className="border-2 border-slate-700 text-slate-800 rounded p-1 text-[9px] uppercase font-bold bg-slate-100">
                  PIÈCE CONTRACTUELLE SCELLÉE ISO 19650
                </div>
              )}
            </div>

            {/* En-tête officiel République Tunisienne */}
            <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
              <p className="font-extrabold uppercase text-xs tracking-wider text-slate-900">
                République Tunisienne — Ministère de l'Équipement et de l'Habitat
              </p>
              <p className="text-[11px] font-semibold text-slate-700">
                Direction Générale des Ponts et Chaussées (DGPC) • Unité de Gestion RN13
              </p>
              <p className="text-xs font-bold text-primary pt-1">
                Projet de Mise à 2x2 Voies de la Route Nationale 13 (Sfax — Sidi Bouzid — Kasserine)
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Co-financement : République Tunisienne & Banque Mondiale (Prêt BIRD N° 9245-TN)
              </p>
            </div>

            {/* Cartouche d'Identification Documentaire */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Code Normalisé :</span>
                <span className="font-mono font-bold text-slate-900">{doc.code}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Lot & Linéaire :</span>
                <span className="font-bold text-slate-900">{doc.lotId} • PK {doc.pkRange || 'Global'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Révision :</span>
                <span className="font-mono font-bold text-primary">{doc.currentRevision} ({doc.state})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Émetteur / Auteur :</span>
                <span className="font-bold text-slate-900">{doc.authorName} ({doc.authorLetter})</span>
              </div>
            </div>

            {/* Titre et Objet du Document */}
            <div className="space-y-1">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase">
                {doc.title}
              </h2>
              <p className="text-slate-600 text-xs leading-relaxed">
                {doc.description || 'Pièce technique contractuelle établie dans le cadre de la construction de la liaison autoroutière 2x2 voies de la RN13.'}
              </p>
            </div>

            {/* Corps du Document Spécifique par Type */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Spécifications & Justificatifs Contractuels Validés :
              </h3>

              {doc.category === 'PLN' || doc.typeCode?.includes('PLN') || doc.typeCode?.includes('PROFIL') ? (
                /* Contenu Plan */
                <div className="space-y-2 text-[11px] text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
                  <p><strong>Profil en Travers Type :</strong> Plateforme de 24.50 m comprenant deux chaussées séparées à 2 voies de 3.50 m chacune, un Terre-Plein Central (TPC) de 2.50 m avec glissières de sécurité GS4, deux bandes dérasées de gauche de 0.50 m et deux bandes d'arrêt d'urgence de 2.00 m.</p>
                  <p><strong>Pente transversale :</strong> Dévers standard de 2.50 % en alignement droit, raccordements paraboliques pour les virages à vitesse de référence Vr = 110 km/h.</p>
                  <p><strong>Hydraulique :</strong> Évacuation des eaux par fossés trapézoïdaux bétonnés 1.00 × 0.50 m raccordés aux exutoires naturels des oueds.</p>
                </div>
              ) : doc.category === 'QUA' || doc.typeCode?.includes('PRO') || doc.typeCode?.includes('LAB') ? (
                /* Contenu Essai Labo */
                <div className="space-y-2 text-[11px] text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div>Optimum Proctor Modifié (wOPM) : <strong>7.80 %</strong></div>
                    <div>Densité sèche maximale (rho_d max) : <strong>2.14 t/m³</strong></div>
                    <div>Compacité mesurée in-situ : <strong className="text-emerald-700">98.4 % OPM (Seuil ≥ 98%)</strong></div>
                    <div>Module de réaction à la plaque : <strong className="text-emerald-700">Ev2 = 58.2 MPa (Seuil ≥ 50 MPa)</strong></div>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1">Verdict : Conforme aux exigences de l'Article 18 du CCTP — Autorisation de passage à la couche de fondation GNT 0/31.5.</p>
                </div>
              ) : doc.category === 'ESI' || doc.typeCode?.includes('PAR') || doc.typeCode?.includes('PVLE') ? (
                /* Contenu Foncier */
                <div className="space-y-2 text-[11px] text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
                  <p><strong>Constat de Libération d'Emprise :</strong> La Commission Régionale Foncier atteste que les parcelles agricoles situées sur cette section ont fait l'objet d'accords amiables signés avec les exploitants, et que l'intégralité des indemnités d'arrachage des oliviers (450 DT/arbre) et compensation de terrain a été versée.</p>
                  <p><strong>Conformité Banque Mondiale ESS5 :</strong> Aucune contrainte résiduelle. Autorisation immédiate d'engagement des engins de terrassement délivrée à l'Entreprise Soroubat.</p>
                </div>
              ) : (
                /* Contenu Pièce Écrite CCTP / CCAP */
                <div className="space-y-2 text-[11px] text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
                  <p><strong>Article 12 — Provenance des Matériaux :</strong> Agrément exclusif de la carrière calcaire dur de Jebel Oust (Los Angeles ≤ 20, Micro-Deval ≤ 15). Bitume pur classe 40/50 raffiné par la STIR à Bizerte avec certificat de conformité NT.</p>
                  <p><strong>Article 21 — Procédure de Visa et Délais :</strong> La Mission de Contrôle SCET-Tunisie dispose de 14 jours calendaires pour examiner toute proposition d'exécution. L'absence de réponse vaut mise en demeure formelle.</p>
                </div>
              )}
            </div>

            {/* Signatures et Empreinte Numérique */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] text-slate-600">
              <div>
                <span className="font-bold text-slate-800 block">Empreinte d'intégrité cryptographique SHA-256 :</span>
                <span className="font-mono text-[9px] text-slate-500 break-all block">
                  {doc.revisions[doc.revisions.length - 1]?.fileHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-slate-800 block">Signataire pour la DGPC :</span>
                <span>Hichem Gharbi (Directeur de Projet)</span>
              </div>
            </div>
          </div>
        ) : (
          /* SCHÉMA TECHNIQUE VECTORIEL / DAO DE LA ROUTE RN13 */
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                Profil en Travers Type RN13 — Double Chaussée 2x2 Voies
              </span>
              <span className="text-[10px] font-mono text-slate-400">Échelle 1/50 • DAO Autocad / Civil 3D</span>
            </div>

            {/* Dessin vectoriel SVG de la route */}
            <div className="bg-slate-950 p-4 rounded border border-slate-800">
              <svg viewBox="0 0 800 240" className="w-full h-auto">
                {/* Sol support / Terrain Naturel */}
                <path d="M 10 210 L 790 210" stroke="#64748b" strokeWidth="2" strokeDasharray="6 3" />
                <text x="20" y="225" fill="#94a3b8" fontSize="10" fontFamily="monospace">Terrain Naturel (TN)</text>

                {/* Remblai / Couche de forme */}
                <polygon points="50,210 120,160 680,160 750,210" fill="#334155" opacity="0.6" />
                <text x="400" y="190" fill="#cbd5e1" fontSize="10" textAnchor="middle" fontWeight="bold">Plateforme & Couche de forme (e = 35 cm) • Ev2 ≥ 50 MPa</text>

                {/* Couche de fondation GNT 0/31.5 */}
                <polygon points="120,160 140,140 660,140 680,160" fill="#475569" />
                <text x="400" y="152" fill="#f1f5f9" fontSize="9" textAnchor="middle">Couche de Fondation GNT 0/31.5 (e = 20 cm)</text>

                {/* Couche de base Grave-Bitume GB 0/20 */}
                <polygon points="140,140 150,125 650,125 660,140" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                <text x="400" y="135" fill="#38bdf8" fontSize="9" textAnchor="middle">Couche de Base Grave-Bitume GB 0/20 (e = 12 cm)</text>

                {/* Couche de roulement Béton Bitumineux BB 0/14 */}
                <polygon points="150,125 155,115 645,115 650,125" fill="#0284c7" />
                <text x="400" y="122" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">Couche de Roulement BB 0/14 (e = 6 cm)</text>

                {/* Chaussée Gauche 2 Voies */}
                <rect x="180" y="105" width="200" height="8" fill="#38bdf8" opacity="0.3" />
                <text x="280" y="95" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">Chaussée Gauche : 2 x 3.50 m (7.00 m)</text>

                {/* Terre-Plein Central (TPC) */}
                <rect x="385" y="90" width="30" height="25" fill="#f59e0b" />
                <text x="400" y="85" fill="#f59e0b" fontSize="9" textAnchor="middle" fontWeight="bold">TPC 2.50 m</text>
                {/* Glissières GS4 */}
                <line x1="390" y1="88" x2="390" y2="105" stroke="#ffffff" strokeWidth="2" />
                <line x1="410" y1="88" x2="410" y2="105" stroke="#ffffff" strokeWidth="2" />

                {/* Chaussée Droite 2 Voies */}
                <rect x="420" y="105" width="200" height="8" fill="#38bdf8" opacity="0.3" />
                <text x="520" y="95" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">Chaussée Droite : 2 x 3.50 m (7.00 m)</text>

                {/* Bandes d'arrêt d'urgence (BAU) */}
                <text x="145" y="95" fill="#94a3b8" fontSize="8">BAU 2.0m</text>
                <text x="635" y="95" fill="#94a3b8" fontSize="8">BAU 2.0m</text>

                {/* Fossés trapézoïdaux */}
                <polyline points="20,180 50,210 70,210 100,180" fill="none" stroke="#22c55e" strokeWidth="2" />
                <text x="60" y="175" fill="#22c55e" fontSize="8">Fossé bétonné</text>

                <polyline points="700,180 730,210 750,210 780,180" fill="none" stroke="#22c55e" strokeWidth="2" />
                <text x="740" y="175" fill="#22c55e" fontSize="8">Fossé bétonné</text>
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-slate-300">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block font-bold">Vitesse de Référence :</span>
                <span className="font-mono text-white">Vr = 110 km/h (Rapport APD)</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block font-bold">Trafic Prévu :</span>
                <span className="font-mono text-white">TPL6 (Poids Lourds &gt; 1 500 / j)</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block font-bold">Durée de Vie :</span>
                <span className="font-mono text-emerald-400">20 ans avec rechargement à 12 ans</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
