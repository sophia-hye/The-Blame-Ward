"""
큰 스프라이트시트(셀 1440x1440)를 웹 게임용으로 리사이즈하고 메타데이터를 재생성한다.

입력: assets/img/<character>/spritesheet_normal_sideview/spritesheet-*.png + .json
출력: assets/img/<character>/walking_sideview.png + walking_sideview.json

크기: 1440 -> 360 (1/4 축소), 23040x5760 -> 5760x1440
"""
from __future__ import annotations
import json
from pathlib import Path
from PIL import Image

# Pillow의 대용량 이미지 경고 임계치 해제 (캐릭터 일러스트라 안전)
Image.MAX_IMAGE_PIXELS = None

ROOT = Path(__file__).resolve().parent.parent
TARGET_CELL = 360

# 처리 대상 정의: (캐릭터 폴더 이름, 입력 spritesheet 폴더 이름, 출력 prefix)
CHARACTERS = [
    ('LeeRu-ri', 'spritesheet_normal_sideview', 'walking_sideview'),
]


def find_sheet_files(folder: Path) -> tuple[Path, Path]:
    pngs = [p for p in folder.glob('spritesheet-*.png') if not p.name.endswith('.gif')]
    jsons = list(folder.glob('spritesheet-*.json'))
    if not pngs or not jsons:
        raise FileNotFoundError(f'sheet png/json not found in {folder}')
    return pngs[0], jsons[0]


def process(char_folder: str, sheet_folder: str, out_prefix: str) -> None:
    base = ROOT / 'assets' / 'img' / char_folder
    sheet_dir = base / sheet_folder
    sheet_png, sheet_json = find_sheet_files(sheet_dir)

    print(f'[{char_folder}] reading {sheet_png.name} ...')
    img = Image.open(sheet_png)
    print(f'  original size: {img.size}, mode: {img.mode}')

    with open(sheet_json, 'r', encoding='utf-8') as f:
        meta = json.load(f)
    frames = meta['frames']
    if not isinstance(frames, dict):
        raise ValueError('Expected frames dict in metadata.')

    # 원본 셀 크기 추출 (첫 프레임 기준)
    first_key = next(iter(frames))
    src_cell = frames[first_key]['frame']['w']
    if src_cell != frames[first_key]['frame']['h']:
        raise ValueError('non-square cells not supported')
    scale = TARGET_CELL / src_cell

    new_w = int(img.size[0] * scale)
    new_h = int(img.size[1] * scale)
    print(f'  resize -> {new_w}x{new_h} (cell {src_cell}->{TARGET_CELL}, scale {scale:.4f})')
    resized = img.resize((new_w, new_h), Image.LANCZOS)

    out_png = base / f'{out_prefix}.png'
    out_json = base / f'{out_prefix}.json'
    resized.save(out_png, format='PNG', optimize=True)
    out_kb = out_png.stat().st_size / 1024
    print(f'  wrote {out_png.relative_to(ROOT)} ({out_kb:.1f} KB)')

    new_frames = {}
    for key, val in frames.items():
        fr = val['frame']
        new_frames[key] = {
            'frame': {
                'x': int(fr['x'] * scale),
                'y': int(fr['y'] * scale),
                'w': TARGET_CELL,
                'h': TARGET_CELL,
            }
        }
    new_meta = {
        'frames': new_frames,
        'meta': {
            'image': f'{out_prefix}.png',
            'size': {'w': new_w, 'h': new_h},
            'cell': TARGET_CELL,
            'frameCount': len(frames),
            'sourceScale': scale,
        }
    }
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(new_meta, f, ensure_ascii=False, indent=2)
    print(f'  wrote {out_json.relative_to(ROOT)} ({len(frames)} frames)')


def main() -> None:
    for char_folder, sheet_folder, out_prefix in CHARACTERS:
        process(char_folder, sheet_folder, out_prefix)


if __name__ == '__main__':
    main()
