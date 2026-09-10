import {
  getOpportunitiesSupabase,
  getOpportunityByIdSupabase,
  searchOpportunitiesSupabase,
  submitOpportunitySupabase,
  getProvincesSupabase,
  getCategoryStatsSupabase,
} from './opportunitiesSupabase';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getOpportunities(filters = {}) {
  try { return await getOpportunitiesSupabase(filters); }
  catch (e) { console.error('FastAPI opportunities fetch error:', e); throw new Error('Failed to fetch opportunities from the backend. Please make sure the FastAPI server is running.'); }
}

export async function getOpportunityById(id) {
  try { return await getOpportunityByIdSupabase(id); }
  catch (e) { console.error('Get opportunity by ID error:', e); return null; }
}

export async function searchOpportunities(keyword) {
  try { return await searchOpportunitiesSupabase(keyword); }
  catch (e) { console.error('Search opportunities error:', e); return []; }
}

export async function submitOpportunity(data) {
  if (!data || !data.name?.trim() || !data.category?.trim() || !data.apply_link?.trim()) {
    throw new Error('Opportunity name, category and apply link are required.');
  }

  try {
    return await submitOpportunitySupabase(data);
  } catch (e) {
    console.error('Submit opportunity error:', e);
    throw e;
  }
}

export async function askChatbot(question) {
  await delay(200);
  if (!question || !question.trim()) return { answer: 'Please enter a question about Pakistani government opportunities.', relatedOpportunities: [] };
  const q = question.toLowerCase();
  let liveOpps = [];
  try { liveOpps = await getOpportunitiesSupabase({}); } catch (err) { console.error('Chatbot opportunity fetch error:', err); }
  const matchedOpps = liveOpps.filter((item) => {
    const extra = item.extra_data || {};
    const title = String(item.title || extra.title || '').toLowerCase();
    const desc = String(item.description || extra.description || '').toLowerCase();
    const cat = String(item.category || '').toLowerCase();
    const org = String(item.organization || extra.organization || extra.company || '').toLowerCase();
    return ((q.includes('loan') && cat === 'loan') || (q.includes('scholarship') && cat === 'scholarship') || (q.includes('job') && cat === 'job') || (q.includes('internship') && cat === 'internship') || (q.includes('training') && cat === 'training') || (q.includes('project') && cat === 'project') || (q.includes('navttc') && org.includes('navttc')) || (q.includes('nadra') && org.includes('nadra')) || (q.includes('hec') && (org.includes('hec') || title.includes('hec'))) || title.split(' ').some((word) => word.length > 3 && q.includes(word)) || desc.includes(q));
  }).slice(0, 3);
  let answer = `Here is what I found regarding your query "${question}":\n\nYou can browse Jobs, Scholarships, Loans, Training, Internships and Projects in the Citizen Portal.`;
  if (q.includes('loan')) answer = '💰 **Loans**\n\nBrowse available government-backed loan opportunities and their eligibility and deadlines.';
  else if (q.includes('scholarship')) answer = '🎓 **Scholarships**\n\nBrowse current scholarship opportunities and check eligibility, deadlines and application links.';
  else if (q.includes('internship')) answer = '💼 **Internships**\n\nBrowse internship programs for students and fresh graduates.';
  else if (q.includes('training')) answer = '🛠️ **Training Programs**\n\nBrowse technical, IT, vocational and professional training opportunities.';
  else if (q.includes('project')) answer = '📁 **Projects**\n\nBrowse public-sector and development project opportunities.';
  return { answer, relatedOpportunities: matchedOpps };
}

export async function getProvinces() {
  try { return await getProvincesSupabase(); } catch (e) { console.error('Get provinces error:', e); return []; }
}

export async function getCategoryStats() {
  try { return await getCategoryStatsSupabase(); } catch (e) { console.error('Get category stats error:', e); return []; }
}
