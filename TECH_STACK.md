# 🛠️ V-Org — Technical Stack & Architecture

---

## 🧱 Project Type

A **Single-Page Application (SPA)** with a **serverless cloud backend**, built entirely with modern web technologies. No traditional server or REST API — all real-time sync is handled through Firebase.

---

## ⚙️ Core Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | UI component library and state management |
| **TypeScript** | Strict typing for all components, services, and data models |
| **Vite** | Blazing-fast dev server and production bundler (ESM-first) |
| **Framer Motion** | Declarative animations — page transitions, stagger effects, AnimatePresence |
| **Vanilla CSS** | Custom design system with CSS variables, gradients, glassmorphism |
| **Leaflet.js** | CDN (via `L` global) | Interactive real-time GPS maps with custom markers and geofence circles |
| **react-snowfall** | Dynamic ambient snowfall particle effect for UI ambiance |

### Backend / Cloud Services

| Service | Provider | Purpose |
|---|---|---|
| **Firebase Authentication** | Google Firebase | Secure email/password auth with real-time session management via `onAuthStateChanged` |
| **Cloud Firestore** | Google Firebase | NoSQL real-time database for all events, volunteers, applications, funds, alerts |

---

## 🗂️ Project Structure

```
d:\VORG\
├── App.tsx                  # Root app — routing logic, auth syncing, all state
├── index.tsx                # React entry point
├── types.ts                 # All TypeScript interfaces and enums
├── constants.ts             # App-level constants
├── volunteerConstants.ts    # Volunteer event/mission data constants
│
├── components/
│   ├── Home.tsx             # Landing page with CTAs
│   ├── OrgLogin.tsx         # Organization authentication form
│   ├── OrgDashboard.tsx     # Org command center — events, apps, volunteer registry
│   ├── HostEvent.tsx        # Event creation with AI recruitment suggestion
│   ├── RecruitmentSummary.tsx  # Review and confirm AI-staffed event
│   ├── EmergencyCrisis.tsx  # Emergency alert broadcast with live GPS capture
│   ├── FundRaise.tsx        # Dual fund module — social + emergency
│   ├── VolunteerLogin.tsx   # Volunteer login form
│   ├── VolunteerRegistration.tsx  # Signup with image upload support
│   ├── LanguageSelect.tsx   # Multilingual onboarding selection
│   ├── BehavioralQuiz.tsx   # Commitment quiz (English/Hindi/Tamil)
│   ├── ExperienceVerification.tsx  # AI-scored experience essay + image links
│   ├── VolunteerDashboard.tsx  # Mission hub, GPS tracking HUD, SOS
│   └── VolunteerProfile.tsx # Volunteer rank, badges, history
│
├── services/
│   ├── firebase.ts          # Firebase app + auth + db initialization
│   ├── firebaseConfig.ts    # Firebase project credentials (via env vars)
│   ├── firebaseService.ts   # All Firestore operations (CRUD + real-time listeners)
│   ├── geminiService.ts     # Gemini API calls for recruitment suggestions + essay scoring
│   ├── imageService.ts      # Image upload/handling utilities
│   ├── errorHandler.ts      # Centralized error logging + Firebase error message mapping
│   └── config.ts            # Environment variable validation
│
├── context/
│   └── ToastContext.tsx     # Global toast notification system (success/error/info)
│
├── utils/
│   ├── geoUtils.ts          # Haversine distance formula for geofence calculation
│   └── validation.ts        # Form input validation utilities
│
├── vite.config.ts           # Vite config — port via process.env.PORT, path aliases
├── package.json             # Scripts: dev, dev:org (port 3000), dev:vol (port 3001)
└── .env.local               # VITE_GEMINI_API_KEY, Firebase config keys
```

---

## 🔥 Firebase Architecture

### Collections in Firestore

| Collection | Document Key | Key Fields |
| `organizations` | `uid` (Firebase Auth UID) | `name`, `email`, `number`, `address` |
| `volunteers` | `uid` | `fullName`, `rank`, `badges[]`, `appliedEvents[]`, `profileImages[]` |
| `events` | Auto ID | `eventName`, `orgId`, `liveLocation`, `acceptedVolunteers[]`, `liveLocations{}`, `radiusKm` |
| `applications` | Auto ID | `volunteerId`, `eventId`, `role`, `passcode`, `status` |
| `funds` | Auto ID | `raiserName`, `description`, `amountNeeded`, `crisisType`, `affectedPeople` |
| `alerts` | Auto ID | `volunteerId`, `eventId`, `location`, `fullName`, `type: 'SOS'`, `status` |

### Real-Time Listeners Used
- `onAuthStateChanged` — determines role (org vs volunteer) on every auth state change
- `onSnapshot` on `events` — live mission hub on volunteer dashboard
- `onSnapshot` on `applications` — live application review on org dashboard
- `onSnapshot` on `volunteers` — live personnel registry on org dashboard

---

## 🤖 AI Integration — Google Gemini

---!!! FOR NOW WE USE API CALLS, IN FUTURE WE WILL USE ON-DEVICE AI MODELS!!!---

### Feature 1: AI Volunteer Recruitment (`getVolunteerSuggestions`)
- **Model**: `gemini-1.5-flash`
- **Input**: Event name, theme, venue, expected attendees, area size, required skill departments
- **Output**: JSON array of `{ name, suggestedCount, description }` — one object per department
- **Fallback**: If API key is missing, falls back to 1 volunteer per 50 attendees formula

### Feature 2: Experience Essay Scoring (`analyzeVolunteerExperience`)
- **Model**: `gemini-1.5-flash`
- **Input**: Free-text essay about volunteer experience
- **Output**: Integer score 0–100 based on depth, impact, and skills described
- **Use**: Score maps to additional star rating (max 5 stars) and rank upgrade

---!!! ---------------------------------------------------------------------------------------------!!!---

## 🗺️ GPS & Geofencing

- Uses browser's `navigator.geolocation.getCurrentPosition()` and `watchPosition`-style polling
- Location pushed to Firestore every **10 seconds** via `updateVolunteerLocation()`
- Distance calculated using the **Haversine formula** (`geoUtils.ts`) — accurate for any two GPS coordinates on Earth
- Geofence boundary = mission `radiusKm` × 1000 + 100m operational buffer
- Status shown as: `INSIDE` (green) / `OUTSIDE` (red) / `OFFLINE` (grey)
- Map rendered with **Leaflet.js** — shows circle geofence zone, mission marker, and volunteer marker

---

## 🔐 Authentication & Security

- Firebase Auth email/password with `signInWithEmailAndPassword` and `createUserWithEmailAndPassword`
- Auto sign-in detection via `onAuthStateChanged` — persists across page refreshes
- Role detection: on auth, app first checks Firestore `organizations/{uid}` then `volunteers/{uid}` to determine role
- Logout clears all localStorage keys: `vorg_user_email`, `vorg_org_data`, `vorg_user_data`, etc.
- Firestore security rules enforce read/write access per collection

---

## 🎨 UI/UX Design System

- **Color Palette**: Dark navy background (`#050510`), sage green primary (`#829672`), glassmorphic panels
- **Typography**: System font stack with `font-black` for headers, tracking-tight for UI chrome
- **Animations**: Framer Motion with `initial → animate → exit` patterns on every major view
- **Micro-interactions**: `whileTap` scale on buttons, stagger children animations on grids, `AnimatePresence` for modal transitions
- **Responsive**: Mobile-first grid with `md:` and `lg:` breakpoints throughout

---

## 🧪 Multi-Port Demo Setup

For demonstrations showing both roles simultaneously:

```bash
# Terminal 1 — Organizer
npm run dev:org
# Open: http://localhost:3000?view=organizer

# Terminal 2 — Volunteer
npm run dev:vol
# Open: http://localhost:3001?view=volunteer
```

The `?view=` URL parameter prevents Firebase auth state from auto-redirecting tabs to the same role.

## 🌍 Environment Variables Required

Create a `.env.local` file at the project root:

```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

*© 2025 V-Org — Distributed Community Intelligence Network*
