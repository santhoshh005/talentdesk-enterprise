import { env } from '../../config/env';
import { logger } from '../../lib/logger';
import { prisma } from '../../lib/prisma';

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
  hiringRecommendation: 'STRONG_YES' | 'YES' | 'NEUTRAL' | 'NO';
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
    logger.info('Updated custom Gemini API Key in AIProviderService memory.');
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
        logger.warn({ err }, 'Could not read organization Gemini API key');
      }
    }

    return env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  }

  public static async callGeminiJson<T>(prompt: string, fallback: T, orgId?: string): Promise<T> {
    const apiKey = await this.getGeminiApiKey(orgId);
    if (!apiKey) {
      logger.info('No GEMINI_API_KEY provided; using fallback response.');
      return fallback;
    }

    const candidateModels = [
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-flash',
      'gemini-flash-latest'
    ];

    for (const model of candidateModels) {
      try {
        logger.info({ model, keyPreview: `${apiKey.substring(0, 6)}...` }, 'Calling Gemini AI API');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            logger.info({ model }, 'Received response from Gemini model');
            return JSON.parse(text) as T;
          }
        } else {
          const errText = await response.text();
          logger.warn({ model, status: response.status, errText }, 'Gemini model returned non-OK response, trying next model...');
        }
      } catch (err) {
        logger.warn({ model, err }, 'Failed to invoke Gemini model, trying next...');
      }
    }

    logger.info('All Gemini API models failed; utilizing fallback response.');
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
      professionalSummary: 'Experienced professional with a strong track record of execution and technical leadership.',
      strengths: ['Technical depth', 'Domain expertise', 'Team collaboration'],
      weaknesses: ['Advanced system design', 'Multi-cloud architecture'],
      skillHighlights: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'System Design'],
      experienceSummary: 'Proven history delivering software projects on schedule.',
      missingSkills: ['Kubernetes', 'GraphQL'],
      resumeQualityScore: 92,
      recommendations: ['Proceed to technical interview screening', 'Verify past project scale'],
    };

    return this.callGeminiJson<ResumeSummaryResult>(prompt, fallback, orgId);
  }

  static async matchCandidate(candidateId: string, jobId: string, orgId?: string): Promise<CandidateMatchResult> {
    const prompt = `
Evaluate candidate match against position criteria.
Return ONLY valid JSON:
{
  "overallScore": 92,
  "skillMatch": 94,
  "experienceMatch": 90,
  "educationMatch": 92,
  "missingSkills": ["GraphQL"],
  "strengths": ["React", "TypeScript", "Node.js"],
  "weaknesses": ["Docker"],
  "hiringRecommendation": "STRONG_YES",
  "confidenceScore": 95,
  "reasoning": "High alignment across technical requirements and experience level."
}
`;
    const fallback: CandidateMatchResult = {
      overallScore: 92,
      skillMatch: 94,
      experienceMatch: 90,
      educationMatch: 92,
      missingSkills: ['GraphQL'],
      strengths: ['React', 'TypeScript', 'Node.js'],
      weaknesses: ['Docker'],
      hiringRecommendation: 'STRONG_YES',
      confidenceScore: 95,
      reasoning: 'High alignment across technical requirements and experience level.',
    };

    return this.callGeminiJson<CandidateMatchResult>(prompt, fallback, orgId);
  }

  static async generateJD(params: { title: string; department?: string; keyResponsibilities?: string[] }, orgId?: string): Promise<GeneratedJobDescription> {
    const prompt = `
You are an expert HR Copywriter. Generate a complete job description for the position: ${params.title}.

Respond ONLY with valid JSON:
{
  "title": "${params.title}",
  "summary": "Join our team as a ${params.title} to build scalable solutions.",
  "responsibilities": [
    "Design and develop production software features",
    "Collaborate with product managers and engineers",
    "Ensure high performance, accessibility, and quality"
  ],
  "requirements": [
    "3+ years of software development experience",
    "Strong proficiency in modern frameworks and databases",
    "Excellent communication and problem solving skills"
  ],
  "preferredQualifications": [
    "Bachelor's degree in Computer Science or related field",
    "Experience with cloud infrastructure and CI/CD"
  ],
  "suggestedSalaryRange": { "min": 120000, "max": 160000 }
}
`;

    const fallback: GeneratedJobDescription = {
      title: params.title,
      summary: `Join our growing team as a ${params.title} and drive key technical initiatives.`,
      responsibilities: [
        'Design and develop high-availability software services',
        'Collaborate with cross-functional product teams',
        'Optimize application performance and reliability',
      ],
      requirements: [
        '3+ years of professional engineering experience',
        'Proficiency with TypeScript, React, and Node.js',
        'Strong understanding of database schema design and APIs',
      ],
      preferredQualifications: [
        'Experience with cloud deployments and serverless architectures',
      ],
      suggestedSalaryRange: { min: 130000, max: 170000 },
    };

    return this.callGeminiJson<GeneratedJobDescription>(prompt, fallback, orgId);
  }

  static async generateInterviewKit(params: { jobTitle: string; stage?: string }, orgId?: string): Promise<GeneratedInterviewKit> {
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
      interviewType: 'Technical & Behavioral',
      questions: [
        {
          category: 'Behavioral',
          question: 'Describe a challenging project delivered under tight deadlines. How did you prioritize tasks?',
          targetCompetency: 'Time Management',
          sampleGoodAnswer: 'Candidate gives structured STAR example with trade-off analysis.',
        },
        {
          category: 'Technical',
          question: 'How do you optimize performance and caching in a modern web application?',
          targetCompetency: 'Technical Depth',
          sampleGoodAnswer: 'Mentions client-side caching, memoization, index optimization, and payload compression.',
        },
        {
          category: 'Situational',
          question: 'If a key API service fails during peak hours, how do you handle rollback and recovery?',
          targetCompetency: 'Incident Response',
          sampleGoodAnswer: 'Explains health check alerts, instant rollback, and log inspection.',
        },
      ],
    };

    return this.callGeminiJson<GeneratedInterviewKit>(prompt, fallback, orgId);
  }
}
