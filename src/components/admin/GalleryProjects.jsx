import React from 'react'

const GalleryProjects = () => {


const dummyProjects=[{
    Image:"xpod/src/assets/images/product-3.webp",
    title:"BannerGhatta",
    location:"blr",
    description:"1 media item"
}]

  return (
    <div>
        <div>
        {dummyProjects.map((index)=>{
            <div key={index} className='border'>
                <img src={index.Image} alt="" />
                <p>{index.title}</p>
                <p>{index.location}</p>
                <p>{index.description}</p>

            </div>
        })}
        </div>
    </div>
  )
}

export default GalleryProjects