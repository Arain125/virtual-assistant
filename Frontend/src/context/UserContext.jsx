import React, { createContext, useEffect, useState } from 'react'
export const UserDataContext=createContext()
import axios from 'axios'
function UserContext({children}) {
    const serverUrl="http://localhost:8000"
    const[userData,setUserData]=useState(null)
    const [froentImage, setFrontImage] = useState(null);
    const [backendImage, setBackendImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const handlecurrentUser=async()=>{
      try{
        const result=await axios.get(`${serverUrl}/api/user/current`,{ withCredentials:true})
        setUserData(result.data)
        console.log(result.data)
      }catch(error){
        console.log(error)
      }
    }

    const getGeminiResponse=async(command)=>{
      try{

        const result=await axios.post(`${serverUrl}/api/user/asktoassistant`,{command},{ withCredentials:true})
        console.log("result",result);
        
        return result.data
      }
      catch(error){
        console.log(error) 
      }
    }



    
    useEffect(()=>{
      handlecurrentUser()
    },[])
    const value={
serverUrl,userData,setUserData , froentImage, setFrontImage, backendImage, setBackendImage , selectedImage, setSelectedImage ,getGeminiResponse
    }
  return (
    <div>
        <UserDataContext.Provider value={value}>
      {children}
        </UserDataContext.Provider>
    </div>
  )
}

export default UserContext
