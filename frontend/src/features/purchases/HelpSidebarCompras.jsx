import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHelpCircle, FiX, FiPlayCircle } from "react-icons/fi";

const helpVideos = [
  {
    id: "1",
    title: "Tutorial completo del módulo de compras",
    youtubeId: "Q6z-jEWAfmg",
  }
];

export default function HelpSidebarCompras() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const original = document.body.style.overflow;
    if (isOpen || selectedVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original || "auto";
    }
    return () => {
      document.body.style.overflow = original || "auto";
    };
  }, [isOpen, selectedVideo]);

  return (
    <>
      {/* BOTÓN */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors z-40"
        title="Ayuda Compras"
      >
        <FiHelpCircle size={28} />
      </button>

      {/* SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-[45]"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 w-80 md:w-96 h-full bg-white z-[50] flex flex-col shadow-2xl"
            >
              {/* HEADER */}
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FiHelpCircle className="text-green-600" />
                  Ayuda Compras
                </h2>

                {/* ❌ visible */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition"
                >
                  <FiX size={24} className="text-gray-800" />
                </button>
              </div>

              {/* CONTENIDO */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <p className="text-sm text-gray-600">
                  Aprende a usar el módulo de compras con este video completo.
                </p>

                {helpVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="cursor-pointer border rounded-xl overflow-hidden hover:shadow-lg transition bg-gray-50"
                  >
                    {/* Imagen */}
                    <div className="relative aspect-video">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                        <FiPlayCircle size={50} className="text-white" />
                      </div>
                    </div>

                    {/* Texto */}
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-800">
                        {video.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL VIDEO */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            
            {/* Fondo */}
            <motion.div
              onClick={() => setSelectedVideo(null)}
              className="absolute inset-0 bg-black bg-opacity-80"
            />

            {/* Contenedor */}
            <motion.div className="relative bg-black rounded-xl w-full max-w-5xl aspect-video z-10">
              
              {/* ❌ SUPER visible */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 bg-white hover:bg-gray-200 text-black rounded-full p-2 shadow-lg z-20"
              >
                <FiX size={20} />
              </button>

              {/* Video */}
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                title={selectedVideo.title}
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}