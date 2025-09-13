-- Seed data for CRM system

-- Insert sample companies
INSERT INTO companies (id, name, slug, domain, email, phone, currency, timezone) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Acme Corporation', 'acme-corp', 'acme.com', 'contact@acme.com', '+1-555-0123', 'USD', 'America/New_York'),
  ('550e8400-e29b-41d4-a716-446655440002', 'TechFlow Solutions', 'techflow', 'techflow.io', 'hello@techflow.io', '+1-555-0456', 'USD', 'America/Los_Angeles'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Global Industries', 'global-ind', 'globalind.com', 'info@globalind.com', '+44-20-7946-0958', 'GBP', 'Europe/London');

-- Insert default pipeline stages for each company
INSERT INTO pipeline_stages (company_id, name, description, probability, position, color) VALUES
  -- Acme Corporation stages
  ('550e8400-e29b-41d4-a716-446655440001', 'Lead', 'Initial contact made', 10, 1, '#6B7280'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Qualified', 'Lead has been qualified', 25, 2, '#3B82F6'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Proposal', 'Proposal sent to client', 50, 3, '#F59E0B'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Negotiation', 'In negotiation phase', 75, 4, '#EF4444'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Closed Won', 'Deal successfully closed', 100, 5, '#10B981'),
  
  -- TechFlow Solutions stages
  ('550e8400-e29b-41d4-a716-446655440002', 'Discovery', 'Understanding client needs', 15, 1, '#6B7280'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Demo', 'Product demonstration', 30, 2, '#3B82F6'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Proposal', 'Proposal and pricing', 60, 3, '#F59E0B'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Decision', 'Client decision making', 80, 4, '#EF4444'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Won', 'Deal won', 100, 5, '#10B981'),
  
  -- Global Industries stages
  ('550e8400-e29b-41d4-a716-446655440003', 'Initial Contact', 'First contact established', 5, 1, '#6B7280'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Needs Analysis', 'Analyzing requirements', 20, 2, '#8B5CF6'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Quotation', 'Quote provided', 45, 3, '#F59E0B'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Review', 'Under client review', 70, 4, '#EF4444'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Closed', 'Deal completed', 100, 5, '#10B981');

-- Insert default company settings
INSERT INTO company_settings (company_id, category, key, value, description) VALUES
  -- Acme Corporation settings
  ('550e8400-e29b-41d4-a716-446655440001', 'general', 'company_name', '"Acme Corporation"', 'Company display name'),
  ('550e8400-e29b-41d4-a716-446655440001', 'general', 'time_format', '"12h"', 'Time format preference'),
  ('550e8400-e29b-41d4-a716-446655440001', 'general', 'date_format', '"MM/DD/YYYY"', 'Date format preference'),
  ('550e8400-e29b-41d4-a716-446655440001', 'billing', 'default_tax_rate', '8.5', 'Default tax rate percentage'),
  ('550e8400-e29b-41d4-a716-446655440001', 'billing', 'invoice_prefix', '"INV-"', 'Invoice number prefix'),
  ('550e8400-e29b-41d4-a716-446655440001', 'billing', 'quote_prefix', '"QUO-"', 'Quote number prefix'),
  ('550e8400-e29b-41d4-a716-446655440001', 'notifications', 'email_notifications', 'true', 'Enable email notifications'),
  ('550e8400-e29b-41d4-a716-446655440001', 'notifications', 'browser_notifications', 'true', 'Enable browser notifications'),
  ('550e8400-e29b-41d4-a716-446655440001', 'automation', 'auto_assign_leads', 'true', 'Automatically assign leads'),
  ('550e8400-e29b-41d4-a716-446655440001', 'automation', 'lead_assignment_method', '"round_robin"', 'Lead assignment method'),
  
  -- TechFlow Solutions settings
  ('550e8400-e29b-41d4-a716-446655440002', 'general', 'company_name', '"TechFlow Solutions"', 'Company display name'),
  ('550e8400-e29b-41d4-a716-446655440002', 'general', 'time_format', '"24h"', 'Time format preference'),
  ('550e8400-e29b-41d4-a716-446655440002', 'general', 'date_format', '"DD/MM/YYYY"', 'Date format preference'),
  ('550e8400-e29b-41d4-a716-446655440002', 'billing', 'default_tax_rate', '10.0', 'Default tax rate percentage'),
  ('550e8400-e29b-41d4-a716-446655440002', 'billing', 'invoice_prefix', '"TF-INV-"', 'Invoice number prefix'),
  ('550e8400-e29b-41d4-a716-446655440002', 'billing', 'quote_prefix', '"TF-QUO-"', 'Quote number prefix'),
  ('550e8400-e29b-41d4-a716-446655440002', 'notifications', 'email_notifications', 'true', 'Enable email notifications'),
  ('550e8400-e29b-41d4-a716-446655440002', 'notifications', 'browser_notifications', 'false', 'Enable browser notifications'),
  ('550e8400-e29b-41d4-a716-446655440002', 'automation', 'auto_assign_leads', 'false', 'Automatically assign leads'),
  
  -- Global Industries settings
  ('550e8400-e29b-41d4-a716-446655440003', 'general', 'company_name', '"Global Industries"', 'Company display name'),
  ('550e8400-e29b-41d4-a716-446655440003', 'general', 'time_format', '"24h"', 'Time format preference'),
  ('550e8400-e29b-41d4-a716-446655440003', 'general', 'date_format', '"DD/MM/YYYY"', 'Date format preference'),
  ('550e8400-e29b-41d4-a716-446655440003', 'billing', 'default_tax_rate', '20.0', 'Default tax rate percentage'),
  ('550e8400-e29b-41d4-a716-446655440003', 'billing', 'invoice_prefix', '"GI-"', 'Invoice number prefix'),
  ('550e8400-e29b-41d4-a716-446655440003', 'billing', 'quote_prefix', '"GI-Q-"', 'Quote number prefix'),
  ('550e8400-e29b-41d4-a716-446655440003', 'notifications', 'email_notifications', 'true', 'Enable email notifications'),
  ('550e8400-e29b-41d4-a716-446655440003', 'notifications', 'browser_notifications', 'true', 'Enable browser notifications'),
  ('550e8400-e29b-41d4-a716-446655440003', 'automation', 'auto_assign_leads', 'true', 'Automatically assign leads'),
  ('550e8400-e29b-41d4-a716-446655440003', 'automation', 'lead_assignment_method', '"least_loaded"', 'Lead assignment method');