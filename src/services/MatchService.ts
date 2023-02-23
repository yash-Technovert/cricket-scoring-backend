import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv'
import { InningStatResponse } from "../models/InningStat";
import { generateInningId, generateMatchId, generateTeamId } from "./HelperService";
import { CreateMatch, StartMatch } from "../models/Match";
import { Player } from "../models/Player";
import { Matches } from "../models/Matches";
dotenv.config()

let url = process.env.SUPABASE_URL!
let serviceKey = process.env.SUPABASE_SERVICE_KEY!
const supabase = createClient(url, serviceKey)


export async function startMatch(matchDetails: CreateMatch) {
    let matchId = generateMatchId(matchDetails.teamOne, matchDetails.teamTwo);
    let newMatch:StartMatch={
        id:matchId,
        teamOne:matchDetails.teamOne,
        teamTwo:matchDetails.teamTwo,
        tossWinner:matchDetails.tossWinner,
        tossDecision:matchDetails.tossDecision
    }
    await initiateMatch(newMatch);
    await initiateInning(matchId, true, matchDetails.teamOne)
    await initiateInning(matchId, false, matchDetails.teamTwo)

    let matchResponse={
        matchInfo:{},
        firstInning:{}
    }

    let { data, error } = await supabase .from('MatchStat').select('*').eq('id', matchId)
    if(error) return error;
    matchResponse.matchInfo=data;

    let { data: data1, error: error1 } = await supabase .from('InningStat').select('*').eq('matchId', matchId).eq('isFirstInning', true)
    if(error1) return error1;
    matchResponse.firstInning=data1;

    return matchResponse;
}

async function initiateMatch(newMatch:StartMatch)
{
    let { data, error } = await supabase .from('MatchStat').insert([
        {
            id:newMatch.id,
            teamOne: newMatch.teamOne,
            teamTwo: newMatch.teamTwo,
            tossWinner: newMatch.tossWinner,
            tossDecision: newMatch.tossDecision,
            matchWinner: null
        }
    ])
    if(error) return error;
    return data;
}

export async function createTeam(teamName: string)
{
    const teamId= generateTeamId();
    let { data, error } = await supabase .from('Team').insert([
        {
            id:teamId,
            teamName: teamName
        }
    ])
    if(error) return error;
    return data;
    
}

export async function getAllTeams()
{
    let { data, error } = await supabase .from('Team').select('*')
    if(error) return error;
    return data;
}

export async function getPlayers(teamId: string)
{
    let { data, error } = await supabase .from('Players').select('*').eq('teamId', teamId)
    if(error) return error;
    return data;
}

export async function createPlayer(player:Player)
{
    let { data, error } = await supabase .from('Players').insert([
        {
            id:player.id,
            name: player.name,
            teamId: player.teamId,
            jerseyNumber:player.jerseyNumber,
            playerType:player.playerType
        }
    ])
    if(error) return error;
    return data;
}

export async function getMatches()
{
    let {data,error}=await supabase.from('MatchStat').select('*')
    if(error) return error;
    const inningData:any=await getInning()
    const matches:Matches[]=[]
    data.forEach((match:any)=>{
        let firstInning= inningData?.find((inning:any)=>inning?.matchId===match?.id && inning?.isFirstInning)
        let secondInning= inningData?.find((inning:any)=>inning?.matchId===match?.id && !inning?.isFirstInning)
        let matchData:Matches={
            matchId:match.id,
            teamOne:match?.teamOne,
            teamTwo:match?.teamTwo,
            tossWinner:match?.tossWinner,
            tossDecision:match?.tossDecision,
            matchWinner:match?.matchWinner,
            inningOneId:firstInning?.id,
            teamOneRuns:firstInning?.runsScored,
            teamOneOvers:firstInning?.oversPlayed,
            teamOneWickets:firstInning?.wickets,
            inningTwoId:secondInning?.id,
            teamTwoRuns:secondInning?.runsScored,
            teamTwoOvers:secondInning?.oversPlayed,
            teamTwoWickets:secondInning?.wickets
        }
        matches.push(matchData)
    })
    return matches;
}

export async function getInning()
{
    let {data,error}=await supabase.from('InningStat').select('*')
    if(error) return error;
    return data
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

export async function getScore(matchId:string)
{   // get score from the inning stat table.
    let {data,error} = await supabase.from('InningStat').select('*').eq('matchId', matchId)
    if(error) return error
    if(data[0]?.isFirstInning==true)
    {
        
        if(data[0]?.wickets===10 || data[0]?.oversPLayed>=6)
        {
            console.log('MORNING')
            let scores: InningStatResponse =
             {
                id:data[1]?.id1,
                teamName:data[1]?.teamName,
                runsScored:data[1]?.runsScored,
                wickets:data[1]?.wickets,
                oversPlayed:data[1]?.oversPlayed,
                isFirstInning:data[1]?.isFirstInning,
                extras:{
                    wide:data[1]?.wide,
                    noBall:data[1]?.noBall,
                    bye:data[1]?.bye,
                    legBye:data[1]?.legBye
                },
                matchId:data[1]?.matchId
            }
            console.log(scores)
            return scores;
        }
        else{
            let scores: InningStatResponse ={
            id:data[0]?.id,
            teamName:data[0]?.teamName,
            runsScored:data[0]?.runsScored,
            wickets:data[0]?.wickets,
            oversPlayed:data[0]?.oversPlayed,
            isFirstInning:data[0]?.isFirstInning,
            extras:{
                wide:data[0]?.wide,
                noBall:data[0]?.noBall,
                bye:data[0]?.bye,
                legBye:data[0]?.legBye
            },
            matchId:data[0]?.matchId
        }
        return scores;
        }
    }
    else{
        if(data[1]?.wickets===10 || data[1]?.oversPlayed>=6)
        {
            console.log('EVENING')
            let scores: InningStatResponse =
            {
                id:data[0]?.id,
                teamName:data[0]?.teamName,
                runsScored:data[0]?.runsScored,
                wickets:data[0]?.wickets,
                oversPlayed:data[0]?.oversPlayed,
                isFirstInning:data[0]?.isFirstInning,
                extras:{
                    wide:data[0]?.wide,
                    noBall:data[0]?.noBall,
                    bye:data[0]?.bye,
                    legBye:data[0]?.legBye
                },
                matchId:data[0]?.matchId
            }
            return scores;
        }
        else{
            console.log('BYEEE')
        let scores: InningStatResponse =
         {
            id:data[1]?.id,
            teamName:data[1]?.teamName,
            runsScored:data[1]?.runsScored,
            wickets:data[1]?.wickets,
            oversPlayed:data[1]?.oversPlayed,
            isFirstInning:data[1]?.isFirstInning,
            extras:{
                wide:data[1]?.wide,
                noBall:data[1]?.noBall,
                bye:data[1]?.bye,
                legBye:data[1]?.legBye
            },
            matchId:data[1]?.matchId
        }
        return scores;
        }
    }
}

export async function updateScore(inningId: string, updates: Object)
{   //update score after everyball
    let { data, error} = await supabase
        .from('InningStat')
        .update(updates)
        .eq('id', inningId) 
    if(error) return error;
    return data;      
}

export async function getMatchInfo(id: string)
{   //get match info from match stat table
    let { data, error } = await supabase.from('MatchStat').select('*').eq('id', id);
    if(error) return error;
    return data;
}


export async function updatePlayerStat(id: string, matchId: string, updates: object)
{ //update player stat after either the player is out or his over is done.
    let { data, error } = await supabase.from('PlayerStat').update(updates).eq('id', id).eq('matchId', matchId);
    if(error) return error;
    return data;
}

async function InitiatePlayer(matchId:any,players:any)
{
    players.forEach(async (player:any) => {
        let {data,error}=await supabase
        .from('PlayerStat').insert({
            id:`${matchId}_${player.name.substring(4)}`,
            name:player.name,
            matchId:matchId,
        })
        if(error) return error;
        return data;
    })
}






