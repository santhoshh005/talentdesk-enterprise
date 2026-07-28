import {
  PrismaClient,
  UserRoleEnum,
  JobStatus,
  ApplicationStageType,
  OfferStatus,
  InterviewStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding TalentOS Enterprise database...");

  // 1. Create Organization & Settings
  const org = await prisma.organization.upsert({
    where: { slug: "talentos-enterprise" },
    update: {},
    create: {
      name: "TalentOS Enterprise Inc",
      slug: "talentos-enterprise",
      website: "https://talentos.ai",
      primaryColor: "#0F172A",
      settings: {
        create: {
          careerPageTheme: "dark",
          aiProviderPreference: "auto",
          emailSenderName: "TalentOS Hiring Team",
        },
      },
    },
  });

  // 2. Create Departments & Locations
  const engDept = await prisma.department.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Engineering" } },
    update: {},
    create: { organizationId: org.id, name: "Engineering", code: "ENG" },
  });

  const designDept = await prisma.department.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Design" } },
    update: {},
    create: { organizationId: org.id, name: "Design", code: "DSGN" },
  });

  const prodDept = await prisma.department.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Product" } },
    update: {},
    create: { organizationId: org.id, name: "Product", code: "PROD" },
  });

  const locSF = await prisma.location.create({
    data: {
      organizationId: org.id,
      city: "San Francisco",
      state: "CA",
      country: "USA",
      isRemote: false,
    },
  });

  const locRemote = await prisma.location.create({
    data: {
      organizationId: org.id,
      city: "Remote",
      state: "Global",
      country: "Worldwide",
      isRemote: true,
    },
  });

  const locNY = await prisma.location.create({
    data: {
      organizationId: org.id,
      city: "New York",
      state: "NY",
      country: "USA",
      isRemote: false,
    },
  });

  // 3. Create Users
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@talentos.ai" },
    update: {},
    create: {
      organizationId: org.id,
      email: "admin@talentos.ai",
      passwordHash,
      firstName: "Alex",
      lastName: "Vance",
      role: UserRoleEnum.SUPER_ADMIN,
      isVerified: true,
    },
  });

  const recruiterUser = await prisma.user.upsert({
    where: { email: "recruiter@talentos.ai" },
    update: {},
    create: {
      organizationId: org.id,
      email: "recruiter@talentos.ai",
      passwordHash,
      firstName: "Sarah",
      lastName: "Jenkins",
      role: UserRoleEnum.RECRUITER,
      isVerified: true,
    },
  });

  // 4. Create Jobs
  const job1 = await prisma.job.create({
    data: {
      organizationId: org.id,
      departmentId: designDept.id,
      locationId: locSF.id,
      title: "Senior Product Designer",
      code: "DES-001",
      type: "Full-time",
      workplaceType: "Hybrid",
      status: JobStatus.PUBLISHED,
      description:
        "We are looking for a Senior Product Designer to lead design systems and core platform experience.",
      minSalary: 140000,
      maxSalary: 180000,
      skills: {
        create: [
          { name: "Figma", isRequired: true },
          { name: "Design Systems", isRequired: true },
          { name: "User Research", isRequired: false },
        ],
      },
      pipelineStages: {
        create: [
          { name: "Applied", type: ApplicationStageType.APPLIED, order: 1 },
          { name: "Screening", type: ApplicationStageType.SCREENING, order: 2 },
          { name: "Portfolio Review", type: ApplicationStageType.INTERVIEW, order: 3 },
          { name: "Interview", type: ApplicationStageType.INTERVIEW, order: 4 },
          { name: "Offer", type: ApplicationStageType.OFFER, order: 5 },
          { name: "Hired", type: ApplicationStageType.HIRED, order: 6 },
        ],
      },
    },
    include: { pipelineStages: true },
  });

  const job2 = await prisma.job.create({
    data: {
      organizationId: org.id,
      departmentId: engDept.id,
      locationId: locNY.id,
      title: "Staff Backend Engineer",
      code: "ENG-002",
      type: "Full-time",
      workplaceType: "Hybrid",
      status: JobStatus.PUBLISHED,
      description: "Architect scalable distributed backend services using Node.js, Go, and Kafka.",
      minSalary: 190000,
      maxSalary: 240000,
      skills: {
        create: [
          { name: "Go", isRequired: true },
          { name: "Node.js", isRequired: true },
          { name: "Kafka", isRequired: true },
          { name: "AWS", isRequired: true },
        ],
      },
      pipelineStages: {
        create: [
          { name: "Applied", type: ApplicationStageType.APPLIED, order: 1 },
          { name: "Recruiter Screen", type: ApplicationStageType.SCREENING, order: 2 },
          { name: "System Design", type: ApplicationStageType.INTERVIEW, order: 3 },
          { name: "Offer", type: ApplicationStageType.OFFER, order: 4 },
          { name: "Hired", type: ApplicationStageType.HIRED, order: 5 },
        ],
      },
    },
    include: { pipelineStages: true },
  });

  // 5. Create Candidates & Applications
  const candidateData = [
    {
      firstName: "Priya",
      lastName: "Menon",
      email: "priya.menon@example.com",
      location: "Berlin",
      currentRole: "Senior Product Designer",
      experienceYears: 8,
      qualityScore: 92,
      skills: ["Figma", "Design Systems", "Prototyping"],
      summary:
        "Experienced lead designer specialized in building enterprise component libraries and micro-interactions.",
      jobId: job1.id,
      stageName: "Interview",
    },
    {
      firstName: "Marcus",
      lastName: "Chen",
      email: "marcus.chen@example.com",
      location: "New York",
      currentRole: "Staff Backend Engineer",
      experienceYears: 11,
      qualityScore: 88,
      skills: ["Go", "Kafka", "AWS", "Kubernetes"],
      summary:
        "Distributed systems engineer with 11+ years leading high-throughput event-driven microservices.",
      jobId: job2.id,
      stageName: "Recruiter Screen",
    },
    {
      firstName: "Sofia",
      lastName: "Alvarez",
      email: "sofia.alvarez@example.com",
      location: "London",
      currentRole: "Head of Data",
      experienceYears: 13,
      qualityScore: 95,
      skills: ["Snowflake", "dbt", "Python", "SQL"],
      summary: "Data leader experienced in scaling data warehouses and machine learning pipelines.",
      jobId: job2.id,
      stageName: "Offer",
    },
  ];

  for (const cData of candidateData) {
    const candidate = await prisma.candidate.create({
      data: {
        organizationId: org.id,
        firstName: cData.firstName,
        lastName: cData.lastName,
        email: cData.email,
        location: cData.location,
        currentRole: cData.currentRole,
        experienceYears: cData.experienceYears,
        qualityScore: cData.qualityScore,
        summary: cData.summary,
        aiSummary: `AI Evaluation: High potential candidate for ${cData.currentRole}. Strengths include ${cData.skills.join(", ")}. Candidate demonstrates proven enterprise tenure.`,
        stage: cData.stageName,
        skills: {
          create: cData.skills.map((s) => ({ name: s, level: "Expert" })),
        },
      },
    });

    const targetJob = cData.jobId === job1.id ? job1 : job2;
    const matchedStage =
      targetJob.pipelineStages.find((s) => s.name === cData.stageName) ||
      targetJob.pipelineStages[0];

    const app = await prisma.application.create({
      data: {
        jobId: targetJob.id,
        candidateId: candidate.id,
        pipelineStageId: matchedStage.id,
        matchScore: cData.qualityScore,
        notes: {
          create: [
            {
              authorId: recruiterUser.id,
              content: `Initial phone screen passed. Candidate exhibits deep subject matter expertise in ${cData.skills[0]}.`,
            },
          ],
        },
      },
    });

    // Add interview if stage is Interview
    if (cData.stageName === "Interview") {
      await prisma.interview.create({
        data: {
          applicationId: app.id,
          title: `Technical Deep-Dive & System Architecture`,
          scheduledAt: new Date(Date.now() + 86400000 * 2),
          durationMins: 60,
          locationUrl: "https://meet.google.com/abc-defg-hij",
          status: InterviewStatus.SCHEDULED,
          interviewers: {
            create: [{ userId: recruiterUser.id }],
          },
        },
      });
    }

    // Add offer if stage is Offer
    if (cData.stageName === "Offer") {
      await prisma.offer.create({
        data: {
          applicationId: app.id,
          createdById: recruiterUser.id,
          salary: 215000,
          bonus: 25000,
          stockOptions: "15,000 RSUs",
          startDate: new Date(Date.now() + 86400000 * 30),
          status: OfferStatus.APPROVED,
        },
      });
    }
  }

  // 6. Audit Log sample
  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      userId: adminUser.id,
      action: "ORGANIZATION_SEEDED",
      entity: "Organization",
      entityId: org.id,
      details: { status: "Database seed completed successfully" },
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
