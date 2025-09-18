import React, { createContext, useEffect, useState } from 'react'
export const UserDataContext=createContext()
import axios from 'axios'
function UserContext({children}) {
    const serverUrl="http://localhost:8000"
    const[userData,setUserData]=useState(null)

    const handlecurrentUser=async()=>{
      try{
        const result=await axios.get(`${serverUrl}/api/user/current`,{ withCredentials:true})
        setUserData(result.data)
        console.log(result.data)
      }catch(error){
        console.log(error)
      }
    }
    useEffect(()=>{
      handlecurrentUser()
    },[])
    const value={
serverUrl,userData,setUserData
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
