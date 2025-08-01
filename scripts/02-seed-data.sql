-- Seed Clients
INSERT INTO clients (name, email, phone, address) VALUES
('GlobalTech Solutions', 'contact@globaltech.com', '123-456-7890', '100 Tech Park, Silicon Valley, CA'),
('Innovate Marketing Inc.', 'info@innovatemarketing.com', '098-765-4321', '200 Creative Lane, New York, NY'),
('Future Systems Ltd.', 'support@futuresystems.co.uk', '44-20-1234-5678', '300 Innovation Drive, London, UK');

-- Seed Subscriptions
INSERT INTO subscriptions (client_id, plan_name, amount, currency, billing_cycle, start_date, status) VALUES
((SELECT id FROM clients WHERE email = 'contact@globaltech.com'), 'Enterprise Plan', 500.00, 'USD', 'monthly', '2023-01-01', 'active'),
((SELECT id FROM clients WHERE email = 'innovatemarketing.com'), 'Pro Plan', 100.00, 'USD', 'monthly', '2023-02-15', 'active'),
((SELECT id FROM clients WHERE email = 'support@futuresystems.co.uk'), 'Basic Plan', 50.00, 'GBP', 'annually', '2023-03-01', 'active');

-- Seed Invoices
INSERT INTO invoices (subscription_id, client_id, invoice_number, issue_date, due_date, total_amount, currency, status) VALUES
((SELECT id FROM subscriptions WHERE plan_name = 'Enterprise Plan' AND client_id = (SELECT id FROM clients WHERE email = 'contact@globaltech.com')), (SELECT id FROM clients WHERE email = 'contact@globaltech.com'), 'INV-2023-001', '2023-01-01', '2023-01-31', 500.00, 'USD', 'paid'),
((SELECT id FROM subscriptions WHERE plan_name = 'Pro Plan' AND client_id = (SELECT id FROM clients WHERE email = 'innovatemarketing.com')), (SELECT id FROM clients WHERE email = 'innovatemarketing.com'), 'INV-2023-002', '2023-02-15', '2023-03-15', 100.00, 'USD', 'pending'),
((SELECT id FROM subscriptions WHERE plan_name = 'Basic Plan' AND client_id = (SELECT id FROM clients WHERE email = 'support@futuresystems.co.uk')), (SELECT id FROM clients WHERE email = 'support@futuresystems.co.uk'), 'INV-2023-003', '2023-03-01', '2024-03-01', 50.00, 'GBP', 'paid');

-- Seed Invoice Items
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES
((SELECT id FROM invoices WHERE invoice_number = 'INV-2023-001'), 'Enterprise Plan Subscription', 1, 500.00, 500.00),
((SELECT id FROM invoices WHERE invoice_number = 'INV-2023-002'), 'Pro Plan Subscription', 1, 100.00, 100.00),
((SELECT id FROM invoices WHERE invoice_number = 'INV-2023-003'), 'Basic Plan Annual Subscription', 1, 50.00, 50.00);

-- Seed Payments
INSERT INTO payments (invoice_id, amount, currency, payment_method, transaction_id, status) VALUES
((SELECT id FROM invoices WHERE invoice_number = 'INV-2023-001'), 500.00, 'USD', 'Credit Card', 'TXN-001', 'completed'),
((SELECT id FROM invoices WHERE invoice_number = 'INV-2023-003'), 50.00, 'GBP', 'Bank Transfer', 'TXN-002', 'completed');
