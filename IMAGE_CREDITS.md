# Image credits

All imagery below is real, freely-licensed photography from Wikimedia Commons.
Several licenses require attribution, kept here rather than on every page.

## Category tiles

Stored locally in `public/images/categories/` at two widths (480w/960w) and
referenced via `src/config/categoryImages.ts`.

| Category | Source file | Author | License |
|---|---|---|---|
| Plywood | [Plywood.jpg](https://commons.wikimedia.org/wiki/File:Plywood.jpg) | Rotor DB (English Wikipedia) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Mica & Laminates | [Formica Laminate for Countertops 01.jpg](https://commons.wikimedia.org/wiki/File:Formica_Laminate_for_Countertops_01.jpg) | Stilfehler | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Kitchen Hardware | [Modern kitchen and dining area…jpg](https://commons.wikimedia.org/wiki/File:Modern_kitchen_and_dining_area_in_a_simple_home_setting_showing_light_colors_and_minimal_decor.jpg) | Shixart1985 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Wardrobe Hardware | [Elfa storage system behind mirrored doors in bedroom.jpg](https://commons.wikimedia.org/wiki/File:Elfa_storage_system_behind_mirrored_doors_in_bedroom.jpg) | Kotivalo | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Sliding Systems | [Modern house view…sliding glass doors.jpg](https://commons.wikimedia.org/wiki/File:Modern_house_view_showing_living_room_and_outdoor_patio_area_with_sliding_glass_doors.jpg) | Shixart1985 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Locks & Security | [Deadbolt Door Lock.jpg](https://commons.wikimedia.org/wiki/File:Deadbolt_Door_Lock_(48650623173).jpg) | Tony Webster | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Interior Hardware | [Old tools on personal workshop wall.jpg](https://commons.wikimedia.org/wiki/File:Old_tools_on_personal_workshop_wall.jpg) | Syced | CC0 (public domain) |
| Furniture Accessories | [Carpentry workshop, Qom, Iran 01.jpg](https://commons.wikimedia.org/wiki/File:Carpentry_workshop._Iran._Qom_city_%DA%A9%D8%A7%D8%B1%DA%AF%D8%A7%D9%87_%D9%86%D8%AC%D8%A7%D8%B1%DB%8C_%D8%A8%D8%B1%D8%A7%D8%AF%D8%B1%D8%A7%D9%86_%D8%AD%D8%A7%D8%AC_%D9%85%D8%AD%D9%85%D8%AF%DB%8C._%D8%A7%DB%8C%D8%B1%D8%A7%D9%86%D8%8C_%D9%82%D9%85_01.jpg) | Mostafameraji | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |

**Without a photo yet:** Hinges, Drawer Systems, Drawer Channels & Runners,
Handles & Knobs, Aluminium Profiles. These render a branded gradient tile with
the category icon — same aspect ratio, radius, scrim and label as the photo
tiles. Free-licensed archives have no usable modern photography for these
specific hardware components (searched across four rounds). To upgrade one:
drop `<slug>-480.jpg` and `<slug>-960.jpg` into `public/images/categories/`
and add a `photo` entry in `src/config/categoryImages.ts`.

## Product photography

Plywood and Mica & Laminates products reuse the two material photos above
(applied via `npm run apply:real-images`).

Every other product has **no image by design** — fabricated product photos
aren't photos of anything real. Those products show a branded "Photo coming
soon" state until genuine supplier/manufacturer photos are uploaded per
product through **Admin → Products → (product) → Images**.
