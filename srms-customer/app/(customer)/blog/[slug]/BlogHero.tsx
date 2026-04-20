"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface BlogHeroProps {
  title: string;
  category: string;
  image: string;
}

export default function BlogHero({ title, category, image }: BlogHeroProps) {
  const [displayed, setDisplayed] = useState("");
  const [metaVisible, setMetaVisible] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setMetaVisible(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(title.slice(0, i));
      if (i >= title.length) {
        clearInterval(interval);
        setTimeout(() => setMetaVisible(true), 200);
      }
    }, 28);
    return () => clearInterval(interval);
  }, [title]);

  return (
    <div className="relative w-full h-[420px] md:h-[500px] overflow-hidden">
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover object-center"
        priority
        quality={90}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Centered text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-16">
        <span
          className="inline-block px-3 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full mb-5 opacity-0 animate-fade-in"
          style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
        >
          {category}
        </span>
        <h1 className="text-2xl md:text-4xl font-bold text-white leading-snug max-w-3xl min-h-[3rem] md:min-h-[5rem]">
          {displayed}
          <span className="inline-block w-0.5 h-6 md:h-8 bg-white ml-1 align-middle animate-pulse" />
        </h1>
      </div>
    </div>
  );
}
