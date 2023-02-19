import { InningStat } from "./InningStat"

export class MatchStat{
    id: string
    teamOneInningStat: InningStat
    teamTwoInningStat: InningStat
    tossWinner: string
    matchWinner: string
}

export class CreateMatch{
    id: string
    teamOne: string
    teamTwo: string
    tossWinner: string
}