import React from 'react'

const DownloadSection = () => {
  return (
   <div className="mx-auto max-w-7xl rounded-3xl border border-[#FDE68A] bg-[#FEFDF8] px-5 py-8 my-2 shadow-xl sm:px-8 lg:px-10 my-10 lg:my-20 ">
  <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between ">
    
    <div className="flex flex-col items-center text-center gap-5 sm:flex-row sm:text-left lg:gap-8">
      <div className="hidden md:block flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#D39B32] shadow-lg sm:h-24 sm:w-24">
        <span className="text-3xl text-white sm:text-4xl">📖</span>
      </div>

      <div>
        <h2 className="text-lg font-bold text-[#111827] sm:text-xl lg:text-3xl">
          Download Our Brochures
        </h2>
        <p className="hidden md:block mt-2 text-sm text-gray-400 sm:text-base lg:text-lg">
          Get detailed specifications, pricing and design details for each XPOD model.
        </p>
      </div>
    </div>

    <div className="flex flex-col gap-4 sm:flex-row lg:shrink-0">
      <select className="w-full rounded-xl border border-[#FDE68A] bg-white px-5 py-4 text-gray-700 focus:outline-none focus:ring-0 sm:w-64">
        <option>Select brochure</option>
        <option>X7 Brochure</option>
        <option>X6 Brochure</option>
        <option>X5 Brochure</option>
      </select>

      <button className="w-full rounded-xl bg-[#E8C98F] px-8 py-4 font-bold text-white shadow-lg sm:w-auto">
        Download
      </button>
    </div>

  </div>
</div>
  )
}

export default DownloadSection