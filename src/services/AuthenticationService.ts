import { createClient } from "@supabase/supabase-js"
import * as dotenv from 'dotenv'
import { generateUserId } from "./HelperService";

dotenv.config();
let url = process.env.SUPABASE_URL!
let serviceKey = process.env.SUPABASE_SERVICE_KEY!
const supabase = createClient(url, serviceKey)

export async function createUser(email: string, password: string)
{   // create a user on Signup
    let id = generateUserId();
        
    const { data, error } = await supabase
    .from('User')
    .insert([
        { 
            id: id,
            email: email,
            password: password
        },
    ])
}

export async function validateUser(email: string, password: string)
{   // give access to logged in users.

}