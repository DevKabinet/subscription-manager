ALTER TABLE clients
ADD COLUMN company_name VARCHAR(255),
ADD COLUMN vat_number VARCHAR(255);

ALTER TABLE invoices
ADD COLUMN company_name VARCHAR(255),
ADD COLUMN company_address TEXT,
ADD COLUMN company_email VARCHAR(255),
ADD COLUMN client_name VARCHAR(255),
ADD COLUMN client_email VARCHAR(255),
ADD COLUMN client_address TEXT;

-- Update existing invoices with dummy company/client info for demonstration
UPDATE invoices
SET
    company_name = 'Subscription Manager Inc.',
    company_address = '789 Tech Lane, Silicon Valley, CA 94043',
    company_email = 'info@subscriptionmanager.com',
    client_name = (SELECT name FROM clients WHERE clients.id = invoices.client_id),
    client_email = (SELECT email FROM clients WHERE clients.id = invoices.client_id),
    client_address = (SELECT address FROM clients WHERE clients.id = invoices.client_id);

-- Add a column to track the associated subscription for an invoice
ALTER TABLE invoices
ADD COLUMN subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL;

-- Update existing invoices to link them to subscriptions (if applicable)
UPDATE invoices
SET subscription_id = s.id
FROM subscriptions s
WHERE invoices.client_id = s.client_id
  AND invoices.issue_date >= s.start_date
  AND (s.end_date IS NULL OR invoices.issue_date <= s.end_date)
  AND invoices.total_amount = s.amount + (s.amount * invoices.tax_rate); -- Simple heuristic for linking
