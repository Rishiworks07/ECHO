import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Situation, calculateOutcome, getEchoReflection } from "@/lib/situations";
import { Player, PlayerChoice, RESULT_DISPLAY_DURATION } from "@/lib/gameUtils";

interface ResultScreenProps {
  situation: Situation;
  roundNumber: number;
  currentPlayer: Player;
  opponentPlayer: Player;
  choices: PlayerChoice[];
  onContinue: () => void;
}

export function ResultScreen({
  situation,
  roundNumber,
  currentPlayer,
  opponentPlayer,
  choices,
  onContinue,
}: ResultScreenProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  const myChoice = choices.find((c) => c.player_id === currentPlayer.id);
  const theirChoice = choices.find((c) => c.player_id === opponentPlayer.id);

  const myChoiceValue = myChoice?.choice || "TRUST";
  const theirChoiceValue = theirChoice?.choice || "TRUST";

  const [myScore, theirScore] = calculateOutcome(
    situation,
    myChoiceValue,
    theirChoiceValue
  );

  const reflection = getEchoReflection(
    myChoiceValue,
    theirChoiceValue,
    myScore,
    theirScore
  );

  useEffect(() => {
    // Staggered reveal animation
    const revealTimer = setTimeout(() => setIsRevealed(true), 300);
    const scoreTimer = setTimeout(() => setShowScores(true), 1000);
    const reflectionTimer = setTimeout(() => setShowReflection(true), 1800);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(scoreTimer);
      clearTimeout(reflectionTimer);
    };
  }, []);

  const formatScore = (score: number) => {
    if (score > 0) return `+${score}`;
    return score.toString();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center mb-8 animate-fade-in">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Round {roundNumber} Result
        </span>
      </div>

      {/* Choices reveal */}
      <div className="flex gap-8 md:gap-16 mb-12">
        {/* Your choice */}
        <div
          className={`text-center transition-all duration-500 ${
            isRevealed ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        >
          <p className="text-sm text-muted-foreground mb-2">You</p>
          <div
            className={`text-3xl md:text-4xl font-bold ${
              myChoiceValue === "TRUST"
                ? "text-trust text-glow-trust"
                : "text-betray text-glow-betray"
            }`}
          >
            {myChoiceValue}
          </div>
          <div
            className={`mt-3 text-2xl font-bold transition-all duration-500 ${
              showScores ? "opacity-100" : "opacity-0"
            } ${myScore >= 0 ? "text-trust" : "text-betray"}`}
          >
            {formatScore(myScore)}
          </div>
        </div>

        <div className="text-4xl text-muted-foreground self-center">vs</div>

        {/* Opponent choice */}
        <div
          className={`text-center transition-all duration-500 delay-150 ${
            isRevealed ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        >
          <p className="text-sm text-muted-foreground mb-2">{opponentPlayer.name}</p>
          <div
            className={`text-3xl md:text-4xl font-bold ${
              theirChoiceValue === "TRUST"
                ? "text-trust text-glow-trust"
                : "text-betray text-glow-betray"
            }`}
          >
            {theirChoiceValue}
          </div>
          <div
            className={`mt-3 text-2xl font-bold transition-all duration-500 ${
              showScores ? "opacity-100" : "opacity-0"
            } ${theirScore >= 0 ? "text-trust" : "text-betray"}`}
          >
            {formatScore(theirScore)}
          </div>
        </div>
      </div>

      {/* Echo Reflection */}
      <div
        className={`text-center mb-12 max-w-md transition-all duration-500 ${
          showReflection ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <p className="text-lg md:text-xl text-muted-foreground italic">
          "{reflection}"
        </p>
      </div>

      {/* Current Scores */}
      <div
        className={`text-center mb-8 transition-all duration-500 ${
          showScores ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-sm text-muted-foreground mb-2">Current Scores</p>
        <div className="flex gap-8">
          <div>
            <span className="text-foreground font-medium">You:</span>{" "}
            <span className="text-primary font-bold">{currentPlayer.score + myScore}</span>
          </div>
          <div>
            <span className="text-foreground font-medium">{opponentPlayer.name}:</span>{" "}
            <span className="text-primary font-bold">{opponentPlayer.score + theirScore}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={onContinue}
        className={`bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg transition-all duration-500 ${
          showReflection ? "opacity-100" : "opacity-0"
        }`}
      >
        {roundNumber >= 5 ? "See Final Results" : "Next Round"}
      </Button>
    </div>
  );
}
