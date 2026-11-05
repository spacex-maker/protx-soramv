#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate SVG cover art for EcommerceImage scenario cards (UTF-8)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "ecommerce-cases"
SCENARIOS_TS = (
    ROOT
    / "src"
    / "pages"
    / "Workspace"
    / "Create"
    / "components"
    / "EcommerceImage"
    / "scenarios.ts"
)

# category accent by scenario id prefix / known ids
ACCENTS: dict[str, str] = {
    "white-bg-hero": "#c45c26",
    "lifestyle": "#c45c26",
    "flat-lay-detail": "#c45c26",
    "infographic": "#c45c26",
    "ai-model-wear": "#b45309",
    "virtual-tryon": "#b45309",
    "invisible-model": "#b45309",
    "sku-recolor": "#b45309",
    "ad-banner": "#dc2626",
    "ugc-share": "#dc2626",
    "seasonal-gift": "#dc2626",
    "live-backdrop": "#ea580c",
    "live-overlay": "#ea580c",
    "live-pedestal": "#ea580c",
    "product-set": "#a16207",
    "aplus-module": "#a16207",
    "explode-unbox": "#a16207",
    "multilang-layout": "#0f766e",
    "market-aesthetic": "#0f766e",
    "multi-platform-size": "#475569",
    "batch-style-unify": "#475569",
    "compliance-fix": "#475569",
}

LAYOUT: dict[str, str] = {
    "white-bg-hero": "studio",
    "lifestyle": "room",
    "flat-lay-detail": "flatlay",
    "infographic": "infographic",
    "ai-model-wear": "model",
    "virtual-tryon": "model",
    "invisible-model": "ghost",
    "sku-recolor": "swatch",
    "ad-banner": "banner",
    "ugc-share": "ugc",
    "seasonal-gift": "gift",
    "live-backdrop": "live",
    "live-overlay": "overlay",
    "live-pedestal": "pedestal",
    "product-set": "grid",
    "aplus-module": "wide",
    "explode-unbox": "explode",
    "multilang-layout": "lang",
    "market-aesthetic": "globe",
    "multi-platform-size": "ratio",
    "batch-style-unify": "batch",
    "compliance-fix": "check",
}


def parse_scenario_ids() -> list[str]:
    text = SCENARIOS_TS.read_text(encoding="utf-8")
    ids = re.findall(r"\bid:\s*'([a-z0-9-]+)',\s*\n\s*title:", text)
    # category ids also match; filter to known scenario set
    category_ids = {
        "product-display",
        "model-tryon",
        "marketing",
        "livestream",
        "detail-aplus",
        "cross-border",
        "ops-efficiency",
    }
    return [i for i in ids if i not in category_ids]


def svg_header(accent: str) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{accent}" stop-opacity="0.35"/>
      <stop offset="55%" stop-color="#1c1917" stop-opacity="0.92"/>
      <stop offset="100%" stop-color="#0c0a09"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="400" height="240" fill="url(#bg)"/>
"""


def product_block(x: float, y: float, w: float, h: float, fill: str) -> str:
    return f"""
  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{fill}" opacity="0.9"/>
  <rect x="{x}" y="{y}" width="{w}" height="{h*0.35}" rx="8" fill="url(#shine)"/>
"""


def layout_body(layout: str, accent: str) -> str:
    p = accent
    if layout == "studio":
        return f"""
  <rect x="40" y="50" width="320" height="140" rx="12" fill="#fafaf9" opacity="0.95"/>
  {product_block(130, 70, 140, 100, "#e7e5e4")}
  <circle cx="200" cy="95" r="18" fill="{p}" opacity="0.5"/>
"""
    if layout == "room":
        return f"""
  <rect x="30" y="40" width="340" height="150" rx="14" fill="#292524" opacity="0.6"/>
  <rect x="50" y="120" width="80" height="8" rx="4" fill="#78716c"/>
  <rect x="50" y="100" width="120" height="50" rx="6" fill="#44403c"/>
  {product_block(200, 75, 120, 90, p)}
  <ellipse cx="260" cy="175" rx="40" ry="8" fill="#000" opacity="0.25"/>
"""
    if layout == "flatlay":
        return f"""
  <rect x="60" y="55" width="280" height="130" rx="12" fill="#fafaf9" opacity="0.12"/>
  {product_block(100, 80, 90, 70, "#d6d3d1")}
  {product_block(210, 70, 100, 85, p)}
  <circle cx="170" cy="160" r="22" fill="{p}" opacity="0.35"/>
"""
    if layout == "infographic":
        return f"""
  {product_block(40, 60, 100, 120, "#e7e5e4")}
  <rect x="160" y="70" width="200" height="12" rx="6" fill="{p}" opacity="0.7"/>
  <rect x="160" y="95" width="160" height="8" rx="4" fill="#fff" opacity="0.25"/>
  <rect x="160" y="115" width="180" height="8" rx="4" fill="#fff" opacity="0.18"/>
  <rect x="160" y="140" width="120" height="40" rx="8" fill="{p}" opacity="0.25"/>
"""
    if layout == "model":
        return f"""
  <ellipse cx="200" cy="55" rx="28" ry="32" fill="#fde68a" opacity="0.85"/>
  <rect x="175" y="85" width="50" height="70" rx="10" fill="{p}" opacity="0.85"/>
  <rect x="160" y="155" width="35" height="55" rx="8" fill="#44403c"/>
  <rect x="205" y="155" width="35" height="55" rx="8" fill="#44403c"/>
"""
    if layout == "ghost":
        return f"""
  <path d="M170 60 Q200 40 230 60 L240 180 Q200 200 160 180 Z" fill="none" stroke="{p}" stroke-width="3" opacity="0.8"/>
  {product_block(175, 75, 50, 90, "#fafaf9")}
"""
    if layout == "swatch":
        return f"""
  {product_block(80, 70, 90, 100, "#1e3a5f")}
  <rect x="190" y="80" width="45" height="45" rx="8" fill="{p}"/>
  <rect x="245" y="80" width="45" height="45" rx="8" fill="#78716c"/>
  <rect x="190" y="135" width="45" height="45" rx="8" fill="#059669"/>
  <rect x="245" y="135" width="45" height="45" rx="8" fill="#7c3aed"/>
"""
    if layout == "banner":
        return f"""
  <rect x="25" y="35" width="160" height="170" rx="16" fill="#18181b"/>
  {product_block(45, 100, 120, 80, p)}
  <rect x="210" y="50" width="165" height="24" rx="6" fill="#fff" opacity="0.15"/>
  <rect x="210" y="85" width="120" height="14" rx="4" fill="{p}" opacity="0.6"/>
"""
    if layout == "ugc":
        return f"""
  <rect x="50" y="45" width="300" height="150" rx="20" fill="#292524" opacity="0.5"/>
  {product_block(140, 75, 120, 90, "#d6d3d1")}
  <circle cx="320" cy="65" r="8" fill="#ef4444"/>
  <rect x="70" y="175" width="60" height="6" rx="3" fill="#fff" opacity="0.2"/>
"""
    if layout == "gift":
        return f"""
  {product_block(150, 85, 100, 80, p)}
  <rect x="195" y="70" width="10" height="100" fill="#fcd34d"/>
  <rect x="150" y="115" width="100" height="10" fill="#fcd34d"/>
  <circle cx="80" cy="60" r="6" fill="#f472b6" opacity="0.8"/>
  <circle cx="330" cy="50" r="8" fill="#38bdf8" opacity="0.7"/>
"""
    if layout == "live":
        return f"""
  <rect x="20" y="30" width="360" height="180" rx="14" fill="#18181b" opacity="0.7"/>
  <rect x="40" y="50" width="140" height="140" rx="10" fill="{p}" opacity="0.2"/>
  <circle cx="280" cy="100" r="35" fill="#44403c"/>
  <rect x="240" y="150" width="120" height="40" rx="8" fill="#fafaf9" opacity="0.1"/>
  <text x="250" y="175" fill="#ef4444" font-size="14" font-family="sans-serif">LIVE</text>
"""
    if layout == "overlay":
        return f"""
  <rect x="30" y="25" width="200" height="190" rx="12" fill="#000" opacity="0.35"/>
  <rect x="250" y="40" width="120" height="36" rx="8" fill="{p}" opacity="0.85"/>
  <rect x="250" y="90" width="120" height="50" rx="8" fill="#fff" opacity="0.12"/>
  <rect x="250" y="155" width="80" height="28" rx="6" fill="#fff" opacity="0.08"/>
"""
    if layout == "pedestal":
        return f"""
  <path d="M120 170 L200 130 L280 170 Z" fill="#57534e"/>
  <rect x="160" y="100" width="80" height="35" rx="6" fill="{p}" opacity="0.9"/>
  {product_block(175, 55, 50, 50, "#e7e5e4")}
"""
    if layout == "grid":
        return f"""
  <rect x="50" y="50" width="70" height="70" rx="8" fill="#fafaf9" opacity="0.15"/>
  <rect x="130" y="50" width="70" height="70" rx="8" fill="{p}" opacity="0.35"/>
  <rect x="210" y="50" width="70" height="70" rx="8" fill="#fafaf9" opacity="0.12"/>
  <rect x="290" y="50" width="60" height="70" rx="8" fill="{p}" opacity="0.2"/>
  <rect x="50" y="130" width="140" height="50" rx="8" fill="#44403c"/>
  <rect x="200" y="130" width="150" height="50" rx="8" fill="#292524"/>
"""
    if layout == "wide":
        return f"""
  <rect x="25" y="70" width="350" height="100" rx="10" fill="#fafaf9" opacity="0.08"/>
  {product_block(40, 85, 90, 70, "#d6d3d1")}
  <rect x="150" y="90" width="200" height="14" rx="4" fill="{p}" opacity="0.5"/>
  <rect x="150" y="115" width="160" height="10" rx="4" fill="#fff" opacity="0.2"/>
  <rect x="150" y="135" width="180" height="10" rx="4" fill="#fff" opacity="0.15"/>
"""
    if layout == "explode":
        return f"""
  <circle cx="200" cy="120" r="35" fill="{p}" opacity="0.7"/>
  <rect x="120" y="100" width="40" height="40" rx="6" fill="#d6d3d1" transform="rotate(-15 140 120)"/>
  <rect x="260" y="95" width="35" height="35" rx="6" fill="#a8a29e" transform="rotate(20 277 112)"/>
  <rect x="185" y="45" width="30" height="30" rx="6" fill="#78716c"/>
"""
    if layout == "lang":
        return f"""
  {product_block(60, 65, 110, 110, "#e7e5e4")}
  <text x="200" y="100" fill="#fff" font-size="22" font-family="sans-serif" opacity="0.9">Aa</text>
  <text x="200" y="130" fill="{p}" font-size="18" font-family="sans-serif">文 EN</text>
  <rect x="200" y="145" width="150" height="8" rx="4" fill="#fff" opacity="0.2"/>
"""
    if layout == "globe":
        return f"""
  <circle cx="200" cy="115" r="55" fill="none" stroke="{p}" stroke-width="3" opacity="0.6"/>
  <ellipse cx="200" cy="115" rx="55" ry="22" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.25"/>
  {product_block(170, 90, 60, 50, "#fafaf9")}
"""
    if layout == "ratio":
        return f"""
  <rect x="60" y="55" width="90" height="90" rx="8" stroke="{p}" stroke-width="2" fill="none"/>
  <rect x="170" y="45" width="68" height="90" rx="8" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.5"/>
  <rect x="260" y="40" width="51" height="90" rx="8" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.35"/>
  {product_block(75, 70, 60, 60, "#d6d3d1")}
"""
    if layout == "batch":
        return f"""
  <rect x="50" y="60" width="70" height="70" rx="8" fill="#fafaf9" opacity="0.2"/>
  <rect x="130" y="60" width="70" height="70" rx="8" fill="#fafaf9" opacity="0.25"/>
  <rect x="210" y="60" width="70" height="70" rx="8" fill="#fafaf9" opacity="0.3"/>
  <rect x="290" y="60" width="70" height="70" rx="8" fill="{p}" opacity="0.4"/>
"""
    if layout == "check":
        return f"""
  <rect x="80" y="50" width="240" height="140" rx="12" fill="#fafaf9" opacity="0.95"/>
  {product_block(160, 75, 80, 90, "#e7e5e4")}
  <path d="M300 80 L315 95 L340 65" fill="none" stroke="#16a34a" stroke-width="4" stroke-linecap="round"/>
"""
    return product_block(150, 80, 100, 80, p)


def build_svg(scenario_id: str) -> str:
    accent = ACCENTS.get(scenario_id, "#c45c26")
    layout = LAYOUT.get(scenario_id, "studio")
    body = layout_body(layout, accent)
    return (
        svg_header(accent)
        + body
        + f'  <rect y="160" width="400" height="80" fill="#0c0a09" opacity="0.55"/>\n'
        + "</svg>\n"
    )


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ids = parse_scenario_ids()
    manifest: list[dict[str, str]] = []
    for sid in ids:
        path = OUT_DIR / f"{sid}.svg"
        svg = build_svg(sid)
        path.write_text(svg, encoding="utf-8", newline="\n")
        manifest.append({"id": sid, "cover": f"/ecommerce-cases/{sid}.svg"})
    (OUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(ids)} covers to {OUT_DIR}")


if __name__ == "__main__":
    main()
