// import React from 'react'
// import { useContext } from 'react'
// import { UserDataContext } from './context/UserContext';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { useEffect } from 'react';

// function Home() {
//   const{userData , serverUrl , setUserData , getGeminiResponse}=useContext(UserDataContext);
//   const navigate =useNavigate();
//   const handleLogout= async()=>{
//     try{
//       const result= await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
//       setUserData(null)
//       navigate("/signin")
//     }
//     catch(error){
//       setUserData(null)
//       console.log(error)
//     }
//   }

//   const speak=(text)=>{
//     const utterence=new SpeechSynthesisUtterance(text)
//     window.speechSynthesis.speak(utterence)
//   }

//   useEffect(()=>{

//     const SpeechRecognition=window.SpeechRecognition || window.webkitSpeechRecognition
//     const recognition=new SpeechRecognition()
//     recognition.continuous=true,
//     recognition.lang="en-US"

//     recognition.onresult=async (e)=>{
//       const transcript=e.results[e.results.length -1][0].transcript.trim()
//       console.log("getGeminiResponse",transcript)
    

//     if(transcript.toLowerCase().includes(userData.assistantName.toLowerCase()))
//       {
//       const data = await getGeminiResponse(transcript)
//       console.log(data)
//       speak(data.response)
//     }
//   }

//     recognition.start()
//   },[])
 
//   return (
//     <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex items-center justify-center flex-col gap-[15px] '>
//      <button className='min-w-[120px] h-[40px] mt-[30px] text-black font-semibold bg-white absolute top-[20px] right-[20px] rounded-full text-[19px] cursor-pointer'onClick={handleLogout} > Log Out</button>
//       <button className='min-w-[150px] h-[50px] mt-[30px] text-black font-semibold bg-white absolute top-[70px] right-[20px] rounded-full text-[19px] px-[20px] py-[10px] cursor-pointer'onClick={()=> navigate("/customize")}>Customize your Assistant </button>
//       <div className='w-[350px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl'>
//         <img src={userData?.assistantImage} alt="" className='h-full object-cover rounded-4xl '/>
//       </div>
//       <h1 className='text-white text[18px] font-semibold'>I'm {userData?.assistantName}</h1>
//     </div>
//   )
// }

// export default Home

import React, { useContext, useEffect, useState } from 'react'
import { UserDataContext } from './context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(UserDataContext);
  const navigate = useNavigate();
  const [voiceReady, setVoiceReady] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  };

  // ✅ Speak function
  const speak = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel(); // clear old queue

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      utterance.voice = voices.find(v => v.lang === "en-US") || voices[0];
    }

    utterance.onstart = () => console.log("🔊 Speaking started...");
    utterance.onend = () => console.log("✅ Speaking finished");
    utterance.onerror = (e) => console.error("❌ Speak error:", e);

    window.speechSynthesis.speak(utterance);
  };

  // ✅ Unlock voice (needed for autoplay policy)
  const enableVoice = () => {
    const test = new SpeechSynthesisUtterance("Voice activated");
    window.speechSynthesis.speak(test);
    setVoiceReady(true);
  };

  useEffect(() => {
    if (!voiceReady) return; // wait until voice is unlocked

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log("Heard:", transcript);

      if (
        userData?.assistantName &&
        transcript.toLowerCase().includes(userData.assistantName.toLowerCase())
      ) {
        const data = await getGeminiResponse(transcript);
        console.log("Gemini response:", data);

        const reply = data?.response || data;
        speak(reply);
      }
    };

    recognition.start();
    return () => recognition.stop();
  }, [voiceReady, userData, getGeminiResponse]);

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex items-center justify-center flex-col gap-[15px]'>

      {/* Logout button */}
      <button
        className='min-w-[120px] h-[40px] mt-[30px] text-black font-semibold bg-white absolute top-[20px] right-[20px] rounded-full text-[19px] cursor-pointer'
        onClick={handleLogout}>
        Log Out
      </button>

      {/* Customize button */}
      <button
        className='min-w-[150px] h-[50px] mt-[30px] text-black font-semibold bg-white absolute top-[70px] right-[20px] rounded-full text-[19px] px-[20px] py-[10px] cursor-pointer'
        onClick={() => navigate("/customize")}>
        Customize your Assistant
      </button>

      {/* Assistant image */}
      <div className='w-[350px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl'>
        <img src={userData?.assistantImage} alt="" className='h-full object-cover rounded-4xl ' />
      </div>

      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>

      {/* ✅ Voice unlock button (only show if not ready) */}
      {!voiceReady && (
        <button
        className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer'
         onClick={enableVoice}>
           Enable Voice
        </button>
      )}
    </div>
  )
}

export default Home
