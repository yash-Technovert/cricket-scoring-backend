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
    console.log(matchDetails)
    let matchId = generateMatchId(matchDetails.teamOne, matchDetails.teamTwo);
    let newMatch:StartMatch={
        id:matchId,
        teamOne:matchDetails.teamOne,
        teamTwo:matchDetails.teamTwo,
        tossWinner:matchDetails.tossWinner,
        tossDecision:matchDetails.tossDecision
    }
    await initiateMatch(newMatch);
    await initiatePlayer(matchId,matchDetails.teamOnePlayers)
    await initiatePlayer(matchId,matchDetails.teamTwoPlayers)
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
                matchId:data[1]?.matchId,
                four:data[1]?.four,
                six:data[1]?.six
            }
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
            matchId:data[0]?.matchId,
            four:data[0]?.four,
            six:data[0]?.six
        }
        return scores;
        }
    }
    else{
        if(data[1]?.wickets===10 || data[1]?.oversPlayed>=6)
        {
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
                matchId:data[0]?.matchId,
                four:data[0]?.four,
                six:data[0]?.six
            }
            return scores;
        }
        else{
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
            matchId:data[1]?.matchId,
            four:data[1]?.four,
            six:data[1]?.six
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

export async function getPlayerStat(matchId:string)
{
    let {data,error}=await supabase .from('PlayerStat').select('*').eq('matchId',matchId)
    if(error) return error;
    return data;
}

export async function getSinglePlayerStat(id:string,matchId:string)
{
    let {data,error}=await supabase .from('PlayerStat').select('*').eq('matchId',matchId).eq('id',id)
    if(error) return error;
    return data;
}

async function initiatePlayer(matchId:string,players:any)
{
    players.forEach(async (player:any) => {
        let {data,error}=await supabase
        .from('PlayerStat').insert({
            id:player.id,
            teamId:player.teamId,
            name:player.name,
            matchId:matchId,
            runs:0,
            ballsPlayed:0,
            four:0,
            six:0,
            wickets:0,
            overs:0,
            runsConceded:0,
            maiden:0,
            disableBatting:0,
            disableBowling:0
        })
        if(error) return error;
        return data;
    })
}

export async function getFinishedMatches(matchId:string)
{
    let finishedMatches:any={
        matchInfo:{},
        firstInningStat:{},
        secondInningStat:{},
        teamOnePlayerStat:{},
        teamTwoPlayerStat:{}
    }
    let {data,error}=await supabase .from('MatchStat').select('*').eq('id',matchId)
    if(error) return error;
    finishedMatches.matchInfo=data;

    let {data:data1,error:error1}=await  supabase .from('InningStat').select('*').eq('matchId',matchId)
    if(error1) return error1;
    finishedMatches.firstInningStat=data1[0]?.isFirstInning==true?data1[0]:data1[1];
    finishedMatches.secondInningStat=data1[0]?.isFirstInning==false?data1[0]:data1[1];

    let {data:data2,error:error2}=await  supabase .from('PlayerStat').select('*').eq('matchId',matchId)
    if(error2) return error2;

    let {data:data3,error:error3}:any=await  supabase .from('Team').select('*').eq('teamName',finishedMatches?.firstInningStat?.teamName)
    if(error3) return error3;

    let {data:data4,error:error4}:any=await  supabase .from('Team').select('*').eq('teamName',finishedMatches?.secondInningStat?.teamName)
    if(error4) return error4;


    finishedMatches.teamOnePlayerStat=data2.filter((player:any)=>player.teamId==data3[0]?.id);
    finishedMatches.teamTwoPlayerStat=data2.filter((player:any)=>player.teamId==data4[0]?.id);

    return finishedMatches
}






