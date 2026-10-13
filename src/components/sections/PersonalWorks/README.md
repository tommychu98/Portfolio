# PERSONAL WORKS

Reference: https://project-portfolio-gules.vercel.app/

Reference HTML, deployed CSS and animation JavaScript were inspected. The source uses paired portrait images (9:13), a large circular orbit with 20 degrees between projects, scroll-linked selection, split/rotated active cards, and a detail transition that moves the images left while revealing the description. Only that work-browsing pattern is adapted here; gutters, layout and control behavior remain unchanged. Typography and colors now follow the attached poster palette and the updated root design-guideline.md.

ÉLAN and ONDA use the existing content data and image component. Desktop browsing spans one viewport of scroll for the two works. This section reuses the shared scroll module and owns only its own GSAP context/trigger. Below 1024px, below 740px height, or with reduced motion enabled, both works appear sequentially. The native modal provides detail content; closing restores focus and releases the shared scroll lock.

## Validation

Run from the app directory:

```powershell
npm run build
node src/components/sections/PersonalWorks/PersonalWorks.test.mjs desktop
node src/components/sections/PersonalWorks/PersonalWorks.test.mjs mobile
node src/components/sections/PersonalWorks/PersonalWorks.test.mjs reduced
```

The three simulated DOM modes passed checks for both works, project links, opening/closing, Escape, focus restoration, unmount cleanup and isolation from unrelated scroll triggers. These tests do not measure rendered layout or native focus trapping.

Outstanding: the connected browser was unavailable, so reference interaction, visual comparison, physical viewport overflow and real scroll pin entry/exit have not been verified in a browser. Start the app with `npm run dev` and open `/#personal`.
