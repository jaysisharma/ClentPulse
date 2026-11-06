import { fmtCurrency } from '@/lib/currencies'
import { cn } from '@/lib/utils'
import type { ClientWorkspace } from '@/lib/client-workspace'
import { ClientShell } from '../client-shell'
import { MUTED, PANEL, RULE, Row, SECTION_LABEL, StudioDot, shortDate } from '../client-ui'
import { buildBilling, type Money } from '../dashboard/dashboard-model'

function joinMoney(list: Money[]) {
  return list.map(m => fmtCurrency(m.amount, m.currency)).join(' + ')
}

export function BillingView({ email, workspace }: { email: string; workspace: ClientWorkspace }) {
  const billing = buildBilling(workspace)
  const nothingYet = billing.toPay.length === 0 && billing.paid.length === 0 && billing.budgets.length === 0

  return (
    <ClientShell active="billing" email={email} projectIds={workspace.projects.map(p => p.id)}>
      <section>
        <h1 className="text-[26px] sm:text-[28px] font-bold tracking-[-0.02em]">Billing</h1>
        <p className={cn('mt-2 text-base leading-relaxed', MUTED)}>
          {billing.toPayTotals.length > 0
            ? <>You have <strong className="text-[#111318] dark:text-white font-semibold">{joinMoney(billing.toPayTotals)}</strong> to pay.</>
            : 'Nothing to pay right now.'}
          {billing.paidThisYear.length > 0 && ` ${joinMoney(billing.paidThisYear)} paid in ${billing.year}.`}
        </p>
      </section>

      {nothingYet && (
        <section className={PANEL}>
          <h2 className="text-lg font-bold">No invoices yet</h2>
          <p className={cn('mt-2 text-[15px] leading-relaxed', MUTED)}>Invoices, deposits and receipts from your studios will appear here.</p>
        </section>
      )}

      {billing.toPay.map(group => (
        <section key={group.studio.id} aria-label={`To pay ${group.studio.name}`}>
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="flex items-center gap-2.5 text-[15px] font-semibold">
              <StudioDot studio={group.studio} />
              To pay {group.studio.name}
            </h2>
            <span className="text-[15px] font-semibold tabular-nums">{joinMoney(group.totals)}</span>
          </div>
          <ul className={cn('border-b', RULE)}>
            {group.rows.map(row => (
              <Row
                key={row.key}
                href={row.href}
                meta={
                  <span className="flex flex-col items-end">
                    <span className="text-[#111318] dark:text-white font-medium tabular-nums">{fmtCurrency(row.amount, row.currency)}</span>
                    <span className={cn('text-[13px]', row.overdue && 'font-semibold text-[#111318] dark:text-white')}>{row.due}</span>
                  </span>
                }
              >
                <span className="text-[15px] break-words">{row.title}</span>
                {row.context && <span className={cn('text-[15px]', MUTED)}> · {row.context}</span>}
              </Row>
            ))}
          </ul>
          <p className={cn('mt-2 text-[13px]', MUTED)}>Paid directly to {group.studio.name} · secured by Stripe</p>
        </section>
      ))}

      {billing.budgets.length > 0 && (
        <section aria-labelledby="budget-h">
          <h2 id="budget-h" className={SECTION_LABEL}>Budget by project</h2>
          <ul className={cn('border-b', RULE)}>
            {billing.budgets.map(b => {
              const total = Math.max((b.agreed ?? 0) + b.extras, b.paid + b.outstanding)
              const paidPct = total > 0 ? (b.paid / total) * 100 : 0
              const duePct = total > 0 ? (b.outstanding / total) * 100 : 0
              return (
                <li key={b.id} className={cn('border-t py-4', RULE)}>
                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                    <span className="text-[15px] font-semibold">{b.name}</span>
                    {b.agreed != null && (
                      <span className={cn('text-sm', MUTED)}>
                        {fmtCurrency(b.agreed, b.currency)} agreed{b.extras > 0 && ` + ${fmtCurrency(b.extras, b.currency)} extras`}
                      </span>
                    )}
                  </div>
                  {total > 0 && (
                    <div
                      role="img"
                      aria-label={`${fmtCurrency(b.paid, b.currency)} paid, ${fmtCurrency(b.outstanding, b.currency)} to pay`}
                      className="mt-2.5 flex h-1.5 rounded-full overflow-hidden bg-[#E7E7E3] dark:bg-white/[0.1]"
                    >
                      <span className="bg-[#111318] dark:bg-white" style={{ width: `${paidPct}%` }} />
                      <span className="bg-[#9A9EA8]" style={{ width: `${duePct}%` }} />
                    </div>
                  )}
                  <p className={cn('mt-2 text-sm', MUTED)}>
                    {fmtCurrency(b.paid, b.currency)} paid · {fmtCurrency(b.outstanding, b.currency)} to pay
                    {b.notBilled > 0 && ` · ${fmtCurrency(b.notBilled, b.currency)} not billed yet`}
                    {` · ${b.studioName}`}
                  </p>
                </li>
              )
            })}
          </ul>
          <p className={cn('mt-2 text-[13px]', MUTED)}>Totals include tax and approved extras.</p>
        </section>
      )}

      {billing.paid.length > 0 && (
        <section aria-labelledby="paid-h">
          <h2 id="paid-h" className={SECTION_LABEL}>Receipts</h2>
          <ul className={cn('border-b', RULE)}>
            {billing.paid.map(row => (
              <Row
                key={row.key}
                href={row.href}
                meta={
                  <span className="flex flex-col items-end">
                    <span className="text-[#111318] dark:text-white font-medium tabular-nums">{fmtCurrency(row.amount, row.currency)}</span>
                    {row.paidAt && <span className="text-[13px]">Paid {shortDate(row.paidAt)}</span>}
                  </span>
                }
              >
                <span className="text-[15px] break-words">{row.title}</span>
                <span className={cn('text-[15px]', MUTED)}> · {row.context}</span>
              </Row>
            ))}
          </ul>
        </section>
      )}
    </ClientShell>
  )
}
