import React from 'react'
import Navbar from './Navbar'
import heroImage from '../assets/images/hero-image.webp'

const Hero = () => {
    return (
        <div
            className="min-h-screen bg-cover bg-center lg:bg-right bg-no-repeat relative bg-[#f4eee1] py-2 md:py-20"
            style={{ backgroundImage: `url(${heroImage})` }}
        >
            {/* overlay */}
            <div className="absolute inset-0 bg-[#f4eee1]/60"></div>

            <div className="relative z-10 px-6 sm:px-10 lg:px-24">
                <div className="pt-20 sm:pt-24 lg:pt-32 max-w-3xl">

                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-slate-900">
                        Explore the Future of
                    </h1>

                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[#bb882e] mb-6">
                        Modular Living
                    </h1>

                    <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed mb-8">
                        Discover XPOD'S innovative range of modular spaces designed <br />
                        for modern lifestyles — engineered for elegance,
                        built for the <br /> future.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="bg-[#bb882e] px-6 py-3 rounded-xl text-white font-semibold">
                            Explore Range
                        </button>

                        <button className="bg-[#d8d7d3] border-2 border-[#bb882e] px-6 py-3 rounded-xl text-[#92400e] font-semibold">
                            Download Brochure
                        </button>
                    </div>

                    <div className='border-t border-[#bb882e] mt-6 max-w-xl'></div>

                    {/* {stats} */}
                    {/* <div className='grid grid-cols-3'>
                        <div className=''>
                            <h2 className='text-2xl font-bold text-slate-900'>3</h2>
                            <p className='text-sm text-slate-600'>Product Lines</p>
                        </div>
                        <div className=''>
                            <h2 className='text-2xl font-bold text-slate-900'>6+</h2>
                            <p className='text-sm text-slate-600'>Variants</p>
                        </div>
                        <div className=''>
                            <h2 className='text-2xl font-bold text-slate-900'>100%</h2>
                            <p className='text-sm text-slate-600'>Modular</p>
                        </div>
                    </div> */}
                    <div className="flex  gap-12 sm:gap-8 mt-6">
                        <div >
                            <h2 className="text-2xl font-bold">3</h2>
                            <p className="text-sm">Product Lines</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold">6+</h2>
                            <p className="text-sm">Variants</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold">100%</h2>
                            <p className="text-sm">Modular</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Hero