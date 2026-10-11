import React, { useState } from 'react';
import { useSession } from '@/store/sessionStore';
import { db } from '@/mock/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ActorChip } from '@/components/shared/ActorChip';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isLocked, failedAttempts } = useSession();
  const navigate = useNavigate();

  const [username, setUsername] = useState('mo.chef');
  const [password, setPassword] = useState('Demo#2026');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      navigate('/');
    }
  };

  const handleQuickLogin = (uname: string) => {
    const pwd = uname === 'admin' ? 'Admin#2026' : 'Demo#2026';
    setUsername(uname);
    setPassword(pwd);
    const success = login(uname, pwd);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-4xl space-y-6 animate-fade-in">
        {/* Titre & Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 border border-blue-500/30 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Maquette Statique V2 — Projet Routier RN13
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            GED-RN13
          </h1>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">
            Plateforme de Gestion Documentaire, Suivi des Travaux 2x2 voies et Traçabilité E&S des Bailleurs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Formulaire classique */}
          <Card className="md:col-span-5 bg-card/95 backdrop-blur-md border-slate-700 shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-bold">Connexion sécurisée</CardTitle>
              <CardDescription className="text-xs">
                Entrez vos identifiants ou cliquez sur un profil rapide.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Identifiant
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex: mo.chef"
                    disabled={isLocked}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    Mot de passe
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Demo#2026"
                    disabled={isLocked}
                    required
                  />
                </div>

                {failedAttempts > 0 && (
                  <p className="text-[11px] text-destructive font-semibold">
                    Tentatives infructueuses : {failedAttempts}/5 (verrouillage automatique après 5 échecs)
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full font-bold" disabled={isLocked}>
                  Se connecter
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Raccourcis de connexion rapide aux 14 comptes de démo */}
          <Card className="md:col-span-7 bg-card/95 backdrop-blur-md border-slate-700 shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Accès Rapide Démo (14 comptes par Acteur)</span>
                <span className="text-[11px] font-normal text-muted-foreground">Mot de passe : Demo#2026</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Cliquez sur un profil pour vous connecter directement avec ses droits spécifiques :
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
              {db.users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleQuickLogin(u.username)}
                  className="p-2 rounded-lg border border-border/70 hover:border-primary/50 hover:bg-muted/70 flex items-center justify-between gap-2 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ActorChip actorLetter={u.actorLetter} size="sm" showName={false} />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                        {u.fullName} <span className="font-mono text-[10px] text-muted-foreground">({u.username})</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {u.subRoleLabel} • {u.actorLabel}
                      </p>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 font-semibold shrink-0">
                    Choisir
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400">
          Maquette 100% statique avec persistance locale • Données de simulation RN13 (PK 0+000 à 42+000)
        </div>
      </div>
    </div>
  );
};
