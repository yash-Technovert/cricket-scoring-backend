import { createClient } from "@supabase/supabase-js"
import * as dotenv from 'dotenv'
import { User } from "../models/User";
import { generateUserId } from "./HelperService";

dotenv.config();
let url = process.env.SUPABASE_URL!
let serviceKey = process.env.SUPABASE_SERVICE_KEY!
const supabase = createClient(url, serviceKey)

export async function createUser(newUser:User)
{   // Signup the new user in Supabase

    signUp(newUser.email,newUser.password)

    // create a user on Signup
    let id = generateUserId();
        
    const { data, error } = await supabase
    .from('User')
    .insert([
        { 
            id: id,
            email: newUser.email,
            firstname:newUser.firstname,
            lastname:newUser.lastname

        },
    ])
}

async function signUp(email:string , password:string) 
{
    //Sign up in Supabase
    return await supabase.auth.signUp({email: email, password: password}); 
}

export async function validateUser(email: string, password: string)
{   // give access to logged in users.
    
    return await supabase.auth.signInWithPassword({email: email, password: password})
}
