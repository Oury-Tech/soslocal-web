# 🚀 SOSLocal Web

> Plateforme web de la solution **SOSLocal** — programme **Allô Maître** (MEATFP Guinée).

Plateforme intelligente de dépannage géolocalisé en temps réel pour les services techniques urbains en Guinée. Cette application web complète accompagne l'application mobile React Native et le backend FastAPI.

---

## ✨ Fonctionnalités

### 🎨 Landing page à couper le souffle
- Hero animé avec mockup carte Conakry interactive
- Sections : Features, How it works, Audience, Stats, Testimonials, FAQ, CTA
- Animations Framer Motion fluides
- Design moderne avec icônes Lucide

### 🌓 Thème adaptatif
- **Light** / **Dark** / **System** (suit les préférences OS)
- Design tokens CSS variables
- Toggle élégant avec dropdown

### 🔐 Authentification complète
- Login, Register, Forgot password
- JWT avec auto-refresh
- Persistence locale + protection des routes
- Multi-rôles : Bénéficiaire, Artisan, Opérateur

### 📊 Dashboards multi-rôles

**Bénéficiaire :**
- Accueil avec carte Leaflet temps réel
- Création de demande en 4 étapes
- Suivi des demandes
- Chat avec artisans

**Artisan :**
- Tableau de bord avec toggle disponibilité
- Missions en attente avec accept/refuse
- Revenus avec graphiques Recharts
- Historique des versements

**Opérateur (MEATFP) :**
- Supervision temps réel
- Gestion des artisans
- Statistiques détaillées avec rapports exportables
- Carte de l'écosystème Conakry

### 💬 Chat temps réel
- WebSocket avec reconnexion auto
- Indicateur "est en train d'écrire"
- Statuts lu/non-lu
- Support photos et documents

### 🗺️ Cartographie
- Leaflet + OpenStreetMap
- Markers custom (utilisateur + artisans)
- Popups détaillées
- Filtrage par service

---

## 🛠️ Stack technique

| Couche | Technologie | Rôle |
|--------|------------|------|
| Framework | **Next.js 15** (App Router) | Routing, SSR, API Routes (BFF proxy) |
| Language | **TypeScript** strict | Type safety |
| State | **Zustand 5** | État global (cohérent avec mobile) |
| Data fetching | **TanStack Query 5** | Cache, mutations |
| HTTP Client | **Axios** | Instance avec interceptors JWT |
| Forms | **React Hook Form + Zod** | Validation schémas |
| Styles | **Tailwind CSS** + CSS Variables | Design tokens light/dark |
| Animations | **Framer Motion 11** | Animations fluides |
| Icons | **Lucide React** | Plus de 1000 icônes |
| Theme | **next-themes** | Light/Dark/System |
| Maps | **Leaflet + React-Leaflet** | Carte interactive Conakry |
| Charts | **Recharts** | Graphiques dashboards |
| Toasts | **Sonner** | Notifications |
| Backend | **FastAPI** (Python) | API REST + WebSocket (projet séparé) |

---

## 🚀 Démarrage rapide

### Prérequis
- **Node.js 20+** et npm/pnpm/yarn
- Backend FastAPI optionnel (mode mock disponible)

### Installation

```bash
# Cloner le projet
git clone <repo-url>
cd soslocal-web

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local selon vos besoins

# Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur **http://localhost:3000**

### Mode démo (sans backend)

Par défaut, `NEXT_PUBLIC_MOCK_AUTH=true` est activé dans `.env.example`.
Cela permet de tester l'app **sans avoir besoin du backend FastAPI** :

- Connectez-vous avec **n'importe quel email/mot de passe**
- **Email contenant `artisan`** → rôle technicien
- **Email contenant `operateur`** ou `admin` → rôle opérateur
- Sinon → rôle client

### Mode production (avec backend)

1. Lancer le backend FastAPI sur le port 8000
2. Dans `.env.local` :
   ```env
   NEXT_PUBLIC_MOCK_AUTH=false
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   API_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
   ```
3. Redémarrer `npm run dev`

---

## 📁 Structure du projet

```
soslocal-web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Pages publiques
│   │   ├── layout.tsx            # Layout split-screen
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/              # Pages protégées (AuthGuard)
│   │   ├── layout.tsx            # Sidebar + Topbar
│   │   ├── beneficiaire/
│   │   │   ├── page.tsx          # Accueil avec carte
│   │   │   ├── nouvelle/         # Création demande
│   │   │   └── demandes/         # Mes demandes
│   │   ├── artisan/
│   │   │   ├── page.tsx          # Dashboard artisan
│   │   │   ├── missions/
│   │   │   └── revenus/          # + graphiques
│   │   ├── operateur/
│   │   │   ├── page.tsx          # Supervision
│   │   │   ├── artisans/
│   │   │   └── statistiques/     # Rapports MEATFP
│   │   ├── chat/
│   │   │   ├── page.tsx          # Liste conversations
│   │   │   └── [roomId]/         # Conversation
│   │   └── profile/page.tsx
│   ├── api/[...path]/route.ts    # BFF proxy → FastAPI
│   ├── globals.css               # Design tokens light/dark
│   ├── layout.tsx                # Root layout + Providers
│   └── page.tsx                  # Landing page
│
├── src/
│   ├── types/                    # Types TS partagés
│   ├── lib/
│   │   ├── api/                  # Axios + endpoints
│   │   ├── auth/                 # Token storage
│   │   ├── utils/                # cn, formatters
│   │   └── mock-data.ts          # Fixtures mode démo
│   ├── stores/                   # Zustand stores
│   │   ├── auth.store.ts
│   │   └── request.store.ts
│   ├── hooks/
│   │   ├── useWebSocket.ts       # WebSocket avec auto-reconnect
│   │   └── queries/              # TanStack Query hooks
│   ├── components/
│   │   ├── ui/                   # Button, Input, Card, Badge, Logo…
│   │   ├── landing/              # 9 sections landing page
│   │   ├── layout/               # Sidebar, Topbar, AuthGuard
│   │   └── maps/                 # Carte Leaflet
│   └── providers/                # ThemeProvider, QueryProvider
│
├── public/images/                # Images statiques
├── tailwind.config.ts            # Palette + animations
├── next.config.ts                # Rewrites + images
├── tsconfig.json                 # Paths @/* → src/*
└── package.json
```

---

## 🎨 Système de design

### Palette
- **Brand (bleu marine)** : `#1A3F7A` → 10 nuances (50→900)
- **Accent (turquoise)** : `#00A99D` → 10 nuances (50→900)
- Couleurs sémantiques (`background`, `foreground`, `card`, `muted`, `border`…) avec CSS variables

### Typographie
- **Outfit** (sans) — texte courant
- **Plus Jakarta Sans** (display) — titres

### Animations
- `slide-up`, `slide-down`, `slide-in-right`
- `fade-in`, `scale-in`, `pulse-dot`
- `float`, `gradient`, `shimmer`, `blob`
- Cubic-bezier `(0.16, 1, 0.3, 1)` pour la fluidité

### Composants UI
- `Button` (6 variants, 4 sizes, loading state)
- `Input` (avec icon, label, error, helperText)
- `Card`, `Badge`, `Avatar`, `Spinner`, `Skeleton`
- `Logo` SVG animé sur mesure
- `ThemeToggle` (dropdown light/dark/system)

---

## 🔌 Intégration backend

### Endpoints utilisés
```
POST   /auth/login                  Connexion
POST   /auth/register               Inscription
POST   /auth/refresh                Refresh JWT
GET    /auth/me                     Profil courant
GET    /services                    Liste services
GET    /technicians/nearby          Artisans à proximité (PostGIS)
GET    /requests                    Mes demandes
POST   /requests                    Créer demande
POST   /requests/{id}/accept        Accepter mission
POST   /requests/{id}/complete      Terminer mission
GET    /chat/rooms/{id}/messages    Messages d'une conversation
POST   /payments                    Initier paiement
POST   /reviews                     Évaluer
```

### Proxy BFF
Le fichier `app/api/[...path]/route.ts` proxifie toutes les requêtes `/api/backend/*` vers FastAPI. Utile pour :
- Contourner CORS
- Cacher l'URL backend en production
- Ajouter du middleware côté Next.js

---

## 📜 Scripts disponibles

```bash
npm run dev          # Serveur de développement (avec Turbo)
npm run build        # Build de production
npm run start        # Lance le build de production
npm run lint         # ESLint
npm run type-check   # Vérification TypeScript stricte
```

---

## 🧪 Tester l'application

### Comptes de démo (mode mock)

| Email | Mot de passe | Rôle | Redirection |
|-------|-------------|------|-------------|
| `client@test.gn`      | n'importe quoi | Bénéficiaire | `/beneficiaire` |
| `artisan@test.gn`     | n'importe quoi | Artisan      | `/artisan` |
| `operateur@meatfp.gn` | n'importe quoi | Opérateur    | `/operateur` |

### Parcours de test recommandé

1. **Landing page** → toggle dark/light, scroll les sections
2. **Inscription** → `/register?role=technician` pour pré-sélectionner artisan
3. **Dashboard bénéficiaire** → carte interactive, filtre services
4. **Nouvelle demande** → assistant 4 étapes complet
5. **Dashboard artisan** → toggle disponibilité, missions en attente
6. **Revenus** → graphiques BarChart + AreaChart
7. **Supervision opérateur** → PieChart + LineChart + carte
8. **Chat** → conversation avec typing indicator

---

## 📦 Build de production

```bash
npm run build
npm run start
```

Le serveur démarre sur le port 3000 par défaut. Pour déployer :
- **Vercel** (recommandé) : `vercel --prod`
- **Docker** : un Dockerfile peut être ajouté
- **VPS** : `pm2 start npm --name soslocal-web -- start`

---

## 👤 Auteur

**Mamadou Oury Diallo**
- Matricule : IN21243
- UKAG/EPI — 15ème Promotion 2021-2026
- Génie Informatique · Développement Logiciel
- 📧 ourying2003@gmail.com
- 📞 +224 627 30 60 60

**Consultant principal :** M. Lancine Saran DAMANG (Master, Doctorant)

---

## 📄 Licence

Projet académique réalisé dans le cadre du mémoire de fin d'études à l'UKAG/EPI.
Programme officiel **Allô Maître** du **MEATFP** de Guinée.

---

## 🙏 Remerciements

- Université Kofi Annan de Guinée (UKAG)
- École Polytechnique des Ingénieurs (EPI)
- Ministère de l'Éducation Nationale, de l'Alphabétisation, de l'Enseignement Technique et de la Formation Professionnelle (MEATFP)
- M. Mohamed Kaba Souaré (Coordinateur Allô Maître)
- M. Hassimiou Souaré (Directeur du projet)
