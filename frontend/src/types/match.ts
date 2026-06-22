import { Dispatch, SetStateAction } from "react";
import MatchCard from "../components/MatchCard";

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

// export interface MatchCardProps = {
//   match: Match;
// };

export type Commentary = {
  id: number;
  matchId: number;
  actor: string;
  message: string;
  minute: number;
  period: string;
  eventType: string;
  metaData: {
    assist?: string;
    playerOff?: string;
  };
  team: string;
};
export interface MatchCardProps {
  match: Match;
  setCommentary: Dispatch<SetStateAction<Commentary[]>>;
  isLoading : boolean
}
export type MatchListCommentary = {
  setCommentary: Dispatch<SetStateAction<Commentary[]>>;
  
};
