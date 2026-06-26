import { ImageResponse } from "next/og";

// iOS home-screen icon (180×180). iOS rounds the corners itself, so we use a
// full black square with the "N." mark centered.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          fontSize: 110,
          fontWeight: 800,
        }}
      >
        <div style={{ display: "flex" }}>
          <span style={{ color: "#ffffff" }}>N</span>
          <span style={{ color: "#16F5A3" }}>.</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
