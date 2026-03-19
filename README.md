# DexTracker

React + Vite + Supabase + TailwindCSS life tracking app.

## 1) Configure environment

Create `.env` (already present) with:

```bash
VITE_SUPABASE_URL=YOUR_SUPABASE_URL_HERE
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
```

## 2) Create Supabase tables + RLS

1. Open your Supabase project → **SQL Editor**
2. Copy/paste and run the full file: `supabase/schema.sql`

This creates all tables and enables **RLS** so each user only sees their own rows.

## 3) Enable Supabase Auth providers

In Supabase → **Authentication → Providers**:
- **Google**: enable (for “Continue with Google”)
- **Anonymous Sign-ins**: enable (for “Demo Account”)

## 4) Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (it may be `http://localhost:5173` or a higher port if already used).

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
