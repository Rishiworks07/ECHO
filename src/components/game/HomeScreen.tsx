import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface HomeScreenProps {
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  isLoading: boolean;
}

export function HomeScreen({ onCreateRoom, onJoinRoom, isLoading }: HomeScreenProps) {
  const [mode, setMode] = useState<"select" | "create" | "join">("select");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleSubmit = () => {
    if (!playerName.trim()) return;
    
    if (mode === "create") {
      onCreateRoom(playerName.trim());
    } else if (mode === "join") {
      if (!roomCode.trim()) return;
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="mb-12 text-center animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-bold tracking-wider text-foreground text-glow-white">
          ECHO
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A game of trust and betrayal
        </p>
      </div>

      <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur animate-slide-up">
        <CardContent className="pt-6">
          {mode === "select" && (
            <div className="space-y-4">
              <Button
                onClick={() => setMode("create")}
                className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground glow-trust"
                disabled={isLoading}
              >
                Create Room
              </Button>
              <Button
                onClick={() => setMode("join")}
                variant="outline"
                className="w-full h-14 text-lg border-border hover:bg-secondary"
                disabled={isLoading}
              >
                Join Room
              </Button>
            </div>
          )}

          {mode === "create" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Name
                </label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  maxLength={20}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setMode("select")}
                  className="flex-1 border-border"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground glow-trust"
                  disabled={isLoading || !playerName.trim()}
                >
                  {isLoading ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          )}

          {mode === "join" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Name
                </label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  maxLength={20}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Room Code
                </label>
                <Input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="XXXX"
                  className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground text-center text-2xl tracking-[0.5em] uppercase"
                  maxLength={4}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setMode("select")}
                  className="flex-1 border-border"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground glow-trust"
                  disabled={isLoading || !playerName.trim() || !roomCode.trim()}
                >
                  {isLoading ? "Joining..." : "Join"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
