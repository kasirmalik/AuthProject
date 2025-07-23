import jwt from "jsonwebtoken";


const userAuth = (req, res, next) => {
    const {token} = req.cookies;
    if(!token){
        return res.status(401).json({message: "You are not authenticated"});
    }
    try {
       const tokenDecode= jwt.verify(token, process.env.JWT_SECRET);
       if (tokenDecode.id) {
        req.userId = tokenDecode.id;
        
       }else{
        return res.status(401).json({ message: "You are not authenticated" });
       }
       next();
        
    } catch (error) {
        res.json({ message: "You are not authenticated" });
    }
}

export default userAuth;