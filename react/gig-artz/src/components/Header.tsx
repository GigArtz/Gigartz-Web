import React from "react";
import { FaArrowLeft } from "react-icons/fa";

function Header({ title }: { title: string }) {
  return (
    <div className="md:flex hidden items-center mb-6 p-4 gap-5 bg-gray-800 text-white rounded-3xl shadow-md">
      <div className="p-3 hover:text-gray-800 hover:bg-gray-400  rounded-full">
        <FaArrowLeft />
      </div>
      <h1 className="text-lg font-semibold text-teal-500">{title}</h1>
    </div>
  );
}

export default Header;
