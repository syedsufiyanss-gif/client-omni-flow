-- Enable Row Level Security (RLS) for multi-company data isolation

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check user permissions
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT 
    CASE 
      WHEN role = 'admin' THEN true
      ELSE permissions ? permission_name OR permissions @> '['"' || permission_name || '"]'::jsonb
    END
  FROM profiles 
  WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Companies policies
CREATE POLICY "Users can view their own company" ON companies
  FOR SELECT USING (id = get_user_company_id());

CREATE POLICY "Admins can update company" ON companies
  FOR UPDATE USING (id = get_user_company_id() AND is_admin());

-- Profiles policies
CREATE POLICY "Users can view profiles in their company" ON profiles
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles in company" ON profiles
  FOR ALL USING (company_id = get_user_company_id() AND is_admin());

-- Leads policies
CREATE POLICY "Users can view leads in their company" ON leads
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can create leads in their company" ON leads
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update leads in their company" ON leads
  FOR UPDATE USING (
    company_id = get_user_company_id() AND 
    (assigned_to = auth.uid() OR has_permission('manage_all_leads'))
  );

CREATE POLICY "Users can delete leads in their company" ON leads
  FOR DELETE USING (
    company_id = get_user_company_id() AND 
    (assigned_to = auth.uid() OR has_permission('manage_all_leads'))
  );

-- Contacts policies
CREATE POLICY "Users can view contacts in their company" ON contacts
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can create contacts in their company" ON contacts
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update contacts in their company" ON contacts
  FOR UPDATE USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete contacts in their company" ON contacts
  FOR DELETE USING (company_id = get_user_company_id() AND has_permission('delete_contacts'));

-- Pipeline stages policies
CREATE POLICY "Users can view pipeline stages in their company" ON pipeline_stages
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Managers can manage pipeline stages" ON pipeline_stages
  FOR ALL USING (company_id = get_user_company_id() AND has_permission('manage_pipelines'));

-- Opportunities policies
CREATE POLICY "Users can view opportunities in their company" ON opportunities
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can create opportunities in their company" ON opportunities
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update opportunities in their company" ON opportunities
  FOR UPDATE USING (
    company_id = get_user_company_id() AND 
    (assigned_to = auth.uid() OR has_permission('manage_all_opportunities'))
  );

CREATE POLICY "Users can delete opportunities in their company" ON opportunities
  FOR DELETE USING (
    company_id = get_user_company_id() AND 
    (assigned_to = auth.uid() OR has_permission('manage_all_opportunities'))
  );

-- Projects policies
CREATE POLICY "Users can view projects in their company" ON projects
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can create projects in their company" ON projects
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Project creators and managers can update projects" ON projects
  FOR UPDATE USING (
    company_id = get_user_company_id() AND 
    (created_by = auth.uid() OR has_permission('manage_all_projects'))
  );

-- Tasks policies
CREATE POLICY "Users can view tasks in their company" ON tasks
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can create tasks in their company" ON tasks
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Assigned users and managers can update tasks" ON tasks
  FOR UPDATE USING (
    company_id = get_user_company_id() AND 
    (assigned_to = auth.uid() OR created_by = auth.uid() OR has_permission('manage_all_tasks'))
  );

-- Quotes policies
CREATE POLICY "Users can view quotes in their company" ON quotes
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can create quotes in their company" ON quotes
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Quote creators and managers can update quotes" ON quotes
  FOR UPDATE USING (
    company_id = get_user_company_id() AND 
    (created_by = auth.uid() OR has_permission('manage_all_quotes'))
  );

-- Quote items policies
CREATE POLICY "Users can view quote items through quotes" ON quote_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_items.quote_id 
      AND quotes.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can manage quote items for their quotes" ON quote_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_items.quote_id 
      AND quotes.company_id = get_user_company_id()
      AND (quotes.created_by = auth.uid() OR has_permission('manage_all_quotes'))
    )
  );

-- Invoices policies
CREATE POLICY "Users can view invoices in their company" ON invoices
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can create invoices in their company" ON invoices
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Invoice creators and finance team can update invoices" ON invoices
  FOR UPDATE USING (
    company_id = get_user_company_id() AND 
    (created_by = auth.uid() OR has_permission('manage_all_invoices') OR has_permission('finance_access'))
  );

-- Invoice items policies (similar to quote items)
CREATE POLICY "Users can view invoice items through invoices" ON invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can manage invoice items for their invoices" ON invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.company_id = get_user_company_id()
      AND (invoices.created_by = auth.uid() OR has_permission('manage_all_invoices') OR has_permission('finance_access'))
    )
  );

-- Payments policies
CREATE POLICY "Finance team can view all payments" ON payments
  FOR SELECT USING (
    company_id = get_user_company_id() AND 
    has_permission('finance_access')
  );

CREATE POLICY "Finance team can manage payments" ON payments
  FOR ALL USING (
    company_id = get_user_company_id() AND 
    has_permission('finance_access')
  );

-- Tickets policies
CREATE POLICY "Support team can view all tickets" ON tickets
  FOR SELECT USING (
    company_id = get_user_company_id() AND 
    (assigned_to = auth.uid() OR created_by = auth.uid() OR has_permission('support_access'))
  );

CREATE POLICY "Users can create tickets" ON tickets
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Assigned users and support team can update tickets" ON tickets
  FOR UPDATE USING (
    company_id = get_user_company_id() AND 
    (assigned_to = auth.uid() OR created_by = auth.uid() OR has_permission('support_access'))
  );

-- Notes policies
CREATE POLICY "Users can view notes in their company" ON notes
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can create notes in their company" ON notes
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Note creators can update their notes" ON notes
  FOR UPDATE USING (company_id = get_user_company_id() AND created_by = auth.uid());

CREATE POLICY "Note creators can delete their notes" ON notes
  FOR DELETE USING (company_id = get_user_company_id() AND created_by = auth.uid());

-- Attachments policies
CREATE POLICY "Users can view attachments in their company" ON attachments
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can upload attachments in their company" ON attachments
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Uploaders can delete their attachments" ON attachments
  FOR DELETE USING (company_id = get_user_company_id() AND uploaded_by = auth.uid());

-- Activities policies
CREATE POLICY "Users can view activities in their company" ON activities
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "System can create activity logs" ON activities
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid() AND company_id = get_user_company_id());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid() AND company_id = get_user_company_id());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

-- Company settings policies
CREATE POLICY "Users can view company settings" ON company_settings
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage company settings" ON company_settings
  FOR ALL USING (company_id = get_user_company_id() AND is_admin());