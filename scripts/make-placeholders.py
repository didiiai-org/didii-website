"""
Generate on-brand placeholder imagery for public/images.

These exist so the layout renders and screenshots read correctly before the
real Figma exports land. Replace them one-for-one — same filenames, see
public/images/IMAGES.md for the shot list. Nothing here should ship.
"""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent.parent / "public" / "images"
OUT.mkdir(parents=True, exist_ok=True)

random.seed(1222)  # the Figma node — keeps regeneration deterministic


def lerp(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))  # type: ignore[return-value]


def gradient(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int], angle: float = 0.35):
    """Diagonal two-stop gradient."""
    w, h = size
    img = Image.new("RGB", (w, h))
    px = img.load()
    assert px is not None
    dx, dy = math.cos(angle), math.sin(angle)
    norm = abs(dx) * w + abs(dy) * h
    for y in range(h):
        for x in range(w):
            t = (x * dx + y * dy) / norm
            px[x, y] = lerp(top, bottom, min(max(t, 0.0), 1.0))
    return img


def vignette(img: Image.Image, strength: float = 0.35) -> Image.Image:
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse([-w * 0.25, -h * 0.25, w * 1.25, h * 1.25], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=min(w, h) * 0.12))
    dark = Image.new("RGB", (w, h), (0, 0, 0))
    return Image.blend(dark, img, 1.0).point(lambda v: v) if strength <= 0 else Image.composite(
        img, Image.blend(img, dark, strength), mask
    )


def grain(img: Image.Image, amount: int = 5) -> Image.Image:
    w, h = img.size
    noise = Image.new("L", (w, h))
    noise.putdata([random.randint(128 - amount, 128 + amount) for _ in range(w * h)])
    noise = noise.filter(ImageFilter.GaussianBlur(0.6))
    return Image.blend(img, Image.merge("RGB", (noise, noise, noise)), 0.06)


def soft_shapes(img: Image.Image, colour: tuple[int, int, int], count: int = 5) -> Image.Image:
    """A few blurred blobs so the frame is not a flat wash."""
    w, h = img.size
    layer = Image.new("RGB", (w, h), (0, 0, 0))
    draw = ImageDraw.Draw(layer)
    for _ in range(count):
        r = random.uniform(0.14, 0.34) * min(w, h)
        cx, cy = random.uniform(0, w), random.uniform(0, h)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=colour)
    layer = layer.filter(ImageFilter.GaussianBlur(min(w, h) * 0.14))
    return Image.blend(img, layer, 0.22)


def build(name: str, size: tuple[int, int], top: str, bottom: str, blob: str, shapes: int = 5) -> None:
    to_rgb = lambda hexs: tuple(int(hexs[i : i + 2], 16) for i in (1, 3, 5))  # noqa: E731
    img = gradient(size, to_rgb(top), to_rgb(bottom))
    img = soft_shapes(img, to_rgb(blob), shapes)
    img = vignette(img, 0.30)
    img = grain(img)
    # Format follows the extension — the name has to match what the site asks
    # for, and a .png holding JPEG bytes is the kind of thing that bites later.
    if (OUT / name).suffix.lower() == ".png":
        img.save(OUT / name, "PNG", optimize=True)
    else:
        img.save(OUT / name, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"  {name}  {size[0]}×{size[1]}")


def hero_cutout(name: str = "hero-cutout.png", size: tuple[int, int] = (640, 840)) -> None:
    """
    Transparent stand-in for the cut-out hero subject.

    A soft head-and-shoulders mass in muted sage, so the hero composition reads
    (the transcript overlaps it, the figure is clipped by the section floor)
    without pretending to be a photograph of a person.
    """
    w, h = size
    ss = 3  # supersample, then downscale for clean edges
    mask = Image.new("L", (w * ss, h * ss), 0)
    d = ImageDraw.Draw(mask)

    cx = w * 0.52 * ss
    head_r = w * 0.155 * ss
    head_cy = h * 0.20 * ss

    # head
    d.ellipse([cx - head_r, head_cy - head_r * 1.12, cx + head_r, head_cy + head_r * 1.12], fill=255)
    # neck
    d.rounded_rectangle(
        [cx - head_r * 0.36, head_cy + head_r * 0.7, cx + head_r * 0.36, head_cy + head_r * 1.9],
        radius=head_r * 0.3,
        fill=255,
    )
    # torso — widening down to the clipped floor
    top_y = head_cy + head_r * 1.5
    d.polygon(
        [
            (cx - w * 0.10 * ss, top_y),
            (cx + w * 0.10 * ss, top_y),
            (cx + w * 0.34 * ss, h * 0.52 * ss),
            (cx + w * 0.31 * ss, h * ss),
            (cx - w * 0.33 * ss, h * ss),
            (cx - w * 0.36 * ss, h * 0.52 * ss),
        ],
        fill=255,
    )
    # shoulders, rounded
    d.ellipse([cx - w * 0.37 * ss, h * 0.30 * ss, cx - w * 0.10 * ss, h * 0.52 * ss], fill=255)
    d.ellipse([cx + w * 0.10 * ss, h * 0.30 * ss, cx + w * 0.35 * ss, h * 0.52 * ss], fill=255)
    # forearms meeting at a phone, held at chest height
    d.rounded_rectangle(
        [cx - w * 0.20 * ss, h * 0.55 * ss, cx + w * 0.20 * ss, h * 0.66 * ss],
        radius=w * 0.055 * ss,
        fill=255,
    )

    mask = mask.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(2.2))

    body = gradient((w, h), (150, 173, 156), (74, 100, 82), angle=1.2)
    body = soft_shapes(body, (108, 137, 116), 4)

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(body, (0, 0), mask)
    out.save(OUT / name, "PNG", optimize=True)
    print(f"  {name}  {w}×{h} (transparent)")


# Hero subject — a cut-out with a transparent background, clipped by the
# section floor. Not a framed photo: the figure bleeds off the bottom.
hero_cutout()

# The four "back to …" moments — warm interiors, low light. 16:9 to match the
# frame in `BackToLife.tsx`; a 4:3 placeholder here would be cropped on the sides.
build("back-to-dinner.jpg", (1376, 768), "#f0d7ae", "#6d4520", "#c98f4c")
build("back-to-work.jpg", (1376, 768), "#dfe6ea", "#4a5b63", "#93a7b0")
build("back-to-life.jpg", (1376, 768), "#f5dcae", "#7a4a22", "#d4a05a")
build("back-to-people.jpg", (1376, 768), "#e8d7c0", "#5f4a33", "#bd9a6e")

# Waitlist avatars. `.png` — that is what `finalCta.avatars` asks for.
build("avatar-1.png", (400, 400), "#e6dcc4", "#8d7d5e", "#c9bb99", 3)
build("avatar-2.png", (400, 400), "#cfe0d3", "#4f6a58", "#9dbaa6", 3)
build("avatar-3.png", (400, 400), "#dcd8ee", "#5d5a7a", "#a8a3c6", 3)

print("done")
