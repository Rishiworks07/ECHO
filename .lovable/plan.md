

# ECHO - 2-Player Trust Game

A real-time psychological web game where two players face situational dilemmas, choosing to TRUST or BETRAY each other across 5 rounds.

---

## Phase 1: Foundation & Database Setup

### Database Schema
Set up Supabase with four tables:
- **games** - stores room code, status (waiting/active/finished), current round
- **players** - tracks name, score, trust_count, betray_count per player
- **rounds** - links to game and stores which situation is active
- **choices** - records each player's decision and decision time

### Core Configuration
- Enable Supabase Realtime for games, players, and choices tables
- Set up Row Level Security policies for public access (no auth required)

---

## Phase 2: Room System

### Home Screen
- Clean landing with "ECHO" title and neon accent styling
- Two options: "Create Room" or "Join Room"
- Player enters their name

### Room Creation Flow
- Generate unique 4-character room code
- Create game in "waiting" status
- Show waiting screen with room code displayed prominently

### Join Room Flow
- Enter room code and player name
- Validate room exists and has only one player
- Auto-start game when second player joins

---

## Phase 3: Game Loop

### Situation Reveal Screen
- Display the scenario text in large, centered typography
- Brief pause for both players to read (3 seconds)
- Smooth transition to decision phase

### Decision Phase
- Two prominent buttons: **TRUST** (cyan glow) and **BETRAY** (red glow)
- 15-second countdown timer displayed
- Record decision time in milliseconds
- Show "Waiting for other player..." after choosing
- If timer expires: random choice assigned

### Resolution Screen
- Reveal both choices simultaneously with visual effect
- Show score changes for this round
- Display cumulative scores

### Echo Reflection
- Neutral system observation about the round
- Examples: "They trusted when betrayal paid more" or "Both chose self-preservation"
- Brief pause before next round

---

## Phase 4: Situations (5 Rounds)

Sample scenarios with unique payoff matrices:

1. **The Project Credit** - Only one can take full credit for shared work
2. **The Last Slice** - Split the last piece or take it all
3. **The Secret** - Keep each other's secret or expose it
4. **The Lifeboat** - Limited supplies, share or hoard
5. **The Alibi** - Cover for each other or tell the truth

Each has balanced outcomes where trust can win or backfire.

---

## Phase 5: Final Judgment

### Score Calculation
- Tally total scores across all 5 rounds
- Determine winner (higher score)

### Archetype Assignment
- **Betray Beast**: More betrays than trusts
- **Trusted Fool**: More trusts than betrays (or equal)

### 🍕 The Treat Rule
- If winner is a Betray Beast → **Winner buys the treat** (karma!)
- If winner is a Trusted Fool → **Loser buys the treat** (reward for trust)

### Final Screen
- Display winner, archetypes for both players
- Clear statement of who owes the treat
- "Play Again" button to return home

---

## Phase 6: Real-time Synchronization

### Supabase Realtime Channels
- **Player presence**: Detect when both players are in room
- **Choice sync**: Know when both players have submitted
- **Round progression**: Advance game state together
- **Result broadcast**: Show outcomes simultaneously

### State Management
- Game state is authoritative in database
- React hooks subscribe to real-time changes
- Optimistic UI updates with server reconciliation

---

## Visual Design

### Theme: Neon Accent Dark
- Deep charcoal background (#0a0a0a)
- White/light gray text for readability
- **TRUST button**: Cyan glow effect (#00ffff)
- **BETRAY button**: Red glow effect (#ff3366)
- Subtle transitions between screens
- Mobile-first responsive layout

### Typography
- Large, bold situation text
- Clear countdown timer
- Minimal interface elements

---

## Screens Summary

1. **Home** - Name entry, create/join room
2. **Waiting Room** - Display room code, waiting for opponent
3. **Situation Reveal** - Show scenario text
4. **Decision** - TRUST/BETRAY buttons with timer
5. **Round Result** - Choices revealed, scores, echo message
6. **Final Judgment** - Winner, archetypes, treat rule verdict

