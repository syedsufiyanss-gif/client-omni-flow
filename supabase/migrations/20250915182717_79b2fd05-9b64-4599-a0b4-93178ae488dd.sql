-- Create demo user account
-- Note: This will create a user in auth.users and the trigger will automatically create the profile
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  raw_user_meta_data,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_confirm_token_sent_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  is_super_admin,
  role,
  aud,
  instance_id
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'admin@acme.com',
  crypt('password', gen_salt('bf')),
  '{"first_name": "Admin", "last_name": "User"}',
  now(),
  now(),
  now(),
  '',
  now(),
  null,
  now(),
  '{"provider": "email", "providers": ["email"]}',
  false,
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (email) DO NOTHING;

-- Create some sample leads data
INSERT INTO leads (company_id, first_name, last_name, email, phone, company_name, job_title, status, source, score) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'John', 'Smith', 'john.smith@techcorp.com', '+1-555-0101', 'TechCorp Inc', 'CTO', 'new', 'Website', 85),
('550e8400-e29b-41d4-a716-446655440000', 'Sarah', 'Johnson', 'sarah.j@innovate.com', '+1-555-0102', 'Innovate Solutions', 'Marketing Director', 'contacted', 'Referral', 72),
('550e8400-e29b-41d4-a716-446655440000', 'Michael', 'Chen', 'mchen@startupx.io', '+1-555-0103', 'StartupX', 'CEO', 'qualified', 'Cold Call', 95),
('550e8400-e29b-41d4-a716-446655440000', 'Emily', 'Davis', 'emily.davis@enterprise.com', '+1-555-0104', 'Enterprise Corp', 'VP Sales', 'proposal', 'LinkedIn', 68),
('550e8400-e29b-41d4-a716-446655440000', 'Robert', 'Wilson', 'rwilson@consulting.com', '+1-555-0105', 'Wilson Consulting', 'Principal', 'negotiation', 'Trade Show', 89);