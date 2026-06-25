import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/xpod-logo.webp";
import logo2 from "../assets/images/logo2.webp";
import { PiLineVertical } from "react-icons/pi";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-2 md:px-12 h-16">

        {/* Left: Logos */}
        <div className="flex items-center gap-1">
          <img
            src={logo}
            alt="Logo"
            className="h-15 md:h-30 w-auto object-contain mt-2 md:mt-5"
          />
          <PiLineVertical className="text-xl text-gray-300" />
          <img
            src={logo2}
            alt="Logo2"
            className="h-4 md:h-6 w-auto object-contain"
          />
        </div>


        <button
          onClick={() => navigate("/login")}
          className="bg-black text-white text-sm font-semibold px-3 md:px-5 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Login
        </button>


      </div>
    </nav>
  );
};

export default Navbar;
