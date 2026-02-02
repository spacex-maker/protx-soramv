/**
 * 后端公司实体 -> 前端列表卡片 / 详情页 layout 所需结构
 * 后端字段：companyName, fullName, slug, countryOrigin, description, missionStatement,
 *          bannerUrl, logoUrl, officialWebsite, coreTechnology, majorPartners, ...
 */

const DEFAULT_THEME = { primary: '#00d4aa', heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.75))' };

// slug -> 主题色（与后端数据无关，仅前端展示用）
const SLUG_THEME = {
  'boston-dynamics': { primary: '#e63946', heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.85))' },
  'figure-ai': { primary: '#0ea5e9', heroOverlay: 'linear-gradient(to bottom, rgba(14,165,233,0.2), rgba(0,0,0,0.8))' },
  'tesla': { primary: '#cc0000', heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.85))' },
  'agility-robotics': { primary: '#22c55e', heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.82))' },
  '1x-technologies': { primary: '#a78bfa', heroOverlay: 'linear-gradient(to bottom, rgba(167,139,250,0.15), rgba(0,0,0,0.8))' },
  'unitree': { primary: '#00d4aa', heroOverlay: 'linear-gradient(to bottom, rgba(0,212,170,0.12), rgba(0,0,0,0.85))' },
  'agibot': { primary: '#f97316', heroOverlay: 'linear-gradient(to bottom, rgba(249,115,22,0.15), rgba(0,0,0,0.85))' },
  'ubtech': { primary: '#3b82f6', heroOverlay: 'linear-gradient(to bottom, rgba(59,130,246,0.15), rgba(0,0,0,0.82))' },
  'apptronik': { primary: '#6366f1', heroOverlay: 'linear-gradient(to bottom, rgba(99,102,241,0.12), rgba(0,0,0,0.85))' },
  'sanctuary-ai': { primary: '#8b5cf6', heroOverlay: 'linear-gradient(to bottom, rgba(139,92,246,0.15), rgba(0,0,0,0.82))' },
};

/**
 * 后端单条公司 -> 列表展示用（含更多信息）
 */
export function apiCompanyToCard(api) {
  if (!api) return null;
  const slug = api.slug || '';
  const theme = SLUG_THEME[slug] || DEFAULT_THEME;
  return {
    slug,
    name: api.companyName || api.company_name || '',
    nameCn: api.fullName || api.full_name || '',
    region: api.countryOrigin || api.country_origin || '',
    tagline: api.missionStatement || api.mission_statement || '',
    description: api.description || '',
    heroImage: api.bannerUrl || api.banner_url || api.logoUrl || api.logo_url || '',
    foundedYear: api.foundedYear || api.founded_year,
    headquarters: api.headquarters || '',
    ceo: api.ceo || '',
    employeeCount: api.employeeCount || api.employee_count || '',
    employeeRange: api.employeeRange || api.employee_range || '',
    companyValuationUsd: api.companyValuationUsd || api.company_valuation_usd || '',
    totalFinancingUsd: api.totalFinancingUsd || api.total_financing_usd || '',
    latestRound: api.latestRound || api.latest_round || '',
    coreTechnology: api.coreTechnology || api.core_technology || '',
    officialUrl: api.officialWebsite || api.official_website || '',
    theme,
  };
}

/**
 * 后端单条公司 -> 详情页 CompanyPageLayout 所需 data + theme
 */
export function apiCompanyToDetail(api) {
  if (!api) return { data: null, theme: DEFAULT_THEME };
  const slug = api.slug || '';
  const theme = SLUG_THEME[slug] || DEFAULT_THEME;
  const desc = api.description || '';
  const aboutParagraphs = desc ? desc.split(/\n\n+/).filter(Boolean) : [];
  if (aboutParagraphs.length === 0 && desc) aboutParagraphs.push(desc);

  const highlights = [];
  if (api.coreTechnology) highlights.push(api.coreTechnology);
  if (api.majorPartners) highlights.push(`主要合作伙伴：${api.majorPartners}`);
  if (api.companyValuationUsd) highlights.push(`估值约 ${api.companyValuationUsd}`);
  if (api.totalFinancingUsd) highlights.push(`累计融资约 ${api.totalFinancingUsd}`);

  const data = {
    name: api.companyName || api.company_name || '',
    nameCn: api.fullName || api.full_name || '',
    region: api.countryOrigin || api.country_origin || '',
    tagline: api.missionStatement || api.mission_statement || desc.slice(0, 120) || '',
    heroImage: api.bannerUrl || api.banner_url || api.logoUrl || api.logo_url || '',
    aboutParagraphs,
    products: [], // 后端暂无产品子表，可后续扩展
    highlights,
    officialUrl: api.officialWebsite || api.official_website || '',
  };
  return { data, theme };
}
