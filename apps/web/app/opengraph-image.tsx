import { ImageResponse } from "next/og";
import { APP_NAME } from "@/lib/constants";

// Branded social card shown when a Nook link is shared.
export const alt = `${APP_NAME} · Focus, made effortless`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens (literals: ImageResponse can't read CSS vars).
const CREAM = "#fff8e7";
const BLACK = "#000000";
const GREEN = "#16f5a3";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: CREAM,
          // soft accent glow, anchored top-center (mirrors the site)
          backgroundImage: `radial-gradient(60% 50% at 50% 0%, rgba(22,245,163,0.20), transparent 70%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            lineHeight: 1,
          }}
        >
          <div
            style={{
              fontSize: 230,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: BLACK,
              display: "flex",
            }}
          >
            {APP_NAME}
          </div>
          {/* Round brand dot, rendered as a shape so it never depends on the font glyph. */}
          <div
            style={{
              width: 38,
              height: 38,
              marginLeft: 14,
              marginBottom: 30,
              borderRadius: "50%",
              background: GREEN,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 44,
            fontWeight: 500,
            color: "rgba(0,0,0,0.6)",
          }}
        >
          Focus, made effortless
        </div>
      </div>
    ),
    { ...size },
  );
}
