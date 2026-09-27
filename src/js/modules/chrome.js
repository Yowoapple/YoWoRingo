import { asset } from '../utils/device.js';

const NAV = home => `
  <header class="nav">
    <a class="wordmark" href="${home}" aria-label="YoWoRingo home">
      <span class="wordmark__text">YoWoRingo</span><span class="wordmark__px" aria-hidden="true"></span>
    </a>
    <div class="nav__actions">
      <button class="nav__btn" type="button" data-lang aria-label="Language">
        <svg class="nav__globe" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M4.6 7.5h14.8M4.6 16.5h14.8"/></svg>
        <span class="nav__btn-label" data-lang-label>EN</span>
      </button>
      <button class="nav__btn" type="button" data-sound aria-pressed="false" aria-label="Sound">
        <span class="sound-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <span class="nav__btn-label">Sound</span>
      </button>
      <button class="nav__btn" type="button" data-palette-open aria-label="Open menu">
        <span class="nav__btn-label">Menu</span><kbd class="nav__kbd">Ctrl K</kbd>
      </button>
    </div>
  </header>`;

const ISLAND = label => `
  <div class="island" data-island-el>
    <div class="island__view island__view--compact is-active" data-view="compact">
      <button class="island__pill" type="button" data-island-toggle aria-expanded="false" aria-label="Section and music player">
        <span class="island__disc" aria-hidden="true"></span>
        <span class="island__px" aria-hidden="true"></span>
        <span class="island__label" data-island-label>${label}</span>
        <span class="island__eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      </button>
    </div>
    <div class="island__view island__view--notice" data-view="notice" role="status" aria-live="polite">
      <svg class="check" viewBox="0 0 24 24" aria-hidden="true"><circle class="check__ring" cx="12" cy="12" r="10"/><path class="check__mark" d="M7 12.5l3.2 3.2L17 9"/></svg>
      <span class="toast__dot" aria-hidden="true"></span>
      <span class="island__notice" data-notice-text></span>
    </div>
    <div class="island__view island__view--player" data-view="player" data-island-panel>
      <div class="player">
        <button class="island__collapse" type="button" data-island-collapse aria-label="Collapse player"></button>
        <div class="player__meta">
          <span class="label">Now playing</span>
          <strong class="player__title">Got any Ringo?</strong>
          <span class="label">Generative / Web Audio / 84 BPM</span>
        </div>
        <div class="player__row">
          <button class="player__play" type="button" data-play aria-label="Play" aria-pressed="false"><span class="player__icon" aria-hidden="true"></span></button>
          <div class="scrubber">
            <input class="range" type="range" data-scrub min="0" max="1000" value="0" aria-label="Seek">
            <div class="scrubber__times"><span class="label" data-time>0:00</span><span class="label" data-duration>0:00</span></div>
          </div>
        </div>
        <div class="player__row player__row--split">
          <label class="volume"><span class="label">Vol</span><input class="range" type="range" data-volume min="0" max="100" value="80" aria-label="Volume"></label>
          <label class="toggle"><input type="checkbox" data-sfx checked><span class="toggle__track" aria-hidden="true"><span class="toggle__thumb"></span></span><span class="label">SFX</span></label>
        </div>
      </div>
    </div>
  </div>`;

const FOOT = () => `
  <footer class="foot">
    <span class="label">&copy; 2026 YoWoRingo / ${import.meta.env.VITE_LEGAL_NAME}</span>
    <span class="label">Chinese type set in HarmonyOS Sans</span>
    <a class="label" href="#top" data-top>Back to top</a>
  </footer>`;

export function mountChrome({ label = '' } = {}) {
  if (!document.querySelector('.nav')) document.body.insertAdjacentHTML('afterbegin', NAV(asset('')));
  if (!document.querySelector('[data-island-el]')) document.querySelector('.nav').insertAdjacentHTML('afterend', ISLAND(label));
  if (!document.querySelector('.foot')) document.body.insertAdjacentHTML('beforeend', FOOT());
}
