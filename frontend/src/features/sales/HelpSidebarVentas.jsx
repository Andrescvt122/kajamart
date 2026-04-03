import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHelpCircle, FiX, FiPlayCircle } from "react-icons/fi";

const helpVideos = [
  {
    id: "1",
    title: "Tutorial completo del módulo de ventas",
    youtubeId: "1-u8we0gmb8",
  }
];

export default function HelpSidebarVentas() {
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
        title="Ayuda Ventas"
      >
        <FiHelpCircle size={28} />
      </button>

      {/* SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-[45]"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 w-80 md:w-96 h-full bg-white z-[50] flex flex-col shadow-2xl"
            >
              {/* HEADER */}
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FiHelpCircle className="text-green-600" /> Ayuda Ventas
                </h2>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* CONTENIDO */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <p className="text-sm text-gray-600">
                  Aprende a usar el módulo de ventas con este video.
                </p>

                {helpVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="cursor-pointer border rounded-xl overflow-hidden hover:shadow-lg transition bg-gray-50"
                  >
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

      {/* MODAL */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              onClick={() => setSelectedVideo(null)}
              className="absolute inset-0 bg-black bg-opacity-80"
            />

            <motion.div className="relative bg-black rounded-xl w-full max-w-5xl aspect-video z-10">
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2"
              >
                <FiX />
              </button>

              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                className="w-full h-full"
                allowFullScreen
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}