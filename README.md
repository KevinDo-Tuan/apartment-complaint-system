#  Apartment Complaint System

> A decentralized apartment complaint management platform built on the **Internet Computer** blockchain. Tenants submit complaints, hosts track and resolve them — all with full transparency and immutability.

---

## Overview

The **Apartment Complaint System** is a full-stack decentralized application (dApp) that streamlines communication between apartment tenants and property hosts. Instead of complaints getting lost in email threads or verbal agreements, every complaint is stored on-chain with a verifiable audit trail.

**Who is it for?**

| Role | Description |
|------|-------------|
| **Hosts** | Property managers or landlords who create apartment listings and resolve tenant complaints |
| **Tenants** | Residents who submit, track, and follow up on maintenance and issue reports |
| **Visitors** | Anyone can browse all complaints in read-only mode without signing in |

**Why on the Internet Computer?**

- **Immutable records** — complaint history cannot be altered or deleted by anyone except the original author (and only while unresolved)
- **No central authority** — data is stored in a canister smart contract, not on a private server
- **Decentralized identity** — login via Internet Identity; no passwords, no email accounts

---

## Features

###  Host Features
- Register as a host with a display name
- Create and manage multiple apartment properties (name + address)
- View a dedicated **Host Dashboard** with per-apartment complaint views
- Filter complaints by status (Open / In Progress / Resolved), category, priority, or search term
- **Update complaint status** — move complaints from Open → In Progress → Resolved
- Add **resolution notes** when marking a complaint resolved
- Reopen previously resolved complaints if needed
- View real-time complaint statistics per apartment (total, open, in-progress, resolved)
- Click stat cards to instantly filter complaints by that status

###  Tenant Features
- Register as a tenant and select which apartment you live in
- Submit complaints with:
  - Title and detailed description
  - **Category**: Maintenance, Noise, Cleanliness, Safety, Other
  - **Priority**: Low, Medium, High
- View all complaints on the public **Complaint Board**
- Filter and search complaints across all apartments
- Switch between "All Complaints" and "My Complaints" tabs
- Track the status of your own complaints with a visual progress timeline
- Read resolution notes left by the host
- Delete your own unresolved complaints
- View your full complaint history in your **Profile Page** with statistics

### General Features
- **Internet Identity authentication** — secure, privacy-preserving login
- **Read-only public access** — visitors can browse all complaints without signing in
- **Registration modal** — first-time users are prompted to choose a role (Host or Tenant)
- **Real-time stats bar** — total, open, in-progress, and resolved counts on the complaint board
- **Advanced filtering** — filter by status, category, priority, and apartment simultaneously
- **Sort options** — newest, oldest, highest priority, lowest priority
- **Status timeline** — visual three-step progress indicator per complaint
- **Skeleton loading states** — polished loading experience throughout
- **Responsive design** — works on mobile, tablet, and desktop
- **Toast notifications** — success and error feedback for all actions
- **Empty states** — helpful guidance when no data is present

---

## User Flows

### 1. Host Setup Flow

```
1. Visit the app and click "Sign in with Internet Identity"
2. Authenticate using Internet Identity (biometrics or security key)
3. Registration modal appears → select "Host" → enter your name
4. You are now registered as a Host
5. Navigate to "Host Dashboard" via the top navigation
6. Click "Add Apartment" → enter apartment name and address → confirm
7. Your apartment is created and you can now receive complaints from tenants
8. Tenants who register can select your apartment when signing up
```

### 2. Tenant Complaint Submission Flow

```
1. Visit the app and click "Sign in with Internet Identity"
2. Authenticate using Internet Identity
3. Registration modal appears → select "Tenant" → enter your name → select your apartment
4. You are now registered as a Tenant
5. From the Complaint Board, click "Post Complaint"
6. Fill in:
   - Apartment (pre-listed by your host)
   - Title (brief summary of the issue)
   - Description (detailed explanation)
   - Category (Maintenance / Noise / Cleanliness / Safety / Other)
   - Priority (Low / Medium / High)
7. Click "Submit Complaint"
8. Your complaint appears on the board with status "Open"
9. You can track it from "My Complaints" tab or your Profile page
```

### 3. Host Resolution Flow

```
1. Sign in as a Host and navigate to "Host Dashboard"
2. Select your apartment from the dropdown
3. View the complaints panel — see stats, filter/search as needed
4. Click on a complaint to open the detail view
5. In the "Host Actions" panel on the right:
   a. Click "Start" to move the complaint to "In Progress"
   b. Once resolved, write a resolution note in the text area
   c. Click "Mark as Resolved" — complaint status updates immediately
6. The tenant sees the updated status and resolution note on their Profile page
7. If needed, click "Reopen" to revert a resolved complaint back to Open
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Blockchain** | [Internet Computer (ICP)](https://internetcomputer.org) | Decentralized hosting & storage |
| **Backend Language** | [Motoko](https://internetcomputer.org/docs/motoko/home) | Smart contract / canister logic |
| **Package Manager (backend)** | [Mops](https://mops.one) | Motoko package management |
| **Frontend Framework** | [React 19](https://react.dev) + TypeScript | UI components |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + OKLCH color system | Design tokens & utilities |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) | Accessible component primitives |
| **Routing** | [React Router v7](https://reactrouter.com) | Client-side navigation |
| **Data Fetching** | [TanStack Query v5](https://tanstack.com/query) | Server state, caching, mutations |
| **Authentication** | [Internet Identity](https://identity.ic0.app) | Decentralized identity provider |
| **Animations** | [Motion (Framer Motion)](https://motion.dev) | Entrance animations & transitions |
| **Icons** | [Lucide React](https://lucide.dev) | UI icons |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski) | Toast notifications |
| **Build Tool** | [Vite](https://vitejs.dev) | Frontend bundler |
| **Runtime** | [DFX](https://internetcomputer.org/docs/building-apps/developer-tools/dfx/dfx-cli-reference) | ICP deployment toolchain |

---

## Data Model

### `UserProfile`

Stored keyed by the user's `Principal` (Internet Identity unique identifier).

| Field | Type | Description |
|-------|------|-------------|
| `principal` | `Principal` | Internet Identity principal (unique ID) |
| `name` | `Text` | Display name set during registration |
| `role` | `#Host \| #Tenant` | User role — determines access and capabilities |
| `apartmentId` | `?Nat` | The apartment this tenant lives in (Tenants only) |
| `createdAt` | `Timestamp` | Nanosecond timestamp of registration |

### `Apartment`

Created by Hosts to represent managed properties.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `Nat` | Auto-incremented unique identifier |
| `name` | `Text` | Human-readable apartment/building name |
| `address` | `Text` | Physical street address |
| `hostPrincipal` | `Principal` | Principal of the host who created it |
| `createdAt` | `Timestamp` | Nanosecond timestamp of creation |

### `Complaint`

The core entity of the system, submitted by Tenants.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `Nat` | Auto-incremented unique identifier |
| `tenantPrincipal` | `Principal` | Who submitted the complaint |
| `apartmentId` | `Nat` | Which apartment this complaint belongs to |
| `title` | `Text` | Short summary of the issue |
| `description` | `Text` | Detailed explanation of the problem |
| `category` | `ComplaintCategory` | `Maintenance \| Noise \| Cleanliness \| Safety \| Other` |
| `priority` | `ComplaintPriority` | `Low \| Medium \| High` |
| `status` | `ComplaintStatus` | `Open \| InProgress \| Resolved` |
| `createdAt` | `Timestamp` | When the complaint was submitted |
| `updatedAt` | `Timestamp` | When the status was last changed |
| `resolvedAt` | `?Timestamp` | When (if ever) it was marked resolved |
| `resolutionNotes` | `?Text` | Host's description of how the issue was fixed |

---

## API Reference

All methods are exposed by the `ComplaintSystem` Motoko actor.

### User Management

| Method | Type | Description |
|--------|------|-------------|
| `registerAsHost(name)` | `update` | Register the caller as a Host with the given name |
| `registerAsTenant(name, apartmentId)` | `update` | Register the caller as a Tenant assigned to the given apartment |
| `getUserProfile()` | `query` | Return the profile of the calling principal, or `null` |
| `isRegistered()` | `query` | Return `true` if the caller has a registered profile |

### Apartment Management

| Method | Type | Description |
|--------|------|-------------|
| `createApartment(name, address)` | `update` | Create a new apartment (Host only) |
| `getApartments()` | `query` | Return all apartments in the system |
| `getMyApartments()` | `query` | Return apartments created by the calling Host |

### Complaint Operations

| Method | Type | Description |
|--------|------|-------------|
| `postComplaint(apartmentId, title, description, category, priority)` | `update` | Submit a new complaint (Tenant only) |
| `getComplaint(id)` | `query` | Return a single complaint by ID, or `null` |
| `getAllComplaints()` | `query` | Return every complaint in the system |
| `getMyComplaints()` | `query` | Return complaints submitted by the calling Tenant |
| `getApartmentComplaints(apartmentId)` | `query` | Return all complaints for a specific apartment |
| `getComplaintsByStatus(status)` | `query` | Filter complaints by their current status |
| `getComplaintsByCategory(category)` | `query` | Filter complaints by category |
| `getComplaintStats(apartmentId)` | `query` | Return `{total, open, inProgress, resolved}` counts for an apartment |
| `updateComplaintStatus(id, status, resolutionNotes)` | `update` | Update status and optionally add resolution notes (Host only) |
| `deleteComplaint(id)` | `update` | Permanently delete a complaint (author only, unresolved only) |

---

## Local Development Setup

### Prerequisites

Ensure the following are installed before proceeding:

| Tool | Version | Install Guide |
|------|---------|---------------|
| [Node.js](https://nodejs.org) | ≥ 18 | [nodejs.org](https://nodejs.org/en/download) |
| [pnpm](https://pnpm.io) | ≥ 8 | `npm install -g pnpm` |
| [DFX](https://internetcomputer.org/docs/building-apps/getting-started/install) | ≥ 0.24 | `sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"` |
| [Mops](https://mops.one/docs/install) | latest | `npm install -g ic-mops` |

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd apartment-complaint-system

# 2. Install root and frontend dependencies
pnpm install

# 3. Install backend Motoko packages
cd src/backend
mops install
cd ../..
```

### Running Locally

```bash
# 1. Start the local Internet Computer replica in the background
dfx start --clean --background

# 2. Deploy both canisters (backend + frontend) locally
dfx deploy

# 3. Generate TypeScript bindings from the backend Candid interface
pnpm bindgen

# 4. Start the Vite development server (with hot reload)
cd src/frontend
pnpm dev
```

The app will be available at **http://localhost:5173**.

> **Note:** When running locally, Internet Identity will use a local instance. Your local principal is different from your mainnet principal.

### Development Commands

Run these from the `src/frontend/` directory:

```bash
# Type-check the frontend without building
pnpm typecheck

# Auto-fix lint errors
pnpm fix

# Build for production
pnpm build
```

Run these from the `src/backend/` directory:

```bash
# Install Motoko packages
mops install

# Type-check the backend
mops check --fix

# Build the backend canister
mops build
```

---

## Deployment to Internet Computer Mainnet

### Step 1: Install and Configure DFX

```bash
# Install DFX if not already installed
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Verify installation
dfx --version

# Log in to your DFX identity (creates one if first time)
dfx identity whoami
```

### Step 2: Acquire Cycles

Cycles are the "gas" for ICP smart contracts. You need cycles to deploy canisters.

```bash
# Check your ICP balance (you need ICP to convert to cycles)
dfx ledger --network ic balance

# Convert ICP to cycles (replace AMOUNT with ICP amount, e.g. 0.5)
dfx cycles convert --amount AMOUNT --network ic

# Check your cycles balance
dfx cycles balance --network ic
```

> You can also get cycles from the [Cycles Faucet](https://internetcomputer.org/docs/building-apps/getting-started/cycles/cycles-faucet) for free developer cycles.

### Step 3: Create Canisters on Mainnet

```bash
# Create canister IDs on mainnet
dfx canister create --all --network ic

# This registers two canisters (backend + frontend) and assigns them IDs
# Canister IDs are saved in canister_ids.json
```

### Step 4: Build the Project

```bash
# Build the backend Motoko canister
cd src/backend && mops build && cd ../..

# Build the frontend assets
cd src/frontend && pnpm build && cd ../..
```

### Step 5: Deploy to Mainnet

```bash
# Deploy both canisters to mainnet
dfx deploy --network ic

# Or deploy them individually:
dfx deploy backend --network ic
dfx deploy frontend --network ic
```

### Step 6: Access Your Live App

After a successful deploy, DFX will print the frontend canister URL:

```
Deployed canisters:
  backend:  https://<backend-canister-id>.icp0.io
  frontend: https://<frontend-canister-id>.icp0.io
```

Visit the frontend URL to access your live app. 🎉

### Updating an Existing Deployment

When you make changes, re-deploy with:

```bash
# Rebuild and upgrade both canisters
dfx deploy --network ic --upgrade-unchanged
```

### Checking Canister Status

```bash
# View status and cycle balance of all canisters
dfx canister status --all --network ic

# Top up cycles for a specific canister
dfx canister deposit-cycles AMOUNT <canister-id> --network ic
```

---

## Project Structure

```
apartment-complaint-system/
├── src/
│   ├── backend/                  # Motoko smart contract
│   │   ├── main.mo               # Actor entry point — mounts mixins, counters
│   │   ├── types/
│   │   │   ├── complaints.mo     # Complaint, Apartment, UserProfile types
│   │   │   └── common.mo         # Shared enums (Category, Priority, Status)
│   │   ├── mixins/
│   │   │   └── complaints-api.mo # Query/update methods composed into main actor
│   │   ├── lib/
│   │   │   └── complaints.mo     # Pure business logic (create, post, validate)
│   │   ├── migration.mo          # Schema migration for canister upgrades
│   │   └── system-idl/           # System-level Candid interface definitions
│   │
│   └── frontend/                 # React + TypeScript UI
│       ├── public/
│       │   └── assets/           # Static assets, images
│       ├── src/
│       │   ├── App.tsx           # Router configuration + provider wrappers
│       │   ├── main.tsx          # React entry point
│       │   ├── backend.ts        # Actor factory (auto-generated)
│       │   ├── backend.d.ts      # TypeScript types (auto-generated via bindgen)
│       │   ├── index.css         # Global styles, OKLCH design tokens, fonts
│       │   ├── components/       # Shared UI components
│       │   │   ├── Layout.tsx    # App shell: header + navigation + footer
│       │   │   ├── Badge.tsx     # Status, category, priority badge components
│       │   │   ├── LoadingSpinner.tsx  # Page-level loading state
│       │   │   ├── ErrorMessage.tsx    # Reusable error display
│       │   │   ├── RegistrationModal.tsx  # First-time user role selection
│       │   │   └── ui/           # shadcn/ui primitives (Button, Card, etc.)
│       │   ├── hooks/
│       │   │   └── useQueries.ts # All TanStack Query hooks + TypeScript types
│       │   └── pages/
│       │       ├── ComplaintBoard.tsx   # "/" — public board with filters + post form
│       │       ├── HostDashboard.tsx    # "/host" — host-only apartment management
│       │       ├── ComplaintDetail.tsx  # "/complaint/:id" — single complaint view
│       │       └── ProfilePage.tsx      # "/profile" — user profile + history
│       ├── index.html            # HTML entry point (title, meta tags)
│       ├── vite.config.js        # Vite build configuration
│       ├── tailwind.config.js    # Tailwind CSS configuration
│       └── package.json          # Frontend dependencies
│
├── declarations/                 # Auto-generated Candid JS/TS bindings
├── mops.toml                     # Backend package manifest (Motoko)
├── mops.lock                     # Locked dependency versions
├── caffeine.toml                 # Caffeine project configuration
├── package.json                  # Root workspace package.json
├── pnpm-workspace.yaml           # pnpm monorepo workspace config
└── README.md                     # This file
```

---

## Contributing

Contributions are welcome! Here's how to get involved:

### Reporting Issues

1. Check existing [Issues](../../issues) to avoid duplicates
2. Open a new issue with:
   - A clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs. actual behavior
   - Screenshots or error messages if applicable

### Submitting Changes

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following the code style of the project
4. **Test** your changes locally using `dfx deploy` and `pnpm dev`
5. **Type-check**: run `pnpm typecheck` from `src/frontend/`
6. **Commit**: use descriptive commit messages (`feat: add complaint export`, `fix: resolve status filter bug`)
7. **Push** your branch: `git push origin feature/your-feature-name`
8. **Open a Pull Request** with a clear description of your changes

### Code Style Guidelines

- **Motoko**: follow the existing mixin/lib separation; pure functions in `lib/`, side-effectful calls in `mixins/`
- **TypeScript/React**: keep files under 200 lines; extract shared patterns into components
- **Tailwind**: use semantic design tokens only (`bg-card`, `text-foreground`) — never raw color utilities
- **No `any` types** in TypeScript
- Run `pnpm fix` before committing to auto-fix lint errors

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

*Built on the [Internet Computer](https://internetcomputer.org) — a decentralized blockchain network that hosts smart contracts at web speed.*
