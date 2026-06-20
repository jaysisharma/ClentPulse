-- ============================================================================
-- Server-Side Budget Enforcement Trigger
--
-- Ensures that the total of all non-canceled invoices for a project does not
-- exceed the project's configured budget. Rejects insert/update operations
-- with an informative error if they would result in an over-budget state.
--
-- Run this script in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/ffdwirtwyprkittwlchn/sql/new
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_invoice_budget()
RETURNS TRIGGER AS $$
DECLARE
  proj_budget NUMERIC;
  existing_invoiced_total NUMERIC;
  current_invoice_total NUMERIC;
BEGIN
  -- If there is no project linked, skip budget check
  IF NEW.project_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Canceled invoices do not count against the budget
  IF NEW.status = 'canceled' THEN
    RETURN NEW;
  END IF;

  -- 1. Fetch the project's budget
  SELECT budget INTO proj_budget
  FROM public.projects
  WHERE id = NEW.project_id;

  -- If no budget is set or it is zero/negative, skip budget check
  IF proj_budget IS NULL OR proj_budget <= 0 THEN
    RETURN NEW;
  END IF;

  -- 2. Calculate the current invoice total from its JSONB line items
  SELECT COALESCE(SUM((val->>'amount')::NUMERIC), 0) INTO current_invoice_total
  FROM jsonb_array_elements(NEW.items) AS val;

  -- 3. Calculate already invoiced amount for this project (excluding current invoice if updating)
  SELECT COALESCE(SUM(invoice_item_totals.amount), 0) INTO existing_invoiced_total
  FROM (
    SELECT (val->>'amount')::NUMERIC AS amount
    FROM public.invoices,
         jsonb_array_elements(items) AS val
    WHERE project_id = NEW.project_id
      AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status <> 'canceled'
  ) AS invoice_item_totals;

  -- 4. Reject transaction if total exceeds the project budget limits
  IF (existing_invoiced_total + current_invoice_total) > proj_budget THEN
    RAISE EXCEPTION 'Invoice total of $% exceeds the remaining project budget of $% (Budget: $%, Already Invoiced: $%)',
      current_invoice_total,
      (proj_budget - existing_invoiced_total),
      proj_budget,
      existing_invoiced_total;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
DROP TRIGGER IF EXISTS enforce_invoice_budget_trigger ON public.invoices;
CREATE TRIGGER enforce_invoice_budget_trigger
  BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.check_invoice_budget();
