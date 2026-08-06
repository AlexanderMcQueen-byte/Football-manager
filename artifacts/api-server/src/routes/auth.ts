import { Router, type IRouter } from "express";
import { adminSession } from "../lib/sessions";

const router: IRouter = Router();

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "efootball2026";

declare module "express-session" {
  interface SessionData {
    role: "admin" | "viewer";
  }
}

router.use("/admin/auth", adminSession);

router.post("/admin/auth/login", (req, res) => {
  const { username, password } = req.body ?? {};

  if (
    typeof username === "string" &&
    typeof password === "string" &&
    username === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD
  ) {
    req.session.role = "admin";
    req.session.save((saveError) => {
      if (saveError) {
        res.status(500).json({ error: "Session save failed" });
        return;
      }
      res.json({ role: "admin" });
    });
    return;
  }

  res.status(401).json({ error: "Invalid credentials" });
});

router.post("/admin/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("efm.admin.sid");
    res.json({ ok: true });
  });
});

router.get("/admin/auth/me", (req, res) => {
  const role = req.session?.role ?? "viewer";
  res.json({ role });
});

export default router;
