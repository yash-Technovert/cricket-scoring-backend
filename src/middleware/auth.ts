import jwt from "jsonwebtoken";
const { sign,decode, verify } = jwt;

export const auth =async (req: any, res: any, next:any) =>{

    try {
        let tokenCheck = verify(req.headers.authorization, process.env.ACCESS_TOKEN)
        console.log("user authorized");
        next();
        
    } catch (error: any) {
        console.log(error.message);
        res.status(401).json({success:false,err:"you are not authorized"});
    }
}