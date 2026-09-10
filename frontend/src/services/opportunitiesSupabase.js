import { supabase } from './supabaseClient';

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function getOpportunitiesSupabase(filters = {}) {
  const { category = 'all', province = 'all', location = '', organization = '', deadline = 'all', keyword = '', status = 'all', sortBy = 'default' } = filters;
  const params = new URLSearchParams();
  if (category !== 'all') params.append('category', category);
  if (province !== 'all') params.append('province', province);
  if (location.trim()) params.append('location', location.trim());
  if (organization.trim()) params.append('organization', organization.trim());
  if (deadline !== 'all') params.append('deadline', deadline);
  if (sortBy !== 'default') params.append('sort_by', sortBy);

  let url;
  if (keyword.trim()) {
    params.append('q', keyword.trim());
    url = `${API_BASE_URL}/api/opportunities/search?${params.toString()}`;
  } else {
    const queryString = params.toString();
    url = queryString ? `${API_BASE_URL}/api/opportunities?${queryString}` : `${API_BASE_URL}/api/opportunities`;
  }

  const response = await fetch(url);
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
      province: item.province || extra.province || '',
      location: item.location || extra.location || '',
      closing_date: item.closing_date || extra.closing_date || extra.deadline || extra.last_date || '',
      status: item.status || extra.status || '',
      url: item.url || extra.url || extra.link || extra.apply_url || '',
      extra_data: extra,
    };
  });

  if (status !== 'all') results = results.filter((item) => (item.status || '').toLowerCase() === status.toLowerCase());
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
  // Province is often stored inside extra_data by scrapers.
  const { data, error } = await supabase.from('opportunities').select('*');
  if (error) throw error;
  const values = data.flatMap((row) => {
    const extra = row.extra_data || {};
    return [row.province, extra.province].filter(Boolean);
  });
  return Array.from(new Set(values.map((v) => String(v).trim()).filter(Boolean))).sort();
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
