import React, { useContext } from 'react'
import { UserDataContext } from '../context/userContext';

function Card({image}) {
     const{serverUrl,userData,setUserData , froentImage, setFrontImage, backendImage, setBackendImage , selectedImage, setSelectedImage}=useContext(UserDataContext);
  return (
    <div className={`h-[140px] w-[70px] lg:w-[150px] lg:h-[250px] bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white ${selectedImage==image?"border-4 border-white shadow-2xl shadow-blue-950":null}`}onClick={()=>{
      setSelectedImage(image)
      setBackendImage(null)
      setFrontImage(null) 
      }}>
      <img src={image} alt="" className="h-full object-cover" />
    </div>
  )
}

export default Card
