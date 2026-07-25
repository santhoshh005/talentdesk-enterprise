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
    queryFn: () => api.getDashboardMetrics(),
    staleTime: 30_000,
  });
}

// ─── Candidates ───────────────────────────────────────────────
export function useCandidates(filters?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.candidates(filters),
    queryFn: () => api.getCandidates(filters),
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

// ─── Jobs ─────────────────────────────────────────────────────
export function useJobs(filters?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.jobs(filters),
    queryFn: () => api.getJobs(filters),
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
      toast.success("Job created successfully");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create job"),
  });
}

// ─── Pipeline & Applications ──────────────────────────────────
export function useJobPipeline(jobId: string) {
  return useQuery({
    queryKey: queryKeys.jobPipeline(jobId),
    queryFn: () => api.getJobPipeline(jobId),
    enabled: !!jobId,
    staleTime: 10_000,
  });
}

export function useMoveStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { applicationId?: string; candidateId?: string; toStageName?: string; toStageId?: string }) =>
      api.moveStage(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["job-pipeline"] });
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
      toast.success(`Candidate moved to ${variables.toStageName || "new stage"}`);
    },
    onError: (err: Error) => toast.error(err.message || "Failed to move candidate"),
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, content }: { applicationId: string; content: string }) =>
      api.addNote(applicationId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidate"] });
      toast.success("Note added");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add note"),
  });
}

// ─── AI Tools ─────────────────────────────────────────────────
export function useSummarizeResume() {
  return useMutation({
    mutationFn: (text: string) => api.summarizeResume(text),
    onError: (err: Error) => toast.error(err.message || "Failed to summarize resume"),
  });
}

export function useMatchCandidate() {
  return useMutation({
    mutationFn: (data: { candidate?: any; job?: any }) => api.matchCandidate(data.candidate, data.job),
    onError: (err: Error) => toast.error(err.message || "Failed to match candidate"),
  });
}

export function useGenerateJD() {
  return useMutation({
    mutationFn: (data: { title: string; department?: string; keySkills?: string[] }) => api.generateJD(data),
    onError: (err: Error) => toast.error(err.message || "Failed to generate job description"),
  });
}

export function useGenerateInterviewKit() {
  return useMutation({
    mutationFn: (data: { jobTitle: string; stage?: string }) => api.generateInterviewKit(data),
    onError: (err: Error) => toast.error(err.message || "Failed to generate interview kit"),
  });
}

export function useBooleanSearch() {
  return useMutation({
    mutationFn: (data: { query: string; location?: string; minExp?: number; stage?: string }) =>
      api.booleanSearch(data),
    onError: (err: Error) => toast.error(err.message || "Search failed"),
  });
}

export function useAssistantChat() {
  return useMutation({
    mutationFn: (query: string) => api.assistantChat(query),
    onError: (err: Error) => toast.error(err.message || "Assistant request failed"),
  });
}

// ─── Organization ─────────────────────────────────────────────
export function useOrganization() {
  return useQuery({
    queryKey: queryKeys.organization,
    queryFn: () => api.getOrganization(),
    staleTime: 60_000,
  });
}

export function useUpdateOrgSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.updateOrgSettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.organization });
      toast.success("Settings updated");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update settings"),
  });
}
