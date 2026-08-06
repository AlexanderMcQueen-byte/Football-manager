import session from "express-session";

const sessionSecret = process.env.SESSION_SECRET ?? "change-me-in-production";
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

export const userSession = session({
  name: "efm.user.sid",
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: cookieOptions,
});

export const adminSession = session({
  name: "efm.admin.sid",
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: cookieOptions,
});

export function hasCookie(req: { headers: { cookie?: string } }, name: string): boolean {
  return new RegExp(`(?:^|;\\s*)${name}=`).test(req.headers.cookie ?? "");
}