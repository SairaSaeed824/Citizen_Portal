import { supabase } from './supabaseClient';

/**
 * FastAPI backend URL
 */
const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Fetch opportunities from FastAPI.
 *
 * Frontend → FastAPI → Supabase
 *
 * Supported filters: category, province, keyword, status, sortBy
 */
export async function getOpportunitiesSupabase(filters = {}) {
  const {
    category = 'all',
    province = 'all',
    keyword = '',
    status = 'all',
    sortBy = 'default',
  } = filters;

  try {
    const params = new URLSearchParams();

    if (category && category !== 'all') {
      params.append('category', category);
    }

    let url;

    if (keyword && keyword.trim() !== '') {
      params.append('q', keyword.trim());
      url = `${API_BASE_URL}/api/opportunities/search?${params}`;
    } else {
      const queryString = params.toString();
      url = queryString
        ? `${API_BASE_URL}/api/opportunities?${queryString}`
        : `${API_BASE_URL}/api/opportunities`;
    }

    console.log('Fetching opportunities from:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `FastAPI request failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log('FastAPI response:', result);

    let results = result.data || [];

    results = results.map((item) => {
      const extra = item.extra_data || {};

      return {
        ...item,
        id: item.id,
        category: item.category || extra.category || category || 'job',
        title:
          item.title ||
          extra.title ||
          extra.job_title ||
          extra.name ||
          'Untitled Opportunity',
        organization:
          item.organization ||
          extra.organization ||
          extra.company ||
          extra.department ||
          extra.ministry ||
          '',
        description:
          item.description ||
          extra.description ||
          extra.details ||
          extra.program_overview ||
          extra.overview ||
          extra.job_description ||
          '',
        province: item.province || extra.province || '',
        location: item.location || extra.location || '',
        closing_date:
          item.closing_date ||
          extra.closing_date ||
          extra.deadline ||
          extra.last_date ||
          '',
        status: item.status || extra.status || '',
        url: item.url || extra.url || extra.link || extra.apply_url || '',
        extra_data: extra,
      };
    });

    if (province && province !== 'all') {
      const target = province.toLowerCase().trim();

      results = results.filter((item) => {
        const prov = (item.province || item.location || '').toLowerCase().trim();

        if (target === 'all pakistan') {
          return prov === 'all pakistan';
        }

        return prov === target || prov.includes(target) || prov === 'all pakistan';
      });
    }

    if (status && status !== 'all') {
      results = results.filter(
        (item) => item.status && item.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (sortBy === 'closing_soon') {
      results.sort(
        (a, b) =>
          new Date(a.closing_date || '9999-12-31') -
          new Date(b.closing_date || '9999-12-31')
      );
    } else if (sortBy === 'title') {
      results.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    console.log(`Total opportunities after frontend filters: ${results.length}`);

    return results;
  } catch (error) {
    console.error('Error fetching opportunities from FastAPI:', error);
    throw error;
  }
}

export async function getOpportunityByIdSupabase(id) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', Number(id))
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}

export async function searchOpportunitiesSupabase(keyword, category = 'all') {
  return getOpportunitiesSupabase({ keyword, category });
}

export async function submitOpportunitySupabase(payload) {
  const response = await fetch(`${API_BASE_URL}/api/submitted-opportunities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Submission failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return {
    success: true,
    message: 'Submission recorded',
    data,
  };
}

export async function getProvincesSupabase() {
  const { data, error } = await supabase
    .from('opportunities')
    .select('province')
    .neq('province', null);

  if (error) {
    throw error;
  }

  const set = new Set(data.map((row) => row.province));

  return Array.from(set).sort();
}

/**
 * Get category statistics.
 * Includes all supported opportunity categories, including projects.
 */
export async function getCategoryStatsSupabase() {
  const { data, error } = await supabase.from('opportunities').select('category');

  if (error) {
    throw error;
  }

  const counts = {
    job: 0,
    scholarship: 0,
    loan: 0,
    training: 0,
    internship: 0,
    project: 0,
  };

  data.forEach((item) => {
    const category = item.category?.toLowerCase()?.trim();

    if (counts[category] !== undefined) {
      counts[category]++;
    }
  });

  const total = data.length;

  return [
    {
      key: 'all',
      name: 'All Opportunities',
      nameUrdu: 'تمام مواقع',
      count: total,
      icon: 'LayoutGrid'
    },
    {
      key: 'job',
      name: 'Jobs',
      nameUrdu: 'ملازمتیں',
      count: counts.job,
      icon: 'Briefcase'
    },
    {
      key: 'scholarship',
      name: 'Scholarships',
      nameUrdu: 'وظائف',
      count: counts.scholarship,
      icon: 'GraduationCap'
    },
    {
      key: 'loan',
      name: 'Loans',
      nameUrdu: 'قرضے',
      count: counts.loan,
      icon: 'Landmark'
    },
    {
      key: 'training',
      name: 'Training',
      nameUrdu: 'تربیت',
      count: counts.training,
      icon: 'Sparkles'
    },
    {
      key: 'internship',
      name: 'Internships',
      nameUrdu: 'انٹرن شپس',
      count: counts.internship,
      icon: 'Building2'
    },
    {
      key: 'project',
      name: 'Projects',
      nameUrdu: 'پروجیکٹس',
      count: counts.project,
      icon: 'FolderKanban'
    },
  ];
}
