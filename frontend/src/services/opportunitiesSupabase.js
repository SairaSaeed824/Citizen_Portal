import { supabase } from './supabaseClient';

/**
 * Fetch opportunities using Supabase. Accepts same filter format as the mock service.
 */
export async function getOpportunitiesSupabase(filters = {}) {
  const { data, error } = await supabase.from('opportunities').select('*');
  if (error) throw error;
  let results = data;

  const {
    category = 'all',
    province = 'all',
    keyword = '',
    status = 'all',
    sortBy = 'default',
  } = filters;

  // Category filter
  if (category && category !== 'all') {
    results = results.filter((i) => i.category?.toLowerCase() === category.toLowerCase());
  }

  // Province filter
  if (province && province !== 'all') {
    results = results.filter((i) => {
      const prov = i.province?.toLowerCase() || '';
      const target = province.toLowerCase();
      if (target === 'all pakistan') return prov === 'all pakistan';
      return prov === target || prov === 'all pakistan';
    });
  }

  // Status filter (assumes a `status` column exists)
  if (status && status !== 'all') {
    results = results.filter((i) => i.status?.toLowerCase() === status.toLowerCase());
  }

  // Keyword search across several fields
  if (keyword && keyword.trim() !== '') {
    const term = keyword.toLowerCase().trim();
    results = results.filter((i) => {
      const searchable = [
        i.title,
        i.organization,
        i.description,
        i.province,
        i.category,
        ...Object.values(i).filter((v) => typeof v === 'string'),
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(term);
    });
  }

  // Sorting
  if (sortBy === 'closing_soon') {
    results.sort((a, b) => new Date(a.closing_date || '9999-12-31') - new Date(b.closing_date || '9999-12-31'));
  } else if (sortBy === 'title') {
    results.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }

  return results;
}

export async function getOpportunityByIdSupabase(id) {
  const { data, error } = await supabase.from('opportunities').select('*').eq('id', Number(id)).single();
  if (error && error.code !== 'PGRST116') throw error; // ignore not found
  return data || null;
}

export async function searchOpportunitiesSupabase(keyword) {
  return getOpportunitiesSupabase({ keyword });
}

export async function submitOpportunitySupabase(payload) {
  // Insert into submitted_jobs table (name, detail columns)
  const { data, error } = await supabase.from('submitted_jobs').insert([payload]);
  if (error) throw error;
  return { success: true, message: 'Submission recorded', data: data[0] };
}

export async function getProvincesSupabase() {
  const { data, error } = await supabase.from('opportunities').select('province').neq('province', null);
  if (error) throw error;
  const set = new Set(data.map((r) => r.province));
  return Array.from(set).sort();
}

export async function getCategoryStatsSupabase() {
  const { data, error } = await supabase.from('opportunities').select('category');
  if (error) throw error;
  const counts = { job: 0, scholarship: 0, loan: 0, training: 0, internship: 0 };
  data.forEach((i) => {
    const cat = i.category?.toLowerCase();
    if (counts[cat] !== undefined) counts[cat]++;
  });
  const total = data.length;
  return [
    { key: 'all', name: 'All Opportunities', nameUrdu: 'تمام مواقع', count: total, icon: 'LayoutGrid' },
    { key: 'job', name: 'Jobs', nameUrdu: 'ملازمتیں', count: counts.job, icon: 'Briefcase' },
    { key: 'scholarship', name: 'Scholarships', nameUrdu: 'وظائف', count: counts.scholarship, icon: 'GraduationCap' },
    { key: 'loan', name: 'Loans', nameUrdu: 'قرضے', count: counts.loan, icon: 'Landmark' },
    { key: 'training', name: 'Training', nameUrdu: 'تربیت', count: counts.training, icon: 'Sparkles' },
    { key: 'internship', name: 'Internships', nameUrdu: 'انٹرن شپس', count: counts.internship, icon: 'Building2' },
  ];
}
