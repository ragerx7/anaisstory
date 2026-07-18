#!/usr/bin/env python3
"""
Grades a real candid photo to match the site's warm scrapbook-paper palette.
Recipe defined by design-lead review, 2026-07-18 (first use: story-placeholder-1.JPG).

Crop is per-photo (pass --box); the color grade (white balance, contrast,
saturation, warm wash, vignette) is the fixed, reusable part of the recipe —
keep it constant across photos so the whole set reads as one graded family.
The only per-photo grade knob is --blue-factor: use ~0.93 for cool/fluorescent-lit
source photos, closer to ~0.97 for already-warm (tungsten/sunset) source photos.

Usage:
  python3 scripts/grade-candid-photo.py <input.jpg> <output.jpg> \
      --box LEFT,TOP,RIGHT,BOTTOM [--blue-factor 0.93]
"""
import sys
import argparse
from PIL import Image, ImageEnhance


def grade(input_path, output_path, box, blue_factor=0.93, target_size=(1000, 750)):
    img = Image.open(input_path).convert("RGB")
    img = img.crop(box)
    img = img.resize(target_size, Image.LANCZOS)

    # White balance push: cool office light -> warm paper tone
    r, g, b = img.split()
    r = r.point(lambda v: min(255, int(v * 1.06)))
    g = g.point(lambda v: min(255, int(v * 1.005)))
    b = b.point(lambda v: min(255, int(v * blue_factor)))
    img = Image.merge("RGB", (r, g, b))

    img = ImageEnhance.Brightness(img).enhance(1.02)
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img = ImageEnhance.Color(img).enhance(0.93)

    # Warm wash toward the site's raised-paper tone (--color-bg-raised)
    wash = Image.new("RGB", img.size, (234, 224, 203))
    img = Image.blend(img, wash, 0.06)

    # Subtle warm-biased radial vignette (max ~12% corner darkening),
    # applied as a per-pixel multiply so corners darken without a color cast.
    import math
    w, h = img.size
    cx, cy = w / 2, h / 2
    max_dist = math.hypot(cx, cy)
    base = img.load()
    out = Image.new("RGB", img.size)
    outpx = out.load()
    for y in range(h):
        for x in range(w):
            dist = math.hypot(x - cx, y - cy) / max_dist
            falloff = min(1.0, dist ** 2)  # gentle, only bites at corners
            r_m = 1.0 - falloff * 0.10
            g_m = 1.0 - falloff * 0.11
            b_m = 1.0 - falloff * 0.14
            br, bg_, bb = base[x, y]
            outpx[x, y] = (int(br * r_m), int(bg_ * g_m), int(bb * b_m))
    img = out

    for quality in (80, 78, 74, 70):
        img.save(output_path, "JPEG", quality=quality, optimize=True, progressive=True)
        import os
        size = os.path.getsize(output_path)
        if size <= 160_000:
            break
    print(f"Saved {output_path}: {img.size[0]}x{img.size[1]}, {size / 1024:.1f}KB, quality={quality}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("output")
    parser.add_argument("--box", required=True, help="left,top,right,bottom")
    parser.add_argument("--blue-factor", type=float, default=0.93)
    args = parser.parse_args()
    box = tuple(int(v) for v in args.box.split(","))
    grade(args.input, args.output, box, args.blue_factor)
