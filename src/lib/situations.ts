export interface Situation {
  id: string;
  title: string;
  text: string;
  outcomes: {
    TT: [number, number]; // Both Trust
    TB: [number, number]; // Player 1 Trust, Player 2 Betray
    BT: [number, number]; // Player 1 Betray, Player 2 Trust
    BB: [number, number]; // Both Betray
  };
}

export const situations: Situation[] = [
  {
    id: "S1",
    title: "The Project Credit",
    text: "You and the other player worked together on a project. Only one person can take full credit for the success.",
    outcomes: {
      TT: [3, 3],   // Share credit fairly
      TB: [-2, 5],  // You trust, they take all credit
      BT: [5, -2],  // You take all credit, they trusted
      BB: [-1, -1], // Both try to claim, looks bad
    },
  },
  {
    id: "S2",
    title: "The Last Slice",
    text: "There's one slice of pizza left. You can either split it fairly or try to take the whole thing.",
    outcomes: {
      TT: [2, 2],   // Split it fairly
      TB: [-1, 4],  // You offer to split, they take it
      BT: [4, -1],  // You take it, they offered to split
      BB: [0, 0],   // Both grab, it falls on the floor
    },
  },
  {
    id: "S3",
    title: "The Secret",
    text: "You both know each other's embarrassing secret. You can keep it safe or expose it to others.",
    outcomes: {
      TT: [4, 4],   // Both keep secrets, trust builds
      TB: [-3, 3],  // You keep theirs, they expose yours
      BT: [3, -3],  // You expose theirs, they kept yours
      BB: [-2, -2], // Mutual destruction
    },
  },
  {
    id: "S4",
    title: "The Lifeboat",
    text: "Resources are limited on the lifeboat. You can share supplies equally or hoard them for yourself.",
    outcomes: {
      TT: [3, 3],   // Both share, both survive well
      TB: [-2, 5],  // You share, they hoard
      BT: [5, -2],  // You hoard, they share
      BB: [1, 1],   // Both hoard, conflict but survival
    },
  },
  {
    id: "S5",
    title: "The Alibi",
    text: "You both need an alibi for last night. You can cover for each other or tell the truth about where you really were.",
    outcomes: {
      TT: [4, 4],   // Both cover, both protected
      TB: [-3, 2],  // You cover, they expose you
      BT: [2, -3],  // You expose, they covered for you
      BB: [-1, -1], // Both exposed, both look suspicious
    },
  },
];

export function getRandomSituation(excludeIds: string[] = []): Situation {
  const available = situations.filter((s) => !excludeIds.includes(s.id));
  if (available.length === 0) {
    return situations[Math.floor(Math.random() * situations.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

export function getSituationById(id: string): Situation | undefined {
  return situations.find((s) => s.id === id);
}

export function calculateOutcome(
  situation: Situation,
  player1Choice: "TRUST" | "BETRAY",
  player2Choice: "TRUST" | "BETRAY"
): [number, number] {
  const key =
    (player1Choice === "TRUST" ? "T" : "B") +
    (player2Choice === "TRUST" ? "T" : "B");
  return situation.outcomes[key as keyof typeof situation.outcomes];
}

export function getEchoReflection(
  player1Choice: "TRUST" | "BETRAY",
  player2Choice: "TRUST" | "BETRAY",
  player1Score: number,
  player2Score: number
): string {
  const reflections = {
    TT: [
      "Both chose the path of trust.",
      "They mirrored your cooperation.",
      "Mutual trust. A rare moment.",
    ],
    TB: [
      "You trusted. They didn't.",
      "Your trust was not returned.",
      "They chose self-interest over your faith.",
    ],
    BT: [
      "They trusted you. You didn't reciprocate.",
      "Their trust met your betrayal.",
      "You chose gain over their faith in you.",
    ],
    BB: [
      "Neither trusted the other.",
      "Mutual suspicion. Both chose self-preservation.",
      "Two betrayals cancel out.",
    ],
  };

  const key =
    (player1Choice === "TRUST" ? "T" : "B") +
    (player2Choice === "TRUST" ? "T" : "B");
  const options = reflections[key as keyof typeof reflections];
  return options[Math.floor(Math.random() * options.length)];
}
