import React from "react";
import { CircleHelp, ExternalLink, PlayCircle, X } from "lucide-react";

const LOW_HELP_VIDEOS = [
  {
    title: "Anular baja de productos",
    embedUrl: "https://www.youtube.com/embed/wUhm4rJ_wLU?si=gx8i6nnAf5HPrUAH",
    watchUrl: "https://www.youtube.com/watch?v=wUhm4rJ_wLU",
  },
  {
    title: "Buscar baja de productos",
    embedUrl: "https://www.youtube.com/embed/0SrlHRonrDA?si=k9_ad9LaO5ejuYDC",
    watchUrl: "https://www.youtube.com/watch?v=0SrlHRonrDA",
  },
  {
    title: "Filtrar baja de productos",
    embedUrl: "https://www.youtube.com/embed/rDrEOgX5Azs?si=fbqW2JGQlQiClQHO",
    watchUrl: "https://www.youtube.com/watch?v=rDrEOgX5Azs",
  },
  {
    title: "Ingresar apartado baja producto",
    embedUrl: "https://www.youtube.com/embed/LEXcFby9rUM?si=NJI9YfxCTGNfrvHb",
    watchUrl: "https://www.youtube.com/watch?v=LEXcFby9rUM",
  },
  {
    title: "Registrar baja de productos",
    embedUrl: "https://www.youtube.com/embed/OM07ui9rIxU?si=2PZRW47t5oZUDr63",
    watchUrl: "https://www.youtube.com/watch?v=OM07ui9rIxU",
  },
  {
    title: "Ver detalles bajas de productos",
    embedUrl: "https://www.youtube.com/embed/bdOIPrgtVqw?si=mO_cwyy2W58yAt1Z",
    watchUrl: "https://www.youtube.com/watch?v=bdOIPrgtVqw",
  },
  {
    title: "Descargar reportes baja de productos",
    embedUrl: "https://www.youtube.com/embed/kOM6IzArZ5A?si=5Z_tsKe1BztaaDt2",
    watchUrl: "https://www.youtube.com/watch?v=kOM6IzArZ5A",
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

export default function LowHelpVideos() {
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
        id="low-help-videos"
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
              Baja de productos
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
          {LOW_HELP_VIDEOS.map((video) => (
            <HelpVideoCard key={video.watchUrl} video={video} />
          ))}
        </div>
      </aside>

      <div className="pointer-events-auto absolute bottom-5 right-5 sm:bottom-6 sm:right-6">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-controls="low-help-videos"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Cerrar videos de ayuda" : "Videos de ayuda"}
          className={`group inline-flex items-center rounded-full border px-3 py-3 shadow-[0_20px_45px_-28px_rgba(22,163,74,0.85)] ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 ${
            isOpen
              ? "border-green-600 bg-green-600 text-white"
              : "border-green-100 bg-white/95 text-slate-700 backdrop-blur hover:border-green-200 hover:text-green-700"
          }`}
        >
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
              isOpen
                ? "bg-white/15 text-white"
                : "bg-green-50 text-green-700 group-hover:bg-green-100"
            }`}
          >
            <CircleHelp size={18} />
          </span>

          <span
            aria-hidden="true"
            className={`overflow-hidden whitespace-nowrap text-left transition-all duration-200 ${
              isOpen
                ? "max-w-[9rem] pl-3 pr-1 opacity-100"
                : "max-w-0 opacity-0 group-hover:max-w-[9rem] group-hover:pl-3 group-hover:pr-1 group-hover:opacity-100 group-focus-visible:max-w-[9rem] group-focus-visible:pl-3 group-focus-visible:pr-1 group-focus-visible:opacity-100"
            }`}
          >
            <span className="block text-[11px] uppercase tracking-[0.18em] opacity-70">
              Ayuda
            </span>
            <span className="block text-sm font-semibold leading-4">
              {isOpen ? "Cerrar panel" : "Videos de ayuda"}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
