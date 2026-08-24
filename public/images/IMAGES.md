# Images

## Status

| File                                | State                                                                 |
| ----------------------------------- | --------------------------------------------------------------------- |
| `hero-cutout.png`                   | ✅ real — trimmed to content bounds (see below)                        |
| `back-to-dinner / work / life / people.png` | ⚠️ real but **250×200** — too small, see "Resolution" below    |
| `avatar-1..3.jpg`                   | ❌ still generated placeholders                                        |

`npm run placeholders` regenerates the placeholder set. It will **overwrite the
real images**, so only run it on a clean checkout.

---

## The hero cutout: no transparent margin

`hero-cutout.png` must be trimmed tight to the figure. The version originally
supplied was 1482×2096 with the subject occupying only the lower half — **46.7%
of the canvas height was empty alpha at the top**.

That is not cosmetic. The hero renders the cutout with `object-contain`, which
fits the *whole canvas* into its box. Transparent padding therefore scales the
figure down and pushes it to the bottom of the frame: at 46.7% padding the
subject rendered roughly half the intended size and about 240px too low.

The shipped file is cropped to its alpha bounding box — 1037×1118, and 1.35MB
down to 894KB as a side effect. **If you re-export, trim it the same way**:

```bash
python3 -c "
from PIL import Image
im = Image.open('hero-cutout.png').convert('RGBA')
im.crop(im.getchannel('A').getbbox()).save('hero-cutout.png')
"
```

Compose the shot cropped at roughly mid-thigh — the hero anchors the figure to
the section floor, so the bottom of the image is the bottom of the section.
Keep it PNG or WebP: a JPEG has no alpha and will paint an opaque box over the
gradient wash.

## Resolution

The four `back-to-*.png` files are **250×200**. They render about 220 CSS px
wide, which is 440px on a 2× display — so they are currently upscaled roughly 2×
and will look soft on any modern screen. Re-export them at **800×600 or larger**.

`next/image` converts to WebP/AVIF and generates responsive sizes on the way
out, so a large, clean source is what you want to commit. It cannot invent
detail that is not in the file.

## Shot list

| File                 | Where                     | Ratio        | Shot                                                                    |
| -------------------- | ------------------------- | ------------ | ----------------------------------------------------------------------- |
| `hero-cutout.png`    | Hero subject              | ~3:4         | Transparent cutout, no backdrop, no margin. Figure crops at the section floor. |
| `back-to-dinner.png` | "Back to life", top left  | 4:3          | Woman at her dining table, phone face-down beside the plate             |
| `back-to-work.png`   | "Back to life", top right | 4:3          | Man at a laptop in a home office                                        |
| `back-to-life.png`   | "Back to life", mid left  | 4:3          | Friends laughing at an outdoor table                                    |
| `back-to-people.png` | "Back to life", mid right | 4:3          | Shop owner serving a customer at her counter                            |
| `avatar-1..3.jpg`    | Waitlist arc              | 1:1          | Head-and-shoulders portraits, plain backdrops, ≥400×400                 |

Alt text lives in `src/lib/content.ts`, not here — update it there if a shot
changes meaningfully. The three avatars are decorative and carry empty alt on
purpose.

`hero-cutout.png` is the only image marked `priority`; it is the LCP element.
