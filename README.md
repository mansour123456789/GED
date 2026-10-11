# GED-RN13 V2 — Maquette Statique Haute Fidélité
## Projet Routier de Mise à 2x2 Voies (RN13 — 42 km — 3 Lots)
### Environnement Commun de Données (CDE) conforme ISO 19650 & Sauvegardes Bailleurs de Fonds

---

## 1. Présentation du Projet & Objectif

**GED-RN13 V2** est une application web de démonstration 100 % statique conçue pour illustrer, expliquer et valider l'ensemble des besoins métiers d'un grand projet d'infrastructure de génie civil : le doublement et la modernisation de la route nationale **RN13** sur 42 kilomètres (Lots 1, 2 et 3).

L'application intègre l'ensemble des flux documentaires, contractuels, techniques, financiers et socio-environnementaux entre les **5 acteurs contractuels** (14 comptes rôles démo) et respecte les standards de la **Banque Mondiale** et de la **BEI**.

### Principales Caractéristiques Métier :
- **Cycle de vie documentaire normalisé (ISO 19650)** : États CDE (`WIP`, `Shared`, `Published`, `Archived`), codification stricte (`RN13-L01-PEC-CCTP-0001-P02`), empreintes d'intégrité **SHA-256**.
- **Circuit de validation & Visas** : Visas MOE (**A** Approuvé sans réserve, **B** Approuvé avec réserves, **C** Non approuvé, **D** Information).
- **Registre des Commentaires (CRD)** : Discussion collaborative avec détection automatique des **commentaires bloquants** interdisant la publication formelle.
- **Circuit de Non-Objection (ANO) Bailleurs** : Constitution de transmittal groupé et instruction formelle par le bailleur.
- **Conditions préalables de démarrage (Gates)** : Blocage physique des sections tant que les libérations d'emprises (PAR), le PAQ, le PGES-E et le PGT ne sont pas validés.
- **Qualité & Laboratoire** : Gestion des fiches de non-conformité (**NCR**) et essais géotechniques (Proctor, CBR, équivalent de sable, écrasement béton).
- **HSE & Compte à rebours 48h** : Déclaration des incidents de chantier avec compte à rebours réglementaire de notification au Bailleur.
- **Décomptes mensuels des travaux (IPC)** : Cycle `Soumis` → `Certifié (MOE)` → `Approuvé (MO)` → `Payé`.
- **Volet Social & Sauvegardes E&S** :
  - **PAR** (Plan d'Action de Réinstallation) : Ménages PAP, calcul des compensations au coût de remplacement, protocoles d'accord et libération d'emprise.
  - **MGP** (Mécanisme de Gestion des Plaintes) : Guichet citoyen avec engagement de traitement SLA.
  - **Module VBG restreint** : Espace confidentiel anonymisé accessible exclusivement au spécialiste GRM (`mo_grm`).
- **Piste d'Audit & Scellement Cryptographique** : Traçabilité inaltérable de chaque événement.
- **Panneau pédagogique « Besoin Métier »** sur chaque écran (raccourci clavier `?`).

---

## 2. Démarrage Rapide sur Docker

L'application est conteneurisée avec un build multi-étapes (Node 20 Alpine pour la compilation Vite + Nginx 1.27 Alpine pour le service statique optimisé).

### Lancement standard (Production Statique)

Ouvrez un terminal dans le dossier `GED-RN13-V2` et lancez :

```bash
docker compose up --build
```

L'application est immédiatement accessible dans votre navigateur à l'adresse :
👉 **[http://localhost:3000](http://localhost:3000)**

Pour arrêter le conteneur :
```bash
docker compose down
```

### Lancement en mode Développement interactif (Hot-Reload)

```bash
docker compose --profile dev up
```
L'application en développement sera servie sur **[http://localhost:5173](http://localhost:5173)**.

---

## 3. Lancement Local sans Docker (Optionnel)

Si vous disposez de Node.js (v18+) installé localement :

```bash
# Installation des dépendances
npm install

# Lancement du serveur Vite de développement
npm run dev
```

Puis ouvrez **[http://localhost:5173](http://localhost:5173)**.

---

## 4. Matrice des 5 Acteurs & 14 Comptes Démo

L'application propose un sélecteur instantané **« Voir en tant que... »** dans la barre supérieure permettant de changer de rôle en 1 clic sans ressaisir d'identifiants. 

En cas de connexion manuelle sur `/login` :
- Mot de passe standard : **`Demo#2026`**
- Mot de passe administrateur (`admin`) : **`Admin#2026`**

| Acteur | Couleur | Identifiant | Nom complet | Rôle & Habilitation principale |
| :--- | :--- | :--- | :--- | :--- |
| **A · Bailleur** | Ambre `#B45309` | `ba.sp` | **Amel Dridi** | Chargée de projet Banque Mondiale (Avis de Non-Objection) |
| **A · Bailleur** | Ambre `#B45309` | `ba.es` | **Thomas Laurent** | Spécialiste Environnemental & Social Bailleur |
| **B · Maître d'Ouvrage** | Bleu `#1D4ED8` | `mo.chef` | **Hichem Gharbi** | Chef de projet MO (Publication officielle & Ordonnancement) |
| **B · Maître d'Ouvrage** | Bleu `#1D4ED8` | `mo.es` | **Sami Ben Ali** | Spécialiste E&S & Suivi PGES |
| **B · Maître d'Ouvrage** | Bleu `#1D4ED8` | `mo.foncier` | **Leila Trabelsi** | Responsable Libération des Emprises & PAR |
| **B · Maître d'Ouvrage** | Bleu `#1D4ED8` | `mo.grm` | **Fatma Mansour** | Responsable MGP & Traitement confidentiel VBG |
| **B · Maître d'Ouvrage** | Bleu `#1D4ED8` | `admin` | **Karim Ben Salah** | Administrateur Système & Audit Cryptographique |
| **C · AMO** | Vert `#15803D` | `amo.dc` | **Rim Cherif** | Gestionnaire documentaire (Contrôle complétude 2j) |
| **C · AMO** | Vert `#15803D` | `amo.ing` | **Mehdi Zaoui** | Ingénieur Chaussées & Ouvrages d'art |
| **C · AMO** | Vert `#15803D` | `amo.es` | **Yasmine Kefi** | Experte Sauvegardes Environnementales & Sociales |
| **D · MOE Contrôle** | Violet `#7E22CE` | `moe.chef` | **Walid Jaziri** | Chef de mission MOE (Émission Visas A, B, C, D) |
| **D · MOE Contrôle** | Violet `#7E22CE` | `moe.labo` | **Anis Khemir** | Responsable Laboratoire & Essais géotechniques |
| **D · MOE Contrôle** | Violet `#7E22CE` | `moe.hse` | **Nadia Toumi** | Responsable Sécurité Chantier & Alertes 48h |
| **E · Entreprise** | Cyan `#0E7490` | `ent.chef` | **Mourad Bouzid** | Directeur des Travaux (Dépôt plans, soumission IPC) |
| **E · Entreprise** | Cyan `#0E7490` | `ent.qse` | **Khaled Rebai** | Responsable QSE Chantier & Traitement des NCR |

---

## 5. Scénario Guidé Interactif (12 Étapes Clés)

Un scénario pédagogique en **12 étapes** est intégré directement à l'application. Vous pouvez le déclencher à tout moment via le bouton **Aide (Coachmark)** ou dans le menu de votre avatar :

1. **Cockpit DAO & Conception (MO - B)** : Examen de la complétude du dossier d'appel d'offres du Lot L03.
2. **Dépôt d'une pièce technique normalisée** : Assistant d'import en 4 étapes avec calcul SHA-256 et nomenclature normalisée.
3. **Fiche Document & Distribution (WIP → Shared)** : Notification automatique des vérificateurs C, D et A.
4. **Contrôle de complétude formelle (AMO - C)** : Vérification documentaire sous 2 jours ouvrés.
5. **Poste de revue technique (MOE - D)** : Écran partagé PDF + Formulaire de visa + Commentaire bloquant.
6. **Levée d'observation & Discussion collaborative (MO - B)** : Réponse contradictoire et levée du blocage.
7. **Demande d'Avis de Non-Objection (MO → Bailleur)** : Constitution du bordereau officiel avec transmittal sécurisé.
8. **Délivrance de la Non-Objection (Bailleur - A)** : Accord formel de la Banque Mondiale avec référence de courrier.
9. **Publication officielle & Passage en révision contractuelle C01** : Verrouillage et passage à l'état `Published`.
10. **Soumission du Décompte Mensuel Travaux N°04 (Entreprise - E)** : Décompte net de 1 245 800 TND avec attachements.
11. **Certification du Décompte & Alerte Incident 48h (MOE - D)** : Vérification métrique et alerte incident critique.
12. **Approbation de paiement & Génération du Rapport d'État consolidé (MO / AMO)** : Clôture du cycle et transmission au bailleur.

---

## 6. Moteur d'Alertes Statique & Persistance

- **Moteur d'alerte périodique** : Un compte à rebours simule l'arrivée d'alertes réglementaires (configurable dans `/config/config.js` via `ALERT_INTERVAL_MS`). Vous pouvez également cliquer sur **« Simuler une alerte »** pour tester les toasts instantanément.
- **Persistance locale** : Toutes vos actions (création de documents, commentaires levés, visas émis, validation de rapports) sont sauvegardées dans le `localStorage` de votre navigateur sous la clé **`gedrn13_db_v2`**.
- **Réinitialisation usine** : Le bouton présent dans le bandeau inférieur permet de restaurer le jeu de données initial à tout moment.

---

## 7. Structure du Répertoire

```
GED-RN13-V2/
├── Dockerfile                  # Build multi-stage Node.js 20 + Nginx 1.27
├── docker-compose.yml          # Déploiement port 3000:80 et profil dev 5173
├── nginx.conf                  # Configuration Nginx avec fallback SPA
├── package.json                # Dépendances React 18, Tailwind, Lucide, Recharts
├── config/
│   └── config.js               # Paramètres injectables à chaud sans rebuild
├── public/
│   ├── config.js
│   ├── favicon.svg
│   └── samples/                # Fichiers réels de démonstration (PDF, plans, tableurs)
└── src/
    ├── types/                  # Définitions TypeScript strictes des 5 acteurs
    ├── mock/                   # Base de données locale (db.ts) & graines JSON
    ├── store/                  # Contextes (Session, Thème, Langue, Alertes, Guide)
    ├── components/
    │   ├── ui/                 # Composants d'interface (Radix UI + Tailwind)
    │   ├── shared/             # ActorChip, StatusBadge, VisaBadge, NeedPanel, etc.
    │   └── layout/             # Topbar, Sidebar, Breadcrumb, PageHeader, AppLayout
    ├── features/               # Modules fonctionnels par domaine métier
    │   ├── auth/               # Connexion & Fiche Profil
    │   ├── home/               # 5 Tableaux de bord personnalisés par acteur
    │   ├── tasks/              # Gestionnaire de tâches & relances
    │   ├── documents/          # Liste, Dépôt Wizard et Fiche détaillée
    │   ├── review/             # Split-Screen PDF/Visa, Registre CRD, Non-Objection
    │   ├── conception/         # Matrice DAO 12 pièces
    │   ├── passation/          # Jalons de passation des marchés
    │   ├── execution/          # Jalons (Gates), Qualité NCR, Incidents HSE, Décomptes IPC
    │   ├── social/             # PAR foncier, Plaintes MGP, Module restreint VBG
    │   ├── reports/            # Rapports d'état consolidés (RPT-ETA, RPT-ES)
    │   ├── admin/              # Annuaire des 14 comptes & Piste d'audit SHA-256
    │   ├── alerts/             # Centre de notifications & simulateur d'alertes
    │   ├── search/             # Moteur de recherche globale transverse
    │   └── common/             # Page 404 (Voie barrée)
    ├── routes.tsx              # HashRouter complet avec routes canoniques
    ├── App.tsx                 # Assemblage des providers
    └── main.tsx                # Point d'entrée React 18
```
