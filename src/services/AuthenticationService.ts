import { createClient } from "@supabase/supabase-js"
import * as dotenv from 'dotenv'
import { User } from "../models/Users";
import { generateUserId } from "./HelperService";
import jwt from "jsonwebtoken";

dotenv.config();
let url = process.env.SUPABASE_URL!
let serviceKey = process.env.SUPABASE_SERVICE_KEY!
const supabase = createClient(url, serviceKey)
const { sign,decode, verify } = jwt;


export async function createUser(user:User)
{   
    try {
        // check if user exists in Supabase
        const userCheck = await supabase.from('User').select('*').eq("email", user.email);

        if(userCheck.data.length)
        {
            return null;
        }

        // sign up new user
        var response = signUp(user.email,user.password)

        // create a user on Signup
        const newUser = { 
            id: generateUserId(),
            email: user.email,
            firstname:user.firstName,
            lastname:user.lastName
        }
        if(response)
        {
            await supabase
            .from('User')
            .insert([  newUser  ])
        }

        return newUser;
    } catch (error) {
        return null;
    }
    

}

async function signUp(email:string , password:string) 
{
    //Sign up in Supabase
    const {data, error} = await supabase.auth.signUp({email: email, password: password}); 
    return data ? data : error;
}

export async function login(email: string, password: string)
{   // give access to logged in users.
    const { data, error } = await supabase.auth.signInWithPassword({email: email, password: password})
    return data ? data : error;
}

export function generateJwtToken(email: string)
{
    var token = sign({
        email
    }, process.env.ACCESS_TOKEN);

    return token;
}

export function validateJwtToken(token: string)
{
    try {
        let tokenCheck = verify(token, process.env.ACCESS_TOKEN)

    } catch (error: any) {
        console.log(error.message);
        
    }
    
}

