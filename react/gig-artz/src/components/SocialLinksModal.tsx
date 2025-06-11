import React from "react";
import { FaTimesCircle, FaTwitter, FaInstagram, FaGithub, FaLinkedin, FaYoutube, FaGlobe } from "react-icons/fa";

interface SocialLink {
  platform: string;
  url: string;
}

interface SocialLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: SocialLink[];
}

const iconMap: Record<string, JSX.Element> = {
  twitter: <FaTwitter />,
  instagram: <FaInstagram />,
  github: <FaGithub />,
  linkedin: <FaLinkedin />,
  youtube: <FaYoutube />,
  website: <FaGlobe />,
};

const SocialLinksModal: React.FC<SocialLinksModalProps> = ({ isOpen, onClose, links }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-dark rounded-lg shadow-lg w-11/12 max-w-md p-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 pb-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Social Media Links
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <FaTimesCircle className="w-6 h-6 hover:text-red-500" />
          </button>
        </div>

        {/* Social Links List */}
        <div className="space-y-3">
          {links.map(({ platform, url }, index) => (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-teal-400 hover:text-teal-300 transition-colors text-sm border border-teal-500 rounded px-3 py-2"
            >
              {iconMap[platform.toLowerCase()] || <FaGlobe />}
              <span className="truncate">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialLinksModal;
