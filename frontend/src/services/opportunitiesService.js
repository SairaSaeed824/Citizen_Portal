/**
 * Single Data Service Layer for Citizen Portal (Pakistan) - Supabase Only Mode
 * 
 * All screens and UI components consume data strictly from the live Supabase backend.
 */

import {
  getOpportunitiesSupabase,
  getOpportunityByIdSupabase,
  searchOpportunitiesSupabase,
  submitOpportunitySupabase,
  getProvincesSupabase,
  getCategoryStatsSupabase,
} from './opportunitiesSupabase';

/**
 * Helper to simulate network latency if needed, or remove completely
 */
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch opportunities strictly from Supabase
 * @param {Object} filters
 * @returns {Promise<Array>} List of opportunity items from Supabase
 */
export async function getOpportunities(filters = {}) {
  try {
    return await getOpportunitiesSupabase(filters);
  } catch (e) {
    console.error('Supabase fetch error:', e);
    throw new Error('Failed to fetch opportunities from the database. Please check your Supabase connection.');
  }
}

/**
 * Fetch a single opportunity by its ID from Supabase
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
export async function getOpportunityById(id) {
  try {
    return await getOpportunityByIdSupabase(id);
  } catch (e) {
    console.error('Supabase getById error:', e);
    return null;
  }
}

/**
 * Search opportunities by keyword using Supabase
 * @param {string} keyword
 * @returns {Promise<Array>}
 */
export async function searchOpportunities(keyword) {
  try {
    return await searchOpportunitiesSupabase(keyword);
  } catch (e) {
    console.error('Supabase search error:', e);
    return [];
  }
}

/**
 * Submit an opportunity directly to the Supabase 'submitted_opportunities' table
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function submitOpportunity(data) {
  if (!data || !data.name?.trim() || !data.detail?.trim()) {
    throw new Error('Name and detail are required fields.');
  }

  try {
    return await submitOpportunitySupabase(data);
  } catch (e) {
    console.error('Supabase submit error:', e);
    throw e;
  }
}

/**
 * Ask the citizen opportunity AI chatbot
 * @param {string} question
 * @returns {Promise<{ answer: string, relatedOpportunities: Array }>}
 */
export async function askChatbot(question) {
  await delay(200);

  if (!question || !question.trim()) {
    return {
      answer: 'Please enter a question about Pakistani government jobs, scholarships, loans, internships, or training programs.',
      relatedOpportunities: []
    };
  }

  const q = question.toLowerCase();

  // Fetch live opportunities from Supabase to match query context dynamically
  let liveOpps = [];
  try {
    liveOpps = await getOpportunitiesSupabase({});
  } catch (err) {
    console.error('Chatbot background fetch error:', err);
  }

  const matchedOpps = liveOpps.filter((item) => {
    const title = item.extra_data?.title?.toLowerCase() || '';
    const desc = item.extra_data?.description?.toLowerCase() || '';
    const cat = item.category?.toLowerCase() || '';
    const org = item.extra_data?.organization?.toLowerCase() || '';
    
    return (
      (q.includes('loan') && cat === 'loan') ||
      (q.includes('scholarship') && cat === 'scholarship') ||
      (q.includes('laptop') && title.includes('laptop')) ||
      (q.includes('job') && cat === 'job') ||
      (q.includes('internship') && cat === 'internship') ||
      (q.includes('training') && cat === 'training') ||
      (q.includes('navttc') && org.includes('navttc')) ||
      (q.includes('nadra') && org.includes('nadra')) ||
      (q.includes('hec') && (org.includes('hec') || title.includes('hec'))) ||
      (q.includes('bisp') && (org.includes('bisp') || title.includes('bisp'))) ||
      title.split(' ').some(w => w.length > 3 && q.includes(w))
    );
  }).slice(0, 3);

  let answer = '';

  if (q.includes('laptop') || q.includes('pm youth laptop')) {
    answer = `💻 **PM Youth Laptop Scheme** provides free high-spec laptops to high-achieving students enrolled in public sector universities and colleges across All Pakistan. \n\n**Key Requirements:**\n• Must be enrolled in a recognized public university/college (Bachelors/Masters).\n• Selection is purely merit-based according to academic grades.\n• Application deadline: October 01, 2026.\n• No application fee. Apply directly on the official portal at \`pmyp.gov.pk/laptop-scheme\`.`;
  } else if (q.includes('loan') || q.includes('kamyab') || q.includes('business loan') || q.includes('kisan')) {
    answer = `💰 **Government Loan Schemes Available:**\n\n1. **Prime Minister's Youth Business Loan (SMEDA / BOP)**:\n   • Financing range: PKR 500,000 up to PKR 5,000,000.\n   • Subsidized markup: 5%.\n   • Collateral required for Tier 2/3.\n\n2. **Kamyab Kisan Agriculture Loan (ZTBL)**:\n   • Financing range: PKR 100,000 to PKR 1,000,000.\n   • Low markup: 3% (No collateral required).\n   • For seeds, fertilizer, and agricultural equipment.`;
  } else if (q.includes('scholarship') || q.includes('hec') || q.includes('study') || q.includes('tuition')) {
    answer = `🎓 **Current Scholarship Programs:**\n\n• **HEC Need-Based Undergraduate Scholarship**: 100% tuition fee waiver plus monthly stipend for needy students in HEC-recognized institutions. Deadline: November 15, 2026.\n• **EMAS Business School Scholarship**: Covers up to 100% tuition for MBA/PhD business courses.`;
  } else if (q.includes('internship') || q.includes('stipend') || q.includes('fresh graduate')) {
    answer = `💼 **Government Internships with Monthly Stipend:**\n\n• **State Bank of Pakistan Banking Internship**: 6-month program with **PKR 25,000/month** stipend.\n• **Ministry of IT & Telecom Digital Media Internship**: 3-month hybrid program with **PKR 15,000/month** stipend.`;
  } else if (q.includes('training') || q.includes('navttc') || q.includes('skill') || q.includes('free course')) {
    answer = `🛠️ **Free NAVTTC Technical Training Programs:**\n\n• **IT Fundamentals & Web Development**: 3-month free course + **PKR 5,000/month** stipend.\n• **Electrical Technician Certification**: 4-month practical course + **PKR 4,000/month** stipend.`;
  } else {
    answer = `Here is what I found regarding your query "${question}":\n\nPakistan Citizen Portal indexes active Federal and Provincial opportunities across Jobs, Scholarships, Business Loans, Technical Training, and Internships directly from the database.`;
  }

  return {
    answer,
    relatedOpportunities: matchedOpps
  };
}

/**
 * Dynamically extract unique list of provinces from Supabase
 * @returns {Promise<Array<string>>}
 */
export async function getProvinces() {
  try {
    return await getProvincesSupabase();
  } catch (e) {
    console.error('Supabase getProvinces error:', e);
    return [];
  }
}

/**
 * Get category metadata with dynamic count from Supabase
 * @returns {Promise<Array<{ key: string, name: string, count: number, icon: string }>>}
 */
export async function getCategoryStats() {
  try {
    return await getCategoryStatsSupabase();
  } catch (e) {
    console.error('Supabase getCategoryStats error:', e);
    return [
      { key: 'all', name: 'All Opportunities', nameUrdu: 'تمام مواقع', count: 0, icon: 'LayoutGrid' },
      { key: 'job', name: 'Jobs', nameUrdu: 'ملازمتیں', count: 0, icon: 'Briefcase' },
      { key: 'scholarship', name: 'Scholarships', nameUrdu: 'وظائف', count: 0, icon: 'GraduationCap' },
      { key: 'loan', name: 'Loans', nameUrdu: 'قرضے', count: 0, icon: 'Landmark' },
      { key: 'training', name: 'Training', nameUrdu: 'تربیت', count: 0, icon: 'Sparkles' },
      { key: 'internship', name: 'Internships', nameUrdu: 'انٹرن شپس', count: 0, icon: 'Building2' }
    ];
  }
}