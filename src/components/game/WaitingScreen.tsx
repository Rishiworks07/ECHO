import { Card, CardContent } from "@/components/ui/card";

interface WaitingScreenProps {
  roomCode: string;
  playerName: string;
}

export function WaitingScreen({ roomCode, playerName }: WaitingScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl font-medium text-muted-foreground mb-2">
          Welcome, {playerName}
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Share this code with your opponent
        </p>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur animate-scale-in">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
              Room Code
            </p>
            <div className="text-6xl md:text-7xl font-bold tracking-[0.3em] text-primary text-glow-trust">
              {roomCode}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-12 flex flex-col items-center animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse-glow" />
          <p className="text-lg text-muted-foreground">
            Waiting for opponent to join...
          </p>
        </div>
      </div>
    </div>
  );
}
