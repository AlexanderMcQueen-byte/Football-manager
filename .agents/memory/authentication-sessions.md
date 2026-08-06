---
name: Authentication session handling
description: The app uses one express-session cookie for both admin and regular-user authentication.
---

Admin and regular-user authentication are mutually exclusive identities stored in the same session. When switching login modes, clear the previous identity, set the new role or user ID, and wait for the explicit session save before returning success.

**Why:** Admin pages previously received a successful login response but then returned 403 because the session did not consistently contain the admin role on the following request.

**How to apply:** Keep `credentials: "include"` on browser requests and treat `/api/auth/me` plus the protected endpoint as the source of truth when debugging admin access.