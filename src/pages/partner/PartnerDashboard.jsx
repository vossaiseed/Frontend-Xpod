import {
    Search,
    Plus,
    LogOut,
    MapPin,
    Trophy,
    Lock,
    Mic,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PartnerDashboard() {

    const navigate=useNavigate('')
    const handleLogout=()=>{
        navigate('/login')
    }
    return (
        <div className="min-h-screen bg-[#ebe2d2]">

            {/* Top Bar */}
          
            {/* Navbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 sm:px-8 py-4 sm:py-6">

                <h1 className="text-2xl font-bold text-amber-700">
                    xpod
                </h1>

                <div className="flex items-center gap-3 sm:gap-4">

                    <button className="w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-white flex items-center justify-center">
                        <Trophy size={18} />
                    </button>

                    <button className="w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-white flex items-center justify-center">
                        <Lock size={18} />
                    </button>

                    <button 
                    onClick={handleLogout}
                    className="bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full flex items-center gap-2 text-sm sm:text-base">
                        <LogOut size={18} />
                        Logout
                    </button>

                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-8">

                    <div>

                        <p className="uppercase text-xs sm:text-sm tracking-widest text-gray-500">
                            Authorized Partner
                        </p>

                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-2">
                            Fayiz Alikkal
                        </h1>

                        <p className="text-gray-600 text-sm sm:text-base">
                            arfayzalikkal@gmail.com
                        </p>

                        <p className="font-medium text-sm sm:text-base">
                            Alikkal Associates
                        </p>

                        <div className="flex items-center gap-2 text-gray-500 text-sm sm:text-base">
                            <MapPin size={15} />
                            Perinthalmanna
                        </div>

                    </div>

                    {/* Avatar */}
                    <div className="w-32 sm:w-40 md:w-48 h-40 sm:h-52 md:h-60 rounded-3xl bg-[#d7cab8] flex items-center justify-center">
                        <span className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-500">
                            F
                        </span>
                    </div>

                </div>

                {/* Voice Button */}
                <div className="mt-8">

                    <button className="w-full bg-black text-white py-2 sm:py-3 rounded-full text-base sm:text-lg font-semibold flex items-center justify-center gap-3">
                        <Mic />
                        Quick Voice Action
                    </button>

                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 ">

                    <StatCard number="1" title="TOTAL LEADS" />
                    <StatCard number="0" title="CONVERTED" />
                    <StatCard number="1" title="ACTIVE LEADS" />
                    <StatCard number="₹0" title="ROYALTY EARNED" />

                </div>

                {/* Recent */}
                <div className="mt-5">

                    <h2 className="font-bold text-2xl sm:text-lg mb-2">
                        Recent Update
                    </h2>

                    <div className="bg-white rounded-3xl h-32 sm:h-20 flex items-center justify-center text-gray-400 text-sm sm:text-base">
                        No recent activity yet
                    </div>

                </div>

                {/* Leads */}
                <div className="mt-4">

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">

                        <h2 className="font-bold text-3xl sm:text-xl">
                            Your Leads
                        </h2>

                        <button className="bg-black text-white px-5 sm:px-4 py-3 sm:py-2 rounded-full flex items-center gap-2 text-sm sm:text-base">
                            <Plus size={18} />
                            Add Lead
                        </button>

                    </div>

                    {/* Search */}
                    <div className="relative bg-white rounded-2xl">

                        <Search
                            className="absolute left-3 sm:left-4 top-3 sm:top-4 text-gray-400"
                            size={18}
                        />

                        <input
                            className="w-full rounded-2xl py-3 sm:py-3 pl-10 sm:pl-12 outline-none text-sm sm:text-base"
                            placeholder="Search by name or phone..."
                        />

                    </div>

                    {/* Filters */}
                    <div className="flex gap-3 mt-4 overflow-x-auto pb-2">

                        <Filter active text="All" />
                        <Filter text="New" />
                        <Filter text="Discussion" />
                        <Filter text="Converted" />
                        <Filter text="Not Interested" />

                    </div>

                    {/* Lead Card */}
                    <div className="bg-white rounded-3xl p-5 sm:p-4 mt-2">

                        <div className="text-gray-500 mb-2 text-sm">
                            New
                        </div>

                        <h3 className="text-xl sm:text-2xl md:text-md font-semibold">
                            Saleem Image
                        </h3>

                        <p className="text-gray-500 text-sm sm:text-xs">
                            Wayanad
                        </p>

                        <p className="text-gray-500 mt-1 text-sm sm:text-xs">
                            Need 9 pods, X5x 2bhk, X6m, X6s. 3 pods on each model.
                        </p>

                        <p className="text-gray-400 mt-1 text-xs sm:text-xs">
                            27 Mar 2026 9:26 AM IST
                        </p>

                    </div>

                </div>

            </div>
        </div>
    );
}

function StatCard({ number, title }) {
    return (
        <div className="bg-white rounded-2xl p-4 sm:p-2 text-center">
            <h2 className="text-xl sm:text-xl font-bold">
                {number}
            </h2>
            <p className="text-xs text-gray-500 mt-2">
                {title}
            </p>
        </div>
    );
}

function Filter({ text, active }) {
    return (
        <button
            className={`px-4 sm:px-5 py-2 sm:py-3 rounded-full whitespace-nowrap text-sm sm:text-base ${
                active ? "bg-black text-white" : "bg-white"
            }`}
        >
            {text}
        </button>
    );
}