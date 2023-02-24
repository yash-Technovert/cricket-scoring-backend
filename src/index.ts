import { createUser, login } from './services/AuthenticationService';
import {createPlayer, createTeam, endMatch, getAllTeams, getFinishedMatches, getMatches, getMatchInfo, getPlayers, getPlayerStat, getScore, getSinglePlayerStat, initiateInning, startMatch, updatePlayerStat, updateScore } from './services/MatchService';
import express from 'express';
import * as cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors.default());

app.get('/', (req: any, res: any,next:any) => {
    res.send('Hello World');
});
//login user
app.post('/login', async (req: any, res: any) => {
    const { username, password } = req.body;
    const data= await login(username, password);
    res.send(data);
})

// signup user
app.post('/signup', async (req: any, res: any) => {
    const { firstName, lastName, email, password } = req.body;
    const data= await createUser({firstName, lastName, email, password});
    console.log(data)
    res.send(data);
})

// create a new team
app.post('/createteam',async(req:any,res:any)=>{
    const {teamName} = req.body;
    const team = await createTeam(teamName);
    res.send(team);
})

// get all teams
app.get('/getteams', async (req: any, res: any) => {
    const teams = await getAllTeams();
    res.send(teams);
})
// get all players of a team
app.get('/getplayers', async (req: any, res: any) => {
    const {teamId} = req.query;
    const players = await getPlayers(teamId);
    res.send(players);  
})

app.post('/createplayer',async (req:any,res:any)=>{
    const {id,name,teamId,jerseyNumber,playerType}=req.body
    const player=createPlayer({id,name,teamId,jerseyNumber,playerType})
    res.send(player)
})

// start the match
app.post('/creatematch', async (req: any, res: any) => {
    const {matchDetails}=req.body
    const match= await startMatch(matchDetails);
    res.send(match);
})
// end match
app.put('/endmatch', async (req: any, res: any) => {
    const {id,matchWinner} = req.body;
    const end = await endMatch(id, matchWinner);
    res.send(end);
})

// update score
app.put('/updatescore', async (req: any, res: any) => {
    const {inningId,updates}=req.body
    const update = await updateScore(inningId, updates);
    res.send(update);
})

// update player when a batsman is dismissed or over is completed
app.post('/updateplayerstat', async (req: any, res: any) => {
    const {id,matchId,updates} = req.query;
    const update = await updatePlayerStat(id,matchId, updates);
    res.send(update);
})

app.get('/getplayerstat',async(req:any,res:any)=>{
    const {id}=req.query
    const player=await getPlayerStat(id)
    res.send(player)
})


// get score of an inning
app.get('/getscore', async (req: any, res: any) => {
    const {matchId} = req.query;
    const score = await getScore(matchId);
    res.send(score);
})

app.get('/getmatchinfo', async (req: any, res: any) => {
    const {matchId} = req.query;
    const match = await getMatchInfo(matchId);
    res.send(match);
})

app.get('/getmatches',async(req:any,res:any)=>{
    const matches= await getMatches();
    res.send(matches)
})

app.get('/getfinishedmatches',async(req:any,res:any)=>{
    const {matchId}=req.query
    const finsihedMatches=await getFinishedMatches(matchId);
    res.send(finsihedMatches)
})

app.get('/getsingleplayerstat',async(req:any,res:any)=>{
    const {id,matchId}=req.query
    const stat=await getSinglePlayerStat(id,matchId)
    res.send(stat);
})

const port = process.env.port || 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
