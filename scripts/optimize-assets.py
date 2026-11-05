"""Build-only conversion: Pillow with WebP support; no runtime dependency."""
from io import BytesIO
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
for category in ("backgrounds", "sprites", "hazards"):
    before = after = count = 0
    for source in sorted((root / "dist/assets" / category).glob("*.png")):
        old = source.stat().st_size
        image = Image.open(source)
        output = BytesIO()
        image.save(output, "WEBP", quality=85, lossless=category != "backgrounds", method=6, exact=True)
        data = output.getvalue()
        before += old
        if len(data) < old:
            source.with_suffix(".webp").write_bytes(data)
            source.unlink()
            after += len(data)
            count += 1
        else:
            after += old
    print(f"{category}: {before} -> {after} bytes; {count} converted")
