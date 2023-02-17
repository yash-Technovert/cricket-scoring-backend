import { createUser } from './services/AuthenticationService';
import {endMatch, getScore, initiateInning, startMatch, updateScore } from './services/MatchService';
import express from 'express';
import { generateMatchId } from './services/HelperService';
const app = express();

app.use(express.json());

console.log(generateMatchId('India', 'Australia'))

app.get('/', (req: any, res: any,next:any) => {
    res.send('Hello World');
});

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
    console.log(inningId, updates)
    const update = await updateScore(inningId, updates);
    res.send(update);
})
// initiate second inning
app.post('/startsecondinning', async (req: any, res: any) => {
    const {id, teamName, isFirstInning} = req.body;
    const start = await initiateInning(id, isFirstInning,teamName);
    console.log(id, teamName, isFirstInning)
    res.send(start);
})

app.get('/getscore', async (req: any, res: any) => {
    const {id} = req.body;
    const score = await getScore(id);
    res.send(score);
})

const port = process.env.port || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

