export class InningStat{
    teamName: string
    runsScored: number
    wickets: number
    oversPlayed: number
    isFirstInning: boolean
    extras: Extras
}

export class InningStatResponse{
    id: string
    teamName: string
    runsScored: number
    wickets: number
    oversPlayed: number
    isFirstInning: boolean
    extras: Extras
    matchId:string
    four: number
    six: number
}

class Extras{
    wide: number
    noBall: number
    bye: number
    legBye: number
}