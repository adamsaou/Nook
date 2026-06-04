export const APP_NAME = "Nook";

export const APP_DESCRIPTION =
  "The go-to study platform to keep you focused and engaged.";

export const ROUTES = {
  home: "/",
  focus: "/focus",
  rooms: "/rooms",
  profile: "/profile",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: ROUTES.home },
  { label: "Focus", href: ROUTES.focus },
  { label: "Rooms", href: ROUTES.rooms },
  { label: "Profile", href: ROUTES.profile },
] as const;

// Focus session durations (minutes)
export const DEFAULT_FOCUS_MINUTES = 25;
export const MIN_FOCUS_MINUTES = 5;
export const MAX_FOCUS_MINUTES = 120;
export const FOCUS_STEP_MINUTES = 5;
export const FOCUS_PRESETS_MINUTES = [15, 25, 50] as const;
