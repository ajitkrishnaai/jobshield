# JobShield

**The dashcam for contractors.** Document every job with timestamped before & after photos, generate professional reports, and send review requests — all from your phone in under 5 minutes.

## What it does

- **Before photos** — Guided prompts for each trade (roofing, plumbing, HVAC, general)
- **After photos** — Same structured flow after the job is done
- **Completion report** — Auto-generated professional PDF with timestamps
- **Review request** — Pre-written SMS template to capture reviews on the spot

## Tech stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS
- jsPDF + html2canvas for PDF generation
- IndexedDB (via idb) for photo storage
- localStorage for job metadata
- PWA-ready with manifest

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.
Open [http://localhost:3000/app](http://localhost:3000/app) to use the app.

## No backend required

Everything runs client-side. Photos are stored in IndexedDB, job data in localStorage. No signup, no server, no data leaves the device.
