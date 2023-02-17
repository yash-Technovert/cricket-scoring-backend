import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv'
import { ExtrasType } from "../models/enums/Match";
import { InningStatResponse } from "../models/InningStat";
import { generateInningId, generateMatchId } from "./HelperService";
dotenv.config()

let url = process.env.SUPABASE_URL!
let serviceKey = process.env.SUPABASE_SERVICE_KEY!
const supabase = createClient(url, serviceKey)


export async function startMatch(team1:string, team2:string, tossWinner:string) {
    let matchId = generateMatchId(team1, team2);
    await initiateMatch(matchId, tossWinner)
    await initiateInning(matchId, true, team1)
    // await updateScore(inning1id, updates)
    // await endMatch(matchId, team1)
}

export async function initiateInning(matchId: string, isFirstInning: boolean, teamName: string)
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

async function initiateMatch(id: string, tossWinner:string)
{
    // update match stat to initiate match 

    const { data, error } = await supabase
    .from('MatchStat')
    .insert({
        id: id,
        tossWinner: tossWinner,
    })
    if(error) return error;
    return data;
}


export async function endMatch(id: string, matchWinner:string)
{
    //update match stat

    const { data, error } = await supabase
    .from('MatchStat')
    .update({ matchWinner: matchWinner })
    .eq('id', id);
    if(error) return error;
    return data;

}

export async function getScore(id: string)
{   // get score from the inning stat table.
    let {data,error} = await supabase.from('InningStat').select('*').eq('id', id)
    let scores: InningStatResponse=
         {
            id:data[0].id,
            teamName:data[0].teamName,
            runsScored:data[0].runsScored,
            wickets:data[0].wickets,
            oversPlayed:data[0].oversPlayed,
            isFirstInning:data[0].isFirstInning,
            extras:{
                wide:data[0].wide,
                noBall:data[0].noBall,
                bye:data[0].bye,
                legBye:data[0].legBye
            },
            matchId:data[0].matchId
        }
    if(error) return error;
    return scores;
}

export async function updateScore(inningId: string, updates: Object)
{   //update score after everyball
    console.log(inningId);
    let { data, error} = await supabase
        .from('InningStat')
        .update(updates)
        .eq('id', inningId) 
    if(error) return error;
    return data;      
}




async function updatePlayerStat(playerId: string, matchId: string, updates: object)
{ //update player stat after either the player is out or his over is done.
    let { data, error } = await supabase.from('PlayerStat').update(updates);
}





