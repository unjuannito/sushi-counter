"""Generate the versioned PWA icon set from one high-resolution PNG master.

Usage:
    python scripts/generate-pwa-icons.py

Requires Pillow: python -m pip install Pillow
"""

import argparse
import shutil
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
MASTER = Path(__file__).resolve().parent / "assets" / "pwa-icon-master.png"
ICONS = PUBLIC / "icons" / "v2"

PNG_SIZES = (48, 72, 96, 128, 144, 192, 256, 384, 512)
ICO_SIZES = (16, 20, 24, 32, 40, 48, 64, 72, 96, 128, 256)


def resized(master: Image.Image, size: int) -> Image.Image:
    return master.resize((size, size), Image.Resampling.LANCZOS).convert("RGBA")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--clean",
        action="store_true",
        help="remove generated icon files before regenerating them",
    )
    args = parser.parse_args()

    if not MASTER.exists():
        raise SystemExit(f"Master icon not found: {MASTER}")

    if args.clean and ICONS.exists():
        shutil.rmtree(ICONS)

    ICONS.mkdir(parents=True, exist_ok=True)
    master = Image.open(MASTER).convert("RGBA")

    for size in PNG_SIZES:
        resized(master, size).save(ICONS / f"icon-{size}.png", "PNG", optimize=True)

    # Keep the maskable icon separate so it can be replaced independently later.
    resized(master, 512).save(ICONS / "maskable-512.png", "PNG", optimize=True)

    # Pillow writes a 32-bit RGBA ICO with PNG-compressed 256px data.
    resized(master, 256).save(
        PUBLIC / "favicon.ico",
        "ICO",
        sizes=[(size, size) for size in ICO_SIZES],
    )
    resized(master, 180).save(PUBLIC / "apple-touch-icon.png", "PNG", optimize=True)
    resized(master, 32).save(PUBLIC / "favicon-32.png", "PNG", optimize=True)
    resized(master, 16).save(PUBLIC / "favicon-16.png", "PNG", optimize=True)



if __name__ == "__main__":
    main()
