import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  extractMedicalConcepts,
  matchCardsToQuestion,
  explainQuestion,
} from "../lib/claude.js";
import {
  requireAuth,
  type AuthRequest,
} from "../middleware/auth.js";

const router = Router();

const FREE_DAILY_LIMIT = 3;

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { questionText, candidates } = req.body;

  if (!questionText || !candidates?.length) {
    res.status(400).json({ error: "questionText and candidates are required" });
    return;
  }

  // Check usage limits — user is always authenticated now
  const userId = req.user!.id;
  const plan = req.user!.plan;
  const today = new Date().toISOString().split("T")[0];

  if (plan === "free") {
    const usage = await prisma.usage.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    if ((usage?.smartSearches ?? 0) >= FREE_DAILY_LIMIT) {
      res.status(429).json({
        error: "daily_limit",
        message: `You've used ${FREE_DAILY_LIMIT}/${FREE_DAILY_LIMIT} free Smart Searches today. Upgrade to Pro for unlimited.`,
        usage: { smartSearches: usage?.smartSearches ?? 0 },
      });
      return;
    }
  }

  try {
    // Run card matching and explanation in parallel
    const [matches, explanation] = await Promise.all([
      matchCardsToQuestion(questionText, candidates),
      explainQuestion(questionText).catch((err) => {
        console.error("Explanation failed:", err);
        return null;
      }),
    ]);

    // Increment usage counter
    await prisma.usage.upsert({
      where: { userId_date: { userId, date: today } },
      update: { smartSearches: { increment: 1 } },
      create: { userId, date: today, smartSearches: 1 },
    });

    // Save search session for analytics
    await prisma.searchSession.create({
      data: {
        userId,
        questionText: questionText.slice(0, 500),
        topicsFound: [],
        cardsMatched: matches.length,
        mode: "smart",
      },
    });

    res.json({ matches, explanation });
  } catch (err) {
    console.error("Smart search error:", err);
    res.status(500).json({ error: "Smart search failed" });
  }
});

// Concept extraction endpoint (used by frontend before sending candidates)
router.post("/concepts", requireAuth, async (req: AuthRequest, res) => {
  const { questionText } = req.body;

  if (!questionText) {
    res.status(400).json({ error: "questionText is required" });
    return;
  }

  try {
    const concepts = await extractMedicalConcepts(questionText);
    res.json({ concepts });
  } catch (err) {
    console.error("Concept extraction error:", err);
    res.status(500).json({ error: "Concept extraction failed" });
  }
});

export default router;
