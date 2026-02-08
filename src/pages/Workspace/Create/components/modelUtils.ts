/**
 * 根据当前语言取模型描述：中文显示 description，其他语言显示 descriptionEn，空时回退到另一字段
 */
export function getModelDescription(
  model: { description?: string | null; descriptionEn?: string | null } | null | undefined,
  locale: string
): string {
  if (!model) return '';
  const desc = model.description?.trim() || '';
  const descEn = model.descriptionEn?.trim() || '';
  const isZh = typeof locale === 'string' && locale.toLowerCase().startsWith('zh');
  if (isZh) return desc || descEn;
  return descEn || desc;
}
