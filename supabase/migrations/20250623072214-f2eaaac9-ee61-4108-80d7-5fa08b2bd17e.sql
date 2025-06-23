
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'l1_review', 'l2_review', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contract_items table
CREATE TABLE public.contract_items (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  parent_item_id UUID REFERENCES public.contract_items(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  delivered_quantity INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_subitem BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL UNIQUE,
  submission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attachments table
CREATE TABLE public.attachments (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create approval_history table
CREATE TABLE public.approval_history (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  approver_level INTEGER NOT NULL CHECK (approver_level IN (1, 2, 3)),
  approver_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'modified')),
  changed_fields JSONB,
  notes TEXT,
  action_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_contracts_vendor_id ON public.contracts(vendor_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contract_items_contract_id ON public.contract_items(contract_id);
CREATE INDEX idx_submissions_contract_id ON public.submissions(contract_id);
CREATE INDEX idx_approval_history_submission_id ON public.approval_history(submission_id);

-- Insert sample vendors
INSERT INTO public.vendors (name, email, phone, address) VALUES
('ABC Manufacturing', 'contact@abcmfg.com', '+1-555-0101', '123 Industrial Blvd, Manufacturing City, MC 12345'),
('XYZ Corp', 'info@xyzcorp.com', '+1-555-0102', '456 Business Ave, Corporate Town, CT 67890');

-- Insert sample contracts
INSERT INTO public.contracts (vendor_id, project_name, total_amount, start_date, description, status) 
SELECT 
  v.id,
  'Office Renovation Phase 1',
  50000.00,
  '2024-02-01',
  'Complete office renovation including furniture and equipment installation',
  'submitted'
FROM public.vendors v WHERE v.name = 'ABC Manufacturing';

INSERT INTO public.contracts (vendor_id, project_name, total_amount, start_date, description, status) 
SELECT 
  v.id,
  'IT Infrastructure Upgrade',
  75000.00,
  '2024-02-15',
  'Network equipment and server installation for main office',
  'l1_review'
FROM public.vendors v WHERE v.name = 'XYZ Corp';

-- Insert sample contract items
INSERT INTO public.contract_items (contract_id, description, quantity, delivered_quantity, unit_price, is_subitem)
SELECT 
  c.id,
  'Office Desks',
  20,
  0,
  500.00,
  false
FROM public.contracts c WHERE c.project_name = 'Office Renovation Phase 1';

INSERT INTO public.contract_items (contract_id, description, quantity, delivered_quantity, unit_price, is_subitem)
SELECT 
  c.id,
  'Ergonomic Chairs',
  20,
  0,
  300.00,
  false
FROM public.contracts c WHERE c.project_name = 'Office Renovation Phase 1';

INSERT INTO public.contract_items (contract_id, description, quantity, delivered_quantity, unit_price, is_subitem)
SELECT 
  c.id,
  'Conference Tables',
  5,
  0,
  800.00,
  false
FROM public.contracts c WHERE c.project_name = 'Office Renovation Phase 1';

INSERT INTO public.contract_items (contract_id, description, quantity, delivered_quantity, unit_price, is_subitem)
SELECT 
  c.id,
  'Network Switches',
  10,
  8,
  1200.00,
  false
FROM public.contracts c WHERE c.project_name = 'IT Infrastructure Upgrade';

INSERT INTO public.contract_items (contract_id, description, quantity, delivered_quantity, unit_price, is_subitem)
SELECT 
  c.id,
  'Server Racks',
  3,
  3,
  2500.00,
  false
FROM public.contracts c WHERE c.project_name = 'IT Infrastructure Upgrade';

-- Insert sample submissions
INSERT INTO public.submissions (contract_id, vendor_id, tracking_number, submission_date, status_notes)
SELECT 
  c.id,
  c.vendor_id,
  'TRK-20240120-001',
  '2024-01-20T09:30:00Z',
  NULL
FROM public.contracts c WHERE c.project_name = 'Office Renovation Phase 1';

INSERT INTO public.submissions (contract_id, vendor_id, tracking_number, submission_date, status_notes)
SELECT 
  c.id,
  c.vendor_id,
  'TRK-20240119-002',
  '2024-01-19T14:20:00Z',
  'Partial delivery - 2 network switches pending'
FROM public.contracts c WHERE c.project_name = 'IT Infrastructure Upgrade';

-- Insert sample approval history
INSERT INTO public.approval_history (submission_id, approver_level, approver_id, action, changed_fields, notes, action_date)
SELECT 
  s.id,
  1,
  'USER-002',
  'modified',
  '{"deliveredQuantity": {"before": 10, "after": 8}}'::jsonb,
  'Updated delivered quantity due to partial shipment',
  '2024-01-20T10:15:00Z'
FROM public.submissions s WHERE s.tracking_number = 'TRK-20240119-002';

-- Function to generate tracking numbers
CREATE OR REPLACE FUNCTION generate_tracking_number() RETURNS TEXT AS $$
DECLARE
  date_part TEXT;
  sequence_part TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  sequence_part := LPAD(EXTRACT(EPOCH FROM NOW())::INTEGER % 1000, 3, '0');
  RETURN 'TRK-' || date_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all access for now - can be refined based on authentication needs)
CREATE POLICY "Allow all access to vendors" ON public.vendors FOR ALL USING (true);
CREATE POLICY "Allow all access to contracts" ON public.contracts FOR ALL USING (true);
CREATE POLICY "Allow all access to contract_items" ON public.contract_items FOR ALL USING (true);
CREATE POLICY "Allow all access to submissions" ON public.submissions FOR ALL USING (true);
CREATE POLICY "Allow all access to attachments" ON public.attachments FOR ALL USING (true);
CREATE POLICY "Allow all access to approval_history" ON public.approval_history FOR ALL USING (true);
