INSERT INTO opm.billing(id, deleted, name, initial_billing, additional_interest, total_payments, balance, payment_order, billing_summary_id, frozen) VALUES(1, false, 'FERS Deposit', 13571.33, 15298.61, 8449.61, 20420.33, 1, 1, false);
INSERT INTO opm.billing(id, deleted, name, initial_billing, additional_interest, total_payments, balance, payment_order, billing_summary_id, frozen) VALUES(2, false, 'FERS Redeposit', 13548.24, 18136.03, 7149.38, 24534.88, 2, 1, false);
INSERT INTO opm.billing(id, deleted, name, initial_billing, additional_interest, total_payments, balance, payment_order, billing_summary_id, frozen) VALUES(3, false, 'CSRS Post 3/91 Redeposit', 17656.0, 16621.32, 5798.56, 28478.76, 3, 1, false);
INSERT INTO opm.billing(id, deleted, name, initial_billing, additional_interest, total_payments, balance, payment_order, billing_summary_id, frozen) VALUES(4, false, 'CSRS Post82/Pre91 Redeposit', 16278.99, 16237.45, 6514.87, 26001.57, 4, 1, false);
INSERT INTO opm.billing(id, deleted, name, initial_billing, additional_interest, total_payments, balance, payment_order, billing_summary_id, frozen) VALUES(5, false, 'CSRS Pre 10/82 Redeposit', 14064.74, 19096.39, 6811.78, 26349.35, 5, 1, false);
INSERT INTO opm.billing(id, deleted, name, initial_billing, additional_interest, total_payments, balance, payment_order, billing_summary_id, frozen) VALUES(6, false, 'CSRS Post 10/82 Deposit', 18754.47, 18341.08, 7658.91, 29436.64, 6, 1, false);
INSERT INTO opm.billing(id, deleted, name, initial_billing, additional_interest, total_payments, balance, payment_order, billing_summary_id, frozen) VALUES(7, false, 'CSRS Pre 10/82 Deposit', 18830.3, 9295.31, 5398.97, 22726.64, 7, 1, false);
INSERT INTO opm.billing(id, deleted, name, initial_billing, additional_interest, total_payments, balance, payment_order, billing_summary_id, frozen) VALUES(8, false, 'FERS Peace Corps', 10383.14, 17012.48, 7644.43, 19751.19, 8, 1, false);
INSERT INTO opm.billing(id, deleted, name, initial_billing, additional_interest, total_payments, balance, payment_order, billing_summary_id, frozen) VALUES(9, false, 'CSRS Peace Corps', 10199.26, 9459.89, 6778.98, 12880.17, 9, 1, false);
ALTER SEQUENCE opm.billing_id_seq RESTART WITH 10;