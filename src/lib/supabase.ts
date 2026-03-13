import { createClient } from '@supabase/supabase-js';
import type { Inquiry, Supplier, MatchResult, MatchFeedback } from '@/types';
import { demoInquiries, demoSuppliers, demoMatchResults } from './demoData';

// 从环境变量获取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 检查配置是否完整
export const isSupabaseConfigured = supabaseUrl && supabaseKey && 
  supabaseUrl.startsWith('http') && 
  supabaseKey.length > 10;

// 创建Supabase客户端（配置无效时创建空客户端）
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey)
 : createClient('https://placeholder.supabase.co', 'placeholder-key');

// 演示模式提示
const getDemoModeResponse = <T>(data: T) => ({
  data,
  error: null
});

// ==================== 询盘相关操作 ====================

// 获取所有询盘
export async function getInquiries() {
  if (!isSupabaseConfigured) {
    return getDemoModeResponse(demoInquiries);
  }
  
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data: data as Inquiry[] | null, error: error?.message || null };
}

// 获取单个询盘
export async function getInquiryById(id: string) {
  if (!isSupabaseConfigured) {
    const inquiry = demoInquiries.find(i => i.id === id);
    return getDemoModeResponse(inquiry || null);
  }
  
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data: data as Inquiry | null, error: error?.message || null };
}

// 创建询盘
export async function createInquiry(inquiry: Partial<Inquiry>) {
  if (!isSupabaseConfigured) {
    // 演示模式：模拟创建成功
    const newInquiry = {
      ...inquiry,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Inquiry;
    demoInquiries.unshift(newInquiry);
    return getDemoModeResponse(newInquiry);
  }
  
  const { data, error } = await supabase
    .from('inquiries')
    .insert([inquiry])
    .select()
    .single();
  
  return { data: data as Inquiry | null, error: error?.message || null };
}

// 更新询盘
export async function updateInquiry(id: string, updates: Partial<Inquiry>) {
  if (!isSupabaseConfigured) {
    const index = demoInquiries.findIndex(i => i.id === id);
    if (index >= 0) {
      demoInquiries[index] = { ...demoInquiries[index], ...updates };
      return getDemoModeResponse(demoInquiries[index]);
    }
    return { data: null, error: 'Inquiry not found' };
  }
  
  const { data, error } = await supabase
    .from('inquiries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data: data as Inquiry | null, error: error?.message || null };
}

// 删除询盘
export async function deleteInquiry(id: string) {
  if (!isSupabaseConfigured) {
    const index = demoInquiries.findIndex(i => i.id === id);
    if (index >= 0) {
      demoInquiries.splice(index, 1);
    }
    return { error: null };
  }
  
  const { error } = await supabase
    .from('inquiries')
    .delete()
    .eq('id', id);
  
  return { error: error?.message || null };
}

// ==================== 供应商相关操作 ====================

// 获取所有供应商
export async function getSuppliers() {
  if (!isSupabaseConfigured) {
    return getDemoModeResponse(demoSuppliers);
  }
  
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('trust_score', { ascending: false });
  
  return { data: data as Supplier[] | null, error: error?.message || null };
}

// 搜索供应商
export async function searchSuppliers(params: {
  keyword?: string;
  country?: string;
  product_category?: string;
  certification?: string;
}) {
  if (!isSupabaseConfigured) {
    // 演示模式：简单过滤
    let filtered = [...demoSuppliers];
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(s => 
        s.supplier_name.toLowerCase().includes(kw) ||
        s.product_categories.some(c => c.toLowerCase().includes(kw))
      );
    }
    if (params.country) {
      filtered = filtered.filter(s => s.country === params.country);
    }
    return getDemoModeResponse(filtered);
  }
  
  let query = supabase.from('suppliers').select('*');
  
  if (params.keyword) {
    query = query.or(`supplier_name.ilike.%${params.keyword}%,product_categories.cs.{${params.keyword}}`);
  }
  
  if (params.country) {
    query = query.eq('country', params.country);
  }
  
  if (params.product_category) {
    query = query.contains('product_categories', [params.product_category]);
  }
  
  if (params.certification) {
    query = query.contains('certifications', [params.certification]);
  }
  
  const { data, error } = await query.order('trust_score', { ascending: false });
  
  return { data: data as Supplier[] | null, error: error?.message || null };
}

// 获取单个供应商
export async function getSupplierById(id: string) {
  if (!isSupabaseConfigured) {
    const supplier = demoSuppliers.find(s => s.id === id);
    return getDemoModeResponse(supplier || null);
  }
  
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data: data as Supplier | null, error: error?.message || null };
}

// 创建供应商
export async function createSupplier(supplier: Partial<Supplier>) {
  if (!isSupabaseConfigured) {
    const newSupplier = {
      ...supplier,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Supplier;
    demoSuppliers.push(newSupplier);
    return getDemoModeResponse(newSupplier);
  }
  
  const { data, error } = await supabase
    .from('suppliers')
    .insert([supplier])
    .select()
    .single();
  
  return { data: data as Supplier | null, error: error?.message || null };
}

// 更新供应商
export async function updateSupplier(id: string, updates: Partial<Supplier>) {
  if (!isSupabaseConfigured) {
    const index = demoSuppliers.findIndex(s => s.id === id);
    if (index >= 0) {
      demoSuppliers[index] = { ...demoSuppliers[index], ...updates };
      return getDemoModeResponse(demoSuppliers[index]);
    }
    return { data: null, error: 'Supplier not found' };
  }
  
  const { data, error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data: data as Supplier | null, error: error?.message || null };
}

// 删除供应商
export async function deleteSupplier(id: string) {
  if (!isSupabaseConfigured) {
    const index = demoSuppliers.findIndex(s => s.id === id);
    if (index >= 0) {
      demoSuppliers.splice(index, 1);
    }
    return { error: null };
  }
  
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);
  
  return { error: error?.message || null };
}

// ==================== 匹配结果相关操作 ====================

// 获取询盘的匹配结果
export async function getMatchResultsByInquiry(inquiryId: string) {
  if (!isSupabaseConfigured) {
    const matches = demoMatchResults.filter(m => m.inquiry_id === inquiryId);
    return getDemoModeResponse(matches);
  }
  
  const { data, error } = await supabase
    .from('match_results')
    .select(`
      *,
      supplier:suppliers(*)
    `)
    .eq('inquiry_id', inquiryId)
    .order('match_score', { ascending: false });
  
  return { data: data as MatchResult[] | null, error: error?.message || null };
}

// 创建匹配结果
export async function createMatchResult(matchResult: Partial<MatchResult>) {
  if (!isSupabaseConfigured) {
    const newMatch = {
      ...matchResult,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
    } as MatchResult;
    demoMatchResults.push(newMatch);
    return getDemoModeResponse(newMatch);
  }
  
  const { data, error } = await supabase
    .from('match_results')
    .insert([matchResult])
    .select()
    .single();
  
  return { data: data as MatchResult | null, error: error?.message || null };
}

// 批量创建匹配结果
export async function createMatchResults(matchResults: Partial<MatchResult>[]) {
  if (!isSupabaseConfigured) {
    const newMatches = matchResults.map((mr, i) => ({
      ...mr,
      id: String(Date.now() + i),
      created_at: new Date().toISOString(),
    })) as MatchResult[];
    demoMatchResults.push(...newMatches);
    return getDemoModeResponse(newMatches);
  }
  
  const { data, error } = await supabase
    .from('match_results')
    .insert(matchResults)
    .select();
  
  return { data: data as MatchResult[] | null, error: error?.message || null };
}

// ==================== 反馈相关操作 ====================

// 创建反馈
export async function createFeedback(feedback: Partial<MatchFeedback>) {
  if (!isSupabaseConfigured) {
    // 演示模式：返回成功但不存储
    return getDemoModeResponse({
      ...feedback,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
    } as MatchFeedback);
  }
  
  const { data, error } = await supabase
    .from('match_feedback')
    .insert([feedback])
    .select()
    .single();
  
  return { data: data as MatchFeedback | null, error: error?.message || null };
}

// 获取匹配的反馈
export async function getFeedbackByMatch(matchId: string) {
  if (!isSupabaseConfigured) {
    // 演示模式：返回空
    return getDemoModeResponse(null);
  }
  
  const { data, error } = await supabase
    .from('match_feedback')
    .select('*')
    .eq('match_id', matchId)
    .single();
  
  return { data: data as MatchFeedback | null, error: error?.message || null };
}
