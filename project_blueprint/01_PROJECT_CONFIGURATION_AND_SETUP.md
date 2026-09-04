# MLR Associates — Part 1: Project Configuration & Setup

This document contains all project configuration files, build scripts, styling rules, error handlers, and the root layout.

---

### File: `package.json`

```json
{
  "name": "test1",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@base-ui/react": "^1.5.0",
    "@fullcalendar/core": "^6.1.15",
    "@fullcalendar/daygrid": "^6.1.15",
    "@fullcalendar/interaction": "^6.1.15",
    "@fullcalendar/react": "^6.1.15",
    "@fullcalendar/timegrid": "^6.1.15",
    "@prisma/client": "^6.19.3",
    "@tiptap/extension-highlight": "^3.29.2",
    "@tiptap/extension-table": "^3.29.2",
    "@tiptap/extension-table-cell": "^3.29.2",
    "@tiptap/extension-table-header": "^3.29.2",
    "@tiptap/extension-table-row": "^3.29.2",
    "@tiptap/extension-text-align": "^3.29.2",
    "@tiptap/extension-underline": "^3.29.2",
    "@tiptap/react": "^3.29.2",
    "@tiptap/starter-kit": "^3.29.2",
    "bcryptjs": "^3.0.3",
    "chart.js": "^4.5.1",
    "class-variance-authority": "^0.7.1",
    "cloudinary": "^2.10.0",
    "clsx": "^2.1.1",
    "date-fns": "^4.4.0",
    "lucide-react": "^1.17.0",
    "next": "14.2.16",
    "next-auth": "^4.24.14",
    "nodemailer": "^7.0.13",
    "razorpay": "^2.9.6",
    "react": "^18",
    "react-chartjs-2": "^5.3.1",
    "react-day-picker": "^10.0.1",
    "react-dom": "^18",
    "shadcn": "^4.11.0",
    "tailwind-merge": "^3.6.0",
    "tw-animate-css": "^1.4.0",
    "twilio": "^6.0.2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20",
    "@types/nodemailer": "^8.0.0",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.16",
    "postcss": "^8",
    "prisma": "^6.19.3",
    "tailwindcss": "^3.4.1",
    "tsx": "^4.22.4",
    "typescript": "^5"
  },
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

---

### File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### File: `next-env.d.ts`

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/building-your-application/configuring/typescript for more information.
```

---

### File: `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        heading: ["var(--font-heading)", "ui-serif", "Georgia"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;
```

---

### File: `postcss.config.mjs`

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;
```

---

### File: `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    '@fullcalendar/core',
    '@fullcalendar/react',
    '@fullcalendar/daygrid',
    '@fullcalendar/timegrid',
    '@fullcalendar/interaction',
  ],
};

export default nextConfig;
```

---

### File: `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
```

---

### File: `.env.example`

```env
# PostgreSQL Neon / Supabase Connection URL with Pooling
DATABASE_URL="postgresql://user:password@host/database?sslmode=require&pgbouncer=true&connect_timeout=30&pool_timeout=30"

# NextAuth configuration (REQUIRED for login and RBAC)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-nextauth-secret-string-here"

# Optional Third-Party Integrations
# RAZORPAY_KEY_ID="rzp_test_xxxx"
# RAZORPAY_KEY_SECRET="xxxx"
# CLOUDINARY_CLOUD_NAME="demo"
# CLOUDINARY_API_KEY="xxxx"
# CLOUDINARY_API_SECRET="xxxx"
# TWILIO_ACCOUNT_SID="xxxx"
# TWILIO_AUTH_TOKEN="xxxx"
# TWILIO_PHONE_NUMBER="+1234567890"
# SMTP_HOST="smtp.mailtrap.io"
# SMTP_PORT="2525"
# SMTP_USER="xxxx"
# SMTP_PASS="xxxx"
```

---

### File: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/morning-digest",
      "schedule": "30 2 * * *"
    },
    {
      "path": "/api/cron/log-reminder",
      "schedule": "30 13 * * *"
    },
    {
      "path": "/api/cron/senior-morning",
      "schedule": "30 2 * * *"
    },
    {
      "path": "/api/cron/checklist-remind",
      "schedule": "30 12 * * *"
    },
    {
      "path": "/api/cron/weekly-summary",
      "schedule": "30 3 * * 1"
    }
  ]
}
```

---

### File: `apphosting.yaml`

```yaml
env:
  - variable: NEXTAUTH_URL
    value: https://lawfirm-law-website-84eb0.web.app
    availability:
      - BUILD
      - RUNTIME
  - variable: DATABASE_URL
    secret: DATABASE_URL
    availability:
      - BUILD
      - RUNTIME
  - variable: NEXTAUTH_SECRET
    secret: NEXTAUTH_SECRET
    availability:
      - BUILD
      - RUNTIME
```

---

### File: `firebase.json`

```json
{
  "apphosting": {
    "backendId": "lawfirm",
    "rootDir": "/",
    "ignore": [
      "node_modules",
      ".git",
      "firebase-debug.log",
      "firebase-debug.*.log"
    ]
  }
}
```

---

### File: `.firebaserc`

```text
{
  "projects": {
    "default": "law-website-84eb0"
  }
}
```

---

### File: `.eslintrc.json`

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

---

### File: `.gitignore`

```text
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

/src/generated/prisma
```

---

### File: `src/middleware.ts`

```typescript
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // SENIOR attempt on /admin or /junior -> redirect to /senior/dashboard
    if (path.startsWith('/admin')) {
      if (token?.role === 'SENIOR') {
        return NextResponse.redirect(new URL('/senior/dashboard', req.url));
      }
      if (token?.role === 'JUNIOR' || token?.role === 'INTERN') {
        return NextResponse.redirect(new URL('/junior/dashboard', req.url));
      }
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    if (path.startsWith('/junior')) {
      if (token?.role === 'SENIOR') {
        return NextResponse.redirect(new URL('/senior/dashboard', req.url));
      }
      if (token?.role !== 'JUNIOR' && token?.role !== 'INTERN' && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    if (path.startsWith('/senior')) {
      if (token?.role !== 'SENIOR' && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    if (path.startsWith('/dashboard') && token?.role !== 'CLIENT') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/junior/:path*', '/senior/:path*', '/dashboard/:path*'],
};
```

---

### File: `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    
    --card: 222 47% 15%;
    --card-foreground: 210 40% 98%;
    
    --popover: 222 47% 15%;
    --popover-foreground: 210 40% 98%;
    
    --primary: 48 76% 58%;
    --primary-foreground: 222 47% 11%;
    
    --secondary: 215 30% 32%;
    --secondary-foreground: 210 40% 98%;
    
    --muted: 217 33% 18%;
    --muted-foreground: 215 20% 70%;
    
    --accent: 48 76% 58%;
    --accent-foreground: 222 47% 11%;
    
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    
    --border: 217 33% 25%;
    --input: 217 33% 25%;
    --ring: 48 76% 58%;
    
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-[#0B132B] text-slate-100 font-sans antialiased selection:bg-[#E2C044]/30 selection:text-[#E2C044];
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading tracking-tight;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL HIGH-CONTRAST FONT VISIBILITY & FORM CONTROLS
   ───────────────────────────────────────────────────────────────────────────── */

/* Force all text inputs, textareas, and native selects to high contrast */
input, select, textarea {
  color: #0A1628 !important;
  font-weight: 600 !important;
}

/* Dark theme containers (Junior workspace, floating widgets, dark cards) */
.mesh-bg input,
.mesh-bg select,
.mesh-bg textarea,
.bg-slate-900 input,
.bg-slate-900 select,
.bg-slate-900 textarea,
.bg-slate-950 input,
.bg-slate-950 select,
.bg-slate-950 textarea,
.glass-panel input,
.glass-panel select,
.glass-panel textarea,
.glass-card input,
.glass-card select,
.glass-card textarea {
  color: #FFFFFF !important;
  background-color: #0F172A !important;
  border-color: #334155 !important;
}

/* Admin light containers (White cards, #F5F0E8 background) */
.bg-white input,
.bg-white select,
.bg-white textarea,
.bg-\[\#F5F0E8\] input,
.bg-\[\#F5F0E8\] select,
.bg-\[\#F5F0E8\] textarea {
  color: #0A1628 !important;
  background-color: #FFFFFF !important;
  border-color: #CBD5E1 !important;
}

/* Native select option tags contrast fix */
option {
  background-color: #0F172A !important;
  color: #FFFFFF !important;
  font-weight: 600 !important;
}

.bg-white option,
select.bg-white option {
  background-color: #FFFFFF !important;
  color: #0A1628 !important;
  font-weight: 600 !important;
}

/* Date/time pickers native calendar styling */
input[type="date"],
input[type="datetime-local"],
input[type="time"] {
  color-scheme: dark;
}

.bg-white input[type="date"],
.bg-white input[type="datetime-local"],
.bg-white input[type="time"] {
  color-scheme: light;
}

/* Table text high contrast */
table th {
  color: #475569 !important;
  font-weight: 700 !important;
}

.bg-white table td,
.bg-white table th {
  color: #0A1628 !important;
}

.mesh-bg table td,
.bg-slate-900 table td {
  color: #F8FAFC !important;
}

/* Glassmorphism & Custom Aesthetic Classes */
.glass-panel {
  background: rgba(28, 37, 65, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(226, 192, 68, 0.25);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.glass-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  border-color: rgba(226, 192, 68, 0.6);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px -10px rgba(226, 192, 68, 0.3);
}

.gold-gradient-text {
  background: linear-gradient(135deg, #FFF3C4 0%, #E2C044 50%, #D4AF37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cyan-gradient-text {
  background: linear-gradient(135deg, #A5F3FC 0%, #38BDF8 50%, #0284C7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.emerald-gradient-text {
  background: linear-gradient(135deg, #A7F3D0 0%, #34D399 50%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gold-glow {
  box-shadow: 0 0 25px rgba(226, 192, 68, 0.35);
}

.cyan-glow {
  box-shadow: 0 0 25px rgba(56, 189, 248, 0.35);
}

.mesh-bg {
  background-color: #0B132B;
  background-image: 
    radial-gradient(at 0% 0%, rgba(226, 192, 68, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(56, 189, 248, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.12) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.12) 0px, transparent 50%);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.animate-pulse-glow {
  animation: pulseGlow 3s ease-in-out infinite;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #0B132B;
}
::-webkit-scrollbar-thumb {
  background: #2B3A55;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #E2C044;
}
```

---

### File: `src/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "MLR Associates | Advocate & Law Firm Management",
  description: "Premium Advocate & Law Firm Management App for litigation, hearings, and client service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("scroll-smooth", inter.variable, playfair.variable)}>
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

---

### File: `src/app/error.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error Boundary caught an error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col justify-center items-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-[#DCD6C5] shadow-lg space-y-6">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#0A1628]">Something went wrong</h2>
          <p className="text-xs text-gray-500 font-medium">
            An unexpected error occurred in the workspace session.
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-[#0A1628] hover:bg-[#0A1628]/90 text-white text-xs font-semibold rounded-lg transition"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0A1628] text-xs font-semibold rounded-lg transition inline-block"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

### File: `src/app/global-error.tsx`

```typescript
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F0E8] flex flex-col justify-center items-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-xl border border-[#DCD6C5] shadow-lg space-y-6">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#0A1628]">Critical Error</h2>
            <p className="text-xs text-gray-500 font-medium">
              The application encountered an unrecoverable error.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-[#0A1628] hover:bg-[#0A1628]/90 text-white text-xs font-semibold rounded-lg transition"
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
```

---

### File: `src/app/not-found.tsx`

```typescript
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col justify-center items-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-[#DCD6C5] shadow-lg space-y-6">
        <h1 className="text-6xl font-extrabold text-[#C9A84C]">404</h1>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#0A1628]">Page Not Found</h2>
          <p className="text-xs text-gray-500 font-medium">
            The page or record you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-[#0A1628] hover:bg-[#0A1628]/90 text-white text-xs font-semibold rounded-lg transition"
        >
          Return to Workspace
        </Link>
      </div>
    </div>
  );
}
```

---

