import {
  getOpportunitiesSupabase,
  getOpportunityByIdSupabase,
  searchOpportunitiesSupabase,
  submitOpportunitySupabase,
  getProvincesSupabase,
  getCategoryStatsSupabase,
} from './opportunitiesSupabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

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
  const message = String(question || '').trim();
  if (!message) {
    return { answer: 'Please enter a question about Pakistani government opportunities.', relatedOpportunities: [], sources: [] };
  }

  const response = await fetch(`${API_BASE_URL}/api/chatbot/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, limit: 8 }),
  });

  if (!response.ok) {
    let detail = 'Chatbot request failed.';
    try {
      const errorBody = await response.json();
      detail = errorBody.detail || detail;
    } catch (_) {}
    throw new Error(detail);
  }

  return response.json();
}

export async function getProvinces() {
  try { return await getProvincesSupabase(); } catch (e) { console.error('Get provinces error:', e); return []; }
}

export async function getCategoryStats() {
  try { return await getCategoryStatsSupabase(); } catch (e) { console.error('Get category stats error:', e); return []; }
}
