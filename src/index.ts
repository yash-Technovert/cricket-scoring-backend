import * as dotenv from 'dotenv';
import { getData } from './services/MatchService';
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL 
const supabaseKey = process.env.SUPABASE_KEY!

let main = await getData()

console.log(main);


console.log(supabaseUrl);
console.log(supabaseKey);


