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

The uploaded `bg_1.jpg`, `bg_2.jpg`, and `bg_3.jpg` assets are the shared full-site background layer behind Home, Marketplace, and other routes; use dark overlays to preserve readability.

**Why:** The user requested the uploaded theme background to be used throughout the full website rather than only on one page.

**How to apply:** Add new route content above the shared layout background instead of replacing it with unrelated page-specific imagery.

The eFHUB reference is applied only to the shared top header: compact dark navigation, mint accent controls, and an eFootball Mobile/search strip. Page content, footer, and the rest of the soccer-master theme remain unchanged.

**Why:** The user specifically requested the uploaded eFHUB treatment on the top bar only.

**How to apply:** Keep future eFHUB-inspired adjustments scoped to the header unless the user explicitly asks to extend that visual treatment elsewhere.

The footer follows the uploaded reference with four quiet link columns (News, Tickets, Matches, Social) and a centered copyright line instead of a large branded CTA layout.

**Why:** The user requested the reference footer structure while retaining real app navigation destinations.

**How to apply:** Preserve the restrained charcoal surface, muted gray links, generous spacing, and small pink-accented attribution when updating footer content.

The Upcoming eFootball Packs module now follows an EFHub-inspired dark presentation: charcoal surfaces, white headings, muted gray metadata, and pink/magenta accents. This dark treatment is scoped to the pack module only.

**Why:** The user requested the pack content to be displayed in the dark EFHub style while preserving the rest of the site’s existing visual boundaries.

**How to apply:** Keep the module dark when updating pack content or controls; do not extend this treatment to the rest of the app unless explicitly requested.