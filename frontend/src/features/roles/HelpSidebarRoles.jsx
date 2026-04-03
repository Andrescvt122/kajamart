import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHelpCircle, FiX, FiPlayCircle } from "react-icons/fi";

const helpVideos = [
  {
    id: "1",
    title: "Como registrar un rol",
    youtubeId: "527ee-E7oB0", // Reemplazar con ID real
  },
  {
    id: "2",
    title: "Como editar un rol",
    youtubeId: "OK1NNjWAuGs", // Reemplazar con ID real
  },
  {
    id: "3",
    title: "Ver detalles de un rol",
    youtubeId: "5W_moJfyWBk", // Reemplazar con ID real
  },
  {
    id: "4",
    title: "Como eliminar un rol",
    youtubeId: "cNafApDEyK0", // Reemplazar con ID real
  }
];

export default function HelpSidebarRoles() {
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
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors z-40"
        title="Ayuda y Tutoriales"
      >
        <FiHelpCircle size={32} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-[45]"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 w-80 md:w-96 h-full bg-white shadow-2xl z-[50] flex flex-col"
            >
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FiHelpCircle className="text-green-600" /> Ayuda - Roles
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona uno de nuestros videos tutoriales para aprender más sobre cómo gestionar roles y permisos.
                </p>
                {helpVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="group cursor-pointer border rounded-xl overflow-hidden hover:border-green-500 hover:shadow-md transition-all bg-gray-50 hover:bg-white"
                  >
                    <div className="relative aspect-video bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img 
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} 
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <FiPlayCircle className="text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" size={48} />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{video.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVideo(null)}
              className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-black rounded-xl overflow-hidden shadow-2xl w-full max-w-5xl aspect-video z-10 border border-gray-800"
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-20 text-white bg-black bg-opacity-50 hover:bg-opacity-100 rounded-full p-2 transition-all"
              >
                <FiX size={24} />
              </button>
              
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full bg-black"
              ></iframe>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
