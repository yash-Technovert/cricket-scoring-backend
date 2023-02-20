import { v1 as uuid } from 'uuid'
export { generateInningId, generateMatchId, generateUserId }

function generateMatchId(teamOne: string, teamTwo: string)
{
    let date = new Date();
    let matchId = `${teamOne.toLocaleUpperCase()}v${teamTwo.toLocaleUpperCase()}:${date.toLocaleString().split(',')[0]}`
    return matchId;
}

function generateInningId(matchId: string, isFirstInning: boolean)
{
    return `${matchId}:I${isFirstInning ? '1' : '2'}`
}


export function generatePlayerId()
{
    return uuid().toString();
}

export function generateTeamId()
{

    return uuid().toString()
}

function generateUserId()
{
    return uuid().toString();
}