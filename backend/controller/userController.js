import userModel from "../models/userModel.js";


export const getUserData = async (req, res) => {
    try {
      const {userId} = req.body;
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      };
      res.json({
        sucess:true,
        userdata:{
            name :user.name,
            isAccountVerified :user.isAccountVerified,
        }

      });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}