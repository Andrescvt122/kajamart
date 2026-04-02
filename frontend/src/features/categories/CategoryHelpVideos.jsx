import React from "react";
import { CircleHelp, ExternalLink, PlayCircle, X } from "lucide-react";

const CATEGORY_HELP_VIDEOS = [
  {
    title: "Editar categoría",
    embedUrl: "https://www.youtube.com/embed/F9CUKuwhaQU",
    watchUrl: "https://youtu.be/F9CUKuwhaQU",
  },
  {
    title: "Eliminar categoría",
    embedUrl: "https://www.youtube.com/embed/LqE1Fd3L9Ac",
    watchUrl: "https://youtu.be/LqE1Fd3L9Ac",
  },
  {
    title: "Registrar categoría",
    embedUrl: "https://www.youtube.com/embed/HlBP8lJ1Zxw",
    watchUrl: "https://youtu.be/HlBP8lJ1Zxw",
  },
];

function HelpVideoCard({ video }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <PlayCircle size={14} className="text-green-600" />
            Tutorial
          </p>
          <h4 className="mt-2 text-sm font-semibold leading-5 text-slate-900">
            {video.title}
          </h4>
        </div>

        <a
          href={video.watchUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-green-200 hover:text-green-700"
        >
          Abrir
          <ExternalLink size={14} />
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-inner">
        <iframe
          className="aspect-video w-full"
          src={video.embedUrl}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </article>
  );
}

export default function CategoryHelpVideos() {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <aside
        id="category-help-videos"
        aria-hidden={!isOpen}
        className={`absolute bottom-24 left-4 right-4 top-4 flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur transition-all duration-300 sm:bottom-28 sm:left-auto sm:w-[420px] lg:w-[480px] ${
          isOpen
            ? "pointer-events-auto visible translate-x-0 opacity-100"
            : "pointer-events-none invisible translate-x-[calc(100%+2rem)] opacity-0"
        }`}
      >
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-green-700">
              <CircleHelp size={14} />
              Categorías
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
              aria-label="Cerrar videos de ayuda"
            >
              <X size={18} />
            </button>
          </div>

          <h3 className="mt-4 text-xl font-semibold text-slate-900">
            Videos de ayuda
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Consulta los pasos clave sin salir de esta pantalla o abre cualquier
            video en otra pestaña para seguir trabajando mientras lo ves.
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {CATEGORY_HELP_VIDEOS.map((video) => (
            <HelpVideoCard key={video.watchUrl} video={video} />
          ))}
        </div>
      </aside>

      <div className="pointer-events-auto absolute bottom-4 right-4 sm:bottom-5 sm:right-5">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-controls="category-help-videos"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Cerrar ayuda" : "Abrir ayuda"}
          className={`group flex h-12 items-center overflow-hidden rounded-full border shadow-[0_16px_35px_-22px_rgba(22,163,74,0.8)] ring-1 ring-black/5 transition-all duration-300 ease-out hover:-translate-y-0.5 ${
            isOpen
              ? "w-12 border-green-600 bg-green-600 text-white"
              : "w-12 hover:w-[170px] border-green-100 bg-white/95 text-slate-700 backdrop-blur hover:border-green-200 hover:text-green-700"
          }`}
        >
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center transition ${
              isOpen
                ? "text-white"
                : "text-green-700"
            }`}
          >
            <CircleHelp size={18} />
          </span>

          {!isOpen && (
            <span className="hidden sm:flex min-w-0 items-center pr-4 text-sm font-medium whitespace-nowrap opacity-0 translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              Videos de ayuda
            </span>
          )}
        </button>
      </div>
    </div>
  );
}