-- Add RLS Policies for remaining tables

-- Quotes policies
CREATE POLICY "Users can view quotes in their company" 
ON quotes FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can manage quotes in their company" 
ON quotes FOR ALL 
USING (company_id = get_user_company_id());

-- Quote Items policies
CREATE POLICY "Users can view quote items in their company" 
ON quote_items FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM quotes q WHERE q.id = quote_id AND q.company_id = get_user_company_id()
));

CREATE POLICY "Users can manage quote items in their company" 
ON quote_items FOR ALL 
USING (EXISTS (
  SELECT 1 FROM quotes q WHERE q.id = quote_id AND q.company_id = get_user_company_id()
));

-- Invoices policies
CREATE POLICY "Users can view invoices in their company" 
ON invoices FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can manage invoices in their company" 
ON invoices FOR ALL 
USING (company_id = get_user_company_id());

-- Invoice Items policies
CREATE POLICY "Users can view invoice items in their company" 
ON invoice_items FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM invoices i WHERE i.id = invoice_id AND i.company_id = get_user_company_id()
));

CREATE POLICY "Users can manage invoice items in their company" 
ON invoice_items FOR ALL 
USING (EXISTS (
  SELECT 1 FROM invoices i WHERE i.id = invoice_id AND i.company_id = get_user_company_id()
));

-- Payments policies
CREATE POLICY "Users can view payments in their company" 
ON payments FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can manage payments in their company" 
ON payments FOR ALL 
USING (company_id = get_user_company_id());

-- Projects policies
CREATE POLICY "Users can view projects in their company" 
ON projects FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can manage projects in their company" 
ON projects FOR ALL 
USING (company_id = get_user_company_id());

-- Tasks policies
CREATE POLICY "Users can view tasks in their company" 
ON tasks FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can manage tasks in their company" 
ON tasks FOR ALL 
USING (company_id = get_user_company_id());

-- Time Entries policies
CREATE POLICY "Users can view time entries in their company" 
ON time_entries FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can manage time entries in their company" 
ON time_entries FOR ALL 
USING (company_id = get_user_company_id());

-- Tickets policies
CREATE POLICY "Users can view tickets in their company" 
ON tickets FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can manage tickets in their company" 
ON tickets FOR ALL 
USING (company_id = get_user_company_id());

-- Workflows policies
CREATE POLICY "Users can view workflows in their company" 
ON workflows FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage workflows in their company" 
ON workflows FOR ALL 
USING (company_id = get_user_company_id() AND is_admin());

-- Workflow Executions policies
CREATE POLICY "Users can view workflow executions in their company" 
ON workflow_executions FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM workflows w WHERE w.id = workflow_id AND w.company_id = get_user_company_id()
));

CREATE POLICY "System can manage workflow executions" 
ON workflow_executions FOR ALL 
USING (EXISTS (
  SELECT 1 FROM workflows w WHERE w.id = workflow_id AND w.company_id = get_user_company_id()
));