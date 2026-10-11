import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { DocCode } from '@/components/shared/DocCode';
import { RevisionTag } from '@/components/shared/RevisionTag';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { VisaBadge } from '@/components/shared/VisaBadge';
import { ActorChip } from '@/components/shared/ActorChip';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { DocumentViewer } from '@/components/shared/DocumentViewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle,
  Download,
  MessageSquare,
  ShieldAlert,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export const ReviewSplitPage: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const { currentUser } = useSession();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(() => db.getDocumentById(docId || 'doc-001'));
  const [comments, setComments] = useState(() => db.getCommentsByDocId(doc?.id || 'doc-001'));

  // Formulaire d'ajout de commentaire
  const [newCommentText, setNewCommentText] = useState('');
  const [pageArticle, setPageArticle] = useState('');
  const [severity, setSeverity] = useState<'bloquant' | 'majeur' | 'mineur' | 'observation'>('bloquant');

  // Formulaire de réponse rapide
  const [answeringCommentId, setAnsweringCommentId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  if (!doc) {
    return (
      <div className="p-8 text-center space-y-3">
        <h3 className="font-bold text-lg">Document introuvable</h3>
        <Button onClick={() => navigate('/revues')}>Retour aux revues</Button>
      </div>
    );
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const added = db.addComment(
      {
        id: `com-${Date.now().toString(36)}`,
        docId: doc.id,
        docCode: doc.code,
        revision: doc.currentRevision,
        authorId: currentUser.id,
        authorName: currentUser.fullName,
        authorActor: currentUser.actor,
        authorLetter: currentUser.actorLetter,
        pageOrArticle: pageArticle || 'Section générale',
        severity,
        commentText: newCommentText.trim(),
        status: 'ouvert',
        createdAt: new Date().toISOString(),
      },
      currentUser
    );

    setComments([...db.getCommentsByDocId(doc.id)]);
    setDoc({ ...doc, hasBlockingComments: severity === 'bloquant' ? true : doc.hasBlockingComments });
    setNewCommentText('');
    setPageArticle('');
    toast.success(`Commentaire ${severity} enregistré dans le CRD.`);
  };

  const handleAnswerComment = (comId: string) => {
    if (!responseText.trim()) return;
    db.answerComment(comId, responseText.trim(), currentUser);
    setComments([...db.getCommentsByDocId(doc.id)]);
    setAnsweringCommentId(null);
    setResponseText('');
    toast.success('Réponse enregistrée avec succès.');
  };

  const handleCloseComment = (comId: string) => {
    db.closeComment(comId, currentUser);
    setComments([...db.getCommentsByDocId(doc.id)]);
    const updated = db.getDocumentById(doc.id);
    if (updated) setDoc({ ...updated });
    toast.success('Commentaire validé et clos.');
  };

  const handleApplyVisa = (visaCode: 'A' | 'B' | 'C' | 'D') => {
    const updated = db.visaDocument(doc.id, visaCode, currentUser);
    if (updated) {
      setDoc({ ...updated });
      toast.success(`Visa ${visaCode} attribué au document.`);
    }
  };

  const handleDownload = () => {
    const rev = doc.revisions[0];
    const fileName = rev?.fileName || `${doc.code}.txt`;
    const content = `================================================================================
RÉPUBLIQUE TUNISIENNE — MINISTÈRE DE L'ÉQUIPEMENT ET DE L'HABITAT
DIRECTION GÉNÉRALE DES PONTS ET CHAUSSÉES (DGPC)
PROJET DE MISE À 2x2 VOIES DE LA ROUTE NATIONALE RN13 (SFAX - KASSERINE)
================================================================================
PIÈCE CONTRACTUELLE OFFICIELLE DÉLIVRÉE PAR LE SYSTÈME GED-RN13
NORME ISO 19650 — CDE (COMMON DATA ENVIRONMENT)

RÉFÉRENCE UNIQUE (CODE RN13) : ${doc.code}
INTITULÉ DE LA PIÈCE        : ${doc.title}
LOT ROUTIER                 : ${doc.lotId}
REPÈRE LINÉAIRE             : ${doc.pkRange || 'Global'}
CATÉGORIE TECHNIQUE         : ${doc.category} (${doc.categoryLabel})
RÉVISION EN COURS           : ${doc.currentRevision}
STATUT CDE                  : ${doc.state}
VISA MAÎTRISE D'ŒUVRE       : ${doc.visa || 'En attente de visa'}
AUTEUR DÉPOSANT             : ${doc.authorName} (${doc.authorActor})
DATE DE CERTIFICATION       : ${new Date(doc.createdAt).toLocaleString('fr-FR')}
EMPREINTE SHA-256 SCELLÉE   : ${rev?.sha256 || '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'}
TAILLE DU FICHIER SOURCE    : ${rev?.sizeBytes ? (rev.sizeBytes / 1024 / 1024).toFixed(2) + ' Mo' : '3.80 Mo'}

--------------------------------------------------------------------------------
CONDITIONS TECHNIQUES ET SPÉCIFICATIONS MÉTIER APPLICABLES :
1. Plateforme autoroutière : 2 x 2 voies séparées par un Terre-Plein Central (TPC 2.50m).
2. Structure de chaussée :
   - Couche de roulement : Béton Bitumineux BB 0/14 (6 cm)
   - Couche de liaison    : Grave Bitume GB 0/20 (8 cm)
   - Couche de base       : Grave Non Traitée GNT 0/20 (20 cm)
   - Couche de fondation  : GNT 0/31.5 (25 cm)
3. Spécifications de compactage : Minimum 98 % de l'Optimum Proctor Modifié (OPM).
4. Module de réaction Westergaard : Ev2 > 100 MPa / Déflexion < 100/100 mm.
5. Conformité E&S : Norme ESS5 Banque Mondiale (Libération foncière préalable & respect PGES-C).

Visa officiel délivré sous autorité conjointe DGPC / SCET-Tunisie / Banque Mondiale.
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.pdf') ? fileName.replace('.pdf', '_CERTIFIE_RN13.txt') : fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Fichier téléchargé : ${link.download}`);
  };

  const needContent: NeedPanelContent = {
    screenId: 'review-split',
    title: 'Poste de Revue Écran Partagé',
    purpose: 'Ce poste de revue permet d\'examiner le document PDF/plan à gauche tout en formulant et traitant en direct les observations du registre CRD à droite.',
    actors: [
      { letter: 'D', actorName: 'MOE', action: 'Lit la pièce et appose son visa contractuel (A, B, C, D) dans la barre inférieure.' },
      { letter: 'C', actorName: 'AMO', action: 'Consigne ses remarques techniques et vérifie la levée des réserves.' },
      { letter: 'B', actorName: 'Maître d\'ouvrage', action: 'Répond aux commentaires du bailleur et valide les choix de conception.' },
      { letter: 'A', actorName: 'Bailleur', action: 'Peut annoter les documents du DAO soumis à son examen.' },
    ],
    donorRequirement: 'Tout commentaire qualifié de « bloquant » interdit statutairement l\'octroi du visa A ou B tant qu\'une réponse satisfaisante n\'a pas été validée par le relecteur.',
    seeAlso: [
      { label: 'Registre général des commentaires (CRD)', href: '#/revues/crd' },
      { label: 'Fiche du document', href: `#/documents/${doc.id}` },
    ],
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 min-w-0 flex flex-col min-h-0 lg:h-[calc(100vh-8rem)]">
        {/* En-tête compact du poste de revue */}
        <div className="flex items-center justify-between gap-3 p-3 bg-card rounded-t-xl border border-border border-b-0">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate(-1)}
              title="Retour"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DocCode code={doc.code} />
                <RevisionTag revision={doc.currentRevision} />
                <StatusBadge state={doc.state} />
              </div>
              <h2 className="font-bold text-xs sm:text-sm text-foreground truncate mt-0.5">
                {doc.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDownload}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              title="Télécharger la pièce officielle scellée"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Écran partagé : Gauche PDF / Droite Fil de discussion CRD */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 border border-border lg:overflow-hidden bg-background">
          {/* Côté Gauche : Aperçu Technique Réel (7 colonnes) */}
          <div className="lg:col-span-7 bg-slate-900 overflow-hidden relative border-b lg:border-b-0 lg:border-r border-border h-[360px] sm:h-[480px] lg:h-auto">
            <DocumentViewer document={doc} className="h-full border-0 rounded-none" />
          </div>

          {/* Côté Droit : Registre des commentaires CRD & Saisie (5 colonnes) */}
          <div className="lg:col-span-5 bg-card flex flex-col min-h-[400px] lg:h-full lg:overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="font-bold text-xs text-foreground">
                  Observations CRD ({comments.length})
                </span>
              </div>
              {doc.hasBlockingComments && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  Commentaire bloquant ouvert
                </span>
              )}
            </div>

            {/* Liste des commentaires */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {comments.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-10">
                  Aucun commentaire. Le document peut être visé.
                </p>
              ) : (
                comments.map((com) => (
                  <div
                    key={com.id}
                    className={`p-3 rounded-lg border text-xs space-y-2 ${
                      com.severity === 'bloquant' && com.status !== 'clos'
                        ? 'border-rose-300 bg-rose-50/30 dark:bg-rose-950/20'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          com.severity === 'bloquant'
                            ? 'bg-rose-100 text-rose-800'
                            : com.severity === 'majeur'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {com.severity}
                      </span>
                      <span className="font-semibold text-foreground text-[11px]">
                        {com.pageOrArticle}
                      </span>
                    </div>

                    <p className="text-foreground leading-relaxed bg-muted/40 p-2 rounded text-[11px]">
                      {com.commentText}
                    </p>

                    {com.responseText && (
                      <div className="p-2 bg-primary/5 border border-primary/20 rounded text-[11px] space-y-1">
                        <div className="flex items-center justify-between font-bold text-primary">
                          <span>Réponse :</span>
                          <ActorChip actorLetter={com.responseAuthorLetter || 'B'} name={com.responseAuthorName} size="sm" />
                        </div>
                        <p className="text-foreground">{com.responseText}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
                      <ActorChip actorLetter={com.authorLetter} name={com.authorName} size="sm" />
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold capitalize text-primary">{com.status}</span>
                        {com.status !== 'clos' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCloseComment(com.id)}
                            className="h-6 text-[10px] px-1.5 text-emerald-700 hover:bg-emerald-50"
                          >
                            Clôturer
                          </Button>
                        )}
                        {!com.responseText && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAnsweringCommentId(com.id)}
                            className="h-6 text-[10px] px-1.5 text-primary"
                          >
                            Répondre
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Zone de réponse en ligne */}
                    {answeringCommentId === com.id && (
                      <div className="pt-2 space-y-1.5">
                        <Input
                          type="text"
                          placeholder="Saisissez votre réponse technique..."
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          className="h-7 text-xs"
                        />
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAnsweringCommentId(null)}
                            className="h-6 text-[10px]"
                          >
                            Annuler
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAnswerComment(com.id)}
                            className="h-6 text-[10px]"
                          >
                            Envoyer réponse
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Formulaire d'ajout de nouveau commentaire */}
            <form onSubmit={handleAddComment} className="p-3 border-t border-border bg-card space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Input
                  type="text"
                  placeholder="Page / Article..."
                  value={pageArticle}
                  onChange={(e) => setPageArticle(e.target.value)}
                  className="h-8 text-xs"
                />
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="h-8 rounded-md border border-input bg-card px-2 text-xs font-semibold"
                >
                  <option value="bloquant">Bloquant (Interdit publication)</option>
                  <option value="majeur">Majeur</option>
                  <option value="mineur">Mineur</option>
                  <option value="observation">Observation pour mémoire</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Rédiger votre commentaire technique..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="h-8 text-xs flex-1"
                />
                <Button type="submit" size="sm" className="h-8 text-xs font-bold shrink-0">
                  <Send className="h-3.5 w-3.5 mr-1" />
                  Publier
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Barre de Visa Contractuel Inférieure (Fixe) */}
        <div className="p-3 bg-card border border-border border-t-0 rounded-b-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-foreground">Attribution du Visa Contractuel :</span>
            {doc.visa ? <VisaBadge visa={doc.visa} /> : <span className="text-muted-foreground">Aucun visa apposé</span>}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyVisa('A')}
              className="text-xs h-8 font-bold border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              Visa A (Approuvé)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyVisa('B')}
              className="text-xs h-8 font-bold border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Visa B (Avec observations)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyVisa('C')}
              className="text-xs h-8 font-bold border-rose-300 text-rose-700 hover:bg-rose-50"
            >
              Visa C (Refusé, à reprendre)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyVisa('D')}
              className="text-xs h-8 font-bold text-muted-foreground"
            >
              Visa D (Pour info)
            </Button>
          </div>
        </div>
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
