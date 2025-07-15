
-- Initial setup for e-commerce application

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  stock INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  total_price INTEGER NOT NULL,
  customer_info JSONB NOT NULL,
  items JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders_tracking table
CREATE TABLE public.orders_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_logs table
CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create recycle_bin table
CREATE TABLE public.recycle_bin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_table TEXT NOT NULL,
  original_id UUID NOT NULL,
  data JSONB NOT NULL,
  deleted_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create app_settings table
CREATE TABLE public.app_settings (
  id TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create settings_history table
CREATE TABLE public.settings_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_id TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create variant_options table
CREATE TABLE public.variant_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral_codes table
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_uses INTEGER NOT NULL DEFAULT 0,
  total_commission_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral_transactions table
CREATE TABLE public.referral_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code TEXT NOT NULL,
  referrer_id UUID NOT NULL,
  referred_user_id UUID,
  order_id UUID NOT NULL,
  order_total INTEGER NOT NULL,
  commission_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_profiles_firebase_uid ON public.profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_status ON public.referral_transactions(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE UNIQUE CONSTRAINT profiles_firebase_uid_unique ON public.profiles (firebase_uid);

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_tracking_updated_at 
  BEFORE UPDATE ON public.orders_tracking 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variant_options_updated_at
  BEFORE UPDATE ON public.variant_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycle_bin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_options ENABLE ROW LEVEL SECURITY;

-- Create is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- RLS Policies for products
CREATE POLICY "Public can view products" 
  ON public.products 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert products" 
  ON public.products 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update products" 
  ON public.products 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete products" 
  ON public.products 
  FOR DELETE 
  USING (true);

-- RLS Policies for profiles
CREATE POLICY "Allow read access to profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow profile creation" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow profile updates" 
  ON public.profiles 
  FOR UPDATE 
  USING (true);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders or admins can view all" 
  ON public.orders 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    user_id IS NULL OR 
    public.is_admin()
  );

CREATE POLICY "Anyone can create orders (authenticated or guest)" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "Admins can update any order" 
  ON public.orders 
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete orders" 
  ON public.orders 
  FOR DELETE 
  USING (public.is_admin());

-- RLS Policies for other tables (admin only)
CREATE POLICY "Admins can view all orders" 
  ON public.orders_tracking FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Admins can insert orders" 
  ON public.orders_tracking FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update orders" 
  ON public.orders_tracking FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admin can manage variant options" ON public.variant_options
  FOR ALL USING (true);

CREATE POLICY "Anyone can view app settings" 
  ON public.app_settings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can update app settings" 
  ON public.app_settings 
  FOR UPDATE 
  USING (public.is_admin());

-- Insert default data
INSERT INTO public.app_settings (id, value, description) 
VALUES ('referral_commission_rate', '{"rate": 3}', 'Referral commission rate in percentage');

-- Insert variant options
INSERT INTO public.variant_options (category, variant_name, options, is_required) VALUES 
('Kerupuk', 'rasa', '["Original", "Pedas", "BBQ", "Balado"]', true),
('Kerupuk', 'gram', '["100g", "250g", "500g"]', true),
('Bon Cabe', 'level', '["Level 10", "Level 30", "Level 50"]', true),
('Bon Cabe', 'gram', '["40g", "80g", "160g"]', true),
('Makanan Ringan', 'rasa', '["Original", "Pedas", "Manis", "Asin"]', false),
('Makanan Ringan', 'gram', '["50g", "100g", "200g"]', false),
('Bumbu Dapur', 'kemasan', '["Sachet", "Botol", "Refill"]', false),
('Bumbu Dapur', 'gram', '["20g", "50g", "100g", "250g"]', true),
('Makanan Siap Saji', 'porsi', '["1 Porsi", "2 Porsi", "Family Pack"]', false),
('Makanan Siap Saji', 'level_pedas', '["Tidak Pedas", "Sedang", "Pedas", "Extra Pedas"]', false),
('Bahan Masak Beku', 'jenis', '["Daging Sapi", "Daging Ayam", "Seafood", "Nugget", "Sosis", "Bakso"]', true),
('Bahan Masak Beku', 'berat', '["250g", "500g", "1kg", "2kg"]', true),
('Bahan Masak Beku', 'kemasan', '["Plastik Vacuum", "Box Styrofoam", "Kantong Plastik"]', false),
('Sayur Segar/Beku', 'jenis', '["Bayam", "Kangkung", "Sawi", "Brokoli", "Wortel", "Kentang", "Bawang Merah", "Bawang Putih"]', true),
('Sayur Segar/Beku', 'kondisi', '["Segar", "Beku"]', true),
('Sayur Segar/Beku', 'berat', '["250g", "500g", "1kg"]', true),
('Sayur Segar/Beku', 'kemasan', '["Plastik", "Kantong Jaring", "Box"]', false),
('Sayur Beku', 'jenis', '["Mixed Vegetables", "Corn", "Green Beans", "Edamame", "Spinach", "Broccoli"]', true),
('Sayur Beku', 'berat', '["300g", "500g", "1kg"]', true),
('Sayur Beku', 'kemasan', '["Plastik Vacuum", "Box Karton"]', false);

-- Insert sample products
INSERT INTO public.products (name, description, price, category, image_url) VALUES
('Kerupuk Seblak Kering', 'Kerupuk seblak kering dengan rasa pedas yang autentik', 800, 'Makanan Ringan', '/placeholder.svg'),
('Bon Cabe Level 50', 'Bumbu cabai level pedas maksimal untuk masakan Indonesia', 600, 'Bumbu Dapur', '/placeholder.svg'),
('Bon Cabe Level 10 & 30', 'Bumbu cabai dengan pilihan level pedas sedang', 500, 'Bumbu Dapur', '/placeholder.svg'),
('Cuanki Baraka', 'Makanan siap saji cuanki dengan kuah gurih', 1200, 'Makanan Siap Saji', '/placeholder.svg'),
('Seblak Baraka', 'Makanan siap saji seblak pedas ala Bandung', 1100, 'Makanan Siap Saji', '/placeholder.svg'),
('Basreng Pedas', 'Bakso goreng pedas khas Bandung', 700, 'Makanan Ringan', '/placeholder.svg'),
('Basreng Original', 'Bakso goreng original tanpa pedas', 650, 'Makanan Ringan', '/placeholder.svg'),
('Nangka Muda (Gori)', 'Nangka muda beku siap olah untuk sayur asem', 900, 'Bahan Masak Beku', '/placeholder.svg'),
('Pete Kupas Frozen', 'Pete kupas beku berkualitas tinggi', 1500, 'Bahan Masak Beku', '/placeholder.svg'),
('Daun Kemangi', 'Daun kemangi segar untuk lalapan dan masakan', 400, 'Sayur Segar/Beku', '/placeholder.svg'),
('Daun Singkong Frozen', 'Daun singkong beku siap masak', 600, 'Sayur Beku', '/placeholder.svg'),
('Daun Pepaya', 'Daun pepaya segar untuk sayur dan lalapan', 450, 'Sayur Segar/Beku', '/placeholder.svg');

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  auth.uid() IS NOT NULL
);
