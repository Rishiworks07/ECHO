import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Game, 
  Player, 
  Round, 
  PlayerChoice, 
  generateRoomCode, 
  GameStatus,
  Choice,
  TOTAL_ROUNDS
} from "@/lib/gameUtils";
import { getRandomSituation } from "@/lib/situations";
import { useToast } from "@/hooks/use-toast";

export type GamePhase = 
  | "home"
  | "waiting"
  | "situation"
  | "decision"
  | "result"
  | "final";

interface UseGameReturn {
  // State
  game: Game | null;
  players: Player[];
  currentPlayer: Player | null;
  opponentPlayer: Player | null;
  currentRound: Round | null;
  choices: PlayerChoice[];
  phase: GamePhase;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createRoom: (playerName: string) => Promise<void>;
  joinRoom: (roomCode: string, playerName: string) => Promise<void>;
  submitChoice: (choice: Choice, decisionTimeMs: number) => Promise<void>;
  advanceToNextRound: () => Promise<void>;
  resetGame: () => void;
  setPhase: (phase: GamePhase) => void;
}

export function useGame(): UseGameReturn {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [choices, setChoices] = useState<PlayerChoice[]>([]);
  const [phase, setPhase] = useState<GamePhase>("home");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const usedSituationIdsRef = useRef<string[]>([]);
  
  const { toast } = useToast();

  const currentPlayer = players.find((p) => p.id === currentPlayerId) || null;
  const opponentPlayer = players.find((p) => p.id !== currentPlayerId) || null;

  // Subscribe to realtime updates
  useEffect(() => {
    if (!game?.id) return;

    const channel = supabase
      .channel(`game-${game.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `id=eq.${game.id}`,
        },
        (payload) => {
          if (payload.new) {
            const newGame = payload.new as Game;
            setGame(newGame);
            
            if (newGame.status === "finished") {
              setPhase("final");
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `game_id=eq.${game.id}`,
        },
        async () => {
          // Refetch players
          const { data } = await supabase
            .from("players")
            .select("*")
            .eq("game_id", game.id);
          if (data) setPlayers(data as Player[]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "rounds",
          filter: `game_id=eq.${game.id}`,
        },
        (payload) => {
          if (payload.new) {
            const newRound = payload.new as Round;
            setCurrentRound(newRound);
            setChoices([]);
            usedSituationIdsRef.current = [...usedSituationIdsRef.current, newRound.situation_id];
            setPhase("situation");
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "choices",
        },
        async () => {
          // Refetch choices for current round
          if (currentRound) {
            const { data } = await supabase
              .from("choices")
              .select("*")
              .eq("round_id", currentRound.id);
            if (data) {
              setChoices(data as PlayerChoice[]);
              // If both choices are in, show result
              if (data.length === 2) {
                setPhase("result");
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game?.id, currentRound?.id]);

  // Monitor for second player joining
  useEffect(() => {
    if (game && phase === "waiting" && players.length === 2) {
      startGame();
    }
  }, [players.length, game, phase]);

  const startGame = async () => {
    if (!game) return;
    
    // Update game status to active
    await supabase
      .from("games")
      .update({ status: "active" as GameStatus, current_round: 1 })
      .eq("id", game.id);

    // Create first round
    const situation = getRandomSituation([]);
    usedSituationIdsRef.current = [situation.id];
    
    await supabase.from("rounds").insert({
      game_id: game.id,
      round_number: 1,
      situation_id: situation.id,
    });
  };

  const createRoom = async (playerName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const roomCode = generateRoomCode();
      
      // Create game
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .insert({ room_code: roomCode })
        .select()
        .single();
        
      if (gameError) throw gameError;
      
      // Create player
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .insert({ game_id: gameData.id, name: playerName })
        .select()
        .single();
        
      if (playerError) throw playerError;
      
      setGame(gameData as Game);
      setPlayers([playerData as Player]);
      setCurrentPlayerId(playerData.id);
      setPhase("waiting");
      
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create room";
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async (roomCode: string, playerName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const lookupCode = roomCode.trim().toUpperCase();
      console.debug("joinRoom: looking up room code", lookupCode);

      // Find game by room code
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("*")
        .eq("room_code", lookupCode)
        .eq("status", "waiting")
        .maybeSingle();
        
      if (gameError) {
        console.error("joinRoom: error fetching game", gameError);
        throw gameError;
      }
      if (!gameData) {
        console.warn("joinRoom: room not found or already started", lookupCode);
        throw new Error("Room not found or game already started");
      }
      
      // Check player count
      const { data: existingPlayers } = await supabase
        .from("players")
        .select("*")
        .eq("game_id", gameData.id);
        
      if (existingPlayers && existingPlayers.length >= 2) {
        throw new Error("Room is full");
      }
      
      // Create player
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .insert({ game_id: gameData.id, name: playerName })
        .select()
        .single();
        
      if (playerError) throw playerError;
      
      console.debug("joinRoom: joined game", { gameId: gameData.id, playerId: playerData?.id });

      setGame(gameData as Game);
      setPlayers([...(existingPlayers || []), playerData] as Player[]);
      setCurrentPlayerId(playerData.id);
      setPhase("waiting");
      toast({ title: "Joined room", description: `Joined room ${lookupCode}` });

      // Sync current game/round state in case we missed realtime events
      try {
        const { data: freshGame } = await supabase
          .from("games")
          .select("*")
          .eq("id", gameData.id)
          .maybeSingle();

        if (freshGame) {
          setGame(freshGame as Game);
        }

        const { data: latestRound } = await supabase
          .from("rounds")
          .select("*")
          .eq("game_id", gameData.id)
          .order("round_number", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestRound) {
          setCurrentRound(latestRound as Round);

          const { data: roundChoices } = await supabase
            .from("choices")
            .select("*")
            .eq("round_id", latestRound.id);

          if (roundChoices) {
            setChoices(roundChoices as PlayerChoice[]);
            if (roundChoices.length === 2) {
              setPhase("result");
            } else {
              // If there is an active game with a current round, move into situation/decision flow
              setPhase("situation");
            }
          } else {
            setPhase("situation");
          }
        }
      } catch (syncErr) {
        console.warn("joinRoom: failed to sync state", syncErr);
      }
      
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to join room";
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const submitChoice = async (choice: Choice, decisionTimeMs: number) => {
    if (!currentRound || !currentPlayerId) return;
    
    try {
      // Check if already submitted
      const existing = choices.find((c) => c.player_id === currentPlayerId);
      if (existing) return;
      
      await supabase.from("choices").insert({
        round_id: currentRound.id,
        player_id: currentPlayerId,
        choice,
        decision_time_ms: decisionTimeMs,
      });
      
      // Update player stats
      const updateData = choice === "TRUST" 
        ? { trust_count: (currentPlayer?.trust_count || 0) + 1 }
        : { betray_count: (currentPlayer?.betray_count || 0) + 1 };
        
      await supabase
        .from("players")
        .update(updateData)
        .eq("id", currentPlayerId);
        
    } catch (err) {
      toast({ 
        title: "Error", 
        description: "Failed to submit choice", 
        variant: "destructive" 
      });
    }
  };

  const advanceToNextRound = async () => {
    if (!game || !currentRound) return;
    
    const nextRoundNumber = currentRound.round_number + 1;
    
    // Apply scores first
    if (choices.length === 2 && currentPlayer && opponentPlayer) {
      const situation = await import("@/lib/situations").then(m => 
        m.getSituationById(currentRound.situation_id)
      );
      
      if (situation) {
        const myChoice = choices.find(c => c.player_id === currentPlayer.id)?.choice;
        const theirChoice = choices.find(c => c.player_id === opponentPlayer.id)?.choice;
        
        if (myChoice && theirChoice) {
          const [myScore, theirScore] = await import("@/lib/situations").then(m =>
            m.calculateOutcome(situation, myChoice, theirChoice)
          );
          
          // Update both players' scores
          await supabase
            .from("players")
            .update({ score: currentPlayer.score + myScore })
            .eq("id", currentPlayer.id);
            
          await supabase
            .from("players")
            .update({ score: opponentPlayer.score + theirScore })
            .eq("id", opponentPlayer.id);
        }
      }
    }
    
    if (nextRoundNumber > TOTAL_ROUNDS) {
      // Game over
      await supabase
        .from("games")
        .update({ status: "finished" as GameStatus })
        .eq("id", game.id);
      setPhase("final");
      return;
    }
    
    // Create next round
    const situation = getRandomSituation(usedSituationIdsRef.current);
    
    await supabase
      .from("games")
      .update({ current_round: nextRoundNumber })
      .eq("id", game.id);
      
    await supabase.from("rounds").insert({
      game_id: game.id,
      round_number: nextRoundNumber,
      situation_id: situation.id,
    });
  };

  const resetGame = useCallback(() => {
    setGame(null);
    setPlayers([]);
    setCurrentPlayerId(null);
    setCurrentRound(null);
    setChoices([]);
    setPhase("home");
    setError(null);
    usedSituationIdsRef.current = [];
  }, []);

  return {
    game,
    players,
    currentPlayer,
    opponentPlayer,
    currentRound,
    choices,
    phase,
    isLoading,
    error,
    createRoom,
    joinRoom,
    submitChoice,
    advanceToNextRound,
    resetGame,
    setPhase,
  };
}
