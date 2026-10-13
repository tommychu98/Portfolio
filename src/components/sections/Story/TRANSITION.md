# INTRO → STORY: expanding circle (supersedes the previous curved wipe)

The old quadratic wipe is removed. A one-screen, relative, overflow-hidden wrapper precedes the existing introduction content. It contains an absolute 40×40px blue circle at left 50%, top 5%, translateX(-50%), with top-center transform origin. STORY's permanent background is now #194e73; text on that background is #f3e6c7.

The existing FROM OFFICE / TO WEB DESIGN. wording and font are retained. One timeline expands the circle to 200vmax (both dimensions) using power1.inOut while line 1 moves -100vw → -10vw and line 2 moves 100vw → 10vw using power2.out. All start at time zero with equal duration. ScrollTrigger uses top 80% → top 20%, scrub 1.2.

A second trigger moves the circle to -30vh, top 5% → bottom bottom, scrub 1 / power1.inOut. This trigger uses the entire STORY (wrapper plus introduction) so its end is later than its start. Using a single screen for both endpoints would produce a reversed range. Existing introductory images enter from 50vh to zero with circ.out at body top 40% → top 20%, scrub 1.2. Existing introduction items enter with y50/opacity0, duration .8, stagger .2 / power2.out, and reverse when scrolling back above the start. The former image-y parallax initializer is no longer connected.

To avoid difference blending's unintended colors, each moving line contains one accessible text span and an identical aria-hidden inverse span. Both share all typography and transforms. On each scrub animation update, the rendered circle and line bounding boxes produce a local CSS circle clip. Thus colors remain exactly blue and ivory and their boundary follows the actual smoothed circle, not an independently interpolated progress.

The App, Intro icon positions/dragging, fonts, other sections, global Lenis instance and original personal content remain unchanged. Reduced motion uses a static blue screen and settled ivory headings; introduction content remains visible. MatchMedia owns tween/trigger cleanup; observers and refresh listeners are also removed.

## Checks

Build and scoped lint pass. Simulated-DOM tests verify one accessible title, two matching visual copies, timeline endpoint dimensions and line positions, forward/reverse equivalence, trigger settings, StrictMode cleanup and reduced motion. Geometry tests cover 105 circle/line-coordinate cases. These are not browser pixel tests.

Commands:
- node src/components/sections/Story/StoryTransition.test.mjs
- node src/components/sections/Story/StoryTransition.test.mjs reduced
- npx oxlint src/components/sections/Story
- npm run build

## Outstanding real-browser comparison

The browser runtime returns an empty list. The referenced live page can be read but cannot be operated. The four referenced attachments are not visible in the received message. Implementation follows the exact values supplied by the user; matching rendered reference frames, real scroll scrubbing, mobile clipping and introduction entry remain unverified.

Preview: http://127.0.0.1:5173/
