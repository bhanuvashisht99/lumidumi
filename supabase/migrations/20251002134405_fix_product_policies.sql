-- Allow anonymous access to read products and categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Anyone can view site content" ON site_content;

-- Recreate policies with simpler access
CREATE POLICY "Public read access for categories" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read access for active products" ON products FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public read access for site content" ON site_content FOR SELECT TO anon, authenticated USING (true);

-- Enable anonymous access
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.site_content TO anon;