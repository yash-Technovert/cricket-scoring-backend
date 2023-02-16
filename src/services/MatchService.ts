import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv'
import { ExtrasType } from "../models/enums/Match";
import { InningStatResponse } from "../models/InningStat";
import { generateInningId, generateMatchId } from "./HelperService";
dotenv.config()

let url = process.env.SUPABASE_URL!
let serviceKey = process.env.SUPABASE_SERVICE_KEY!
const supabase = createClient(url, serviceKey)


export async function startMatch() {
    let team1 = 'Sunrisers'
    let team2 = 'Kolkata'
    let matchId = generateMatchId(team1, team2);
    let inning1id = generateInningId(matchId, true)
    let inning2id = generateInningId(matchId, false)
    let updates = {}
    await initiateInning(matchId, true, team1)
    await updateScore(inning1id, updates)
    
    
}

async function initiateInning(matchId: string, isFirstInning: boolean, teamName: string)
{
    let { data, error } = await supabase .from('InningStat').insert([
        {
            matchId: matchId,
            id: generateInningId(matchId, isFirstInning),
            teamName: teamName,
            runsScored: 0,
            wickets: 0,
            oversPlayed: 0,
            isFirstInning: isFirstInning,
            wide: 0,
            noBall: 0,
            bye: 0,
            legBye: 0,
            four: 0,
            six: 0
        }
    ])
}

async function endMatch(Id: string)
{
    //update match stat
}

export async function getScore(Id: string)
{   // get score from the inning stat table.
    let inningScore = await supabase.from('InningStat').select('*').eq('id', Id)
    .then((response) => {
        let scores: InningStatResponse=
         {
            id: response.data[0].id,
            teamName: response.data[0].teamName,
            runsScored: response.data[0].runsScored,
            wickets: response.data[0].wickets,
            oversPlayed: response.data[0].oversPlayed,
            isFirstInning: response.data[0].isFirstInning,
            extras:{
                wide: response.data[0].wide,
                noBall: response.data[0].noBall,
                bye: response.data[0].bye,
                legBye: response.data[0].legBye
            },
            matchId: response.data[0].matchId
        }
        return scores
    })
}

async function updateScore(inningId: string, updates: object)
{   //update score after everyball
    console.log(inningId);
    let { data, error} = await supabase.from('InningStat')
        .update(updates)
        .eq('id', inningId)        
}

async function updatePlayerStat(playerId: string, matchId: string, updates: object)
{ //update player stat after either the player is out or his over is done.
    let { data, error } = await supabase.from('PlayerStat').update(updates);
}





