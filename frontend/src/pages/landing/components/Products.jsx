import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "../../../shared/components/hooks/products/products.hooks";
import { useAllDetailProducts } from "../../../shared/components/hooks/productDetails/productDetails.hooks";

const pick = (...vals) => {
  for (const v of vals) {
    if (v === 0) return v;
    if (v === null || v === undefined) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    return v;
  }
  return undefined;
};

const formatCOP = (n) => {
  if (n === null || n === undefined || n === "") return "";
  const num = typeof n === "string" ? Number(n) : n;
  if (Number.isNaN(num)) return "";
  return `$${num.toLocaleString("es-CO")}`;
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

const ProductFallback = ({ name = "Producto" }) => (
  <div className="w-[520px] h-[420px] rounded-3xl bg-white/70 backdrop-blur border border-black/10 shadow-2xl flex items-center justify-center">
    <div className="text-center px-10">
      <div className="text-6xl mb-3">🛒</div>
      <p className="text-xl font-semibold text-black/80">{name}</p>
      <p className="text-sm text-black/50">Sin imagen disponible</p>
    </div>
  </div>
);

export default function Products() {
  // ✅ como el modal: “detail” + “product” por separado
  const {
    data: productsRaw,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
    error: errorProducts,
  } = useProducts();

  const {
    data: detailsRaw,
    isLoading: isLoadingDetails,
    isError: isErrorDetails,
    error: errorDetails,
  } = useAllDetailProducts();

  const [centerIndex, setCenterIndex] = useState(0);
  const [brokenImgIds, setBrokenImgIds] = useState(() => new Set());

  // Map de productos por id_producto
  const productsById = useMemo(() => {
    const arr = Array.isArray(productsRaw) ? productsRaw : [];
    const map = new Map();
    for (const p of arr) {
      const id = pick(p?.id_producto, p?.id, p?._id, p?.productId);
      if (id === undefined || id === null) continue;
      map.set(String(id), p);
    }
    return map;
  }, [productsRaw]);

  // Escoge 1 solo detail por producto (para no repetir)
  const pickBestDetail = (list) => {
    if (!Array.isArray(list) || list.length === 0) return null;
    return [...list].sort((a, b) => {
      const aStock = Number(pick(a?.stock_producto, a?.stock, 0)) || 0;
      const bStock = Number(pick(b?.stock_producto, b?.stock, 0)) || 0;

      const aDev =
        typeof a?.es_devolucion === "boolean" ? a.es_devolucion : a?.es_devolucion === "true";
      const bDev =
        typeof b?.es_devolucion === "boolean" ? b.es_devolucion : b?.es_devolucion === "true";

      if ((bStock > 0) !== (aStock > 0)) return bStock > 0 ? 1 : -1; // con stock primero
      if (aDev !== bDev) return aDev ? 1 : -1; // no devolución primero
      return bStock - aStock;
    })[0];
  };

  // ✅ Lista final a mostrar: nombre + imagen + precio
  const products = useMemo(() => {
    const arr = Array.isArray(detailsRaw) ? detailsRaw : [];

    // agrupar details por id_producto
    const groups = new Map();
    for (const d of arr) {
      const idProd = pick(d?.id_producto, d?.product_id, d?.producto_id, d?.idProducto);
      if (idProd === undefined || idProd === null) continue;

      const key = String(idProd);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(d);
    }

    const out = [];
    for (const [id, list] of groups.entries()) {
      const best = pickBestDetail(list);
      if (!best) continue;

      // producto real desde /products
      const prod = productsById.get(id);
      if (!prod) {
        // si no hay match, igual lo metemos con fallback
        out.push({ id, nombre: `Producto #${id}`, precio_venta: null, url_imagen: "" });
        continue;
      }

      // mismas llaves que tu modal
      const nombre = pick(prod.nombre, prod.name, `Producto #${id}`);
      const precioVenta = pick(prod.precio_venta, prod.precioVenta, prod.price, prod.precio);
      const urlImagen = pick(prod.url_imagen, prod.urlImagen, prod.imagen, prod.image, prod.imageUrl);

      out.push({
        id,
        nombre,
        precio_venta: precioVenta ?? null,
        url_imagen: resolveImageUrl(urlImagen ?? ""),
      });
    }

    return out;
  }, [detailsRaw, productsById]);

  const total = products.length;
  const pauseDuration = 4000;
  const transitionDuration = 1.2;

  useEffect(() => {
    if (total === 0) return;
    setCenterIndex((prev) => (prev >= total ? 0 : prev));
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    const interval = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % total);
    }, pauseDuration + transitionDuration * 1000);
    return () => clearInterval(interval);
  }, [total]);

  const getStyle = (offset) => {
    const spacingX = 370;
    const x = offset * spacingX;
    const scale = Math.max(0.5, 1 - offset * 0.25);
    const blur = offset * 4;
    const zIndex = 20 - offset;
    return { x, scale, blur, zIndex };
  };

  const textVariants = {
    initial: { opacity: 0, y: 30, x: -10 },
    animate: { opacity: 1, y: 0, x: 0 },
    exit: { opacity: 0, y: -10, x: -20 },
  };

  const [particles, setParticles] = useState(
    Array.from({ length: 8 }, () => ({
      size: Math.random() * 6 + 3,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: Math.random() > 0.5 ? "rgba(35,255,68,0.6)" : "rgba(21, 115, 0, 0.41)",
      dx: Math.random() * 0.3 - 0.15,
      dy: Math.random() * 0.3 - 0.15,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => {
          let newX = p.x + p.dx;
          let newY = p.y + p.dy;
          let dx = p.dx;
          let dy = p.dy;
          if (newX > 100 || newX < 0) dx = -dx;
          if (newY > 100 || newY < 0) dy = -dy;
          return { ...p, x: newX, y: newY, dx, dy };
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const offsets = useMemo(() => {
    const count = Math.min(3, total || 0);
    return Array.from({ length: count }, (_, i) => i);
  }, [total]);

  const current = total > 0 ? products[centerIndex] : null;

  const showLoading = isLoadingProducts || isLoadingDetails;
  const showError = isErrorProducts || isErrorDetails;
  const errMsg = errorProducts?.message || errorDetails?.message;

  return (
    <section id="productos" className="relative py-12 bg-gradient-to-br from-green-50 to-gray-100 overflow-hidden">
      <h2 className="text-5xl font-extrabold uppercase px-12 py-12 mb-6 text-gray drop-shadow-xl">
        Nuestros productos
      </h2>

      <div className="px-12 mb-6">
        {showLoading && (
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white/70 border border-black/10">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-black/40 border-t-transparent rounded-full" />
            <span className="text-black/70 font-medium">Cargando productos...</span>
          </div>
        )}

        {showError && (
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-red-50 border border-red-200">
            <span className="text-red-700 font-semibold">Error cargando datos</span>
            <span className="text-red-700/70 text-sm">{errMsg || "Intenta de nuevo"}</span>
          </div>
        )}
      </div>

      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            top: `${p.y}%`,
            left: `${p.x}%`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            zIndex: 0,
          }}
        />
      ))}

      <div className="flex items-center justify-start px-12 gap-8 h-[560px] relative">
        {/* Texto: SOLO nombre + precio */}
        <div className="w-1/3 flex flex-col justify-center pr-6">
          {current ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                variants={textVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-4xl font-bold text-black-500 mb-2">{current.nombre}</h2>

                {current.precio_venta != null ? (
                  <p className="text-2xl text-green-500 drop-shadow-md mb-4">
                    {formatCOP(current.precio_venta)}
                  </p>
                ) : (
                  <p className="text-base text-black/50 mb-4">Precio no disponible</p>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-black/60">
              <p className="text-2xl font-semibold">Productos</p>
              <p className="text-sm">Esperando datos del backend…</p>
            </div>
          )}
        </div>

        {/* Carrusel */}
        <div className="w-2/3 h-full relative flex items-center justify-start overflow-visible" style={{ perspective: 1200 }}>
          <div className="relative w-full h-full flex items-center justify-start" style={{ transformStyle: "preserve-3d" }}>
            <AnimatePresence>
              {offsets.map((offset) => {
                const productIndex = total > 0 ? (centerIndex + offset) % total : 0;
                const item = total > 0 ? products[productIndex] : null;
                if (!item) return null;

                const style = getStyle(offset);
                const imgBroken = brokenImgIds.has(item.id);

                return (
                  <motion.div
                    key={item.id}
                    className="absolute flex items-center justify-center"
                    initial={{ scale: 0.6, x: style.x }}
                    animate={{ scale: style.scale, x: style.x }}
                    exit={{ scale: style.scale * 1.2, x: style.x - 350, opacity: 0 }}
                    transition={{ duration: transitionDuration }}
                    style={{ zIndex: style.zIndex, filter: `blur(${style.blur}px)` }}
                  >
                    {!item.url_imagen || imgBroken ? (
                      <ProductFallback name={item.nombre} />
                    ) : (
                      <img
                        src={item.url_imagen}
                        alt={item.nombre}
                        className="w-[520px] h-[420px] object-contain drop-shadow-2xl"
                        draggable={false}
                        onError={() => setBrokenImgIds((prev) => new Set(prev).add(item.id))}
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
