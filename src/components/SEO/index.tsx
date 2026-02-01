import React from 'react';
import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  locale?: string;
  noindex?: boolean;
  structuredData?: object;
  children?: React.ReactNode;
}

const DEFAULT_TITLE = 'AI2OBJ - 综合 AI 创作平台';
const DEFAULT_DESCRIPTION = 'AI2OBJ 是一站式综合 AI 创作平台，提供文生图、文生视频、图生图、图生视频、提示词商城与媒体工具等能力，让创意从想法到作品一步到位。';
const DEFAULT_IMAGE = 'https://ai2obj.com/landing.png';
const SITE_URL = 'https://ai2obj.com';

/**
 * SEO 组件 - 用于各页面动态设置 SEO 相关的 meta 标签
 * 
 * @example
 * <SEO 
 *   title="文生图 - AI2OBJ"
 *   description="使用 AI 将文本描述转换为高质量图片"
 *   url="/workspace?tab=t2v"
 * />
 */
const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  image = DEFAULT_IMAGE,
  url = '',
  type = 'website',
  locale = 'zh_CN',
  noindex = false,
  structuredData,
  children,
}) => {
  const fullTitle = title ? `${title} | AI2OBJ` : DEFAULT_TITLE;
  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;
  const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      {/* 基础 Meta 标签 */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* 索引控制 */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="AI2OBJ" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* 结构化数据 */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {children}
    </Helmet>
  );
};

/**
 * 预定义的 SEO 配置
 */
export const SEOConfigs = {
  home: {
    title: undefined, // 使用默认标题
    description: 'AI2OBJ 是一站式综合 AI 创作平台，提供文生图、文生视频、图生图、图生视频、提示词商城与媒体工具等能力，让创意从想法到作品一步到位。',
    keywords: 'AI2OBJ, AI创作, 文生图, 文生视频, 图生图, 图生视频, 提示词商城, 媒体工具, AI生成',
    url: '/',
  },
  
  login: {
    title: '登录',
    description: '登录 AI2OBJ 账户，开始您的 AI 创作之旅。支持多种登录方式，安全便捷。',
    keywords: '登录, AI2OBJ登录, AI创作平台登录',
    url: '/login',
    noindex: true,
  },
  
  signup: {
    title: '注册',
    description: '注册 AI2OBJ 账户，免费体验文生图、文生视频、提示词商城与媒体工具等综合 AI 创作功能。',
    keywords: '注册, AI2OBJ注册, AI创作平台注册, 免费注册',
    url: '/signup',
  },
  
  workspace: {
    title: '工作台',
    description: 'AI2OBJ 创作工作台，支持文生图、文生视频、图生图、图生视频、提示词商城与媒体工具等。',
    keywords: 'AI工作台, 文生图, 文生视频, 图生图, 图生视频, 提示词商城, AI创作工具',
    url: '/workspace',
    noindex: true,
  },
  
  textToVideo: {
    title: '文生视频',
    description: '使用 AI 将文本描述转换为高质量视频。一键生成专业视频作品。',
    keywords: '文生视频, 文本生成视频, AI视频生成, 文生图',
    url: '/workspace?tab=t2v',
    noindex: true,
  },
  
  imageToVideo: {
    title: '图生视频',
    description: '将静态图片转换为动态视频。AI 智能分析图像内容，生成流畅自然的视频动画效果。',
    keywords: '图生视频, image to video, 图片转视频, AI动画, 图像动画化',
    url: '/workspace?tab=i2v',
    noindex: true,
  },
  
  about: {
    title: '关于我们',
    description: '了解 AI2OBJ 团队和我们的使命。我们致力于让 AI 创作变得简单易用，人人可及。',
    keywords: '关于AI2OBJ, 团队介绍, AI创作平台, 公司介绍',
    url: '/about',
  },
  
  help: {
    title: '帮助中心',
    description: 'AI2OBJ 使用指南和常见问题解答。了解如何使用文生图、文生视频、图生视频等功能。',
    keywords: '帮助中心, 使用指南, FAQ, 常见问题, AI2OBJ教程',
    url: '/help',
  },
  
  feedback: {
    title: '意见反馈',
    description: '向 AI2OBJ 团队提交您的意见和建议。我们重视每一位用户的反馈，持续改进产品体验。',
    keywords: '意见反馈, 用户反馈, 建议, 问题反馈',
    url: '/feedback',
  },
  
  termsOfService: {
    title: '服务条款',
    description: 'AI2OBJ 服务条款和使用协议。了解您在使用 AI2OBJ 服务时的权利和义务。',
    keywords: '服务条款, 使用协议, 用户协议, 法律条款',
    url: '/terms-of-service',
  },
  
  privacyPolicy: {
    title: '隐私政策',
    description: 'AI2OBJ 隐私政策。了解我们如何收集、使用和保护您的个人信息。',
    keywords: '隐私政策, 隐私保护, 个人信息, 数据安全',
    url: '/privacy-policy',
  },
  
  pricing: {
    title: '定价方案',
    description: 'AI2OBJ 定价方案和套餐介绍。灵活的 Token 充值方式，满足不同创作需求。',
    keywords: '定价, 套餐, Token充值, 会员, 价格',
    url: '/recharge',
    noindex: true,
  },
};

/**
 * 生成文章页面的结构化数据
 */
export const generateArticleStructuredData = (params: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    image: params.image,
    datePublished: params.datePublished,
    dateModified: params.dateModified || params.datePublished,
    author: {
      '@type': 'Organization',
      name: params.author || 'AI2OBJ',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI2OBJ',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ai2obj.com/logo192.ico',
      },
    },
  };
};

/**
 * 生成产品页面的结构化数据
 */
export const generateProductStructuredData = (params: {
  name: string;
  description: string;
  image: string;
  price?: number;
  currency?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
    description: params.description,
    image: params.image,
    brand: {
      '@type': 'Brand',
      name: 'AI2OBJ',
    },
    offers: params.price ? {
      '@type': 'Offer',
      price: params.price,
      priceCurrency: params.currency || 'USD',
      availability: 'https://schema.org/InStock',
    } : undefined,
  };
};

/**
 * 生成 FAQ 页面的结构化数据
 */
export const generateFAQStructuredData = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

export default SEO;

