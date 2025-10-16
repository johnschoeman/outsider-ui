# Outsdier User Stories

## Landing Page

1. As a user I can visit the root url and see a landing page.

2. On the landing page I see a form that allows me to enter my name, my name is persisted to local storage so next time i open the page it remembers it.

3. On the landing page I see a button that allows me to create a new game lobby.

4. On the landing page I see a form that I can enterI can either start a new game lobby or enter a game lobby, if I have a lobby id.

### Creating a new game lobby

1. If I Click 'New Game' start a new game a new game lobby with a unique game lobby id is created and I immediate enter the lobby.

### Joining an exisitng game lobby

1. If I have a valid Game Lobby Id, I can enter the lobby id into the 'Join Lobby' Form and enter the game lobby.

## Game Page

1. There can be 0 to 8 people in the lobby.

2. The Game Lobby Id is shown.

3. There is a list of all the players in the lobby shown.

4. There is a button that says 'Leave Lobby', when pressed the user is taken back to the Landing Page.

5. There are 2 main states: GamePending or GameInProgress

### GamePending

1. If the state is GamePending any user in the lobby can press a 'Start Game' button, which startes the game

## GameInProgress

1. A started Game has 6 phases
  - Role Assignment
  - Secret Word Creation
  - Share Secret word with Outsider
  - Player Guessing Phase
  - Vote for Outsider
  - Share Results

### Phase 1: Role Assignment

1. When the game startes everyone in the lobby is randomly assigned a role
  - 1 person is the Master
  - 1 person is the Outsider
  - everyone else is a Commoner

2. Show this role to the user
  - show a note to the master that they should share their role and select a secret word.
  - show a note to commoners and the outsider that they should keep their role a secret.

### Phase 2: Word Creation

1. They player assigned the Master role should have a form where they can enter the Secret Word

2. When the Master enters the word, they can press a button to send the secret word to the outsider.

### Phase 3: Share Secret Word with the Outsider

1. Start a 30 second timer.
2. Share the secret word with the outsider.
3. After the 1 minute timer the game starts.

### Phase 4: Player Guessing Phase

1. A 5 minute timer starts.
2. at the end of the 5 minutes show a 'Guessing Time Over' message
3. for just the master, have a button that says 'Word Guessed - Enter Voting'
4. for just the master, have a button that says 'Word Not Guessed'

### Phase 5: Voting

1. Start a 5 minute timer.
2. Each player, including the outsider has sees the list of all players and they can select.
3. Until all players have voted the player can change thier vote.
4. Once all players have voted, end the game and share the results of the vote

### Phase 6: Share Results.

1. If the outsider recieved the majority of votes, the Master and the Commoners win.
2. If the outsider did not receive the majority of votes then the outsider wins.
3. Share these results to all players.
4. After 60 seconds place the overall Game state back to GamePending.


## User Story Todo

- Show game rules and player instructions.

# Technical Requirements

Frontend: Web based ui using formkit and tailwindcss.
Backend: Rust based web server. 
Data Layer: Restful HTTP endpoints for game creation, websockets for gameplay
