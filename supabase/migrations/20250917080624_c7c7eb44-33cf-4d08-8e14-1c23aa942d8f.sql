-- Fix Critical Security Issues - Enable RLS and Add Policies
-- Enable Row Level Security on all new tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for Teams
CREATE POLICY "Users can view teams in their company" 
ON teams FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage teams in their company" 
ON teams FOR ALL 
USING (company_id = get_user_company_id() AND is_admin());

-- Create RLS Policies for User Teams
CREATE POLICY "Users can view their team memberships" 
ON user_teams FOR SELECT 
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM teams t WHERE t.id = team_id AND t.company_id = get_user_company_id()
));

CREATE POLICY "Admins can manage team memberships" 
ON user_teams FOR ALL 
USING (EXISTS (
  SELECT 1 FROM teams t WHERE t.id = team_id AND t.company_id = get_user_company_id() AND is_admin()
));

-- Create RLS Policies for Roles
CREATE POLICY "Users can view roles in their company" 
ON roles FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage roles in their company" 
ON roles FOR ALL 
USING (company_id = get_user_company_id() AND is_admin());

-- Create RLS Policies for Permissions (Global read access)
CREATE POLICY "Users can view permissions" 
ON permissions FOR SELECT 
USING (true);

-- Create RLS Policies for Role Permissions
CREATE POLICY "Users can view role permissions in their company" 
ON role_permissions FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM roles r WHERE r.id = role_id AND r.company_id = get_user_company_id()
));

CREATE POLICY "Admins can manage role permissions in their company" 
ON role_permissions FOR ALL 
USING (EXISTS (
  SELECT 1 FROM roles r WHERE r.id = role_id AND r.company_id = get_user_company_id() AND is_admin()
));

-- Create RLS Policies for User Roles
CREATE POLICY "Users can view user roles in their company" 
ON user_roles FOR SELECT 
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM roles r WHERE r.id = role_id AND r.company_id = get_user_company_id()
));

CREATE POLICY "Admins can manage user roles in their company" 
ON user_roles FOR ALL 
USING (EXISTS (
  SELECT 1 FROM roles r WHERE r.id = role_id AND r.company_id = get_user_company_id() AND is_admin()
));

-- Create RLS Policies for Settings (Global read access)
CREATE POLICY "Users can view settings" 
ON settings FOR SELECT 
USING (true);

-- Create RLS Policies for Company Settings
CREATE POLICY "Users can view company settings" 
ON company_settings FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage company settings" 
ON company_settings FOR ALL 
USING (company_id = get_user_company_id() AND is_admin());

-- Create RLS Policies for Custom Field Definitions
CREATE POLICY "Users can view custom field definitions in their company" 
ON custom_field_definitions FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage custom field definitions in their company" 
ON custom_field_definitions FOR ALL 
USING (company_id = get_user_company_id() AND is_admin());

-- Create RLS Policies for Custom Field Values
CREATE POLICY "Users can view custom field values in their company" 
ON custom_field_values FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can manage custom field values in their company" 
ON custom_field_values FOR ALL 
USING (company_id = get_user_company_id());

-- Create RLS Policies for Contacts
CREATE POLICY "Users can view contacts in their company" 
ON contacts FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can create contacts in their company" 
ON contacts FOR INSERT 
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update contacts in their company" 
ON contacts FOR UPDATE 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete contacts in their company" 
ON contacts FOR DELETE 
USING (company_id = get_user_company_id());

-- Create RLS Policies for Accounts
CREATE POLICY "Users can view accounts in their company" 
ON accounts FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can create accounts in their company" 
ON accounts FOR INSERT 
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update accounts in their company" 
ON accounts FOR UPDATE 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete accounts in their company" 
ON accounts FOR DELETE 
USING (company_id = get_user_company_id());

-- Create RLS Policies for Pipelines
CREATE POLICY "Users can view pipelines in their company" 
ON pipelines FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage pipelines in their company" 
ON pipelines FOR ALL 
USING (company_id = get_user_company_id() AND is_admin());

-- Create RLS Policies for Pipeline Stages
CREATE POLICY "Users can view pipeline stages in their company" 
ON pipeline_stages FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM pipelines p WHERE p.id = pipeline_id AND p.company_id = get_user_company_id()
));

CREATE POLICY "Admins can manage pipeline stages in their company" 
ON pipeline_stages FOR ALL 
USING (EXISTS (
  SELECT 1 FROM pipelines p WHERE p.id = pipeline_id AND p.company_id = get_user_company_id() AND is_admin()
));

-- Create RLS Policies for Deals
CREATE POLICY "Users can view deals in their company" 
ON deals FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can create deals in their company" 
ON deals FOR INSERT 
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update deals in their company" 
ON deals FOR UPDATE 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete deals in their company" 
ON deals FOR DELETE 
USING (company_id = get_user_company_id());

-- Create RLS Policies for Products
CREATE POLICY "Users can view products in their company" 
ON products FOR SELECT 
USING (company_id = get_user_company_id());

CREATE POLICY "Users can manage products in their company" 
ON products FOR ALL 
USING (company_id = get_user_company_id());