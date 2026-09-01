/**
 * Single Data Service Layer for Citizen Portal (Pakistan)
 * 
 * Screens and UI components MUST ONLY consume data through these service functions.
 * When switching from mock data to a real REST API endpoint (e.g. `/api/v1/opportunities`),
 * only the implementation inside this file needs to be modified.
 */

import mockData from '../data/mock-opportunities.json';

// In-memory cache & custom submissions holder
let opportunitiesStore = [...mockData.opportunities];
let customSubmissions = [];

/**
 * Helper to simulate network latency for realistic UX feel
 */
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch opportunities with optional filtering and search parameters
 * @param {Object} filters
 * @param {string} [filters.category] - 'job' | 'scholarship' | 'loan' | 'training' | 'internship' | 'all'
 * @param {string} [filters.province] - e.g. 'Punjab', 'Sindh', 'All Pakistan', or 'all'
 * @param {string} [filters.keyword] - Search term matching title or description
 * @param {string} [filters.status] - 'active' | 'expired' | 'all'
 * @param {string} [filters.sortBy] - 'newest' | 'closing_soon' | 'title'
 * @returns {Promise<Array>} List of opportunity items
 */
export async function getOpportunities(filters = {}) {
  await delay(120);

  const {
    category = 'all',
    province = 'all',
    keyword = '',
    status = 'all',
    sortBy = 'default'
  } = filters;

  let results = [...opportunitiesStore];

  // Category filter
  if (category && category !== 'all') {
    results = results.filter(
      (item) => item.category?.toLowerCase() === category.toLowerCase()
    );
  }

  // Province filter
  if (province && province !== 'all') {
    results = results.filter((item) => {
      const itemProv = item.extra_data?.province?.toLowerCase() || '';
      const targetProv = province.toLowerCase();
      if (targetProv === 'all pakistan') {
        return itemProv === 'all pakistan';
      }
      return itemProv === targetProv || itemProv === 'all pakistan';
    });
  }

  // Status filter
  if (status && status !== 'all') {
    results = results.filter(
      (item) => item.extra_data?.status?.toLowerCase() === status.toLowerCase()
    );
  }

  // Keyword search
  if (keyword && keyword.trim() !== '') {
    const term = keyword.toLowerCase().trim();
    results = results.filter((item) => {
      const title = item.extra_data?.title?.toLowerCase() || '';
      const org = item.extra_data?.organization?.toLowerCase() || '';
      const desc = item.extra_data?.description?.toLowerCase() || '';
      const prov = item.extra_data?.province?.toLowerCase() || '';
      const cat = item.category?.toLowerCase() || '';
      
      // Also search in any dynamic string extra fields
      const extraVals = Object.values(item.extra_data || {})
        .filter(v => typeof v === 'string')
        .map(v => v.toLowerCase())
        .join(' ');

      return (
        title.includes(term) ||
        org.includes(term) ||
        desc.includes(term) ||
        prov.includes(term) ||
        cat.includes(term) ||
        extraVals.includes(term)
      );
    });
  }

  // Sorting
  if (sortBy === 'closing_soon') {
    results.sort((a, b) => {
      const dateA = new Date(a.extra_data?.closing_date || '9999-12-31');
      const dateB = new Date(b.extra_data?.closing_date || '9999-12-31');
      return dateA - dateB;
    });
  } else if (sortBy === 'title') {
    results.sort((a, b) => {
      const titleA = a.extra_data?.title || '';
      const titleB = b.extra_data?.title || '';
      return titleA.localeCompare(titleB);
    });
  }

  return results;
}

/**
 * Fetch a single opportunity by its ID
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
export async function getOpportunityById(id) {
  await delay(80);
  const numId = Number(id);
  const found = opportunitiesStore.find((item) => item.id === numId);
  return found ? { ...found } : null;
}

/**
 * Search opportunities by keyword
 * @param {string} keyword
 * @returns {Promise<Array>}
 */
export async function searchOpportunities(keyword) {
  return getOpportunities({ keyword });
}

/**
 * Submit a missing opportunity (matches submitted_opportunities table: name, detail)
 * @param {Object} data
 * @param {string} data.name - Submitter name or opportunity title
 * @param {string} data.detail - Description, source link, or details
 * @returns {Promise<Object>}
 */
export async function submitOpportunity(data) {
  await delay(250);

  if (!data || !data.name?.trim() || !data.detail?.trim()) {
    throw new Error('Name and detail are required fields.');
  }

  const submission = {
    id: Date.now(),
    name: data.name.trim(),
    detail: data.detail.trim(),
    submitted_at: new Date().toISOString(),
    status: 'pending_review'
  };

  customSubmissions.push(submission);

  return {
    success: true,
    message: 'Thank you! Your opportunity submission has been received and queued for verification.',
    data: submission
  };
}

/**
 * Ask the citizen opportunity AI chatbot
 * Questions are independent (no conversation history needed)
 * @param {string} question
 * @returns {Promise<{ answer: string, relatedOpportunities: Array }>}
 */
export async function askChatbot(question) {
  await delay(350);

  if (!question || !question.trim()) {
    return {
      answer: 'Please enter a question about Pakistani government jobs, scholarships, loans, internships, or training programs.',
      relatedOpportunities: []
    };
  }

  const q = question.toLowerCase();

  // Find potentially matching opportunities based on query keywords
  const matchedOpps = opportunitiesStore.filter((item) => {
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

  // Contextual smart response generation based on common citizen inquiries
  let answer = '';

  if (q.includes('laptop') || q.includes('pm youth laptop')) {
    answer = `💻 **PM Youth Laptop Scheme** provides free high-spec laptops to high-achieving students enrolled in public sector universities and colleges across All Pakistan. 

**Key Requirements:**
• Must be enrolled in a recognized public university/college (Bachelors/Masters).
• Selection is purely merit-based according to academic grades.
• Application deadline: October 01, 2026.
• No application fee. Apply directly on the official portal at \`pmyp.gov.pk/laptop-scheme\`.`;
  } else if (q.includes('loan') || q.includes('kamyab') || q.includes('business loan') || q.includes('kisan')) {
    answer = `💰 **Government Loan Schemes Available:**

1. **Prime Minister's Youth Business Loan (SMEDA / BOP)**:
   • Financing range: PKR 500,000 up to PKR 5,000,000.
   • Subsidized markup: 5%.
   • Collateral required for Tier 2/3.

2. **Kamyab Kisan Agriculture Loan (ZTBL)**:
   • Financing range: PKR 100,000 to PKR 1,000,000.
   • Low markup: 3% (No collateral required).
   • For seeds, fertilizer, and agricultural equipment.

Both schemes can be applied for via their respective bank and official portal links listed on this portal.`;
  } else if (q.includes('scholarship') || q.includes('hec') || q.includes('study') || q.includes('tuition')) {
    answer = `🎓 **Current Scholarship Programs:**

• **HEC Need-Based Undergraduate Scholarship**: 100% tuition fee waiver plus monthly stipend for needy students in HEC-recognized institutions. Deadline: November 15, 2026.
• **EMAS Business School Scholarship**: Covers up to 100% tuition for MBA/PhD business courses. Deadline: September 10, 2026.

All scholarships are awarded transparently through official academic verification.`;
  } else if (q.includes('internship') || q.includes('stipend') || q.includes('fresh graduate')) {
    answer = `💼 **Government Internships with Monthly Stipend:**

• **State Bank of Pakistan Banking Internship**: 6-month program with **PKR 25,000/month** stipend (20 seats in Sindh/Karachi).
• **Ministry of IT & Telecom Digital Media Internship**: 3-month hybrid program with **PKR 15,000/month** stipend (Islamabad).

Both provide hands-on public sector experience and completion certificates.`;
  } else if (q.includes('training') || q.includes('navttc') || q.includes('skill') || q.includes('free course')) {
    answer = `🛠️ **Free NAVTTC Technical Training Programs:**

• **IT Fundamentals & Web Development**: 3-month free course + **PKR 5,000/month** stipend (Punjab).
• **Electrical Technician Certification**: 4-month practical course + **PKR 4,000/month** stipend (KPK).

Both programs include official government certification and toolkits upon graduation.`;
  } else if (q.includes('job') || q.includes('njp') || q.includes('nadra') || q.includes('bisp')) {
    answer = `🏛️ **Federal & Provincial Govt Jobs:**

Current verified vacancies include **Assistant Director IT at NADRA** (Punjab), **Field Officer at BISP** (Sindh, 10 vacancies), and **Company Secretary at Telecom Foundation** (Islamabad). 

All job applications redirect directly to the official **National Job Portal (njp.gov.pk)** or designated agency websites.`;
  } else if (q.includes('how to apply') || q.includes('procedure') || q.includes('apply')) {
    answer = `ℹ️ **How to Apply for Opportunities on this Portal:**

1. Browse or search for any opportunity using the search filters.
2. Click on the opportunity card to read full eligibility criteria and details.
3. Click the orange **"Apply Now"** button — you will be safely redirected to the official government portal (e.g. NJP, HEC, NAVTTC, PMYP).
4. No account or login is needed on this portal — it is 100% free and open for all Pakistani citizens.`;
  } else {
    answer = `Here is what I found regarding your query "${question}":

Pakistan Citizen Portal indexes active Federal and Provincial opportunities across Jobs, Scholarships, Business Loans, Technical Training, and Internships.

You can filter by category or province above, or explore the related opportunities below for exact closing dates and direct application links.`;
  }

  return {
    answer,
    relatedOpportunities: matchedOpps
  };
}

/**
 * Dynamically extract unique list of provinces from available data
 * @returns {Promise<Array<string>>}
 */
export async function getProvinces() {
  await delay(50);
  const provinces = new Set();
  opportunitiesStore.forEach((item) => {
    if (item.extra_data?.province) {
      provinces.add(item.extra_data.province);
    }
  });
  return Array.from(provinces).sort();
}

/**
 * Get category metadata with dynamic count of available listings
 * @returns {Promise<Array<{ key: string, name: string, count: number, icon: string }>>}
 */
export async function getCategoryStats() {
  await delay(50);
  const counts = {
    job: 0,
    scholarship: 0,
    loan: 0,
    training: 0,
    internship: 0
  };

  opportunitiesStore.forEach((item) => {
    const cat = item.category?.toLowerCase();
    if (counts[cat] !== undefined) {
      counts[cat]++;
    }
  });

  return [
    { key: 'all', name: 'All Opportunities', nameUrdu: 'تمام مواقع', count: opportunitiesStore.length, icon: 'LayoutGrid' },
    { key: 'job', name: 'Jobs', nameUrdu: 'ملازمتیں', count: counts.job, icon: 'Briefcase' },
    { key: 'scholarship', name: 'Scholarships', nameUrdu: 'وظائف', count: counts.scholarship, icon: 'GraduationCap' },
    { key: 'loan', name: 'Loans', nameUrdu: 'قرضے', count: counts.loan, icon: 'Landmark' },
    { key: 'training', name: 'Training', nameUrdu: 'تربیت', count: counts.training, icon: 'Sparkles' },
    { key: 'internship', name: 'Internships', nameUrdu: 'انٹرن شپس', count: counts.internship, icon: 'Building2' }
  ];
}
