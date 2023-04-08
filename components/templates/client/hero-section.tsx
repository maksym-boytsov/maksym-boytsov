"use client";
import {
  ArrowDownIcon,
  ChatBubbleBottomCenterTextIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import React, { useEffect } from "react";
import shadowSrc from "public/shadow.jpg";
import { hotjar } from "react-hotjar";

import { Button } from "../../shared";

const HeroSection = () => {
  useEffect(() => {
    hotjar.initialize(3442508, 6);
  }, []);

  return (
    <section
      id="hero"
      className="relative bg-zinc-900 h-screen grid md:grid-cols-2 grid-flow-col border-b border-zinc-700"
    >
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
      <div className="text-center h-screen grid gap-2 justify-center items-center justify-items-center content-center px-4">
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

        <p className="mx-auto my-3 max-w-xl text-lg text-gray-400">
          Hey, I'm <span className="font-bold">Maksym</span>, a software
          engineer and entrepreneur. I'm passionate about engineering products
          that boost productivity and help people achieve their goals.
        </p>

        {/* @ts-ignore */}
        <Button as="a" href="/#ai" type="button">
          <ChatBubbleBottomCenterTextIcon
            className="-ml-1 mr-2 h-5 w-5"
            aria-hidden="true"
          />
          Know Me Better
        </Button>
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
