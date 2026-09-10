import { supabase } from './supabaseClient';

const API_BASE_URL = 'http://127.0.0.1:8000';
const normalize = (value) => String(value ?? '').trim().toLowerCase();

const getProvinceValue = (row) => {
  const extra = row?.extra_data || {};
  return row?.province || extra.province || extra.Province || extra.PROVINCE || extra.region || extra.region_name || extra.province_name || extra.ProvinceName || '';
};

export async function getOpportunitiesSupabase(filters = {}) {
  const {
    category = 'all', province = 'all', location = '', organization = '',
    deadline = 'all', keyword = '', status = 'all', sortBy = 'default',
    page = 1, limit = 50, returnMeta = false,
  } = filters;

  const params = new URLSearchParams();
  if (category !== 'all') params.append('category', category);
  if (province !== 'all') params.append('province', province);
  if (location.trim()) params.append('location', location.trim());
  if (organization.trim()) params.append('organization', organization.trim());
  if (deadline !== 'all') params.append('deadline', deadline);
  if (sortBy !== 'default') params.append('sort_by', sortBy);
  if (keyword.trim()) params.append('keyword', keyword.trim());
  params.append('page', String(page));
  params.append('limit', String(limit));

  const response = await fetch(`${API_BASE_URL}/api/opportunities?${params.toString()}`);
  if (!response.ok) throw new Error(`FastAPI request failed: ${response.status} ${response.statusText}`);

  const result = await response.json();
  let results = result.data || [];

  results = results.map((item) => {
    const extra = item.extra_data || {};
    return {
      ...item,
      id: item.id,
      category: item.category || extra.category || category || 'job',
      title: item.title || extra.title || extra.job_title || extra.name || 'Untitled Opportunity',
      organization: item.organization || extra.organization || extra.company || extra.department || extra.ministry || '',
      description: item.description || extra.description || extra.details || extra.program_overview || extra.overview || extra.job_description || '',
      province: getProvinceValue(item),
      location: item.location || extra.location || extra.city || extra.district || '',
      closing_date: item.closing_date || extra.closing_date || extra.deadline || extra.last_date || '',
      status: item.status || extra.status || '',
      url: item.url || extra.url || extra.link || extra.apply_url || '',
      extra_data: extra,
    };
  });

  if (province !== 'all') {
    const targetProvince = normalize(province);
    results = results.filter((item) => normalize(item.province) === targetProvince || normalize(item.province) === 'all pakistan');
  }
  if (status !== 'all') results = results.filter((item) => normalize(item.status) === normalize(status));

  if (returnMeta) {
    return {
      data: results,
      total: result.total ?? results.length,
      page: result.page ?? page,
      limit: result.limit ?? limit,
      hasNext: Boolean(result.has_next),
    };
  }
  return results;
}

export async function getOpportunityByIdSupabase(id) {
  const { data, error } = await supabase.from('opportunities').select('*').eq('id', Number(id)).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function searchOpportunitiesSupabase(keyword, category = 'all') {
  return getOpportunitiesSupabase({ keyword, category });
}

export async function submitOpportunitySupabase(payload) {
  const response = await fetch(`${API_BASE_URL}/api/submitted-opportunities`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(`Submission failed: ${response.status} ${response.statusText}`);
  return { success: true, message: 'Submission recorded', data: await response.json() };
}

export async function getProvincesSupabase() {
  const standardProvinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Jammu and Kashmir'];
  let values = [];
  try {
    const { data, error } = await supabase.from('opportunities').select('province, extra_data');
    if (!error && Array.isArray(data)) values = data.map(getProvinceValue).filter(Boolean);
  } catch (error) { console.warn('Could not load provinces directly from Supabase:', error); }
  try {
    const response = await fetch(`${API_BASE_URL}/api/opportunities?limit=100`);
    if (response.ok) {
      const result = await response.json();
      values = [...values, ...(result.data || []).map(getProvinceValue).filter(Boolean)];
    }
  } catch (error) { console.warn('Could not load provinces from API:', error); }
  const unique = Array.from(new Map([...standardProvinces, ...values].map((value) => String(value).trim()).filter(Boolean).map((value) => [normalize(value), value])).values());
  const order = standardProvinces.map(normalize);
  return unique.sort((a, b) => {
    const ai = order.indexOf(normalize(a)); const bi = order.indexOf(normalize(b));
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
}

export async function getCategoryStatsSupabase() {
  const { data, error } = await supabase.from('opportunities').select('category');
  if (error) throw error;
  const counts = { job: 0, scholarship: 0, loan: 0, training: 0, internship: 0, project: 0 };
  data.forEach((item) => { const category = item.category?.toLowerCase()?.trim(); if (counts[category] !== undefined) counts[category]++; });
  return [
    { key: 'all', name: 'All Opportunities', nameUrdu: 'تمام مواقع', count: data.length, icon: 'LayoutGrid' },
    { key: 'job', name: 'Jobs', nameUrdu: 'ملازمتیں', count: counts.job, icon: 'Briefcase' },
    { key: 'scholarship', name: 'Scholarships', nameUrdu: 'وظائف', count: counts.scholarship, icon: 'GraduationCap' },
    { key: 'loan', name: 'Loans', nameUrdu: 'قرضے', count: counts.loan, icon: 'Landmark' },
    { key: 'training', name: 'Training', nameUrdu: 'تربیت', count: counts.training, icon: 'Sparkles' },
    { key: 'internship', name: 'Internships', nameUrdu: 'انٹرن شپس', count: counts.internship, icon: 'Building2' },
    { key: 'project', name: 'Projects', nameUrdu: 'پروجیکٹس', count: counts.project, icon: 'FolderKanban' },
  ];
}
