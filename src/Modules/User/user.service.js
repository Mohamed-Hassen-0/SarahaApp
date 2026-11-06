import successResponse from "../../Utils/Response/success.response.js"

export const getProfile = async (req,res)=>{
successResponse(res,200,"Done",{user:req.user})
}
export const updateProfilePicture = async (req,res)=>{
console.log(req.file);
successResponse(res,200,"Done",{user:req.user})

}