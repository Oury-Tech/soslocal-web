# SOSLocal Web — Architecture Next.js

## Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript strict
- **State**: Zustand (cohérent avec mobile)
- **Data fetching**: TanStack Query v5 (cohérent avec mobile)
- **Styles**: Tailwind CSS + CSS Variables
- **API Client**: Axios (cohérent avec mobile)
- **Formulaires**: React Hook Form + Zod
- **Temps réel**: WebSocket natif + hook custom
- **Auth**: JWT (access + refresh token, cohérent avec backend FastAPI)
- **Maps**: Leaflet (SSR-safe)

## Structure
```
soslocal-web/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Layout avec sidebar
│   │   ├── beneficiaire/
│   │   │   ├── page.tsx          # Accueil bénéficiaire
│   │   │   ├── demandes/page.tsx # Mes demandes
│   │   │   └── nouvelle/page.tsx # Créer une demande
│   │   ├── artisan/
│   │   │   ├── page.tsx          # Dashboard artisan
│   │   │   ├── missions/page.tsx # Mes missions
│   │   │   └── revenus/page.tsx  # Suivi revenus
│   │   ├── operateur/
│   │   │   ├── page.tsx          # Dashboard supervision
│   │   │   ├── artisans/page.tsx
│   │   │   └── statistiques/page.tsx
│   │   └── chat/
│   │       └── [roomId]/page.tsx
│   ├── api/                      # API Routes Next.js (proxy/BFF)
│   │   └── [...path]/route.ts    # Proxy vers FastAPI
│   ├── globals.css
│   └── layout.tsx
│
├── src/
│   ├── types/                    # Types centralisés (partagés mobile)
│   │   ├── index.ts
│   │   ├── user.types.ts
│   │   ├── request.types.ts
│   │   ├── technician.types.ts
│   │   ├── payment.types.ts
│   │   └── websocket.types.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── axios.ts          # Instance Axios configurée
│   │   │   └── endpoints.ts      # Constantes endpoints
│   │   ├── auth/
│   │   │   └── token.ts          # Gestion JWT
│   │   └── utils/
│   │       ├── cn.ts             # clsx + tailwind-merge
│   │       └── format.ts         # formatters GNF, date, distance
│   │
│   ├── stores/                   # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── request.store.ts
│   │   └── ws.store.ts
│   │
│   ├── hooks/                    # Hooks custom
│   │   ├── queries/              # TanStack Query hooks
│   │   │   ├── useRequests.ts
│   │   │   ├── useTechnicians.ts
│   