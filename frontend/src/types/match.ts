export type Match = {
  id: number;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  homeScore: number;
  awayScore: number;
  startTime: string;
};

export type MatchCardProps = {
  match: Match;
};
