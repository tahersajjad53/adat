INSERT INTO public.user_roles (user_id, role)
VALUES ('18a8d9d7-4bc9-439b-860e-ff30ec506e1f', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;