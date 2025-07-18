import React from "react";
import {
  FaTwitter,
  FaInstagram,
  FaGithub,
  FaLinkedin,
  FaYoutube,
  FaGlobe,
  FaLink,
} from "react-icons/fa";
import BaseModal from "./BaseModal";

interface SocialLink {
  platform: string;
  url: string;
}

interface SocialLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const SocialLinksModal: React.FC<SocialLinksModalProps> = ({
  isOpen,
  onClose,
  links,
  userName,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Social Media Links"
      subtitle={userName ? `@${userName}` : undefined}
      icon={<FaLink />}
      maxWidth="md:max-w-md"
    >
      <div className="space-y-3 py-2">
        {/* Social Links List */}
        {links.length > 0 ? (
          links.map(({ platform, url }, index) => (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-teal-400 hover:text-teal-300 transition-colors text-sm border border-teal-500 rounded px-3 py-2"
            >
              {iconMap[platform.toLowerCase()] || <FaGlobe />}
              <span className="truncate">
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </span>
            </a>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center">
            No social media links available.
          </p>
        )}
      </div>
    </BaseModal>
  );
};

export default SocialLinksModal;
