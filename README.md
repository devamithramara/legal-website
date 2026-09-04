# ⚖️ MLR Associates — Legal Practice Management & Law Chambers Suite

[![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_DB-336791?style=flat-square&logo=postgresql)](https://neon.tech/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.24-green?style=flat-square&logo=auth0)](https://next-auth.js.org/)
[![License](https://img.shields.io/badge/License-Proprietary-gold?style=flat-square)](#)

A comprehensive, enterprise-grade Law Chambers Management Platform and Legal SaaS built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **PostgreSQL**. Engineered specifically for Indian litigation practices, high-volume law firms, and independent senior advocates.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Portals & Features](#-key-portals--features)
  - [1. Public Client Portal & Website](#1-public-client-portal--website)
  - [2. Admin Operations Portal](#2-admin-operations-portal)
  - [3. Senior Advocate War Room](#3-senior-advocate-war-room)
  - [4. Junior Advocate & Intern Workspace](#4-junior-advocate--intern-workspace)
  - [5. Client Self-Service Dashboard](#5-client-self-service-dashboard)
  - [6. Automated Cron Engine & Reminders](#6-automated-cron-engine--reminders)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Default Seed Credentials](#-default-seed-credentials)
- [Database Schema & Models](#-database-schema--models)
- [Project Directory Structure](#-project-directory-structure)
- [API Route Reference](#-api-route-reference)
- [Environment Variables](#-environment-variables)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Cron Setup & Background Workers](#-cron-setup--background-workers)
- [Production Deployment](#-production-deployment)
- [License & Authors](#-license--authors)

---

## 🏛️ Overview

**MLR Associates** streamlines the entire lifecycle of legal practice management across courts (Supreme Court, High Courts, District Courts, Tribunals). It unifies client acquisition, consultation scheduling, retainer payments, live eCourts sync, junior task allocation, billable time tracking, case strategy drafting, cross-examination preparation, and automated client notifications.

### 🌟 Key Highlights
- **Multi-Role Portals**: Dedicated workspaces for Managing Partners (Admin), Senior Advocates, Junior Advocates/Interns, and Clients.
- **Strict Role-Based Access Control (RBAC)**: Enforced at both Next.js Edge Middleware and API route levels.
- **Deep Indian Legal System Alignment**: Built-in support for CNR numbers, cause lists, Bare Acts, SCC/Manupatra research logs, Vakalatnama workflows, and GST compliant legal invoicing.
- **Real-Time Timers & EOD Logs**: Live stopwatch billable time trackers, Daily Activity Reports, and court attendance logging.
- **Automated Hearing Reminders**: Multi-channel (SMS, Email, WhatsApp) notification engine triggered via cron jobs.

---

## 🚀 Key Portals & Features

### 1. Public Client Portal & Website
* **Route**: `/` (Landing), `/book`, `/upload`, `/testimonials`, `/contact`, `/privacy`
* **Features**:
  - **High-Conversion Legal Landing Page**: Gold & midnight blue aesthetic showcasing practice areas, firm statistics, attorney profiles, and client feedback.
  - **Instant Appointment Booking (`/book`)**: Real-time slot picker with payment gateway integration (Razorpay) and automatic client account creation.
  - **Secure Document Upload (`/upload`)**: Upload identification proofs, case records, contracts, and court orders directly to Cloudinary.
  - **Verified Client Reviews (`/testimonials`)**: Rating submission and public verified testimonial display.

### 2. Admin Operations Portal
* **Route**: `/admin/*`
* **Features**:
  - **Practice Overview (`/admin`)**: High-level metrics for active cases, today's hearings, revenue run-rate, pending escalations, and unassigned tasks.
  - **Master Case Management (`/admin/cases`)**: Filterable registry by court, status (`INTAKE`, `ACTIVE`, `ARGUED`, `JUDGMENT`, `CLOSED`), and assigned advocates. Full case timeline history.
  - **eCourts Live Cause List (`/admin/cause-list`)**: Daily item list, court hall tracking, stage of proceeding, and automated appearance recording.
  - **Master Calendar (`/admin/calendar`)**: FullCalendar view of all chamber hearings, client appointments, and statutory filing deadlines.
  - **Junior Advocate Directory (`/admin/juniors`)**: Performance monitoring, task allocation status, billable hour approval, skill tagging, and capacity planning.
  - **Financial Ledger & Invoicing (`/admin/finance`)**: GST invoice generation, expense tracking (Rent, Salaries, Office supplies), cash inflow/outflow ledger, and revenue charts.
  - **Reminder Center (`/admin/reminders`)**: Automated dispatch controls, SMS/Email delivery logs, and trigger rules.
  - **Chamber Analytics (`/admin/analytics`)**: Case turnaround times, revenue per practice area, and advocate efficiency metrics.

### 3. Senior Advocate War Room
* **Route**: `/senior/*`
* **Features**:
  - **Daily Court Board & Hearings (`/senior/hearings`)**: Prioritized list of today's appearances with bench details, item numbers, and case summary cards.
  - **Case Strategy Engine (`/senior/strategy`)**: Digital war map featuring Case Theory, Crucial Arguments, Weak Points, Counter-Arguments, and Case Strength assessments.
  - **Cross-Examination Builder (`/senior/cross-exam`)**: Question bank organized by witness role (`PW1`, `DW2`, Expert), trap questions, and predicted responses.
  - **Pre-Hearing Readiness Checklist (`/senior/checklist`)**: Real-time verification of documents, brief completeness, Vakalatnama filing, and fee clearance with % completion bar.
  - **Senior Draft Dispatch (`/senior/drafts`)**: Create high-level pleadings and dispatch to junior advocates for citation enrichment and filing.
  - **Precedent & Judgment Vault (`/senior/vault` & `/senior/judgments`)**: Searchable repository of landmark rulings, annotated judgment PDFs, SCC citations, and standard argument templates.
  - **Private Client Briefs (`/senior/clients`)**: Sensitive client notes with risk flags (`VIP`, `MEDIA_RISK`, `PAYMENT_RISK`, `SENSITIVE`).
  - **Senior Morning Briefing & Notifications (`/senior/notifications`)**: Digest of urgent court developments, junior escalations, and pending reviews.

### 4. Junior Advocate & Intern Workspace
* **Route**: `/junior/*`
* **Features**:
  - **Task Dashboard (`/junior/tasks`)**: Filter tasks by priority (`URGENT`, `NORMAL`, `LOW`), status (`ASSIGNED`, `IN_PROGRESS`, `REVIEW`, `DONE`), and deadline.
  - **Live Billable Time Tracker (`/junior/time`)**: Stopwatch timer with category tagging (`RESEARCH`, `DRAFTING`, `COURT`, `FILING`, `CLIENT`, `TRAVEL`) and manual log entry.
  - **Daily EOD Work Log (`/junior/log`)**: End-of-day reporting covering completed tasks, hours worked, courtrooms attended, and blocker flags.
  - **Legal Research Filing (`/junior/research`)**: Structured research repository mapping IPC/BNS sections, citations, and summaries (SCC, Manupatra, IndianKanoon).
  - **Draft Submission Queue (`/junior/drafts`)**: Submit pleadings for senior review, manage draft versions, and review inline feedback.
  - **Rapid Escalation Desk (`/junior/escalations`)**: Flag urgent client emergencies, adverse court orders, or unreachable parties.
  - **Client Calling Log (`/junior/calls`)**: Record client telephonic consultations, duration, and actionable next steps.
  - **Learning & Mentorship Hub (`/junior/learning`)**: Assigned bare acts, procedural guides, judgment reading lists, and 3-line summary submissions.

### 5. Client Self-Service Dashboard
* **Route**: `/dashboard`
* **Features**:
  - Track real-time status and timeline updates for all active cases.
  - View upcoming hearing dates, court names, and assigned advocate details.
  - View and download invoices and GST tax receipts.
  - Access uploaded case documents, affidavits, and court orders.
  - Quick-book follow-up consultations.

### 6. Automated Cron Engine & Reminders
* **Route**: `/api/cron/*`, `/api/reminders/send-upcoming`
* **Automations**:
  - **08:00 AM IST**: Daily Morning Hearing & Cause List Digest for Senior Advocates.
  - **07:00 PM IST**: End-of-day Reminder for Juniors to submit Daily Activity Logs.
  - **24h & 48h Prior**: Automated SMS/Email alerts to clients and advocates for upcoming court hearings.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    Client[Client / Public User] -->|Browses / Books / Uploads| PublicApp[Public Portal & NextAuth UI]
    Junior[Junior Advocate / Intern] -->|Timesheets / Research / Drafts| JuniorPortal[Junior Workspace /junior]
    Senior[Senior Advocate] -->|Strategy / Cross-Exam / Review| SeniorPortal[Senior War Room /senior]
    Admin[Managing Partner / Admin] -->|Cases / Calendar / Finance| AdminPortal[Admin Operations /admin]

    subgraph NextJS["Next.js 14 App Router Framework"]
        PublicApp
        JuniorPortal
        SeniorPortal
        AdminPortal
        Middleware[NextAuth Edge Middleware / RBAC Guard]
        API[Next.js API Route Handlers /api/*]
    end

    subgraph Services["External Microservices & Integrations"]
        NeonDB[(PostgreSQL Database / Neon)]
        Prisma[Prisma ORM 6.19]
        Razorpay[Razorpay Payment Gateway]
        Cloudinary[Cloudinary Document Storage]
        Twilio[Twilio SMS & WhatsApp Gateway]
        Nodemailer[SMTP / Nodemailer Email Service]
        VercelCron[Vercel Cron / External Cron Scheduler]
    end

    Middleware --> NextJS
    API --> Prisma
    Prisma --> NeonDB
    API --> Razorpay
    API --> Cloudinary
    API --> Twilio
    API --> Nodemailer
    VercelCron -->|POST /api/cron/*| API
```

---

## 💻 Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | [Next.js 14.2.16](https://nextjs.org/) | App Router, Server Actions & API Route Handlers |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict Type Safety across frontend and backend |
| **Database** | [PostgreSQL (Neon)](https://neon.tech/) | Serverless cloud relational database with connection pooling |
| **ORM** | [Prisma 6.19](https://www.prisma.io/) | Schema definition, migrations, and type-safe query client |
| **Authentication** | [NextAuth.js 4](https://next-auth.js.org/) | JWT strategy, credentials authentication, session management |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) | Custom navy/gold legal palette, typography, CSS variables |
| **UI Components** | [Shadcn UI](https://ui.shadcn.com/) / Radix | Accessible primitives, modals, dropdowns, and forms |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent iconography suite |
| **Calendar** | [FullCalendar 6](https://fullcalendar.io/) | Interactive Day, Week, and Month court diaries |
| **Charts** | [Chart.js 4](https://www.chartjs.org/) / React-Chartjs-2 | Financial and case throughput analytics |
| **Rich Text Editor**| [TipTap 3](https://tiptap.dev/) | WYSIWYG legal drafting and notes editor |
| **Payments** | [Razorpay](https://razorpay.com/) | Indian payment gateway for retainer and consultation fees |
| **Communication** | [Twilio](https://www.twilio.com/) & [Nodemailer](https://nodemailer.com/) | SMS, WhatsApp, and transactional email notifications |
| **File Storage** | [Cloudinary](https://cloudinary.com/) | Cloud document and PDF order storage |

---

## 🔒 Role-Based Access Control (RBAC)

The application enforces strict multi-tier role authorization defined in `src/middleware.ts` and API handlers:

| Role | Access Permissions | Landing / Default Redirect |
|---|---|---|
| `ADMIN` | Full unrestricted access to all chambers data, finance, cases, juniors, and system settings | `/admin` |
| `SENIOR` | Access to Senior War Room (`/senior/*`), hearings, strategy, cross-exam, vault, and assigned cases | `/senior/dashboard` |
| `JUNIOR` / `INTERN` | Access to Junior Workspace (`/junior/*`), assigned tasks, time logs, research, and drafts | `/junior/dashboard` |
| `CLIENT` | Access to Client Portal (`/dashboard`), their own case status, bills, and document vault | `/dashboard` |

---

## 🔑 Default Seed Credentials

Upon running `npx prisma db seed`, the following test accounts are available:

| Role | Email | Password | Phone |
|---|---|---|---|
| **Admin / Managing Partner** | `admin@firm.com` | `admin123` | `+91 9876543210` |
| **Junior Advocate** | `junior@firm.com` | `junior123` | `+91 8765432109` |
| **Client** | `client@firm.com` | `client123` | `+91 7654321098` |

---

## 📊 Database Schema & Models

The system is powered by a relational schema in `prisma/schema.prisma` consisting of 24 core entities:

### Key Models Overview
- **User**: Core entity with roles (`CLIENT`, `JUNIOR`, `INTERN`, `SENIOR`, `ADMIN`), designations, and relational mappings.
- **Case**: Central case record tracking CNR/case number, court, client, junior, senior, status (`INTAKE`, `ACTIVE`, `ARGUED`, `JUDGMENT`, `CLOSED`), and next hearing date.
- **Appointment**: Live consultation bookings with fee tracking, payment IDs, time slots, and notes.
- **Task & TimeLog**: Junior work assignments with real-time billable hour tracking, task status, and senior feedback ratings.
- **DailyLog**: Daily end-of-day junior summary, hours worked, court visits, and blocker escalation flags.
- **Appearance**: Detailed courtroom appearance record with hall number, time in/out, outcome, and next date.
- **Draft & SeniorDraft**: Version-controlled legal pleadings with senior inline comments and Cloudinary file links.
- **ResearchLog**: Structured case law and statutory reference database (IPC/BNS sections, citations, summaries).
- **CaseStrategy**: Senior legal battle map (Theory of case, Key arguments, Weak points, Counter-arguments, Case strength).
- **CrossExamBuilder & CrossExamQuestion**: Structured cross-examination question builder with trap questions and predicted witness responses.
- **HearingChecklist**: Pre-hearing readiness verification items and auto-calculated completion percentage.
- **PrecedentVault & JudgmentLibrary**: Centralized chamber knowledge bank with tags, law areas, and annotated judgments.
- **Invoice, Expense & Transaction**: Full double-entry financial ledger for revenue, client retainers, office expenses, and GST invoicing.
- **HearingReminder & ReminderSetting**: Automated notification scheduling with recipient status (`PENDING`, `SENT`, `FAILED`).

---

## 📁 Project Directory Structure

```
├── .env                                # Local environment variables
├── .env.example                        # Example environment template
├── docs/                               # Additional documentation (cron, architecture)
│   └── cron.md                         # Cron setup and trigger documentation
├── prisma/
│   ├── schema.prisma                   # Complete Prisma relational schema
│   └── seed.ts                         # Database seeder script
├── project_blueprint/                  # Full reference architecture and source blueprints
├── public/                             # Static assets, fonts, icons
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/                  # NextAuth sign-in page
│   │   ├── (portals)/
│   │   │   ├── admin/                  # Admin portal (cases, juniors, finance, cause list, calendar)
│   │   │   ├── senior/                 # Senior Advocate portal (strategy, cross-exam, vault, checklist)
│   │   │   ├── junior/                 # Junior Advocate portal (tasks, time, daily log, research, drafts)
│   │   │   ├── dashboard/              # Client self-service portal
│   │   │   └── finance/                # Financial ledger & invoicing views
│   │   ├── (public)/                   # Public landing page, /book, /upload, /testimonials, /contact
│   │   ├── api/                        # 38+ REST API routes for all modules
│   │   │   ├── auth/                   # NextAuth handler & registration
│   │   │   ├── appointments/           # Booking and slot management
│   │   │   ├── cases/                  # Case CRUD and status updates
│   │   │   ├── cause-list/             # Daily court cause list API
│   │   │   ├── cron/                   # Automated briefing and reminder cron endpoints
│   │   │   ├── finance/                # Invoices, transactions, expenses
│   │   │   ├── juniors/                # Junior management and timesheet review
│   │   │   ├── reminders/              # Multi-channel notification sender
│   │   │   ├── senior/                 # Senior suite APIs (strategy, drafts, checklist)
│   │   │   ├── tasks/                  # Task assignment and status lifecycle
│   │   │   ├── timelogs/               # Live timer and billable hour logging
│   │   │   └── vault/                  # Precedent and judgment knowledge vault
│   │   ├── globals.css                 # Custom CSS variables, animations, and Tailwind base
│   │   ├── layout.tsx                  # Root HTML shell and Provider wrapper
│   │   ├── error.tsx / not-found.tsx   # Global error boundaries
│   ├── components/
│   │   ├── ui/                         # Reusable UI component library (buttons, inputs, dialogs, etc.)
│   │   ├── navbar.tsx                  # Dynamic role-aware navigation bar
│   │   ├── footer.tsx                  # Chambers footer
│   │   ├── floating-widgets.tsx        # Emergency floating quick-action triggers
│   │   └── providers.tsx               # NextAuth SessionProvider and UI Context
│   ├── lib/
│   │   ├── auth.ts                     # NextAuth options, credentials provider, callbacks
│   │   ├── prisma.ts                   # Global Prisma client singleton
│   │   └── utils.ts                    # Classnames merger (`clsx` + `tailwind-merge`)
│   └── middleware.ts                   # Edge authentication & RBAC router guard
├── package.json                        # Project dependencies and npm scripts
├── tailwind.config.ts                  # Tailwind theme tokens (Gold, Slate, Navy)
├── tsconfig.json                       # TypeScript compiler configuration
└── vercel.json                         # Vercel deployment and cron job schedule config
```

---

## 📡 API Route Reference

The application provides a modular REST API backend:

### Authentication & Users
- `POST /api/auth/[...nextauth]` — NextAuth credentials login and session handling
- `GET /api/juniors` — List all junior advocates, statistics, and pending tasks
- `GET /api/clients` — Search and retrieve registered clients

### Cases & Court Operations
- `GET /api/cases` | `POST /api/cases` — Retrieve or file new cases
- `GET /api/cases/[id]` | `PATCH /api/cases/[id]` — Case details, status, and assignment updates
- `GET /api/cause-list` | `POST /api/cause-list` — Live daily court item cause list
- `GET /api/appearances` | `POST /api/appearances` — Log advocate court appearances and outcomes

### Appointments & Payments
- `GET /api/appointments` | `POST /api/appointments` — Consultation slot booking
- `POST /api/payment/create-order` — Initialize Razorpay consultation transaction
- `POST /api/payment/verify` — Verify Razorpay HMAC signature and confirm booking

### Senior Advocate Strategic Suite
- `GET /api/strategy` | `POST /api/strategy` — Fetch or update case theory and argument maps
- `GET /api/cross-exam` | `POST /api/cross-exam` — Witness questions and trap builder
- `GET /api/checklist` | `PATCH /api/checklist` — Pre-hearing readiness checklist
- `GET /api/vault` | `POST /api/vault` — Chamber precedent and citation bank
- `GET /api/judgments` | `POST /api/judgments` — Searchable judgment library

### Junior Execution & Timers
- `GET /api/tasks` | `POST /api/tasks` — Task assignment and workflow lifecycle
- `POST /api/timelogs` | `PATCH /api/timelogs` — Start/stop timer and billable logging
- `POST /api/dailylog` — Junior end-of-day daily activity submission
- `GET /api/research` | `POST /api/research` — Statutory and citation research repository
- `GET /api/drafts` | `POST /api/drafts` — Pleadings and draft submissions
- `POST /api/escalations` — Raise immediate procedural blocker

### Financials & Notifications
- `GET /api/finance/invoices` | `POST /api/finance/invoices` — GST legal invoices
- `GET /api/finance/transactions` — Chamber cashflow and ledger entries
- `POST /api/reminders/send-upcoming` — Execute bulk hearing reminder notification engine

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
# ----------------------------------------------------
# DATABASE (PostgreSQL / Neon Connection String)
# ----------------------------------------------------
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# ----------------------------------------------------
# NEXTAUTH (Authentication & Session Secret)
# ----------------------------------------------------
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-random-32-byte-secret-string"

# ----------------------------------------------------
# CRON JOBS SECRET
# ----------------------------------------------------
CRON_SECRET="your-secure-cron-authorization-token"

# ----------------------------------------------------
# PAYMENT GATEWAY (Razorpay)
# ----------------------------------------------------
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"

# ----------------------------------------------------
# DOCUMENT STORAGE (Cloudinary)
# ----------------------------------------------------
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# ----------------------------------------------------
# SMS & WHATSAPP GATEWAY (Twilio - Optional)
# ----------------------------------------------------
TWILIO_ACCOUNT_SID="AC_your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# ----------------------------------------------------
# EMAIL DISPATCH (Nodemailer / SMTP - Optional)
# ----------------------------------------------------
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@domain.com"
SMTP_PASS="your_app_password"
EMAIL_FROM="MLR Associates <notifications@lawfirm.com>"
```

---

## 🛠️ Getting Started & Local Setup

### Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm** or **yarn** or **pnpm**
- A running **PostgreSQL** instance (Local or [Neon Serverless](https://neon.tech/))

### 1. Clone the Repository
```bash
git clone <repository-url>
cd test1
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
# Edit .env and supply your DATABASE_URL and NEXTAUTH_SECRET
```

### 4. Push Database Schema & Seed Data
```bash
# Push schema migrations to your PostgreSQL database
npx prisma db push

# Populate with initial test accounts, cases, invoices, and hearings
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⏰ Cron Setup & Background Workers

### Automated Daily Hearing Reminders
The endpoint `POST /api/reminders/send-upcoming` scans all cases with hearings in the next 24 hours and dispatches SMS/Email alerts to clients and advocates.

#### Option A: Vercel Cron (Configured in `vercel.json`)
```json
{
  "crons": [
    {
      "path": "/api/reminders/send-upcoming",
      "schedule": "30 2 * * *"
    }
  ]
}
```
*Note: `30 2 * * *` = **02:30 UTC** = **08:00 AM IST** daily.*

#### Option B: External Cron (cron-job.org / EasyCron)
- **URL**: `https://yourdomain.com/api/reminders/send-upcoming`
- **Method**: `POST`
- **Headers**:
  - `Authorization`: `Bearer <CRON_SECRET>`
  - `Content-Type`: `application/json`

---

## 🚢 Production Deployment

### 1. Vercel Deployment (Recommended)
1. Push your repository to GitHub / GitLab.
2. Import the project in [Vercel Dashboard](https://vercel.com/dashboard).
3. Set your Environment Variables in the Vercel Project Settings (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `CRON_SECRET`, etc.).
4. Run Build Command: `prisma generate && next build`.
5. Deploy.

### 2. Manual Docker / Node Server Deployment
```bash
# Build the production application
npm run build

# Start the Next.js production server
npm run start -p 3000
```

---

## 📄 License & Contact

This project is built for **MLR Associates Legal Chambers**. All rights reserved.

For inquiries, support, or custom integrations:
- 🌐 **Website**: [MLR Associates Legal Chambers](http://localhost:3000)
- 📧 **Support**: `contact@firm.com`
