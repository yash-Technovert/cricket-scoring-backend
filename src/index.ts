import { createUser, login } from './services/AuthenticationService';
import {createTeam, endMatch, getAllTeams, getMatchInfo, getPlayers, getScore, initiateInning, startMatch, updatePlayerStat, updateScore } from './services/MatchService';
import express from 'express';
import { generateMatchId} from './services/HelperService';
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
    const {teamId} = req.body;
    const players = await getPlayers(teamId);
    res.send(players);  
})

// start the match
app.post('/startMatch', async (req: any, res: any) => {
    const {teamOne, teamTwo,tossWinner} = req.body;
    const start= await startMatch(teamOne, teamTwo, tossWinner);
    res.send(start);
})
// end match
app.put('/endmatch', async (req: any, res: any) => {
    const {id, matchWinner} = req.body;
    const end = await endMatch(id, matchWinner);
    res.send(end);
})

// update score
app.put('/updatescore', async (req: any, res: any) => {
    const {inningId, updates} = req.body;
    const update = await updateScore(inningId, updates);
    res.send(update);
})

// update player when a batsman is dismissed or over is completed
app.post('/updateplayer', async (req: any, res: any) => {
    const {id,matchId, updates} = req.body;
    const update = await updatePlayerStat(id,matchId, updates);
    res.send(update);
})

// initiate second inning
app.post('/startsecondinning', async (req: any, res: any) => {
    const {matchId, teamName, isFirstInning} = req.body;
    const start = await initiateInning( matchId, isFirstInning,teamName);
    res.send(start);
})

// get score of an inning
app.get('/getscore', async (req: any, res: any) => {
    const {id, matchId} = req.body;
    console.log(id,matchId)
    const score = await getScore(id,matchId);
    res.send(score);
})

app.get('/getmatchinfo', async (req: any, res: any) => {
    const {id} = req.params.id;
    console.log(id)
    const match = await getMatchInfo(id);
    res.send(match);
})

const port = process.env.port || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});


