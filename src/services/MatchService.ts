import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv'
import { InningStat } from "../models/InningStat";
import express from "express";
import bodyParser from "body-parser";
dotenv.config()

let url = process.env.SUPABASE_URL!
let key = process.env.SUPABASE_KEY!
const supabase = createClient(url, key)
const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

export async function getData() {
    let data = await supabase.from('Players').select("*");
    console.log("Table Data ->",data);
}



