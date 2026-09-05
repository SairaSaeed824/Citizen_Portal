/**
 * Single Data Service Layer for Citizen Portal (Pakistan)
 *
 * All opportunity listing data is fetched through:
 *
 * Frontend → FastAPI → Supabase
 *
 * Other operations can still use Supabase directly
 * until their FastAPI endpoints are created.
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
 * Helper to simulate network latency if needed
 */
const delay = (ms = 100) =>
  new Promise((resolve) => setTimeout(resolve, ms));


/**
 * Fetch opportunities.
 *
 * Flow:
 * Frontend → FastAPI → Supabase
 *
 * @param {Object} filters
 * @returns {Promise<Array>}
 */
export async function getOpportunities(filters = {}) {
  try {
    return await getOpportunitiesSupabase(filters);
  } catch (e) {
    console.error('FastAPI opportunities fetch error:', e);

    throw new Error(
      'Failed to fetch opportunities from the backend. Please make sure the FastAPI server is running.'
    );
  }
}


/**
 * Fetch a single opportunity by ID.
 *
 * Currently uses Supabase directly.
 * This can later be changed to:
 *
 * GET /api/opportunities/{id}
 *
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
export async function getOpportunityById(id) {
  try {
    return await getOpportunityByIdSupabase(id);
  } catch (e) {
    console.error('Get opportunity by ID error:', e);
    return null;
  }
}


/**
 * Search opportunities by keyword.
 *
 * @param {string} keyword
 * @returns {Promise<Array>}
 */
export async function searchOpportunities(keyword) {
  try {
    return await searchOpportunitiesSupabase(keyword);
  } catch (e) {
    console.error('Search opportunities error:', e);
    return [];
  }
}


/**
 * Submit an opportunity.
 *
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function submitOpportunity(data) {
  if (
    !data ||
    !data.name?.trim() ||
    !data.detail?.trim()
  ) {
    throw new Error(
      'Name and detail are required fields.'
    );
  }

  try {
    return await submitOpportunitySupabase(data);
  } catch (e) {
    console.error('Submit opportunity error:', e);
    throw e;
  }
}


/**
 * Ask the citizen opportunity AI chatbot.
 *
 * @param {string} question
 * @returns {Promise<{
 *   answer: string,
 *   relatedOpportunities: Array
 * }>}
 */
export async function askChatbot(question) {
  await delay(200);

  if (!question || !question.trim()) {
    return {
      answer:
        'Please enter a question about Pakistani government jobs, scholarships, loans, internships, or training programs.',
      relatedOpportunities: [],
    };
  }

  const q = question.toLowerCase();

  /*
   * Fetch live opportunities through FastAPI.
   *
   * Previously this used Supabase directly.
   */
  let liveOpps = [];

  try {
    liveOpps = await getOpportunitiesSupabase({
      category: 'job',
    });
  } catch (err) {
    console.error(
      'Chatbot opportunity fetch error:',
      err
    );
  }

  /**
   * Match opportunities with the user's question.
   */
  const matchedOpps = liveOpps
    .filter((item) => {
      const extra = item.extra_data || {};

      const title = (
        item.title ||
        extra.title ||
        ''
      ).toLowerCase();

      const desc = (
        item.description ||
        extra.description ||
        ''
      ).toLowerCase();

      const cat = (
        item.category ||
        ''
      ).toLowerCase();

      const org = (
        item.organization ||
        extra.organization ||
        extra.company ||
        ''
      ).toLowerCase();

      return (
        (q.includes('loan') &&
          cat === 'loan') ||

        (q.includes('scholarship') &&
          cat === 'scholarship') ||

        (q.includes('laptop') &&
          title.includes('laptop')) ||

        (q.includes('job') &&
          cat === 'job') ||

        (q.includes('internship') &&
          cat === 'internship') ||

        (q.includes('training') &&
          cat === 'training') ||

        (q.includes('navttc') &&
          org.includes('navttc')) ||

        (q.includes('nadra') &&
          org.includes('nadra')) ||

        (q.includes('hec') &&
          (
            org.includes('hec') ||
            title.includes('hec')
          )) ||

        (q.includes('bisp') &&
          (
            org.includes('bisp') ||
            title.includes('bisp')
          )) ||

        title
          .split(' ')
          .some(
            (word) =>
              word.length > 3 &&
              q.includes(word)
          ) ||

        desc.includes(q)
      );
    })
    .slice(0, 3);


  /**
   * Generate chatbot response.
   */
  let answer = '';


  if (
    q.includes('laptop') ||
    q.includes('pm youth laptop')
  ) {
    answer = `💻 **PM Youth Laptop Scheme**

The PM Youth Laptop Scheme provides laptops to eligible students in Pakistan.

**Key Requirements:**
• Must be enrolled in an eligible recognized institution.
• Selection is generally merit-based.
• Check the official portal for the current application deadline.
• No application fee should be required for the official application.

Please verify the latest eligibility and deadline from the official government portal.`;

  } else if (
    q.includes('loan') ||
    q.includes('kamyab') ||
    q.includes('business loan') ||
    q.includes('kisan')
  ) {
    answer = `💰 **Government Loan Schemes**

Pakistan has several government-backed financing programs for youth, businesses, and agriculture.

You can use the Citizen Portal to browse available **Loan** opportunities and check their eligibility, deadline, and application information.`;

  } else if (
    q.includes('scholarship') ||
    q.includes('hec') ||
    q.includes('study') ||
    q.includes('tuition')
  ) {
    answer = `🎓 **Scholarships**

The Citizen Portal lists scholarship opportunities from government organizations and educational institutions.

You can browse the **Scholarships** section to check eligibility, deadlines, organizations, and application links.`;

  } else if (
    q.includes('internship') ||
    q.includes('stipend') ||
    q.includes('fresh graduate')
  ) {
    answer = `💼 **Internships**

The Citizen Portal lists internship opportunities for students and fresh graduates.

Check the **Internships** category for current programs, eligibility requirements, organizations, deadlines, and application links.`;

  } else if (
    q.includes('training') ||
    q.includes('navttc') ||
    q.includes('skill') ||
    q.includes('free course')
  ) {
    answer = `🛠️ **Training Programs**

You can find government and public-sector skill development programs in the **Training** section.

NAVTTC and other organizations may offer technical, IT, vocational, and professional training programs.`;

  } else {
    answer = `Here is what I found regarding your query "${question}":

Pakistan Citizen Portal indexes opportunities across:

• Jobs
• Scholarships
• Business Loans
• Technical Training
• Internships

You can browse the available opportunities and use the search and category filters to find relevant programs.`;
  }


  return {
    answer,
    relatedOpportunities: matchedOpps,
  };
}


/**
 * Get unique provinces.
 *
 * Currently uses Supabase directly.
 * Later this can be moved to FastAPI.
 *
 * @returns {Promise<Array<string>>}
 */
export async function getProvinces() {
  try {
    return await getProvincesSupabase();
  } catch (e) {
    console.error(
      'Get provinces error:',
      e
    );

    return [];
  }
}


/**
 * Get category statistics.
 *
 * Currently uses Supabase directly.
 * Later this can be moved to FastAPI.
 *
 * @returns {Promise<Array>}
 */
export async function getCategoryStats() {
  try {
    return await getCategoryStatsSupabase();
  } catch (e) {
    console.error(
      'Get category stats error:',
      e
    );

    return [
      {
        key: 'all',
        name: 'All Opportunities',
        nameUrdu: 'تمام مواقع',
        count: 0,
        icon: 'LayoutGrid',
      },

      {
        key: 'job',
        name: 'Jobs',
        nameUrdu: 'ملازمتیں',
        count: 0,
        icon: 'Briefcase',
      },

      {
        key: 'scholarship',
        name: 'Scholarships',
        nameUrdu: 'وظائف',
        count: 0,
        icon: 'GraduationCap',
      },

      {
        key: 'loan',
        name: 'Loans',
        nameUrdu: 'قرضے',
        count: 0,
        icon: 'Landmark',
      },

      {
        key: 'training',
        name: 'Training',
        nameUrdu: 'تربیت',
        count: 0,
        icon: 'Sparkles',
      },

      {
        key: 'internship',
        name: 'Internships',
        nameUrdu: 'انٹرن شپس',
        count: 0,
        icon: 'Building2',
      },
    ];
  }
}