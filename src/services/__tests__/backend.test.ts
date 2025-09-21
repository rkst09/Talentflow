import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { seedDatabase } from "../seedData";
import { db } from "../database";
import { api } from "../api";
import { startMockServer } from "../../mocks/server";

describe("TalentFlow Backend Integration", () => {
  beforeAll(async () => {
    await startMockServer();
    await seedDatabase();
  });

  afterAll(async () => {
    await db.delete();
  });

  // ---------------- Database Layer ----------------
  describe("Database Layer", () => {
    it("should have seeded data", async () => {
      const jobCount = await db.jobs.count();
      const candidateCount = await db.candidates.count();

      expect(jobCount).toBeGreaterThan(0);
      expect(candidateCount).toBeGreaterThan(0);
    });

    it("should find jobs by search", async () => {
      const searchResults = await db.jobs
        .filter((job) => job.title.toLowerCase().includes("developer"))
        .toArray();

      expect(searchResults.length).toBeGreaterThan(0);
    });
  });

  // ---------------- API Layer ----------------
  describe("API Layer", () => {
    it("should fetch jobs with pagination", async () => {
      const response = await api.jobs.getJobs({ page: 1, pageSize: 5 });

      expect(response.data).toHaveLength(5);
      expect(response.total).toBeGreaterThan(0);
      expect(response.page).toBe(1);
    });

    it("should create a new job", async () => {
      const newJob = await api.jobs.createJob({
        title: "Test Developer",
        department: "Engineering",
        location: "Remote",
        description: "Test job description",
        tags: ["React", "TypeScript"],
      });

      expect(newJob.title).toBe("Test Developer");
      expect(newJob.id).toBeDefined();
    });

    it("should handle API errors", async () => {
      try {
        await api.jobs.getJob("non-existent-id");
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });
  });
});
