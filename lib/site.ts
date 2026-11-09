export const SITE_URL = "https://www.maksym.page";
/** Where messages from the site land, and the address shown when sending fails. */
export const EMAIL = "maksym.boytsov@gmail.com";
export const SITE_NAME = "Maksym Boytsov";
export const SITE_DESCRIPTION =
  "Head of Engineering at ChainPatrol, in Warsaw. A short note on how I work.";

export const LINKS = {
  x: "https://x.com/maksym_boytsov",
  linkedin: "https://www.linkedin.com/in/maksym-boytsov",
  github: "https://github.com/maksym-boytsov",
  email: `mailto:${EMAIL}`,
} as const;

export const X_HANDLE = "@maksym_boytsov";

export const CREDIT = "© 2026 Maksym Boytsov · Designed by me, assembled with Claude.";

/** Props for every link that leaves the site. */
export const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/** The paper palette, shared by the page chrome, the drawing and the share image. */
export const COLORS = {
  paper: "#f1eee7",
  ink: "#121212",
  muted: "#6d685e",
  forest: "#1f5135",
} as const;
