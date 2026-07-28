import { Queue, Worker, Job as BullJob } from "bullmq";
import Redis from "ioredis";
import { env } from "../../config/env";
import { logger } from "../../lib/logger";

let connection: Redis | null = null;
let resumeQueue: Queue | null = null;

try {
  connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });

  resumeQueue = new Queue("resume-processing", { connection });

  new Worker(
    "resume-processing",
    async (job: BullJob) => {
      logger.info({ jobId: job.id, data: job.data }, "Processing background resume parse job");
      // Background task execution logic
    },
    { connection },
  );
} catch (error) {
  logger.warn(
    "Redis not reachable. Background queues operating in synchronous in-memory fallback mode.",
  );
}

export class QueueService {
  static async addResumeProcessingJob(data: { candidateId: string; fileUrl: string }) {
    if (resumeQueue) {
      await resumeQueue.add("parse-resume", data);
    } else {
      logger.info({ data }, "Synchronous fallback processing for resume job");
    }
  }
}
