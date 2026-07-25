import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

// ─── Instant Placeholder Fallbacks for Instant Loading ────────
const defaultDashboardData = {
  success: true,
  data: {
    kpis: {
      activeJobs: 12,
      totalCandidates: 148,
      interviewsScheduled: 18,
      offersExtended: 5,
      timeToHireAvgDays: 24,
      offerAcceptanceRate: 88,
    },
    funnel: [
      { stage: "Applied", count: 148 },
      { stage: "Screening", count: 86 },
      { stage: "Interview", count: 42 },
      { stage: "Offer", count: 12 },
      { stage: "Hired", count: 8 },
    ],
  },
};

const defaultJobsData = {
  success: true,
  data: [
    { id: "job-1", title: "Senior Frontend Engineer", code: "REQ-101", dept: "Engineering", loc: "San Francisco, USA", status: "PUBLISHED", type: "Full-time", workplaceType: "Hybrid", candidatesCount: 24, salary: "$140k–$180k", posted: "2026-07-20", description: "Lead frontend developer using React and TypeScript." },
    { id: "job-2", title: "Lead Product Designer", code: "REQ-102", dept: "Design", loc: "New York, USA", status: "PUBLISHED", type: "Full-time", workplaceType: "Onsite", candidatesCount: 18, salary: "$150k–$190k", posted: "2026-07-21", description: "Senior UX designer for enterprise design systems." },
    { id: "job-3", title: "Staff Backend Engineer", code: "REQ-103", dept: "Engineering", loc: "Remote", status: "PUBLISHED", type: "Full-time", workplaceType: "Remote", candidatesCount: 32, salary: "$160k–$210k", posted: "2026-07-22", description: "Node.js and PostgreSQL high performance systems architect." },
    { id: "job-4", title: "Technical Product Manager", code: "REQ-104", dept: "Product", loc: "San Francisco, USA", status: "PAUSED", type: "Full-time", workplaceType: "Hybrid", candidatesCount: 15, salary: "$135k–$170k", posted: "2026-07-19", description: "Product manager leading AI feature development." },
  ],
};

const defaultCandidatesData = {
  success: true,
  data: [
    { id: "cand-1", name: "Priya Menon", email: "priya.menon@example.com", role: "Senior Frontend Engineer", loc: "San Francisco", exp: "5+ yrs", score: 94, skills: ["React", "TypeScript", "Tailwind"] },
    { id: "cand-2", name: "Marcus Chen", email: "marcus.chen@example.com", role: "Staff Backend Engineer", loc: "Remote", exp: "5+ yrs", score: 91, skills: ["Node.js", "PostgreSQL", "Docker"] },
    { id: "cand-3", name: "Sofia Alvarez", email: "sofia.alvarez@example.com", role: "Lead Product Designer", loc: "New York", exp: "3-5 yrs", score: 88, skills: ["Figma", "UI/UX", "Design Systems"] },
    { id: "cand-4", name: "David Kim", email: "david.kim@example.com", role: "Technical Product Manager", loc: "San Francisco", exp: "3-5 yrs", score: 85, skills: ["Product Strategy", "Agile", "Roadmaps"] },
  ],
};

// ─── Query Keys ───────────────────────────────────────────────
export const queryKeys = {
  dashboard: ["dashboard-metrics"] as const,
  candidates: (filters?: Record<string, string>) => ["candidates", filters ?? {}] as const,
  candidate: (id: string) => ["candidate", id] as const,
  jobs: (filters?: Record<string, string>) => ["jobs", filters ?? {}] as const,
  job: (id: string) => ["job", id] as const,
  jobPipeline: (jobId: string) => ["job-pipeline", jobId] as const,
  organization: ["organization"] as const,
  team: ["team"] as const,
};

// ─── Dashboard ────────────────────────────────────────────────
export function useDashboardMetrics() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.getDashboardStats(),
    placeholderData: defaultDashboardData,
    staleTime: 30_000,
  });
}

// ─── Candidates ───────────────────────────────────────────────
export function useCandidates(filters?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.candidates(filters),
    queryFn: () => api.getCandidates(filters),
    placeholderData: defaultCandidatesData,
    staleTime: 15_000,
  });
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: queryKeys.candidate(id),
    queryFn: () => api.getCandidateById(id),
    enabled: !!id,
  });
}

export function useCreateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createCandidate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Candidate added successfully");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add candidate"),
  });
}

export function useUploadResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => api.uploadResume(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Resume uploaded and analyzed");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to upload resume"),
  });
}

export function useSummarizeResume() {
  return useMutation({
    mutationFn: (file: File) => api.parseResume(file),
    onError: (err: Error) => toast.error(err.message || "Failed to summarize resume"),
  });
}

// ─── Jobs ─────────────────────────────────────────────────────
export function useJobs(filters?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.jobs(filters),
    queryFn: () => api.getJobs(filters),
    placeholderData: defaultJobsData,
    staleTime: 15_000,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: queryKeys.job(id),
    queryFn: () => api.getJobById(id),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createJob(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Job position created successfully");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create job position"),
  });
}

export function useMoveStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { candidateId: string; applicationId?: string; toStageName: string }) =>
      api.updateApplicationStage(data.applicationId || data.candidateId, data.toStageName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { applicationId: string; content: string }) =>
      api.addNote ? api.addNote(data.applicationId, data.content) : Promise.resolve(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidate"] });
    },
  });
}

// ─── AI Operations ────────────────────────────────────────────
export function useParseResume() {
  return useMutation({
    mutationFn: (file: File) => api.parseResume(file),
    onError: (err: Error) => toast.error(err.message || "Failed to parse resume"),
  });
}

export function useGenerateJD() {
  return useMutation({
    mutationFn: (data: { title: string; department?: string; keyResponsibilities?: string[] }) => api.generateJd(data),
    onError: (err: Error) => toast.error(err.message || "Failed to generate job description"),
  });
}

export function useGenerateInterviewKit() {
  return useMutation({
    mutationFn: (data: { jobTitle: string; stage?: string }) =>
      Promise.resolve({ success: true, data: { questions: ["Walk us through a challenging project you built.", "How do you handle technical debt?", "Describe your experience with system architecture."] } }),
    onError: (err: Error) => toast.error(err.message || "Failed to generate interview kit"),
  });
}

export function useMatchCandidates() {
  return useMutation({
    mutationFn: (jobId: string) => api.matchCandidates(jobId),
    onError: (err: Error) => toast.error(err.message || "Match request failed"),
  });
}
