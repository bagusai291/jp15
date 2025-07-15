
-- Create table untuk menyimpan template varian berdasarkan kategori
CREATE TABLE public.variant_options (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  variant_name text NOT NULL, -- contoh: "rasa", "level", "gram"
  options jsonb NOT NULL DEFAULT '[]'::jsonb, -- array options: ["Original", "Pedas", "BBQ"]
  is_required boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert data default untuk beberapa kategori
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
('Makanan Siap Saji', 'level_pedas', '["Tidak Pedas", "Sedang", "Pedas", "Extra Pedas"]', false);

-- Add trigger untuk update timestamp
CREATE TRIGGER update_variant_options_updated_at
  BEFORE UPDATE ON public.variant_options
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS (jika diperlukan untuk keamanan admin)
ALTER TABLE public.variant_options ENABLE ROW LEVEL SECURITY;

-- Policy untuk admin bisa CRUD variant options
CREATE POLICY "Admin can manage variant options" ON public.variant_options
  FOR ALL USING (true);
