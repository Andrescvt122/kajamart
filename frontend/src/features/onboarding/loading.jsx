import React from "react";
import { motion } from "framer-motion";

export default function Loading({ inline = false, heightClass }) {
  const color = "#3EB489"; // sin espacio final
  const containerHeight = inline ? (heightClass || "h-40") : "h-screen";
  const bgClass = inline ? "bg-transparent" : "bg-white";
  const scaleTo = inline ? 4 : 7; // ondas más chicas en modo inline

  return (
    <div
      className={`flex items-center justify-center w-full ${containerHeight} ${bgClass} relative overflow-hidden`}
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 rounded-full border"
          style={{ borderColor: color }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: scaleTo, opacity: 0 }}
          transition={{
            delay: i * 0.3,
            duration: 1.6,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute w-4 h-4 rounded-full"
        style={{
          background: color,
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [1, 0.95, 1] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
