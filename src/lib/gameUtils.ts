export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export type GameStatus = "waiting" | "active" | "finished";
export type Choice = "TRUST" | "BETRAY";
export type Archetype = "Betray Beast" | "Trusted Fool";

export interface Player {
  id: string;
  game_id: string;
  name: string;
  score: number;
  trust_count: number;
  betray_count: number;
}

export interface Game {
  id: string;
  room_code: string;
  status: GameStatus;
  current_round: number;
}

export interface Round {
  id: string;
  game_id: string;
  round_number: number;
  situation_id: string;
}

export interface PlayerChoice {
  id: string;
  round_id: string;
  player_id: string;
  choice: Choice;
  decision_time_ms: number;
}

export function getArchetype(player: Player): Archetype {
  return player.betray_count > player.trust_count ? "Betray Beast" : "Trusted Fool";
}

export function determineWhoPaysTreat(
  winner: Player,
  loser: Player
): { payer: Player; reason: string } {
  const winnerArchetype = getArchetype(winner);
  
  if (winnerArchetype === "Betray Beast") {
    return {
      payer: winner,
      reason: "Winner is a Betray Beast. Karma demands the winner pays!",
    };
  } else {
    return {
      payer: loser,
      reason: "Winner is a Trusted Fool. Their trust is rewarded—loser pays!",
    };
  }
}

export function getRandomChoice(): Choice {
  return Math.random() < 0.5 ? "TRUST" : "BETRAY";
}

export const TIMER_DURATION = 15; // seconds
export const TOTAL_ROUNDS = 5;
export const SITUATION_REVEAL_DURATION = 7000; // ms
export const RESULT_DISPLAY_DURATION = 4000; // ms
