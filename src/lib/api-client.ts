const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api/v1';
  }
  return 'http://localhost:4000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'omit',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `API request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (data: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => apiFetch('/auth/me'),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  // Candidates
  getCandidates: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/candidates${query ? `?${query}` : ''}`);
  },
  getCandidateById: (id: string) => apiFetch(`/candidates/${id}`),
  createCandidate: (data: any) => apiFetch('/candidates', { method: 'POST', body: JSON.stringify(data) }),
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/candidates/upload-resume', { method: 'POST', body: formData });
  },

  // Jobs
  getJobs: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/jobs${query ? `?${query}` : ''}`);
  },
  getJobById: (id: string) => apiFetch(`/jobs/${id}`),
  createJob: (data: any) => apiFetch('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  getJobPipeline: (jobId: string) => apiFetch(`/jobs/${jobId}/pipeline`),

  // Applications & Pipeline
  moveStage: (data: { candidateId?: string; applicationId?: string; toStageName?: string; toStageId?: string }) =>
    apiFetch('/applications/move-stage', { method: 'POST', body: JSON.stringify(data) }),
  addNote: (applicationId: string, content: string) =>
    apiFetch(`/applications/${applicationId}/notes`, { method: 'POST', body: JSON.stringify({ content }) }),

  // AI Tools
  summarizeResume: (text: string) => apiFetch('/ai/resume-summary', { method: 'POST', body: JSON.stringify({ text }) }),
  matchCandidate: (candidate?: any, job?: any) => apiFetch('/ai/candidate-match', { method: 'POST', body: JSON.stringify({ candidate, job }) }),
  generateJD: (data: { title: string; department?: string; keySkills?: string[] }) =>
    apiFetch('/ai/generate-jd', { method: 'POST', body: JSON.stringify(data) }),
  generateInterviewKit: (data: { jobTitle: string; stage?: string }) =>
    apiFetch('/ai/interview-generator', { method: 'POST', body: JSON.stringify(data) }),
  assistantChat: (query: string) => apiFetch('/ai/assistant', { method: 'POST', body: JSON.stringify({ query }) }),

  // Analytics & Dashboard
  getDashboardMetrics: () => apiFetch('/analytics/dashboard'),

  // Search
  booleanSearch: (data: { query: string; location?: string; minExp?: number; stage?: string }) =>
    apiFetch('/search/boolean', { method: 'POST', body: JSON.stringify(data) }),

  // Organization
  getOrganization: () => apiFetch('/organizations'),
  updateOrgSettings: (data: any) => apiFetch('/organizations/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
