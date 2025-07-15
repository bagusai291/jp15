
-- Menambahkan variant options untuk kategori bahan masak beku dan sayuran
INSERT INTO public.variant_options (category, variant_name, options, is_required) VALUES 
-- Bahan Masak Beku
('Bahan Masak Beku', 'jenis', '["Daging Sapi", "Daging Ayam", "Seafood", "Nugget", "Sosis", "Bakso"]', true),
('Bahan Masak Beku', 'berat', '["250g", "500g", "1kg", "2kg"]', true),
('Bahan Masak Beku', 'kemasan', '["Plastik Vacuum", "Box Styrofoam", "Kantong Plastik"]', false),

-- Sayur Segar/Beku
('Sayur Segar/Beku', 'jenis', '["Bayam", "Kangkung", "Sawi", "Brokoli", "Wortel", "Kentang", "Bawang Merah", "Bawang Putih"]', true),
('Sayur Segar/Beku', 'kondisi', '["Segar", "Beku"]', true),
('Sayur Segar/Beku', 'berat', '["250g", "500g", "1kg"]', true),
('Sayur Segar/Beku', 'kemasan', '["Plastik", "Kantong Jaring", "Box"]', false),

-- Sayur Beku
('Sayur Beku', 'jenis', '["Mixed Vegetables", "Corn", "Green Beans", "Edamame", "Spinach", "Broccoli"]', true),
('Sayur Beku', 'berat', '["300g", "500g", "1kg"]', true),
('Sayur Beku', 'kemasan', '["Plastik Vacuum", "Box Karton"]', false);
