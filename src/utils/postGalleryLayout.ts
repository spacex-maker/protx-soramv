export interface ImageDimensions {
  width: number;
  height: number;
}

export interface GalleryCellPlan {
  gridColumn: string;
  gridRow: string;
}

export interface GalleryPlan {
  gridTemplateColumns: string;
  gridTemplateRows: string;
  gap: string;
  cells: GalleryCellPlan[];
  /** 单图最大高度（vh） */
  singleMaxHeightVh?: number;
}

type AspectKind = 'portrait' | 'landscape' | 'square';

const clampCount = (count: number) => Math.max(1, Math.min(16, count));

export const getAspectRatio = (dimensions: ImageDimensions | null | undefined): number | null => {
  if (!dimensions?.width || !dimensions?.height) return null;
  return dimensions.width / dimensions.height;
};

export const classifyAspect = (ratio: number | null | undefined): AspectKind => {
  if (ratio == null || !Number.isFinite(ratio)) return 'square';
  if (ratio < 0.92) return 'portrait';
  if (ratio > 1.08) return 'landscape';
  return 'square';
};

export const parseGenerationDimensions = (
  generationParams?: string | Record<string, unknown> | null
): ImageDimensions | null => {
  if (!generationParams) return null;
  let params: Record<string, unknown> = {};
  try {
    params = typeof generationParams === 'string'
      ? JSON.parse(generationParams)
      : generationParams;
  } catch {
    return null;
  }
  const width = Number(params.width);
  const height = Number(params.height);
  if (width > 0 && height > 0) return { width, height };
  return null;
};

const dominantKind = (kinds: AspectKind[]): AspectKind => {
  const score = { portrait: 0, landscape: 0, square: 0 };
  kinds.forEach((k) => { score[k] += 1; });
  if (score.landscape >= score.portrait && score.landscape >= score.square) return 'landscape';
  if (score.portrait >= score.square) return 'portrait';
  return 'square';
};

const repeatCells = (count: number, columns: number): GalleryCellPlan[] => {
  return Array.from({ length: count }, (_, index) => ({
    gridColumn: `${(index % columns) + 1}`,
    gridRow: `${Math.floor(index / columns) + 1}`,
  }));
};

const buildTwoImagePlan = (kinds: AspectKind[]): GalleryPlan => {
  const [a, b] = kinds;
  if (a === 'landscape' && b === 'landscape') {
    return {
      gridTemplateColumns: '1fr',
      gridTemplateRows: 'auto auto',
      gap: '12px',
      cells: [
        { gridColumn: '1', gridRow: '1' },
        { gridColumn: '1', gridRow: '2' },
      ],
    };
  }
  if (a === 'portrait' && b === 'portrait') {
    return {
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: 'auto',
      gap: '12px',
      cells: [
        { gridColumn: '1', gridRow: '1' },
        { gridColumn: '2', gridRow: '1' },
      ],
    };
  }
  if (a === 'portrait' && b === 'landscape') {
    return {
      gridTemplateColumns: '1.2fr 1.8fr',
      gridTemplateRows: 'auto',
      gap: '12px',
      cells: [
        { gridColumn: '1', gridRow: '1' },
        { gridColumn: '2', gridRow: '1' },
      ],
    };
  }
  if (a === 'landscape' && b === 'portrait') {
    return {
      gridTemplateColumns: '1.8fr 1.2fr',
      gridTemplateRows: 'auto',
      gap: '12px',
      cells: [
        { gridColumn: '1', gridRow: '1' },
        { gridColumn: '2', gridRow: '1' },
      ],
    };
  }
  return {
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: 'auto',
    gap: '12px',
    cells: [
      { gridColumn: '1', gridRow: '1' },
      { gridColumn: '2', gridRow: '1' },
    ],
  };
};

const buildThreeImagePlan = (dominant: AspectKind): GalleryPlan => {
  if (dominant === 'landscape') {
    return {
      gridTemplateColumns: '1fr',
      gridTemplateRows: 'auto auto auto',
      gap: '12px',
      cells: [
        { gridColumn: '1', gridRow: '1' },
        { gridColumn: '1', gridRow: '2' },
        { gridColumn: '1', gridRow: '3' },
      ],
    };
  }
  if (dominant === 'portrait') {
    return {
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'auto',
      gap: '12px',
      cells: [
        { gridColumn: '1', gridRow: '1' },
        { gridColumn: '2', gridRow: '1' },
        { gridColumn: '3', gridRow: '1' },
      ],
    };
  }
  return {
    gridTemplateColumns: '1.6fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '12px',
    cells: [
      { gridColumn: '1', gridRow: '1 / 3' },
      { gridColumn: '2', gridRow: '1' },
      { gridColumn: '2', gridRow: '2' },
    ],
  };
};

/** 根据图片数量与宽高比生成 CSS Grid 布局方案（1~16 张） */
export const buildGalleryPlan = (
  count: number,
  dimensions: (ImageDimensions | null | undefined)[]
): GalleryPlan => {
  const n = clampCount(count);
  const kinds = dimensions.slice(0, n).map((d) => classifyAspect(getAspectRatio(d)));
  const dominant = dominantKind(kinds.length ? kinds : ['square']);

  if (n === 1) {
    const ratio = getAspectRatio(dimensions[0]);
    const isPortrait = classifyAspect(ratio) === 'portrait';
    return {
      gridTemplateColumns: '1fr',
      gridTemplateRows: 'auto',
      gap: '0',
      cells: [{ gridColumn: '1', gridRow: '1' }],
      singleMaxHeightVh: isPortrait ? 82 : 72,
    };
  }

  if (n === 2) {
    return buildTwoImagePlan(kinds.length >= 2 ? kinds : ['square', 'square']);
  }

  if (n === 3) {
    return buildThreeImagePlan(dominant);
  }

  if (n === 4) {
    return {
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: 'auto auto',
      gap: '12px',
      cells: repeatCells(4, 2),
    };
  }

  if (n === 5) {
    return {
      gridTemplateColumns: 'repeat(6, 1fr)',
      gridTemplateRows: 'auto auto',
      gap: '10px',
      cells: [
        { gridColumn: '1 / 4', gridRow: '1' },
        { gridColumn: '4 / 7', gridRow: '1' },
        { gridColumn: '1 / 3', gridRow: '2' },
        { gridColumn: '3 / 5', gridRow: '2' },
        { gridColumn: '5 / 7', gridRow: '2' },
      ],
    };
  }

  if (n === 6) {
    return {
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'auto auto',
      gap: '10px',
      cells: repeatCells(6, 3),
    };
  }

  if (n === 7) {
    return {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'auto auto',
      gap: '10px',
      cells: [
        { gridColumn: '1', gridRow: '1' },
        { gridColumn: '2', gridRow: '1' },
        { gridColumn: '3', gridRow: '1' },
        { gridColumn: '4', gridRow: '1' },
        { gridColumn: '1 / 3', gridRow: '2' },
        { gridColumn: '3', gridRow: '2' },
        { gridColumn: '4', gridRow: '2' },
      ],
    };
  }

  if (n === 8) {
    return {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'auto auto',
      gap: '10px',
      cells: repeatCells(8, 4),
    };
  }

  if (n === 9) {
    return {
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(3, auto)',
      gap: '10px',
      cells: repeatCells(9, 3),
    };
  }

  if (n === 10) {
    return {
      gridTemplateColumns: 'repeat(5, 1fr)',
      gridTemplateRows: 'auto auto',
      gap: '8px',
      cells: repeatCells(10, 5),
    };
  }

  if (n === 11) {
    return {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'auto auto auto',
      gap: '8px',
      cells: [
        ...repeatCells(8, 4),
        { gridColumn: '1 / 3', gridRow: '3' },
        { gridColumn: '3', gridRow: '3' },
        { gridColumn: '4', gridRow: '3' },
      ],
    };
  }

  if (n === 12) {
    return {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'repeat(3, auto)',
      gap: '8px',
      cells: repeatCells(12, 4),
    };
  }

  const columns = n <= 14 ? 4 : 4;
  const rows = Math.ceil(n / columns);
  return {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, auto)`,
    gap: '8px',
    cells: repeatCells(n, columns),
  };
};

export const cssAspectRatio = (dimensions: ImageDimensions | null | undefined): string | undefined => {
  if (!dimensions?.width || !dimensions?.height) return undefined;
  return `${dimensions.width} / ${dimensions.height}`;
};
