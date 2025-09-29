import { response } from "express";
import User from "../models/user.model.js"
import uploadOnCloudinary from './../config/cloudinary.js';
import geminiResponse from './../gemini.js';
import moment from "moment";

export const getcurrentUser=async(req,res)=>{
    try {
        const userid=req.userid
        const user=await User.findById(userid).select("-password ")
        if(!user){
            return res.status(400).json({
                message:"User not found"
            })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(400).json({
            message:"Get current user error"})
    }
}

export const updateAssistant=async(req,res)=>{
    try {
        const {assistantName,imageUrl}=req.body
        let assistantImage;
        if(req.file){
            assistantImage=await uploadOnCloudinary(req.file.path)
        }else{
            assistantImage=imageUrl
        }
        const user=await User.findByIdAndUpdate(req.userid,{
            assistantName,
            assistantImage
        },{new:true}).select("-password")

        return res.status(200).json(user)


    } catch (error) {
 return res.status(400).json({
            message:"Update Assistant error"})
    }

}

// export const askToAssistant= async(req,res)=>{
//     try{

//         const {command}=req.body
//         const user=await User.findById(req.userid);
//         const userName=user.name
//         const assistantName=user.assistantName
//         const result=await geminiResponse(command ,assistantName, userName)
//         console.log("result",result);
//         console.log(JSON.stringify(result));
        
        
//         const jsonMatch=result.match(/{[\s \S]*}/)
//         console.log("jsonMatch",jsonMatch);
        
//         if(jsonMatch){
//             return res.status(400).json({response:"Sorry, i can't understand"})
//         }
//         const gemResult=JSON.parse(jsonMatch[0])
//         const type=gemResult.type

//         switch(type){
//             case 'get-date' :
//                 return res.Json({
//                     type,
//                     userInput:gemResult.userInput,
//                     response:`Current date is  ${moment().format("YYYY-MM-DD")}`
//                 });
//             case 'get-time' :
//                 return res.Json({
//                     type,
//                     userInput:gemResult.userInput,
//                     response:`Current Time is  ${moment().format("hh:mm A")}`
//                 });
//             case 'get-day' :
//                 return res.Json({
//                     type,
//                     userInput:gemResult.userInput,
//                     response:`Today is  ${moment().format("dddd")}`
//                 });
//             case 'get-month' :
//                 return res.Json({
//                     type,
//                     userInput:gemResult.userInput,
//                     response:`Current month is  ${moment().format("MMMM")}`
//                 });
//             case 'google_search' :
//             case 'youtube_search' :
//             case 'youtube_play' :
//             case 'calculator_open' :
//             case 'instagram_open' :
//             case 'facebook_open' :
//             case 'weather_show' :
//             case 'general' :
//                 return res.Json({
//                     type,
//                     userInput:gemResult.userInput,
//                     response:gemResult.response,
//                 });

//             default:
//                 return res.status(400).json({response:"I didn't understand that command."})
//         }
    
//     } catch(error){
//         return res.status(400).json({response:"Ask assistant error"})

//     }
// }

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    console.log("command",command);
    
    const user = await User.findById(req.userid);
    const userName = user.name;
    const assistantName = user.assistantName;

    const result = await geminiResponse(command, assistantName, userName);
    console.log("result", result);
    console.log(JSON.stringify(result));

    const jsonMatch = result.match(/{[\s\S]*}/);
     

    // agar JSON match NAHI mila to error bhejo
    if (!jsonMatch) {
      return res.status(400).json({ response: "Sorry, I can't understand" });
    }

    const gemResult = JSON.parse(jsonMatch[0]);
    console.log("gemResult", gemResult);
    const type = gemResult.type;

    switch (type) {
      case "get-date":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current date is ${moment().format("YYYY-MM-DD")}`,
        });

      case "get-time":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current Time is ${moment().format("hh:mm A")}`,
        });

      case "get-day":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Today is ${moment().format("dddd")}`,
        });

      case "get-month":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current month is ${moment().format("MMMM")}`,
        });

      case "google-search":
      case "youtube-search":
      case "youtube-play":
      case "general":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "weather-show":
      
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response,
        });

      default:
        return res
          .status(400)
          .json({ response: "I didn't understand that command." });
    }
  } catch (error) {
    console.error("Assistant error:", error);
    return res.status(400).json({ response: "Ask assistant error" });
  }
};
