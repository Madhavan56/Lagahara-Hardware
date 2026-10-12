/**
 * Verified, freely-licensed category-representative photos (Wikimedia Commons,
 * plus CC0 photography from rawpixel and StockSnap found via Openverse).
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
    url: 'https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcHgxMDYyNzkzLWltYWdlLWt3dndjaWUzLmpwZw.jpg',
    alt: 'White marble-pattern laminate surface with grey veining',
    attribution: '"Free texture background image" — rawpixel, CC0',
  },
  'kitchen-hardware': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hinge_on_kitchen_cabinet_with_soft_closing_mechanism.jpg?width=960',
    alt: 'Soft-close hinge fitted inside a kitchen cabinet',
    attribution: '"Hinge on kitchen cabinet with soft closing mechanism" — Wikimedia Commons, CC BY 2.0, by Shixart1985',
  },
  'wardrobe-hardware': {
    url: 'https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvZmwxOTUwOTk3Njc0OS1pbWFnZS1reWNqdWRwdS5qcGc.jpg',
    alt: 'Built-in white wardrobes with glass-panel doors',
    attribution: '"Low Angle View from Door" — rawpixel, CC0',
  },
  hinges: {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Closet_Door_Hinge,_Soft-Close_(46195408205).jpg?width=960',
    alt: 'Soft-close cabinet hinge screwed to a closet door',
    attribution: '"Closet Door Hinge, Soft-Close" — Wikimedia Commons, CC BY 2.0, by Tony Webster',
  },
  'drawer-systems': {
    url: 'https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdXB3azYyMTE5OTY4LXdpa2ltZWRpYS1pbWFnZS1rb3dnb3pyMy5qcGc.jpg',
    alt: 'Open kitchen drawer with a wooden cutlery organiser',
    attribution: '"View wooden utensil drawer" — rawpixel, CC0',
  },
  'drawer-channels': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bottom_mounting_wheel_drawer_slide_rails_-_50_cm_-_A.jpg?width=960',
    alt: 'Drawer slide rail with mounting wheel detail',
    attribution: '"Bottom mounting wheel drawer slide rails - 50 cm - A" — Wikimedia Commons, CC0, by Fructibus',
  },
  'handles-knobs': {
    url: 'https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL2ZyaGFuZGxlX2Rvb3JfaGFuZGxlX2Rvb3Jrbm9iLWltYWdlLWt5YmRrZHc3LmpwZw.jpg',
    alt: 'Brushed steel lever handle with keyed lock',
    attribution: '"Door handle white door" — rawpixel, CC0',
  },
  'sliding-systems': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Modern_house_view_showing_living_room_and_outdoor_patio_area_with_sliding_glass_doors.jpg?width=960',
    alt: 'Living room with large sliding glass doors to a patio',
    attribution: '"Modern house view showing living room and outdoor patio area with sliding glass doors" — Wikimedia Commons, CC BY 2.0, by Shixart1985',
  },
  'locks-security': {
    url: 'https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA3L3B4NjY4NjE2LWltYWdlLmpwZw.jpg',
    alt: 'Multi-point security door lock with key',
    attribution: '"Free door handle image" — rawpixel, CC0',
  },
  'aluminium-profiles': {
    url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Th%C3%B6ni_Aluminium-Profile.jpg?width=960',
    alt: 'Bundles of extruded aluminium profiles',
    attribution: '"Thöni Aluminium-Profile" — Wikimedia Commons, CC BY-SA 4.0, by Thöni Gruppe',
  },
  'interior-hardware': {
    url: 'https://cdn.stocksnap.io/img-thumbs/960w/0S5UEC0XC2.jpg',
    alt: 'Sorted compartments of steel wood screws',
    attribution: '"Metal Screws" — StockSnap, CC0, by Matt Bango',
  },
  'furniture-accessories': {
    url: 'https://cdn.stocksnap.io/img-thumbs/960w/41AH9JPWSN.jpg',
    alt: 'Small wooden drawer unit with ceramic knobs',
    attribution: '"Minimal Furniture" — StockSnap, CC0, by Eric Haidara',
  },
}
