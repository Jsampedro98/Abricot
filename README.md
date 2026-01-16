# Abricot

Application de gestion de projets et de tâches (SaaS B2B).
Ce projet est composé d'une API backend (Node.js/Prisma) et d'une interface frontend (Next.js/React).

##  Fonctionnalités Clés

*   **Authentification sécurisée** : Inscription, connexion via JTW.
*   **Tableau de Bord** : Vue d'ensemble des tâches assignées (Liste & Kanban).
*   **Gestion de Projets** : Création, édition, et tri par urgence (calculé automatiquement).
*   **Gestion des Tâches** : CRUD complet, statuts (À faire, En cours, Terminé), priorités.
*   **Kanban Drag & Drop** : Changement de statut de tâche par glisser-déposer.
*   **Collaboration** : Assignation de tâches, commentaires, rôles (Admin/Contributeur).
*   **IA Suggestive** : Génération automatique de listes de tâches via prompt (Mock/Simulation).

##  Prérequis Technique

*   **Node.js** (v18+)
*   **NPM**
*   **XAMPP** (ou tout serveur MySQL Local) pour la base de données.

##  Installation & Démarrage

Clonez le projet dans votre répertoire de travail (ex: `htdocs` si vous utilisez XAMPP).

### 1. Backend (API)

Le backend gère la logique métier et la base de données. Voici le repo : https://github.com/OpenClassrooms-Student-Center/dev-react-P10

```bash
cd backend

# Installation des dépendances
npm install

# Configuration de la BDD (Assurez-vous que MySQL est lancé)
# Le fichier .env doit contenir votre DATABASE_URL
npx prisma generate
npx prisma db push  # Synchronise le schéma Prisma avec la BDD

# Lancer le serveur de développement
npm run dev
```
> Le serveur backend sera accessible sur `http://localhost:8000`.
> Documentation API Swagger disponible sur `http://localhost:8000/api-docs`.

### 2. Frontend (Client)

L'interface utilisateur Next.js.

```bash
cd frontend

# Installation des dépendances
npm install

# Lancer le serveur de développement
npm run dev
```
> L'application sera accessible sur `http://localhost:3000`.

##  Stack Technique

### Frontend
*   **Framework** : Next.js 16 (App Router)
*   **UI** : React 19, Tailwind CSS v4
*   **State Management** : @tanstack/react-query
*   **Formulaires** : react-hook-form
*   **Drag & Drop** : @hello-pangea/dnd
*   **Icônes** : Lucide React

### Backend
*   **Runtime** : Node.js
*   **Framework** : Express.js
*   **Langage** : TypeScript
*   **ORM** : Prisma Client
*   **Base de données** : MySQL

##  Auteurs

Projet réalisé dans le cadre de la formation OpenClassrooms - Développeur FullStack.
