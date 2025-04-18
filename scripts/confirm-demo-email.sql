-- Confirm the demo user's email
update auth.users set email_confirmed_at = now() where email = 'demo@fridgeapp.com';

-- Verify the update
select id, email, email_confirmed_at from auth.users where email = 'demo@fridgeapp.com'; 