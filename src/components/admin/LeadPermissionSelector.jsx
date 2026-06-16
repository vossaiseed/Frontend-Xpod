import React, { useState } from 'react'
import { ShieldCheck, ShieldOff } from 'lucide-react'
import { Check } from "lucide-react";

const LeadPermissionSelector = () => {
    const [fullAccess, setFullAccess] = useState(false)

    const partnerCategories = [
        "Associates",
        "Authorized Partners",
        "Exclusive Partners",
        "Architects"
    ]

    const partners = [
        "Mohammed Shuhaib P",
        "ROHIT GUPTA",
        "INDRANEEL DUTTA",
        "Fayiz Alikkal",
        "Benazir Ameen",
    ];

    const sources = [
        "Social Media",
        "Referral",
        "Direct Calls and Messages",
        "Exhibition(HYD)",
    ];
    const [partnerCategory, setPartnerCategory] = useState([])
    const [specificPartners, setSpecificPartners] = useState([])
    const [leadSources, setLeadSources] = useState([])

    const toggleCategory = (category) => {
        setPartnerCategory((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        )
    }

    const toggleSpecificPartners = (category) => {
        setSpecificPartners((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        )
    }

    const toggleLeadSource = (category) => {
        setLeadSources((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        )
    }

    const hasPermission =
        partnerCategory.length > 0 ||
        specificPartners.length > 0 ||
        leadSources.length > 0;


    return (
        <div className='border rounded-2xl p-4 bg-[#f8fafc]'>
            <div className='flex gap-2'>
                <ShieldCheck size={20} className='my-1' />
                <h2 className='font-bold text-md'>Lead Access Permission</h2>
            </div>
            <div className='flex items-center gap-3 my-5'>
                {/* {restricted-can Only see selected sources} */}
                {/* {toggle} */}
                <button
                    onClick={() => setFullAccess(!fullAccess)}
                    className={`relative w-18 h-5 md:w-10 md:h-5 rounded-full transition-all duration-300 ${fullAccess ? "bg-green-500" : "bg-gray-300"
                        }`}
                >
                    <span className={`absolute top-0 md:top-1 rounded-full w-5 h-5  md:w-3 md:h-3 bg-white transition-all duration-300 ${fullAccess ? "left-8 md:left-5" : "left-0 md:left-1"}`} />
                </button>
                <span className='text-[#374456] text-xs md:text-lg'>
                    {fullAccess ?
                        "Full Access — Can see all leads" : "Restricted — Can only see selected sources"}
                </span>
            </div>

            {/* {hidden full access is enabeled} */}
            {!fullAccess && (
                <>
                    <div className='my-3'>
                        <h1 className='text-[#6b7280] uppercase'>Partner Categories</h1>

                        <div className='flex flex-wrap gap-3 py-2'>
                            {partnerCategories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => toggleCategory(category)}
                                    type='button'
                                    className={`px-2 flex  text-xs py-2 rounded-xl bg-[#ffffff] border transition ${partnerCategory.includes(category)
                                        ? "bg-blue-500 text-white border-blue-40"
                                        : "bg-white border-gray-300"
                                        }
                                        hover:border-[#93c5fd]
                                        `}
                                >
                                    {partnerCategory.includes(category) && <Check size={14} />}
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='my-3'>
                        <h1 className='text-[#6b7280] uppercase'>specific partners</h1>

                        <h1 className='py-2'>Authorized Partners</h1>
                        <div className='grid grid-cols-2  md:flex md:flex-wrap md:gap-3 md:py-2'>
                            {partners.map((partners) => (
                                <button
                                    key={partners}
                                    type='button'
                                    onClick={() => toggleSpecificPartners(partners)}
                                    className={`flex px-4 py-2 text-xs rounded-xl border transition ${specificPartners.includes(partners)
                                        ? " bg-[#f09b0b] text-white"
                                        : "bg-white border-gray-300"
                                        }
                                        hover:border-[#fbdf85]
                                        `}
                                >
                                    {specificPartners.includes(partners) && <Check size={14} />}
                                    {partners}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='my-2'>
                        <h1 className='text-[#6b7280] uppercase'>Lead Source</h1>

                        <div className='flex flex-wrap gap-3 py-3'>
                            {sources.map((sources) => (
                                <button
                                    key={sources}
                                    type='button'
                                    onClick={() => toggleLeadSource(sources)}
                                    className={`flex px-2 py-2 text-xs rounded-xl border transition ${leadSources.includes(sources)
                                        ? " bg-[#16a24a] text-white"
                                        : "bg-white border-gray-300"
                                        } 
                                        hover:border-[#90f1b4]`
                                    }
                                >
                                    {leadSources.includes(sources) && <Check size={14} />}
                                    {sources}
                                </button>
                            ))}
                        </div>
                    </div>
                    {!hasPermission && (
                        <div className='border rounded-xl p-2 my-5 bg-[#fffbeb] flex gap-2'>
                            <ShieldOff size={20} className='text-[#b45309]' />
                            <h2 className='text-[#b45309] text-xxs md:text-xs'>No permissions selected — this staff member will see no leads until at least one is added.</h2>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default LeadPermissionSelector