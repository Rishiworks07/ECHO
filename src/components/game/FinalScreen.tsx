import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Player, getArchetype, determineWhoPaysTreat } from "@/lib/gameUtils";

interface FinalScreenProps {
  currentPlayer: Player;
  opponentPlayer: Player;
  onPlayAgain: () => void;
}

export function FinalScreen({
  currentPlayer,
  opponentPlayer,
  onPlayAgain,
}: FinalScreenProps) {
  const myArchetype = getArchetype(currentPlayer);
  const theirArchetype = getArchetype(opponentPlayer);

  const isTie = currentPlayer.score === opponentPlayer.score;
  const iWon = currentPlayer.score > opponentPlayer.score;
  const winner = isTie ? null : iWon ? currentPlayer : opponentPlayer;
  const loser = isTie ? null : iWon ? opponentPlayer : currentPlayer;

  const treatResult = winner && loser 
    ? determineWhoPaysTreat(winner, loser) 
    : null;

  const isPayingTreat = treatResult?.payer.id === currentPlayer.id;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground text-glow-white mb-4">
          FINAL JUDGMENT
        </h1>
      </div>

      {/* Winner announcement */}
      <div className="text-center mb-8 animate-slide-up">
        {isTie ? (
          <div className="text-2xl md:text-3xl text-muted-foreground">
            It's a tie!
          </div>
        ) : (
          <div className="text-2xl md:text-3xl">
            <span className={iWon ? "text-trust text-glow-trust" : "text-betray text-glow-betray"}>
              {iWon ? "You Win!" : `${opponentPlayer.name} Wins!`}
            </span>
          </div>
        )}
      </div>

      {/* Player cards */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 w-full max-w-2xl">
        {/* Your card */}
        <Card className={`flex-1 border-2 ${
          iWon ? "border-trust glow-trust" : isTie ? "border-border" : "border-border"
        } bg-card/50 backdrop-blur animate-scale-in`}>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">You</p>
            <h3 className="text-xl font-bold text-foreground mb-3">{currentPlayer.name}</h3>
            
            <div className="text-4xl font-bold text-primary mb-3">
              {currentPlayer.score}
            </div>
            
            <div className={`text-lg font-medium ${
              myArchetype === "Betray Beast" ? "text-betray" : "text-trust"
            }`}>
              {myArchetype}
            </div>
            
            <div className="mt-3 text-sm text-muted-foreground">
              {currentPlayer.trust_count} trusts • {currentPlayer.betray_count} betrays
            </div>
          </CardContent>
        </Card>

        {/* Opponent card */}
        <Card className={`flex-1 border-2 ${
          !iWon && !isTie ? "border-trust glow-trust" : "border-border"
        } bg-card/50 backdrop-blur animate-scale-in`}>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Opponent</p>
            <h3 className="text-xl font-bold text-foreground mb-3">{opponentPlayer.name}</h3>
            
            <div className="text-4xl font-bold text-primary mb-3">
              {opponentPlayer.score}
            </div>
            
            <div className={`text-lg font-medium ${
              theirArchetype === "Betray Beast" ? "text-betray" : "text-trust"
            }`}>
              {theirArchetype}
            </div>
            
            <div className="mt-3 text-sm text-muted-foreground">
              {opponentPlayer.trust_count} trusts • {opponentPlayer.betray_count} betrays
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treat Rule Result */}
      {treatResult && (
        <Card className={`w-full max-w-2xl border-2 ${
          isPayingTreat ? "border-betray" : "border-trust"
        } bg-card/50 backdrop-blur mb-8 animate-slide-up`}>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              🍕 The Treat Rule 🍕
            </p>
            <div className={`text-2xl md:text-3xl font-bold mb-3 ${
              isPayingTreat ? "text-betray text-glow-betray" : "text-trust text-glow-trust"
            }`}>
              {isPayingTreat ? "You owe the treat!" : `${opponentPlayer.name} owes the treat!`}
            </div>
            <p className="text-muted-foreground">
              {treatResult.reason}
            </p>
          </CardContent>
        </Card>
      )}

      {isTie && (
        <Card className="w-full max-w-2xl border-2 border-border bg-card/50 backdrop-blur mb-8 animate-slide-up">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              🍕 The Treat Rule 🍕
            </p>
            <div className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
              It's a draw - split the bill!
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={onPlayAgain}
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg glow-trust"
      >
        Play Again
      </Button>
    </div>
  );
}
