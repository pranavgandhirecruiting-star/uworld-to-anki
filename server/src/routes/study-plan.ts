import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { generateStudyPlan } from "../lib/claude.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const plan = req.user!.plan;

  // Pro-only feature
  if (plan !== "pro") {
    res.status(403).json({
      error: "upgrade_required",
      message: "Study Plans require a Pro subscription.",
    });
    return;
  }

  const { ankiStats, recentTopics, examDate } = req.body;

  if (!ankiStats?.length) {
    res.status(400).json({ error: "ankiStats are required" });
    return;
  }

  try {
    const result = await generateStudyPlan(
      ankiStats,
      recentTopics || [],
      examDate
    );

    // Increment usage
    const today = new Date().toISOString().split("T")[0];
    await prisma.usage.upsert({
      where: { userId_date: { userId, date: today } },
      update: { studyPlans: { increment: 1 } },
      create: { userId, date: today, studyPlans: 1 },
    });

    // Parse the study plan JSON
    const start = result.indexOf("{");
    const end = result.lastIndexOf("}");
    if (start !== -1 && end > start) {
      const parsed = JSON.parse(result.slice(start, end + 1));
      res.json(parsed);
    } else {
      res.json({ raw: result });
    }
  } catch (err) {
    console.error("Study plan error:", err);
    res.status(500).json({ error: "Study plan generation failed" });
  }
});

export default router;
