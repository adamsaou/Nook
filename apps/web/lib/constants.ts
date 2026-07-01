export const APP_NAME = "Nook";

export const APP_DESCRIPTION =
  "Nook is a calm space to focus, find your rhythm, and do your best work, alone or alongside others.";

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

// Scheduled sprints — slots open every SPRINT_SLOT_MINUTES (on the :00 / :30).
export const SPRINT_SLOT_MINUTES = 30;
export const SPRINT_DEFAULT_DURATION = 25;
export const SPRINT_LOOKAHEAD = 4; // how many upcoming slots to show
