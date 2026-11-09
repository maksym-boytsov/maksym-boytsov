import { LINKS, external } from "@/lib/site";

/** X, LinkedIn and GitHub, as plain text links with an outward arrow. */
export function SocialLinks() {
  return (
    <>
      <a href={LINKS.x} {...external}>
        X <span aria-hidden="true">↗</span>
      </a>
      <a href={LINKS.linkedin} {...external}>
        LinkedIn <span aria-hidden="true">↗</span>
      </a>
      <a href={LINKS.github} {...external}>
        GitHub <span aria-hidden="true">↗</span>
      </a>
    </>
  );
}
