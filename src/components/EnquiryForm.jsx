import React from 'react'
import { IoIosSend } from "react-icons/io";

const EnquiryForm = () => {
  return (
    <div className="bg-[#f4eee2] h-full w-full py-2 md:py-10 p-3 md:p-0">
      <div className="text-center py-10">
        <h2 className="text-md font-bold text-[#d87706] sm:text-lg lg:text-xl ">
          Get in Touch
        </h2>
        <h1 className='text-2xl font-bold text-[#111827] sm:text-2xl lg:text-5xl'>
          Send an Enquiry
        </h1>
        <p className="mt-2 text-sm text-gray-400 sm:text-base lg:text-xl">
          Our team will get back to you within 24 hours.
        </p>
      </div>
      <div className="mx-auto max-w-5xl rounded-3xl border border-[#FDE68A] bg-[#FEFDF8] p-5 sm:p-8 lg:p-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-[#dc2626]">
              Name *
            </label>
            <input
              className="w-full rounded-2xl border border-[#FDE68A] px-5 py-4 outline-none focus:border-[#FDE68A] focus:ring-0"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-gray-500">
              Email
            </label>
            <input
              className="w-full rounded-2xl border border-[#FDE68A] px-5 py-4 outline-none focus:border-[#FDE68A] focus:ring-0"
              placeholder="example@email.com (Optional)"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-[#dc2626]">
              Phone *
            </label>
            <div className="flex gap-3">
              <select className="w-24 rounded-2xl border border-[#FDE68A] px-3 py-4 outline-none">
                <option>IN +91</option>
              </select>
              <input
                className="w-full rounded-2xl border border-[#FDE68A] px-5 py-4 outline-none"
                placeholder="Primary contact"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-gray-500">
              WhatsApp (Optional)
            </label>
            <input
              className="w-full rounded-2xl border border-[#FDE68A] px-5 py-4 outline-none"
              placeholder="WhatsApp number"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-gray-500">
              Place
            </label>
            <input
              className="w-full rounded-2xl border border-[#FDE68A] px-5 py-4 outline-none"
              placeholder="Your city / place"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-gray-500">
              State / Country
            </label>
            <select className="w-full rounded-2xl border border-[#FDE68A] px-5 py-4 outline-none">
              <option>State</option>
              <option>Andhra Pradesh</option>
              <option>Arunachal Pradesh</option>
              <option>Assam</option>
              <option>Bihar</option>
              <option>Chhattisgarh</option>
              <option>Goa</option>
              <option>Gujarat</option>
              <option>Haryana</option>
              <option>Himachal Pradesh</option>
              <option>Jharkhand</option>
              <option>Karnataka</option>
              <option>Kerala</option>
              <option>Madhya Pradesh</option>
              <option>Maharashtra</option>
              <option>Manipur</option>
              <option>Meghalaya</option>
              <option>Mizoram</option>
              <option>Nagaland</option>
              <option>Odisha</option>
              <option>Punjab</option>
              <option>Rajasthan</option>
              <option>Sikkim</option>
              <option>Tamil Nadu</option>
              <option>Telangana</option>
              <option>Tripura</option>
              <option>Uttar Pradesh</option>
              <option>Uttarakhand</option>
              <option>West Bengal</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-gray-500">
              Requirements
            </label>
            <textarea
              className="h-32 w-full rounded-2xl border border-[#FDE68A] px-5 py-4 outline-none"
              placeholder="Please specify the type of business you need with the Xpod and any particular requirements you have."
            />
          </div>
        </div>

        <button className="mt-8 w-full rounded-2xl bg-[#C9932D] py-2 md:py-4 text-md md:text-lg font-bold text-white shadow-lg">
          <IoIosSend className="inline mr-2 mb-1 text-lg md:text-2xl" />
          Send Enquiry
        </button>
        <div className='border-t border-[#bb882e] mt-6 max-w-5xl'></div>
        <div className='text-center mt-6 text-sm text-gray-500'>
          <p className='text-md font-medium'>Please contact Us:+91 9526933003, +91 9526003003</p>
          <p className='text-[#b45309] font-bold text-md md:text-lg underline'>www.xpod.co.in</p>
        </div>

      </div>
    </div>
  )
}

export default EnquiryForm