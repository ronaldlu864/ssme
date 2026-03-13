// SSME - 类型定义

// 询盘数据结构
export interface Inquiry {
  id: string;
  client_name: string;
  industry: string;
  product_category: string;
  product_description: string;
  quantity: number;
  delivery_time: string;
  target_market: string;
  certification_required: string[];
  budget_level: 'low' | 'mid' | 'high';
  priority_level: 'low' | 'mid' | 'high';
  raw_input: string;
  parsed_data: ParsedInquiryData;
  status: 'new' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// AI解析后的询盘数据
export interface ParsedInquiryData {
  industry: string;
  product_category: string;
  product_name: string;
  technical_specs: string[];
  quantity: number;
  delivery_time: string;
  target_market: string;
  certification_required: string[];
  budget_level: 'low' | 'mid' | 'high';
  priority_level: 'low' | 'mid' | 'high';
  alternative_allowed: boolean;
}

// 供应商数据
export interface Supplier {
  id: string;
  supplier_name: string;
  country: string;
  product_categories: string[];
  certifications: string[];
  export_markets: string[];
  min_order_quantity: number;
  lead_time: string;
  contact_person: string;
  email: string;
  phone: string;
  website: string;
  notes: string;
  trust_score: number;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

// 匹配结果
export interface MatchResult {
  id: string;
  inquiry_id: string;
  supplier_id: string;
  supplier?: Supplier;
  match_score: number;
  recommendation_level: 'High' | 'Medium' | 'Low';
  reasons: string[];
  risk_flags: string[];
  missing_info: string[];
  suggested_actions: string[];
  created_at: string;
}

// 匹配反馈
export interface MatchFeedback {
  id: string;
  match_id: string;
  rfq_sent: boolean;
  quote_received: boolean;
  order_won: boolean;
  delivery_score: number;
  quality_score: number;
  profit_margin: number;
  failure_reason: string;
  comments: string;
  created_at: string;
}

// AI评分详情
export interface ScoreDetail {
  product_fit: number;
  compliance_fit: number;
  commercial_fit: number;
  delivery_fit: number;
  trust_history: number;
  total: number;
}

// 表单数据类型
export interface InquiryFormData {
  client_name: string;
  raw_input: string;
}

export interface SupplierFormData {
  supplier_name: string;
  country: string;
  product_categories: string;
  certifications: string;
  export_markets: string;
  min_order_quantity: number;
  lead_time: string;
  contact_person: string;
  email: string;
  phone: string;
  website: string;
  notes: string;
}

// API响应类型
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// 搜索参数
export interface SupplierSearchParams {
  keyword?: string;
  country?: string;
  product_category?: string;
  certification?: string;
}
