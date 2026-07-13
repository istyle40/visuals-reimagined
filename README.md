# Visuals Reimagined

Premium public portfolio plus a private Supabase-backed client proofing, approval, payment and final-download portal.

## Important deployment note

The client portal uses secure server sessions, private storage signatures, image processing and protected download routes. It must run on a server-capable Next.js host such as Vercel. GitHub Pages can host only the older static public build and cannot securely run this portal.

## Install and run

```bash
pnpm install
copy .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`. Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — server-only key; never prefix it with `NEXT_PUBLIC_`
- `NEXT_PUBLIC_SITE_URL` — exact deployed origin, without a trailing slash

The application throws a clear server error when required variables are missing. Never commit `.env.local` or real client data.

## Configure Supabase

1. Create a Supabase project.
2. In SQL Editor, run `supabase/migrations/202607130001_private_client_gallery.sql`.
3. Confirm the private `gallery-previews` and `gallery-finals` buckets were created. Neither bucket may be public.
4. In Authentication → URL Configuration, set the Site URL to `NEXT_PUBLIC_SITE_URL`.
5. Add redirect URLs for:
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain.example/auth/callback`
6. In Authentication email settings, enable email OTP/magic links. Disable open user registration in the project configuration. The app additionally sends OTP requests with `shouldCreateUser: false`.
7. Add all four environment variables to the server host and redeploy.

The migration enables RLS on every portal table. Clients see only their own profile and assigned galleries. Final storage is never client-readable directly; trusted server routes check membership, payment, expiry, download flags, final existence and approval before delivery.

## Create the first administrator

There is intentionally no public admin signup.

1. In Supabase Dashboard → Authentication → Users, create or invite the studio administrator.
2. Copy that user UUID.
3. Run this once in SQL Editor, replacing the example values:

```sql
insert into public.profiles (id, email, full_name, role, is_active)
values ('ADMIN-AUTH-USER-UUID', 'studio@example.com', 'Studio Administrator', 'admin', true)
on conflict (id) do update set role = 'admin', is_active = true;
```

4. Visit `/client-login`, request a one-time link for that email, then open `/admin`.

## Invite the first client

1. Open `/admin/clients`.
2. Enter the client name and session email.
3. Choose **Create client and send invite**.
4. The client receives a one-time email link. No password or public account creation is available.

## Create and prepare a gallery

1. Open `/admin/galleries/new` and assign one or more invited clients.
2. Open the created gallery and upload preview images.
3. Upload processing creates lower-resolution WebP derivatives with the embedded `VISUALS REIMAGINED — CLIENT PROOF` watermark, then stores them privately.
4. Set a cover, meaningful alt text, image order, selection deadline and expiry.
5. Set the workflow to **Preview Available** or **Awaiting Selection**.
6. Clients can favourite, approve, reject and comment. Changes persist in Supabase, not only in browser state.
7. Export selected filenames as CSV when editing begins.

## Final edits, payment and downloads

1. Change workflow to **Editing in Progress** and optionally lock selections.
2. Upload each high-resolution final and pair it to the matching preview.
3. Enable the intended final images.
4. Set payment to **Awaiting Payment** and optionally provide an HTTPS payment URL.
5. After payment is confirmed outside the app, set payment status to **Paid**, enter the reference/amount, and enable downloads.
6. The app moves an eligible gallery to **Ready to Download** only when finals exist, payment is paid, downloads are enabled and the gallery is not expired.
7. Clients can download approved finals individually or request a freshly generated authenticated ZIP. Downloads are logged and never use permanent public URLs.

Payment is deliberately manual in this first version. Do not automate `paid` status without a verified payment-provider webhook.

## Security model

- Middleware refreshes Supabase SSR cookies and protects client/admin routes.
- The callback exchanges codes server-side and rejects external or admin redirect targets.
- Login responses are generic and do not reveal registered emails.
- Admin routes require an active `admin` profile; typed URLs never return admin data to clients.
- Gallery pages validate assignment on every server request.
- RLS restricts profiles, memberships, galleries, images, selections and comments.
- Clients can edit/delete only their own comments and selections.
- Preview signatures last five minutes; individual final signatures last one minute.
- ZIP responses are authenticated, generated on demand and marked `private, no-store`.
- Service-role credentials are imported only from `server-only` modules.
- Admin uploads validate MIME type, size and image decodability, use unique safe paths and never overwrite unrelated files.
- All `/client`, `/client-login` and `/admin` pages are `noindex`.

## Validation

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

For production acceptance, also test two separate client users, an expired gallery, an unpaid gallery, locked selections and an attempted `/admin` visit from a client session.
