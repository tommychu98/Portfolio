# INTRO and first-entry loader — 2026-10-13

The INTRO uses the two supplied blue/ivory sheets. Other 14 sections, shared header, content and global scrolling remain unchanged; App.jsx only wires the loader and Intro.

## Assets
`extract-icons.ps1` extracts 36 UI icons and 9 studio icons using original RGBA pixels without recoloring or resampling. The PNGs and source bounds are in `assets/icons/`. All 45 assets remain available; the INTRO mixes 18 icons, with 11 shown below 821px. The old generated atlas is retained but no longer rendered.

## Behavior
- Best-candidate random scattering runs only on initialization. Varying sizes and rotations, with a lower initial central density. Resizing preserves existing position ratios; reset returns to the same initial arrangement.
- Only stage edges constrain coordinates. Central text is transparent and pointer-events:none, in a higher stacking layer than all icons, including the dragged icon.
- Real object buttons hold pointer capture. Each move uses current stage-relative coordinates and the original grab offset. Pointer-up applies damped inertia; cancellation clears velocity.
- No drag boxes, labels, dotted borders, native image dragging or text selection. Keyboard focus remains a solid blue outline; arrows move and Home restores position.
- Touch-action:none and Lenis prevention apply only to individual object buttons.
- The separate Preloader folder contains component, CSS and motion. SVG browser/cursor paths draw with GSAP stroke-dashoffset. Image decode and actual font loads gate exit, with a 5-second maximum and a CSS fallback. Reduced motion uses a short fade.
- No new Lenis instance or global ScrollTrigger. Animations/listeners/observers are cleaned up; INTRO motion pauses offscreen.

## Verification
Build and scoped lint pass. INTRO simulated-DOM tests cover desktop, mobile and reduced motion; pointer capture, uninterrupted central crossing, keyboard movement/reset, cancellation, StrictMode cleanup, 840 inertia trajectories per mode, and 83 protected files. Preloader tests cover loaded, failed, indefinitely pending images, reduced motion and unmount cleanup.

```powershell
npm run build
npx oxlint src/components/sections/Intro src/components/Preloader src/App.jsx
node src/components/sections/Intro/Intro.test.mjs desktop
node src/components/sections/Intro/Intro.test.mjs mobile
node src/components/sections/Intro/Intro.test.mjs reduced
node src/components/Preloader/Preloader.test.mjs
```

## Real-browser limitation
The browser runtime returned an empty browser list on 2026-10-13. The reference https://smllns-portfolio.vercel.app/ could be read, but its UI could not be operated. Real-browser drag/scroll behavior, visual placement, first-entry comparison and screenshot preview remain unverified. DOM tests are not a substitute for those checks.

Running development preview: http://127.0.0.1:5173/
