-- Run this in Supabase SQL Editor (https://supabase.com/dashboard > SQL Editor)

CREATE TABLE certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cert_number SERIAL,
  project_name TEXT NOT NULL,
  project_logo TEXT,
  audit_period TEXT NOT NULL,
  retest_date TEXT,
  lead_auditor TEXT NOT NULL DEFAULT 'Shashank (Co-founder)',
  report_version TEXT NOT NULL DEFAULT 'Final',
  audited_contract TEXT,
  network TEXT,
  contract_audited TEXT,
  contract_retested TEXT,
  owasp_framework TEXT DEFAULT 'SCSVS / SCWE / SCSTG',
  methodology TEXT DEFAULT 'Manual Review',
  critical INTEGER DEFAULT 0,
  high INTEGER DEFAULT 0,
  medium INTEGER DEFAULT 0,
  low INTEGER DEFAULT 0,
  info INTEGER DEFAULT 0,
  gas INTEGER DEFAULT 0,
  issue_date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Start cert_number at 3 as requested
SELECT setval('certificates_cert_number_seq', 2);
