import { useEffect } from "react";

// Fired after every loop jump; detail.offset is how far scrollY moved.
export const SCROLL_LOOP_EVENT = "scrollloop";

const TRANSITION_MS = 1600;
// After arriving at the socials or the hero top (or finishing a transition),
// wheel events are swallowed until the stream pauses this long. That eats a
// fast flick's momentum, so only a fresh scroll gesture can move on...
const MOMENTUM_GAP_MS = 250;
// ...and never sooner than this
const ARM_AFTER_MS = 600;
// Then it takes this much deliberate scrolling to move on
const WHEEL_THRESHOLD = 220;
const TOUCH_THRESHOLD = 70;

const DOWN_KEYS = ["ArrowDown", "PageDown", " "];
const UP_KEYS = ["ArrowUp", "PageUp"];

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/*
 * Endless scrolling, Igloo-style. The page ends with the socials section
 * (#finale) followed by a copy of the hero (loopRef). Reaching the copy jumps
 * to the real hero, which looks identical, so the jump is invisible.
 *
 * Between the socials and the hero there is no free scrolling: pushing on
 * past the socials (or up past the top of the hero) plays a timed transition
 * to the other side, and stopping anywhere in between settles on the nearer.
 */
export default function useScrollLoop(loopRef, finaleId = "finale") {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animating = false;
    let swallowMomentum = false;
    let armUntil = 0;
    let pushed = 0;
    let lastWheel = 0;
    let lastY = window.scrollY;
    let touchY = 0;
    let idleTimer;
    let frame;

    const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;
    const stops = () => {
      const finale = document.getElementById(finaleId);
      if (!loopRef.current || !finale) return null;
      return { finale: docTop(finale), loop: docTop(loopRef.current) };
    };
    const atFinale = (p) => Math.abs(window.scrollY - p.finale) < 4;
    const atHeroTop = () => window.scrollY <= 1;
    // Called on arriving at a stop: hold here until the user scrolls afresh
    const arm = () => {
      armUntil = performance.now() + ARM_AFTER_MS;
      swallowMomentum = true;
      pushed = 0;
    };

    const jump = (top) => {
      const offset = top - window.scrollY;
      window.scrollTo({ top, behavior: "instant" });
      window.dispatchEvent(new CustomEvent(SCROLL_LOOP_EVENT, { detail: { offset } }));
    };

    const tweenTo = (target, onDone) => {
      animating = true;
      cancelAnimationFrame(frame);
      const start = window.scrollY;
      const distance = target - start;
      const duration = reducedMotion
        ? 0
        : TRANSITION_MS * Math.max(0.35, Math.min(1, Math.abs(distance) / window.innerHeight));
      const t0 = performance.now();

      const step = (now) => {
        const t = duration ? Math.min(1, (now - t0) / duration) : 1;
        window.scrollTo({ top: start + distance * easeInOutCubic(t), behavior: "instant" });
        if (t < 1) {
          frame = requestAnimationFrame(step);
          return;
        }
        animating = false;
        lastY = window.scrollY;
        onDone?.();
        arm();
      };
      frame = requestAnimationFrame(step);
    };

    // Land on the copy, then swap in the real hero
    const swapToHero = () => {
      lastY = 0;
      jump(0);
    };

    // Socials -> hero: travel onto the copy, then swap in the real hero
    const toHero = () => {
      const p = stops();
      if (p) tweenTo(p.loop, swapToHero);
    };

    // Hero -> socials: swap in the copy, then travel back up to the socials
    const toFinale = () => {
      const p = stops();
      if (!p) return;
      animating = true;
      jump(p.loop);
      tweenTo(p.finale);
    };

    // Wherever scrolling comes to rest near the loop, settle on a stop
    const settle = () => {
      const p = stops();
      if (animating || !p) return;
      const y = window.scrollY;
      if (y > p.finale + 4 && y < p.loop) {
        if (y - p.finale < (p.loop - p.finale) / 2) tweenTo(p.finale);
        else tweenTo(p.loop, swapToHero);
      } else if (y < p.finale - 4 && y > p.finale - window.innerHeight * 0.35) {
        tweenTo(p.finale);
      }
    };

    const onScroll = () => {
      if (animating) return;
      const p = stops();
      if (!p) return;
      const y = window.scrollY;

      // Barrier: however fast the page moves (smooth-scrolled wheel, End key,
      // scrollbar), it can't pass the socials going down without a transition
      if (lastY <= p.finale + 1 && y > p.finale + 1) {
        window.scrollTo({ top: p.finale, behavior: "instant" });
        lastY = p.finale;
        arm();
        return;
      }
      // Safety net: anything that still reaches the copy loops round
      if (y >= p.loop) {
        jump(y - p.loop);
        lastY = window.scrollY;
        return;
      }
      // Arriving at a stop under the user's own scrolling
      if ((lastY < p.finale - 4 && atFinale(p)) || (lastY > 1 && atHeroTop())) arm();
      lastY = y;

      clearTimeout(idleTimer);
      idleTimer = setTimeout(settle, 180);
    };

    const onWheel = (e) => {
      const now = performance.now();
      const gap = now - lastWheel;
      lastWheel = now;
      if (animating) {
        e.preventDefault();
        return;
      }
      if (swallowMomentum) {
        if (gap < MOMENTUM_GAP_MS) {
          e.preventDefault();
          return;
        }
        swallowMomentum = false;
      }
      const p = stops();
      if (!p) return;

      const px = e.deltaY * (e.deltaMode === 1 ? 33 : 1);
      const down = px > 0;
      const y = window.scrollY;

      // Coming down from Contact: stop on the socials instead of sailing past
      if (down && y < p.finale - 1 && y + px > p.finale) {
        e.preventDefault();
        window.scrollTo({ top: p.finale, behavior: "instant" });
        arm();
        return;
      }

      if ((down && atFinale(p)) || (!down && atHeroTop())) {
        e.preventDefault();
        if (now < armUntil) return;
        if (gap > 400) pushed = 0;
        pushed += Math.abs(px);
        if (pushed > WHEEL_THRESHOLD) {
          pushed = 0;
          if (down) toHero();
          else toFinale();
        }
      }
    };

    const onTouchStart = (e) => {
      touchY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (animating) {
        e.preventDefault();
        return;
      }
      const p = stops();
      if (!p) return;
      // Swiping up = scrolling down. Swiping down at the top is left alone so
      // it doesn't fight pull-to-refresh.
      if (touchY - e.touches[0].clientY > 0 && atFinale(p)) {
        e.preventDefault();
        if (touchY - e.touches[0].clientY > TOUCH_THRESHOLD && performance.now() > armUntil) toHero();
      }
    };

    const onKeyDown = (e) => {
      if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
      const down = DOWN_KEYS.includes(e.key) && !(e.key === " " && e.shiftKey);
      const up = UP_KEYS.includes(e.key) || (e.key === " " && e.shiftKey);
      if (!down && !up) return;
      if (animating) {
        e.preventDefault();
        return;
      }
      const p = stops();
      if (!p) return;
      if (down && atFinale(p)) {
        e.preventDefault();
        toHero();
      } else if (up && atHeroTop()) {
        e.preventDefault();
        toFinale();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(idleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [loopRef, finaleId]);
}
