import React, { useState, useRef, useEffect } from "react";
import {
  FaTwitter,
  FaInstagram,
  FaGithub,
  FaLinkedin,
  FaYoutube,
  FaGlobe,
  FaLink,
  FaChevronDown,
} from "react-icons/fa";

interface SocialLink {
  platform: string;
  url: string;
}

interface SocialLinksDropdownProps {
  links: SocialLink[];
  userName?: string;
}

const iconMap: Record<string, JSX.Element> = {
  twitter: <FaTwitter />,
  instagram: <FaInstagram />,
  github: <FaGithub />,
  linkedin: <FaLinkedin />,
  youtube: <FaYoutube />,
  website: <FaGlobe />,
};

const SocialLinksModal: React.FC<SocialLinksDropdownProps> = ({
  links,
  userName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors rounded-full border border-teal-500 p-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Social Media Links"
        title="Social Media Links"
      >
        <FaLink />
        <FaChevronDown
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg z-50 py-1 border border-gray-700">
          {userName && (
            <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
              @{userName}
            </div>
          )}

          {links.map(({ platform, url }, index) => (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors"
            >
              <span className="text-teal-400">
                {iconMap[platform.toLowerCase()] || <FaGlobe />}
              </span>
              <span>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialLinksModal;
