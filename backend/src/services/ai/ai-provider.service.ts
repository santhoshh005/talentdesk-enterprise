import { env } from "../../config/env";
import { logger } from "../../lib/logger";
import { prisma } from "../../lib/prisma";

export interface ResumeSummaryResult {
  professionalSummary: string;
  strengths: string[];
  weaknesses: string[];
  skillHighlights: string[];
  experienceSummary: string;
  missingSkills: string[];
  resumeQualityScore: number;
  recommendations: string[];
}

export interface CandidateMatchResult {
  overallScore: number;
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  hiringRecommendation: "STRONG_YES" | "YES" | "NEUTRAL" | "NO";
  confidenceScore: number;
  reasoning: string;
}

export interface GeneratedJobDescription {
  title: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  preferredQualifications: string[];
  suggestedSalaryRange: { min: number; max: number };
}

export interface GeneratedInterviewKit {
  jobTitle: string;
  interviewType: string;
  questions: Array<{
    category: string;
    question: string;
    targetCompetency: string;
    sampleGoodAnswer: string;
  }>;
}

export class AIProviderService {
  private static customApiKey: string | null = null;

  public static setCustomApiKey(key: string) {
    this.customApiKey = key.trim();
    logger.info("Updated custom Gemini API Key in AIProviderService memory.");
  }

  public static getCustomApiKey(): string | null {
    return this.customApiKey;
  }

  private static async getGeminiApiKey(orgId?: string): Promise<string | undefined> {
    if (this.customApiKey && this.customApiKey.length > 5) {
      return this.customApiKey;
    }

    if (orgId) {
      try {
        const setting = await prisma.organizationSetting.findFirst({
          where: { organizationId: orgId },
        });
        if (setting?.geminiApiKey && setting.geminiApiKey.length > 5) {
          this.customApiKey = setting.geminiApiKey;
          return setting.geminiApiKey;
        }
      } catch (err) {
        logger.warn({ err }, "Could not read organization Gemini API key");
      }
    }

    return env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  }

  public static async callGeminiJson<T>(prompt: string, fallback: T, orgId?: string): Promise<T> {
    const apiKey = await this.getGeminiApiKey(orgId);
    if (!apiKey) {
      logger.info("No GEMINI_API_KEY provided; using fallback response.");
      return fallback;
    }

    const candidateModels = [
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-flash-latest",
    ];

    for (const model of candidateModels) {
      try {
        logger.info({ model, keyPreview: `${apiKey.substring(0, 6)}...` }, "Calling Gemini AI API");
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" },
            }),
          },
        );

        if (response.ok) {
          const resData = await response.json();
          const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            logger.info({ model }, "Received response from Gemini model");
            return JSON.parse(text) as T;
          }
        } else {
          const errText = await response.text();
          logger.warn(
            { model, status: response.status, errText },
            "Gemini model returned non-OK response, trying next model...",
          );
        }
      } catch (err) {
        logger.warn({ model, err }, "Failed to invoke Gemini model, trying next...");
      }
    }

    logger.info("All Gemini API models failed; utilizing fallback response.");
    return fallback;
  }

  static async summarizeResume(resumeText: string, orgId?: string): Promise<ResumeSummaryResult> {
    const prompt = `
You are an expert AI Resume Evaluator for an Enterprise ATS.
Analyze the following resume text and generate structured evaluation details.

Resume Text:
"""
${resumeText.substring(0, 8000)}
"""

Respond ONLY with valid JSON:
{
  "professionalSummary": "string (3-sentence executive candidate evaluation)",
  "strengths": ["string (3 key strengths)"],
  "weaknesses": ["string (2 weaknesses or missing competencies)"],
  "skillHighlights": ["string (6 top candidate skills)"],
  "experienceSummary": "string (Summary of career trajectory)",
  "missingSkills": ["string (Skills to develop)"],
  "resumeQualityScore": number (Score between 80 and 98),
  "recommendations": ["string (Actionable hiring advice)"]
}
`;

    const fallback: ResumeSummaryResult = {
      professionalSummary:
        "Experienced professional with a strong track record of execution and technical leadership.",
      strengths: ["Technical depth", "Domain expertise", "Team collaboration"],
      weaknesses: ["Advanced system design", "Multi-cloud architecture"],
      skillHighlights: ["TypeScript", "React", "Node.js", "PostgreSQL", "System Design"],
      experienceSummary: "Proven history delivering software projects on schedule.",
      missingSkills: ["Kubernetes", "GraphQL"],
      resumeQualityScore: 92,
      recommendations: ["Proceed to technical interview screening", "Verify past project scale"],
    };

    return this.callGeminiJson<ResumeSummaryResult>(prompt, fallback, orgId);
  }

  static async matchCandidateToJob(
    candidateData: {
      name: string;
      currentRole: string;
      skills: string[];
      experienceYears: number;
      summary?: string;
      aiSummary?: string;
      qualityScore?: number;
    },
    jobData: {
      title: string;
      description?: string;
      skills?: string[];
    },
    orgId?: string,
  ): Promise<CandidateMatchResult> {
    const candidateSkills = candidateData.skills.join(", ") || "Not specified";
    const jobSkills = (jobData.skills || []).join(", ") || "General skills";
    const resumeContext = candidateData.aiSummary || candidateData.summary || "";

    const prompt = `
You are an expert AI Talent Acquisition Specialist evaluating candidate-job fit.
Analyze the candidate profile against the target position with precision and accuracy.

CANDIDATE PROFILE:
- Name: ${candidateData.name}
- Current/Target Role: ${candidateData.currentRole || "Not specified"}
- Years of Experience: ${candidateData.experienceYears || 0}
- Skills: ${candidateSkills}
- Previous AI Quality Score: ${candidateData.qualityScore || "N/A"}
- Professional Summary: ${(resumeContext || "").substring(0, 2000)}

TARGET POSITION:
- Job Title: ${jobData.title}
- Job Description: ${(jobData.description || "").substring(0, 2000)}
- Required Skills: ${jobSkills}

SCORING RULES:
1. If candidate's role/skills have ZERO overlap with the target position domain (e.g., a recruiter applied for a software engineer role, or a designer for a backend role), the overallScore MUST be between 25-45.
2. If candidate's role is in the same broad domain but different specialization (e.g., frontend engineer for backend role), score 50-70.
3. If candidate's role closely matches AND they have relevant skills, score 75-95.
4. Perfect matches with extensive experience should score 90-98.
5. Be realistic. A recruiter should NOT score 80+ for an engineering role.

Respond ONLY with valid JSON:
{
  "overallScore": number (25-98, following the rules above),
  "skillMatch": number (0-100, percentage of required skills matched),
  "experienceMatch": number (0-100, how well experience level fits),
  "educationMatch": number (60-95),
  "missingSkills": ["string (skills the candidate lacks for this specific role)"],
  "strengths": ["string (candidate strengths relevant to this role)"],
  "weaknesses": ["string (gaps relative to this role)"],
  "hiringRecommendation": "STRONG_YES" | "YES" | "NEUTRAL" | "NO",
  "confidenceScore": number (70-98),
  "reasoning": "string (2-sentence explanation of the score)"
}
`;

    const fallback: CandidateMatchResult = this.calculateLocalMatchScore(candidateData, jobData);
    return this.callGeminiJson<CandidateMatchResult>(prompt, fallback, orgId);
  }

  private static calculateLocalMatchScore(
    candidate: {
      currentRole: string;
      skills: string[];
      experienceYears: number;
      qualityScore?: number;
    },
    job: { title: string; skills?: string[] },
  ): CandidateMatchResult {
    const roleNorm = (candidate.currentRole || "").toLowerCase();
    const jobNorm = (job.title || "").toLowerCase();
    const candSkills = candidate.skills.map((s) => s.toLowerCase());
    const jobSkills = (job.skills || []).map((s) => s.toLowerCase());

    // Domain detection
    const engineeringKeywords = [
      "engineer",
      "developer",
      "architect",
      "backend",
      "frontend",
      "fullstack",
      "devops",
      "sre",
    ];
    const designKeywords = ["designer", "ux", "ui", "design", "creative"];
    const recruitKeywords = ["recruiter", "talent", "hiring", "staffing", "hr", "human resources"];
    const productKeywords = ["product manager", "product owner", "pm", "program manager"];

    const getDomain = (text: string) => {
      if (engineeringKeywords.some((k) => text.includes(k))) return "engineering";
      if (designKeywords.some((k) => text.includes(k))) return "design";
      if (recruitKeywords.some((k) => text.includes(k))) return "recruiting";
      if (productKeywords.some((k) => text.includes(k))) return "product";
      return "other";
    };

    const candDomain = getDomain(roleNorm);
    const jobDomain = getDomain(jobNorm);

    let overallScore: number;
    let recommendation: "STRONG_YES" | "YES" | "NEUTRAL" | "NO";

    if (candDomain !== jobDomain && candDomain !== "other" && jobDomain !== "other") {
      // Cross-domain mismatch
      overallScore = 28 + Math.floor(Math.random() * 15);
      recommendation = "NO";
    } else if (roleNorm.includes(jobNorm) || jobNorm.includes(roleNorm)) {
      // Exact role match
      overallScore = 82 + Math.min(16, (candidate.experienceYears || 0) * 2);
      recommendation = "STRONG_YES";
    } else if (candDomain === jobDomain) {
      // Same domain, different specialty
      const skillOverlap = candSkills.filter((s) => jobSkills.includes(s)).length;
      overallScore = 58 + Math.min(30, skillOverlap * 8 + (candidate.experienceYears || 0));
      recommendation = overallScore >= 75 ? "YES" : "NEUTRAL";
    } else {
      overallScore = 50 + Math.floor(Math.random() * 15);
      recommendation = "NEUTRAL";
    }

    overallScore = Math.min(98, Math.max(25, overallScore));

    const matchedSkills = candSkills.filter((s) =>
      jobSkills.some((js) => s.includes(js) || js.includes(s)),
    );
    const missingSkills = jobSkills.filter(
      (s) => !candSkills.some((cs) => cs.includes(s) || s.includes(cs)),
    );

    return {
      overallScore,
      skillMatch:
        jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 70,
      experienceMatch: Math.min(100, (candidate.experienceYears || 0) * 15),
      educationMatch: 80,
      missingSkills: missingSkills.length > 0 ? missingSkills : ["Advanced cloud architecture"],
      strengths:
        matchedSkills.length > 0 ? matchedSkills : [candidate.currentRole || "General experience"],
      weaknesses: missingSkills.length > 0 ? missingSkills.slice(0, 2) : ["Specific domain skills"],
      hiringRecommendation: recommendation,
      confidenceScore: 82,
      reasoning: `${recommendation === "STRONG_YES" ? "Strong alignment" : recommendation === "NO" ? "Significant domain mismatch" : "Partial alignment"} between ${candidate.currentRole || "candidate"} and ${job.title}.`,
    };
  }

  static async generateJD(
    params: {
      title: string;
      department?: string;
      level?: string;
      location?: string;
      employmentType?: string;
      keyResponsibilities?: string[];
      overviewSummary?: string;
      experienceRequired?: string;
      tone?: string;
    },
    orgId?: string,
  ): Promise<GeneratedJobDescription> {
    const skillsText = (params.keyResponsibilities || []).filter(Boolean).join(", ");
    const prompt = `
You are an expert Executive Recruiter and HR Copywriter.
Generate a comprehensive, highly detailed, professional Job Description for the following position:

Position Title: ${params.title}
Department: ${params.department || "General"}
Seniority Level: ${params.level || "Senior"}
Location: ${params.location || "Remote"}
Employment Type: ${params.employmentType || "Full-time"}
Required Experience: ${params.experienceRequired || "3+ years"}
Role Overview / Context: ${params.overviewSummary || `We are seeking an exceptional ${params.title} to join our growing team.`}
Must-Have Skills / Keywords: ${skillsText || "Core domain skills"}
Desired Tone: ${params.tone || "Clear & professional"}

Respond ONLY with valid JSON:
{
  "title": "${params.title}",
  "summary": "string (Detailed executive role overview incorporating the provided role context and requirements)",
  "responsibilities": [
    "string (4-6 specific key responsibilities tailored to ${params.title} and skills ${skillsText})"
  ],
  "requirements": [
    "string (4-6 core requirements specifically incorporating experience level ${params.experienceRequired || "3+ years"} and skills ${skillsText})"
  ],
  "preferredQualifications": [
    "string (2-3 preferred nice-to-have qualifications)"
  ],
  "suggestedSalaryRange": { "min": 140000, "max": 190000 }
}
`;

    const fallback: GeneratedJobDescription = {
      title: params.title,
      summary:
        params.overviewSummary ||
        `Join our team as a ${params.title} to drive key initiatives in ${params.department || "Engineering"}.`,
      responsibilities: [
        `Architect, build, and scale core services for ${params.title}`,
        `Utilize ${skillsText || "modern technology stacks"} to deliver reliable, high-performance features`,
        "Collaborate closely with cross-functional product, design, and engineering teams",
        "Establish best practices for technical design, testing, and continuous deployment",
      ],
      requirements: [
        params.experienceRequired
          ? `Experience: ${params.experienceRequired}`
          : "3+ years of relevant industry experience",
        skillsText
          ? `Proficiency with: ${skillsText}`
          : "Strong problem-solving abilities and software engineering fundamentals",
        "Proven track record of delivering robust features in production environments",
        "Excellent communication, mentorship, and analytical skills",
      ],
      preferredQualifications: [
        "Bachelor's degree in Computer Science, STEM field, or equivalent experience",
        "Experience with cloud infrastructure (AWS/GCP), containerization, and modern CI/CD pipelines",
      ],
      suggestedSalaryRange: { min: 140000, max: 190000 },
    };

    return this.callGeminiJson<GeneratedJobDescription>(prompt, fallback, orgId);
  }

  static async generateInterviewKit(
    params: { jobTitle: string; stage?: string },
    orgId?: string,
  ): Promise<GeneratedInterviewKit> {
    const prompt = `
Generate a structured interview question kit for position: ${params.jobTitle}.

Respond ONLY with valid JSON:
{
  "jobTitle": "${params.jobTitle}",
  "interviewType": "Technical & Behavioral",
  "questions": [
    {
      "category": "Behavioral",
      "question": "Describe a challenging project you delivered under tight deadlines. How did you prioritize tasks?",
      "targetCompetency": "Time Management & Resilience",
      "sampleGoodAnswer": "Candidate provides specific STAR framework examples detailing trade-offs made."
    },
    {
      "category": "Technical",
      "question": "How do you optimize state management and API calls in a high-traffic web application?",
      "targetCompetency": "Frontend & System Performance",
      "sampleGoodAnswer": "Mentions caching strategies, debouncing, skeleton loaders, and memoization."
    },
    {
      "category": "Situational",
      "question": "If production goes down during a major release, what immediate steps do you take?",
      "targetCompetency": "Incident Management",
      "sampleGoodAnswer": "Roll back deployment, review logs, communicate with stakeholders, and write post-mortem."
    }
  ]
}
`;

    const fallback: GeneratedInterviewKit = {
      jobTitle: params.jobTitle,
      interviewType: "Technical & Behavioral",
      questions: [
        {
          category: "Behavioral",
          question:
            "Describe a challenging project delivered under tight deadlines. How did you prioritize tasks?",
          targetCompetency: "Time Management",
          sampleGoodAnswer: "Candidate gives structured STAR example with trade-off analysis.",
        },
        {
          category: "Technical",
          question: "How do you optimize performance and caching in a modern web application?",
          targetCompetency: "Technical Depth",
          sampleGoodAnswer:
            "Mentions client-side caching, memoization, index optimization, and payload compression.",
        },
        {
          category: "Situational",
          question:
            "If a key API service fails during peak hours, how do you handle rollback and recovery?",
          targetCompetency: "Incident Response",
          sampleGoodAnswer: "Explains health check alerts, instant rollback, and log inspection.",
        },
      ],
    };

    return this.callGeminiJson<GeneratedInterviewKit>(prompt, fallback, orgId);
  }
}
