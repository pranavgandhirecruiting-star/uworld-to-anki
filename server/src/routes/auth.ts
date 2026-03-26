import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma.js";
import { signToken, requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Exchange Google ID token for JWT
router.post("/google", async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    res.status(400).json({ error: "Google credential required" });
    return;
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email) {
      res.status(400).json({ error: "Invalid Google token" });
      return;
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where: { googleId: payload.sub },
      update: { name: payload.name, email: payload.email },
      create: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      plan: user.plan,
    });

    // Get today's usage
    const today = new Date().toISOString().split("T")[0];
    const usage = await prisma.usage.findUnique({
      where: { userId_date: { userId: user.id, date: today } },
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
      usage: {
        smartSearches: usage?.smartSearches ?? 0,
        studyPlans: usage?.studyPlans ?? 0,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ error: "Google authentication failed" });
  }
});

// Get current user profile + usage
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const usage = await prisma.usage.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    },
    usage: {
      smartSearches: usage?.smartSearches ?? 0,
      studyPlans: usage?.studyPlans ?? 0,
    },
  });
});

export default router;
