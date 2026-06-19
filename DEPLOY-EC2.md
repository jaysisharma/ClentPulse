# Deploying Frevio on AWS EC2

Small-scale, single-instance setup. The DB/auth live in **Supabase** (managed),
so the EC2 box is just a stateless Next.js server behind Caddy (auto-HTTPS).

Stack: Next 16 · React 19 · Node 22 · PM2 · Caddy · Ubuntu 24.04.

---

## 1. Launch the instance

- **AMI:** Ubuntu Server 24.04 LTS
- **Type:** `t3.small` (2 GB RAM — `next build` OOMs on 1 GB; see swap note below)
- **Disk:** 20 GB gp3
- **Key pair:** create/download one for SSH
- **Security group:**
  - `22` (SSH) — **your IP only**
  - `80` (HTTP) — anywhere
  - `443` (HTTPS) — anywhere
- Allocate an **Elastic IP** and associate it (so the IP survives stop/start).

> On `t3.small` you can skip swap. If you ever use a 1 GB box, add it first:
> ```bash
> sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
> sudo mkswap /swapfile && sudo swapon /swapfile
> echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
> ```

## 2. DNS

In your `.cloud` domain registrar, add an **A record**:

```
app.frevio.cloud  →  <Elastic IP>
```

Wait for it to resolve (`dig app.frevio.cloud +short`) before reloading Caddy,
or the TLS cert request will fail.

## 3. Base software

```bash
ssh -i your-key.pem ubuntu@<Elastic IP>

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git
node -v   # expect v22.x
sudo npm i -g pm2
```

## 4. Clone + configure env

```bash
git clone <your-repo-url> ~/frevio
cd ~/frevio
cp .env.local.example .env
nano .env          # fill in PROD values (see checklist below)
chmod 600 .env     # secrets — lock it down
```

Required in `.env` (every one is referenced in code):

| Var | Notes |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret**, server-only |
| `NEXT_PUBLIC_APP_URL` | `https://app.frevio.cloud` |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | use **live** keys |
| `STRIPE_WEBHOOK_SECRET` | from the webhook you create in step 8 |
| `STRIPE_PRO_PRICE_ID` / `STRIPE_PRO_ANNUAL_PRICE_ID` | live price IDs |
| `RESEND_API_KEY` | |
| `CRON_SECRET` | long random string (`openssl rand -hex 32`) |
| `ANTHROPIC_API_KEY` | optional — enables Pro "Draft with AI" |

> `NEXT_PUBLIC_*` values are **baked in at build time**, so they must be in `.env`
> *before* `npm run build`.

## 5. Build + run with PM2

```bash
npm ci
npm run build
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup          # run the sudo command it prints, once — survives reboots
pm2 logs frevio # verify it booted on :3000
```

## 6. Caddy (reverse proxy + auto-HTTPS)

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy

# edit deploy/Caddyfile → set your real subdomain, then:
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Visit `https://app.frevio.cloud` — you should get the app over HTTPS with a
valid cert (Caddy fetches and auto-renews it).

## 7. Replace the cron (IMPORTANT)

`vercel.json` cron only runs on Vercel. On EC2 use the system crontab. `crontab -e`:

```cron
# Weekly "needs attention" digest — Mondays 13:00 UTC (matches vercel.json)
0 13 * * 1 curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://app.frevio.cloud/api/cron/weekly-digest >> /home/ubuntu/cron.log 2>&1
```

Use the same value as `CRON_SECRET` in `.env`. The route also accepts
`?secret=YOUR_CRON_SECRET` if you prefer a query param.

## 8. Point external services at the new domain

- **Supabase → Auth → URL Configuration:** set **Site URL** to
  `https://app.frevio.cloud` and add `https://app.frevio.cloud/auth/callback`
  to **Redirect URLs**. Update the **Google** provider's redirect too (if used).
- **Stripe → Webhooks:** add endpoint `https://app.frevio.cloud/api/stripe-webhook`,
  subscribe to checkout/subscription events, copy its signing secret into
  `STRIPE_WEBHOOK_SECRET`, then `pm2 reload frevio`.
- **Resend:** verify your sending domain. ⚠️ The weekly digest currently sends
  `from: Frevio <digest@frevio.cloud>` (hardcoded in
  `src/app/api/cron/weekly-digest/route.ts`). Either verify `frevio.cloud` in
  Resend or change that address to one on your verified `.cloud` domain.

## 9. Smoke test (on the live URL)

- [ ] Sign up → verification email → `/onboarding`
- [ ] Log in → `/dashboard`; "Remember me" off → cookie clears on browser close
- [ ] Password reset → link lands on `/settings`
- [ ] Google sign-in round-trips
- [ ] Client portal login at `/client/login`
- [ ] Paid upgrade → Stripe webhook flips the plan
- [ ] `curl` the cron URL once → digest sends
- [ ] Pro account sees "Draft with AI"; free account sees the locked "Pro" link

## Redeploys

```bash
bash deploy/deploy.sh   # git pull + npm ci + build + pm2 reload
```

## Ops notes

- **Logs:** `pm2 logs frevio`, Caddy: `journalctl -u caddy -f`
- **Restart app:** `pm2 reload frevio` (zero-downtime) / `pm2 restart frevio`
- **Cost:** `t3.small` ≈ \$15/mo on-demand — your \$100 credit covers ~6 months.
  A 1-year Savings Plan or `t4g.small` (ARM, cheaper) lowers it further later.
- **Backups:** none needed on the box (stateless). Your data lives in Supabase —
  enable Supabase's backups there.
