"use client";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import React, { useEffect } from "react";
import fullBodySrc from "public/full-body.jpg";
// import { hotjar } from "react-hotjar";

import { Button } from "../../shared";

const HeroSection = () => {
  // useEffect(() => {
  //   hotjar.initialize(3442508, 6);
  // }, []);

  return (
    <section
      id="hero"
      className="relative bg-zinc-900 h-screen grid md:grid-cols-2 grid-flow-col border-b border-zinc-700"
    >
      <div className="bg-[url('/full-body.jpg')] bg-center bg-cover md:bg-none">
        <div className="md:backdrop-filter-none backdrop-blur-sm backdrop-brightness-50 h-screen grid gap-2 px-4 text-center justify-center items-center justify-items-center content-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {keywords.map((keyword, index) => {
              return (
                <p
                  key={keyword.name}
                  style={{ animationDelay: `${index}s` }}
                  className={`mt-1 animate-[gradient-fade_4s_ease-out_infinite] bg-[length:600%] bg-bottom bg-gradient-to-r ${keyword.fromColor} ${keyword.viaColor} to-stone-500 text-transparent bg-clip-text font-bold tracking-tight text-5xl lg:text-6xl`}
                >
                  {keyword.name}
                </p>
              );
            })}
          </div>

          <div className="grid gap-2 max-w-xl text-center mx-auto my-3 text-zinc-200 md:text-zinc-300">
            <p className="text-lg">
              Hey, I'm <span className="font-bold">Maksym</span>, a software
              engineer and entrepreneur.
            </p>
            <p>
              I am dedicated to engineering solutions that elevate{" "}
              <span className="font-bold">business efficiency</span>, empower
              organizations to meet their objectives, and drive{" "}
              <span className="font-bold">productivity enhancement</span>.
            </p>
          </div>

          {/* @ts-ignore */}
          <Button as="a" href="/#ai" type="button">
            <ChatBubbleBottomCenterTextIcon
              className="-ml-1 mr-2 h-5 w-5"
              aria-hidden="true"
            />
            Know Me Better
          </Button>
        </div>
      </div>

      <div className="hidden md:block relative">
        <Image
          alt="Maksym Boytsov pointing to mountains."
          src={fullBodySrc}
          placeholder="blur"
          quality={75}
          className="w-full h-full absolute bottom-0 right-0 left-0 top-0 object-cover"
          fill
          priority
        />
      </div>
    </section>
  );
};

const keywords = [
  {
    name: "Trust",
    fromColor: "from-sky-500",
    viaColor: "via-sky-400",
  },
  {
    name: "Precision",
    fromColor: "from-blue-500",
    viaColor: "via-blue-400",
  },
  { name: "Performance", fromColor: "from-cyan-500", viaColor: "via-cyan-400" },
  // {
  //   name: "Responsiveness",
  //   fromColor: "from-indigo-500",
  //   viaColor: "via-indigo-400",
  // },
];

export default HeroSection;
