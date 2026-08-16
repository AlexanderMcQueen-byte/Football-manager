import express, { type Express, type Request, type Response, type NextFunction } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

if (!process.env.SESSION_SECRET) {
  logger.warn("SESSION_SECRET env var is not set — using insecure default. Set it before deploying.");
}

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json({
  verify: (req, _res, body) => {
    (req as Request & { rawBody?: Buffer }).rawBody = Buffer.from(body);
  },
}));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve built frontend (if present) to make the app reachable without running Vite.
const frontendStatic = path.resolve(process.cwd(), "../efootball-manager/dist/public");
if (fs.existsSync(frontendStatic)) {
  app.use(express.static(frontendStatic));

  // SPA fallback: serve index.html for any non-API GET request
  app.get("/*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendStatic, "index.html"));
  });
}

// Global async error handler — catches unhandled promise rejections in route handlers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled route error");
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default app;
