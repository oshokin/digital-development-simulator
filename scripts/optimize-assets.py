"""Build-only conversion: Pillow with WebP support; no runtime dependency."""
from io import BytesIO
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
for category in ("backgrounds", "sprites"):
    before = after = count = 0
    for source in sorted((root / "dist/assets/game" / category).rglob("*")):
        if source.suffix.lower() not in (".png", ".webp"):
            continue
        # Keep existing lossy backgrounds: re-encoding would lose quality.
        if source.suffix.lower() == ".webp" and category == "backgrounds":
            continue
        old = source.stat().st_size
        image = Image.open(source)
        output = BytesIO()
        image.save(output, "WEBP", quality=85, lossless=category != "backgrounds", method=6, exact=True)
        data = output.getvalue()
        before += old
        if len(data) < old:
            destination = source.with_suffix(".webp")
            destination.write_bytes(data)
            if source != destination:
                source.unlink()
            after += len(data)
            count += 1
        else:
            after += old
    print(f"{category}: {before} -> {after} bytes; {count} converted")
