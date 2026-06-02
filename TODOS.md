# TODOS

## Billing / Stripe Webhook

### Webhook event idempotency + ordering guard
**Priority:** P1
**What:** The webhook (`src/app/api/stripe-webhook/route.ts`) has no `event.id` dedup and no ordering guard. Three handlers write the `plan` column keyed only on `stripe_customer_id` (last-writer-wins).
**Why:** Stripe does not guarantee delivery order and retries events. An out-of-order or duplicated event can leave `plan` in the wrong state (e.g. a stale `updated` landing after `checkout.session.completed`).
**Context:** Found by adversarial review during the fix/billing-security ship. The entitlement-status fix (past_due → pro) reduced the blast radius, but the ordering race remains. Proper fix: a `processed_stripe_events(event_id)` table checked at the top of the handler, or derive `plan` from a single authoritative event using `subscription.current_period_end` / `event.created` as a freshness check.
**Depends on:** Supabase migration for the dedup table.

### Dunning email dedup on repeated payment_failed
**Priority:** P2
**What:** `invoice.payment_failed` sends a full recovery email and creates a Stripe billing-portal session on every Stripe retry (smart retries fire over ~2 weeks).
**Why:** Users get duplicate "update your payment method" emails; unnecessary portal-session API calls.
**Context:** Adversarial review finding #5. Consider gating on `invoice.next_payment_attempt === null` (final failure) or tracking attempt count, and filter by `invoice.billing_reason` so a failed first signup payment doesn't trigger dunning.

### Entitlement should check the Pro price, not "any active subscription"
**Priority:** P2
**What:** `checkout.session.completed` and `subscription.updated` grant `plan = 'pro'` based only on subscription status + customer ID, never checking the subscription's price/product against `STRIPE_PRO_PRICE_ID` / `STRIPE_PRO_ANNUAL_PRICE_ID`.
**Why:** If the Stripe account ever sells a second product to the same customer, any active subscription would grant Pro.
**Context:** Adversarial review finding #6. Theoretical today (single product), but worth closing before adding any second SKU/add-on.

### Tie checkout session to the Supabase user via client_reference_id
**Priority:** P2
**What:** Webhook reconciliation depends entirely on the `stripe_customer_id` mapping written in `create-checkout` (`src/app/api/create-checkout/route.ts`). If that write fails, the webhook can never map the customer back to a user.
**Why:** Single point of failure for all entitlement writes.
**Context:** Adversarial review finding #7. Add `client_reference_id: user.id` (or `metadata.supabase_user_id`) to the checkout session and fall back to it in the webhook when the customer-ID lookup misses.

## Completed

### Wire real Stripe billing + close security holes
**Completed:** v0.2.0 (2026-06-02)
Billing now routes through Stripe Checkout (monthly/annual), the free-Pro `/api/upgrade` exploit is removed, the webhook uses the service-role admin client so plan updates actually persist, `create-client` no longer resets existing-user passwords (account-takeover fix), and client portal passwords use unbiased `crypto.getRandomValues`. Webhook handlers added for `subscription.updated` (with grace-window entitlement) and `invoice.payment_failed` (dunning email). Full unit coverage for all webhook + checkout + create-client paths.
