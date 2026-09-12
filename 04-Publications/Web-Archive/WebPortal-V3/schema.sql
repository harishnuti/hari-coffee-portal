-- =====================================================
-- HARI COFFEE ARCHIVE 2026 - SUPABASE SCHEMA
-- Complete PostgreSQL schema for Supabase backend
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: coffee_archive (main audit log - 31 entries)
-- =====================================================
CREATE TABLE coffee_archive (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_num INTEGER,
  date DATE,
  city TEXT,
  cafe_name TEXT,
  coffee_name TEXT,
  varietal TEXT,
  process TEXT,
  roast_level TEXT,
  brew_method TEXT,
  dose_g DECIMAL,
  yield_g DECIMAL,
  ratio TEXT,
  bloom TEXT,
  grinder TEXT,
  price_local TEXT,
  official_notes TEXT,
  your_verdict TEXT,
  technical_enrichment TEXT,
  rating INTEGER DEFAULT 0,
  is_partial BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: beans (bean tracker)
-- =====================================================
CREATE TABLE beans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  roaster TEXT NOT NULL,
  coffee_name TEXT NOT NULL,
  varietal TEXT,
  process TEXT,
  roast_date DATE,
  purchase_date DATE,
  weight_g INTEGER,
  weight_remaining_g INTEGER,
  price_sgd DECIMAL,
  where_bought TEXT,
  is_finished BOOLEAN DEFAULT false,
  finished_date DATE,
  final_rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: brew_sessions
-- =====================================================
CREATE TABLE brew_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bean_id UUID REFERENCES beans(id),
  session_date TIMESTAMPTZ DEFAULT NOW(),
  brew_method TEXT,
  dose_g DECIMAL,
  yield_g DECIMAL,
  ratio TEXT,
  grinder TEXT,
  temp_c INTEGER,
  tasting_note TEXT,
  rating INTEGER,
  hot_note TEXT,
  mid_note TEXT,
  cool_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: wishlist
-- =====================================================
CREATE TABLE wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coffee_name TEXT NOT NULL,
  origin TEXT,
  process TEXT,
  varietal TEXT,
  match_percent INTEGER,
  why_fits TEXT,
  estimated_price TEXT,
  where_to_find TEXT,
  is_purchased BOOLEAN DEFAULT false,
  purchased_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: palate_sessions
-- =====================================================
CREATE TABLE palate_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_date TIMESTAMPTZ DEFAULT NOW(),
  mode TEXT,
  score INTEGER,
  max_score INTEGER,
  accuracy_percent DECIMAL,
  weakest_category TEXT,
  questions_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: saved_recipes
-- =====================================================
CREATE TABLE saved_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_name TEXT,
  origin TEXT,
  varietal TEXT,
  process TEXT,
  brew_method TEXT,
  dose_g DECIMAL,
  yield_g DECIMAL,
  ratio TEXT,
  temp_c INTEGER,
  bloom_g DECIMAL,
  bloom_time_s INTEGER,
  pour_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: visit_log
-- =====================================================
CREATE TABLE visit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_date DATE DEFAULT CURRENT_DATE,
  cafe_name TEXT,
  address TEXT,
  coffees_ordered TEXT,
  notes TEXT,
  rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Enable for all tables
-- =====================================================
ALTER TABLE coffee_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE brew_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE palate_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_log ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users (public read/write for this personal archive)
CREATE POLICY "anon_all" ON coffee_archive FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON beans FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON brew_sessions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON wishlist FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON palate_sessions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON saved_recipes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON visit_log FOR ALL TO anon USING (true) WITH CHECK (true);

-- =====================================================
-- SEED DATA: Insert all 31 archive entries
-- =====================================================

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(1, '2026-01-10', 'Ubud, Bali', 'Seniman Coffee Studio', 'Bali Karana Kintamanis', NULL, 'Natural', 'Light', 'Pour-over', NULL, NULL, NULL, NULL, NULL, NULL, 'Clean citrus; floral', 'Excellent clarity for a natural process, bright and floral.', 'Established foundational exposure to local Indonesian origins.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(2, '2026-01-10', 'Ubud, Bali', 'Seniman Coffee Studio', 'Sulawesi Toraja', NULL, 'Semi-Washed / Wet-Hulled', 'Medium', 'Pour-over', NULL, NULL, NULL, NULL, NULL, NULL, 'Cocoa; earthy structures', 'Heavy body with rich cocoa notes.', 'Demonstrated the structural density of the wet-hulled process.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(3, '2026-01-10', 'Ubud, Bali', 'Seniman Coffee Studio', 'House Blend', NULL, NULL, 'Espresso Roast', 'Piccolo', NULL, NULL, NULL, NULL, NULL, NULL, 'Balanced', 'Great milk integration.', 'Baseline for espresso and milk pairing.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(4, '2026-02-15', 'Singapore', 'Kyuukei Coffee', 'Kenya Kiamugumo AA', NULL, 'Washed', NULL, 'Pour-over (Flat-Bottom)', NULL, NULL, NULL, NULL, '120mm Hybrid Burr', NULL, NULL, 'Excellent baseline for clarity.', 'Established a high-clarity washed baseline using 120mm hybrid burrs and flat-bottom geometry.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(5, '2026-02-28', 'Singapore', 'Kyuukei Coffee', 'Kenya Ndiaini AA', NULL, 'Washed', NULL, 'Pour-over', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'High clarity.', 'Further exploration of Kenyan terroir.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(6, '2026-03-01', 'Mumbai', 'Subko Coffee Roasters', 'Project Pearl Ratnagiri', NULL, 'Experimental Anaerobic', NULL, 'Pour-over', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Clean and balanced despite intense process.', 'Analyzed advanced experimental processing in India.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(7, '2026-03-08', 'Mumbai', 'Grey Soul Coffee Roasters', 'Raspberry in Loop', NULL, 'Multi-stage Anaerobic', NULL, 'Pour-over', NULL, NULL, NULL, NULL, NULL, NULL, 'Chocolate', 'Heavy body, over-smoothed expression muted the brightness.', 'Observed how heavy fermentation can mute terroir.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(8, '2026-03-15', 'Singapore', 'Apartment Coffee', 'Colombia Wush Wush', 'Wush Wush', 'Washed', NULL, 'Pour-over', NULL, NULL, NULL, NULL, NULL, NULL, 'Tea-like', 'Incredible tea-like clarity.', 'Mapped the delicate genetics of Wush Wush.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(9, '2026-03-18', 'Singapore', 'Agora Coffee', 'Nicaragua Matagalpa', NULL, 'Washed', 'Espresso Roast', 'Flat White', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Solid milk beverage.', 'Audited Central American washed profile in milk.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(10, '2026-03-18', 'Singapore', 'Agora Coffee', 'Ethiopia Beloya', NULL, 'Natural', NULL, 'V60', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Classic natural profile.', 'Baseline check for Ethiopian naturals.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(11, '2026-03-20', 'Singapore', 'Tiong Hoe', 'Brazil Natural', NULL, 'Natural', NULL, 'Pour-over', NULL, NULL, NULL, NULL, NULL, NULL, 'Rich, chocolate-forward', 'Classic dense Brazilian profile.', 'Audited traditional natural processing sweetness and body.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(12, '2026-04-01', 'Singapore', 'Maxi Coffee Bar', 'Colombia La Laja', 'Sudan Rume', 'Washed', NULL, 'Pour-over (Flat-Bottom)', 15, 225, '1:15', NULL, 'Timemore Sculptor 078 (SSP 78mm)', NULL, 'Raspberry; Nectarine; Floral', 'Successfully isolated the intended tasting notes.', 'Technical milestone in auditing rare genetics with 78mm SSP flat burrs and hybrid flat-bottom geometry.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(13, '2026-04-05', 'Singapore', 'Asylum Coffeehouse', 'Castillo Watermelon (Jairo Arcila)', 'Castillo', 'Washed Co-Ferment', NULL, 'Pour-over', 15, 225, '1:15', NULL, 'Timemore Sculptor 078 (SSP)', '12.50', 'Watermelon; Mint; Lime; Chocolate', 'Distinct fruit-forward expression; sweetness layered rather than sharp', 'Fermentation adds aromatic complexity; processing-driven identity rather than terroir.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(14, '2026-04-05', 'Singapore', 'Asylum Coffeehouse', 'Peru Gesha (Wilder Garcia)', 'Gesha', 'Washed', NULL, 'Pour-over', 15, 225, '1:15', NULL, 'Timemore Sculptor 078 (SSP)', '12.50', 'Jasmine; Caramel; Lime; Cacao Nibs', 'Clean, structured, high-clarity cup', 'High transparency; minimal processing interference highlighting intrinsic genetic purity.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(15, '2026-04-05', 'Singapore', 'Lume Cafe', 'Panama Corpachi Geisha', 'Geisha', 'Red Honey', 'Light', 'V60 Manual Pour-over', 15, 225, '1:15', NULL, 'Mahlkönig EK43', '12.00', 'Mandarin Candy; Jasmine; Apricot', 'Apricot detected clearly. Structured and elegant — sweet without being cloying. Body rounder than expected for a washed.', 'Dual-temp strategy (90°C → 70°C) on EK43 layered extraction — high-temp unlocked jasmine florals and bright acids; low-temp stabilised body and extended the clean apricot finish. Red Honey process added roundness without ferment noise.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(16, '2026-04-18', 'Johor Bahru', NULL, 'Hacienda La Florida', 'Typica Mejorado', 'Anaerobic Washed', NULL, 'Origami (Conical)', 18, 277, '1:15.4', '1:2.3 (42g for 30s)', 'Mahlkönig EK Omnia', '35.00', 'Lemon verbena; red plum; citronella; hibiscus', 'Excellent. Lime when hot, distinct plum as it cooled.', 'EK Omnia and Origami conical filter drove extreme clarity; temperature shift perfectly isolated the citric (lime) to malic (plum) transition.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(17, '2026-04-24', 'Singapore', 'Agora Coffee', 'Brazil Santuário Sul', NULL, 'Natural Fermentation', 'Light-Medium', 'V60', 16, 224, '1:14', NULL, 'Mahlkönig EK43', NULL, 'Blackcurrant; black cherry; dark chocolate', 'Full body; prominent blackcurrant; clear chocolaty finish.', 'Tight 1:14 ratio engineered max body; EK43 98mm burrs provided necessary clarity to keep fermented natural fruit clean and finish non-bitter.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(18, '2026-05-06', 'Singapore', 'Nylon Coffee Roasters', 'Brazil FAF Organic', 'Arara', 'Natural', 'Filter Roast', 'xBloom (Flat-Bottom)', 15, 255, '1:17', NULL, 'Mahlkönig CORE', '7.50', 'Red Apple; Cherry; Raisin; Milk Chocolate', 'Solid body with a crisp green apple (malic) front, resolving into a smooth milk chocolate finish.', '1:17 lean ratio on xBloom automated flat-bottom maximised clarity; Arara natural processing yielded excellent structural body while maintaining crisp malic acidity.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(19, '2026-05-06', 'Singapore', 'Nylon Coffee Roasters', 'Brazil Serra dos Ciganos', 'Catucai 24/137', 'Natural', 'Espresso Roast', 'Flat White', NULL, NULL, NULL, NULL, NULL, NULL, 'Sultana; Dried Apricot; Praline; Roasted Hazelnut', 'Good cup with a very pleasant, lingering sweet aftertaste.', 'Milk fats bound perfectly with the natural processed espresso, creating a long, comforting finish.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(20, '2026-05-07', 'Singapore', 'Nylon Coffee Roasters', 'Ethiopia Banko Gotiti', 'Heirloom', 'Washed', 'Filter Roast', 'xBloom (Flat-Bottom)', 15, 255, '1:17', NULL, 'Mahlkönig CORE', '8.50', 'Lemonade; Raspberry; Peach; Bergamot', 'Lemon front, heavy melon mid-cup, fading into a clean white tea finish.', '1:17 lean ratio on xBloom isolated volatile citric acids; IMF-roasted heirloom Washed Ethiopian at peak degas window.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(21, '2026-05-07', 'Singapore', 'Nylon Coffee Roasters', 'Nicaragua Buena Vista', 'Parainema', 'Natural Anaerobic', 'Espresso Roast', 'Single Espresso', NULL, NULL, '~1:2', NULL, NULL, NULL, 'Chiku; Stewed Cherry; Dried Apricot; Brazil Nut', 'Thick, syrupy body. Highly fermented, savory/not sweet, with a very long lingering finish.', 'Anaerobic fermentation metabolized sugars into complex savory esters; 9-bar espresso emulsification drove heavy, lingering oil-based viscosity.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(22, '2026-05-19', 'Singapore', 'Pocket by Flip (Flip Coffee Roasters)', 'Ecuador La Papaya', 'Geisha', 'Washed', 'Light', 'Filter Hot - Flat Bottom (Hario Alpha)', 15, 225, '1:15', NULL, 'Mahlkönig CORE (54mm Flat Burr)', '18.00', 'Fresh Apricot; Rooibos; Lemon Thyme; Toffee Apple', 'Opening: tartaric apricot + rooibos aspalathin. Mid: thymol terpene coat — lipid-binding persistent to midway. Cooling: malic apple shift + caramelised sucrose. Clean transparent fade. No linalool/jasmine — distinct from Peru Geisha entries.', 'Triple-temp cascade (92→75→92°C) on CORE flat burr + Hario Alpha flat-bottom preserved heat-sensitive thymol terpenes from 2100 MASL Loja terroir. Highest-altitude Geisha in archive. Terpene-forward Ecuador profile clearly differentiated from linalool-forward Peru Geisha.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(23, '2026-05-08', 'Singapore', 'Alchemist (Raffles Place)', 'El Morito', 'Marshell', 'Washed', 'Filter Roast', 'V60 Pour-over', 15, 240, '1:16', NULL, 'Mahlkönig EK43S (98mm Flat Burr)', NULL, 'Yellow Plum; Orange; Cane Sugar', 'Simultaneous citric-malic acid overlap with integrated cane sugar — smooth and refreshing with excellent mid-palate juiciness. Confirmed: I love this bean.', 'EK43S 98mm flat burrs + V60 conical at 1:16 delivered perfect dual-acid integration (citric orange + malic plum) without single-note dominance. Sucrose extraction at 1:16 bridged acid structure into clean cane sugar finish.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(24, '2026-05-12', 'Singapore', 'Kurasu', 'Indonesia Frinsa Estate', 'Local Varietals', 'Extended Fermentation Honey', 'Light', 'Pour-over (Hario Alpha)', 15, 225, '1:16', NULL, 'Mahlkönig EK43S', 'SGD 9.50', 'Floral aroma; Stewed Strawberries; Grapefruit; Brown Sugar; Black Tea', 'Floral taste with a sweet coating on the tongue that gradually sticks and fades off cleanly like sugar and tea aftertaste.', 'Multi-temperature pour (80→95→80°C) with Hario Alpha flat-bottom perfectly managed heavy honey process sugars — clear floral extraction at lower temps, dissolving jammy mucilage at peak heat, finishing cleanly.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(25, '2026-05-13', 'Singapore', 'The Community Coffee (Hamilton)', 'Jose Mancia Honduras', 'Typica', 'Natural', 'Filter Roast', 'Pour-over (Hario Switch)', 15, 255, '1:17', NULL, 'Mahlkönig EK43', 'SGD 9.00', 'Kiwi; Oolong Tea; Chocolate Truffle', 'Pretty good. Kiwi and oolong tea style, full bodied. Short finish with slight hints of chocolate.', 'Typica inherent lipid clarity + raised-bed drying produced clean tea-structure body. EK43 + Hario Switch immersion phase stabilised full mouthfeel at 1:17. Short finish consistent with 15-days-off-roast volatile taper.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(26, '2026-05-15', 'Singapore', 'Alchemist (Ocean Financial Centre)', 'Ijen Laurina', 'Hybrid Laurina', 'Anaerobic Natural', 'Light', 'V60 Pour-over', 15, 240, '1:16', NULL, 'Mahlkönig EK43S', 'SGD 8.50', 'Hibiscus; Red Apple; Hawthorn', 'Felt hibiscus hot. Mid temp showed apple paste. Cooled to a honeyed character. Full bodied. Textbook style flavours — definitely a good one.', '90°C brew temp suppressed lactic ester over-extraction while preserving volatile anthocyanin hibiscus esters. Laurina low-caffeine allowed intrinsic sucrose to express as clean honeyed finish. Anaerobic Natural transformed malic acid into jammy apple paste.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(27, '2026-05-16', 'Singapore', 'FLUID', 'El Obraje', 'Gesha', 'Washed', 'Light', 'Flatbed Dripper', 15, 230, '1:15.3', NULL, 'Option-O Lagom P64 (64mm Flat Burr)', 'SGD 14.00', 'Mango; Orange Blossom; Nectarine; Honey', 'Damn the taste so nice — the orange nectarine finishing with that honey is terrific. Love this one. So far my favourite. The honey sweetness lingers and taste changes as temperature cools.', 'Lagom P64 64mm flats + flatbed dripper matches Asylum Entry #013/#014 hardware — enables pure terroir delta between Colombia and Peru Geshas. 92°C at 1:15.3 maximised floral ester retention and stabilised malic acids.', false);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(28, '2026-04-01', 'Singapore', 'Nylon Coffee Roasters', 'Colombia Sidra', 'Sidra', 'Double Anaerobic', NULL, 'Flat-bottom Pour-over', 15, 210, '1:14', NULL, NULL, NULL, NULL, 'Technical calibration visit.', 'Flat-bottom at 1:14 — dense ratio for body-forward extraction of double anaerobic Sidra. Partial entry — full sensory data not captured.', true);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(29, '2026-04-01', 'Singapore', 'Kurasu', 'El Salvador Pacamara', 'Pacamara', 'Natural', NULL, 'Flat-bottom Pour-over', 15, 210, '1:14', NULL, NULL, NULL, NULL, 'Technical calibration visit.', 'Pacamara natural at 1:14 flat-bottom — dense ratio to capture full body of large-bean natural. Partial entry — full sensory data not captured.', true);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(30, '2026-04-01', 'Johor Bahru', 'Mid Valley Mall Cafe', 'Honduras Co-ferment', NULL, 'Co-ferment', NULL, 'Flat-bottom Pour-over', 15, 210, '1:14', NULL, NULL, NULL, NULL, 'Day trip specialty coffee stop — JB.', 'Partial entry — JB day trip. Co-ferment Honduras at 1:14 flat-bottom. Full data not captured.', true);

INSERT INTO coffee_archive (entry_num, date, city, cafe_name, coffee_name, varietal, process, roast_level, brew_method, dose_g, yield_g, ratio, bloom, grinder, price_local, official_notes, your_verdict, technical_enrichment, is_partial) VALUES 
(31, '2026-04-01', 'Johor Bahru', 'KSL Mall Cafe', 'Kenya AA', NULL, 'Washed', NULL, 'Flat-bottom Pour-over', 15, 210, '1:14', NULL, NULL, NULL, NULL, 'Day trip specialty coffee stop — JB.', 'Partial entry — JB day trip. Kenya AA washed at 1:14 flat-bottom. Full data not captured.', true);

-- =====================================================
-- SEED: Pre-populate wishlist with 5 recommendations
-- =====================================================
INSERT INTO wishlist (coffee_name, origin, process, varietal, match_percent, why_fits, estimated_price, where_to_find, is_purchased) VALUES 
('Finca Deborah Elipse Gesha Nitrogen', 'Panama', 'Nitrogen Macerated Washed', 'Gesha', 95, 'Priority audit goal - highest altitude Panama Geisha with experimental processing. Matches your love for structured, high-clarity Geishas like Peru Wilder and Ecuador La Papaya.', 'SGD 45-55/100g', 'Homeground Coffee Roasters (911 Bukit Timah)', false),
('Harazi Natural Yemen', 'Yemen', 'Natural', 'Heirloom', 88, 'First Yemen natural - extreme rarity, matches your interest in unique processing and terroir. Exposure Therapy has excellent lots.', 'SGD 35-45/100g', 'Exposure Therapy Coffee (various pop-ups)', false),
('Alo Chilaka Honey 74158', 'Ethiopia', 'Honey', '74158', 82, 'Experimental Ethiopian from Aera - aligns with your Sudan Rume and Banko Gotiti exploration. High clarity potential.', 'SGD 28-35/100g', 'Aera Experiments (limited releases)', false),
('Colombia La Laja Sudan Rume (rested)', 'Colombia', 'Washed', 'Sudan Rume', 90, 'Re-audit after proper rest (June 2026+). Your April entry was too fresh; now peak window for raspberry/nectarine.', 'SGD 22-28/100g', 'Maxi Coffee Bar or Nylon Coffee Roasters', false),
('Eugenioides (any farm)', 'Colombia/Ethiopia', 'Washed/Natural', 'Eugenioides', 75, 'Rarest varietal goal - low caffeine, unique floral profile. Watch for any release in Singapore market.', 'SGD 50+/100g', 'Specialty importers / auctions', false);

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX idx_coffee_archive_date ON coffee_archive(date);
CREATE INDEX idx_coffee_archive_cafe ON coffee_archive(cafe_name);
CREATE INDEX idx_coffee_archive_city ON coffee_archive(city);
CREATE INDEX idx_beans_roaster ON beans(roaster);
CREATE INDEX idx_brew_sessions_bean ON brew_sessions(bean_id);

-- =====================================================
-- Updated at trigger (optional but recommended)
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_coffee_archive_updated_at BEFORE UPDATE ON coffee_archive FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Hari Coffee Archive Supabase schema created successfully with 31 seed entries!' as status;
