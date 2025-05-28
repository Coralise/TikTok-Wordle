# TikTok Wordle

A real-time, TikTok chat-powered Wordle game. Viewers submit guesses via TikTok chat, and the game displays the closest guesses and the winner in a Wordle-style interface.

## Features
- Connects to a TikTok live stream and listens for chat messages.
- Only valid words (from `words.json`) are accepted as guesses.
- Displays the 5 most recent guesses and highlights the closest guess.
- Shows a winner card with animation and sound when someone guesses the word.
- Plays a pop sound for each guess and a winner sound when the word is guessed.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/Coralise/TikTok-Wordle.git
   cd TikTok-Wordle
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```
3. Set your TikTok username in `server.ts` (edit the `tiktokUsername` variable).

### Running the Project

#### 1. Start the Socket.IO server
```sh
npx ts-node server.ts
```
Or use the VS Code task: **Start Socket.IO server**

#### 2. Start the Next.js frontend
```sh
npm run dev
```

#### 3. Open the app
Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `app/` - Next.js frontend (UI, Wordle logic, styles)
- `server.ts` - Socket.IO server and TikTok chat integration
- `words.json` - List of valid words
- `public/sounds/` - Sound effects (pop and winner)

## Customization
- Change the TikTok username in `server.ts` to connect to a different stream.
- Add or modify words in `words.json`.
- Replace sound files in `public/sounds/` for custom effects.

## License
MIT
