# DispatchX — Resilient Logistics & Inventory Management System

> **Offline-first, crisis-resilient web platform for smart logistics chain and warehouse management.**

---

## Overview

DispatchX is a decentralized, offline-first web system for managing logistics chains and inventory under conditions of constrained supply and unstable connectivity.

The core architectural goal is **optimizing the distribution of limited resources**. Instead of classical FIFO, the system uses a deterministic mathematical model — the **Smart Triage Engine** — to dynamically calculate request priority based on stock burn rate, logistics topology, and time metrics.

The system is designed for high adaptability (**Context-Aware UX**) across device form factors — from dispatcher workstations to mobile terminals for drivers in areas with unreliable internet.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18+ (Vite) |
| State Management | React Context API (`GlobalStore.jsx`, `AuthContext.jsx`) |
| Routing | React Router + `ProtectedRoute.jsx` |
| GIS / Maps | Leaflet / React-Leaflet + OpenStreetMap |
| Offline | Service Workers + Workbox (Stale-While-Revalidate) |
| PWA Install | Custom `UsePWAInstall.js` hook |

---

## Architecture

### Offline-First (PWA)

To support warehouse and in-transit operation without connectivity:

- **Service Workers & Workbox** — pre-caches the app shell; API requests use *Stale-While-Revalidate*.
- **`UseOffline.js`** — global network state listener; triggers UI warnings and blocks server-dependent mutations when offline.
- **`UsePWAInstall.js`** — manages the `beforeinstallprompt` lifecycle, enabling installation as a native app on Windows / Android / iOS.

---

### Smart Triage Engine (`src/utils/priority.js`)

The core computational module. Generates an aggregated **TotalScore** for each logistics transaction. Requests with the highest score are automatically promoted to the top of the dispatcher queue.

```
TotalScore = BaseScore + WaitTimeBonus + BurnRateOverride + DeferralBonus + SpatialBonus
```

| Component | Logic |
|---|---|
| **BaseScore** | Status-based initialization: Normal `+10`, Elevated `+50`, Critical `+100` (quota-gated) |
| **WaitTimeBonus** | Starvation prevention — `+2 pts` per full hour in queue since `request.timestamp` |
| **BurnRateOverride** | Proactive depletion control — if Time-to-Empty < 2h **or** stock < 20 units → force `+200 pts`, overriding base status |
| **DeferralBonus** | Game-theory cooperative incentive — if node previously yielded (`hasDeferred: true`) → `+30 pts` on next iteration |
| **SpatialBonus** | Route topology optimization — if request lies on an already-dispatched vehicle's route vector (`routeMatch: true`) → `+80 pts` to maximize fleet utilization |

> **BurnRateOverride** is the most critical trigger — it completely bypasses priority classifications when a stock depletion event is imminent.

---

### Role-Based Access Control (RBAC)

`MainLayout.jsx` dynamically mounts different workspaces based on the authenticated `role`.

#### 🖥️ Dispatcher (System Admin / Logistician)
**High-Density "War Room" Dashboard**
- **Global Radar** — interactive map with real-time vehicle digital twins; coordinates recalculate every 200ms along polylines for accurate ETA.
- **Fleet Management** — manifest builder with max-capacity validation (Capacity Bar).
- **Global Warehouse** — synchronized SKU table with per-hub distribution (e.g., *Lviv West Hub*, *Odesa Port Hub*) and availability status.

#### 📱 Driver (Expeditor)
**Mobile/Tablet-first HUD** — minimal cognitive load.
- Active manifest navigation with large confirmation controls.
- **SOS Crisis Protocol** — async issue report that fires an `issue_reported_toast` event in the dispatcher's UI, enabling immediate rerouting of a reserve vehicle.

#### 🏭 Hub Representative (Customer / Recipient)
**B2B e-Commerce Portal**
- SKU catalog with nearest warehouse location.
- **Cut-off Timer** — order lock logic; prevents mutation of a request object once the dispatcher has approved a manifest (`status: "Locked"`).

---

## Project Structure

```
├── public/                # Static assets, PWA manifest (icons, favicon.svg)
├── src/
│   ├── assets/            # Graphics and illustrations
│   ├── components/        # Base UI components (Button.jsx, StatusBadge.jsx, DeliveryCard.jsx)
│   ├── constants/         # Global system constants (routes.js, statuses.js)
│   ├── context/           # Global state providers (GlobalStore.jsx, AuthContext.jsx)
│   ├── data/              # Mock data for local dev & testing (mockData.js)
│   ├── features/          # Isolated business modules (Map, Dashboards, Auth)
│   ├── hooks/             # Custom React hooks (UseOffline.js, UsePWAInstall.js)
│   ├── layouts/           # Page wrappers (MainLayout.jsx, AuthLayout.jsx)
│   └── utils/             # Pure JS functions & algorithms (priority.js)
├── index.html             # Entry point
└── package.json           # Dependencies & scripts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository_url>
cd dispatchx

# Install dependencies
npm install
```

### Development

```bash
# Start dev server with HMR
npm run dev
```

### Production Build

```bash
# Build for production (generates Service Workers via Workbox)
npm run build

# Preview the production build locally
npm run preview
```

---

## Roadmap

- [ ] Real backend integration (REST / WebSocket)
- [ ] Persistent offline queue with background sync
- [ ] Driver GPS telemetry (native Geolocation API)
- [ ] Multi-language support (i18n)
- [ ] Unit tests for Smart Triage Engine (`priority.js`)

---

## License

[MIT](LICENSE)
