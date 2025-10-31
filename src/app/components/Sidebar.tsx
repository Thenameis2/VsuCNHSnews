"use client";
import { useEffect, useState } from "react";

interface SidebarProps {
  sections: { title: string; slug: string }[];
}

export default function Sidebar({ sections }: SidebarProps) {
  const [active, setActive] = useState<string>(sections[0]?.slug || "");

  useEffect(() => {
    const handleScroll = () => {
      let current = sections[0]?.slug;

      for (const section of sections) {
        const el = document.getElementById(section.slug);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top - 100 <= 0) {
            current = section.slug;
          }
        }
      }

      setActive(current || "");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <ul className="space-y-3">
      {sections.map(section => (
        <li
          key={section.slug}
          className={`cursor-pointer px-3 py-2 rounded-md transition ${
            active === section.slug
              ? "bg-blue-500 text-white"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          <a href={`#${section.slug}`}>{section.title}</a>
        </li>
      ))}
    </ul>
  );
}
