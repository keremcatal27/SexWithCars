import React from 'react';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-90 z-20">
      <h2 className="text-6xl font-extrabold text-red-500 mb-6 animate-pulse">
        Spiel Vorbei!
      </h2>
      <p className="text-4xl text-white mb-10">
        Deine Punktzahl: <span className="font-bold text-yellow-400">{score}</span>
      </p>
      <button
        onClick={onRestart}
        className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        Erneut Spielen
      </button>
    </div>
  );
};

export default GameOverScreen;