-- Create some sample leads data for testing
INSERT INTO leads (company_id, first_name, last_name, email, phone, company_name, job_title, status, source, score) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'John', 'Smith', 'john.smith@techcorp.com', '+1-555-0101', 'TechCorp Inc', 'CTO', 'new', 'Website', 85),
('550e8400-e29b-41d4-a716-446655440000', 'Sarah', 'Johnson', 'sarah.j@innovate.com', '+1-555-0102', 'Innovate Solutions', 'Marketing Director', 'contacted', 'Referral', 72),
('550e8400-e29b-41d4-a716-446655440000', 'Michael', 'Chen', 'mchen@startupx.io', '+1-555-0103', 'StartupX', 'CEO', 'qualified', 'Cold Call', 95),
('550e8400-e29b-41d4-a716-446655440000', 'Emily', 'Davis', 'emily.davis@enterprise.com', '+1-555-0104', 'Enterprise Corp', 'VP Sales', 'proposal', 'LinkedIn', 68),
('550e8400-e29b-41d4-a716-446655440000', 'Robert', 'Wilson', 'rwilson@consulting.com', '+1-555-0105', 'Wilson Consulting', 'Principal', 'negotiation', 'Trade Show', 89);