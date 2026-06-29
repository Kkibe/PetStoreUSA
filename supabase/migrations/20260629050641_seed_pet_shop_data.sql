/*
# Seed pet shop catalog data

1. Overview
Inserts initial categories and products for the pet shop. Uses Pexels stock photo
URLs for imagery. Products span dogs, cats, birds, fish, small pets, and supplies.

2. Data inserted
- 6 categories: dogs, cats, birds, fish, small-pets, supplies
- 24 products across categories with prices, ratings, stock, featured flags, tags

3. Security
- No security changes. Catalog tables remain public read-only.

4. Notes
- Uses ON CONFLICT DO NOTHING so re-running is safe.
- Image URLs are Pexels stock photos (publicly hosted).
*/

INSERT INTO categories (name, slug, description, image_url) VALUES
('Dogs', 'dogs', 'Loyal companions in every size and temperament.', 'https://images.pexels.com/photos/58997/pexels-photo-58997.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Cats', 'cats', 'Independent, elegant, and endlessly charming.', 'https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Birds', 'birds', 'Colorful, vocal, and full of personality.', 'https://images.pexels.com/photos/349758/pexels-photo-349758.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Fish & Aquatics', 'fish', 'Tranquil, mesmerizing aquatic life for your home.', 'https://images.pexels.com/photos/128629/pexels-photo-128629.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Small Pets', 'small-pets', 'Rabbits, hamsters, guinea pigs and more.', 'https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Supplies', 'supplies', 'Food, toys, beds, and accessories for every pet.', 'https://images.pexels.com/photos/6816862/pexels-photo-6816862.jpeg?auto=compress&cs=tinysrgb&w=800')
ON CONFLICT (slug) DO NOTHING;

-- Helper: grab category ids by slug
DO $$
DECLARE
  c_dogs uuid; c_cats uuid; c_birds uuid; c_fish uuid; c_small uuid; c_supplies uuid;
BEGIN
  SELECT id INTO c_dogs FROM categories WHERE slug='dogs';
  SELECT id INTO c_cats FROM categories WHERE slug='cats';
  SELECT id INTO c_birds FROM categories WHERE slug='birds';
  SELECT id INTO c_fish FROM categories WHERE slug='fish';
  SELECT id INTO c_small FROM categories WHERE slug='small-pets';
  SELECT id INTO c_supplies FROM categories WHERE slug='supplies';

  INSERT INTO products (category_id, name, slug, description, price, compare_at_price, image_url, gallery, rating, reviews_count, stock, featured, tags)
  VALUES
  (c_dogs, 'Golden Retriever Puppy', 'golden-retriever-puppy',
   'A friendly, intelligent Golden Retriever puppy, vaccinated and ready for a loving home. Great with families and children.',
   850.00, 1100.00,
   'https://images.pexels.com/photos/2255359/pexels-photo-2255359.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/2255359/pexels-photo-2255359.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.9, 128, 3, true, ARRAY['puppy','family','friendly','vaccinated']),

  (c_dogs, 'French Bulldog', 'french-bulldog',
   'Adorable French Bulldog with a playful personality. Compact size perfect for apartments.',
   1200.00, 1500.00,
   'https://images.pexels.com/photos/1695445/pexels-photo-1695445.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/1695445/pexels-photo-1695445.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.8, 94, 2, true, ARRAY['bulldog','apartment','playful']),

  (c_dogs, 'Labrador Retriever', 'labrador-retriever',
   'Gentle, loyal Labrador Retriever. Excellent companion and family dog.',
   750.00, 950.00,
   'https://images.pexels.com/photos/3888063/pexels-photo-3888063.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/3888063/pexels-photo-3888063.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.7, 76, 4, false, ARRAY['labrador','loyal','family']),

  (c_dogs, 'Beagle Puppy', 'beagle-puppy',
   'Curious and merry Beagle puppy. Great with kids and loves outdoor adventures.',
   600.00, 780.00,
   'https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.6, 52, 5, true, ARRAY['beagle','puppy','curious']),

  (c_cats, 'Persian Kitten', 'persian-kitten',
   'Regal Persian kitten with luxurious long fur. Calm temperament, perfect indoor companion.',
   500.00, 650.00,
   'https://images.pexels.com/photos/1574650/pexels-photo-1574650.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/1574650/pexels-photo-1574650.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.9, 110, 3, true, ARRAY['persian','kitten','indoor','calm']),

  (c_cats, 'Maine Coon', 'maine-coon',
   'Majestic Maine Coon cat, known for large size and gentle nature. Dog-like personality.',
   700.00, 900.00,
   'https://images.pexels.com/photos/3992477/pexels-photo-3992477.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/3992477/pexels-photo-3992477.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.8, 88, 2, true, ARRAY['maine-coon','large','gentle']),

  (c_cats, 'British Shorthair', 'british-shorthair',
   'Plush, round-faced British Shorthair. Quiet, dignified, and affectionate.',
   550.00, 700.00,
   'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.7, 64, 4, false, ARRAY['shorthair','quiet','affectionate']),

  (c_cats, 'Siamese Kitten', 'siamese-kitten',
   'Striking blue-eyed Siamese kitten. Vocal, social, and intelligent.',
   450.00, 580.00,
   'https://images.pexels.com/photos/65289/pexels-photo-65289.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/65289/pexels-photo-65289.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.6, 47, 3, false, ARRAY['siamese','vocal','social']),

  (c_birds, 'African Grey Parrot', 'african-grey-parrot',
   'Highly intelligent African Grey Parrot. Known for exceptional talking ability.',
   1500.00, 1800.00,
   'https://images.pexels.com/photos/5057756/pexels-photo-5057756.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/5057756/pexels-photo-5057756.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.9, 38, 1, true, ARRAY['parrot','talking','intelligent']),

  (c_birds, 'Cockatiel', 'cockatiel',
   'Friendly and whistling Cockatiel. Great beginner bird, easy to care for.',
   180.00, 240.00,
   'https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.7, 56, 6, true, ARRAY['cockatiel','beginner','whistling']),

  (c_birds, 'Budgerigar Pair', 'budgerigar-pair',
   'A bonded pair of colorful Budgerigars. Playful and social little parakeets.',
   80.00, 110.00,
   'https://images.pexels.com/photos/567540/pexels-photo-567540.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/567540/pexels-photo-567540.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.5, 41, 8, false, ARRAY['budgie','pair','playful']),

  (c_fish, 'Betta Fish', 'betta-fish',
   'Vibrant Siamese fighting fish. Stunning colors, easy to care for in a small tank.',
   25.00, 35.00,
   'https://images.pexels.com/photos/351397/pexels-photo-351397.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/351397/pexels-photo-351397.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.6, 132, 20, true, ARRAY['betta','fish','beginner']),

  (c_fish, 'Goldfish Trio', 'goldfish-trio',
   'A trio of classic fancy goldfish. Hardy and perfect for community tanks.',
   30.00, 45.00,
   'https://images.pexels.com/photos/1287562/pexels-photo-1287562.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/1287562/pexels-photo-1287562.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.5, 98, 15, false, ARRAY['goldfish','trio','hardy']),

  (c_fish, 'Neon Tetra School', 'neon-tetra-school',
   'A school of 10 vibrant Neon Tetras. Peaceful community fish with glowing stripes.',
   40.00, 55.00,
   'https://images.pexels.com/photos/351397/pexels-photo-351397.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/351397/pexels-photo-351397.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.7, 73, 12, true, ARRAY['tetra','school','community']),

  (c_small, 'Holland Lop Rabbit', 'holland-lop-rabbit',
   'Sweet-tempered Holland Lop rabbit with floppy ears. Litter-trained and friendly.',
   120.00, 160.00,
   'https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.8, 67, 4, true, ARRAY['rabbit','lop','friendly']),

  (c_small, 'Syrian Hamster', 'syrian-hamster',
   'Adorable golden Syrian hamster. Nocturnal, low-maintenance first pet.',
   25.00, 35.00,
   'https://images.pexels.com/photos/45243/syrian-hamster-rodent-cute-pet-45243.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/45243/syrian-hamster-rodent-cute-pet-45243.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.6, 89, 10, false, ARRAY['hamster','syrian','beginner']),

  (c_small, 'Guinea Pig Pair', 'guinea-pig-pair',
   'A bonded pair of guinea pigs. Social, gentle, and great with children.',
   60.00, 80.00,
   'https://images.pexels.com/photos/6816862/pexels-photo-6816862.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/6816862/pexels-photo-6816862.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.7, 54, 5, true, ARRAY['guinea-pig','pair','social']),

  (c_supplies, 'Premium Dog Food 15kg', 'premium-dog-food',
   'Grain-free premium dog food, 15kg bag. Complete nutrition for adult dogs.',
   65.00, 85.00,
   'https://images.pexels.com/photos/6816862/pexels-photo-6816862.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/6816862/pexels-photo-6816862.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.8, 210, 50, true, ARRAY['food','dog','grain-free']),

  (c_supplies, 'Cozy Pet Bed', 'cozy-pet-bed',
   'Plush orthopedic pet bed in neutral tones. Supports joints for restful sleep.',
   45.00, 60.00,
   'https://images.pexels.com/photos/6816862/pexels-photo-6816862.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/6816862/pexels-photo-6816862.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.7, 156, 30, true, ARRAY['bed','comfort','orthopedic']),

  (c_supplies, 'Interactive Cat Tree', 'interactive-cat-tree',
   'Multi-level cat tree with scratching posts and cozy perches. Beige and wood.',
   120.00, 160.00,
   'https://images.pexels.com/photos/6816862/pexels-photo-6816862.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/6816862/pexels-photo-6816862.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.6, 78, 12, false, ARRAY['cat-tree','scratching','multi-level']),

  (c_supplies, 'Aquarium Starter Kit 20gal', 'aquarium-starter-kit',
   'Complete 20-gallon aquarium kit with filter, LED light, and heater.',
   140.00, 190.00,
   'https://images.pexels.com/photos/128629/pexels-photo-128629.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/128629/pexels-photo-128629.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.7, 92, 8, true, ARRAY['aquarium','kit','beginner']),

  (c_supplies, 'Rope Chew Toy Set', 'rope-chew-toy-set',
   'Set of 4 durable rope chew toys for dogs. Promotes dental health and play.',
   18.00, 25.00,
   'https://images.pexels.com/photos/6816862/pexels-photo-6816862.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/6816862/pexels-photo-6816862.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.5, 187, 60, false, ARRAY['toy','chew','dog']),

  (c_supplies, 'Bird Cage Deluxe', 'bird-cage-deluxe',
   'Spacious deluxe bird cage with perches and feeding cups. Easy to clean.',
   95.00, 130.00,
   'https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.6, 43, 7, false, ARRAY['cage','bird','deluxe']),

  (c_supplies, 'Pet Carrier Travel Bag', 'pet-carrier-travel',
   'Airline-approved soft pet carrier with ventilation. Comfortable for travel.',
   55.00, 75.00,
   'https://images.pexels.com/photos/6816862/pexels-photo-6816862.jpeg?auto=compress&cs=tinysrgb&w=800',
   '["https://images.pexels.com/photos/6816862/pexels-photo-6816862.jpeg?auto=compress&cs=tinysrgb&w=800"]'::jsonb,
   4.7, 121, 25, true, ARRAY['carrier','travel','airline'])
  ON CONFLICT (slug) DO NOTHING;
END $$;
