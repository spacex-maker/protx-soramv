/** MiniMax（局域网 ComfyUI H3）：用户侧只暴露易用参数；难项走模型表 / api_config 默认 */

export type MiniMaxModelLike = {
  companyCode?: string | null;
  modelCode?: string | null;
  videoDefaultResolution?: string | null;
  videoAspectResolution?: string | null;
};

export function isMiniMaxModel(model: MiniMaxModelLike | null | undefined): boolean {
  if (!model) return false;
  if (model.companyCode && String(model.companyCode).toLowerCase() === 'minimax') {
    return true;
  }
  const code = (model.modelCode || '').toLowerCase();
  return code.includes('minimax');
}

/** 清晰度选项：存标准 WxH；提交时再按画幅翻转 */
export type MiniMaxQualityOption = {
  value: string;
  labelId: string;
  defaultMessage: string;
};

export function getMiniMaxQualityOptions(model: MiniMaxModelLike | null | undefined): MiniMaxQualityOption[] {
  const fromModel = (model?.videoAspectResolution || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^\d+x\d+$/.test(s));

  const landscape = fromModel.filter((s) => {
    const [w, h] = s.split('x').map(Number);
    return w >= h;
  });

  const values = landscape.length > 0 ? landscape : ['608x352', '960x544', '1344x768'];

  return values.map((value) => {
    if (value.startsWith('608')) {
      return {
        value,
        labelId: 'create.minimax.quality.preview',
        defaultMessage: '预览 608×352（快）',
      };
    }
    if (value.startsWith('960')) {
      return {
        value,
        labelId: 'create.minimax.quality.standard',
        defaultMessage: '标准 960×544',
      };
    }
    if (value.startsWith('1344')) {
      return {
        value,
        labelId: 'create.minimax.quality.hd',
        defaultMessage: '高清 1344×768（慢）',
      };
    }
    return {
      value,
      labelId: 'create.minimax.quality.custom',
      defaultMessage: value,
    };
  });
}

export function getDefaultMiniMaxQuality(model: MiniMaxModelLike | null | undefined): string {
  const opts = getMiniMaxQualityOptions(model);
  const def = (model?.videoDefaultResolution || '').trim().toLowerCase();
  if (def && opts.some((o) => o.value === def)) {
    return def;
  }
  // 默认横屏标准；若默认是竖屏也归一到横屏选项
  if (def.includes('x')) {
    const [a, b] = def.split('x').map(Number);
    const landscape = a >= b ? `${a}x${b}` : `${b}x${a}`;
    if (opts.some((o) => o.value === landscape)) {
      return landscape;
    }
  }
  return opts[0]?.value || '608x352';
}

/** 把用户友好的标准分辨率转成实际 size */
export function resolveMiniMaxSize(qualityWxH: string, aspectRatio?: string | null): string {
  const raw = (qualityWxH || '608x352').trim().toLowerCase();
  const m = raw.match(/^(\d+)x(\d+)$/);
  if (!m) return '608x352';
  let w = Number(m[1]);
  let h = Number(m[2]);
  if (w < h) {
    const t = w;
    w = h;
    h = t;
  }
  const ratio = (aspectRatio || '16:9').trim();
  if (ratio === '9:16' || ratio.toLowerCase() === 'portrait') {
    return `${h}x${w}`;
  }
  return `${w}x${h}`;
}