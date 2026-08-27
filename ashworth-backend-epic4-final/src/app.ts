import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { paymentWebhook } from "./controllers/paymentController";
import { env } from "./config/env";

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  // Explicit origin allowlist (env.CORS_ORIGINS) rather than a bare cors()
  // (which reflects every origin) — needs to allow BOTH frontend origins
  // (user-facing membership site + admin panel), since they're independent
  // apps per the brief. "*" is still supported as an explicit opt-in via
  // env for early local dev (see .env.example), but any real deployment
  // should set CORS_ORIGINS to the real origins.
  app.use(
    cors({
      origin: env.CORS_ORIGINS.includes("*") ? true : env.CORS_ORIGINS,
      credentials: true,
    })
  );
  app.use(morgan("dev"));

  // Cashfree webhook MUST be registered before express.json(): signature
  // verification needs the exact raw request bytes Cashfree signed, and
  // express.json() would otherwise consume + re-serialize the body first,
  // silently breaking the signature check. Kept out of routes/index.ts
  // (which sits behind express.json()) for this reason — see
  // routes/membershipRoutes.ts for the note on the other membership routes.
  app.post("/api/membership/payment/webhook", express.raw({ type: "*/*" }), paymentWebhook);

  app.use(express.json());

  // Servable uploaded files when the active storage provider is "multer"
  // (local disk). When Cloudinary is active, fileUrl points at Cloudinary
  // directly and this static route simply isn't hit for those documents.
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));

  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
