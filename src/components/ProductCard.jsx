import React, { useState } from "react";
import product1 from "../assets/images/product-1.png";
import product2 from "../assets/images/product-2.png";
import product3 from "../assets/images/product-3.png";
import DownloadSection from "./DownloadSection";

const ProductCard = () => {
  const prices = {
    "X7 - 258 sqft | 7.5": "₹24.3L + GST",
    "X6m - 258 sqft | 7.5m": "₹22.7L + GST",
    "X6s - 207 sqft | 6m": "₹19.7L + GST",
    "X5x - 2BHK | 606 sqft | 17.6m": "₹43.7L + GST",
    "X5x - Studio | 606 sqft | 17.6m": "₹43.2L + GST",
    "X5L - 2BHK | 503 sqft | 14.6m": "₹40.8L + GST",
    "X5L - Studio | 503 sqft | 14.6m": "₹40.8L + GST",
    "X5m - 348 sqft | 10.1m": "₹24.9L + GST",
    "X5s - 296 sqft | 8.6m": "₹22.4L + GST",
  };

  const [x7variant, setX7Variant] = useState("");
  const [x6variant, setX6Variant] = useState("");
  const [x5variant, setX5Variant] = useState("");

  return (
    <div className="bg-[#f8f5ee] px-4 py-10 ">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="uppercase tracking-widest text-amber-500">
            Our Collection
          </p>

          <h1 className="pt-4 text-2xl font-bold sm:text-5xl lg:text-6xl">
            Discover XPOD Ranges
          </h1>

          <p className="mt-4 text-md text-gray-500 md:text-lg">
            Three iconic lines. Infinite possibilities. Select your ideal
            modular space.
          </p>
        </div>

        {/* Mobile Design */}
        <div className="block rounded-3xl border border-[#FDE68A] bg-white p-5 shadow-lg md:hidden">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Discover XPOD Ranges
          </h2>

          <div className="space-y-8">
            {/* X7 */}
            <div className="grid grid-cols-[85px_1fr_80px] items-center gap-2">
              <div className="flex items-center gap-2">
                <img src={product1} className="w-14 object-contain" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Select Range
                </label>
                <select
                  value={x7variant}
                  onChange={(e) => setX7Variant(e.target.value)}
                  className="w-full rounded-xl border border-[#FDE68A] px-3 py-3 text-sm outline-none"
                >
                  <option value="">Select range</option>
                  <option value="X7 - 258 sqft | 7.5">
                    X7 - 258 sqft | 7.5
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#dc2626]">
                  PRICE
                </label>
                <div
                  className={`rounded-xl border border-[#FDE68A] bg-[#FEF5F0] px-2 py-3 text-center text-xs font-bold truncate ${
                    x7variant ? "text-[#dc2626]" : "text-gray-400"
                  }`}
                >
                  {prices[x7variant] || "Price"}
                </div>
              </div>
            </div>

            {/* X6 */}
            <div className="grid grid-cols-[85px_1fr_80px] items-center gap-2">
              <div className="flex items-center gap-2">
                <img src={product2} className="w-14 object-contain" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Select Range
                </label>
                <select
                  value={x6variant}
                  onChange={(e) => setX6Variant(e.target.value)}
                  className="w-full rounded-xl border border-[#FDE68A] px-3 py-3 text-sm outline-none"
                >
                  <option value="">Select range</option>
                  <option value="X6m - 258 sqft | 7.5m">
                    X6m - 258 sqft | 7.5m
                  </option>
                  <option value="X6s - 207 sqft | 6m">
                    X6s - 207 sqft | 6m
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#dc2626]">
                  PRICE
                </label>
                <div
                  className={`rounded-xl border border-[#FDE68A] bg-[#FEF5F0] px-2 py-3 text-center text-xs font-bold truncate ${
                    x6variant ? "text-[#dc2626]" : "text-gray-400"
                  }`}
                >
                  {prices[x6variant] || "Price"}
                </div>
              </div>
            </div>

            {/* X5 */}
            <div className="grid grid-cols-[85px_1fr_80px] items-center gap-2">
              <div className="flex items-center gap-2">
                <img src={product3} className="w-14 object-contain" />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700">
                  Select Range
                </label>
                <select
                  value={x5variant}
                  onChange={(e) => setX5Variant(e.target.value)}
                  className="w-full rounded-xl border border-[#FDE68A] px-3 py-2 text-sm outline-none"
                >
                  <option value="">Select range</option>
                  <option value="X5x - 2BHK | 606 sqft | 17.6m">
                    X5x - 2BHK | 606 sqft | 17.6m
                  </option>
                  <option value="X5x - Studio | 606 sqft | 17.6m">
                    X5x - Studio | 606 sqft | 17.6m
                  </option>
                  <option value="X5L - 2BHK | 503 sqft | 14.6m">
                    X5L - 2BHK | 503 sqft | 14.6m
                  </option>
                  <option value="X5L - Studio | 503 sqft | 14.6m">
                    X5L - Studio | 503 sqft | 14.6m
                  </option>
                  <option value="X5m - 348 sqft | 10.1m">
                    X5m - 348 sqft | 10.1m
                  </option>
                  <option value="X5s - 296 sqft | 8.6m">
                    X5s - 296 sqft | 8.6m
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#dc2626]">
                  PRICE
                </label>
                <div
                  className={`rounded-xl border border-[#FDE68A] bg-[#FEF5F0] px-2 py-3 text-center text-xs font-bold truncate ${
                    x5variant ? "text-[#dc2626]" : "text-gray-400"
                  }`}
                >
                  {prices[x5variant] || "Price"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Design */}
        <div className="hidden gap-8 md:grid md:grid-cols-2 xl:grid-cols-3">
          {/* X7 */}
          <div className="rounded-3xl bg-[#fefdfa] p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <span className="rounded-full bg-[#fffbeb] px-4 py-2 text-sm text-[#db7d11]">
                THE FLAGSHIP
              </span>
              <h2 className="text-2xl font-bold">X7</h2>
            </div>

            <img src={product1} className="mb-12 w-full object-contain" />

            <label className="mb-2 block text-sm font-semibold uppercase text-[#6d7481]">
              Select Range
            </label>

            <select
              value={x7variant}
              onChange={(e) => setX7Variant(e.target.value)}
              className="mb-4 w-full rounded-xl border border-[#fde68a] p-2"
            >
              <option value="" disabled>
                Choose Variant
              </option>
              <option value="X7 - 258 sqft | 7.5">
                X7 - 258 sqft | 7.5
              </option>
            </select>

            <label className="mb-2 block text-sm font-semibold uppercase text-[#dc2626]">
              Price
            </label>

            <div
              className={`w-full rounded-2xl border border-[#FDE68A] bg-[#FEF5F0] px-4 py-2 text-center font-bold ${
                x7variant ? "text-[#dc2626]" : "text-gray-400"
              }`}
            >
              {prices[x7variant] || "Select Variant"}
            </div>
          </div>

          {/* X6 */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <span className="rounded-full bg-[#fffbeb] px-4 py-2 text-sm text-[#db7d11]">
                THE VERSATILE
              </span>
              <h2 className="text-2xl font-bold">X6</h2>
            </div>

            <img src={product2} className="mb-9 w-full object-contain" />

            <label className="mb-2 block text-sm font-semibold uppercase text-[#6d7481]">
              Select Range
            </label>

            <select
              value={x6variant}
              onChange={(e) => setX6Variant(e.target.value)}
              className="mb-4 w-full rounded-xl border border-[#fde68a] p-2"
            >
              <option value="" disabled>
                Choose Variant
              </option>
              <option value="X6m - 258 sqft | 7.5m">
                X6m - 258 sqft | 7.5m
              </option>
              <option value="X6s - 207 sqft | 6m">
                X6s - 207 sqft | 6m
              </option>
            </select>

            <label className="mb-2 block text-sm font-semibold uppercase text-[#dc2626]">
              Price
            </label>

            <div
              className={`w-full rounded-2xl border border-[#FDE68A] bg-[#FEF5F0] px-4 py-2 text-center font-bold ${
                x6variant ? "text-[#dc2626]" : "text-gray-400"
              }`}
            >
              {prices[x6variant] || "Select Variant"}
            </div>
          </div>

          {/* X5 */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <span className="rounded-full bg-[#fffbeb] px-4 py-2 text-sm text-[#db7d11]">
                THE GRAND
              </span>
              <h2 className="text-2xl font-bold">X5</h2>
            </div>

            <img src={product3} className="mb-12 w-full object-contain" />

            <label className="mb-2 block text-sm font-semibold uppercase text-[#6d7481]">
              Select Range
            </label>

            <select
              value={x5variant}
              onChange={(e) => setX5Variant(e.target.value)}
              className="mb-4 w-full rounded-xl border border-[#fde68a] p-2"
            >
              <option value="" disabled>
                Choose Variant
              </option>
              <option value="X5x - 2BHK | 606 sqft | 17.6m">
                X5x - 2BHK | 606 sqft | 17.6m
              </option>
              <option value="X5x - Studio | 606 sqft | 17.6m">
                X5x - Studio | 606 sqft | 17.6m
              </option>
              <option value="X5L - 2BHK | 503 sqft | 14.6m">
                X5L - 2BHK | 503 sqft | 14.6m
              </option>
              <option value="X5L - Studio | 503 sqft | 14.6m">
                X5L - Studio | 503 sqft | 14.6m
              </option>
              <option value="X5m - 348 sqft | 10.1m">
                X5m - 348 sqft | 10.1m
              </option>
              <option value="X5s - 296 sqft | 8.6m">
                X5s - 296 sqft | 8.6m
              </option>
            </select>

            <label className="mb-2 block text-sm font-semibold uppercase text-[#dc2626]">
              Price
            </label>

            <div
              className={`w-full rounded-2xl border border-[#FDE68A] bg-[#FEF5F0] px-4 py-2 text-center font-bold ${
                x5variant ? "text-[#dc2626]" : "text-gray-400"
              }`}
            >
              {prices[x5variant] || "Select Variant"}
            </div>
          </div>
        </div>
      </div>

      <DownloadSection />
    </div>
  );
};

export default ProductCard;