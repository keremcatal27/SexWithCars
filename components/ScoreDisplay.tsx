import React from 'react';

interface ScoreDisplayProps {
  score: number;
  timeLeft: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, timeLeft }) => {
  return (
    <div className="absolute top-4 left-4 p-4 bg-gray-800 rounded-lg shadow-md flex flex-col gap-2">
      <div className="text-2xl font-bold text-blue-400">Punkte: {score}</div>
      <div className="text-xl text-yellow-300">Zeit: {timeLeft}s</div>
    </div>
  );
};

export default ScoreDisplay;