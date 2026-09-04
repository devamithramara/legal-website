# Hearing Reminder Cron Setup Guide

## Endpoint

```
POST /api/reminders/send-upcoming
Authorization: Bearer <CRON_SECRET>
```

The endpoint finds all non-closed cases with `nextHearing` within the next **24 hours**, skips recipients already notified today, and fires SMS via Twilio.

---

## 1. Add `CRON_SECRET` to your `.env`

```env
CRON_SECRET=your_random_secret_string_here
```

Generate a strong secret:
```bash
openssl rand -base64 32
```

---

## 2. Option A — Vercel Cron Jobs (Recommended)

Add a `vercel.json` in the project root:

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

> `30 2 * * *` = **02:30 UTC** = **08:00 IST** (UTC+5:30) daily.

Vercel automatically sets `Authorization: Bearer <CRON_SECRET>` if you add `CRON_SECRET` to your Vercel environment variables. No extra config needed.

**Deploy:** `vercel deploy --prod`

---

## 3. Option B — External Cron (cron-job.org / EasyCron)

If not on Vercel, use any HTTP cron scheduler:

| Setting | Value |
|---|---|
| URL | `https://yourdomain.com/api/reminders/send-upcoming` |
| Method | `POST` |
| Header | `Authorization: Bearer <your-CRON_SECRET>` |
| Schedule | `30 2 * * *` (daily at 08:00 IST) |

Recommended free services:
- **cron-job.org** — https://cron-job.org (free, reliable)
- **EasyCron** — https://www.easycron.com

---

## 4. Test Locally

```bash
curl -X POST http://localhost:3000/api/reminders/send-upcoming \
  -H "Authorization: Bearer your_secret" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "processedCases": 2,
  "summary": [
    { "caseId": "...", "caseNumber": "CNR-2026-001", "sent": 2, "skipped": 0, "failed": 0 }
  ]
}
```

---

## 5. Schedule Timing Reference (IST)

| UTC Cron | IST Time | Use case |
|---|---|---|
| `30 2 * * *` | 08:00 AM IST | Day-before + morning-of |
| `30 1 * * *` | 07:00 AM IST | Slightly earlier |
| `0 2 * * *` | 07:30 AM IST | Round number |
