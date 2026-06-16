import { CircleCheckBig } from 'lucide-react'
import React from 'react'

const ConversionRequests = () => {
    return (
        <div>
            <div>
                <h2 className='text-[#dfe2e6]'>Leads where sales staff have requested conversion approval.</h2>
            </div>
            <div className='justify-items-center text-center my-30 text-[#dfe2e6]'>
                <CircleCheckBig size={90} color="#dfe2e6" />
                No Conversion Requests
            </div>
        </div>
    )
}
export default ConversionRequests