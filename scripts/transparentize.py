"""
assets/img 하위 PNG 파일들의 흰 배경을 투명 처리.

알고리즘:
- 픽셀의 max(R,G,B)가 SOLID_THRESHOLD 이상이면 완전 투명
- SOFT_THRESHOLD~SOLID_THRESHOLD 사이는 부드럽게 알파 감소
- 그 외는 원본 알파 유지
- floodfill을 사용해 외곽의 흰 배경만 제거 (캐릭터 내부의 흰색은 보존)

실행: python scripts/transparentize.py
원본은 assets/img_original/에 백업
"""
from __future__ import annotations
import shutil
from pathlib import Path
from PIL import Image
from collections import deque

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "assets" / "img"
BACKUP_DIR = ROOT / "assets" / "img_original"

# 흰색 판정 임계값
SOLID_THRESHOLD = 245  # max(R,G,B) >= 245 이면 완전 흰색으로 간주
SOFT_THRESHOLD = 215   # 215~245 사이는 부드럽게 전환


def is_whiteish(r: int, g: int, b: int) -> bool:
    return min(r, g, b) >= SOFT_THRESHOLD


def process_image(in_path: Path) -> Image.Image:
    img = Image.open(in_path).convert("RGBA")
    w, h = img.size
    pixels = img.load()
    assert pixels is not None

    # 1) 외곽 시드(가장자리 픽셀 중 흰색)로부터 BFS flood fill
    visited = [[False] * h for _ in range(w)]
    queue: deque[tuple[int, int]] = deque()

    edge_coords = []
    for x in range(w):
        edge_coords.append((x, 0))
        edge_coords.append((x, h - 1))
    for y in range(h):
        edge_coords.append((0, y))
        edge_coords.append((w - 1, y))

    for x, y in edge_coords:
        r, g, b, _ = pixels[x, y]
        if is_whiteish(r, g, b) and not visited[x][y]:
            visited[x][y] = True
            queue.append((x, y))

    # 외곽 흰색 영역을 확장
    bg_mask = [[False] * h for _ in range(w)]
    while queue:
        x, y = queue.popleft()
        bg_mask[x][y] = True
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                rr, gg, bb, _ = pixels[nx, ny]
                if is_whiteish(rr, gg, bb):
                    visited[nx][ny] = True
                    queue.append((nx, ny))

    # 2) 배경 마스크 영역의 알파를 흰색 정도에 따라 부드럽게 0~255 보간
    out = img.copy()
    out_pixels = out.load()
    assert out_pixels is not None
    for x in range(w):
        for y in range(h):
            if not bg_mask[x][y]:
                continue
            r, g, b, a = pixels[x, y]
            m = max(r, g, b)
            if m >= SOLID_THRESHOLD:
                new_alpha = 0
            else:
                # SOFT_THRESHOLD ~ SOLID_THRESHOLD 보간
                t = (m - SOFT_THRESHOLD) / max(1, SOLID_THRESHOLD - SOFT_THRESHOLD)
                t = max(0.0, min(1.0, t))
                new_alpha = int(a * (1 - t))
            out_pixels[x, y] = (r, g, b, new_alpha)

    return out


def main() -> None:
    if not SRC_DIR.exists():
        raise SystemExit(f"Source directory not found: {SRC_DIR}")

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    png_files = sorted(SRC_DIR.glob("*.png"))
    if not png_files:
        raise SystemExit("No PNG files found.")

    for png in png_files:
        backup_path = BACKUP_DIR / png.name
        if not backup_path.exists():
            shutil.copy2(png, backup_path)
            print(f"  backup: {png.name}")

        new_img = process_image(backup_path)
        new_img.save(png, format="PNG", optimize=True)
        print(f"  processed: {png.name} ({new_img.size[0]}x{new_img.size[1]})")

    print(f"\nDone. {len(png_files)} files processed.")
    print(f"Originals backed up to: {BACKUP_DIR}")


if __name__ == "__main__":
    main()
