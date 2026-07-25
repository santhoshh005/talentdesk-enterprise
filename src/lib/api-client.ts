const getApiBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_BASE_URL || '';
  if (envUrl) {
    envUrl = envUrl.trim().replace(/\/$/, '');
    if (!envUrl.endsWith('/api/v1')) {
      envUrl = `${envUrl}/api/v1`;
    }
    return envUrl;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://talentos-backend-lfkp.onrender.com/api/v1';
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
  updateJob: (id: string, data: any) => apiFetch(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteJob: (id: string) => apiFetch(`/jobs/${id}`, { method: 'DELETE' }),

  // Applications
  getApplications: (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/applications${query ? `?${query}` : ''}`);
  },
  updateApplicationStage: (id: string, stageId: string) =>
    apiFetch(`/applications/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stageId }) }),

  // AI Features
  parseResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/ai/parse-resume', { method: 'POST', body: formData });
  },
  generateJd: (data: { title: string; department?: string; keyResponsibilities?: string[] }) =>
    apiFetch('/ai/generate-jd', { method: 'POST', body: JSON.stringify(data) }),
  matchCandidates: (jobId: string) => apiFetch(`/ai/match-candidates/${jobId}`),

  // AI Configuration
  getAIConfig: () => apiFetch('/ai-config'),
  updateAIConfig: (data: { apiKey: string; provider?: string }) =>
    apiFetch('/ai-config', { method: 'POST', body: JSON.stringify(data) }),
};
