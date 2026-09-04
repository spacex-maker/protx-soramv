export const DIRECTOR_PROP_CATEGORIES = [
  'general',
  'weapon',
  'vehicle',
  'furniture',
  'magic',
  'document',
  'other',
] as const;

export type DirectorPropCategory = (typeof DIRECTOR_PROP_CATEGORIES)[number];

export const DIRECTOR_PROP_CATEGORY_I18N: Record<
  DirectorPropCategory,
  { id: string; defaultMessage: string }
> = {
  general: { id: 'director.props.category.general', defaultMessage: '通用' },
  weapon: { id: 'director.props.category.weapon', defaultMessage: '武器' },
  vehicle: { id: 'director.props.category.vehicle', defaultMessage: '载具' },
  furniture: { id: 'director.props.category.furniture', defaultMessage: '家具' },
  magic: { id: 'director.props.category.magic', defaultMessage: '法器' },
  document: { id: 'director.props.category.document', defaultMessage: '文书' },
  other: { id: 'director.props.category.other', defaultMessage: '其他' },
};

export const DIRECTOR_BUILDING_CATEGORIES = [
  'exterior',
  'interior',
  'landmark',
  'street',
  'facility',
  'ruin',
  'other',
] as const;

export type DirectorBuildingCategory = (typeof DIRECTOR_BUILDING_CATEGORIES)[number];

export const DIRECTOR_BUILDING_CATEGORY_I18N: Record<
  DirectorBuildingCategory,
  { id: string; defaultMessage: string }
> = {
  exterior: { id: 'director.buildings.category.exterior', defaultMessage: '外观/外景' },
  interior: { id: 'director.buildings.category.interior', defaultMessage: '室内空间' },
  landmark: { id: 'director.buildings.category.landmark', defaultMessage: '地标' },
  street: { id: 'director.buildings.category.street', defaultMessage: '街道/街区' },
  facility: { id: 'director.buildings.category.facility', defaultMessage: '设施/场所' },
  ruin: { id: 'director.buildings.category.ruin', defaultMessage: '遗迹/废墟' },
  other: { id: 'director.buildings.category.other', defaultMessage: '其他' },
};

export const isDisplayableImageUrl = (url?: string | null): url is string => {
  if (!url?.trim()) return false;
  const u = url.trim();
  return (
    u.startsWith('http://') ||
    u.startsWith('https://') ||
    u.startsWith('data:') ||
    u.startsWith('//')
  );
};
