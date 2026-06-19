// Alias route: Stripe's conventional webhook path is /api/webhooks/stripe, but
// the handler historically lived at /api/stripe-webhook. Re-export the same POST
// handler here so both URLs work and the Stripe CLI / dashboard can target
// either path. The implementation stays in one place.
export { POST } from '../../stripe-webhook/route'
