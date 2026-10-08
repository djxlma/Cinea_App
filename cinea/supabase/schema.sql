-- CINEA Supabase schema
-- Safe, explicit setup for profiles, reviews, tier lists and items.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id text NOT NULL,
  movie_title text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tier_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tier_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_list_id uuid NOT NULL REFERENCES public.tier_lists(id) ON DELETE CASCADE,
  movie_id text NOT NULL,
  movie_title text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('S', 'A', 'B', 'C', 'D')),
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0)
);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON public.reviews (movie_id);
CREATE INDEX IF NOT EXISTS idx_tier_lists_user_id ON public.tier_lists (user_id);
CREATE INDEX IF NOT EXISTS idx_tier_list_items_tier_list_id ON public.tier_list_items (tier_list_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_username text := NULLIF(NEW.raw_user_meta_data->>'username', '');
  v_display_name text := NULLIF(NEW.raw_user_meta_data->>'display_name', '');
  v_existing_count integer;
BEGIN
  IF v_username IS NOT NULL THEN
    SELECT count(*) INTO v_existing_count
    FROM public.profiles
    WHERE username = v_username;

    IF v_existing_count = 0 THEN
      INSERT INTO public.profiles (id, username, display_name)
      VALUES (NEW.id, v_username, v_display_name)
      ON CONFLICT (id) DO NOTHING;
    ELSE
      INSERT INTO public.profiles (id, display_name)
      VALUES (NEW.id, v_display_name)
      ON CONFLICT (id) DO NOTHING;
    END IF;
  ELSE
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, v_display_name)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_updated_at ON public.tier_lists;
CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE ON public.tier_lists
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
