import React from 'react';
import Game from './components/Game';

const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
      <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-8 text-center drop-shadow-lg animate-fade-in">
        <span className="text-blue-400">Auspuff</span> <span className="text-green-400">Treffer!</span>
      </h1>
      <Game />
    </div>
  );
};

export default App;