import React from "react";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative group">
      {children}
      <span className="absolute text-nowrap bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1">
        {text}
      </span>
    </div>
  );
};

export default Tooltip;
