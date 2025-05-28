'use client'
import { useEffect, useState, useRef } from "react";
import { WordleTilesRow } from "./WordleTilesRow";
import io, { Socket } from "socket.io-client";
import { WebcastChatMessage } from "tiktok-live-connector";

export default function Home() {

  const [currentWord, setCurrentWord] = useState<string>();
  const [submittedWords, setSubmittedWords] = useState<WebcastChatMessage[]>([]);
  const [closestWord, setClosestWord] = useState<[WebcastChatMessage, number]>();

  const [socket, setSocket] = useState<typeof Socket>();
  const socketRef = useRef<typeof Socket | undefined>(undefined);
  const currentWordRef = useRef<string | undefined>(undefined);
  const winnerRef = useRef<WebcastChatMessage | undefined>(undefined);

  const [winner, setWinner] = useState<WebcastChatMessage>();

  useEffect(() => {
    const serverSocket: typeof Socket = io("http://localhost:3000");
    setSocket(serverSocket);
    socketRef.current = serverSocket;

    serverSocket.on('wordSubmission', (msg: WebcastChatMessage) => {
      submitWord(msg);
    });

    restartGame(serverSocket);

  }, []);

  useEffect(() => {

  }, [winner]);

  useEffect(() => {
    currentWordRef.current = currentWord;
  }, [currentWord]);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    winnerRef.current = winner;
  }, [winner]);

  const tallyWordScore = (word: string) => {
    if (!currentWordRef.current) return -1;

    let score = 0;
    const usedIndices: Set<number> = new Set();

    for (let i = 0; i < word.length; i++) {
      if (currentWordRef.current[i] === word[i]) {
        score += 2;
        usedIndices.add(i);
      }
    }

    for (let i = 0; i < word.length; i++) {
      if (currentWordRef.current[i] !== word[i]) {
        for (let j = 0; j < currentWordRef.current.length; j++) {
          if (!usedIndices.has(j) && currentWordRef.current[j] === word[i]) {
            score += 1;
            usedIndices.add(j);
            break;
          }
        }
      }
    }

    return score;
  };
  
  const playWinnerSound = () => {
    const audio = new Audio('sounds/winner.mp3');
    audio.play();
  }

  const winGame = (chat: WebcastChatMessage) => {
    console.log("Winning game with chat:", chat);

    playWinnerSound();
    setWinner(chat);

    setTimeout(() => {
      setWinner(undefined);

      resetGameState();
      restartGame();
    }, 10000);

  }

  const playPopSound = () => {
    const audio = new Audio('sounds/pop.mp3');
    audio.play();
  }

  const submitWord = (chat: WebcastChatMessage) => {
    if (winnerRef.current) return;

    playPopSound();

    if (chat.comment.toLowerCase() === currentWordRef.current?.toLowerCase()) {
      winGame(chat);
      return;
    }

    setSubmittedWords(prev => {
      const updated = [...prev, chat];
      return updated.length > 5 ? updated.slice(updated.length - 5) : updated;
    });

    setClosestWord(prevClosest => {
      const currentScore = tallyWordScore(chat.comment);
      if (prevClosest)
        console.log("Current closest word and score:", [chat, currentScore]);
      if (!prevClosest || currentScore > prevClosest[1]) {
        console.log("New closest word:", [chat, currentScore]);
        return [chat, currentScore];
      }
      return prevClosest;
    });
  };

  const restartGame = (serverSocket?: typeof Socket) => {
    if (socketRef.current) serverSocket = socketRef.current;
    console.log("Restarting game and requesting a new word...");
    serverSocket!.emit("randomWord", (word: string) => {
      setCurrentWord(word);
      console.log(`New word set: ${word}`);
    });
  }

  const determineStatuses = (guess: string, word: string): ("correct" | "present" | "absent")[] => {
    const wordArr = word.split("");
    const guessArr = guess.split("");
    const statuses: ("correct" | "present" | "absent")[] = Array(guessArr.length).fill("absent");
    const matched: boolean[] = Array(wordArr.length).fill(false);

    for (let i = 0; i < guessArr.length; i++) {
      if (guessArr[i] === wordArr[i]) {
        statuses[i] = "correct";
        matched[i] = true;
      }
    }

    for (let i = 0; i < guessArr.length; i++) {
      if (statuses[i] === "correct") continue;
      const letter = guessArr[i];
      const presentIdx = wordArr.findIndex((w, j) => w === letter && !matched[j]);
      if (presentIdx !== -1) {
        statuses[i] = "present";
        matched[presentIdx] = true;
      }
    }

    return statuses;
  };

  return (
    <main className="items-center justify-center flex h-screen p-8">
      {winner && (
        <div
          id="win-card"
          className="absolute w-full h-full flex items-center justify-center z-50 bg-white/50 backdrop-blur-md animate-fadeInOpacity"
        >
          <div
            className={
              `w-2/3 h-1/2 flex flex-col items-center justify-center
              transition-all duration-500
              ${winner ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
              animate-[fadeInPopIn_0.5s_ease]`
            }
            style={{
              animation: 'fadeInPopIn 0.5s cubic-bezier(0.4,0,0.2,1)'
            }}
          >
            <img
              src={winner?.user?.profilePicture?.url[0]}
              alt={winner?.user?.profilePicture?.url[0]}
              className="w-48 aspect-square rounded-full"
            />
            <span className="text-4xl font-bold mt-4 fattern">{winner?.user?.nickname} (@{winner?.user?.uniqueId})</span>
            <span className="text-4xl font-bold mt-4 fattern">wins!</span>
            <span className="text-4xl mt-4 fattern">The word was <span className="text-green-700">{currentWord}</span></span>
          </div>
        </div>
      )}
      <div className="h-full aspect-[9/16] flex flex-col">

        <img src="logo.png" alt="TikTok Wordle Logo" className="w-84 self-center mt-8" />

        <div className="mt-24 flex flex-col items-center">
          <span className="text-3xl fattern">Closest Guess</span>
          <WordleTilesRow
            tiles={
              closestWord && closestWord[0].comment
                ? closestWord[0].comment.split("").map((letter, idx) => ({
                    letter,
                    status: determineStatuses(closestWord[0].comment, currentWord!)[idx]
                  }))
                : Array(currentWord?.length || 5).fill({ letter: "", status: "none" })
            }
            chat={closestWord ? closestWord[0] : undefined}
          />
        </div>
        <div className="w-full mt-12 h-[42rem] flex flex-col gap-2 justify-end items-center">
          {Array.from({ length: 5 }).map((_, idx) => {
            const chat = submittedWords[idx];
            return (
              <WordleTilesRow
                key={idx+""}
                tiles={
                  chat && chat.comment ? chat.comment.split("").map((letter, i) => ({
                    letter,
                    status: determineStatuses(chat.comment, currentWord!)[i]
                  })) : Array(currentWord?.length || 5).fill({ letter: "", status: "none" })
                }
                chat={chat}
              />
            );
          })}
        </div>

      </div>
    </main>
  );

  function resetGameState() {
    setSubmittedWords([]);
    setClosestWord(undefined);
  }
}
