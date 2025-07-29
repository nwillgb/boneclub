import React from "react";
import { motion } from "framer-motion";

/**
 * Renders a single backgammon checker.
 */
const BackgammonChecker = ({ color }) => {
  if (!color) return null;

  return (
    <div
      className={`w-full h-full rounded-full border-2 shadow-inner`}
      style={{
        backgroundColor: color === 'white' ? '#F5F5DC' : '#007e81',
        borderColor: color === 'white' ? '#bdaa99' : '#005d60',
      }}
    />
  );
};

export default BackgammonChecker;