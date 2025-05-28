import React from "react";

export interface WordleTile {
  letter: string;
  status: "correct" | "present" | "absent";
}

interface WordleTilesRowProps {
  tiles: WordleTile[];
  chat?: any;
}

export function WordleTilesRow({ tiles, chat }: Readonly<WordleTilesRowProps>) {
  return (
    <div className="flex gap-1 items-center">
      <div className="w-32 h-32 flex items-center justify-center flex-col">
        {chat && <img src={chat?.user?.profilePicture?.url[0]} alt={chat?.user?.profilePicture?.url[0]} className="w-16 h-16 rounded-full mb-2" />}
        <span className="font-bold">{chat?.user?.nickname}</span>
        <span>{chat?.user?.uniqueId}</span>
      </div>
      {tiles.map((tile, idx) => (
        <div
          key={tile.letter + idx}
          className={`wordle-tile ${tile.status}`}
        >
          {tile.letter}
        </div>
      ))}
    </div>
  );
}
