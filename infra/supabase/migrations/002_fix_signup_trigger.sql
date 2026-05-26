-- ============================================================
-- Fix: trigger handle_new_user retornava erro 500 no signup
-- Causa: faltava GRANT explícito para supabase_auth_admin + sem EXCEPTION handler
-- ============================================================

-- Refaz a função com EXCEPTION para não bloquear signup se profile falhar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        )
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log mas não bloqueia o signup do usuário
        RAISE WARNING 'handle_new_user falhou para %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Garante owner correto e privilégios para o trigger rodar no contexto de auth
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- GRANT explícito para auth admin escrever em profiles
GRANT INSERT, SELECT, UPDATE ON public.profiles TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
