---
name: Authentication session handling
description: The app uses one express-session cookie for both admin and regular-user authentication.
---

Admin and regular-user authentication use separate API paths, cookies, and session middleware. Admin sessions use the admin-only cookie and routes; regular accounts use the user-only cookie and routes.

**Why:** Admin pages previously received a successful login response but then returned 403 because admin and user identity data shared one session and could overwrite each other.

**How to apply:** Keep `credentials: "include"` on browser requests. Use `/api/admin/auth/me` for admin state and `/api/users/me` for user state. After migrating from the old shared cookie, a browser refresh or cookie clear may be needed once.