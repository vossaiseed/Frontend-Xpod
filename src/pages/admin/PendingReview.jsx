import { CircleCheckBig } from 'lucide-react'
import React from 'react'

const PendingReview = () => {
  return (
    <div>
        <div>
            <h2 className='text-[#dfe2e6]'>New leads submitted by partners awaiting admin review.</h2>
        </div>
        <div className='justify-items-center text-center my-30 text-[#dfe2e6]'>
            <CircleCheckBig size={90} color="#dfe2e6"/>
            No leads pending review
        </div>
    </div>
  )
}

export default PendingReview