import React from 'react'
import AssignedLeadCards from '../../components/admin/AssignedLeadCards'

const AssignedLeads = () => {

const buttons=[
    'All(168)',
    'New',
    "In-Progress",
    "Converted",
    "failed"
]

  return (
    <div>
        <div className='flex gap-2 '>
        {buttons.map((button)=>(
            <div key={button} className='border-0 shadow p-2 rounded-2xl text-sm'>
                <button>{button}</button>
            </div>
        ))}
        </div>
        <div>
            <AssignedLeadCards/>
        </div>
    </div>
  )
}

export default AssignedLeads