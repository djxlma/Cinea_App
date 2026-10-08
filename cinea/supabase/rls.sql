-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_list_items ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
CREATE POLICY "Authenticated users can read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- reviews
DROP POLICY IF EXISTS "Authenticated users can read reviews" ON public.reviews;
CREATE POLICY "Authenticated users can read reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
CREATE POLICY "Users can insert own reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews"
ON public.reviews
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- tier_lists
DROP POLICY IF EXISTS "Users can read own tier lists" ON public.tier_lists;
CREATE POLICY "Users can read own tier lists"
ON public.tier_lists
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tier lists" ON public.tier_lists;
CREATE POLICY "Users can insert own tier lists"
ON public.tier_lists
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tier lists" ON public.tier_lists;
CREATE POLICY "Users can update own tier lists"
ON public.tier_lists
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tier lists" ON public.tier_lists;
CREATE POLICY "Users can delete own tier lists"
ON public.tier_lists
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- tier_list_items
DROP POLICY IF EXISTS "Users can read only items from own tier lists" ON public.tier_list_items;
CREATE POLICY "Users can read only items from own tier lists"
ON public.tier_list_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tier_lists tl
    WHERE tl.id = tier_list_items.tier_list_id
      AND tl.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert items only in own tier lists" ON public.tier_list_items;
CREATE POLICY "Users can insert items only in own tier lists"
ON public.tier_list_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.tier_lists tl
    WHERE tl.id = tier_list_items.tier_list_id
      AND tl.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update items only in own tier lists" ON public.tier_list_items;
CREATE POLICY "Users can update items only in own tier lists"
ON public.tier_list_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tier_lists tl
    WHERE tl.id = tier_list_items.tier_list_id
      AND tl.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.tier_lists tl
    WHERE tl.id = tier_list_items.tier_list_id
      AND tl.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete items only in own tier lists" ON public.tier_list_items;
CREATE POLICY "Users can delete items only in own tier lists"
ON public.tier_list_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tier_lists tl
    WHERE tl.id = tier_list_items.tier_list_id
      AND tl.user_id = auth.uid()
  )
);
