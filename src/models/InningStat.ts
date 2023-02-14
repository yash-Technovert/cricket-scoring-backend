export class InningStat{
    teamName: string
    runsScored: number
    wicketsTaken: number
    oversPlayed: number
    isFirstInning: boolean
    extras: Extras
}

class Extras{
    wide: number
    noBall: number
    bye: number
    legBye: number
}