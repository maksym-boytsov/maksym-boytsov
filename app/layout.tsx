import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import Image from "next/image";

import maksymSrc from "../public/maksym.jpg";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <header className="text-zinc-100 fixed z-10 backdrop-blur-sm bg-zinc-900/75 rounded-full left-0 right-0 top-2 py-1.5 sm:py-3 mx-auto max-w-7xl px-2 sm:px-4">
        <div className="flex justify-between items-center">
          <div className="grid grid-flow-col items-center gap-3">
            <div className="flex-shrink-0">
              <Image
                className="inline-block h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover"
                src={maksymSrc}
                alt="Maksym Boytsov"
              />
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-bold">Maksym Boytsov</h1>
              <h2 className="text-sm sm:text-md">🧑‍💻 Software Engineer</h2>
            </div>
          </div>

          <div className="flex justify-center space-x-2 sm:space-x-4">
            <div className="grid grid-flow-col gap-2 ml-4">
              <a href="#ai">Ask Me</a>·<a href="#contact">Contact </a>
            </div>
            {social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-300"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </header>

      <body>
        <Analytics />
        {children}
      </body>

      <footer className="bg-zinc-800 border-t border-zinc-700">
        <div className="mx-auto max-w-7xl overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-4">
            {social.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-300"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            ))}
          </div>
          <p className="mt-6 text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} Maksym Boytsov. Crafted with 🫶
          </p>
        </div>
      </footer>
    </html>
  );
}

const social = [
  {
    name: "GitHub",
    href: "https://github.com/maksym-boytsov",
    icon: (props) => <FaGithub {...props} size="24" />,
  },
  {
    name: "Linkedin",
    href: "https://www.linkedin.com/in/maksym-boytsov",
    icon: (props) => <FaLinkedin {...props} size="24" />,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/maksym_boytsov",
    icon: (props) => <FaTwitter {...props} size="24" />,
  },
];
