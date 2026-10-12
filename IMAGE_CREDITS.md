# Image credits

All imagery below is real, freely-licensed photography from Wikimedia Commons,
rawpixel and StockSnap (the latter two found via [Openverse](https://openverse.org)).
Several licenses require attribution, kept here rather than on every page.

## Category tiles

Stored locally in `public/images/categories/` at two widths (480w/960w) and
referenced via `src/config/categoryImages.ts`.

| Category | Source file | Author | License |
|---|---|---|---|
| Plywood | [Plywood.jpg](https://commons.wikimedia.org/wiki/File:Plywood.jpg) | Rotor DB (English Wikipedia) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Mica & Laminates | [Free texture background image](https://www.rawpixel.com/image/5913997/photo-image-background-texture-public-domain) | rawpixel | CC0 (public domain) |
| Kitchen Hardware | [Modern kitchen and dining area…jpg](https://commons.wikimedia.org/wiki/File:Modern_kitchen_and_dining_area_in_a_simple_home_setting_showing_light_colors_and_minimal_decor.jpg) | Shixart1985 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Wardrobe Hardware | [Low Angle View from Door](https://www.rawpixel.com/image/6082585/low-angle-view-from-door) | rawpixel | CC0 (public domain) |
| Sliding Systems | [Modern house view…sliding glass doors.jpg](https://commons.wikimedia.org/wiki/File:Modern_house_view_showing_living_room_and_outdoor_patio_area_with_sliding_glass_doors.jpg) | Shixart1985 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Locks & Security | [Free door handle image](https://www.rawpixel.com/image/5922001/photo-image-public-domain-house-room) | rawpixel | CC0 (public domain) |
| Interior Hardware | [Metal Screws](https://stocksnap.io/photo/metal-screws-0S5UEC0XC2) | Matt Bango (StockSnap) | CC0 (public domain) |
| Furniture Accessories | [Minimal Furniture](https://stocksnap.io/photo/minimal-furniture-41AH9JPWSN) | Eric Haidara (StockSnap) | CC0 (public domain) |
| Hinges | [Hinge on kitchen cabinet with soft closing mechanism.jpg](https://commons.wikimedia.org/wiki/File:Hinge_on_kitchen_cabinet_with_soft_closing_mechanism.jpg) | Shixart1985 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Drawer Systems | [View wooden utensil drawer](https://www.rawpixel.com/image/3286550/free-photo-image-kitchen-drawer-furniture-silver-spoons) | rawpixel | CC0 (public domain) |
| Drawer Channels & Runners | [Bottom mounting wheel drawer slide rails - 50 cm - A.jpg](https://commons.wikimedia.org/wiki/File:Bottom_mounting_wheel_drawer_slide_rails_-_50_cm_-_A.jpg) | Fructibus | CC0 (public domain) |
| Handles & Knobs | [Door handle white door](https://www.rawpixel.com/image/6036901/photo-image-public-domain-door-white) | rawpixel | CC0 (public domain) |
| Aluminium Profiles | [Thöni Aluminium-Profile.jpg](https://commons.wikimedia.org/wiki/File:Th%C3%B6ni_Aluminium-Profile.jpg) | Thöni Gruppe | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |

All thirteen categories now render real photography — no gradient fallbacks
remain in the live catalog. The fallback system is kept for any future
additions.

## Product photography

Every product has its own real, freely-licensed photo, chosen to match the
product type. They are representative photos of that kind of hardware, not
photos of the exact branded SKU. Files live in Supabase Storage at
`product-images/<category>/<SKU>-photo.jpg` (cropped to 4:3, 1200x900), applied
with `scripts/apply-unique-product-photos.ts`. The machine-readable source list
is `scripts/data/product-photos.json`.

Replace any of these with genuine supplier photos via **Admin → Products →
(product) → Images**.

| SKU | Photo | Author | Source | License |
|---|---|---|---|---|
| DHJ-HNG-001 | [Utrusta Hinge 110 °.jpg](https://commons.wikimedia.org/wiki/File:Utrusta_Hinge_110_%C2%B0.jpg) | Stilfehler | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-HNG-002 | [Euro hinge 1.jpg](https://commons.wikimedia.org/wiki/File:Euro_hinge_1.jpg) | Dvortygirl | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-HNG-003 | [Utrusta Hinge 153 °.jpg](https://commons.wikimedia.org/wiki/File:Utrusta_Hinge_153_%C2%B0.jpg) | Stilfehler | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-HNG-004 | [Lockpick hinge 2.jpg](https://commons.wikimedia.org/wiki/File:Lockpick_hinge_2.jpg) | Jbrown6389 | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-HNG-005 | [Kitchen cabinet hinge, Frog hinge 05.JPG](https://commons.wikimedia.org/wiki/File:Kitchen_cabinet_hinge,_Frog_hinge_05.JPG) | Mattis | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-HNG-006 | [Euro hinge 4.jpg](https://commons.wikimedia.org/wiki/File:Euro_hinge_4.jpg) | Dvortygirl | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-HNG-007 | [Euro hinge 3.jpg](https://commons.wikimedia.org/wiki/File:Euro_hinge_3.jpg) | Dvortygirl | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-HNG-008 | [Scharnier um 1980.jpg](https://commons.wikimedia.org/wiki/File:Scharnier_um_1980.jpg) | Markmons | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-HDL-001 | [Door handle white door](https://www.rawpixel.com/image/6036901/photo-image-public-domain-door-white) | rawpixel | rawpixel | CC0 |
| DHJ-HDL-002 | [Drawer Pull MET DP236499.jpg](https://commons.wikimedia.org/wiki/File:Drawer_Pull_MET_DP236499.jpg) | Unknown | Wikimedia Commons | CC0 |
| DHJ-HDL-003 | [IMG_2386 Handles & Knobs](https://www.flickr.com/photos/57412095@N05/10487098025) | ArturoYee | flickr | CC BY 2.0 |
| DHJ-HDL-004 | [Handle, drawer (AM 674195-7).jpg](https://commons.wikimedia.org/wiki/File:Handle,_drawer_(AM_674195-7).jpg) | Unknown author | Wikimedia Commons | CC BY 4.0 |
| DHJ-HDL-005 | [Handle, drawer (AM 674195-3).jpg](https://commons.wikimedia.org/wiki/File:Handle,_drawer_(AM_674195-3).jpg) | Unknown author | Wikimedia Commons | CC BY 4.0 |
| DHJ-HDL-006 | [Drawer handle.jpg](https://commons.wikimedia.org/wiki/File:Drawer_handle.jpg) | iluvrhinestones from seattle, oceania | Wikimedia Commons | CC BY-SA 2.0 |
| DHJ-HDL-007 | [Handle, drawer (AM 674195-1).jpg](https://commons.wikimedia.org/wiki/File:Handle,_drawer_(AM_674195-1).jpg) | Unknown author | Wikimedia Commons | CC BY 4.0 |
| DHJ-HDL-008 | [Drawer pull MET DP232790.jpg](https://commons.wikimedia.org/wiki/File:Drawer_pull_MET_DP232790.jpg) | Henry Kellam Hancock | Wikimedia Commons | CC0 |
| DHJ-LCK-001 | [Everyday Things I](https://www.flickr.com/photos/28652129@N06/11635751835) | Anne Worner | flickr | CC BY 2.0 |
| DHJ-LCK-002 | [Key to the open door](https://www.flickr.com/photos/11309626@N02/2309847575) | Tawheed Manzoor | flickr | CC BY 2.0 |
| DHJ-LCK-003 | [Weird lock](https://www.flickr.com/photos/65630793@N05/16880876678) | piropiro3 | flickr | CC BY 2.0 |
| DHJ-LCK-004 | [Russwin 1248](https://www.flickr.com/photos/15108146@N00/19814224406) | kozemchuk | flickr | CC BY 2.0 |
| DHJ-LCK-005 | [Come in](https://www.flickr.com/photos/38305415@N00/2110763702) | Johan Larsson | flickr | CC BY 2.0 |
| DHJ-LCK-006 | [Solex 99 30 padlock with keys (DSCF2659).jpg](https://commons.wikimedia.org/wiki/File:Solex_99_30_padlock_with_keys_(DSCF2659).jpg) | Trougnouf | Wikimedia Commons | CC BY 4.0 |
| DHJ-LCK-007 | [Three padlocks.jpg](https://commons.wikimedia.org/wiki/File:Three_padlocks.jpg) | Mx. Granger | Wikimedia Commons | CC0 |
| DHJ-LCK-008 | [Brass padlock with key.jpg](https://commons.wikimedia.org/wiki/File:Brass_padlock_with_key.jpg) | Shillings1005 | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-PLY-001 | [Spruce plywood.JPG](https://commons.wikimedia.org/wiki/File:Spruce_plywood.JPG) | Bystander | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-PLY-002 | [plied](https://www.flickr.com/photos/10343926@N02/5588222832) | timlewisnm | flickr | CC BY-SA 2.0 |
| DHJ-PLY-003 | [Project in Waiting](https://www.flickr.com/photos/37996646802@N01/48895556367) | cogdogblog | flickr | CC0 |
| DHJ-PLY-004 | [Elvin Fajardo Stacks up the Panels](https://www.flickr.com/photos/44177494@N04/4782014150) | Reuse Warehouse Houston | flickr | CC BY 2.0 |
| DHJ-PLY-005 | [Plywood panels for new construction.jpg](https://commons.wikimedia.org/wiki/File:Plywood_panels_for_new_construction.jpg) | Downtowngal | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-PLY-006 | [Plywood.jpg](https://commons.wikimedia.org/wiki/File:Plywood.jpg) | Rotor DB at English Wikipedia | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-PLY-007 | [Find the point.JPG](https://commons.wikimedia.org/wiki/File:Find_the_point.JPG) | Amirreza Saharkhiz | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-PLY-008 | [Sandakan Sabah Plywood-Factory-54.jpg](https://commons.wikimedia.org/wiki/File:Sandakan_Sabah_Plywood-Factory-54.jpg) | CEphoto, Uwe Aranas | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-MICA-001 | [Formica Laminate for Countertops 06.jpg](https://commons.wikimedia.org/wiki/File:Formica_Laminate_for_Countertops_06.jpg) | Stilfehler | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-MICA-002 | [Decorative laminate 07847.jpg](https://commons.wikimedia.org/wiki/File:Decorative_laminate_07847.jpg) | Андрей Перцев 1967 | Wikimedia Commons | CC0 |
| DHJ-MICA-003 | [Decorative laminate 07853.jpg](https://commons.wikimedia.org/wiki/File:Decorative_laminate_07853.jpg) | Андрей Перцев 1967 | Wikimedia Commons | CC0 |
| DHJ-MICA-004 | [Decorative laminate 07838.jpg](https://commons.wikimedia.org/wiki/File:Decorative_laminate_07838.jpg) | Андрей Перцев 1967 | Wikimedia Commons | CC0 |
| DHJ-MICA-005 | [Decorative laminate 07845.jpg](https://commons.wikimedia.org/wiki/File:Decorative_laminate_07845.jpg) | Андрей Перцев 1967 | Wikimedia Commons | CC0 |
| DHJ-MICA-006 | [Decorative laminate 07855.jpg](https://commons.wikimedia.org/wiki/File:Decorative_laminate_07855.jpg) | Андрей Перцев 1967 | Wikimedia Commons | CC0 |
| DHJ-MICA-007 | [Decorative laminate 07834.jpg](https://commons.wikimedia.org/wiki/File:Decorative_laminate_07834.jpg) | Андрей Перцев 1967 | Wikimedia Commons | CC0 |
| DHJ-MICA-008 | [Decorative laminate 07844.jpg](https://commons.wikimedia.org/wiki/File:Decorative_laminate_07844.jpg) | Андрей Перцев 1967 | Wikimedia Commons | CC0 |
| DHJ-KIT-001 | [Base Cabinet with Interior Drawers.jpg](https://commons.wikimedia.org/wiki/File:Base_Cabinet_with_Interior_Drawers.jpg) | Stilfehler | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-KIT-002 | [Birch-plywood kitchen by Barber Osgerby Associates, London 1999.jpg](https://commons.wikimedia.org/wiki/File:Birch-plywood_kitchen_by_Barber_Osgerby_Associates,_London_1999.jpg) | StuartofAlbion | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-KIT-003 | [High Cabinet with Interior Drawers.jpg](https://commons.wikimedia.org/wiki/File:High_Cabinet_with_Interior_Drawers.jpg) | Stilfehler | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-KIT-004 | [White kitchen with dark blue tiling.jpg](https://commons.wikimedia.org/wiki/File:White_kitchen_with_dark_blue_tiling.jpg) | Kotivalo | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-KIT-005 | [Integrated kitchen with lower cabinets open.jpg](https://commons.wikimedia.org/wiki/File:Integrated_kitchen_with_lower_cabinets_open.jpg) | Kotivalo | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-KIT-006 | [Kitchen Drawer with Plastic Organizer.jpg](https://commons.wikimedia.org/wiki/File:Kitchen_Drawer_with_Plastic_Organizer.jpg) | Stilfehler | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-KIT-007 | [High Cabinet with Interior Drawers 2.jpg](https://commons.wikimedia.org/wiki/File:High_Cabinet_with_Interior_Drawers_2.jpg) | Stilfehler | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-KIT-008 | [Kitchen drawer with remote controls.jpg](https://commons.wikimedia.org/wiki/File:Kitchen_drawer_with_remote_controls.jpg) | Mirko Meznaric | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-WRD-001 | [Closet pole brackets.jpg](https://commons.wikimedia.org/wiki/File:Closet_pole_brackets.jpg) | Pogrebnoj-Alexandroff | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-WRD-002 | [Clothes hanged inside a closet.jpg](https://commons.wikimedia.org/wiki/File:Clothes_hanged_inside_a_closet.jpg) | mycurrency.com | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-WRD-003 | [Walk-In Closet.jpg](https://commons.wikimedia.org/wiki/File:Walk-In_Closet.jpg) | Photo credit to Amy Carroll, Anne Sage and California Closet | Wikimedia Commons | CC BY 4.0 |
| DHJ-WRD-004 | [Hotel room at the Silver Legacy Resort Casino - November 2021 - Sarah ](https://commons.wikimedia.org/wiki/File:Hotel_room_at_the_Silver_Legacy_Resort_Casino_-_November_2021_-_Sarah_Stierch_03.jpg) | Missvain | Wikimedia Commons | CC BY 4.0 |
| DHJ-WRD-005 | [Elfa storage system behind mirrored doors in bedroom.jpg](https://commons.wikimedia.org/wiki/File:Elfa_storage_system_behind_mirrored_doors_in_bedroom.jpg) | Kotivalo | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-WRD-006 | [Attic 1780s House 9 Mile Point Closet.JPG](https://commons.wikimedia.org/wiki/File:Attic_1780s_House_9_Mile_Point_Closet.JPG) | Infrogmation of New Orleans | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-WRD-007 | [Wilmslow, United Kingdom (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Wilmslow,_United_Kingdom_(Unsplash).jpg) | AnonymousUnknown author | Wikimedia Commons | CC0 |
| DHJ-WRD-008 | [Cupboard.jpg](https://commons.wikimedia.org/wiki/File:Cupboard.jpg) | Deavmi | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-SLD-001 | [closet hardware](https://www.flickr.com/photos/94775792@N00/3408930394) | ddaarryynn | flickr | CC BY 2.0 |
| DHJ-SLD-002 | [Mazzali: 'Quadrante' wardrobe / l'armadio 'Quadrante' . Bedroom and li](https://www.flickr.com/photos/26098878@N06/2796965696) | MAZZALI bespoke italian furniture | flickr | CC BY-SA 2.0 |
| DHJ-SLD-003 | [ESCAPE wardrobe / armadio](https://www.flickr.com/photos/26098878@N06/5505967991) | MAZZALI bespoke italian furniture | flickr | CC BY-SA 2.0 |
| DHJ-SLD-004 | [6270 liters](https://www.flickr.com/photos/26098878@N06/5726786344) | MAZZALI bespoke italian furniture | flickr | CC BY-SA 2.0 |
| DHJ-SLD-005 | [Interieur, overzicht van de voorkamer met gesloten schuifdeuren en een](https://commons.wikimedia.org/wiki/File:Interieur,_overzicht_van_de_voorkamer_met_gesloten_schuifdeuren_en_een_authentieke_binnendeur_met_spijlen_van_de_kamer_en_suite_op_de_eerste_verdieping_van_nummer_24_-_Groningen_-_20392797_-_RCE.jpg) | Kris Roderburg / Chris Booms | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-SLD-006 | [Mazzali: KYOTO wardrobe](https://www.flickr.com/photos/26098878@N06/4687022815) | MAZZALI bespoke italian furniture | flickr | CC BY-SA 2.0 |
| DHJ-SLD-007 | [Haría - Calle San Juan 03 ies.jpg](https://commons.wikimedia.org/wiki/File:Har%C3%ADa_-_Calle_San_Juan_03_ies.jpg) | Frank Vincentz | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-SLD-008 | [The old sliding glass door (1454063839).jpg](https://commons.wikimedia.org/wiki/File:The_old_sliding_glass_door_(1454063839).jpg) | Jim Moore | Wikimedia Commons | CC BY 2.0 |
| DHJ-DRS-001 | [KraftMaid Nestled Drawers 2.jpg](https://commons.wikimedia.org/wiki/File:KraftMaid_Nestled_Drawers_2.jpg) | Stilfehler | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-DRS-002 | [Kitchen cupboards with integrated dishwasher.jpg](https://commons.wikimedia.org/wiki/File:Kitchen_cupboards_with_integrated_dishwasher.jpg) | Kotivalo | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-DRS-003 | [Kitchen cabinets at a store in NJ 7.jpg](https://commons.wikimedia.org/wiki/File:Kitchen_cabinets_at_a_store_in_NJ_7.jpg) | Tomwsulcer | Wikimedia Commons | CC0 |
| DHJ-DRS-004 | [Nestled Drawers 2.jpg](https://commons.wikimedia.org/wiki/File:Nestled_Drawers_2.jpg) | Stilfehler | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-DRS-005 | [White kitchen with cabinet doors and drawers opened or removed so that](https://commons.wikimedia.org/wiki/File:White_kitchen_with_cabinet_doors_and_drawers_opened_or_removed_so_that_real-life_stuff_can_be_seen_in_cabinets.jpg) | Kotivalo | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-DRS-006 | [KraftMaid Nestled Drawers Plastic 2.jpg](https://commons.wikimedia.org/wiki/File:KraftMaid_Nestled_Drawers_Plastic_2.jpg) | Stilfehler | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-DRS-007 | [KraftMaid Nestled Drawers Plastic.jpg](https://commons.wikimedia.org/wiki/File:KraftMaid_Nestled_Drawers_Plastic.jpg) | Stilfehler | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-DRS-008 | [Integrated kitchen with lower cabinets closed.jpg](https://commons.wikimedia.org/wiki/File:Integrated_kitchen_with_lower_cabinets_closed.jpg) | Kotivalo | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-DRC-001 | [Bottom mounting wheel drawer slide rails - 50 cm - A.jpg](https://commons.wikimedia.org/wiki/File:Bottom_mounting_wheel_drawer_slide_rails_-_50_cm_-_A.jpg) | Fructibus | Wikimedia Commons | CC0 |
| DHJ-DRC-002 | [Another view of reinforcing the drawer slides.](https://www.flickr.com/photos/13456893@N04/15005540895) | lw5315us | flickr | CC BY-SA 2.0 |
| DHJ-DRC-003 | [Philips N4450. Feet parts (36160019732).jpg](https://commons.wikimedia.org/wiki/File:Philips_N4450._Feet_parts_(36160019732).jpg) | tony_duell | Wikimedia Commons | CC BY 2.0 |
| DHJ-DRC-004 | [Bottom mounting wheel drawer slide rails - 50 cm - B.jpg](https://commons.wikimedia.org/wiki/File:Bottom_mounting_wheel_drawer_slide_rails_-_50_cm_-_B.jpg) | Fructibus | Wikimedia Commons | CC0 |
| DHJ-DRC-005 | [Bottom mounting wheel drawer slide rail - 50 cm - right wall mount - h](https://commons.wikimedia.org/wiki/File:Bottom_mounting_wheel_drawer_slide_rail_-_50_cm_-_right_wall_mount_-_head.jpg) | Fructibus | Wikimedia Commons | CC0 |
| DHJ-DRC-006 | [Side table drawer.jpg](https://commons.wikimedia.org/wiki/File:Side_table_drawer.jpg) | Aral Balkan from Brighton, United Kingdom | Wikimedia Commons | CC BY 2.0 |
| DHJ-DRC-007 | [Schlagwortkatalog.jpg](https://commons.wikimedia.org/wiki/File:Schlagwortkatalog.jpg) | Dr. Marcus Gossler | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-DRC-008 | [Gridfinity drawer and bin.jpg](https://commons.wikimedia.org/wiki/File:Gridfinity_drawer_and_bin.jpg) | Sandstein | Wikimedia Commons | CC0 |
| DHJ-ALU-001 | [Aluprofil und Dichtlippe Gewächshaus Eck.jpg](https://commons.wikimedia.org/wiki/File:Aluprofil_und_Dichtlippe_Gew%C3%A4chshaus_Eck.jpg) | Leo Miregalitheo | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-ALU-002 | [Novacel aluminium profiles protection.jpg](https://commons.wikimedia.org/wiki/File:Novacel_aluminium_profiles_protection.jpg) | Novacel | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-ALU-003 | [Aluprofil für Werbetafel Kunststoff2.jpg](https://commons.wikimedia.org/wiki/File:Aluprofil_f%C3%BCr_Werbetafel_Kunststoff2.jpg) | Leo Miregalitheo | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-ALU-004 | [Glasscheibenmontageprofil Alu.jpg](https://commons.wikimedia.org/wiki/File:Glasscheibenmontageprofil_Alu.jpg) | HTL-Mödchen23 | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-ALU-005 | [Profile GAT.jpg](https://commons.wikimedia.org/wiki/File:Profile_GAT.jpg) | S.Kilinc | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-ALU-006 | [Original public domain image Wikimedia](https://www.rawpixel.com/image/3300936/free-photo-image-aluminium-texture-architecture) | rawpixel | rawpixel | CC0 |
| DHJ-ALU-007 | [Stockholm Waterfront Conference Centre, Stockholm](https://www.rawpixel.com/image/3298107/free-photo-image-abstract-tetxure-aluminium-architectural-detail) | rawpixel | rawpixel | CC0 |
| DHJ-ALU-008 | [Thöni Aluminium-Profile.jpg](https://commons.wikimedia.org/wiki/File:Th%C3%B6ni_Aluminium-Profile.jpg) | Thöni Gruppe | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-INT-001 | [Mirror Screws.jpg](https://commons.wikimedia.org/wiki/File:Mirror_Screws.jpg) | Heron2 | Wikimedia Commons | CC BY-SA 3.0 |
| DHJ-INT-002 | [BOLT SCREW UBT 199.JPG](https://commons.wikimedia.org/wiki/File:BOLT_SCREW_UBT_199.JPG) | © 2010 by Tomasz Sienicki [user: tsca, mail: tomasz.sienicki | Wikimedia Commons | CC BY 3.0 |
| DHJ-INT-003 | [Screw for wood.JPG](https://commons.wikimedia.org/wiki/File:Screw_for_wood.JPG) | Haragayato | Wikimedia Commons | CC BY-SA 2.5 |
| DHJ-INT-004 | [4 SPAX screws with partial and full thread.jpg](https://commons.wikimedia.org/wiki/File:4_SPAX_screws_with_partial_and_full_thread.jpg) | Unknown author | Wikimedia Commons | CC BY 3.0 |
| DHJ-INT-005 | [Šroub s podložkou.jpg](https://commons.wikimedia.org/wiki/File:%C5%A0roub_s_podlo%C5%BEkou.jpg) | Voton.cz autodíly | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-INT-006 | [21-01-20-schraube MG 97858689.jpg](https://commons.wikimedia.org/wiki/File:21-01-20-schraube_MG_97858689.jpg) | Ralf Roletschek | Wikimedia Commons | CC BY-SA 1.0 fi |
| DHJ-INT-007 | [Wood screws.jpg](https://commons.wikimedia.org/wiki/File:Wood_screws.jpg) | Dmitry Makeev | Wikimedia Commons | CC BY 3.0 |
| DHJ-INT-008 | [Schrauben.jpg](https://commons.wikimedia.org/wiki/File:Schrauben.jpg) | Technologyfelix | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-ACC-001 | [Square stainless steel furniture leg - E.jpg](https://commons.wikimedia.org/wiki/File:Square_stainless_steel_furniture_leg_-_E.jpg) | Fructibus | Wikimedia Commons | CC0 |
| DHJ-ACC-002 | [Square stainless steel furniture leg - D.jpg](https://commons.wikimedia.org/wiki/File:Square_stainless_steel_furniture_leg_-_D.jpg) | Fructibus | Wikimedia Commons | CC0 |
| DHJ-ACC-003 | [Square stainless steel furniture leg - B.jpg](https://commons.wikimedia.org/wiki/File:Square_stainless_steel_furniture_leg_-_B.jpg) | Fructibus | Wikimedia Commons | CC0 |
| DHJ-ACC-004 | [WIKI Central Locking Caster Text.jpg](https://commons.wikimedia.org/wiki/File:WIKI_Central_Locking_Caster_Text.jpg) | NatachaSmith | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-ACC-005 | [Square stainless steel furniture leg - A.jpg](https://commons.wikimedia.org/wiki/File:Square_stainless_steel_furniture_leg_-_A.jpg) | Fructibus | Wikimedia Commons | CC0 |
| DHJ-ACC-006 | [Square stainless steel furniture leg - C.jpg](https://commons.wikimedia.org/wiki/File:Square_stainless_steel_furniture_leg_-_C.jpg) | Fructibus | Wikimedia Commons | CC0 |
| DHJ-ACC-007 | [Swivel Caster.jpg](https://commons.wikimedia.org/wiki/File:Swivel_Caster.jpg) | Sbatsche | Wikimedia Commons | CC BY-SA 4.0 |
| DHJ-ACC-008 | [Swivel caster with wheel lock.JPG](https://commons.wikimedia.org/wiki/File:Swivel_caster_with_wheel_lock.JPG) | DMahalko | Wikimedia Commons | CC BY-SA 3.0 |
