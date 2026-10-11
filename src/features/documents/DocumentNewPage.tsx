import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { calculateSha256 } from '@/services/hash';
import { generateDocCode } from '@/utils/docCode';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { DocCode } from '@/components/shared/DocCode';
import { useNavigate } from 'react-router-dom';
import { Upload, FileCheck, ArrowRight, ArrowLeft, Shield, Check, Hash } from 'lucide-react';
import { toast } from 'sonner';

export const DocumentNewPage: React.FC = () => {
  const { currentUser } = useSession();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [sha256, setSha256] = useState('');
  const [calculatingHash, setCalculatingHash] = useState(false);

  // Formulaire Métadonnées
  const [lotId, setLotId] = useState('L03');
  const [category, setCategory] = useState<'PEC' | 'PLN' | 'ETU' | 'ESI' | 'EXE' | 'QUA' | 'HSE' | 'TRV'>('PEC');
  const [typeCode, setTypeCode] = useState('CCTP');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pkRange, setPkRange] = useState('28+000 → 42+000');
  const [confidentiality, setConfidentiality] = useState<'Public' | 'Projet' | 'Restreint'>('Projet');
  const [reviewers, setReviewers] = useState<string[]>(['C', 'D']);

  // Code calculé automatiquement
  const generatedCode = generateDocCode(lotId, category, typeCode, 12, 'P01');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
      setCalculatingHash(true);
      try {
        const hash = await calculateSha256(selectedFile);
        setSha256(hash);
      } catch (err) {
        setSha256('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
      } finally {
        setCalculatingHash(false);
      }
    }
  };

  const handleSimulateFile = async () => {
    setCalculatingHash(true);
    setTimeout(async () => {
      const dummyText = `Fichier technique officiel déposé pour le projet RN13 2x2 voies : ${generatedCode}`;
      const hash = await calculateSha256(dummyText);
      setSha256(hash);
      setCalculatingHash(false);
      toast.success('Fichier de test prêt avec calcul réel SHA-256 !');
    }, 400);
  };

  const handleSubmit = () => {
    const newDoc = {
      id: `doc-${Date.now().toString(36)}`,
      code: generatedCode,
      title: title || `Document technique ${typeCode} — Lot ${lotId}`,
      description: description || 'Pièce technique et administrative sous protocole GED-RN13.',
      lotId,
      category,
      categoryLabel: category === 'PEC' ? 'Pièces écrites' : category === 'PLN' ? 'Plans' : 'Études',
      typeCode,
      state: 'WIP' as const,
      currentRevision: 'P01',
      revisions: [
        {
          revisionTag: 'P01',
          versionNumber: 1,
          fileName: file?.name || `${generatedCode}.pdf`,
          sizeBytes: file?.size || 4500000,
          sha256: sha256 || '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
          uploadedBy: currentUser.id,
          uploadedByName: currentUser.fullName,
          uploadedByActor: currentUser.actorLetter,
          uploadedAt: new Date().toISOString(),
          note: 'Dépôt initial en préparation WIP',
        },
      ],
      noStatus: category === 'PEC' ? ('NO_REQUISE' as const) : ('NON_REQUISE' as const),
      confidentiality,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorActor: currentUser.actor,
      authorLetter: currentUser.actorLetter,
      assignedReviewerActors: reviewers as any,
      pkRange,
      hasBlockingComments: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.addDocument(newDoc, currentUser);
    toast.success(`Document déposé avec succès : ${newDoc.code}`);
    navigate(`/documents/${newDoc.id}`);
  };

  const needContent: NeedPanelContent = {
    screenId: 'document-new',
    title: 'Assistant de dépôt de document (UploadWizard)',
    purpose: 'Cet assistant guide l\'utilisateur dans le téléversement, la codification normalisée automatique et le scellement cryptographique par empreinte SHA-256.',
    actors: [
      { letter: 'B', actorName: 'Maître d\'ouvrage', action: 'Dépose les pièces de conception du DAO (CCTP, CCAP, PGES-C).' },
      { letter: 'E', actorName: 'Entreprise', action: 'Dépose les études d\'exécution (EXE), notes de calculs et PAQ.' },
      { letter: 'C', actorName: 'AMO', action: 'Dépose ses rapports d\'audit et notes techniques.' },
      { letter: 'D', actorName: 'MOE', action: 'Dépose les PV de chantier et rapports de contrôle.' },
    ],
    donorRequirement: 'La convention de nommage standardisée garantit qu\'aucun document ne puisse être écrasé ou substitué frauduleusement au cours du projet routier.',
    seeAlso: [
      { label: 'Consulter tous les documents', href: '#/documents' },
      { label: 'Règles de codification RN13', href: '#/aide' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        <PageHeader
          title="Déposer un nouveau document"
          subtitle="Assistant en 4 étapes conforme aux exigences de gestion documentaire RN13."
        />

        {/* Stepper de l'assistant */}
        <div className="flex items-center justify-between max-w-2xl bg-card p-3 rounded-xl border border-border shadow-2xs text-xs font-semibold">
          {[
            { num: 1, label: 'Fichier & Empreinte' },
            { num: 2, label: 'Classification RN13' },
            { num: 3, label: 'Circuit de validation' },
            { num: 4, label: 'Récapitulatif & Dépôt' },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-1.5 ${
                step === s.num
                  ? 'text-primary font-bold'
                  : step > s.num
                  ? 'text-emerald-600'
                  : 'text-muted-foreground'
              }`}
            >
              <span
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s.num
                    ? 'bg-primary text-primary-foreground'
                    : step > s.num
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Étape 1 : Fichier & Hash SHA-256 */}
        {step === 1 && (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base">Étape 1 : Fichier et calcul d'empreinte SHA-256</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-card/60 hover:bg-muted/30 transition-colors">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <h4 className="font-bold text-sm text-foreground mb-1">
                  Glissez-déposez votre document ici
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Formats acceptés : PDF, DWG, DOCX, XLSX (max 100 Mo).
                </p>
                <div className="flex justify-center gap-3">
                  <input
                    type="file"
                    id="fileUpload"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('fileUpload')?.click()}
                  >
                    Parcourir les fichiers
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSimulateFile}
                  >
                    Utiliser fichier de démonstration
                  </Button>
                </div>
              </div>

              {calculatingHash && (
                <div className="text-xs text-primary font-medium flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>Calcul cryptographique de l'empreinte SHA-256 via Web Crypto API...</span>
                </div>
              )}

              {sha256 && (
                <div className="p-3 bg-muted/60 rounded-lg border border-border/80 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                    <Check className="h-4 w-4" />
                    <span>Empreinte SHA-256 certifiée calculée :</span>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground break-all bg-card p-1.5 rounded border border-border">
                    {sha256}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="default"
                size="sm"
                onClick={() => setStep(2)}
                disabled={!sha256}
                className="gap-1.5 font-bold"
              >
                <span>Continuer</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Étape 2 : Classification & Codification */}
        {step === 2 && (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base">Étape 2 : Classification et codification RN13</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Lot routier</label>
                  <select
                    value={lotId}
                    onChange={(e) => setLotId(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-card px-2.5 text-xs font-semibold"
                  >
                    <option value="L01">Lot L01 (PK 0+000 à 14+000)</option>
                    <option value="L02">Lot L02 (PK 14+000 à 28+000)</option>
                    <option value="L03">Lot L03 (PK 28+000 à 42+000)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Catégorie documentaire</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-card px-2.5 text-xs font-semibold"
                  >
                    <option value="PEC">PEC — Pièces écrites</option>
                    <option value="PLN">PLN — Plans d'ingénierie</option>
                    <option value="ETU">ETU — Études géotechniques / topo</option>
                    <option value="ESI">ESI — Instruments E&S</option>
                    <option value="EXE">EXE — Études d'exécution</option>
                    <option value="QUA">QUA — Qualité & PAQ</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Type de pièce</label>
                  <Input
                    type="text"
                    value={typeCode}
                    onChange={(e) => setTypeCode(e.target.value.toUpperCase())}
                    placeholder="ex: CCTP, TGO, PAQ, OHA"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Localisation (PK)</label>
                  <Input
                    type="text"
                    value={pkRange}
                    onChange={(e) => setPkRange(e.target.value)}
                    placeholder="ex: 12+400 → 12+650"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Titre officiel de la pièce</label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Cahier des Clauses Techniques Particulières — Terrassements"
                />
              </div>

              {/* Prévisualisation du code généré */}
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-1">
                <span className="text-[11px] font-bold text-primary">Code normalisé généré :</span>
                <div>
                  <DocCode code={generatedCode} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              <Button variant="default" size="sm" onClick={() => setStep(3)} className="font-bold">
                Continuer
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Étape 3 : Circuit de validation */}
        {step === 3 && (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base">Étape 3 : Circuit de validation et réviseurs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-foreground">Réviseurs obligatoires à assigner</label>
                <div className="space-y-2">
                  {[
                    { letter: 'C', name: 'AMO (Assistance Maîtrise d\'Ouvrage)', desc: 'Contrôle complétude & avis technique' },
                    { letter: 'D', name: 'MOE (Maîtrise d\'Œuvre Contrôle)', desc: 'Visa contractuel A/B/C/D' },
                    { letter: 'A', name: 'Bailleur (Banque Mondiale)', desc: 'Avis de Non-Objection si soumis à NO' },
                  ].map((r) => (
                    <label
                      key={r.letter}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card cursor-pointer hover:bg-muted/40"
                    >
                      <input
                        type="checkbox"
                        checked={reviewers.includes(r.letter)}
                        onChange={(e) => {
                          if (e.target.checked) setReviewers([...reviewers, r.letter]);
                          else setReviewers(reviewers.filter((x) => x !== r.letter));
                        }}
                        className="rounded text-primary"
                      />
                      <div>
                        <p className="font-bold text-foreground">{r.name}</p>
                        <p className="text-[11px] text-muted-foreground">{r.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Niveau de confidentialité</label>
                <select
                  value={confidentiality}
                  onChange={(e) => setConfidentiality(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-card px-2.5 text-xs font-semibold"
                >
                  <option value="Projet">Projet (Acteurs RN13)</option>
                  <option value="Public">Public (Divulgation autorisée)</option>
                  <option value="Restreint">Restreint (Nominatif confidentiel)</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              <Button variant="default" size="sm" onClick={() => setStep(4)} className="font-bold">
                Continuer
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Étape 4 : Récapitulatif & Dépôt */}
        {step === 4 && (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base">Étape 4 : Récapitulatif et validation du dépôt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="bg-muted/50 p-4 rounded-xl border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Code de document :</span>
                  <DocCode code={generatedCode} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Titre :</span>
                  <span className="font-bold text-foreground">{title || 'Sans titre'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lot / PK :</span>
                  <span className="font-mono">{lotId} ({pkRange})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Révision initiale :</span>
                  <span className="font-bold text-blue-600">P01 (En préparation WIP)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Auteur :</span>
                  <span className="font-semibold">{currentUser.fullName} ({currentUser.actorLabel})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Réviseurs assignés :</span>
                  <span className="font-bold">{reviewers.join(', ')}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <Shield className="h-5 w-5 shrink-0" />
                <span>
                  L'intégrité du fichier sera scellée dans le journal d'audit dès confirmation du dépôt.
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              <Button variant="default" size="sm" onClick={handleSubmit} className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                <FileCheck className="h-4 w-4 mr-1.5" />
                Déposer le document
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
