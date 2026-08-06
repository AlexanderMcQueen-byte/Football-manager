---
name: Soccer-master theme adaptation
description: The uploaded soccer-master visual language is the shared app theme while marketplace functionality remains intact.
---

Use the soccer-master direction for future visual work: charcoal surfaces, pink-magenta accents, Montserrat-heavy headings, match photography, bold uppercase labels, and compact match/news-inspired cards. Keep the marketplace as a feature within this visual system rather than reverting the app to separate indigo/orange branding.

**Why:** The user asked for the uploaded soccer-master theme to fit the existing tournament website, so preserving app functionality while unifying the visual language is the intended approach.

**How to apply:** Prefer the existing soccer-theme assets and shared CSS tokens for new pages; avoid importing the archive's legacy Bootstrap layout or replacing the React routing.

## Live eFootball update source

The Home pack-watch feature uses EFHub as the primary public source, with source links and a visible live-index versus verified-snapshot status. EFHub's pack index can be reachable while individual current pack slugs return 404s to server-side requests, so the app must not claim the fallback snapshot is live.

**Why:** Public source behavior was inconsistent during integration; transparent freshness labeling is safer than silently presenting stale pack dates as current.

**How to apply:** Keep the server-side cache and source attribution, refresh the EFHub index periodically, and link Konami's official announcements for confirmation. Training guidance should remain role-based and tell users to verify the in-game progression preview.