import React from "react";
import { Link } from "react-router-dom";
import defaultImage from "../assets/blue.jpg";

interface AdCardProps {
  title: string;
  description?: string;
  image?: string;
  ctaLabel?: string;
  ctaLink?: string;
  badge?: string;
  size?: "sm" | "md" | "lg";
  external?: boolean;
}

const AdCard: React.FC<AdCardProps> = ({
  title,
  description,
  image = defaultImage,
  ctaLabel = "Learn More",
  ctaLink = "#",
  badge,
  size = "md",
  external = false,
}) => {
  const Wrapper = external ? "a" : Link;
  const wrapperProps = external
    ? { href: ctaLink, target: "_blank", rel: "noopener noreferrer" }
    : { to: ctaLink };

  return (
    <Wrapper
      {...wrapperProps}
      className="block transition-transform hover:-translate-y-1 duration-300 ease-in-out"
    >
      <div className="relative rounded-xl shadow-md border border-gray-800 bg-gray-900 overflow-hidden flex flex-col h-full">
        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3 bg-teal-500 text-white text-xs font-semibold px-2 py-1 rounded">
            {badge}
          </div>
        )}

        {/* Image */}
        <img
          src={image}
          alt={title}
          className={`w-full object-cover object-center transition group-hover:scale-105 ${
            size === "sm"
              ? "h-48"
              : size === "md"
              ? "h-40 md:h-56"
              : "h-64"
          }`}
        />

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow justify-between space-y-2">
          <h3
            className={`text-white font-bold line-clamp-2 ${
              size === "sm"
                ? "text-sm hidden"
                : size === "md"
                ? "text-base md:text-lg"
                : "text-xl"
            }`}
          >
            {title}
          </h3>

          {description && (
            <p className="text-gray-400 text-xs md:text-sm line-clamp-3">
              {description}
            </p>
          )}

          <div className="pt-2 ">
            <span className="inline-block bg-teal-600 hover:bg-teal-500 text-white text-xs px-4 py-2 rounded-full transition">
              {ctaLabel}
            </span>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default AdCard;
