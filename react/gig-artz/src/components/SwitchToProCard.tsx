import React from "react";
import { useNavigate } from "react-router-dom";
import { MdWorkspacePremium } from "react-icons/md";

const SwitchToProCard: React.FC = () => {
  const navigate = useNavigate();

  const handleUpgrade = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/monetization");
  };

  return (
    <div
      onClick={handleUpgrade}
      className="flex items-center justify-between p-3 rounded-lg cursor-pointer bg-gradient-to-r from-teal-800 to-pink-600 shadow hover:shadow-lg hover:scale-[0.98] transition-transform duration-300 w-full max-w-lg"
    >
      {/* Icon + Text */}
      <div className="flex items-center gap-3">
        <MdWorkspacePremium className="text-white text-3xl" />
        <div>
          <h3 className="text-white font-semibold text-sm">
            Switch to Professional
          </h3>
          <p className="text-white text-xs opacity-80">
            Get insights, promote events, and more.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <button className="bg-white text-teal-600 text-xs px-3 py-1 rounded-full font-semibold hover:bg-gray-100">
        Upgrade
      </button>
    </div>
  );
};

export default SwitchToProCard;
