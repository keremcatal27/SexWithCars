import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-90 z-20">
      <h1 className="text-5xl font-extrabold text-blue-400 mb-8 animate-bounce">
        Auspuff Treffer!
      </h1>
      <p className="text-xl text-gray-300 mb-12 text-center max-w-md">
        Nutze deinen Finger/Maus, um die Wasserpistole zu zielen. Tippe/Klicke, um auf den Auspuff fahrender Autos zu schießen!
      </p>
      <button
        onClick={onStart}
        className="px-10 py-4 bg-green-500 hover:bg-green-600 text-white text-2xl font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        Spiel Starten
      </button>
    </div>
  );
};

export default StartScreen;