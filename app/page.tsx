import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.grain} />

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
            <div className={styles.halftone} />

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
              </h1>
              <p className={`${styles.tagline} ${styles.settle} ${styles.d3}`}>
                A quiet corner of the internet to focus, find your rhythm, and study
                alongside others.
              </p>
              <div className={`${styles.actions} ${styles.settle} ${styles.d4}`}>
                <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/focus">
                  Start focusing<span className={styles.arr}>→</span>
                </Link>
                <Link className={`${styles.btn} ${styles.btnGhost}`} href="/rooms">
                  Study rooms<span className={styles.arr}>→</span>
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
                </defs>

                {/* Window: arched frame */}
                <g clipPath="url(#winClip)">
                  <rect x="74" y="44" width="190" height="200" fill="#fff" />
                  {/* green spot: soft light through the window */}
                  <circle cx="205" cy="118" r="42" fill="url(#halftoneGreen)" />
                  <circle cx="205" cy="118" r="42" fill="#16f5a3" opacity="0.22" />
                  {/* rolling hill */}
                  <path d="M74 210 Q150 168 264 206 V244 H74 Z" fill="url(#halftone)" />
                </g>
                <rect x="74" y="44" width="190" height="200" rx="95" stroke="#000" strokeWidth="3.5" />
                {/* window mullions */}
                <line x1="169" y1="46" x2="169" y2="242" stroke="#000" strokeWidth="3" />
                <line x1="78" y1="144" x2="260" y2="144" stroke="#000" strokeWidth="3" />

                {/* Floor line */}
                <line x1="30" y1="392" x2="400" y2="392" stroke="#000" strokeWidth="3.5" />

                {/* Plant, right of the chair */}
                <g>
                  <path d="M300 392 L312 350 H356 L368 392 Z" fill="url(#halftone)" />
                  <path
                    d="M300 392 L312 350 H356 L368 392 Z"
                    stroke="#000"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M334 350 C334 300 320 272 300 256 C326 268 340 296 340 340"
                    fill="#fff"
                    stroke="#000"
                    strokeWidth="3.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M334 350 C334 300 350 274 374 260 C352 276 342 304 340 344"
                    fill="url(#halftoneGreen)"
                    stroke="#000"
                    strokeWidth="3.2"
                    strokeLinejoin="round"
                  />
                  <path d="M334 352 C334 318 334 300 334 286" stroke="#000" strokeWidth="3.2" />
                </g>

                {/* Armchair */}
                <g>
                  <path
                    d="M96 392 V250 C96 224 116 206 142 206 H196 C222 206 242 224 242 250 V392 Z"
                    fill="#fff"
                    stroke="#000"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M214 392 V250 C214 234 206 222 192 216 C214 218 230 232 230 256 V392 Z"
                    fill="url(#halftone)"
                  />
                  <path
                    d="M104 330 H234 V356 C234 366 226 374 214 374 H124 C112 374 104 366 104 356 Z"
                    fill="url(#halftoneGreen)"
                    stroke="#000"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  <rect x="88" y="300" width="30" height="92" rx="15" fill="#fff" stroke="#000" strokeWidth="3.5" />
                  <rect x="220" y="300" width="30" height="92" rx="15" fill="#fff" stroke="#000" strokeWidth="3.5" />
                  {/* little book resting on the arm */}
                  <path d="M84 300 l30 -7 l4 13 l-30 7 z" fill="#fff" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
                </g>

                {/* a tiny mug on the floor */}
                <g>
                  <rect x="262" y="368" width="26" height="24" rx="5" fill="#fff" stroke="#000" strokeWidth="3" />
                  <path d="M288 374 q12 0 12 8 t-12 7" fill="none" stroke="#000" strokeWidth="3" />
                  <path
                    d="M270 360 q3 -7 0 -13 M280 360 q3 -7 0 -13"
                    stroke="#16f5a3"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </g>
              </svg>
            </div>
          </section>

          <section className={styles.cards}>
            <div className={`${styles.card} ${styles.settle} ${styles.d6}`}>
              <div className={styles.cardAccent} />
              <h3>
                Focus<span className={styles.dot}>.</span>
              </h3>
              <p>A calm solo timer to slip into deep work, one quiet session at a time.</p>
            </div>
            <div className={`${styles.card} ${styles.settle} ${styles.d6}`}>
              <div className={styles.cardAccent} />
              <h3>
                Sprints<span className={styles.dot}>.</span>
              </h3>
              <p>Short, gentle work intervals that keep your momentum without the pressure.</p>
            </div>
            <div className={`${styles.card} ${styles.settle} ${styles.d6}`}>
              <div className={styles.cardAccent} />
              <h3>
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
