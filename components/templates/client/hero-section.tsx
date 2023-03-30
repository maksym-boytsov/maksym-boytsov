import { ArrowDownIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import React from "react";
import shadowSrc from "public/shadow.jpg";

import { Button } from "../../shared";

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative bg-zinc-900 h-screen grid md:grid-cols-2 grid-flow-col border-b border-zinc-700"
    >
      <div className="h-screen grid gap-5 justify-center items-center justify-items-center content-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {keywords.map((keyword, index) => {
            return (
              <p
                key={keyword.name}
                style={{ animationDelay: `${index}s` }}
                className={`mt-1 animate-[gradient-fade_4s_ease-out_infinite] bg-[length:600%] bg-bottom bg-gradient-to-r ${keyword.fromColor} ${keyword.viaColor} to-stone-500 text-transparent bg-clip-text text-4xl font-bold tracking-tight  sm:text-5xl lg:text-6xl`}
              >
                {keyword.name}
              </p>
            );
          })}

          <p className="mx-auto mt-5 max-w-xl text-xl text-gray-400">
            I value in myself and the people I work with.
          </p>
        </div>
        <Button type="button">
          <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Let's Connect
        </Button>
      </div>
      <div className="hidden md:block relative">
        <Image
          alt="Man walking towards his shadow."
          src={shadowSrc}
          placeholder="blur"
          quality={75}
          className="w-full h-full absolute bottom-0 right-0 left-0 top-0 object-cover"
          fill
          priority
        />
      </div>
      <a
        href="#ai"
        aria-label="Scroll down"
        type="button"
        className="absolute bottom-4 right-1/2 translate-x-1/2 inline-flex items-center rounded-full border border-transparent bg-gray-600 p-1 text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        <ArrowDownIcon className="h-5 w-5" aria-hidden="true" />
      </a>
    </section>
  );
};

const keywords = [
  { name: "Speed", fromColor: "from-cyan-500", viaColor: "via-cyan-400" },
  {
    name: "Reliability",
    fromColor: "from-sky-500",
    viaColor: "via-sky-400",
  },
  {
    name: "Dedication",
    fromColor: "from-blue-500",
    viaColor: "via-blue-400",
  },
  {
    name: "Responsiveness",
    fromColor: "from-indigo-500",
    viaColor: "via-indigo-400",
  },
];

export default HeroSection;
