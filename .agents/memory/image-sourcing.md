---
name: Image sourcing
description: Image sourcing fallback for visual updates in this workspace.
---

When matching an uploaded visual reference, inspect the attached and existing public assets before relying on public image search.

**Why:** Public image search returned an unavailable/422 response during a pack-module background search, while the repl already contained relevant football imagery.

**How to apply:** Prefer a local asset that matches the subject and composition, then use overlays and cropping to fit the existing UI. Only add an external image after it has been successfully downloaded and reviewed.