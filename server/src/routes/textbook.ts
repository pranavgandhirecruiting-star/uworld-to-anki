import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

/**
 * Process a batch of textbook pages into structured concepts.
 * Expects { pages: string[], batchIndex: number, totalBatches: number }
 */
router.post("/chunk", requireAuth, async (req: AuthRequest, res) => {
  const { pages, batchIndex, totalBatches } = req.body;

  if (!pages?.length) {
    res.status(400).json({ error: "pages array is required" });
    return;
  }

  // Pro-only feature
  if (req.user!.plan !== "pro") {
    res.status(403).json({
      error: "upgrade_required",
      message: "Textbook processing requires a Pro subscription.",
    });
    return;
  }

  try {
    const pageText = pages
      .map((p: string, i: number) => `--- Page ${batchIndex * 15 + i + 1} ---\n${p}`)
      .join("\n\n");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: `You are a medical education expert processing a medical textbook (likely First Aid for the USMLE Step 1).

Your job: Extract distinct medical concepts from the given pages and structure them as JSON.

For each concept, create an entry with:
- "concept": The concept name (e.g., "Nephrotic Syndrome", "Beta-Blockers")
- "keywords": Array of 5-10 search terms that would help match this concept to exam questions
- "summary": 2-3 sentence summary of the key teaching points
- "system": The organ system or category (e.g., "Renal", "Cardiology", "Pharmacology", "Biochemistry")
- "highYield": The single most important thing to remember — the common exam trap or key differentiator
- "pageRef": The approximate page number(s) this content appears on

Guidelines:
- Extract DISTINCT concepts, not page-by-page summaries
- Focus on clinically testable content
- Each concept should be a discrete, searchable topic
- Skip tables of contents, indexes, and filler content
- Aim for 5-15 concepts per batch of pages depending on content density
- Keywords should include synonyms, related terms, and clinical presentations

Return ONLY a JSON array of concept objects. No other text.`,
      messages: [
        {
          role: "user",
          content: `Process batch ${batchIndex + 1} of ${totalBatches}.\n\n${pageText}`,
        },
      ],
    });

    const text = response.content?.[0]?.type === "text" ? response.content[0].text : "[]";

    // Parse JSON from response (handle markdown fences)
    let concepts;
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start !== -1 && end > start) {
      concepts = JSON.parse(text.slice(start, end + 1));
    } else {
      concepts = [];
    }

    res.json({ concepts, batch: batchIndex });
  } catch (err: any) {
    console.error("Textbook chunking error:", err?.message || err);
    const message = err?.status === 413
      ? "Batch too large — try a smaller PDF or contact support."
      : err?.message || "Failed to process textbook batch";
    res.status(500).json({ error: message });
  }
});

export default router;
