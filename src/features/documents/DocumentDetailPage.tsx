import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { PageHeader } from '@/components/layout/PageHeader';
import { DocCode } from '@/components/shared/DocCode';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { VisaBadge } from '@/components/shared/VisaBadge';
import { RevisionTag } from '@/components/shared/RevisionTag';
import { ActorChip } from '@/components/shared/ActorChip';
import { NoBadge } from '@/components/shared/NoBadge';
import { DueChip } from '@/components/shared/DueChip';
import { TraceChain } from '@/components/shared/TraceChain';
import { NeedPanel, NeedPanelContent } from '@/components/shared/NeedPanel';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DocumentViewer } from '@/components/shared/DocumentViewer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  FileText,
  GitCommit,
  MessageSquare,
  ShieldAlert,
  Send,
  CheckCircle,
  FileCheck,
  AlertCircle,
  Lock,
  Download,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useSession();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(() => db.getDocumentById(id || 'doc-001'));
  const [activeTab, setActiveTab] = useState('preview');
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  if (!doc) {
    return (
      <div className="p-8 text-center space-y-3">
        <h3 className="font-bold text-lg">Document non trouvé</h3>
        <Button onClick={() => navigate('/documents')}>Retour aux documents</Button>
      </div>
    );
  }

  const docComments = db.getCommentsByDocId(doc.id);
  const openBlockingComments = docComments.filter((c) => c.severity === 'bloquant' && c.status !== 'clos');
  const hasBlockers = openBlockingComments.length > 0;

  // Actions métier
  const handleShare = () => {
    const updated = db.updateDocumentState(doc.id, 'Shared', currentUser);
    if (updated) {
      setDoc({ ...updated });
      toast.success(`Le document ${doc.code} a été soumis à la revue (Shared).`);
    }
  };

  const handleVisa = (visaCode: 'A' | 'B' | 'C' | 'D') => {
    if (currentUser.id === doc.authorId) {
      toast.error('Séparation des tâches : vous êtes l\'auteur du document, un autre acteur doit le viser.');
      return;
    }
    const updated = db.visaDocument(doc.id, visaCode, currentUser);
    if (updated) {
      setDoc({ ...updated });
      toast.success(`Visa ${visaCode} attribué avec succès.`);
    }
  };

  const handlePublish = () => {
    if (hasBlockers) {
      toast.error(`Impossible de publier : ${openBlockingComments.length} commentaire(s) bloquant(s) reste(nt) ouvert(s).`);
      return;
    }
    if (doc.noStatus === 'NO_DEMANDEE') {
      toast.error('Publication impossible : la non-objection de la Banque Mondiale est requise et en cours d\'instruction.');
      return;
    }
    const updated = db.publishDocument(doc.id, currentUser);
    if (updated) {
      setDoc({ ...updated });
      toast.success(`Document publié et verrouillé en révision contractuelle ${updated.currentRevision} !`);
    }
  };

  const needContent: NeedPanelContent = {
    screenId: 'document-detail',
    title: 'Fiche Document & Traçabilité',
    purpose: 'Cette fiche présente la traçabilité complète d\'une pièce : ses révisions antérieures, les observations du registre CRD, les visas apposés et son empreinte cryptographique.',
    actors: [
      { letter: 'B', actorName: 'Maître d\'ouvrage', action: 'Valide et publie la révision définitive (C01) une fois les réserves levées.' },
      { letter: 'C', actorName: 'AMO', action: 'Formule ses avis techniques dans le registre des commentaires.' },
      { letter: 'D', actorName: 'MOE', action: 'Appose le visa contractuel (A, B, C ou D).' },
      { letter: 'E', actorName: 'Entreprise', action: 'Consulte les remarques et prépare la révision corrigée.' },
    ],
    donorRequirement: 'La règle contractuelle interdit toute publication d\'une pièce ayant des commentaires bloquants non soldés ou une non-objection en attente.',
    seeAlso: [
      { label: 'Poste de revue avec aperçu partagé', href: `#/revues/${doc.id}` },
      { label: 'Registre des commentaires CRD', href: '#/revues/crd' },
    ],
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0 space-y-5">
        <PageHeader
          title={doc.title}
          subtitle={`Localisation : PK ${doc.pkRange || 'Non spécifié'} • Catégorie : ${doc.categoryLabel} • Créé le ${new Date(doc.createdAt).toLocaleDateString('fr-FR')}`}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              {/* Action 1 : Soumettre à la revue si WIP */}
              {doc.state === 'WIP' && (
                <Button variant="default" size="sm" onClick={handleShare} className="gap-1.5 font-bold">
                  <Share2 className="h-4 w-4" />
                  <span>Soumettre à la revue (Shared)</span>
                </Button>
              )}

              {/* Action 2 : Viser si Shared et habilité */}
              {doc.state === 'Shared' && (currentUser.actor === 'moe' || (currentUser.actor === 'mo' && currentUser.subRole === 'mo_chef')) && (
                <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border">
                  <span className="text-[11px] font-semibold text-muted-foreground px-1 hidden sm:inline">Viser :</span>
                  <Button variant="outline" size="sm" onClick={() => handleVisa('A')} className="h-7 text-xs font-bold text-emerald-700 hover:bg-emerald-50">
                    Visa A
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleVisa('B')} className="h-7 text-xs font-bold text-amber-700 hover:bg-amber-50">
                    Visa B
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleVisa('C')} className="h-7 text-xs font-bold text-rose-700 hover:bg-rose-50">
                    Visa C
                  </Button>
                </div>
              )}

              {/* Action 3 : Publier si B (MO) */}
              {currentUser.actor === 'mo' && doc.state !== 'Published' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowPublishConfirm(true)}
                  disabled={hasBlockers}
                  className="gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  title={hasBlockers ? `Bloqué : ${openBlockingComments.length} commentaire(s) bloquant(s) ouvert(s)` : 'Publier définitivement'}
                >
                  <FileCheck className="h-4 w-4" />
                  <span>Publier la révision</span>
                </Button>
              )}

              {/* Ouvrir Poste de Revue */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/revues/${doc.id}`)}
                className="gap-1.5 text-xs font-semibold"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Poste de Revue</span>
              </Button>
            </div>
          }
        >
          {/* Métadonnées principales et badges */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <DocCode code={doc.code} />
            <RevisionTag revision={doc.currentRevision} />
            <StatusBadge state={doc.state} />
            {doc.visa && <VisaBadge visa={doc.visa} />}
            <NoBadge status={doc.noStatus} />
            <DueChip dueDate={doc.dueDate} />
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <span>Auteur :</span>
              <ActorChip actorLetter={doc.authorLetter} name={doc.authorName} size="sm" />
            </div>
          </div>
        </PageHeader>

        {/* Frise de traçabilité complète */}
        <TraceChain
          currentStage={
            doc.state === 'Published'
              ? 'Preuve'
              : doc.visa
              ? 'Visa'
              : docComments.length > 0
              ? 'Commentaire'
              : 'Revue'
          }
        />

        {/* Alerte si commentaires bloquants ouverts */}
        {hasBlockers && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-900 dark:text-rose-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <div>
                <strong>Publication bloquée :</strong> {openBlockingComments.length} commentaire(s) bloquant(s) non soldé(s) dans le CRD.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('comments')}
              className="text-xs h-7 border-rose-300 text-rose-800 hover:bg-rose-100"
            >
              Voir les commentaires
            </Button>
          </div>
        )}

        {/* Onglets : Aperçu, Révisions, Commentaires CRD, Audit */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:max-w-xl mb-4 h-auto gap-1 p-1 bg-muted/60">
            <TabsTrigger value="preview" className="gap-1.5 font-bold text-xs py-2">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span>Aperçu</span>
            </TabsTrigger>
            <TabsTrigger value="revisions" className="gap-1.5 font-bold text-xs py-2">
              <GitCommit className="h-3.5 w-3.5 shrink-0" />
              <span>Révisions ({doc.revisions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-1.5 font-bold text-xs py-2">
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span>Commentaires ({docComments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5 font-bold text-xs py-2">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>SHA & Audit</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet 1 : Aperçu Document Réel & Schémas */}
          <TabsContent value="preview" className="space-y-4">
            <DocumentViewer document={doc} className="h-[620px]" />
          </TabsContent>

          {/* Onglet 2 : Révisions */}
          <TabsContent value="revisions" className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Historique des révisions successives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {doc.revisions.map((rev) => (
                  <div
                    key={rev.revisionTag}
                    className="p-3.5 rounded-lg border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <RevisionTag revision={rev.revisionTag} />
                        <span className="font-semibold text-xs text-foreground">{rev.fileName}</span>
                        {rev.visaCode && <VisaBadge visa={rev.visaCode} />}
                      </div>
                      <p className="text-xs text-muted-foreground">{rev.note || 'Aucune note'}</p>
                      <p className="font-mono text-[10px] text-muted-foreground break-all">
                        SHA-256 : {rev.sha256}
                      </p>
                    </div>

                    <div className="text-right shrink-0 text-xs text-muted-foreground">
                      <ActorChip actorLetter={rev.uploadedByActor} name={rev.uploadedByName} size="sm" />
                      <p className="text-[10px] mt-1">
                        {rev.uploadedAt || rev.date ? new Date(rev.uploadedAt || rev.date || '').toLocaleString('fr-FR') : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet 3 : Commentaires CRD */}
          <TabsContent value="comments" className="space-y-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Registre des Commentaires et Décisions (CRD)</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/revues/${doc.id}`)}
                  className="text-xs font-semibold"
                >
                  Ajouter un commentaire
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {docComments.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">
                    Aucun commentaire sur cette pièce. Le document est prêt pour le visa.
                  </p>
                ) : (
                  docComments.map((com) => (
                    <div
                      key={com.id}
                      className="p-3.5 rounded-lg border border-border bg-card space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              com.severity === 'bloquant'
                                ? 'bg-red-100 text-red-800'
                                : com.severity === 'majeur'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {com.severity}
                          </span>
                          <span className="font-semibold text-xs text-foreground">
                            {com.pageOrArticle}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary capitalize">{com.status}</span>
                      </div>

                      <p className="text-xs text-foreground leading-relaxed bg-muted/30 p-2 rounded">
                        {com.commentText}
                      </p>

                      {com.responseText && (
                        <div className="p-2.5 rounded bg-primary/5 border border-primary/20 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-primary text-[11px]">
                            <span>Réponse apportée :</span>
                            <span>{com.responseAuthorName} ({com.responseAuthorLetter})</span>
                          </div>
                          <p className="text-foreground leading-relaxed">{com.responseText}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                        <ActorChip actorLetter={com.authorLetter} name={com.authorName} size="sm" />
                        <span>Émis le {new Date(com.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet 4 : Scellement Cryptographique */}
          <TabsContent value="audit" className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Preuves de conformité & Scellement numérique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 bg-muted/40 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Algorithme de hachage :</span>
                    <span className="font-bold">SHA-256 (Norme FIPS 180-4)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Empreinte révision courante :</span>
                    <span className="font-mono text-[11px] text-primary">{doc.revisions[doc.revisions.length - 1]?.sha256}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Statut de verrouillage :</span>
                    <span className="font-semibold text-emerald-600">
                      {doc.state === 'Published' ? 'Verrouillé (Immuable)' : 'Modifiable sous contrôle de version'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Boîte de confirmation de publication */}
        <ConfirmDialog
          open={showPublishConfirm}
          onOpenChange={setShowPublishConfirm}
          title={`Publier définitivement la révision ${doc.currentRevision} ?`}
          description="Une fois publiée, cette pièce deviendra contractuelle et immuable. Toute modification future exigera la création formelle d'une nouvelle révision."
          confirmLabel="Confirmer la publication"
          onConfirm={handlePublish}
        />
      </div>

      <NeedPanel content={needContent} />
    </div>
  );
};
