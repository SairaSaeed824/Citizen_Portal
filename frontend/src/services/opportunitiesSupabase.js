import { supabase } from './supabaseClient';

/**
 * FastAPI backend URL
 */
const API_BASE_URL = 'http://127.0.0.1:8000';


/**
 * Fetch opportunities from FastAPI.
 *
 * Frontend
 *    ↓
 * FastAPI
 *    ↓
 * Supabase
 *
 * Supported filters:
 * category, province, keyword, status, sortBy
 *
 * category:
 * all          -> all categories
 * job
 * scholarship
 * loan
 * training
 * internship
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
    /*
     * Build query parameters
     */
    const params = new URLSearchParams();

    /*
     * Only send category when a specific category
     * has been selected.
     *
     * For "all", no category parameter is sent.
     *
     * Result:
     * /api/opportunities
     *
     * Instead of:
     * /api/opportunities?category=job
     */
    if (category && category !== 'all') {
      params.append('category', category);
    }

    const queryString = params.toString();

    const url = queryString
      ? `${API_BASE_URL}/api/opportunities?${queryString}`
      : `${API_BASE_URL}/api/opportunities`;

    console.log('Fetching opportunities from:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `FastAPI request failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    console.log('FastAPI response:', result);

    /*
     * FastAPI response:
     *
     * {
     *   success: true,
     *   category: "all",
     *   count: 100,
     *   data: [...]
     * }
     */
    let results = result.data || [];

    /*
     * Normalize opportunity data
     */
    results = results.map((item) => {
      const extra = item.extra_data || {};

      return {
        ...item,

        id: item.id,

        category:
          item.category ||
          extra.category ||
          category ||
          'job',

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

        province:
          item.province ||
          extra.province ||
          '',

        location:
          item.location ||
          extra.location ||
          '',

        closing_date:
          item.closing_date ||
          extra.closing_date ||
          extra.deadline ||
          extra.last_date ||
          '',

        status:
          item.status ||
          extra.status ||
          '',

        url:
          item.url ||
          extra.url ||
          extra.link ||
          extra.apply_url ||
          '',

        /*
         * Keep the complete extra_data object.
         *
         * This is important because your frontend
         * dynamically displays fields from extra_data.
         */
        extra_data: extra,
      };
    });


    /*
     * Province filter
     */
    if (province && province !== 'all') {
      const target = province.toLowerCase().trim();

      results = results.filter((item) => {
        const prov = (
          item.province ||
          item.location ||
          ''
        ).toLowerCase().trim();

        /*
         * If All Pakistan is selected,
         * only match All Pakistan.
         */
        if (target === 'all pakistan') {
          return prov === 'all pakistan';
        }

        /*
         * Specific province/location.
         *
         * Also keep All Pakistan opportunities.
         */
        return (
          prov === target ||
          prov.includes(target) ||
          prov === 'all pakistan'
        );
      });
    }


    /*
     * Status filter
     */
    if (status && status !== 'all') {
      results = results.filter((item) => {
        return (
          item.status &&
          item.status.toLowerCase() ===
            status.toLowerCase()
        );
      });
    }


    /*
     * Keyword search
     */
    if (keyword && keyword.trim() !== '') {
      const term = keyword.toLowerCase().trim();

      results = results.filter((item) => {
        const searchable = [
          item.title,
          item.organization,
          item.description,
          item.province,
          item.location,
          item.category,
          item.status,
          item.closing_date,
          JSON.stringify(item.extra_data || {}),
        ]
          .join(' ')
          .toLowerCase();

        return searchable.includes(term);
      });
    }


    /*
     * Sorting
     */
    if (sortBy === 'closing_soon') {
      results.sort((a, b) => {
        return (
          new Date(
            a.closing_date || '9999-12-31'
          ) -
          new Date(
            b.closing_date || '9999-12-31'
          )
        );
      });
    }

    else if (sortBy === 'title') {
      results.sort((a, b) => {
        return (a.title || '').localeCompare(
          b.title || ''
        );
      });
    }


    console.log(
      `Total opportunities after frontend filters: ${results.length}`
    );

    return results;

  } catch (error) {
    console.error(
      'Error fetching opportunities from FastAPI:',
      error
    );

    throw error;
  }
}


/**
 * Fetch a single opportunity by ID.
 *
 * Currently this still uses Supabase directly.
 */
export async function getOpportunityByIdSupabase(id) {
  const {
    data,
    error,
  } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', Number(id))
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}


/**
 * Search opportunities.
 *
 * Search currently goes through FastAPI.
 */
export async function searchOpportunitiesSupabase(keyword) {
  return getOpportunitiesSupabase({
    keyword,
    category: 'job',
  });
}


/**
 * Submit an opportunity.
 *
 * This still uses Supabase directly for now.
 */
export async function submitOpportunitySupabase(payload) {
  const {
    data,
    error,
  } = await supabase
    .from('submitted_jobs')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    success: true,
    message: 'Submission recorded',
    data,
  };
}


/**
 * Get unique provinces.
 *
 * Still using Supabase directly for now.
 */
export async function getProvincesSupabase() {
  const {
    data,
    error,
  } = await supabase
    .from('opportunities')
    .select('province')
    .neq('province', null);

  if (error) {
    throw error;
  }

  const set = new Set(
    data.map((row) => row.province)
  );

  return Array.from(set).sort();
}


/**
 * Get category statistics.
 *
 * Still using Supabase directly for now.
 */
export async function getCategoryStatsSupabase() {
  const {
    data,
    error,
  } = await supabase
    .from('opportunities')
    .select('category');

  if (error) {
    throw error;
  }

  const counts = {
    job: 0,
    scholarship: 0,
    loan: 0,
    training: 0,
    internship: 0,
  };

  data.forEach((item) => {
    const category =
      item.category?.toLowerCase();

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
      icon: 'LayoutGrid',
    },

    {
      key: 'job',
      name: 'Jobs',
      nameUrdu: 'ملازمتیں',
      count: counts.job,
      icon: 'Briefcase',
    },

    {
      key: 'scholarship',
      name: 'Scholarships',
      nameUrdu: 'وظائف',
      count: counts.scholarship,
      icon: 'GraduationCap',
    },

    {
      key: 'loan',
      name: 'Loans',
      nameUrdu: 'قرضے',
      count: counts.loan,
      icon: 'Landmark',
    },

    {
      key: 'training',
      name: 'Training',
      nameUrdu: 'تربیت',
      count: counts.training,
      icon: 'Sparkles',
    },

    {
      key: 'internship',
      name: 'Internships',
      nameUrdu: 'انٹرن شپس',
      count: counts.internship,
      icon: 'Building2',
    },
  ];
}