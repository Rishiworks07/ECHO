import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Situation } from "@/lib/situations";
import { Choice, TIMER_DURATION, getRandomChoice } from "@/lib/gameUtils";

interface DecisionScreenProps {
  situation: Situation;
  roundNumber: number;
  hasSubmitted: boolean;
  onSubmit: (choice: Choice, decisionTimeMs: number) => void;
}

export function DecisionScreen({
  situation,
  roundNumber,
  hasSubmitted,
  onSubmit,
}: DecisionScreenProps) {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const startTimeRef = useRef(Date.now());

  const handleChoice = useCallback(
    (choice: Choice) => {
      if (hasSubmitted || selectedChoice) return;
      
      const decisionTimeMs = Date.now() - startTimeRef.current;
      setSelectedChoice(choice);
      onSubmit(choice, decisionTimeMs);
    },
    [hasSubmitted, selectedChoice, onSubmit]
  );

  // Timer countdown
  useEffect(() => {
    if (hasSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - submit random choice
          const randomChoice = getRandomChoice();
          handleChoice(randomChoice);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasSubmitted, handleChoice]);

  const timerColor = timeLeft <= 5 ? "text-accent" : "text-foreground";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center mb-8 animate-fade-in">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Round {roundNumber} of 5
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-2">
          {situation.title}
        </h2>
      </div>

      {/* Timer */}
      <div className={`text-6xl md:text-7xl font-bold mb-12 ${timerColor} transition-colors`}>
        {timeLeft}
      </div>

      {hasSubmitted ? (
        <div className="text-center animate-fade-in">
          <div className="flex items-center gap-3 justify-center">
            <div className="h-3 w-3 rounded-full bg-primary animate-pulse-glow" />
            <p className="text-xl text-muted-foreground">
              Waiting for opponent...
            </p>
          </div>
          <p className="mt-4 text-lg">
            You chose:{" "}
            <span
              className={`font-bold ${
                selectedChoice === "TRUST" ? "text-trust text-glow-trust" : "text-betray text-glow-betray"
              }`}
            >
              {selectedChoice}
            </span>
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg animate-slide-up">
          <Button
            onClick={() => handleChoice("TRUST")}
            className="flex-1 h-20 text-2xl font-bold bg-trust hover:bg-trust/90 text-primary-foreground glow-trust transition-all hover:scale-105"
            disabled={hasSubmitted}
          >
            TRUST
          </Button>
          <Button
            onClick={() => handleChoice("BETRAY")}
            className="flex-1 h-20 text-2xl font-bold bg-betray hover:bg-betray/90 text-accent-foreground glow-betray transition-all hover:scale-105"
            disabled={hasSubmitted}
          >
            BETRAY
          </Button>
        </div>
      )}
    </div>
  );
}
