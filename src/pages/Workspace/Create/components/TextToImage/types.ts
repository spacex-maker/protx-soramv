// 模型类型定义

export interface ModelFamily {
  id: number;
  modelName: string;
  modelCode: string;
  description: string;
  imageDefaultResolution: string | null;
  imageMaxResolution: string | null;
  imageAspectRatios: string | null;
  imageFormats: string | null;
  supportControlnet: boolean;
  supportInpaint: boolean;
  supportReference: boolean;
  currency: string | null;
  outputPrice: number | null;
  companyCode: string | null;
  releaseYear: string | null;
  status: boolean;
}

export interface Model {
  id: number;
  modelName: string;
  modelCode: string;
  description: string;
  imageDefaultResolution: string | null;
  imageMaxResolution: string | null;
  imageAspectRatios: string | null;
  imageFormats: string | null;
  supportControlnet: boolean;
  supportInpaint: boolean;
  supportReference: boolean;
  currency: string | null;
  outputPrice: number | null;
  coverImage: string | null;
}

