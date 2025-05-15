-- Seed data for food safety database

-- Food Categories
INSERT INTO public.food_categories (id, name, description, icon)
VALUES
    (uuid_generate_v4(), 'Dairy', 'Milk products including cheese, yogurt, and milk itself.', 'milk'),
    (uuid_generate_v4(), 'Protein', 'Meat, eggs, nuts, and other protein-rich foods.', 'egg'),
    (uuid_generate_v4(), 'Seafood', 'Fish, shellfish, and other seafood products.', 'fish'),
    (uuid_generate_v4(), 'Fruits', 'Various types of fruits and fruit products.', 'apple'),
    (uuid_generate_v4(), 'Vegetables', 'Various types of vegetables and vegetable products.', 'carrot'),
    (uuid_generate_v4(), 'Grains', 'Breads, cereals, pasta, and other grain products.', 'bread'),
    (uuid_generate_v4(), 'Beverages', 'Various drinks and liquid refreshments.', 'coffee'),
    (uuid_generate_v4(), 'Desserts', 'Sweet treats and after-meal delights.', 'cake'),
    (uuid_generate_v4(), 'Condiments', 'Sauces, dressings, and flavor enhancers.', 'ketchup')
ON CONFLICT (name) DO NOTHING;

-- Get IDs for the categories (for reference in foods table)
DO $$
DECLARE
    dairy_id UUID;
    protein_id UUID;
    seafood_id UUID;
    fruits_id UUID;
    vegetables_id UUID;
    grains_id UUID;
    beverages_id UUID;
    desserts_id UUID;
    condiments_id UUID;
BEGIN
    SELECT id INTO dairy_id FROM public.food_categories WHERE name = 'Dairy';
    SELECT id INTO protein_id FROM public.food_categories WHERE name = 'Protein';
    SELECT id INTO seafood_id FROM public.food_categories WHERE name = 'Seafood';
    SELECT id INTO fruits_id FROM public.food_categories WHERE name = 'Fruits';
    SELECT id INTO vegetables_id FROM public.food_categories WHERE name = 'Vegetables';
    SELECT id INTO grains_id FROM public.food_categories WHERE name = 'Grains';
    SELECT id INTO beverages_id FROM public.food_categories WHERE name = 'Beverages';
    SELECT id INTO desserts_id FROM public.food_categories WHERE name = 'Desserts';
    SELECT id INTO condiments_id FROM public.food_categories WHERE name = 'Condiments';

    -- Dairy
    INSERT INTO public.foods (category_id, name, safety_rating, description, alternatives, nutritional_info)
    VALUES
        (dairy_id, 'Cheese (Hard)', 'safe', 'Hard cheeses like cheddar, parmesan, and swiss are safe during pregnancy. They are low in moisture and less likely to harbor harmful bacteria.', 'No alternatives needed as this is a safe option.', '{"calcium": "high", "protein": "high", "fat": "high"}'),
        (dairy_id, 'Cheese (Soft, Pasteurized)', 'safe', 'Soft cheeses that are clearly labeled as made with pasteurized milk are safe to eat during pregnancy.', 'No alternatives needed as this is a safe option.', '{"calcium": "high", "protein": "medium", "fat": "high"}'),
        (dairy_id, 'Cheese (Soft, Unpasteurized)', 'avoid', 'Unpasteurized soft cheeses like brie, camembert, feta, blue cheese, queso fresco, and queso blanco may contain listeria bacteria, which can cause serious illness.', 'Pasteurized versions of these cheeses, or hard cheeses like cheddar and swiss.', '{"calcium": "high", "protein": "medium", "fat": "high"}'),
        (dairy_id, 'Milk (Pasteurized)', 'safe', 'Pasteurized milk is safe to drink during pregnancy and provides calcium and vitamin D.', 'No alternatives needed as this is a safe option.', '{"calcium": "high", "protein": "medium", "vitamins": ["D", "B12"]}'),
        (dairy_id, 'Milk (Unpasteurized/Raw)', 'avoid', 'Raw or unpasteurized milk may contain harmful bacteria like listeria, salmonella, and E. coli.', 'Pasteurized milk, plant-based milk alternatives.', '{"calcium": "high", "protein": "medium", "vitamins": ["D", "B12"]}'),
        (dairy_id, 'Yogurt (Pasteurized)', 'safe', 'Pasteurized yogurt is safe and beneficial during pregnancy, providing probiotics, calcium, and protein.', 'No alternatives needed as this is a safe option.', '{"calcium": "high", "protein": "high", "probiotics": "high"}');

    -- Protein
    INSERT INTO public.foods (category_id, name, safety_rating, description, alternatives, nutritional_info)
    VALUES
        (protein_id, 'Eggs (Fully Cooked)', 'safe', 'Eggs cooked until both the white and yolk are firm are safe to eat during pregnancy.', 'No alternatives needed as this is a safe option.', '{"protein": "high", "vitamins": ["B12", "D"]}'),
        (protein_id, 'Eggs (Raw or Runny)', 'avoid', 'Raw or undercooked eggs may contain salmonella bacteria. This includes foods containing raw eggs like homemade mayonnaise, some salad dressings, raw cookie dough, and certain desserts.', 'Fully cooked eggs, pasteurized egg products.', '{"protein": "high", "vitamins": ["B12", "D"]}'),
        (protein_id, 'Chicken (Fully Cooked)', 'safe', 'Fully cooked chicken is a safe and excellent source of protein during pregnancy.', 'No alternatives needed as this is a safe option.', '{"protein": "high", "fat": "low", "vitamins": ["B6", "B12"]}'),
        (protein_id, 'Deli Meats/Lunch Meats', 'caution', 'Deli meats and lunch meats can harbor listeria bacteria. They should be avoided unless heated until steaming hot just before serving.', 'Freshly cooked meats or heat deli meats until steaming hot before consumption.', '{"protein": "high", "sodium": "high"}'),
        (protein_id, 'Pâté (Refrigerated)', 'avoid', 'Refrigerated pâtés and meat spreads may contain listeria bacteria.', 'Canned or shelf-stable pâté, or well-cooked alternatives.', '{"protein": "medium", "fat": "high", "vitamins": ["A"]}'),
        (protein_id, 'Nuts and Seeds', 'safe', 'Nuts and seeds are safe and nutritious during pregnancy, providing protein, healthy fats, and various vitamins and minerals.', 'No alternatives needed as this is a safe option.', '{"protein": "medium", "fat": "high", "fiber": "medium", "minerals": ["magnesium", "selenium", "zinc"]}');

    -- Seafood
    INSERT INTO public.foods (category_id, name, safety_rating, description, alternatives, nutritional_info)
    VALUES
        (seafood_id, 'Salmon (Cooked)', 'safe', 'Salmon is low in mercury and high in omega-3 fatty acids, which are beneficial for baby''s brain development. Ensure it''s fully cooked.', 'No alternatives needed as this is a safe option when properly cooked.', '{"protein": "high", "omega3": "high", "vitamins": ["D", "B12"]}'),
        (seafood_id, 'Tuna (Canned Light)', 'caution', 'Canned light tuna has less mercury than albacore/white tuna. Limit to 2-3 servings per week (about 12 oz total).', 'Other low-mercury fish like salmon, shrimp, or cod.', '{"protein": "high", "omega3": "medium", "mercury": "low-medium"}'),
        (seafood_id, 'Tuna (Albacore/White)', 'caution', 'Albacore/white tuna has more mercury than light tuna. Limit to 1 serving per week (about 6 oz).', 'Canned light tuna or other low-mercury fish.', '{"protein": "high", "omega3": "medium", "mercury": "medium"}'),
        (seafood_id, 'High-Mercury Fish', 'avoid', 'Avoid shark, swordfish, king mackerel, tilefish, marlin, orange roughy, and bigeye tuna due to high mercury content, which can harm the developing nervous system.', 'Low-mercury fish like salmon, shrimp, catfish, and canned light tuna.', '{"protein": "high", "omega3": "varies", "mercury": "high"}'),
        (seafood_id, 'Shellfish (Cooked)', 'safe', 'Cooked shellfish like shrimp, lobster, and crab are safe to eat during pregnancy. They are low in mercury and high in protein and nutrients.', 'No alternatives needed as this is a safe option when properly cooked.', '{"protein": "high", "zinc": "high", "iron": "medium"}'),
        (seafood_id, 'Sushi (Raw Fish)', 'avoid', 'Raw fish sushi may contain parasites and bacteria. It should be avoided during pregnancy.', 'Cooked fish sushi, vegetable sushi, or California rolls made with imitation crab (which is cooked).', '{"protein": "high", "omega3": "varies"}'),
        (seafood_id, 'Smoked Seafood (Refrigerated)', 'caution', 'Refrigerated smoked seafood may contain listeria. It should be avoided unless cooked thoroughly, as in a casserole.', 'Canned or shelf-stable smoked seafood, or thoroughly cooked smoked seafood.', '{"protein": "high", "sodium": "high"}');

    -- Fruits
    INSERT INTO public.foods (category_id, name, safety_rating, description, alternatives, nutritional_info)
    VALUES
        (fruits_id, 'Avocado', 'safe', 'Avocados are rich in folate, potassium, vitamin C, and vitamin B6, all beneficial during pregnancy.', 'No alternatives needed as this is a safe option.', '{"folate": "high", "potassium": "high", "vitamins": ["C", "B6"], "healthy_fats": "high"}'),
        (fruits_id, 'Berries', 'safe', 'Berries are high in vitamins, antioxidants, and fiber. Wash thoroughly before consumption.', 'No alternatives needed as this is a safe option.', '{"fiber": "medium", "vitamins": ["C"], "antioxidants": "high"}'),
        (fruits_id, 'Citrus Fruits', 'safe', 'Oranges, grapefruits, lemons, and other citrus fruits are excellent sources of vitamin C. Wash thoroughly before consumption.', 'No alternatives needed as this is a safe option.', '{"fiber": "medium", "vitamins": ["C"], "folate": "medium"}'),
        (fruits_id, 'Dried Fruits', 'caution', 'Dried fruits are nutritious but high in sugar and calories. Consume in moderation and choose unsulfured versions when possible.', 'Fresh fruits or dried fruits without added sugar or sulfur.', '{"fiber": "high", "sugar": "high", "iron": "medium"}'),
        (fruits_id, 'Unwashed Fruits', 'avoid', 'Unwashed fruits may harbor bacteria, pesticides, and parasites. Always wash fruits thoroughly before eating.', 'Thoroughly washed fruits or pre-washed packaged fruits.', null);

    -- Vegetables
    INSERT INTO public.foods (category_id, name, safety_rating, description, alternatives, nutritional_info)
    VALUES
        (vegetables_id, 'Leafy Greens (Washed)', 'safe', 'Leafy greens like spinach, kale, and lettuce are rich in folate, iron, and other nutrients. Wash thoroughly before consumption to remove any contaminants.', 'No alternatives needed as this is a safe option.', '{"folate": "high", "iron": "medium", "vitamins": ["A", "C", "K"]}'),
        (vegetables_id, 'Sprouts (Raw)', 'avoid', 'Raw sprouts like alfalfa, clover, radish, and mung bean may contain bacteria like E. coli and Salmonella. The warm, humid conditions needed for sprouting are also ideal for bacteria growth.', 'Thoroughly cooked sprouts, other fresh vegetables like lettuce or spinach.', '{"protein": "low", "vitamins": ["C", "K"]}'),
        (vegetables_id, 'Unwashed Vegetables', 'avoid', 'Unwashed vegetables may harbor bacteria, pesticides, and parasites. Always wash vegetables thoroughly before eating or cooking.', 'Thoroughly washed vegetables or pre-washed packaged vegetables.', null),
        (vegetables_id, 'Pre-packaged Salads', 'caution', 'Pre-packaged salads have been linked to listeria outbreaks. Wash thoroughly even if labeled as "pre-washed" and consume before the use-by date.', 'Freshly prepared salads from thoroughly washed ingredients.', '{"fiber": "high", "vitamins": ["varies"]}');

    -- Grains
    INSERT INTO public.foods (category_id, name, safety_rating, description, alternatives, nutritional_info)
    VALUES
        (grains_id, 'Whole Grains', 'safe', 'Whole grains like brown rice, whole wheat bread, and oats are excellent sources of fiber, vitamins, and minerals during pregnancy.', 'No alternatives needed as this is a safe option.', '{"fiber": "high", "vitamins": ["B"], "minerals": ["iron", "magnesium"]}'),
        (grains_id, 'White Bread and Pasta', 'safe', 'White bread and pasta are safe to eat during pregnancy, though they have less nutritional value than whole grain versions.', 'Whole grain breads and pastas for more nutrients and fiber.', '{"fiber": "low", "vitamins": ["B", "fortified"]}'),
        (grains_id, 'Raw Dough or Batter', 'avoid', 'Raw dough or batter containing uncooked flour or eggs may contain harmful bacteria like E. coli or Salmonella.', 'Fully baked goods, or enjoy the finished product rather than the raw dough.', null);

    -- Beverages
    INSERT INTO public.foods (category_id, name, safety_rating, description, alternatives, nutritional_info)
    VALUES
        (beverages_id, 'Water', 'safe', 'Water is the best hydration option during pregnancy. Aim for 8-10 glasses daily.', 'No alternatives needed as this is a safe option.', '{"hydration": "high", "minerals": ["varies by source"]}'),
        (beverages_id, 'Coffee', 'caution', 'Limit caffeine intake to 200mg per day (about one 12oz cup of coffee). High caffeine intake has been linked to growth restriction and increased risk of miscarriage.', 'Decaffeinated coffee, herbal teas (check which ones are safe), or fruit-infused water.', '{"caffeine": "high"}'),
        (beverages_id, 'Tea (Black/Green)', 'caution', 'Black and green teas contain caffeine. Include these in your daily caffeine limit of 200mg.', 'Herbal caffeine-free teas (check which ones are safe), decaffeinated tea.', '{"caffeine": "medium", "antioxidants": "high"}'),
        (beverages_id, 'Herbal Tea', 'caution', 'Some herbal teas are safe during pregnancy, while others should be avoided. Safe options include ginger, peppermint, and red raspberry leaf (in the third trimester). Avoid teas containing herbs with medicinal properties.', 'Check with your healthcare provider about specific herbal teas.', '{"caffeine": "low/none", "benefits": "varies by herb"}'),
        (beverages_id, 'Alcohol', 'avoid', 'No amount of alcohol has been proven safe during pregnancy. Drinking alcohol can cause fetal alcohol spectrum disorders (FASDs).', 'Non-alcoholic mocktails, sparkling water with fruit, or other non-alcoholic beverages.', null),
        (beverages_id, 'Unpasteurized Juices', 'avoid', 'Unpasteurized or fresh-squeezed juice may contain harmful bacteria like E. coli.', 'Pasteurized juices or juices you prepare from well-washed fruits.', '{"vitamins": ["varies by fruit"], "sugar": "high"}');

    -- Desserts
    INSERT INTO public.foods (category_id, name, safety_rating, description, alternatives, nutritional_info)
    VALUES
        (desserts_id, 'Baked Desserts', 'safe', 'Fully baked desserts are generally safe during pregnancy. Try to choose options that are lower in sugar and processed ingredients.', 'No alternatives needed as this is a safe option when consumed in moderation.', '{"sugar": "high", "calories": "high"}'),
        (desserts_id, 'Ice Cream (Commercial)', 'safe', 'Commercial ice cream made with pasteurized milk is safe during pregnancy. Soft-serve is generally safe too, but there is a small risk if the machine isn''t cleaned properly.', 'No alternatives needed as this is a safe option when consumed in moderation.', '{"sugar": "high", "calcium": "medium", "fat": "high"}'),
        (desserts_id, 'Homemade Ice Cream', 'caution', 'Homemade ice cream may contain raw eggs, which can pose a salmonella risk. Choose recipes without raw eggs or use pasteurized eggs.', 'Commercial ice cream or homemade versions using pasteurized eggs or no eggs.', '{"sugar": "high", "calcium": "medium", "fat": "high"}'),
        (desserts_id, 'Soft-Serve Ice Cream', 'caution', 'There is a small risk with soft-serve ice cream if the machine isn''t cleaned properly, which could lead to listeria contamination. This risk is low but present.', 'Packaged ice cream from reputable brands.', '{"sugar": "high", "calcium": "medium", "fat": "high"}');

    -- Condiments
    INSERT INTO public.foods (category_id, name, safety_rating, description, alternatives, nutritional_info)
    VALUES
        (condiments_id, 'Mayonnaise (Commercial)', 'safe', 'Commercial mayonnaise is made with pasteurized eggs and is safe during pregnancy.', 'No alternatives needed as this is a safe option.', '{"fat": "high", "calories": "high"}'),
        (condiments_id, 'Mayonnaise (Homemade)', 'avoid', 'Homemade mayonnaise typically contains raw eggs, which may pose a salmonella risk.', 'Commercial mayonnaise or recipes using pasteurized eggs.', '{"fat": "high", "calories": "high"}'),
        (condiments_id, 'Honey', 'safe', 'Honey is safe for pregnant women, but should not be given to infants under 12 months due to risk of botulism.', 'No alternatives needed as this is a safe option for pregnant women.', '{"sugar": "high", "antioxidants": "medium"}'),
        (condiments_id, 'Peanut Butter', 'safe', 'Peanut butter is a good source of protein and healthy fats during pregnancy. Choose natural versions with less sugar and additives when possible.', 'No alternatives needed as this is a safe option.', '{"protein": "medium", "fat": "high", "fiber": "medium"}');
END$$;

-- Output success message
DO $$ 
BEGIN
    RAISE NOTICE 'Food safety data has been seeded successfully';
END $$; 