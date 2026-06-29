import Link from "next/link";
import { HandFrame } from "@/components/shared/HandFrame";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <header>
          <nav className={styles.nav}>
            <div className={styles.markSm}>
              Nook<span className={styles.dot}>.</span>
            </div>
            <Link className={styles.login} href="/login">
              Log in
            </Link>
          </nav>
        </header>

        <main>
          <section className={styles.hero}>
            <div>
              <p className={`${styles.eyebrow} ${styles.settle} ${styles.d1}`}>
                A calmer way to study
              </p>
              <h1 className={`${styles.wordmark} ${styles.settle} ${styles.d2}`}>
                <span className={styles.ghost} aria-hidden="true">
                  Nook.
                </span>
                <span className={styles.key}>
                  Nook<span className={styles.pdot}>.</span>
                </span>
                <svg className={styles.spark} viewBox="0 0 40 40" aria-hidden="true">
                  <g stroke="#16f5a3" strokeWidth="3" strokeLinecap="round" fill="none">
                    <path d="M20 5 V16 M20 24 V35 M5 20 H16 M24 20 H35" />
                  </g>
                </svg>
              </h1>
              <p className={`${styles.tagline} ${styles.settle} ${styles.d3}`}>
                A quiet corner of the internet to focus, find your rhythm, and study
                alongside others.
              </p>
              <div className={`${styles.actions} ${styles.settle} ${styles.d4}`}>
                <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/focus">
                  <svg
                    className={styles.frame}
                    viewBox="0 0 220 64"
                    preserveAspectRatio="none"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M30 6 Q110 3 190 6 Q214 7 213 32 Q214 57 190 58 Q110 61 30 58 Q6 57 7 32 Q6 8 30 6 Z"
                      stroke="#000"
                      strokeWidth="2.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Start focusing</span>
                  <span className={styles.arr}>→</span>
                </Link>
                <Link className={`${styles.btn} ${styles.btnGhost}`} href="/rooms">
                  <span>Study rooms</span>
                  <span className={styles.arr}>→</span>
                  <span className={styles.u} />
                </Link>
              </div>
            </div>

            <div className={`${styles.art} ${styles.settle} ${styles.d5}`} aria-hidden="true">
              {/* Riso spot illustration: a cozy reading nook */}
              <svg viewBox="0 0 430 470" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
                <defs>
                  <pattern id="halftone" width="7" height="7" patternUnits="userSpaceOnUse">
                    <circle cx="3.5" cy="3.5" r="1.15" fill="#000" opacity="0.5" />
                  </pattern>
                  <pattern id="halftoneGreen" width="7" height="7" patternUnits="userSpaceOnUse">
                    <circle cx="3.5" cy="3.5" r="1.5" fill="#16f5a3" />
                  </pattern>
                  <clipPath id="winClip">
                    <rect x="74" y="44" width="190" height="200" rx="95" />
                  </clipPath>
                  <filter
                    id="rough"
                    x="-8%"
                    y="-8%"
                    width="116%"
                    height="116%"
                    colorInterpolationFilters="sRGB"
                  >
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.016"
                      numOctaves="3"
                      seed="7"
                      result="n"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="n"
                      scale="2"
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>
                </defs>

                <g filter="url(#rough)" strokeLinecap="round" strokeLinejoin="round">
                  {/* Window */}
                  <g clipPath="url(#winClip)">
                    <rect x="74" y="44" width="190" height="200" fill="#fff" />
                    <circle cx="205" cy="116" r="34" fill="url(#halftoneGreen)" />
                    <circle cx="205" cy="116" r="34" fill="#16f5a3" opacity="0.22" />
                    <circle cx="205" cy="116" r="34" fill="none" stroke="#16f5a3" strokeWidth="3" />
                    <g stroke="#16f5a3" strokeWidth="3.2">
                      <path d="M205 64 v-12" />
                      <path d="M243 78 l9 -9" />
                      <path d="M167 78 l-9 -9" />
                      <path d="M253 116 h12" />
                      <path d="M145 116 h-12" />
                    </g>
                    <path d="M74 214 Q150 170 264 208 V244 H74 Z" fill="url(#halftone)" />
                  </g>
                  <rect x="74" y="44" width="190" height="200" rx="95" fill="none" stroke="#000" strokeWidth="5" />
                  <line x1="169" y1="48" x2="169" y2="240" stroke="#000" strokeWidth="4" />
                  <line x1="80" y1="144" x2="258" y2="144" stroke="#000" strokeWidth="4" />

                  {/* Floor */}
                  <line x1="28" y1="392" x2="402" y2="394" stroke="#000" strokeWidth="5" />

                  {/* Plant */}
                  <g>
                    <path d="M299 392 L312 349 H357 L369 392 Z" fill="url(#halftone)" />
                    <path d="M299 392 L312 349 H357 L369 392 Z" fill="none" stroke="#000" strokeWidth="4.5" />
                    <path d="M334 349 C334 298 319 270 298 254 C326 266 341 295 341 339" fill="#fff" stroke="#000" strokeWidth="4" />
                    <path d="M334 349 C334 298 351 272 375 258 C352 274 343 303 341 343" fill="url(#halftoneGreen)" stroke="#000" strokeWidth="4" />
                    <path d="M334 352 C334 318 334 300 334 285" fill="none" stroke="#000" strokeWidth="4" />
                  </g>

                  {/* Armchair */}
                  <g>
                    <path d="M95 392 V250 C95 223 116 205 142 205 H196 C223 205 243 223 243 250 V392 Z" fill="#fff" stroke="#000" strokeWidth="5" />
                    <path d="M214 390 V252 C214 235 206 223 192 217 C214 219 230 233 230 257 V390 Z" fill="url(#halftone)" />
                    <path d="M103 329 H235 V356 C235 367 226 375 214 375 H124 C112 375 103 367 103 356 Z" fill="url(#halftoneGreen)" stroke="#000" strokeWidth="5" />
                    <rect x="86" y="299" width="32" height="94" rx="16" fill="#fff" stroke="#000" strokeWidth="5" />
                    <rect x="220" y="299" width="32" height="94" rx="16" fill="#fff" stroke="#000" strokeWidth="5" />
                    <path d="M82 299 l32 -8 l4 14 l-32 8 z" fill="#fff" stroke="#000" strokeWidth="4" />
                  </g>

                  {/* Mug with a little face */}
                  <g>
                    <rect x="261" y="367" width="28" height="25" rx="6" fill="#fff" stroke="#000" strokeWidth="4" />
                    <path d="M289 373 q13 0 13 9 t-13 8" fill="none" stroke="#000" strokeWidth="4" />
                    <circle cx="270" cy="377" r="1.6" fill="#000" />
                    <circle cx="280" cy="377" r="1.6" fill="#000" />
                    <path d="M269 383 q6 5 12 0" fill="none" stroke="#000" strokeWidth="2.4" />
                    <path d="M270 360 q4 -7 0 -14 M280 360 q4 -7 0 -14" fill="none" stroke="#16f5a3" strokeWidth="3" />
                  </g>
                </g>
              </svg>
            </div>
          </section>

          <section className={styles.cards}>
            <div className={`${styles.card} ${styles.settle} ${styles.d6}`}>
              <HandFrame className={styles.frame} />
              <svg className={styles.doodle} viewBox="0 0 40 40" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 6 H30 M10 34 H30" stroke="#000" strokeWidth="3" />
                <path d="M12 6 C12 17 28 17 28 6" stroke="#000" strokeWidth="3" />
                <path d="M12 34 C12 23 28 23 28 34" stroke="#000" strokeWidth="3" />
                <path d="M16 30 C16 25 24 25 24 30 Z" fill="#16f5a3" />
                <line x1="20" y1="19" x2="20" y2="23" stroke="#16f5a3" strokeWidth="3" />
              </svg>
              <h3 className={styles.cardTitle}>
                Focus<span className={styles.dot}>.</span>
              </h3>
              <p>A calm solo timer to slip into deep work, one quiet session at a time.</p>
            </div>

            <div className={`${styles.card} ${styles.settle} ${styles.d6}`}>
              <HandFrame className={styles.frame} />
              <svg className={styles.doodle} viewBox="0 0 40 40" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="20" cy="23" r="12" stroke="#000" strokeWidth="3" />
                <path d="M16 6 H24 M20 6 V11" stroke="#000" strokeWidth="3" />
                <path d="M30 13 l3 -3" stroke="#000" strokeWidth="3" />
                <path d="M20 23 L20 16 M20 23 L26 26" stroke="#16f5a3" strokeWidth="3" />
              </svg>
              <h3 className={styles.cardTitle}>
                Sprints<span className={styles.dot}>.</span>
              </h3>
              <p>Short, gentle work intervals that keep your momentum without the pressure.</p>
            </div>

            <div className={`${styles.card} ${styles.settle} ${styles.d6}`}>
              <HandFrame className={styles.frame} />
              <svg className={styles.doodle} viewBox="0 0 40 40" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="15" cy="15" r="6" stroke="#000" strokeWidth="3" />
                <path d="M6 33 C6 24 24 24 24 33" stroke="#000" strokeWidth="3" />
                <circle cx="28" cy="18" r="5" stroke="#16f5a3" strokeWidth="3" />
                <path d="M21 33 C21 26 35 26 35 33" stroke="#16f5a3" strokeWidth="3" />
              </svg>
              <h3 className={styles.cardTitle}>
                Rooms<span className={styles.dot}>.</span>
              </h3>
              <p>Study beside your people in silent or voice rooms. Drop in anytime.</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
