# TODOS

## Billing / Stripe Webhook

*All billing hardening and webhook security items completed!*

## Completed

### Stripe Webhook Hardening & Idempotency Guards
**Completed:** v0.3.1 (September 2026)
- **Webhook event idempotency:** `processed_stripe_events (event_id)` deduplication table prevents duplicate event execution.
- **Event ordering guard:** `users.stripe_event_created_at` prevents stale or out-of-order webhook events from overwriting newer user or organization subscription states.
- **Dunning email dedup:** `invoice.payment_failed` skips initial `subscription_create` checkout failures and intermediate retries (`attempt_count > 1` when `next_payment_attempt` is set), sending recovery emails only on the first failure and final failure.
- **Price entitlement validation:** `customer.subscription.updated` verifies that subscription items match configured Frevio Pro/Agency price IDs, preventing unauthorized access from unrelated Stripe products.
- **Checkout user linkage fallback:** `client_reference_id` and `metadata.supabase_user_id` pass the Supabase user ID through Checkout so webhooks reliably map subscriptions even if initial customer ID storage lags.
- **SQL Migration:** [`deploy/stripe-hardening-migration.sql`](file:///Users/jaysisharma/Desktop/clientpulse/deploy/stripe-hardening-migration.sql) added for database synchronization.
- **Unit test suite:** 19/19 tests passing in Vitest covering idempotency, event ordering, dunning dedup, and price validation.

### Wire real Stripe billing + close security holes
**Completed:** v0.2.0 (2026-06-02)
Billing now routes through Stripe Checkout (monthly/annual), the free-Pro `/api/upgrade` exploit is removed, the webhook uses the service-role admin client so plan updates actually persist, `create-client` no longer resets existing-user passwords (account-takeover fix), and client portal passwords use unbiased `crypto.getRandomValues`. Webhook handlers added for `subscription.updated` (with grace-window entitlement) and `invoice.payment_failed` (dunning email). Full unit coverage for all webhook + checkout + create-client paths.

