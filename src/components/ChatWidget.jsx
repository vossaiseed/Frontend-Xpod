import React from "react";
import { IoLogoWhatsapp } from "react-icons/io";
import { IoIosCall } from "react-icons/io";

const ChatWidget = () => {
  return (
    <>
      {/* Desktop / Web: round floating buttons */}
      <div className="hidden md:block">
        <a
          href="tel:+919526003003"
          className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#D39B32] text-white shadow-lg hover:scale-110 transition"
        >
          <IoIosCall className="text-2xl" />
        </a>

        <a
          href="https://wa.me/919526003003"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-20 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition"
        >
          <IoLogoWhatsapp className="text-2xl" />
        </a>
      </div>

      {/* Mobile / Responsive: Call Now + Chat Now */}
      <div className="md:hidden  bottom-5 left-1/2  py-4 z-50 flex gap-3 px-4 w-full max-w-md">
        <a
          href="tel:+919526003003"
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-[#fbebac] bg-white py-3 text-[#D39B32] font-semibold"
        >
          <IoIosCall className="text-xl" />
          Call Now
        </a>

        <a
          href="https://wa.me/919526003003"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3 text-white font-semibold"
        >
          <IoLogoWhatsapp className="text-xl" />
          Chat Now
        </a>
      </div>
    </>
  );
};

export default ChatWidget;