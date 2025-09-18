import User from "../models/user.model.js"

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
