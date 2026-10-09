import { useEffect, useState } from "react";
import { MoveLeft, MoveRight } from "lucide-react";
import { SOCIALS, SOCIAL_SELECT_EVENT } from "../data/socials";

/*
 * End of the page, Igloo-style: the particle background (ParticleScene) forms
 * the selected social icon in the middle of this section. The arrows and the
 * label strip switch icons; only the bracketed label opens the link. Snapping
 * to this section and looping back to the hero live in useScrollLoop.
 */
export default function Socials() {
  const [index, setIndex] = useState(0);

  const count = SOCIALS.length;
  const current = SOCIALS[index];
  const prev = (index + count - 1) % count;
  const next = (index + 1) % count;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(SOCIAL_SELECT_EVENT, { detail: { index } }));
  }, [index]);

  const linkProps = (social) =>
    social.href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" };

  return (
    <section
      id="finale"
      aria-label="Find me online"
      className="relative h-screen overflow-hidden font-mono"
    >
      <button
        type="button"
        onClick={() => setIndex(prev)}
        aria-label={`Previous: ${SOCIALS[prev].name}`}
        className="hidden md:block absolute md:left-[10%] top-1/2 -translate-y-1/2 p-3 text-gray-400 hover:text-red-500 transition"
      >
        <MoveLeft size={56} strokeWidth={1} />
      </button>

      <button
        type="button"
        onClick={() => setIndex(next)}
        aria-label={`Next: ${SOCIALS[next].name}`}
        className="hidden md:block absolute md:right-[10%] top-1/2 -translate-y-1/2 p-3 text-gray-400 hover:text-red-500 transition"
      >
        <MoveRight size={56} strokeWidth={1} />
      </button>

      {/* Label strip: neighbours faded, current one bracketed. On phones the
          arrows are hidden and the faded neighbours do the switching. */}
      <div className="absolute inset-x-0 bottom-16 flex items-center justify-center gap-6 md:gap-12 text-sm md:text-lg">
        <button
          type="button"
          onClick={() => setIndex(prev)}
          className="w-24 md:w-32 text-right text-white/25 hover:text-white/60 transition"
        >
          {SOCIALS[prev].name}
        </button>

        <a
          href={current.href}
          {...linkProps(current)}
          className="relative px-5 py-2 text-white hover:text-red-500 transition"
        >
          <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-red-500" />
          <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-red-500" />
          <span className="absolute left-0 bottom-0 h-3 w-3 border-l border-b border-red-500" />
          <span className="absolute right-0 bottom-0 h-3 w-3 border-r border-b border-red-500" />
          {current.name}
        </a>

        <button
          type="button"
          onClick={() => setIndex(next)}
          className="w-24 md:w-32 text-left text-white/25 hover:text-white/60 transition"
        >
          {SOCIALS[next].name}
        </button>
      </div>
    </section>
  );
}
