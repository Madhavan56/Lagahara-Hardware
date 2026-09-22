"""One-off: give all 104 products unique images.

Generates a deterministic unique crop (per-SKU zoom/offset/tone jitter) of the
category's real photo for every product, uploads it to Supabase Storage as
<category-slug>/<sku>.jpg, repoints product_images rows, and removes the shared
category-representative.jpg objects. Deterministic per SKU, so re-runs produce
identical files (idempotent) and interrupted runs resume safely.

Run with: set -a; source .env; set +a; python scripts/generate_unique_product_images.py
"""
import hashlib
import io
import os
import sys
import urllib.request

import requests
from PIL import Image, ImageEnhance, ImageOps

UA = {"User-Agent": "LagharaHardwares-Sourcing/1.0"}
BUCKET = "product-images"

# Cap source dimensions before per-SKU cropping — some Commons originals are
# 7k+ px wide, and decoding that per product is needlessly slow.
SOURCE_MAX_SIDE = 2000

# Category slug -> (source URL of the real photo, alt text)
PHOTOS = {
    "plywood": ("https://upload.wikimedia.org/wikipedia/commons/1/1d/Plywood.jpg",
                "Plywood sheets showing layered cross-section"),
    "mica-laminates": ("https://upload.wikimedia.org/wikipedia/commons/1/1d/Formica_Laminate_for_Countertops_01.jpg",
                       "Decorative laminate sheet with stone-pattern finish"),
    "kitchen-hardware": ("https://upload.wikimedia.org/wikipedia/commons/1/1d/Formica_Laminate_for_Countertops_01.jpg",
                         "Kitchen cabinet hardware detail"),
    "wardrobe-hardware": ("https://commons.wikimedia.org/wiki/Special:FilePath/Elfa_storage_system_behind_mirrored_doors_in_bedroom.jpg?width=1600",
                          "Wardrobe storage behind mirrored sliding doors"),
    "hinges": ("https://commons.wikimedia.org/wiki/Special:FilePath/Closet_Door_Hinge,_Soft-Close_(46195408205).jpg?width=1600",
               "Soft-close cabinet hinge"),
    "drawer-systems": ("https://commons.wikimedia.org/wiki/Special:FilePath/Bottom_mounting_wheel_drawer_slide_rails_-_50_cm_-_B.jpg?width=1600",
                       "Drawer slide rails, extended view"),
    "drawer-channels": ("https://commons.wikimedia.org/wiki/Special:FilePath/Bottom_mounting_wheel_drawer_slide_rails_-_50_cm_-_A.jpg?width=1600",
                        "Drawer slide rail with mounting wheel detail"),
    "handles-knobs": ("https://commons.wikimedia.org/wiki/Special:FilePath/021026344837_d%C3%B6rrkn%C3%A4ppe.jpg?width=1600",
                      "Brass door handles and knobs"),
    "sliding-systems": ("https://commons.wikimedia.org/wiki/Special:FilePath/Modern_house_view_showing_living_room_and_outdoor_patio_area_with_sliding_glass_doors.jpg?width=1600",
                        "Sliding glass doors to a patio"),
    "locks-security": ("https://commons.wikimedia.org/wiki/Special:FilePath/Deadbolt_Door_Lock_(48650623173).jpg?width=1600",
                       "Brass deadbolt lock on a door"),
    "aluminium-profiles": ("https://commons.wikimedia.org/wiki/Special:FilePath/Th%C3%B6ni_Aluminium-Profile.jpg?width=1600",
                           "Bundles of extruded aluminium profiles"),
    "interior-hardware": ("https://commons.wikimedia.org/wiki/Special:FilePath/Old_tools_on_personal_workshop_wall.jpg?width=1600",
                          "Hand tools and fittings on a workshop wall"),
    "furniture-accessories": ("https://commons.wikimedia.org/wiki/Special:FilePath/Carpentry_workshop._Iran._Qom_city_%DA%A9%D8%A7%D8%B1%DA%AF%D8%A7%D9%87_%D9%86%D8%AC%D8%A7%D8%B1%DB%8C_%D8%A8%D8%B1%D8%A7%D8%AF%D8%B1%D8%A7%D9%86_%D8%AD%D8%A7%D8%AC_%D9%85%D8%AD%D9%85%D8%AF%DB%8C._%D8%A7%DB%8C%D8%B1%D8%A7%D9%86%D8%8C_%D9%82%D9%85_01.jpg?width=1600",
                              "Carpentry workshop with furniture being assembled"),
}


def api_base():
    return os.environ["SUPABASE_URL"].rstrip("/") + "/rest/v1"


def storage_api_base():
    return os.environ["SUPABASE_URL"].rstrip("/") + "/storage/v1"


def auth_headers():
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}


def rest_get(path, params=None):
    r = requests.get(api_base() + path, params=params or {}, headers=auth_headers(), timeout=30)
    r.raise_for_status()
    return r.json()


def sku_seed(sku: str) -> int:
    return int(hashlib.sha256(sku.encode()).hexdigest()[:8], 16)


def make_variant(img: Image.Image, seed: int) -> Image.Image:
    """Deterministic unique crop: per-SKU zoom, pan, rotation-free, slight tone shift."""
    w, h = img.size
    rnd = seed

    def nextf(lo, hi):
        nonlocal rnd
        rnd = (rnd * 1103515245 + 12345) & 0x7FFFFFFF
        return lo + (rnd / 0x7FFFFFFF) * (hi - lo)

    zoom = nextf(1.0, 0.30)  # crop 70-100% of the frame
    pan_x = nextf(0.0, 1 - zoom) if zoom < 1 else 0.0
    pan_y = nextf(0.0, 1 - zoom) if zoom < 1 else 0.0

    crop_w, crop_h = int(w * zoom), int(h * zoom)
    left, top = int(w * pan_x), int(h * pan_y)
    cropped = img.crop((left, top, left + crop_w, top + crop_h))

    # Square cover render at 800x800 (matches productImageUrl transform size).
    side = min(cropped.size)
    cl = (cropped.width - side) // 2
    ct = (cropped.height - side) // 2
    cropped = cropped.crop((cl, ct, cl + side, ct + side)).resize((800, 800), Image.LANCZOS)

    brightness = nextf(0.96, 1.06)
    if abs(brightness - 1.0) > 0.005:
        cropped = ImageEnhance.Brightness(cropped).enhance(brightness)
    saturation = nextf(0.97, 1.05)
    if abs(saturation - 1.0) > 0.005:
        cropped = ImageEnhance.Color(cropped).enhance(saturation)
    return cropped


def to_jpeg_bytes(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=82, optimize=True)
    return buf.getvalue()


def upload_object(path: str, data: bytes) -> None:
    r = requests.post(
        f"{storage_api_base()}/object/{BUCKET}/{path}",
        data=data,
        headers={**auth_headers(), "Content-Type": "image/jpeg", "x-upsert": "true"},
        timeout=60,
    )
    if r.status_code not in (200, 201):
        raise RuntimeError(f"upload {path} -> {r.status_code}: {r.text[:200]}")


def delete_object(path: str) -> None:
    requests.delete(
        f"{storage_api_base()}/object/{BUCKET}/{path}",
        headers=auth_headers(),
        timeout=30,
    )


def main() -> None:
    print(f"python {sys.version.split()[0]}", flush=True)
    categories = {c["slug"]: c["id"] for c in rest_get("/categories", {"select": "id, slug"})}

    products = rest_get("/products", {
        "select": "id, sku, category_id, product_images(id, storage_path, is_primary)",
        "is_active": "eq.true",
    })
    print(f"{len(products)} active products", flush=True)

    photo_cache: dict[str, Image.Image] = {}
    updated = skipped = failed = 0

    for p in products:
        try:
            cat_slug = next((s for s, cid in categories.items() if cid == p["category_id"]), None)
            entry = PHOTOS.get(cat_slug)
            if not entry:
                print(f"  ! no photo config for category '{cat_slug}' — skipping", flush=True)
                failed += 1
                continue

            sku = p["sku"]
            existing = p.get("product_images") or []
            expected_path = f"{cat_slug}/{sku}.jpg"

            # Idempotent: skip products already pointing at their per-SKU image.
            if len(existing) == 1 and existing[0]["storage_path"] == expected_path:
                skipped += 1
                continue

            if cat_slug not in photo_cache:
                url, _alt = entry
                print(f"{cat_slug}: downloading source photo…", flush=True)
                req = urllib.request.Request(url, headers=UA)
                with urllib.request.urlopen(req, timeout=120) as resp:
                    img = Image.open(io.BytesIO(resp.read()))
                img = ImageOps.exif_transpose(img)
                if max(img.size) > SOURCE_MAX_SIDE:
                    img.thumbnail((SOURCE_MAX_SIDE, SOURCE_MAX_SIDE), Image.LANCZOS)
                photo_cache[cat_slug] = img

            variant = make_variant(photo_cache[cat_slug], sku_seed(sku))
            jpeg = to_jpeg_bytes(variant)
            upload_object(expected_path, jpeg)

            if existing:
                image_id = existing[0]["id"]
                r = requests.patch(
                    api_base() + "/product_images",
                    params={"id": f"eq.{image_id}"},
                    json={"storage_path": expected_path, "is_primary": True, "sort_order": 0},
                    headers=auth_headers(),
                    timeout=30,
                )
                if r.status_code not in (200, 204):
                    raise RuntimeError(f"row update failed {r.status_code}: {r.text[:200]}")
                # Remove now-unused shared object only after a successful repoint.
                old = existing[0]["storage_path"]
                if old.endswith("category-representative.jpg"):
                    delete_object(old)
            else:
                r = requests.post(
                    api_base() + "/product_images",
                    json=[{
                        "product_id": p["id"],
                        "storage_path": expected_path,
                        "alt_text": entry[1],
                        "is_primary": True,
                        "sort_order": 0,
                    }],
                    headers=auth_headers(),
                    timeout=30,
                )
                if r.status_code not in (200, 201):
                    raise RuntimeError(f"row insert failed {r.status_code}: {r.text[:200]}")

            updated += 1
            if updated % 10 == 0:
                print(f"  …{updated} done", flush=True)
        except Exception as exc:  # noqa: BLE001 — keep the batch going
            print(f"  ! {p.get('sku', '?')}: {exc}", flush=True)
            failed += 1

    print(f"\nDone. {updated} updated, {skipped} already unique, {failed} failed.", flush=True)


if __name__ == "__main__":
    main()
