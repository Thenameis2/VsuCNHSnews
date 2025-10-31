import { SiInstagram, SiX, SiLinkedin, SiFacebook } from "react-icons/si";

import Link from "next/link";

export default function Footer() {
  const socials = [
    {
      name: "Instagram",
      icon: <SiInstagram className="w-6 h-6" />,
      url: "https://instagram.com",
      hover: "hover:text-pink-400",
    },
    {
      name: "X (Twitter)",
      icon: <SiX className="w-6 h-6" />,
      url: "https://x.com",
      hover: "hover:text-blue-400",
    },
    {
      name: "LinkedIn",
      icon: <SiLinkedin className="w-6 h-6" />,
      url: "https://linkedin.com",
      hover: "hover:text-blue-500",
    },
    {
      name: "Facebook",
      icon: <SiFacebook className="w-6 h-6" />,
      url: "https://facebook.com",
      hover: "hover:text-blue-600",
    },
  ];

  return (
    <footer className="mt-20 bg-gray-900 text-gray-300 py-10 px-4 rounded-t-2xl">
      <div className="flex justify-center gap-8 mb-6">
        {socials.map((social) => (
          <Link
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative transition ${social.hover}`}
          >
            {/* Tooltip */}
            {/* <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
              Follow us on {social.name}
            </span> */}

            {/* Icon */}
            <div className="transition-transform transform group-hover:scale-110">
              {social.icon}
            </div>
          </Link>
        ))}
      </div>

      <p className="text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} College of Natural Health Sciences News Portal. All rights reserved.
      </p>
    </footer>
  );
}
