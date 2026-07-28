import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

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
    staleTime: 0,
  });
}

// ─── Candidates ───────────────────────────────────────────────
export function useCandidates(filters?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.candidates(filters),
    queryFn: () => api.getCandidates(filters),
    staleTime: 0,
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

export function useUpdateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateCandidate(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Candidate details updated successfully");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update candidate"),
  });
}

export function useDeleteCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCandidate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Candidate deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete candidate"),
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
    staleTime: 0,
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
    onError: (err: Error) => toast.error(err.message || "Failed to create job"),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateJob(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update job status"),
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteJob(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success("Position deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete position"),
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
    onError: (err: Error) => toast.error(err.message || "Failed to move stage"),
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { applicationId: string; content: string }) =>
      api.addNote ? api.addNote(data.applicationId, data.content) : Promise.resolve(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: ["candidate"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add note"),
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
    mutationFn: (data: {
      title: string;
      department?: string;
      level?: string;
      location?: string;
      employmentType?: string;
      keyResponsibilities?: string[];
      overviewSummary?: string;
      experienceRequired?: string;
      tone?: string;
    }) => api.generateJd(data),
    onError: (err: Error) => toast.error(err.message || "Failed to generate job description"),
  });
}

export function useGenerateInterviewKit() {
  return useMutation({
    mutationFn: (data: { jobTitle: string; stage?: string }) =>
      Promise.resolve({
        success: true,
        data: {
          questions: [
            "Walk us through a challenging project you built.",
            "How do you handle technical debt?",
            "Describe your experience with system architecture.",
          ],
        },
      }),
    onError: (err: Error) => toast.error(err.message || "Failed to generate interview kit"),
  });
}

export function useBatchMatchCandidates() {
  return useMutation({
    mutationFn: (data: { candidates: any[]; jobTitle: string }) => api.batchMatchCandidates(data),
    onError: (err: Error) => toast.error(err.message || "Match request failed"),
  });
}

export function useAIConfig() {
  return useQuery({
    queryKey: ["ai-config"],
    queryFn: () => api.getAIConfig(),
  });
}

export function useUpdateAIConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { apiKey: string; provider?: string }) => api.updateAIConfig(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-config"] });
      toast.success("Gemini API key updated successfully!");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update Gemini API key"),
  });
}
