# Kabadi Wala Connect

> A practical digital bridge between scrap collectors, verified recyclers, and responsible e-waste recovery.

[![Live Demo](https://img.shields.io/badge/live%20demo-Render-16a34a?style=flat-square)](https://kabbadiwala-connect-1.onrender.com/)
[![Frontend](https://img.shields.io/badge/frontend-React%2018-149eca?style=flat-square)](Kabadi_wala_connect/)
[![Database](https://img.shields.io/badge/database-Supabase-3ecf8e?style=flat-square)](Kabadi_wala_connect/supabase/)

## Live App

https://kabbadiwala-connect-1.onrender.com/

## What It Does

Kabadi Wala Connect helps collectors move from informal scrap selling to a clearer, safer, and more traceable workflow:

- Sign up and verify a collector account with a demo OTP flow.
- Scan scrap using the included TensorFlow.js image model.
- See the predicted material and confidence percentages.
- Add several scanned items to a persistent scrap bag.
- Sell one item immediately or combine multiple items into one lot.
- Find nearby recyclers using location and material categories.
- Create a QR-based verified handover reference.
- Run a clearly labelled mock UPI or cash payment flow.
- Generate a downloadable sale certificate.
- Store lot, transaction, payment, and traceability records in Supabase.

## Technology

- React 18 and React Router
- Vite
- Tailwind CSS 4
- Framer Motion
- Supabase Database and Row Level Security policies
- TensorFlow.js 1.3.1
- Teachable Machine Image model
- Leaflet and React Leaflet for recycler maps
- `qrcode.react` for handover and certificate QR codes
- Render-compatible Node HTTP production server

## Project Layout

```text
Kabadi_wala_connect/
├── AI_Model/             # Original image model and labels
├── public/AI_Model/      # Model assets served to the browser
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # App-wide state, including the scrap bag
│   ├── data/             # Local demo data
│   ├── pages/            # Collector, recycler, payment, and certificate screens
│   ├── services/         # Supabase, AI, lot, transaction, and location services
│   └── routes/            # Protected and public routes
├── supabase/             # Database setup and RLS policies
├── dist/                 # Generated production build
├── package.json
└── serve-dist.mjs        # Render-friendly static server
```

## Run Locally

From the renamed app directory:

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

To build for production:

```bash
npm run build
```

## Environment Variables

Create a `.env` file in `Kabadi_wala_connect/`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_public_anon_key
```

Never commit `.env`. Configure the same variables in Render under **Environment**.

## Supabase Setup

Run [`supabase/setup.sql`](Kabadi_wala_connect/supabase/setup.sql) in the Supabase SQL editor after creating the project tables. The script configures policies, indexes, seed materials, sample recyclers, and price history.

The current policies are intentionally permissive for a demo or hackathon prototype. Before production use, replace them with authenticated `auth.uid()`-based policies and server-side validation.

## Render Deployment

Configure the Render web service with:

- Root directory: `Kabadi_wala_connect`
- Build command: `npm install && npm run build`
- Start command: `npm run dev`
- Environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

The server binds to `0.0.0.0` and reads Render's `PORT` automatically.

## Demo Notes

- OTP is currently a demo PIN flow and does not send SMS.
- Payment is deliberately fake and does not move real money.
- QR codes currently contain signed-looking verification payloads for the prototype; a production certificate authority and government integration still need to be added.
- The AI result is an assistive classification, not a hazardous-material safety guarantee. Follow the safety guidance on each item.

## Roadmap

- Real SMS OTP provider
- Real payment provider with webhook verification
- Authenticated recycler handover confirmation
- Server-generated, tamper-evident certificates
- Government traceability API integration
- Better model coverage and confidence calibration

## License

This project is a prototype for responsible scrap collection and recycling workflows.
