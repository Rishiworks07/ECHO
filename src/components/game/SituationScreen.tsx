import { useEffect, useState, useRef } from "react";
import { Situation } from "@/lib/situations";
import { SITUATION_REVEAL_DURATION } from "@/lib/gameUtils";

interface SituationScreenProps {
  situation: Situation;
  roundNumber: number;
  onComplete: () => void;
}

export function SituationScreen({ 
  situation, 
  roundNumber, 
  onComplete 
}: SituationScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    hasCompletedRef.current = false;
    setIsVisible(false);
    
    // Fade in
    const fadeInTimer = setTimeout(() => setIsVisible(true), 500);
    
    // Auto-advance after duration
    const advanceTimer = setTimeout(() => {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onComplete();
      }
    }, SITUATION_REVEAL_DURATION);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(advanceTimer);
    };
  }, [situation.id, roundNumber]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div 
        className={`text-center max-w-2xl transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="mb-6">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Round {roundNumber} of 5
          </span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          {situation.title}
        </h2>
        
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
          {situation.text}
        </p>
      </div>
    </div>
  );
}
