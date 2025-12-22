-- Replace the UUID below with an existing auth.users id.
-- Example: select id from auth.users where email = 'you@example.com';

insert into public.categories (user_id, name, type, icon)
values
  ('YOUR_USER_ID_HERE', 'Mercado', 'expense', 'shopping-cart'),
  ('YOUR_USER_ID_HERE', 'Restaurantes', 'expense', 'utensils'),
  ('YOUR_USER_ID_HERE', 'Transporte', 'expense', 'car'),
  ('YOUR_USER_ID_HERE', 'Moradia', 'expense', 'home'),
  ('YOUR_USER_ID_HERE', 'Salario', 'income', 'wallet');

insert into public.accounts (user_id, name, kind)
values
  ('YOUR_USER_ID_HERE', 'Conta Principal', 'checking'),
  ('YOUR_USER_ID_HERE', 'Cartao Viagem', 'credit');

insert into public.transactions (user_id, amount, amount_cf, merchant, date, status, source)
values
  ('YOUR_USER_ID_HERE', 230.90, -230.90, 'Supermercado Central', current_date - 2, 'pending', 'csv'),
  ('YOUR_USER_ID_HERE', 89.90, -89.90, 'Streaming Plus', current_date - 5, 'confirmed', 'manual'),
  ('YOUR_USER_ID_HERE', 4200.00, 4200.00, 'Pagamento Salario', current_date - 6, 'confirmed', 'manual');
