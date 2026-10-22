# Personal memory wall

The existing Work Ethic / Q&A About component is unchanged. `MemoryWall` replaces
the old Closing section at position 16, retaining `#closing` for existing anchors.
Header, footer, numbering, and global scrolling are unchanged.

Edit `memories.js` to add or replace photos. Web derivatives live under
`public/media/images/about/memories/`. Use unique, stable `id` values. `title`,
`category`, `year`, `alt`, and `description` are editable. Blank dates are omitted;
a reverse face requires both an image and a nonempty description.

On entry, photo 01 is selected. Once its entrance/selection motion finishes,
autoplay waits five seconds, advances in photo order, and wraps from 10 to 01.
Manual selection or previous/next navigation restarts the delay from that photo.
Showing the reverse face pauses autoplay; returning to the front starts a fresh
five-second delay. Leaving the section gathers the cards and clears the timer;
reentry starts at 01. Hidden browser tabs also pause and restart with a fresh
delay when visible. Run `node artifacts/verify-memory-autoplay.mjs` to check these
interactions on desktop and mobile.

The ten current photos and six transparent paper frames were supplied by the
user. Previous stock placeholders and profile/study pictures are no longer used
in this wall. Descriptions only describe visible scenes; replace them with personal
stories and dates when available. No filters or color grading are applied.

Each memory has `frame`, `aspect` (after EXIF orientation), `focal: [x, y]` in
normalized source coordinates, and `zoom`. Unlike CSS object-position, the focal
coordinates locate a subject in the actual image: the crop places it in the center
where source edges permit, with no blank areas or distortion. Both desktop and
mobile use the same crop. Wide group photos use landscape frames to retain people.

`memoryFrames.js` maps each supplied PNG's paper and photo opening in original
pixel coordinates. An SVG viewBox trims transparent outer margins without changing
the frame. The photo, supplied frame overlay and caption share the animated front
face. Each card retains its frame's aspect ratio and the layout measures every
card separately before arranging it.

`scripts/import-memory-assets.ps1` creates web derivatives, fixes EXIF orientation
(notably `fine3.jpg`), and preserves PNG alpha. Original Downloads are untouched.
On Windows PowerShell 5.1 run it from the project root with UTF-8 decoding:

```powershell
& ([scriptblock]::Create((Get-Content -Raw -Encoding utf8 scripts/import-memory-assets.ps1)))
```

Seeded layouts are stable until a new selection. The outer button owns position,
rotation and scale; inner faces independently crossfade. Interrupted timelines
continue from actual DOM transforms. ResizeObserver remeasures bounds without
changing selection or shuffle revision. Context cleanup supports StrictMode.

`MemoryWall.layout.js` scatters cards without rows using seeded candidate sampling.
Focused layouts exclude a rectangle around the selected card, including the full
rotated bounds of every surrounding card. Minimum edge clearance is 56px on wide
desktops, 44px on tablets, and 34px on phones. Narrow layouts can slightly reduce
background cards to fit, while the selected photo keeps its full enlarged size.
Unselected photos and the stack use .62 scale. The selected photo is capped by
52% of the sky width and 60% of its height (maximum 1.42) to leave peripheral space.
The final rotation-independent safety constraint can reduce any card further.

The stage now spans the viewport, with seeded edge/corner anchors distributing
photos across the legal sky region rather than concentrating them in the
middle. `memoryProps.js` defines eight user-supplied transparent decorative PNGs
and per-photo associations. Associations are visual motifs: masks where visible,
camera/light/script/clapper for film and stage scenes, palms for outdoor scenes,
and the car as a travel motif (not a claim of ownership or a pictured vehicle).
Edit `memoryAssociations` to change which two or three objects accompany a photo.

Props are persistent, noninteractive DOM/SVG nodes. They scatter with saved seeds;
related objects gather just outside the focused paper's corners in the same GSAP
timeline, with a short settle and a subtle response to the reverse face. Unrelated
objects choose peripheral space with overlap avoidance. Objects render in their
own foreground stacking layer above the separate photo layer, including the selected
photo, at full opacity. Related props visibly overlap the paper corners and sit above
unrelated props. Their pointer events are disabled so photo clicks still work.
Reduced motion and context cleanup apply to both photos and decorative objects.

Click/tap a card to select, then click again to read its description when present.
Previous/Next wrap around. Arrow keys navigate while inside the gallery; Escape
returns to the photo. Reduced-motion settings disable movement.

Scroll lifecycle: photos start stacked at the sky center. A single local
ScrollTrigger (`top bottom` → `bottom top`) checks actual section/stage bounds.
Stage entry automatically scatters (1.28s, 0.055s stagger). Gather starts only
when the entire section is outside the viewport (1.02s, 0.035s stagger), not when
just the photo stage disappears. IntersectionObserver also reconciles upstream
layout changes. State is exposed as `data-memory-state`: stacked, scattering,
scattered, focusing, focused, gathering. Interruptions kill the old timeline and
continue from current transforms; reentry clears selection and uses the same seed.
Resize retains the current target, and cleanup removes both observers and trigger.
No pinning or additional scroll driver is used.

## LA desert scene

`la-desert-background.png` is a byte-for-byte copy of the supplied
`사막의 고독한 후드 인물.png` (SHA256
`C0896E5D481ADCF9F819B8B489196FD14034B029414420F573D72DB2F8078C01`).
The current scene uses la-desert-composed-v4.png, generated from original la3.jpg. The person, gravel, shrubs and long cast shadow are embedded in one photograph, so responsive crops retain their shared perspective. The sky uses a person-free upper crop; the landscape uses a centered, aspect-preserving SVG crop. An invisible SVG rectangle reserves space for the embedded person. No separately scaled figure or synthetic shadow is rendered. Prompts: artifacts/memory-fullbleed/generation-v4.json.

Scene geometry measures the actual sky, landscape and figure elements. The
legal card region excludes the heading and stops above both the landscape and
the figure. Stack, scatter, focus, shuffle and props all use this same region.

Safety uses half the card diagonal as a conservative radius for any rotation.
Sticker radii additionally include 15% for inner art pulses. Position and scale
use the same non-overshooting ease, so intermediate straight paths stay inside
the convex sky band. Resizing reprojects old transforms synchronously inside
ResizeObserver before paint, then continues toward the current state's target.
On phones, smaller photos/stickers and a shorter stage preserve the card area
and keep the entire figure visible. All ten photos and all eight props remain.

Run `node scripts/check-memory-desert.mjs` with the Vite development server
running. Current scene screenshots and per-rendered-frame bounds checks are
saved under `artifacts/memory-wall/desert/`. It exercises desktop, tablet,
mobile touch, all ten selections, shuffle, flip, rapid clicks, complete exits,
interrupted gather/reentry and resize. Earlier `check-memory-wall.mjs` and
`check-memory-scroll.mjs` artifacts record the previous paper-only layout and
its original center/scale assumptions; use the desert test for this scene.
