import { Request, Response, NextFunction } from "express";
import { adminSession } from "../lib/sessions";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  adminSession(req, res, (sessionError) => {
    if (sessionError) {
      next(sessionError);
      return;
    }
    if (req.session?.role === "admin") {
      next();
      return;
    }
    res.status(403).json({ error: "Admin access required" });
  });
}
