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
