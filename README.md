<a href="https://yowoapple.github.io/YoWoRingo/">
  <img src="public/readme/hero.svg" width="100%" alt="YoWoRingo. Got any Ringo?">
</a>

<p align="center">
  <b>English</b> &nbsp;·&nbsp; <a href="README.zh-TW.md">繁體中文</a> &nbsp;·&nbsp; <a href="README.zh-CN.md">简体中文</a> &nbsp;·&nbsp; <a href="README.ja.md">日本語</a>
</p>

<p align="center">
  <a href="https://yowoapple.github.io/YoWoRingo/"><b>yowoapple.github.io/YoWoRingo</b></a>
</p>

---

# YoWoRingo

The portfolio of YoWoRingo, founder of TWERG, game developer and street photographer from New Taipei, Taiwan.

It is not a template with my name typed into it. Every section is a small piece of interaction design, built by hand in plain JavaScript and CSS: a portrait made of pixels, a name you can pick up and throw, a soundtrack composed live in your browser, and a photo gallery you zoom through by scrolling.

<br>

## Design Philosophy

### Colour only happens when something happens

The whole site lives in near-black `#0B0B0C`, paper white `#EFEEEA` and a quiet grey `#85847F`. One colour breaks the silence: ultramarine `#2B3BFF`. It never decorates. It only appears when an event happens: a hover, a transition, the track that is playing, the section you are reading, the key you just focused. When blue shows up, something is going on.

### Type is the interface

Text here does more than fade in. It breaks apart, reassembles and gets thrown around. The name is written as an equation. A counter ticks from Day 001 to Day 100 as you scroll. Headlines are set huge, on a strict grid, with generous silence around them. The approach borrows from Korean studios such as [RAYRAYlab](https://rayraylab.com), [Plus X](https://15th.plus-ex.com) and [DOES](https://does.kr): monochrome, oversized type, precise alignment, and restraint with colour.

### A formal portrait in an unformal place

The site opens with a formal ID photo. It is deliberately stiff, and the rest of the site is anything but. That contrast is the point: the portrait dissolves into pixels under your cursor, then scatters and rebuilds itself as a wordmark when you scroll.

<p align="center">
  <img src="docs/readme/01-portrait.webp" width="49%" alt="The ID portrait, with squares pushed aside where the cursor passes over the face">
  <img src="docs/readme/02-scatter.webp" width="49%" alt="Mid-scroll, thousands of squares fly apart">
</p>
<p align="center">
  <img src="docs/readme/03-wordmark.webp" width="98.5%" alt="The squares land and spell YoWoRingo">
</p>

### Sound, but only with consent

A website can feel alive through sound as well as motion. Every click, shutter and collision has a small synthesized sound, and there is a soundtrack. None of it plays until you choose "Enter with sound" at the door. No audio files are downloaded: everything is generated in real time with the Web Audio API.

### Honest by design

The work pages say what was built and why, never more. The earthquake replay shows the event where the method helped, and the two where it made things worse, because a portfolio that only shows wins is not worth trusting.

<br>

## Highlights

### Pixel to Person

A Canvas 2D portrait built from a grid of squares sampled from the photo. The squares react to the cursor with a spring simulation, then travel to new positions to form the wordmark as you scroll. On narrower screens and weaker devices the grid automatically becomes coarser.

### Physics Playground

Letters of the name, tags from my story and the four project cards are real rigid bodies (Matter.js). Pick them up, throw them, shake the box. Tap a card to open the project. On phones you can tilt the device to move gravity (iOS asks for permission first). The simulation only runs while the section is on screen.

<p align="center">
  <img src="docs/readme/04-playground.webp" width="98.5%" alt="Project cards, tags and giant letters piled up in the physics playground">
</p>

### The name, as an equation

YoWo (有無, "is there any?") plus Ringo (りんご, "apple" in Japanese) equals "Got any Ringo?". A name that asks a question.

<p align="center">
  <img src="docs/readme/05-name.webp" width="98.5%" alt="YoWo plus Ringo equals Got any Ringo, with the Chinese and Japanese under each term">
</p>

### Works, with a preview that follows you

The work list is set in huge type. Hovering a row paints it ultramarine and a preview card follows the cursor with a little overshoot.

<p align="center">
  <img src="docs/readme/06-works.webp" width="98.5%" alt="Works list with the TWERG row highlighted and its logo card following the cursor">
</p>

### Dynamic Island and a generative soundtrack

The pill at the top shows which section you are in. Click it and it springs open into a music player, with the shape animated by spring curves written in CSS `linear()`. The track "Got any Ringo?" is composed live at 84 BPM over a 32-bar loop. It keeps playing from the same moment when you move to another page, and fades out before you leave.

### Command palette

Press <kbd>Ctrl</kbd> + <kbd>K</kbd> anywhere to jump to any section or page, copy my email, toggle sound or switch languages. On phones it becomes a full-screen sheet. Some commands are not listed.

<p align="center">
  <img src="docs/readme/07-island.webp" width="38%" alt="The Dynamic Island expanded into a music player">
  &nbsp;
  <img src="docs/readme/08-palette.webp" width="58%" alt="The command palette listing sections and pages">
</p>

### Focal Length

Fifty-four street photographs, grouped by focal length from 23 mm to 439 mm. Scrolling is the zoom ring. A lens scale on the right uses a logarithmic ruler, the viewfinder frame narrows as the field of view shrinks, and a live readout shows the current focal length and angle. Opening a photo tints the viewer with that photo's dominant colour, with a shutter sound to match.

<p align="center">
  <img src="docs/readme/09-focal-length.webp" width="49%" alt="Focal Length title page">
  <img src="docs/readme/10-focal-75mm.webp" width="49%" alt="The 75 mm group, with the lens scale and viewfinder frame">
</p>

### Beyond the Point: an earthquake replay

An interactive, retrospective replay of three Taiwanese earthquakes. Drag the divider to compare a classic point-source estimate with a direction-aware one, scrub from T+0 to T+60 seconds, and watch the S-wave front and the key-city chart update. The data were computed offline, so the page ships results and no algorithm.

<p align="center">
  <img src="docs/readme/11-replay.webp" width="98.5%" alt="Replay of the 2024 Hualien earthquake, comparing point-source and direction-aware intensity maps">
</p>

### 100 Days

The page for a dark narrative game in development. The opening is pinned, and scrolling counts the days from 001 to 100 across a hundred-cell track.

<p align="center">
  <img src="docs/readme/12-100-days.webp" width="98.5%" alt="Day 042 of 100 with the progress track">
</p>

### Built for every screen

Every animation is designed for phone, tablet and desktop widths, and some were rebuilt for touch: the horizontal gallery becomes swipeable, the palette becomes a sheet, and the island moves to the bottom.

<p align="center">
  <img src="docs/readme/15-mobile.webp" width="80%" alt="Home, Focal Length and 100 Days on a phone-sized screen">
</p>

<br>

## Three Languages, Zero Layout Shift

English is the main language. Visitors whose browsers prefer Chinese are switched automatically to Traditional or Simplified Chinese, and the globe button cycles through EN, 繁 and 简.

- **Localized, not converted.** Traditional Chinese is written for Taiwan. Simplified Chinese uses mainland terms such as 视频, 简历 and 烈度 instead of only swapping characters.
- **Nothing jumps.** Both Chinese variants use the same variable font with the same weight range, so switching between them moves no line on the page. The paragraph you were reading stays where it was.
- **Ready before you click.** The next language's dictionary is prefetched while the browser is idle, and its font starts loading the moment you hover the button, so the switch itself is instant.
- **Fonts stay light.** HarmonyOS Sans is subset to only the characters the site uses and split so that English pages need just 9 KB of Chinese glyphs.

<p align="center">
  <img src="docs/readme/13-languages.webp" width="98.5%" alt="The same TWERG header in English, Traditional Chinese and Simplified Chinese, with identical layout">
</p>

<br>

## Accessibility

Heavy interaction should not lock anyone out.

- **Keyboard first.** Every control, including the physics cards, the island, the player and the lightbox, works with <kbd>Tab</kbd>, <kbd>Enter</kbd>, <kbd>Esc</kbd> and the arrow keys.
- **Skip to content.** The first <kbd>Tab</kbd> on every page reveals a link that jumps past the navigation.
- **Dialogs behave.** While the palette or the lightbox is open the page behind it is made inert, and closing it returns focus to where you were.
- **Screen readers.** Icon buttons are labelled, decorative canvases are hidden, every section has a heading, every photo has a description, notifications are announced, and the page language follows the language switch.
- **Reduced motion is respected.** With the system setting on, smooth scrolling, the pixel intro, scroll reveals and transitions all step aside and the content simply appears.

<p align="center">
  <img src="docs/readme/14-skip-link.webp" width="60%" alt="The Skip to content link revealed by the first Tab key press">
</p>

<br>

## Performance

- Canvas and physics loops pause as soon as their section leaves the screen.
- Pixel density adapts to the device.
- Photos ship as AVIF and WebP in three sizes, with a blurred placeholder and the photo's dominant colour, and load only when needed.
- The demo video is not fetched until it is about to be seen.
- Chinese dictionaries and fonts are loaded on demand.
- Measured on desktop: largest contentful paint around 0.2 s and a cumulative layout shift of 0.

<br>

## Built With

| | |
|---|---|
| Build | [Vite](https://vite.dev) (multi-page), vanilla JavaScript, no UI framework |
| Motion | [GSAP](https://gsap.com) with ScrollTrigger, [Lenis](https://lenis.darkroom.engineering), CSS `linear()` spring curves, View Transitions API |
| Interaction | [Matter.js](https://brm.io/matter-js/), Canvas 2D, Web Audio API |
| Type | [Schibsted Grotesk](https://fonts.google.com/specimen/Schibsted+Grotesk), [Azeret Mono](https://fonts.google.com/specimen/Azeret+Mono), HarmonyOS Sans TC / SC by Huawei |
| Assets | [sharp](https://sharp.pixelplumbing.com), [subset-font](https://github.com/papandreou/subset-font), [fontkit](https://github.com/foliojs/fontkit), [OpenCC](https://github.com/nk2028/opencc-js) |
| Hosting | GitHub Pages, deployed by GitHub Actions on every push to `main` |

<br>

## Project Structure

```
index.html, photography/, works/{twerg,plum,galgame}/, 404.html   pages
src/css/        design tokens, base styles, components, page styles
src/js/         entry points, shared site chrome, modules, page scripts
src/i18n/       Traditional and Simplified Chinese dictionaries
src/data/       photo metadata and precomputed replay data
public/         processed images, fonts, video, icons, share images
scripts/        asset pipelines (photos, portrait, fonts, i18n, brand)
docs/readme/    screenshots used in these READMEs
```

## Running Locally

```bash
npm install
npm run dev        # development server
npm run build      # production build into dist/
npm run preview    # serve the production build
```

The asset scripts (`npm run photos`, `portrait`, `works`, `fonts`, `i18n`, `brand`, `readme`) regenerate everything in `public/` from original files. Those originals, such as full-resolution photos and font sources, are not part of this repository, so these scripts will not run on a fresh clone. The processed results they produce are already committed.

<br>

## License

**All rights reserved.** This repository is public so that you can read it and learn from it. You may not copy, reuse, modify, redistribute or use any part of it commercially, including the code, design, text, photographs, portrait, music and logos. See [LICENSE](LICENSE) for the full terms.

Third-party libraries and fonts remain under their own licenses.

<br>

<p align="center">
  <sub>Got any Ringo? &nbsp;·&nbsp; <a href="mailto:apple@twerg.org">apple@twerg.org</a> &nbsp;·&nbsp; <a href="https://www.instagram.com/yowoapple/">Instagram</a> &nbsp;·&nbsp; <a href="https://x.com/AppleJackOAO">X</a></sub>
</p>
