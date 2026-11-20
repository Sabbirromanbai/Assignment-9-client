# Image Assets - Pizzabari Hero

## Existing Assets

| File | Source | License | Notes |
|------|--------|---------|-------|
| `pizza-logo.png` | Existing repo asset | Internal | Logo mark (PNG, RGBA, 1774×887) |
| `hero-pizza.jpg` | Existing repo asset | Internal | Hero pizza photo (JPEG, 875KB) |

## Hero visual assets

The transparent-background pizza scene PNGs below are used as layered, floating 3D cards in `apps/web/components/hero.tsx`:

| File | Source | License | Notes |
|------|--------|---------|-------|
| `Floating Wood-Fired Pizza Feast-3.png` | Repo asset (added with hero refresh) | Internal | Main hero showcase card |
| `Dynamic Floating Pizza Feast-2.png` | Repo asset (added with hero refresh) | Internal | Back-left floating card |
| `Pizza Feast Ingredient Collage-4.png` | Repo asset (added with hero refresh) | Internal | Back-right floating card |
| `Cheesy Pizza Ingredient Explosion.png` | Repo asset (added with hero refresh) | Internal | Small orbiting ingredient thumbnail in the hero stage |
| `Cheesy Pizza Ingredient Explosion-1.png` | Repo asset (added with hero refresh) | Internal | Duplicate of the above |

## Recommended Workflow

1. Source high-resolution pizza and ingredient photos from Unsplash or Pexels (free license, verify per-image).
2. Remove backgrounds using a background-removal tool (e.g., remove.bg, Photoshop, or Photopea) to create transparent PNG cutouts.
3. Save cutouts under `apps/web/public/images/` with descriptive names.
4. Import into `apps/web/components/hero.tsx` as separate `Image` components inside `motion.div` wrappers with independent floating animations.
5. Add each asset's source URL and license to this file.

## License Guidance

- Unsplash: Free for commercial and non-commercial use (Unsplash License). Attribution appreciated but not required.
- Pexels: Free for commercial and non-commercial use (Pexels License). Attribution appreciated but not required.
- Always verify the license on the individual asset page before use.
- Do not hotlink external images; download and store locally.

## Hero implementation notes

The hero renders the transparent scene PNGs inside perspective-transformed layers: two smaller rotated cards sit behind the main showcase card, glass chips float in front, and CSS/motion drive gentle float, orbit, shine and scroll-parallax effects. All motion is skipped when the user prefers reduced motion.