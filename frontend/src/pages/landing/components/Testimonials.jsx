import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "../../../shared/components/hooks/products/products.hooks";
import { useCategories } from "../../../shared/components/hooks/categories/categories.hooks";

const pick = (...vals) => {
  for (const v of vals) {
    if (v === 0) return v;
    if (v === null || v === undefined) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    return v;
  }
  return undefined;
};

const normalizeLeadingSlash = (p) => (p ? (p.startsWith("/") ? p : `/${p}`) : "");

const resolveImageUrl = (img) => {
  if (!img) return "";

  if (typeof img === "object" && !Array.isArray(img)) {
    img = pick(img.url, img.path, img.secure_url, img.location);
  }

  if (Array.isArray(img)) {
    const first = img[0];
    if (typeof first === "string") img = first;
    else if (typeof first === "object") img = pick(first.url, first.path, first.secure_url);
    else img = "";
  }

  if (!img || typeof img !== "string") return "";
  if (/^https?:\/\//i.test(img)) return img;

  const API_BASE =
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3000/kajamart/api";

  const originGuess = API_BASE.replace(/\/kajamart\/api\/?$/i, "");
  return `${originGuess}${normalizeLeadingSlash(img)}`;
};

const CategoryFallback = ({ name = "Categoría" }) => (
  <div className="w-14 h-14 rounded-full bg-green-100 border-4 border-green-400 mx-auto mb-4 shadow-md flex items-center justify-center">
    <span className="text-2xl">🧺</span>
    <span className="sr-only">{name}</span>
  </div>
);

export default function MemoriesBouncing() {
  const { data: productsRaw, isLoading: loadingProducts, isError: errorProducts } = useProducts();
  const { categories, loading: loadingCategories, error: errorCategories } = useCategories();

  // ✅ cards finales (categorías + imagen aleatoria de productos de esa categoría)
  const cards = useMemo(() => {
    const prods = Array.isArray(productsRaw) ? productsRaw : [];
    const cats = Array.isArray(categories) ? categories : [];

    // indexar productos por id_categoria (con fallbacks)
    const byCatId = new Map();

    for (const p of prods) {
      const idCat = pick(
        p?.id_categoria,
        p?.categoria_id,
        p?.idCategoria,
        p?.categoria?.id_categoria,
        p?.categoria?.id,
        p?.category_id
      );

      if (idCat === undefined || idCat === null) continue;

      const key = String(idCat);
      if (!byCatId.has(key)) byCatId.set(key, []);
      byCatId.get(key).push(p);
    }

    // construir cards usando categorías del hook (ya mapeadas)
    const out = cats
      .filter((c) => c.estado === "Activo") // opcional
      .map((c) => {
        const key = String(c.id_categoria);
        const list = byCatId.get(key) || [];

        // buscar productos con imagen
        const withImg = list
          .map((p) => {
            const img = pick(
              p?.url_imagen,
              p?.urlImagen,
              p?.imagen,
              p?.image,
              p?.imageUrl,
              p?.image_url,
              p?.foto,
              p?.thumbnail,
              p?.images
            );
            return { img: resolveImageUrl(img), p };
          })
          .filter((x) => !!x.img);

        const chosen = withImg.length
          ? withImg[Math.floor(Math.random() * withImg.length)]
          : null;

        return {
          id: c.id_categoria,
          nombre: c.nombre || "Categoría",
          texto: list.length
            ? `${list.length} producto${list.length === 1 ? "" : "s"}`
            : "Sin productos aún",
          img: chosen?.img || "",
        };
      });

    // orden: con productos primero
    out.sort((a, b) => {
      const aN = Number((a.texto.match(/\d+/) || [0])[0]);
      const bN = Number((b.texto.match(/\d+/) || [0])[0]);
      return bN - aN;
    });

    // limitar para que no se vuelva loco
    return out.slice(0, 18);
  }, [productsRaw, categories]);

  const [positions, setPositions] = useState([]);
  const [centerIndex, setCenterIndex] = useState(0);

  // init posiciones cuando ya hay cards
  useEffect(() => {
    if (!cards.length) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const init = cards.map(() => ({
      x: Math.random() * (w - 200) + 100,
      y: Math.random() * (h - 200) + 100,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
    }));

    setPositions(init);

    const interval = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % cards.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [cards.length]);

  useEffect(() => {
    if (!cards.length) return;

    const move = () => {
      setPositions((prev) =>
        prev.map((p) => {
          let x = p.x + p.vx;
          let y = p.y + p.vy;
          let vx = p.vx;
          let vy = p.vy;

          if (x < 100 || x > window.innerWidth - 100) vx *= -1;
          if (y < 100 || y > window.innerHeight - 100) vy *= -1;

          return { x, y, vx, vy };
        })
      );
    };

    const id = setInterval(move, 30);
    return () => clearInterval(id);
  }, [cards.length]);

  const loading = loadingProducts || loadingCategories;
  const hasError = errorProducts || errorCategories;

  return (
    <section
      id="categorias"
      className="relative py-20 bg-gradient-to-b from-white to-green-50 overflow-hidden h-[100vh]"
    >
      <div className="text-center py-20 mb-10 relative z-20">
        <h4 className="text-green-600 font-bold uppercase tracking-wide">Categorías</h4>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mt-2">
          Explora por categorías
        </h2>

        {loading && <p className="text-sm text-gray-500 mt-3">Cargando categorías...</p>}
        {hasError && (
          <p className="text-sm text-red-600 mt-3">No se pudieron cargar categorías/productos</p>
        )}
        {!loading && !hasError && cards.length === 0 && (
          <p className="text-sm text-gray-500 mt-3">No hay categorías para mostrar</p>
        )}
      </div>

      <div className="absolute inset-0">
        <AnimatePresence>
          {cards.map((c, i) => {
            const pos = positions[i] || { x: 200, y: 200 };
            const isCenter = i === centerIndex;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{
                  top: isCenter ? "50%" : pos.y,
                  left: isCenter ? "50%" : pos.x,
                  x: "-50%",
                  y: "-50%",
                  scale: isCenter ? 1.3 : 0.7,
                  opacity: isCenter ? 1 : 0.5,
                  zIndex: isCenter ? 50 : 1,
                  filter: isCenter ? "blur(0px)" : "blur(6px)",
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className={`absolute bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-[260px] text-center ${
                  isCenter ? "ring-4 ring-green-400" : ""
                }`}
              >
                {c.img ? (
                  <img
                    src={c.img}
                    alt={c.nombre}
                    className="w-14 h-14 rounded-full object-cover border-4 border-green-400 mx-auto mb-4 shadow-md"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <CategoryFallback name={c.nombre} />
                )}

                <p className="text-gray-800 font-bold text-base mb-1">{c.nombre}</p>
                <p className="text-gray-600 text-sm">{c.texto}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
