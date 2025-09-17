-- Fix Critical Security Issues - Enable RLS and Add Policies (Safe Version)
-- Enable Row Level Security on all new tables (safe to run multiple times)
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

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view teams in their company" ON teams;
DROP POLICY IF EXISTS "Admins can manage teams in their company" ON teams;
DROP POLICY IF EXISTS "Users can view their team memberships" ON user_teams;
DROP POLICY IF EXISTS "Admins can manage team memberships" ON user_teams;
DROP POLICY IF EXISTS "Users can view roles in their company" ON roles;
DROP POLICY IF EXISTS "Admins can manage roles in their company" ON roles;
DROP POLICY IF EXISTS "Users can view permissions" ON permissions;
DROP POLICY IF EXISTS "Users can view role permissions in their company" ON role_permissions;
DROP POLICY IF EXISTS "Admins can manage role permissions in their company" ON role_permissions;
DROP POLICY IF EXISTS "Users can view user roles in their company" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles in their company" ON user_roles;
DROP POLICY IF EXISTS "Users can view settings" ON settings;
DROP POLICY IF EXISTS "Users can view company settings" ON company_settings;
DROP POLICY IF EXISTS "Admins can manage company settings" ON company_settings;

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