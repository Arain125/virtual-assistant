import React, { useContext, useEffect, useState } from "react";
import { UserDataContext } from "./context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Home() {
  const [pendingUrl, setPendingUrl] = useState(null);

  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(UserDataContext);
  const navigate = useNavigate();
  const [voiceReady, setVoiceReady] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.error("Logout error:", error);
    }
  };

  const speak = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      utterance.voice = voices.find((v) => v.lang === "en-US") || voices[0];
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleCommand = (data) => {
  const { type, userInput, response } = data;
  let url = null;

  switch (type) {
    case "google-search":
      url = `https://www.google.com/search?q=${encodeURIComponent(userInput)}`;
      break;

    case "youtube-search":
    case "youtube-play":
      url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
        userInput
      )}`;
      break;

    case "calculator-open":
      url = `https://www.google.com/search?q=calculator`;
      break;

    case "instagram-open":
      url = `https://www.instagram.com/`;
      break;

    case "facebook-open":
      url = `https://www.facebook.com/`;
      break;

    case "twitter-open":
      url = `https://twitter.com/`;
      break;

    case "gmail-open":
      url = `https://mail.google.com/`;
      break;

    case "whatsapp-open":
      url = `https://web.whatsapp.com/`;
      break;

    case "weather-show":
      url = `https://www.google.com/search?q=weather`;
      break;

    case "news-show":
      url = `https://news.google.com/`;
      break;

    case "map-search":
      url = `https://www.google.com/maps/search/${encodeURIComponent(
        userInput
      )}`;
      break;

    case "open-site":
      if (userInput.startsWith("http")) {
        url = userInput;
      } else {
        url = `https://${userInput.replace(/\s+/g, "")}.com`;
      }
      break;

    case "scroll-up":
      window.scrollBy({ top: -500, behavior: "smooth" });
      break;

    case "scroll-down":
      window.scrollBy({ top: 500, behavior: "smooth" });
      break;

    case "read-page":
      speak(document.body.innerText.slice(0, 500)); // sirf first 500 chars read karega
      break;

    case "tell-joke":
      speak("Why don’t skeletons fight each other? Because they don’t have the guts!");
      break;

    case "tell-quote":
      speak("Believe you can and you're halfway there.");
      break;

    case "note-create":
      localStorage.setItem(
        "assistant-note",
        userInput || "No content provided"
      );
      speak("Note saved successfully!");
      break;

    case "note-read":
      const note = localStorage.getItem("assistant-note");
      speak(note ? `Your note says: ${note}` : "You don't have any saved notes.");
      break;

    case "todo-add":
      const todos = JSON.parse(localStorage.getItem("assistant-todos") || "[]");
      todos.push(userInput);
      localStorage.setItem("assistant-todos", JSON.stringify(todos));
      speak("Added to your to-do list.");
      break;

    case "todo-list":
      const allTodos = JSON.parse(localStorage.getItem("assistant-todos") || "[]");
      if (allTodos.length === 0) {
        speak("Your to-do list is empty.");
      } else {
        speak("Here are your tasks: " + allTodos.join(", "));
      }
      break;

    case "reminder-set":
      speak("Okay, I'll remind you soon. (Reminder system not fully implemented yet)");
      break;

    case "get-time":
      speak("The current time is " + new Date().toLocaleTimeString());
      break;

    case "get-date":
      speak("Today's date is " + new Date().toLocaleDateString());
      break;

    case "get-day":
      speak("Today is " + new Date().toLocaleDateString("en-US", { weekday: "long" }));
      break;

    case "get-month":
      speak("This month is " + new Date().toLocaleDateString("en-US", { month: "long" }));
      break;

    default:
      console.log("Unknown command type:", type);
  }

if (url) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} else {
  speak(response);
}


};

  const enableVoice = () => {
    const test = new SpeechSynthesisUtterance("Voice activated");
    window.speechSynthesis.speak(test);
    setVoiceReady(true);
  };

  useEffect(() => {
    if (!voiceReady) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = async (e) => {
      const transcript =
        e.results[e.results.length - 1][0].transcript.trim();
      console.log("Heard:", transcript);

      if (
        userData?.assistantName &&
        transcript.toLowerCase().includes(userData.assistantName.toLowerCase())
      ) {
        const data = await getGeminiResponse(transcript);
        const responseData =
          typeof data === "string" ? JSON.parse(data) : data;

        console.log("Gemini response:", responseData);
        handleCommand(responseData);
      }
    };

    recognition.start();
    return () => recognition.stop();
  }, [voiceReady, userData, getGeminiResponse]);

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex items-center justify-center flex-col gap-[15px]">
      <button
        className="min-w-[120px] h-[40px] mt-[30px] text-black font-semibold bg-white absolute top-[20px] right-[20px] rounded-full text-[19px] cursor-pointer"
        onClick={handleLogout}
      >
        Log Out
      </button>

      <button
        className="min-w-[150px] h-[50px] mt-[30px] text-black font-semibold bg-white absolute top-[70px] right-[20px] rounded-full text-[19px] px-[20px] py-[10px] cursor-pointer"
        onClick={() => navigate("/customize")}
      >
        Customize your Assistant
      </button>

      <div className="w-[350px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl">
        <img
          src={userData?.assistantImage}
          alt="Assistant"
          className="h-full object-cover rounded-4xl"
        />
      </div>

      <h1 className="text-white text-[18px] font-semibold">
        I'm {userData?.assistantName}
      </h1>

      {!voiceReady && (
        <button
          className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer"
          onClick={enableVoice}
        >
          Enable Voice
        </button>
      )}
      
    </div>
  );
}

export default Home;
