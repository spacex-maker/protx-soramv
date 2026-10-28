/** FLUX.3 Klein (LAN ComfyUI): expose aspect/size only; steps/cfg from model api_config */

export type FluxKleinModelLike = {
  companyCode?: string | null;
  modelCode?: string | null;
  imageDefaultResolution?: string | null;
  imageMaxResolution?: string | null;
  imageAspectRatios?: string | null;
};

export function isFluxKleinModel(model: FluxKleinModelLike | null | undefined): boolean {
  if (!model) return false;
  const code = (model.modelCode || '').toLowerCase();
  if (model.companyCode && String(model.companyCode).toLowerCase() === 'flux' && code.includes('klein')) {
    return true;
  }
  return code.includes('flux') && code.includes('klein');
}

export type FluxKleinQualityOption = {
  value: string;
  labelId: string;
  defaultMessage: string;
};

export function getFluxKleinQualityOptions(model: FluxKleinModelLike | null | undefined): FluxKleinQualityOption[] {
  const fromModel = (model?.imageMaxResolution || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^\d+x\d+$/.test(s));

  const values = fromModel.length > 0 ? fromModel : ['1024x1024', '1280x704', '704x1280', '1152x896', '896x1152'];

  return values.map((value) => {
    if (value === '1024x1024') {
      return { value, labelId: 'create.klein.quality.square', defaultMessage: 'Square 1024x1024 (fast)' };
    }
    if (value.startsWith('1280')) {
      return { value, labelId: 'create.klein.quality.landscape', defaultMessage: 'Landscape 1280x704' };
    }
    if (value.startsWith('704')) {
      return { value, labelId: 'create.klein.quality.portrait', defaultMessage: 'Portrait 704x1280' };
    }
    if (value.startsWith('1152')) {
      return { value, labelId: 'create.klein.quality.43', defaultMessage: '4:3 1152x896' };
    }
    if (value.startsWith('896')) {
      return { value, labelId: 'create.klein.quality.34', defaultMessage: '3:4 896x1152' };
    }
    return { value, labelId: 'create.klein.quality.custom', defaultMessage: value };
  });
}

export function getDefaultFluxKleinQuality(model: FluxKleinModelLike | null | undefined): string {
  const opts = getFluxKleinQualityOptions(model);
  const def = (model?.imageDefaultResolution || '').trim().toLowerCase();
  if (def && opts.some((o) => o.value === def)) {
    return def;
  }
  return opts[0]?.value || '1024x1024';
}

export function resolveFluxKleinSize(qualityWxH: string, aspectRatio?: string | null): string {
  const raw = (qualityWxH || '1024x1024').trim().toLowerCase();
  if (/^\d+x\d+$/.test(raw) && !aspectRatio) {
    return raw;
  }
  const m = raw.match(/^(\d+)x(\d+)$/);
  let baseW = m ? Number(m[1]) : 1024;
  let baseH = m ? Number(m[2]) : 1024;
  const ratio = (aspectRatio || '').trim();
  if (!ratio || !ratio.includes(':')) {
    return `${baseW}x${baseH}`;
  }
  const [a, b] = ratio.split(':').map(Number);
  if (!a || !b) {
    return `${baseW}x${baseH}`;
  }
  const want = a / b;
  const short = 1024;
  let w: number;
  let h: number;
  if (want >= 1) {
    h = short;
    w = Math.round((short * want) / 32) * 32;
  } else {
    w = short;
    h = Math.round((short / want) / 32) * 32;
  }
  w = Math.max(32, w);
  h = Math.max(32, h);
  return `${w}x${h}`;
}