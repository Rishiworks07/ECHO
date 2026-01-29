import { useGame } from "@/hooks/useGame";
import { HomeScreen } from "@/components/game/HomeScreen";
import { WaitingScreen } from "@/components/game/WaitingScreen";
import { SituationScreen } from "@/components/game/SituationScreen";
import { DecisionScreen } from "@/components/game/DecisionScreen";
import { ResultScreen } from "@/components/game/ResultScreen";
import { FinalScreen } from "@/components/game/FinalScreen";
import { getSituationById } from "@/lib/situations";

const Index = () => {
  const {
    game,
    currentPlayer,
    opponentPlayer,
    currentRound,
    choices,
    phase,
    isLoading,
    createRoom,
    joinRoom,
    submitChoice,
    advanceToNextRound,
    resetGame,
    setPhase,
  } = useGame();

  // Get current situation
  const situation = currentRound 
    ? getSituationById(currentRound.situation_id) 
    : null;

  // Track if current player has submitted
  const hasSubmitted = choices.some(
    (c) => c.player_id === currentPlayer?.id
  );

  // Handle transition from situation to decision phase
  const handleSituationComplete = () => {
    setPhase("decision");
  };

  // Render based on phase
  const renderPhase = () => {
    switch (phase) {
      case "home":
        return (
          <HomeScreen
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            isLoading={isLoading}
          />
        );

      case "waiting":
        return game && currentPlayer ? (
          <WaitingScreen
            roomCode={game.room_code}
            playerName={currentPlayer.name}
          />
        ) : null;

      case "situation":
        return situation && currentRound ? (
          <SituationScreen
            situation={situation}
            roundNumber={currentRound.round_number}
            onComplete={handleSituationComplete}
          />
        ) : null;

      case "decision":
        return situation && currentRound ? (
          <DecisionScreen
            situation={situation}
            roundNumber={currentRound.round_number}
            hasSubmitted={hasSubmitted}
            onSubmit={submitChoice}
          />
        ) : null;

      case "result":
        return situation && currentRound && currentPlayer && opponentPlayer ? (
          <ResultScreen
            situation={situation}
            roundNumber={currentRound.round_number}
            currentPlayer={currentPlayer}
            opponentPlayer={opponentPlayer}
            choices={choices}
            onContinue={advanceToNextRound}
          />
        ) : null;

      case "final":
        return currentPlayer && opponentPlayer ? (
          <FinalScreen
            currentPlayer={currentPlayer}
            opponentPlayer={opponentPlayer}
            onPlayAgain={resetGame}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderPhase()}
    </div>
  );
};

export default Index;
