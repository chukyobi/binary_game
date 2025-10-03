import React from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../stores/gameStore";
import { motion } from "framer-motion";

interface GameOverProps {
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ onRestart }) => {
  const router = useRouter();
  const { score, highScore } = useGameStore();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      {/* Neon glowing container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="bg-gradient-to-br from-purple-900 via-black to-indigo-900 border-4 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.8)] rounded-2xl p-10 max-w-lg w-full text-center"
      >
        {/* Title */}
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-extrabold text-pink-500 mb-6 drop-shadow-[0_0_10px_rgba(236,72,153,1)] uppercase"
          style={{ fontFamily: "Press Start 2P, monospace" }}
        >
          Game Over
        </motion.h2>

        {/* Scores */}
        <div className="mb-8">
          <p className="text-2xl text-yellow-400 font-bold mb-2">
            Final Score: <span className="text-white">{score}</span>
          </p>
          <p className="text-xl text-cyan-300">
            High Score: <span className="text-white">{highScore}</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="w-full p-4 rounded-xl text-2xl font-bold uppercase tracking-wide bg-gradient-to-r from-green-400 to-emerald-600 text-black shadow-[0_0_15px_rgba(16,185,129,0.8)] hover:shadow-[0_0_25px_rgba(16,185,129,1)] transition-all"
            style={{ fontFamily: "Press Start 2P, monospace" }}
          >
            ▶ Play Again
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/")}
            className="w-full p-4 rounded-xl text-2xl font-bold uppercase tracking-wide bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.8)] hover:shadow-[0_0_25px_rgba(239,68,68,1)] transition-all"
            style={{ fontFamily: "Press Start 2P, monospace" }}
          >
            ⬅ Return to Menu
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default GameOver;
