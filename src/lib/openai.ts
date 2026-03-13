import OpenAI from 'openai';
import type { ParsedInquiryData, Supplier, ScoreDetail } from '@/types';

// 从环境变量获取API密钥
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

// 检查配置是否有效
export const isOpenAIConfigured = apiKey && apiKey.startsWith('sk-') && apiKey.length > 20;

// 创建OpenAI客户端（配置无效时创建空客户端）
const openai = isOpenAIConfigured 
  ? new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
  : new OpenAI({ apiKey: 'placeholder-key', dangerouslyAllowBrowser: true });

// ==================== 询盘解析 ====================

/**
 * 使用AI解析询盘文本
 * @param rawInquiry 原始询盘文本
 * @returns 结构化的询盘数据
 */
export async function parseInquiry(rawInquiry: string): Promise<{
  data: ParsedInquiryData | null;
  error: string | null;
}> {
  if (!isOpenAIConfigured) {
    return { 
      data: null, 
      error: 'OpenAI API not configured. Please set VITE_OPENAI_API_KEY in your environment variables.' 
    };
  }
  
  try {
    const prompt = `Parse the following customer inquiry and extract structured information.

Inquiry:
"""${rawInquiry}"""

Extract and return a JSON object with these fields:
- industry: The industry sector (e.g., railway, automotive, electronics)
- product_category: Product category (e.g., brake components, sensors)
- product_name: Specific product name
- technical_specs: Array of technical specifications or standards
- quantity: Number as integer
- delivery_time: Delivery time requirement as string
- target_market: Target market/country
- certification_required: Array of required certifications
- budget_level: One of "low", "mid", "high"
- priority_level: One of "low", "mid", "high"
- alternative_allowed: Boolean indicating if alternatives are acceptable

Return ONLY the JSON object, no other text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a supply chain data parser. Extract structured information from customer inquiries accurately.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { data: null, error: 'Empty response from AI' };
    }

    // 解析JSON响应
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { data: null, error: 'Invalid JSON response' };
    }

    const parsedData = JSON.parse(jsonMatch[0]) as ParsedInquiryData;
    return { data: parsedData, error: null };
  } catch (error) {
    console.error('Error parsing inquiry:', error);
    return { data: null, error: String(error) };
  }
}

// ==================== 供应商评分 ====================

/**
 * 使用AI评分供应商匹配度
 * @param inquiryData 询盘数据
 * @param supplier 供应商数据
 * @returns 评分详情
 */
export async function scoreSupplier(
  inquiryData: ParsedInquiryData,
  supplier: Supplier
): Promise<{
  scoreDetail: ScoreDetail | null;
  reasons: string[];
  riskFlags: string[];
  missingInfo: string[];
  suggestedActions: string[];
  error: string | null;
}> {
  if (!isOpenAIConfigured) {
    return { 
      scoreDetail: null, 
      reasons: [], 
      riskFlags: [], 
      missingInfo: [], 
      suggestedActions: [], 
      error: 'OpenAI API not configured. Please set VITE_OPENAI_API_KEY in your environment variables.' 
    };
  }
  
  try {
    const prompt = `Evaluate how well this supplier matches the inquiry requirements.

INQUIRY:
- Product: ${inquiryData.product_name}
- Category: ${inquiryData.product_category}
- Industry: ${inquiryData.industry}
- Quantity: ${inquiryData.quantity}
- Delivery Time: ${inquiryData.delivery_time}
- Target Market: ${inquiryData.target_market}
- Certifications Required: ${inquiryData.certification_required?.join(', ') || 'None specified'}
- Technical Specs: ${inquiryData.technical_specs?.join(', ') || 'None specified'}

SUPPLIER:
- Name: ${supplier.supplier_name}
- Country: ${supplier.country}
- Product Categories: ${supplier.product_categories?.join(', ') || 'Not specified'}
- Certifications: ${supplier.certifications?.join(', ') || 'Not specified'}
- Export Markets: ${supplier.export_markets?.join(', ') || 'Not specified'}
- Min Order Quantity: ${supplier.min_order_quantity || 'Not specified'}
- Lead Time: ${supplier.lead_time || 'Not specified'}
- Trust Score: ${supplier.trust_score}/100

Score each category from 0-100:
1. Product Fit (35%): How well do their products match?
2. Compliance Fit (20%): Do they have required certifications?
3. Commercial Fit (20%): Can they handle the quantity and MOQ?
4. Delivery Fit (15%): Can they meet delivery requirements?
5. Trust History (10%): Based on trust score

Return a JSON object with:
{
  "scores": {
    "product_fit": number,
    "compliance_fit": number,
    "commercial_fit": number,
    "delivery_fit": number,
    "trust_history": number,
    "total": number (weighted average)
  },
  "reasons": ["reason 1", "reason 2", ...],
  "risk_flags": ["risk 1", ...] or [],
  "missing_info": ["missing 1", ...] or [],
  "suggested_actions": ["action 1", ...]
}

Return ONLY the JSON object.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a supplier evaluation expert. Score suppliers objectively based on inquiry requirements.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        scoreDetail: null,
        reasons: [],
        riskFlags: [],
        missingInfo: [],
        suggestedActions: [],
        error: 'Empty response from AI',
      };
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        scoreDetail: null,
        reasons: [],
        riskFlags: [],
        missingInfo: [],
        suggestedActions: [],
        error: 'Invalid JSON response',
      };
    }

    const result = JSON.parse(jsonMatch[0]);
    return {
      scoreDetail: result.scores,
      reasons: result.reasons || [],
      riskFlags: result.risk_flags || [],
      missingInfo: result.missing_info || [],
      suggestedActions: result.suggested_actions || [],
      error: null,
    };
  } catch (error) {
    console.error('Error scoring supplier:', error);
    return {
      scoreDetail: null,
      reasons: [],
      riskFlags: [],
      missingInfo: [],
      suggestedActions: [],
      error: String(error),
    };
  }
}

// ==================== 批量评分 ====================

/**
 * 批量评分供应商
 * @param inquiryData 询盘数据
 * @param suppliers 供应商列表
 * @returns 评分结果列表
 */
export async function scoreSuppliersBatch(
  inquiryData: ParsedInquiryData,
  suppliers: Supplier[]
): Promise<
  {
    supplierId: string;
    scoreDetail: ScoreDetail;
    reasons: string[];
    riskFlags: string[];
    missingInfo: string[];
    suggestedActions: string[];
  }[]
> {
  const results = [];
  
  // 串行处理以避免API限制
  for (const supplier of suppliers) {
    const result = await scoreSupplier(inquiryData, supplier);
    if (result.scoreDetail) {
      results.push({
        supplierId: supplier.id,
        scoreDetail: result.scoreDetail,
        reasons: result.reasons,
        riskFlags: result.riskFlags,
        missingInfo: result.missingInfo,
        suggestedActions: result.suggestedActions,
      });
    }
  }
  
  return results;
}

// ==================== 生成推荐报告 ====================

/**
 * 生成推荐报告文本
 * @param inquiry 询盘
 * @param topMatches 最佳匹配
 * @returns 报告文本
 */
export async function generateRecommendationReport(
  inquiry: ParsedInquiryData,
  topMatches: { supplier: Supplier; score: number; reasons: string[] }[]
): Promise<string> {
  try {
    const prompt = `Generate a professional supplier recommendation report.

INQUIRY:
- Product: ${inquiry.product_name}
- Quantity: ${inquiry.quantity}
- Delivery: ${inquiry.delivery_time}
- Target Market: ${inquiry.target_market}

TOP MATCHES:
${topMatches.map((m, i) => `
${i + 1}. ${m.supplier.supplier_name} (Score: ${m.score})
   Country: ${m.supplier.country}
   Reasons: ${m.reasons.join(', ')}
`).join('\n')}

Generate a concise business recommendation report (2-3 paragraphs) highlighting the best options and key considerations.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a supply chain consultant. Write professional recommendation reports.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
    });

    return response.choices[0]?.message?.content || 'Unable to generate report.';
  } catch (error) {
    console.error('Error generating report:', error);
    return 'Error generating recommendation report.';
  }
}

// ==================== 外部供应商搜索建议 ====================

export interface ExternalSupplier {
  name: string;
  country: string;
  website: string;
  description: string;
  certifications: string[];
  productCategories: string[];
  whyRecommended: string;
}

export interface ExternalSearchSuggestion {
  searchKeywords: string[];
  recommendedPlatforms: { name: string; url: string; description: string }[];
  filterCriteria: string[];
  tips: string[];
  recommendedSuppliers: ExternalSupplier[];
}

/**
 * 生成外部供应商搜索建议
 * @param inquiryData 询盘数据
 * @returns 搜索建议
 */
export async function generateExternalSearchSuggestions(
  inquiryData: ParsedInquiryData
): Promise<{
  suggestions: ExternalSearchSuggestion | null;
  error: string | null;
}> {
  if (!isOpenAIConfigured) {
    return {
      suggestions: null,
      error: 'OpenAI API not configured. Please set VITE_OPENAI_API_KEY in your environment variables.'
    };
  }

  try {
    const prompt = `As a supply chain sourcing expert with extensive knowledge of global manufacturers, recommend specific suppliers for the following inquiry requirements.

INQUIRY REQUIREMENTS:
- Product: ${inquiryData.product_name}
- Category: ${inquiryData.product_category}
- Industry: ${inquiryData.industry}
- Quantity: ${inquiryData.quantity}
- Delivery Time: ${inquiryData.delivery_time}
- Target Market: ${inquiryData.target_market}
- Required Certifications: ${inquiryData.certification_required?.join(', ') || 'None specified'}
- Technical Specs: ${inquiryData.technical_specs?.join(', ') || 'None specified'}

Provide recommendations in JSON format with the following structure:
{
  "searchKeywords": ["keyword 1", "keyword 2", "keyword 3"],
  "recommendedPlatforms": [
    { "name": "Platform Name", "url": "https://example.com", "description": "Why this platform" }
  ],
  "filterCriteria": ["filter 1", "filter 2", "filter 3"],
  "tips": ["tip 1", "tip 2", "tip 3"],
  "recommendedSuppliers": [
    {
      "name": "Company Name",
      "country": "Country",
      "website": "https://company-website.com",
      "description": "Brief description of the company and their capabilities",
      "certifications": ["ISO9001", "CE"],
      "productCategories": ["category 1", "category 2"],
      "whyRecommended": "Why this supplier matches the inquiry requirements"
    }
  ]
}

IMPORTANT:
- Recommend 3-5 specific, real companies with actual websites
- Include well-known manufacturers in this industry
- Ensure the companies can realistically meet the requirements
- Provide complete, accurate website URLs
- Focus on companies from appropriate regions based on target market

Return ONLY the JSON object, no other text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a supply chain sourcing expert with deep knowledge of global manufacturers. Recommend specific, real companies that match the inquiry requirements.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { suggestions: null, error: 'Empty response from AI' };
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { suggestions: null, error: 'Invalid JSON response' };
    }

    const suggestions = JSON.parse(jsonMatch[0]) as ExternalSearchSuggestion;
    return { suggestions, error: null };
  } catch (error) {
    console.error('Error generating search suggestions:', error);
    return { suggestions: null, error: String(error) };
  }
}
