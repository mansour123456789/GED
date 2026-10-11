import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Compass, Home, Search, AlertTriangle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full border-border text-center p-6 shadow-lg">
        <CardContent className="space-y-4 pt-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-foreground">Erreur 404 — Voie barrée</h1>
            <p className="text-xs text-muted-foreground mt-1">
              La section ou le document demandé sur la RN13 est introuvable ou en cours d'aménagement.
            </p>
          </div>

          <div className="bg-muted/40 p-3 rounded-md text-[11px] text-muted-foreground font-mono">
            PK Inconnu • Déviation recommandée vers le Tableau de bord
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-xs gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour arrière
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/')}
              className="text-xs bg-primary text-primary-foreground gap-1.5"
            >
              <Home className="h-3.5 w-3.5" />
              Accueil du projet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
