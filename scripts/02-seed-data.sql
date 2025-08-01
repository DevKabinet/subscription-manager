INSERT INTO users (email, password_hash, role) VALUES
('admin@example.com', '$2a$10$N.o.g.f.o.o.b.a.r.S.a.l.t.E.x.a.m.p.l.e.H.a.s.h.F.o.r.A.d.m.i.n.P.a.s.s.w.o.r.d', 'admin'),
('user@example.com', '$2a$10$N.o.o.b.a.r.S.a.l.t.E.x.a.m.p.l.e.H.a.s.h.F.o.r.U.s.e.r.P.a.s.s.w.o.r.d', 'user');

INSERT INTO clients (user_id, name, email, address, phone) VALUES
((SELECT id FROM users WHERE email = 'user@example.com'), 'Acme Corp', 'acme@example.com', '123 Business Rd, Suite 100, Anytown, USA', '555-123-4567'),
((SELECT id FROM users WHERE email = 'user@example.com'), 'Globex Inc', 'globex@example.com', '456 Commerce St, Unit 200, Otherville, USA', '555-987-6543');

INSERT INTO subscriptions (client_id, plan_name, amount, currency, billing_cycle, start_date, status) VALUES
((SELECT id FROM clients WHERE email = 'acme@example.com'), 'Premium Plan', 99.99, 'USD', 'monthly', '2023-01-01', 'active'),
((SELECT id FROM clients WHERE email = 'globex@example.com'), 'Basic Plan', 29.99, 'USD', 'annually', '2023-03-15', 'active');

INSERT INTO invoices (client_id, invoice_number, issue_date, due_date, subtotal, tax_rate, tax_amount, total_amount, currency, status) VALUES
((SELECT id FROM clients WHERE email = 'acme@example.com'), 'INV-2023-001', '2023-01-01', '2023-01-31', 99.99, 0.08, 8.00, 107.99, 'USD', 'paid'),
((SELECT id FROM clients WHERE email = 'globex@example.com'), 'INV-2023-002', '2023-03-15', '2023-04-14', 29.99, 0.08, 2.40, 32.39, 'USD', 'pending');

INSERT INTO invoice_items (invoice_id, description, amount) VALUES
((SELECT id FROM invoices WHERE invoice_number = 'INV-2023-001'), 'Premium Plan Subscription (Jan 2023)', 99.99),
((SELECT id FROM invoices WHERE invoice_number = 'INV-2023-002'), 'Basic Plan Subscription (Mar 2023 - Mar 2024)', 29.99);

INSERT INTO payments (invoice_id, amount, currency, payment_date, payment_method, transaction_id, status) VALUES
((SELECT id FROM invoices WHERE invoice_number = 'INV-2023-001'), 107.99, 'USD', '2023-01-25', 'Credit Card', 'txn_123456789', 'completed');
