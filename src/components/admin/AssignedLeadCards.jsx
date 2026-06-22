import { Clock, Delete, DeleteIcon, LocateIcon, MapPin, Phone, RecycleIcon } from 'lucide-react';
import React from 'react'

const assignedLeads = [
    {
        id: "L1",
        date: "2026-06-10",
        name: "John Doe",
        phone: 52555555,
        location: "Kochi",
        assigned_by: "Admin",
    },
    {
        id: "L2",
        date: "2026-06-11",
        name: "Sara Ali",
        phone: 52555555,
        location: "Ernakulam",
        assigned_by: "Lead Manager",
    },
    {
        id: "L3",
        date: "2026-06-12",
        name: "Mike Ross",
        phone: 52555555,
        location: "Kalamassery",
        assigned_by: "Admin",
    },
    {
        id: "L4",
        date: "2026-06-13",
        name: "Rachel Green",
        phone: 52555555,
        location: "Thrissur",
        assigned_by: "Lead Manager",
    },
];
const AssignedLeadCards = () => {
    return (
        <div>
            <div className='grid grid-cols-2 md:grid md:grid-cols-3 my-5 gap-3'>
                {assignedLeads.map((leads) => (
                    <div key={leads.id} className=' p-2 rounded-2xl shadow-2xl px-5'>
                        <button className='float-end'><DeleteIcon /></button>
                        <div className='flex justify-between'>
                            <p className='text-lg'>{leads.name}</p>
                            <p>{leads.assigned_by}
                            </p></div>
                        <p className='flex gap-1 text-[#6b7280] text-sm'><Phone size={14} className='my-1' />{leads.phone}</p>
                        <p className='flex gap-1 text-[#6b7280] text-sm'><MapPin size={14} className='my-1' />{leads.location}</p>
                        <p className='flex gap-1 text-[#6b7280] text-sm'><Clock size={14} className='my-1' />{leads.date}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AssignedLeadCards