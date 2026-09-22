/**
 * Verified, freely-licensed category-representative photos (Wikimedia Commons).
 * Shared by the category tiles (public/images/categories/) and by
 * scripts/apply-category-product-images.ts, which copies the same photo into
 * Supabase Storage as the representative image for every product in a category.
 *
 * URLs use the stable Special:FilePath redirector (fetch/curl follow it);
 * ?width=960 serves a pre-resized render. Full attribution: IMAGE_CREDITS.md.
 */
export const CATEGORY_PRODUCT_PHOTOS: Record<
  string,
  { url: string; alt: string; attribution: string }
> = {
  plywood: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Plywood.jpg',
    alt: 'Stacked plywood sheets showing layered cross-section',
    attribution: '"Plywood" — Wikimedia Commons, CC BY-SA 3.0, by Rotor DB',
  },
  'mica-laminates': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Formica_Laminate_for_Countertops_01.jpg',
    alt: 'Decorative laminate sheet with stone-pattern finish',
    attribution: '"Formica Laminate for Countertops 01" — Wikimedia Commons, CC BY-SA 4.0, by Stilfehler',
  },
  'kitchen-hardware': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hinge_on_kitchen_cabinet_with_soft_closing_mechanism.jpg?width=960',
    alt: 'Soft-close hinge fitted inside a kitchen cabinet',
    attribution: '"Hinge on kitchen cabinet with soft closing mechanism" — Wikimedia Commons, CC BY 2.0, by Shixart1985',
  },
  'wardrobe-hardware': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Elfa_storage_system_behind_mirrored_doors_in_bedroom.jpg?width=960',
    alt: 'Wardrobe storage system behind mirrored sliding doors',
    attribution: '"Elfa storage system behind mirrored doors in bedroom" — Wikimedia Commons, CC BY-SA 4.0, by Kotivalo',
  },
  hinges: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Closet_Door_Hinge,_Soft-Close_(46195408205).jpg?width=960',
    alt: 'Soft-close cabinet hinge screwed to a closet door',
    attribution: '"Closet Door Hinge, Soft-Close" — Wikimedia Commons, CC BY 2.0, by Tony Webster',
  },
  'drawer-systems': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bottom_mounting_wheel_drawer_slide_rails_-_50_cm_-_B.jpg?width=960',
    alt: 'Pair of bottom-mounting drawer slide rails',
    attribution: '"Bottom mounting wheel drawer slide rails - 50 cm - B" — Wikimedia Commons, CC0, by Fructibus',
  },
  'drawer-channels': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bottom_mounting_wheel_drawer_slide_rails_-_50_cm_-_A.jpg?width=960',
    alt: 'Drawer slide rail with mounting wheel detail',
    attribution: '"Bottom mounting wheel drawer slide rails - 50 cm - A" — Wikimedia Commons, CC0, by Fructibus',
  },
  'handles-knobs': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/021026344837_d%C3%B6rrkn%C3%A4ppe.jpg?width=960',
    alt: 'Collection of brass door handles and knobs',
    attribution: '"021026344837 dörrknäppe" — Wikimedia Commons, CC BY 4.0, by Digitalt Museum',
  },
  'sliding-systems': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Modern_house_view_showing_living_room_and_outdoor_patio_area_with_sliding_glass_doors.jpg?width=960',
    alt: 'Living room with large sliding glass doors to a patio',
    attribution: '"Modern house view showing living room and outdoor patio area with sliding glass doors" — Wikimedia Commons, CC BY 2.0, by Shixart1985',
  },
  'locks-security': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Deadbolt_Door_Lock_(48650623173).jpg?width=960',
    alt: 'Brass deadbolt lock fitted to a door',
    attribution: '"Deadbolt Door Lock" — Wikimedia Commons, CC BY 2.0, by Tony Webster',
  },
  'aluminium-profiles': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Th%C3%B6ni_Aluminium-Profile.jpg?width=960',
    alt: 'Bundles of extruded aluminium profiles',
    attribution: '"Thöni Aluminium-Profile" — Wikimedia Commons, CC BY-SA 4.0, by Thöni Gruppe',
  },
  'interior-hardware': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Old_tools_on_personal_workshop_wall.jpg?width=960',
    alt: 'Assorted hand tools and fittings on a workshop wall',
    attribution: '"Old tools on personal workshop wall" — Wikimedia Commons, CC0, by Syced',
  },
  'furniture-accessories': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Carpentry_workshop._Iran._Qom_city_%DA%A9%D8%A7%D8%B1%DA%AF%D8%A7%D9%87_%D9%86%D8%AC%D8%A7%D8%B1%DB%8C_%D8%A8%D8%B1%D8%A7%D8%AF%D8%B1%D8%A7%D9%86_%D8%AD%D8%A7%D8%AC_%D9%85%D8%AD%D9%85%D8%AF%DB%8C._%D8%A7%DB%8C%D8%B1%D8%A7%D9%86%D8%8C_%D9%82%D9%85_01.jpg?width=960',
    alt: 'Carpentry workshop with furniture being assembled',
    attribution: '"Carpentry workshop, Qom, Iran 01" — Wikimedia Commons, CC BY-SA 4.0, by Mostafameraji',
  },
}
