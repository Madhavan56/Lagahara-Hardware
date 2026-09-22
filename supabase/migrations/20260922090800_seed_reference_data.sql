-- Reference data: the 13 categories, their attribute schemas, and the two
-- shipping methods. Prices/labels here are starting values — all are editable
-- from the admin dashboard afterwards.

insert into public.categories (slug, name, description, sort_order) values
  ('plywood', 'Plywood', 'Commercial, marine and BWP grade plywood from trusted mills.', 1),
  ('mica-laminates', 'Mica & Laminates', 'Decorative laminate sheets in every finish, pattern and texture.', 2),
  ('kitchen-hardware', 'Kitchen Hardware', 'Baskets, tall units, lift-ups and organisers for modular kitchens.', 3),
  ('wardrobe-hardware', 'Wardrobe Hardware', 'Rails, racks and internal fittings for wardrobes.', 4),
  ('hinges', 'Hinges', 'Concealed, soft-close and specialty hinges for every door type.', 5),
  ('drawer-systems', 'Drawer Systems', 'Tandem boxes, metal boxes and complete drawer solutions.', 6),
  ('drawer-channels', 'Drawer Channels & Runners', 'Telescopic, ball-bearing and under-mount runners.', 7),
  ('handles-knobs', 'Handles & Knobs', 'Cabinet handles, knobs and profile pulls in premium finishes.', 8),
  ('sliding-systems', 'Sliding Systems', 'Top-hung, bottom-roller and folding hardware for sliding shutters.', 9),
  ('locks-security', 'Locks & Security', 'Cam locks, mortise locks and digital locking solutions.', 10),
  ('aluminium-profiles', 'Aluminium Profiles', 'Gola, shutter, LED and edge profiles in anodised and coated finishes.', 11),
  ('interior-hardware', 'Interior Hardware', 'General-purpose fittings and fixings for interior joinery.', 12),
  ('furniture-accessories', 'Furniture Accessories', 'Legs, brackets, castors, glides and finishing accessories.', 13)
on conflict (slug) do nothing;

insert into public.category_attributes
  (category_id, key, label, data_type, unit, options, is_required, is_filterable, sort_order)
select
  c.id,
  v.key,
  v.label,
  v.data_type::public.attribute_data_type,
  v.unit,
  v.options::jsonb,
  v.is_required,
  v.is_filterable,
  v.sort_order
from (values
  -- Plywood
  ('plywood', 'brand', 'Brand', 'text', null, '[]', true, true, 1),
  ('plywood', 'grade', 'Grade', 'select', null, '["MR","BWR","BWP","Marine","Fire Retardant"]', true, true, 2),
  ('plywood', 'thickness', 'Thickness', 'number', 'mm', '[]', true, true, 3),
  ('plywood', 'sheet_size', 'Sheet Size', 'select', null, '["8x4 ft","7x4 ft","6x4 ft","8x3 ft"]', true, true, 4),
  ('plywood', 'ply_type', 'Type', 'select', null, '["Commercial","Hardwood","Gurjan","Poplar","Blockboard","Flexible"]', false, true, 5),
  ('plywood', 'application', 'Application', 'select', null, '["Interior","Exterior","Kitchen","Bathroom","Furniture"]', false, true, 6),
  ('plywood', 'finish', 'Finish', 'select', null, '["Unfinished","One Side Teak","Both Side Teak","Pre-laminated"]', false, true, 7),

  -- Mica & Laminates
  ('mica-laminates', 'brand', 'Brand', 'text', null, '[]', true, true, 1),
  ('mica-laminates', 'design_code', 'Design Code', 'text', null, '[]', false, false, 2),
  ('mica-laminates', 'finish', 'Finish', 'select', null, '["Matte","Glossy","High Gloss","Suede","Textured","Soft Touch"]', true, true, 3),
  ('mica-laminates', 'thickness', 'Thickness', 'number', 'mm', '[]', true, true, 4),
  ('mica-laminates', 'sheet_size', 'Sheet Size', 'select', null, '["8x4 ft","7x4 ft","9x4 ft","10x4 ft"]', true, true, 5),
  ('mica-laminates', 'color', 'Colour', 'text', null, '[]', false, true, 6),
  ('mica-laminates', 'pattern', 'Pattern', 'select', null, '["Solid","Woodgrain","Stone","Abstract","Metallic","Fabric"]', false, true, 7),
  ('mica-laminates', 'texture', 'Texture', 'text', null, '[]', false, true, 8),

  -- Kitchen Hardware
  ('kitchen-hardware', 'brand', 'Brand', 'text', null, '[]', false, true, 1),
  ('kitchen-hardware', 'product_type', 'Type', 'select', null, '["Basket","Corner Unit","Tall Unit","Lift-up System","Waste Bin","Cutlery Tray","Bottle Pullout"]', true, true, 2),
  ('kitchen-hardware', 'material', 'Material', 'select', null, '["Stainless Steel","Mild Steel","Aluminium","Plastic","Wire"]', true, true, 3),
  ('kitchen-hardware', 'finish', 'Finish', 'select', null, '["Chrome","Satin","Matte Black","Powder Coated","PVD Gold"]', false, true, 4),
  ('kitchen-hardware', 'size', 'Size', 'text', null, '[]', false, true, 5),
  ('kitchen-hardware', 'load_capacity', 'Load Capacity', 'number', 'kg', '[]', false, true, 6),
  ('kitchen-hardware', 'soft_close', 'Soft Close', 'boolean', null, '[]', false, true, 7),

  -- Wardrobe Hardware
  ('wardrobe-hardware', 'brand', 'Brand', 'text', null, '[]', false, true, 1),
  ('wardrobe-hardware', 'product_type', 'Type', 'select', null, '["Hanging Rod","Pull Down Rail","Trouser Rack","Tie Rack","Mirror Unit","Basket","Shoe Rack"]', true, true, 2),
  ('wardrobe-hardware', 'material', 'Material', 'select', null, '["Stainless Steel","Aluminium","Mild Steel","Plastic"]', true, true, 3),
  ('wardrobe-hardware', 'finish', 'Finish', 'select', null, '["Chrome","Satin","Matte Black","Powder Coated","Antique Brass"]', false, true, 4),
  ('wardrobe-hardware', 'size', 'Size', 'text', null, '[]', false, true, 5),
  ('wardrobe-hardware', 'load_capacity', 'Load Capacity', 'number', 'kg', '[]', false, true, 6),

  -- Hinges
  ('hinges', 'brand', 'Brand', 'text', null, '[]', false, true, 1),
  ('hinges', 'material', 'Material', 'select', null, '["Stainless Steel","Mild Steel","Brass","Zinc Alloy"]', true, true, 2),
  ('hinges', 'finish', 'Finish', 'select', null, '["Nickel Plated","Satin","Chrome","Antique Brass","Matte Black"]', false, true, 3),
  ('hinges', 'mounting_type', 'Mounting Type', 'select', null, '["Full Overlay","Half Overlay","Inset","Concealed","Surface"]', true, true, 4),
  ('hinges', 'opening_angle', 'Opening Angle', 'number', '°', '[]', false, true, 5),
  ('hinges', 'soft_close', 'Soft Close', 'boolean', null, '[]', false, true, 6),
  ('hinges', 'size', 'Size', 'text', null, '[]', false, true, 7),
  ('hinges', 'load_capacity', 'Load Capacity', 'number', 'kg', '[]', false, true, 8),

  -- Drawer Systems
  ('drawer-systems', 'brand', 'Brand', 'text', null, '[]', false, true, 1),
  ('drawer-systems', 'system_type', 'System Type', 'select', null, '["Tandem Box","Metal Box","Slim Box","Inner Drawer","Pan Drawer"]', true, true, 2),
  ('drawer-systems', 'material', 'Material', 'select', null, '["Steel","Stainless Steel","Aluminium"]', true, true, 3),
  ('drawer-systems', 'finish', 'Finish', 'select', null, '["Powder Coated","Chrome","Matte Black","Anthracite","White"]', false, true, 4),
  ('drawer-systems', 'height', 'Height', 'number', 'mm', '[]', false, true, 5),
  ('drawer-systems', 'depth', 'Depth', 'number', 'mm', '[]', true, true, 6),
  ('drawer-systems', 'load_capacity', 'Load Capacity', 'number', 'kg', '[]', false, true, 7),
  ('drawer-systems', 'soft_close', 'Soft Close', 'boolean', null, '[]', false, true, 8),

  -- Drawer Channels & Runners
  ('drawer-channels', 'brand', 'Brand', 'text', null, '[]', false, true, 1),
  ('drawer-channels', 'material', 'Material', 'select', null, '["Mild Steel","Stainless Steel","Zinc Plated Steel"]', true, true, 2),
  ('drawer-channels', 'finish', 'Finish', 'select', null, '["Zinc","Powder Coated","Chrome","Black"]', false, true, 3),
  ('drawer-channels', 'length', 'Length', 'number', 'mm', '[]', true, true, 4),
  ('drawer-channels', 'extension_type', 'Extension', 'select', null, '["Partial Extension","Full Extension","Over Travel"]', true, true, 5),
  ('drawer-channels', 'mounting_type', 'Mounting Type', 'select', null, '["Side Mount","Bottom Mount","Under Mount","Centre Mount"]', true, true, 6),
  ('drawer-channels', 'load_capacity', 'Load Capacity', 'number', 'kg', '[]', false, true, 7),
  ('drawer-channels', 'soft_close', 'Soft Close', 'boolean', null, '[]', false, true, 8),

  -- Handles & Knobs
  ('handles-knobs', 'brand', 'Brand', 'text', null, '[]', false, true, 1),
  ('handles-knobs', 'product_type', 'Type', 'select', null, '["Cabinet Handle","Knob","Pull Handle","Edge Profile","Gola Profile","Recessed Handle"]', true, true, 2),
  ('handles-knobs', 'material', 'Material', 'select', null, '["Stainless Steel","Aluminium","Brass","Zinc Alloy","Wood","Ceramic"]', true, true, 3),
  ('handles-knobs', 'finish', 'Finish', 'select', null, '["Chrome","Satin","Matte Black","Rose Gold","Antique Brass","PVD Gold","Brushed Nickel"]', true, true, 4),
  ('handles-knobs', 'length', 'Length', 'number', 'mm', '[]', false, true, 5),
  ('handles-knobs', 'center_distance', 'Centre Distance', 'number', 'mm', '[]', false, true, 6),
  ('handles-knobs', 'mounting_type', 'Mounting Type', 'select', null, '["Screw Fixed","Adhesive","Concealed"]', false, true, 7),

  -- Sliding Systems
  ('sliding-systems', 'brand', 'Brand', 'text', null, '[]', false, true, 1),
  ('sliding-systems', 'system_type', 'System Type', 'select', null, '["Top Hung","Bottom Roller","Telescopic","Soft Close Sliding","Folding","Sliding Folding"]', true, true, 2),
  ('sliding-systems', 'material', 'Material', 'select', null, '["Aluminium","Steel","Stainless Steel"]', true, true, 3),
  ('sliding-systems', 'finish', 'Finish', 'select', null, '["Anodised","Powder Coated","Chrome","Matte Black"]', false, true, 4),
  ('sliding-systems', 'load_capacity', 'Load Capacity', 'number', 'kg', '[]', true, true, 5),
  ('sliding-systems', 'panel_thickness', 'Panel Thickness', 'number', 'mm', '[]', false, true, 6),
  ('sliding-systems', 'track_length', 'Track Length', 'number', 'mm', '[]', false, true, 7),
  ('sliding-systems', 'soft_close', 'Soft Close', 'boolean', null, '[]', false, true, 8),

  -- Locks & Security
  ('locks-security', 'brand', 'Brand', 'text', null, '[]', false, true, 1),
  ('locks-security', 'lock_type', 'Lock Type', 'select', null, '["Cam Lock","Drawer Lock","Cupboard Lock","Mortise Lock","Digital Lock","Padlock","Multipurpose Lock"]', true, true, 2),
  ('locks-security', 'material', 'Material', 'select', null, '["Brass","Zinc Alloy","Stainless Steel","Iron"]', true, true, 3),
  ('locks-security', 'finish', 'Finish', 'select', null, '["Chrome","Satin","Antique Brass","Matte Black","Nickel"]', false, true, 4),
  ('locks-security', 'key_type', 'Key Type', 'select', null, '["Single Key","Master Key","Combination","Digital","Biometric"]', false, true, 5),
  ('locks-security', 'size', 'Size', 'text', null, '[]', false, true, 6),

  -- Aluminium Profiles
  ('aluminium-profiles', 'brand', 'Brand', 'text', null, '[]', false, true, 1),
  ('aluminium-profiles', 'profile_type', 'Profile Type', 'select', null, '["G Profile","J Profile","Gola Profile","Shutter Profile","LED Profile","Edge Banding","Skirting"]', true, true, 2),
  ('aluminium-profiles', 'finish', 'Finish', 'select', null, '["Anodised","Powder Coated","Mill Finish","Wooden Finish","Matte Black","Champagne"]', true, true, 3),
  ('aluminium-profiles', 'length', 'Length', 'number', 'mm', '[]', true, true, 4),
  ('aluminium-profiles', 'thickness', 'Thickness', 'number', 'mm', '[]', false, true, 5),
  ('aluminium-profiles', 'color', 'Colour', 'text', null, '[]', false, true, 6),

  -- Interior Hardware
  ('interior-hardware', 'brand', 'Brand', 'text', null, '[]', false, true, 1),
  ('interior-hardware', 'material', 'Material', 'select', null, '["Stainless Steel","Mild Steel","Brass","Zinc Alloy","Aluminium","Plastic"]', true, true, 2),
  ('interior-hardware', 'finish', 'Finish', 'select', null, '["Chrome","Satin","Matte Black","Powder Coated","Antique Brass","Nickel"]', false, true, 3),
  ('interior-hardware', 'size', 'Size', 'text', null, '[]', false, true, 4),
  ('interior-hardware', 'mounting_type', 'Mounting Type', 'select', null, '["Screw Fixed","Adhesive","Concealed","Surface"]', false, true, 5),
  ('interior-hardware', 'load_capacity', 'Load Capacity', 'number', 'kg', '[]', false, true, 6),

  -- Furniture Accessories
  ('furniture-accessories', 'brand', 'Brand', 'text', null, '[]', false, true, 1),
  ('furniture-accessories', 'product_type', 'Type', 'select', null, '["Leg","Bracket","Connector","Bumper","Cable Manager","Glide","Castor","Shelf Support"]', true, true, 2),
  ('furniture-accessories', 'material', 'Material', 'select', null, '["Stainless Steel","Mild Steel","Aluminium","Plastic","Rubber","Wood"]', true, true, 3),
  ('furniture-accessories', 'finish', 'Finish', 'select', null, '["Chrome","Satin","Matte Black","Powder Coated","Natural"]', false, true, 4),
  ('furniture-accessories', 'size', 'Size', 'text', null, '[]', false, true, 5),
  ('furniture-accessories', 'load_capacity', 'Load Capacity', 'number', 'kg', '[]', false, true, 6)
) as v(slug, key, label, data_type, unit, options, is_required, is_filterable, sort_order)
join public.categories c on c.slug = v.slug
on conflict (category_id, key) do nothing;

insert into public.shipping_methods
  (code, name, description, price, eta_days_min, eta_days_max, sort_order)
values
  ('standard', 'Standard Shipping', 'Delivered in 4–6 business days', 149.00, 4, 6, 1),
  ('quick', 'Quick Shipping', 'Delivered within 2 business days', 399.00, 1, 2, 2)
on conflict (code) do nothing;
