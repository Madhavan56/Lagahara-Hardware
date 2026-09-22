# Laghara Hardwares

E-commerce storefront for an interior & furniture-materials business. React + TypeScript + Vite,
Supabase (Postgres/Auth/Storage/RLS), Razorpay, deployed on Vercel.

## Setup

```bash
npm install
cp .env.example .env   # fill in your Supabase project values
npm run dev
```

## Database

Migrations live in `supabase/migrations/`. To apply them to a linked project:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
npx supabase gen types typescript --linked > src/types/database.ts
```

Seed the catalog with placeholder products (idempotent, upserts by SKU):

```bash
npm run seed:catalog
```

Verify RLS policies with a deliberate cross-user negative test:

```bash
npm run verify:rls
```

Regenerate `public/sitemap.xml` from live categories/products before each
production build (set `SITE_URL` once the real domain is chosen; defaults to
a placeholder):

```bash
SITE_URL=https://yourdomain.com npm run generate:sitemap
```

Run the full security audit (21-point RLS matrix across every table — anon /
customer / cross-customer / admin, plus storage and the verified-purchaser
review gate):

```bash
npm run audit:security
```

## Making yourself an admin

The admin dashboard (Phase 10) gates on `profiles.role = 'admin'`. Customers cannot self-promote
(enforced by `prevent_role_escalation()` — verified by `npm run verify:rls`), so the first admin
must be set directly in the database:

1. Sign up through the app normally (`/signup`).
2. In the Supabase SQL Editor, run:
   ```sql
   update public.profiles set role = 'admin' where id = (
     select id from auth.users where email = 'your-email@example.com'
   );
   ```
3. Sign out and back in so the new role takes effect.

## Environment variables

See `.env.example`. `VITE_`-prefixed values are bundled into the client and must never include
secrets. `SUPABASE_SERVICE_ROLE_KEY` is for `scripts/` only (service role key, bypasses RLS) —
never import it from `src/`.
