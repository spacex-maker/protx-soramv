# -*- coding: utf-8 -*-
"""Patch scenarios.ts (UTF-8 in/out). Chinese via \\u escapes."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
P = ROOT / "src/pages/Workspace/Create/components/EcommerceImage/scenarios.ts"


def u(*parts: str) -> str:
    return "".join(parts)


OLD_IFACE = """export interface EcommerceScenario {
  id: string;
  title: string;
  description: string;
  tips: string[];
  tags?: string[];
  uploads: ScenarioUploadSlot[];
  fields: ScenarioField[];
  aspectRatio: string;
  kleinMode: EcommerceKleinMode;
  buildPrompt: (values: ScenarioFieldValues) => string;
}"""

NEW_IFACE = """export interface EcommerceWorkbenchNotes {
  outputQuality?: string;
  brandTone?: string;
  cropSafeZone?: string;
  batchVariant?: string;
}

export interface EcommerceScenario {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  steps: string[];
  workloadHint?: string;
  workbenchNotes?: EcommerceWorkbenchNotes;
  tips: string[];
  tags?: string[];
  uploads: ScenarioUploadSlot[];
  fields: ScenarioField[];
  aspectRatio: string;
  kleinMode: EcommerceKleinMode;
  buildPrompt: (values: ScenarioFieldValues) => string;
}

export function scenarioCoverPath(id: string): string {
  return `/ecommerce-cases/${id}.svg`;
}"""

UPLOADS = """
const styleRefUpload: ScenarioUploadSlot = {
  id: 'styleRef',
  label: '\u573a\u666f / \u98ce\u683c\u53c2\u8003',
  hint: '\u53ef\u9009\uff1a\u8272\u8c03\u3001\u9053\u5177\u4e0e\u6784\u56fe\u53c2\u8003',
  optional: true,
};

const modelRefUpload: ScenarioUploadSlot = {
  id: 'modelRef',
  label: '\u6a21\u7279\u53c2\u8003\u56fe',
  hint: '\u53ef\u9009\uff1a\u8138\u578b\u3001\u53d1\u578b\u6216\u59ff\u6001\u53c2\u8003',
  optional: true,
};

const posterUpload: ScenarioUploadSlot = {
  id: 'poster',
  label: '\u542b\u6587\u6848\u6d77\u62a5 / \u4fe1\u606f\u56fe',
  hint: '\u9700\u4fdd\u7559\u7248\u5f0f\u4e0e\u6587\u5b57\u5c42\u7684\u539f\u56fe',
};
"""

ENRICH: dict[str, dict] = {
    "white-bg-hero": {
        "steps": [
            u("\u4e0a\u4f20\u5546\u54c1\u56fe"),
            u("\u9009\u62e9\u5e73\u53f0\u4e0e\u4e3b\u4f53\u5360\u6bd4"),
            u("\u751f\u6210\u767d\u5e95\u4e3b\u56fe"),
        ],
        "workloadHint": u("\u5355 SKU \u7ea6 1\u20132 \u5206\u949f"),
        "workbenchNotes": {
            "outputQuality": u("\u5efa\u8bae 2048px \u65b9\u56fe"),
            "cropSafeZone": u("\u4e3b\u4f53\u5c45\u4e2d\uff0c\u56db\u8fb9\u7559 5% \u5b89\u5168\u533a"),
        },
        "extra_fields": """          {
            id: 'outputQuality',
            label: '\u8f93\u51fa\u7cbe\u7ec6\u5ea6',
            kind: 'choice',
            options: [
              { value: 'standard', label: '\u6807\u51c6' },
              { value: 'high', label: '\u9ad8\u7ec6\u8282' },
            ],
            defaultValue: 'high',
          },""",
    },
    "lifestyle": {
        "uploads": "uploads: [productUpload, styleRefUpload]",
        "steps": [
            u("\u4e0a\u4f20\u5546\u54c1\u56fe"),
            u("\u53ef\u9009\u98ce\u683c\u53c2\u8003"),
            u("\u9009\u573a\u666f\u4e0e\u5149\u7ebf"),
            u("\u751f\u6210\u573a\u666f\u56fe"),
        ],
        "workbenchNotes": {
            "brandTone": u("\u573a\u666f\u52ff\u62a2\u5546\u54c1\u4e3b\u4f53"),
            "cropSafeZone": u("\u5546\u54c1\u5360\u753b\u9762 40\u201360%"),
        },
        "extra_fields": """          {
            id: 'brandTone',
            label: '\u54c1\u724c\u8c03\u6027',
            kind: 'choice',
            options: [
              { value: 'mass', label: '\u5927\u4f17\u5feb\u6d88' },
              { value: 'premium', label: '\u8f7b\u5962\u8d28\u611f' },
              { value: 'tech', label: '\u79d1\u6280\u7b80\u6d01' },
            ],
            defaultValue: 'mass',
          },""",
    },
    "flat-lay-detail": {
        "steps": [
            u("\u4e0a\u4f20\u5546\u54c1"),
            u("\u9009\u7248\u5f0f\u4e0e\u80cc\u666f"),
            u("\u751f\u6210\u5e73\u94fa / \u5fae\u8ddd / \u7f51\u683c"),
        ],
        "workbenchNotes": {"outputQuality": u("\u5fae\u8ddd\u6a21\u5f0f\u5efa\u8bae\u4e0a\u4f20\u9ad8\u6e05\u7ec6\u8282\u56fe")},
    },
    "infographic": {
        "steps": [
            u("\u4e0a\u4f20\u5546\u54c1\u56fe"),
            u("\u9009\u4fe1\u606f\u56fe\u7c7b\u578b\u4e0e\u7559\u767d"),
            u("\u751f\u6210\u53ef\u6392\u7248\u5e95\u56fe"),
        ],
        "workbenchNotes": {
            "cropSafeZone": u("\u56db\u5468\u9884\u7559 12% \u6587\u6848\u5b89\u5168\u533a"),
            "brandTone": u("\u4e0e A+ \u6a21\u5757\u98ce\u683c\u4e00\u81f4"),
        },
        "extra_fields": """          {
            id: 'cropSafeZone',
            label: '\u6587\u6848\u5b89\u5168\u533a',
            kind: 'choice',
            options: [
              { value: '12', label: '\u56db\u8fb9 12%' },
              { value: '18', label: '\u56db\u8fb9 18%' },
            ],
            defaultValue: '12',
          },""",
    },
    "ai-model-wear": {
        "uploads": "uploads: [garmentUpload, modelRefUpload]",
        "steps": [
            u("\u4e0a\u4f20\u670d\u88c5\u56fe"),
            u("\u53ef\u9009\u6a21\u7279\u53c2\u8003"),
            u("\u9009\u4f53\u578b / \u80a4\u8272 / \u59ff\u52bf"),
            u("\u751f\u6210\u4e0a\u8eab\u56fe"),
        ],
        "workbenchNotes": {"outputQuality": u("3:4 \u7ad6\u56fe\u9002\u5408\u8be6\u60c5\u9875")},
    },
    "virtual-tryon": {
        "uploads": "uploads: [garmentUpload, modelRefUpload]",
        "steps": [
            u("\u4e0a\u4f20\u670d\u88c5"),
            u("\u53ef\u9009\u6a21\u7279\u53c2\u8003"),
            u("\u8bbe\u7f6e\u5408\u8eab\u4e0e\u9762\u6599"),
            u("\u751f\u6210\u8bd5\u7a7f\u56fe"),
        ],
        "workbenchNotes": {"brandTone": u("\u540c\u5e97\u5efa\u8bae\u56fa\u5b9a\u6a21\u7279\u98ce\u683c")},
    },
    "invisible-model": {
        "steps": [
            u("\u4e0a\u4f20\u6302\u62cd / \u5e73\u94fa\u56fe"),
            u("\u9009\u80cc\u666f\u4e0e\u7acb\u4f53\u5ea6"),
            u("\u751f\u6210\u9690\u5f62\u6a21\u7279\u56fe"),
        ],
    },
    "sku-recolor": {
        "steps": [
            u("\u4e0a\u4f20\u57fa\u51c6\u5546\u54c1\u56fe\uff08\u5fc5\u586b\uff09"),
            u("\u586b\u5199\u76ee\u6807\u8272"),
            u("\u6279\u91cf\u611f\u6362\u8272\u8f93\u51fa"),
        ],
        "workbenchNotes": {"batchVariant": u("\u540c\u4e00\u5149\u5f71\u4e0b\u53ef\u8fde\u7eed\u6362\u8272\u51fa SKU \u7cfb\u5217")},
        "extra_fields": """          {
            id: 'batchVariant',
            label: '\u53d8\u4f53\u8bf4\u660e',
            kind: 'text',
            placeholder: '\u5982\uff1a\u540c\u6b3e 4 \u8272 \u2014 \u85cf\u9752\u3001\u7c73\u767d\u3001\u7816\u7ea2',
          },""",
    },
    "ad-banner": {
        "steps": [
            u("\u4e0a\u4f20\u5546\u54c1 hero"),
            u("\u9009\u5e73\u53f0\u4e0e\u7559\u767d"),
            u("\u751f\u6210\u6295\u653e\u5e95\u56fe"),
        ],
        "workbenchNotes": {
            "cropSafeZone": u("\u6309\u6240\u9009\u7559\u767d\u4fdd\u7559\u6807\u9898\u533a"),
            "outputQuality": u("9:16 \u9002\u5408\u4fe1\u606f\u6d41"),
        },
        "extra_fields": """          {
            id: 'brandTone',
            label: '\u54c1\u724c\u8bed\u6c14',
            kind: 'choice',
            options: [
              { value: 'bold', label: '\u5f3a\u4fc3\u9500' },
              { value: 'elegant', label: '\u514b\u5236\u9ad8\u7ea7' },
            ],
            defaultValue: 'bold',
          },""",
    },
    "ugc-share": {
        "steps": [
            u("\u4e0a\u4f20\u5546\u54c1"),
            u("\u9009\u5206\u4eab\u573a\u666f\u4e0e\u62cd\u6444\u611f"),
            u("\u751f\u6210\u79cd\u8349\u56fe"),
        ],
    },
    "seasonal-gift": {
        "uploads": "uploads: [brandRefUpload, productUpload]",
        "steps": [
            u("\u4e0a\u4f20\u54c1\u724c / \u5546\u54c1\u53c2\u8003"),
            u("\u9009\u8282\u65e5\u4e0e\u98ce\u683c"),
            u("\u751f\u6210\u5b63\u8282\u89c6\u89c9"),
        ],
        "workbenchNotes": {"brandTone": u("\u793c\u76d2\u4e0e\u7f16\u8f91\u98ce\u9700\u7edf\u4e00\u8272\u76d8")},
    },
    "live-backdrop": {
        "steps": [
            u("\u4e0a\u4f20\u54c1\u724c\u53c2\u8003"),
            u("\u9009\u6784\u56fe\u4e0e\u8272\u8c03"),
            u("\u751f\u6210\u76f4\u64ad\u80cc\u666f"),
        ],
        "workbenchNotes": {"cropSafeZone": u("\u4e3b\u64ad\u4e0e\u5546\u54c1\u533a\u4fdd\u6301\u4f4e\u7eb9\u7406")},
    },
    "live-overlay": {
        "steps": [
            u("\u4e0a\u4f20\u54c1\u724c\u7d20\u6750"),
            u("\u52fe\u9009\u8d34\u7247\u6a21\u5757"),
            u("\u751f\u6210\u5e26\u5b89\u5168\u533a\u6a21\u677f"),
        ],
        "workbenchNotes": {"cropSafeZone": u("\u8fb9\u7f18 8% \u9632 OBS \u88c1\u5207")},
        "extra_fields": """          {
            id: 'cropSafeZone',
            label: '\u8fb9\u7f18\u5b89\u5168\u533a',
            kind: 'choice',
            options: [
              { value: '8', label: '8%' },
              { value: '12', label: '12%' },
            ],
            defaultValue: '8',
          },""",
    },
    "live-pedestal": {
        "steps": [
            u("\u4e0a\u4f20\u5546\u54c1\u767d\u5e95\u56fe"),
            u("\u9009\u5c55\u53f0\u6750\u8d28\u4e0e\u706f\u5149"),
            u("\u751f\u6210\u76f4\u64ad\u5c55\u53f0"),
        ],
    },
    "product-set": {
        "steps": [
            u("\u4e0a\u4f20\u5546\u54c1"),
            u("\u9009\u672c\u5f20\u5957\u56fe\u7c7b\u578b"),
            u("\u751f\u6210\u5e76\u8865\u9f50\u7cfb\u5217"),
        ],
        "workbenchNotes": {"batchVariant": u("\u56fa\u5b9a grade \u53ef\u6279\u91cf\u51fa\u5957\u56fe")},
    },
    "aplus-module": {
        "steps": [
            u("\u4e0a\u4f20\u5546\u54c1"),
            u("\u9009 A+ \u6a21\u5757\u7c7b\u578b"),
            u("\u751f\u6210\u5bbd\u5c4f\u6a21\u5757\u56fe"),
        ],
        "workbenchNotes": {"outputQuality": u("\u63a5\u8fd1 970\u00d7600 \u89c6\u89c9\u6bd4\u4f8b")},
    },
    "explode-unbox": {
        "steps": [
            u("\u4e0a\u4f20\u5546\u54c1"),
            u("\u9009\u7206\u70b8\u56fe\u6216\u5f00\u7bb1\u6b65\u9aa4"),
            u("\u751f\u6210\u8bf4\u660e\u56fe"),
        ],
    },
    "multilang-layout": {
        "uploads": "uploads: [posterUpload]",
        "steps": [
            u("\u4e0a\u4f20\u542b\u6587\u6848\u6d77\u62a5\uff08\u5fc5\u586b\uff09"),
            u("\u9009\u76ee\u6807\u8bed\u8a00"),
            u("\u751f\u6210\u672c\u5730\u5316\u7248\u5f0f"),
        ],
        "workbenchNotes": {"cropSafeZone": u("\u4e25\u683c\u6a21\u5f0f\u4fdd\u7559\u6587\u5b57\u6846\u4f4d\u7f6e")},
        "extra_fields": """          {
            id: 'outputQuality',
            label: '\u6587\u5b57\u6e05\u6670\u5ea6',
            kind: 'choice',
            options: [
              { value: 'sharp', label: '\u9510\u5229\u53ef\u8bfb' },
              { value: 'soft', label: '\u67d4\u548c\u5370\u5237\u611f' },
            ],
            defaultValue: 'sharp',
          },""",
    },
    "market-aesthetic": {
        "steps": [
            u("\u4e0a\u4f20\u5546\u54c1"),
            u("\u9009\u5e02\u573a\u4e0e\u5e73\u53f0"),
            u("\u751f\u6210\u672c\u5730\u5316\u573a\u666f"),
        ],
        "extra_fields": """          {
            id: 'brandTone',
            label: '\u672c\u5730\u5ba1\u7f8e',
            kind: 'choice',
            options: [
              { value: 'lifestyle', label: '\u751f\u6d3b\u5316' },
              { value: 'deal', label: '\u6298\u6263\u76f4\u7ed9' },
              { value: 'minimal', label: '\u6781\u7b80' },
            ],
            defaultValue: 'lifestyle',
          },""",
    },
    "multi-platform-size": {
        "steps": [
            u("\u4e0a\u4f20\u4e3b\u89c6\u89c9"),
            u("\u9009\u76ee\u6807\u6bd4\u4f8b\u4e0e\u5b89\u5168\u8fb9\u8ddd"),
            u("\u751f\u6210\u9002\u914d\u56fe"),
        ],
        "workbenchNotes": {"cropSafeZone": u("safe \u6a21\u5f0f\u4fdd\u7559\u5e73\u53f0\u88c1\u5207\u533a")},
    },
    "batch-style-unify": {
        "steps": [
            u("\u4e0a\u4f20\u5f85\u7edf\u4e00\u5546\u54c1\u56fe"),
            u("\u8bbe\u80cc\u666f\u4e0e\u54c1\u724c\u8272"),
            u("\u6279\u91cf\u7edf\u4e00\u98ce\u683c"),
        ],
        "workbenchNotes": {
            "batchVariant": u("\u9002\u5408\u4e00\u6b21\u4e0a\u4f20\u591a\u5f20\u540e\u9010\u5f20\u751f\u6210"),
            "brandTone": u("\u56fa\u5b9a brandHint \u53ef\u7cfb\u5217\u5316"),
        },
    },
    "compliance-fix": {
        "steps": [
            u("\u4e0a\u4f20\u5f85\u68c0\u4e3b\u56fe"),
            u("\u9009\u5e73\u53f0\u4e0e\u4fee\u6b63\u9879"),
            u("\u751f\u6210\u5408\u89c4\u56fe"),
        ],
        "workbenchNotes": {"outputQuality": u("\u4e3b\u56fe\u4f18\u5148 1:1 \u9ad8\u6e05")},
    },
}

PROMPT_PATCHES = [
    (
        "sharp catalog photography, high detail`",
        "sharp catalog photography, high detail, ${S(v, 'outputQuality') === 'high' ? 'ultra sharp edges' : 'clean catalog finish'}`",
    ),
    (
        "${S(v, 'light')} lighting, product remains the clear hero",
        "${S(v, 'light')} lighting, ${S(v, 'brandTone')} brand tone, product remains the clear hero",
    ),
    (
        "${S(v, 'langSpace')} typography space, clean modern layout",
        "${S(v, 'langSpace')} typography space, ${S(v, 'cropSafeZone')}% margin for copy, clean modern layout",
    ),
    (
        "${S(v, 'promo')} look, clear ${S(v, 'headlineSpace')} negative space",
        "${S(v, 'promo')} look, ${S(v, 'brandTone')} visual tone, clear ${S(v, 'headlineSpace')} negative space",
    ),
    (
        "modules: ${M(v, 'layers')}, safe margins, clean modern UI layers",
        "modules: ${M(v, 'layers')}, ${S(v, 'cropSafeZone')}% safe margins, clean modern UI layers",
    ),
    (
        "${S(v, 'preserve')} layout and typography hierarchy, clean readable text`",
        "${S(v, 'preserve')} layout and typography hierarchy, ${S(v, 'outputQuality')} text rendering, clean readable text`",
    ),
    (
        "${S(v, 'channel')} aesthetic, local lifestyle context",
        "${S(v, 'channel')} aesthetic, ${S(v, 'brandTone')} local aesthetic, local lifestyle context",
    ),
    (
        "realistic e-commerce SKU listing photo`",
        "realistic e-commerce SKU listing photo${S(v, 'batchVariant').trim() ? `, variant note: ${S(v, 'batchVariant').trim()}` : ''}`",
    ),
]


def fmt_steps(steps: list[str]) -> str:
    inner = ", ".join(f"'{s}'" for s in steps)
    return f"steps: [{inner}]"


def fmt_notes(notes: dict[str, str]) -> str:
    parts = [f"{k}: '{v}'" for k, v in notes.items()]
    return f"workbenchNotes: {{ {', '.join(parts)} }}"


def main() -> None:
    text = P.read_text(encoding="utf-8")
    if "coverImage: string" not in text:
        text = text.replace(OLD_IFACE, NEW_IFACE)
    if "styleRefUpload" not in text:
        text = text.replace("export const ECOMMERCE_CATEGORIES", UPLOADS + "\nexport const ECOMMERCE_CATEGORIES")

    for sid, meta in ENRICH.items():
        marker = f"        id: '{sid}',\n"
        idx = text.find(marker)
        if idx < 0:
            raise SystemExit(f"missing scenario {sid}")
        snippet = text[idx : idx + 320]
        if "coverImage" not in snippet:
            ins = f"        coverImage: scenarioCoverPath('{sid}'),\n        {fmt_steps(meta['steps'])},\n"
            if meta.get("workloadHint"):
                ins += f"        workloadHint: '{meta['workloadHint']}',\n"
            if meta.get("workbenchNotes"):
                ins += f"        {fmt_notes(meta['workbenchNotes'])},\n"
            text = text[: idx + len(marker)] + ins + text[idx + len(marker) :]

        if meta.get("uploads"):
            pat = rf"(id: '{sid}',[\s\S]*?)        uploads: \[.*?\],"
            text, n = re.subn(pat, rf"\1        {meta['uploads']},", text, count=1)
            if n != 1:
                raise SystemExit(f"upload patch failed {sid}")

        if meta.get("extra_fields"):
            fid = re.search(r"id: '(\w+)'", meta["extra_fields"]).group(1)
            block_pat = rf"id: '{sid}',[\s\S]*?fields: \[[\s\S]*?"
            if f"id: '{fid}'" not in re.search(block_pat, text).group(0):
                pat = rf"(id: '{sid}',[\s\S]*?        fields: \[[\s\S]*?)(        \],\n        aspectRatio:)"
                text, n = re.subn(pat, rf"\1{meta['extra_fields']}\n\2", text, count=1)
                if n != 1:
                    raise SystemExit(f"field patch failed {sid}")

    for old, new in PROMPT_PATCHES:
        if old not in text:
            raise SystemExit(f"prompt fragment missing: {old[:40]}")
        text = text.replace(old, new, 1)

    P.write_text(text, encoding="utf-8", newline="\n")
    print("patched", P)


if __name__ == "__main__":
    main()
