import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import smartSearchRoutes from "./routes/smart-search.js";
import studyPlanRoutes from "./routes/study-plan.js";
import billingRoutes from "./routes/billing.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3001");

// CORS — allow frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// JSON parsing for all routes except Stripe webhook (needs raw body)
app.use((req, res, next) => {
  if (req.path === "/billing/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Routes
app.use("/auth", authRoutes);
app.use("/smart-search", smartSearchRoutes);
app.use("/study-plan", studyPlanRoutes);
app.use("/billing", billingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
