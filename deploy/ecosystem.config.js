// PM2 process definition for Frevio (Next.js `next start`).
// Start:   pm2 start deploy/ecosystem.config.js
// Persist: pm2 save && pm2 startup   (run the command it prints, once)
//
// Env (Supabase, Stripe, Resend, CRON_SECRET, NEXT_PUBLIC_APP_URL, …) is read
// from the project's `.env` file by Next at runtime — keep it at the repo root
// with chmod 600. PORT below must match the reverse_proxy target in the Caddyfile.

module.exports = {
  apps: [
    {
      name: 'frevio',
      cwd: '/home/ubuntu/frevio',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
