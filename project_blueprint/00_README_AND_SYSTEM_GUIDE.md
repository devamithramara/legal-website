# MLR Associates — Legal Management & Law Chambers Suite
## Complete Blueprint & Project Replication Guide

This suite of Markdown documents contains the complete, unabridged source code, schema, database seeding, UI components, API routes, and configuration required to build and deploy an exact replica of this enterprise legal management platform.

---

### System Overview & Key Modules

1. **Public Client Portal & Practice Website**:
   - High-conversion modern legal landing page with gold & midnight blue aesthetic.
   - Live online appointment booking with time-slot selection & Razorpay payment integration.
   - Secure client document upload & verification portal.
   - Client testimonials & verified reviews showcase.

2. **Admin Operations & Practice Management Portal** (`/admin`):
   - Comprehensive case management lifecycle: Intake, active hearings, argued, judgment, and closed.
   - eCourts live sync, cause-list tracking, and automated court appearance logging.
   - Interactive FullCalendar master court calendar & diary.
   - Junior advocate management, timesheet review, escalation resolution, and draft approval.
   - Financial ledger, GST invoicing, revenue analytics, and expense management.
   - Automated multi-channel reminders (WhatsApp, SMS, Email) for clients and juniors.

3. **Senior Advocate War Room & Strategic Suite** (`/senior`):
   - Daily courtroom hearing board & cause list digest.
   - Strategic case theory builder, argument maps, weak-point analysis, and counter-arguments.
   - Cross-examination question builder with traps, witness roles, and predicted replies.
   - Pre-hearing readiness checklists with auto-calculated completion percentages.
   - Senior draft generation, PDF/Docx dispatch to juniors, and rapid review queue.
   - Precedent & Judgment Vault with tagged case law citations and SCC/Manupatra references.
   - Private client briefing notes with risk flags (VIP, Media Risk, Sensitive).

4. **Junior Advocate & Intern Execution Board** (`/junior`):
   - Role-scoped task dashboard with priority, status, and direct case links.
   - Live billable time tracker with start/stop timer, manual logging, and category breakdowns.
   - End-of-Day (EOD) daily log submissions with court attendance tracking and escalation flags.
   - Legal research filing (IPC/BNS sections, case law citations, source libraries).
   - Draft submissions with version control and senior inline feedback.
   - Rapid escalation desk for urgent judicial or client blockers.
   - Client calling log with duration tracking and action item triggers.
   - Learning & Performance Hub with assigned bare acts, judgments, and 3-line summaries.

5. **Automated Cron Jobs & Background Workers** (`/api/cron`):
   - Morning Senior Briefing (8:00 AM daily hearing digest & urgency alerts).
   - Daily Junior EOD Log Reminders (7:00 PM).
   - Pre-Hearing Checklist Alert Engine (48h & 24h prior to hearing).
   - Weekly Performance & Revenue Digests.

---

### Tech Stack & Core Dependencies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4 with custom gold & slate design system, CSS variables, and Lucide icons
- **Database & ORM**: PostgreSQL with Prisma ORM 6.19
- **Authentication**: NextAuth.js 4 (JWT Strategy, credentials provider, Role-Based Access Control)
- **Calendar & Rich UI**: FullCalendar 6, Shadcn UI, Class Variance Authority, Date-Fns
- **Payments**: Razorpay Node SDK
- **Communication & Storage**: Twilio, Nodemailer, Cloudinary

---

### Role-Based Access Control (RBAC) Matrix

| Portal Route | Allowed Roles | Middleware Redirection |
|---|---|---|
| `/admin/*` | `ADMIN` | Seniors → `/senior/dashboard`, Juniors → `/junior/dashboard`, Others → `/login` |
| `/senior/*` | `SENIOR`, `ADMIN` | Others → `/login` |
| `/junior/*` | `JUNIOR`, `INTERN`, `ADMIN` | Seniors → `/senior/dashboard`, Others → `/login` |
| `/dashboard/*` | `CLIENT` | Others → `/login` |

---

### Default Seed Login Credentials

| Role | Email | Password | Phone |
|---|---|---|---|
| **Admin / Managing Partner** | `admin@firm.com` | `admin123` | +91 9876543210 |
| **Junior Advocate** | `junior@firm.com` | `junior123` | +91 8765432109 |
| **Client** | `client@firm.com` | `client123` | +91 7654321098 |

---

### Step-by-Step Project Replication Guide

1. **Initialize Project Directory**:
   ```bash
   mkdir legal-firm-saas
   cd legal-firm-saas
   ```

2. **Place Configuration Files**:
   - Copy `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.mjs`, `components.json`, and `.env` from **`01_PROJECT_CONFIGURATION_AND_SETUP.md`**.

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Initialize Database Schema & Seeding**:
   - Copy `prisma/schema.prisma`, `prisma/seed.ts`, and `src/lib/*` from **`02_DATABASE_SCHEMA_SEED_AND_LIBS.md`**.
   - Push schema to your PostgreSQL database:
     ```bash
     npx prisma db push
     ```
   - Seed initial data:
     ```bash
     npx prisma db seed
     ```

5. **Create Components & Pages**:
   - Copy UI components and public pages from **`03_SHARED_COMPONENTS_AND_PUBLIC_PORTAL.md`**.
   - Copy Admin Portal pages from **`04_ADMIN_PORTAL.md`**.
   - Copy Senior Advocate Portal pages from **`05_SENIOR_ADVOCATE_PORTAL.md`**.
   - Copy Junior Advocate Portal pages from **`06_JUNIOR_ADVOCATE_PORTAL.md`**.
   - Copy API routes from **`07_BACKEND_API_ROUTES_PART1.md`** and **`08_BACKEND_API_ROUTES_PART2.md`**.

6. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Document Index

- **`00_README_AND_SYSTEM_GUIDE.md`**: System architecture, RBAC, setup guide, and seed credentials.
- **`01_PROJECT_CONFIGURATION_AND_SETUP.md`**: Config files (`package.json`, `tailwind.config.ts`, etc.), middleware, globals.css, and root layouts.
- **`02_DATABASE_SCHEMA_SEED_AND_LIBS.md`**: Complete `schema.prisma`, `seed.ts`, Prisma client, auth, and utilities.
- **`03_SHARED_COMPONENTS_AND_PUBLIC_PORTAL.md`**: All Shadcn/Tailwind UI components, navbar, footer, auth login page, and public website pages.
- **`04_ADMIN_PORTAL.md`**: Full Admin Management Portal (Cases, Cause List, Clients, Calendar, Juniors, Files, Finance, Reminders, Analytics).
- **`05_SENIOR_ADVOCATE_PORTAL.md`**: Senior Advocate Suite (Hearings, Strategy, Cross-Exam, Drafts, Checklist, Judgments, Precedent Vault, Notifications).
- **`06_JUNIOR_ADVOCATE_PORTAL.md`**: Junior Advocate Workspace (Tasks, Daily Log, Time Tracking, Research, Drafts, Escalations, Calls, Diary, Learning).
- **`07_BACKEND_API_ROUTES_PART1.md`**: API routes for Auth, Appointments, Payments, Cases, Clients, Cause List, Appearances, Documents, Finance & Invoices.
- **`08_BACKEND_API_ROUTES_PART2.md`**: API routes for Juniors, Tasks, TimeLogs, DailyLog, Drafts, Senior Strategy, Checklists, Vault, Reminders & Cron Automations.
