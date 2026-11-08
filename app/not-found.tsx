import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="paper">
      <main className="p-wrap p-lost">
        <p className="p-label">404</p>
        <h1>Nothing here.</h1>
        <p className="p-intro">This page doesn&apos;t exist. The rest of the site does.</p>
        <Link className="p-back" href="/">
          <span aria-hidden="true">←</span> Back to maksym.page
        </Link>
      </main>
    </div>
  );
}
