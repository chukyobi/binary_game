import React, { useState, useEffect } from 'react';
import { GameSettings as GameSettingsType } from '../types';

interface GameSettingsProps {
  onSettingsChange: (settings: GameSettingsType) => void;
}

const GameSettings: React.FC<GameSettingsProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState<GameSettingsType>({
    soundEnabled: true,
    musicEnabled: true,
    difficulty: 'medium'
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key: keyof GameSettingsType, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('gameSettings', JSON.stringify(newSettings));
    onSettingsChange(newSettings);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Game Settings</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Sound Effects</span>
          <button
            onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
            className={`px-4 py-2 rounded ${
              settings.soundEnabled
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {settings.soundEnabled ? 'On' : 'Off'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-300">Background Music</span>
          <button
            onClick={() => handleSettingChange('musicEnabled', !settings.musicEnabled)}
            className={`px-4 py-2 rounded ${
              settings.musicEnabled
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {settings.musicEnabled ? 'On' : 'Off'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-300">Difficulty</span>
          <select
            value={settings.difficulty}
            onChange={(e) => handleSettingChange('difficulty', e.target.value as GameSettingsType['difficulty'])}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default GameSettings; 