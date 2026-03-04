// IndexRegisterPurchase.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductRegisterModal from "../products/productRegisterModal";
import SuplliersRegisterModal from "../suppliers/SuplliersRegisterModal";

// ✅ NUEVO: SweetAlert2 (igual que ventas)
import Swal from "sweetalert2";

// ✅ Iconos
import { FiEdit, FiTrash2 } from "react-icons/fi";

// ✅ Hooks reales (NO modificar hooks)
import { useSuppliers as useSuppliersQuery } from "../../shared/components/hooks/suppliers/suppliers.hooks.js";
import { useProducts as useProductsQuery } from "../../shared/components/hooks/products/products.hooks.js";

export default function IndexRegisterPurchase() {
  const navigate = useNavigate();

  // =========================
  // Carga real desde backend
  // =========================
  const {
    data: suppliersRaw = [],
    isLoading: isSuppliersLoading,
    isError: isSuppliersError,
    error: suppliersError,
  } = useSuppliersQuery();

  const {
    data: productsRaw = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
  } = useProductsQuery();

  // =========================
  // Estados de compra
  // =========================
  const [proveedor, setProveedor] = useState(null);
  const [productos, setProductos] = useState([]);
  const [mensajeProveedor, setMensajeProveedor] = useState(null);
  const [mensajeProducto, setMensajeProducto] = useState(null);
  const [comprobante, setComprobante] = useState(null);

  // ✅ Alertas (estilo como las otras)
  const [mensajeComprobante, setMensajeComprobante] = useState(null);

  // ✅ loading registrar compra
  const [isRegistrandoCompra, setIsRegistrandoCompra] = useState(false);

  // ✅ Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // =========================
  // ✅ MODAL PAQUETES + unidades/paq
  // ✅ SIN CAMPO "MARCA"
  // - cantidad (paquetes) inicia vacío (se puede borrar)
  // - unidadesPorPaquete inicia vacío (se puede borrar)
  // - CÁLCULO (subtotal/total) SE HACE POR PAQUETES, NO POR UNIDADES
  // =========================
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [productoPackPendiente, setProductoPackPendiente] = useState(null);

  const [packForm, setPackForm] = useState({
    cantidad: "", // paquetes
    unidadesPorPaquete: "", // informativo
    selectedIndex: 0,
    paquetes: [],
  });

  const [packTouched, setPackTouched] = useState({});
  const [packErrors, setPackErrors] = useState({});

  // ✅ Modal editar desde tabla (mismo formulario)
  const [isPackEditOpen, setIsPackEditOpen] = useState(false);
  const [packEditIndex, setPackEditIndex] = useState(null);

  // =========================
  // Estados de factura
  // =========================
  const [numFactura, setNumFactura] = useState(null);
  const [fechaFactura] = useState(() => new Date());

  // =========================
  // Filtros / buscadores
  // =========================
  const [proveedorQuery, setProveedorQuery] = useState("");
  const [productoQuery, setProductoQuery] = useState("");
  const [isProvOpen, setIsProvOpen] = useState(false);
  const [isProdOpen, setIsProdOpen] = useState(false);
  const [provActiveIndex, setProvActiveIndex] = useState(-1);
  const [prodActiveIndex, setProdActiveIndex] = useState(-1);

  const provWrapRef = useRef(null);
  const prodWrapRef = useRef(null);

  // =========================
  // ✅ Auto-seleccionar proveedor recién creado (SIN tocar modal)
  // =========================
  const prevSupplierIdsRef = useRef(new Set());
  const pendingAutoSelectSupplierRef = useRef(false);

  // =========================
  // ✅ Bloquear scroll mientras modal abierto
  // =========================
  const anyModalOpen =
    isProductModalOpen || isSupplierModalOpen || isPackModalOpen || isPackEditOpen;

  useEffect(() => {
    document.body.style.overflow = anyModalOpen ? "hidden" : "auto";

    const cls = "purchase-modal-open";
    document.documentElement.classList.toggle(cls, anyModalOpen);
    document.body.classList.toggle(cls, anyModalOpen);

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.classList.remove(cls);
      document.body.classList.remove(cls);
    };
  }, [anyModalOpen]);

  // =========================
  // ✅ Quitar flechas (spinners) en inputs number
  // =========================
  const noSpinNumber =
    " [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ";

  // =========================
  // Normalizadores
  // =========================
  const normalizeText = (text) =>
    String(text ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  // =========================
  // ✅ Helpers FECHA (vencimiento)
  // =========================
  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  const addDays = (d, days) => {
    const x = startOfDay(d);
    x.setDate(x.getDate() + days);
    return x;
  };

  const toISODate = (d) => startOfDay(d).toISOString().slice(0, 10);

  // ✅ mínimo permitido: hoy + 4 días
  const minExpiryDateStr = useMemo(() => toISODate(addDays(new Date(), 4)), []);

  // =========================
  // ✅ Helpers cantidad (paquetes x unidades) (SOLO INFORMATIVO)
  // =========================
  const toNonNegIntFromString = (s) => {
    if (s === "" || s == null) return 0;
    const n = Number(s);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.floor(n));
  };

  const getTotalUnidadesFromForm = (form) => {
    const paquetes = toNonNegIntFromString(form?.cantidad);
    const unid = toNonNegIntFromString(form?.unidadesPorPaquete);
    return paquetes * unid;
  };

  // =========================
  // ✅ Validación por campo (paquete)
  // SOLO:
  // - codigoBarrasIngreso: numérico, 13 dígitos, obligatorio
  // - fechaVencimiento: NO obligatoria; si existe, >= hoy+4
  // =========================
  const validateOne = (field, form) => {
    const v = String(form?.[field] ?? "").trim();

    if (field === "codigoBarrasIngreso") {
      if (!v) return "El código de barras es obligatorio.";
      if (!/^\d+$/.test(v)) return "El código de barras debe ser solo numérico.";
      if (v.length !== 13) return "Debe tener exactamente 13 dígitos.";
      return "";
    }

    if (field === "fechaVencimiento") {
      if (!v) return ""; // ✅ NO obligatoria
      const picked = startOfDay(new Date(v));
      const minDate = startOfDay(addDays(new Date(), 4));
      if (Number.isNaN(picked.getTime())) return "Fecha inválida.";
      if (picked < minDate)
        return `Debe ser igual o posterior a ${toISODate(minDate)} (mínimo 4 días).`;
      return "";
    }

    return "";
  };

  const computeErrors = (form) => ({
    codigoBarrasIngreso: validateOne("codigoBarrasIngreso", form),
    fechaVencimiento: validateOne("fechaVencimiento", form),
  });

  // =========================
  // ✅ Paquetes (array) helpers
  // =========================
  const makeEmptyPack = () => ({
    codigoBarrasIngreso: "",
    fechaVencimiento: "",
  });

  const syncPaquetesLength = (prevPaquetes, n, fallbackBarcode = "") => {
    const N = Math.max(0, Number(n || 0));
    const next = [...(prevPaquetes || [])];

    if (N === 0) return [];

    if (N > next.length) {
      while (next.length < N) {
        next.push({
          ...makeEmptyPack(),
          codigoBarrasIngreso: next.length === 0 ? String(fallbackBarcode || "") : "",
        });
      }
    } else {
      next.length = N;
    }
    return next;
  };

  const computePackErrors = (form) => {
    const errs = {};
    const paquetesCount = toNonNegIntFromString(form?.cantidad);
    const unidCount = toNonNegIntFromString(form?.unidadesPorPaquete);
    const paquetes = form?.paquetes || [];

    if (paquetesCount <= 0) errs["cantidad"] = "Debes ingresar una cantidad de paquetes mayor a 0.";
    if (unidCount <= 0)
      errs["unidadesPorPaquete"] = "Debes ingresar unidades por paquete mayor a 0.";

    if (paquetesCount <= 0) return errs;

    if (paquetes.length !== paquetesCount) {
      errs["req"] = "La cantidad de paquetes no coincide con los paquetes generados.";
      return errs;
    }

    paquetes.forEach((p, idx) => {
      const e = computeErrors(p);
      Object.entries(e).forEach(([k, msg]) => {
        if (msg) errs[`${idx}.${k}`] = msg;
      });
    });

    const codes = paquetes.map((p) => String(p.codigoBarrasIngreso || "").trim());
    const seen = new Set();
    for (const c of codes) {
      if (!c) continue;
      if (seen.has(c)) {
        errs["dup"] = "Hay códigos de barras repetidos. Cada paquete debe ser único.";
        break;
      }
      seen.add(c);
    }

    const filled = codes.filter(Boolean).length;
    if (paquetes.length > 0 && filled !== paquetes.length) {
      errs["req"] = "Debes ingresar un código de barras por cada paquete.";
    }

    return errs;
  };

  const packHasErrors = (errs) => Object.keys(errs || {}).length > 0;

  // =========================
  // ✅ Helpers select paquetes
  // =========================
  const makePackLabel = (p, idx) => {
    const code = String(p?.codigoBarrasIngreso || "").trim();
    return code ? `Paquete ${idx + 1} — ${code}` : `Paquete ${idx + 1} — (sin código)`;
  };

  const onSelectPaquete = (idx) => {
    setPackForm((prev) => {
      const len = prev.paquetes.length;
      const nextIdx = Math.max(0, Math.min(Number(idx || 0), Math.max(0, len - 1)));
      return { ...prev, selectedIndex: nextIdx };
    });
  };

  // =========================
  // ✅ Stock + Código (compat)
  // =========================
  const getStock = (p) => {
    const s =
      p?.stock_actual ??
      p?.stock_producto ??
      p?.stock ??
      p?.existencias ??
      p?.cantidad ??
      p?.inventario ??
      p?.inventario_actual ??
      p?.productos?.stock_actual ??
      p?.detalle_productos?.stock_producto ??
      p?.detalle_productos?.productos?.stock_actual ??
      0;

    return Number(s || 0);
  };

  const getCodigoBarras = (p) => {
    return (
      p?.codigo_barras ??
      p?.codigo_barras_producto_compra ??
      p?.barcode ??
      p?.codigoBarra ??
      p?.codigo_barras_producto ??
      p?.productos?.codigo_barras ??
      p?.productos?.codigo_barras_producto_compra ??
      p?.detalle_productos?.codigo_barras ??
      p?.detalle_productos?.codigo_barras_producto_compra ??
      ""
    );
  };

  const getProductoId = (p) =>
    String(p?.id_producto ?? p?.id ?? p?.ID ?? p?.id_detalle_producto ?? "");

  // =========================
  // Normalizar data REAL (backend)
  // =========================
  const proveedoresDB = useMemo(() => {
    if (!Array.isArray(suppliersRaw)) return [];
    return suppliersRaw.map((s) => ({
      ...s,
      id_proveedor: s?.id_proveedor ?? s?.id ?? s?.ID ?? null,
      nit: s?.nit != null ? String(s.nit) : "",
      nombre: s?.nombre ?? "",
      telefono: s?.telefono ?? "",
      estado: s?.estado,
    }));
  }, [suppliersRaw]);

  const productosDB = useMemo(() => {
    if (!Array.isArray(productsRaw)) return [];

    return productsRaw.map((p) => {
      const precio =
        Number(p?.precio ?? p?.precio_compra ?? p?.costo ?? p?.valor ?? 0) || 0;

      const precioVenta =
        Number(
          p?.precio_venta ??
            p?.precioVenta ??
            p?.precio_publico ??
            p?.precio_lista ??
            p?.valor_venta ??
            0
        ) || 0;

      const stock = getStock(p);
      const codigoBarras = getCodigoBarras(p);

      const id_producto = p?.id_producto ?? p?.id ?? p?.ID ?? null;
      const productoId = String(id_producto ?? p?.id_detalle_producto ?? p?.id ?? "");

      return {
        ...p,
        id_producto,
        productoId,
        codigo: p?.codigo != null ? String(p.codigo) : "",
        nombre: p?.nombre ?? p?.productos?.nombre ?? "",
        precio,
        precioVenta,
        stock,
        codigoBarras,
      };
    });
  }, [productsRaw]);

  // =========================
  // Filtrados (proveedor)
  // =========================
  const proveedoresFiltrados = useMemo(() => {
    const q = normalizeText(proveedorQuery);
    if (!q) return [];
    return proveedoresDB
      .filter((p) => normalizeText(p.nit).includes(q) || normalizeText(p.nombre).includes(q))
      .slice(0, 8);
  }, [proveedorQuery, proveedoresDB]);

  // =========================
  // ✅ Productos: SET seleccionados
  // =========================
  const selectedProductIds = useMemo(() => {
    return new Set(productos.map((p) => String(p.productoId)));
  }, [productos]);

  // =========================
  // ✅ Productos filtrados
  // =========================
  const productosFiltrados = useMemo(() => {
    const q = normalizeText(productoQuery);
    if (!q) return [];

    return productosDB
      .filter((p) => {
        const match =
          normalizeText(p.codigo).includes(q) ||
          normalizeText(p.nombre).includes(q) ||
          normalizeText(p.codigoBarras).includes(q);

        if (!match) return false;

        const id = getProductoId(p);
        if (!id) return true;
        return !selectedProductIds.has(String(id));
      })
      .slice(0, 10);
  }, [productoQuery, productosDB, selectedProductIds]);

  // =========================
  // Selección proveedor
  // =========================
  const seleccionarProveedor = (prov) => {
    setProveedor(prov);
    setProveedorQuery(`${prov.nombre} (${prov.nit})`);
    setMensajeProveedor({ tipo: "ok", texto: `✅ Proveedor seleccionado: ${prov.nombre}` });
    setIsProvOpen(false);
    setProvActiveIndex(-1);
  };

  // Snapshot inicial IDs proveedores
  useEffect(() => {
    if (!prevSupplierIdsRef.current.size && proveedoresDB.length > 0) {
      prevSupplierIdsRef.current = new Set(
        proveedoresDB.map((p) => String(p.id_proveedor ?? p.nit ?? ""))
      );
    }
  }, [proveedoresDB]);

  // Auto-selección proveedor creado
  useEffect(() => {
    if (!pendingAutoSelectSupplierRef.current) return;
    if (!proveedoresDB.length) return;

    const prevIds = prevSupplierIdsRef.current;
    const currentIds = new Set(
      proveedoresDB.map((p) => String(p.id_proveedor ?? p.nit ?? ""))
    );

    const nuevo = proveedoresDB.find((p) => {
      const id = String(p.id_proveedor ?? p.nit ?? "");
      return id && !prevIds.has(id);
    });

    if (nuevo) {
      seleccionarProveedor(nuevo);
      pendingAutoSelectSupplierRef.current = false;
      prevSupplierIdsRef.current = currentIds;
    }
  }, [proveedoresDB]);

  // =========================
  // ✅ Cálculos (POR PAQUETES)
  // =========================
  const calcularSubtotal = (prod) => {
    const paquetes = Number(prod.cantidadPaquetes ?? prod.cantidad ?? 0); // ✅ PAQUETES
    const precioCompra = Number(prod.precioCompra || 0);

    const ivaPct = Number(prod.subida || 0);
    const icuPct = Number(prod.descuento || 0);

    const base = precioCompra * paquetes;
    const iva = (base * ivaPct) / 100;
    const icu = (base * icuPct) / 100;

    return base + iva + icu;
  };

  const total = useMemo(
    () => productos.reduce((acc, p) => acc + calcularSubtotal(p), 0),
    [productos]
  );

  // =========================
  // ✅ Modal paquetes: abrir al seleccionar producto
  // =========================
  const abrirModalPaquetesProducto = (productoEncontrado) => {
    setProductoPackPendiente(productoEncontrado);

    setPackForm({
      cantidad: "",
      unidadesPorPaquete: "",
      selectedIndex: 0,
      paquetes: [],
    });

    setPackTouched({});
    setPackErrors({});
    setIsPackModalOpen(true);
  };

  const cancelarModalPaquetes = () => {
    setIsPackModalOpen(false);
    setProductoPackPendiente(null);
    setPackTouched({});
    setPackErrors({});
  };

  const guardarModalPaquetesYAgregar = () => {
    if (!productoPackPendiente) return;

    setPackTouched((prev) => ({
      ...prev,
      cantidad: true,
      unidadesPorPaquete: true,
      ...packForm.paquetes.reduce((acc, _p, idx) => {
        acc[`${idx}.codigoBarrasIngreso`] = true;
        acc[`${idx}.fechaVencimiento`] = true;
        return acc;
      }, {}),
    }));

    const normalized = {
      ...packForm,
      cantidad: packForm.cantidad === "" ? "0" : packForm.cantidad,
      unidadesPorPaquete: packForm.unidadesPorPaquete === "" ? "0" : packForm.unidadesPorPaquete,
    };

    const errs = computePackErrors(normalized);
    setPackErrors(errs);
    if (packHasErrors(errs)) return;

    const cantidadPaquetesNum = toNonNegIntFromString(normalized.cantidad);
    const unidadesPorPaqueteNum = toNonNegIntFromString(normalized.unidadesPorPaquete);
    const totalUnidades = cantidadPaquetesNum * unidadesPorPaqueteNum;

    const paquetesNormalized = normalized.paquetes.map((p) => ({
      codigoBarrasIngreso: String(p.codigoBarrasIngreso || "").trim(),
      fechaVencimiento: p.fechaVencimiento || "",
    }));

    const enriched = {
      ...productoPackPendiente,

      cantidadPaquetes: String(cantidadPaquetesNum),
      unidadesPorPaquete: String(unidadesPorPaqueteNum),
      cantidadTotalUnidades: String(totalUnidades),

      // ✅ LO PRINCIPAL (para cálculos): PAQUETES
      cantidad: String(cantidadPaquetesNum),

      // ✅ IMPORTANTÍSIMO: mandar paquetes[] al backend
      paquetes: paquetesNormalized,

      // compat: paquete “principal”
      codigoBarrasIngreso: String(
        paquetesNormalized[normalized.selectedIndex]?.codigoBarrasIngreso ||
          paquetesNormalized[0]?.codigoBarrasIngreso ||
          ""
      ).trim(),
      fechaVencimiento:
        paquetesNormalized[normalized.selectedIndex]?.fechaVencimiento ||
        paquetesNormalized[0]?.fechaVencimiento ||
        "",
    };

    setIsPackModalOpen(false);
    setProductoPackPendiente(null);
    agregarProducto(enriched);
  };

  // =========================
  // ✅ Editar desde tabla
  // =========================
  const abrirPackEditDesdeTabla = (prod, index) => {
    const cantPaquetes = Math.max(0, Number(prod?.cantidadPaquetes ?? prod?.cantidad ?? 0));
    const unid = Math.max(0, Number(prod?.unidadesPorPaquete ?? 0));

    const base =
      Array.isArray(prod?.paquetes) && prod.paquetes.length
        ? prod.paquetes.map((p) => ({
            codigoBarrasIngreso: String(p?.codigoBarrasIngreso ?? ""),
            fechaVencimiento: p?.fechaVencimiento || "",
          }))
        : [];

    setPackEditIndex(index);

    setPackForm({
      cantidad: String(cantPaquetes),
      unidadesPorPaquete: String(unid),
      selectedIndex: 0,
      paquetes: syncPaquetesLength(base, cantPaquetes, ""),
    });

    setPackTouched({});
    setPackErrors({});
    setIsPackEditOpen(true);
  };

  const cancelarPackEdit = () => {
    setIsPackEditOpen(false);
    setPackEditIndex(null);
    setPackTouched({});
    setPackErrors({});
  };

  const guardarPackEdit = () => {
    if (packEditIndex == null) return;

    setPackTouched((prev) => ({
      ...prev,
      cantidad: true,
      unidadesPorPaquete: true,
      ...packForm.paquetes.reduce((acc, _p, idx) => {
        acc[`${idx}.codigoBarrasIngreso`] = true;
        acc[`${idx}.fechaVencimiento`] = true;
        return acc;
      }, {}),
    }));

    const normalized = {
      ...packForm,
      cantidad: packForm.cantidad === "" ? "0" : packForm.cantidad,
      unidadesPorPaquete: packForm.unidadesPorPaquete === "" ? "0" : packForm.unidadesPorPaquete,
    };

    const errs = computePackErrors(normalized);
    setPackErrors(errs);
    if (packHasErrors(errs)) return;

    const cantidadPaquetesNum = toNonNegIntFromString(normalized.cantidad);
    const unidadesPorPaqueteNum = toNonNegIntFromString(normalized.unidadesPorPaquete);
    const totalUnidades = cantidadPaquetesNum * unidadesPorPaqueteNum;

    setProductos((prev) => {
      const copia = [...prev];
      const actual = copia[packEditIndex];

      const paquetesNormalized = normalized.paquetes.map((p) => ({
        codigoBarrasIngreso: String(p.codigoBarrasIngreso || "").trim(),
        fechaVencimiento: p.fechaVencimiento || "",
      }));

      const paquetes = syncPaquetesLength(paquetesNormalized, cantidadPaquetesNum, "");

      copia[packEditIndex] = {
        ...actual,

        cantidadPaquetes: String(cantidadPaquetesNum),
        unidadesPorPaquete: String(unidadesPorPaqueteNum),
        cantidadTotalUnidades: String(totalUnidades),

        // ✅ principal
        cantidad: String(cantidadPaquetesNum),

        // ✅ IMPORTANTÍSIMO: mantener paquetes[]
        paquetes,

        codigoBarrasIngreso:
          paquetes[normalized.selectedIndex]?.codigoBarrasIngreso ||
          paquetes[0]?.codigoBarrasIngreso ||
          "",
        fechaVencimiento:
          paquetes[normalized.selectedIndex]?.fechaVencimiento ||
          paquetes[0]?.fechaVencimiento ||
          "",
      };

      return copia;
    });

    setIsPackEditOpen(false);
    setPackEditIndex(null);
  };

  // =========================
  // Agregar producto
  // =========================
  const agregarProducto = (productoEncontrado) => {
    const id = String(
      productoEncontrado?.id_producto ??
        productoEncontrado?.id ??
        getProductoId(productoEncontrado)
    );

    if (id && selectedProductIds.has(String(id))) {
      // ✅ (opcional) Swal parecido a ventas
      Swal.fire({
        icon: "warning",
        title: "Cuidado",
        text: "Este producto ya fue agregado.",
        confirmButtonColor: "#16a34a",
      });

      setMensajeProducto({ tipo: "error", texto: "⚠️ Este producto ya fue agregado." });
      setProductoQuery("");
      setIsProdOpen(false);
      setProdActiveIndex(-1);
      return;
    }

    const cantPaquetesNum = Math.max(
      0,
      Number(productoEncontrado?.cantidadPaquetes ?? productoEncontrado?.cantidad ?? 0)
    );
    const unidNum = Math.max(0, Number(productoEncontrado?.unidadesPorPaquete ?? 0));
    const totalUnidades = cantPaquetesNum * unidNum;

    const paquetesSafe = Array.isArray(productoEncontrado?.paquetes)
      ? syncPaquetesLength(
          productoEncontrado.paquetes.map((p) => ({
            codigoBarrasIngreso: String(p?.codigoBarrasIngreso ?? ""),
            fechaVencimiento: p?.fechaVencimiento || "",
          })),
          cantPaquetesNum,
          ""
        )
      : syncPaquetesLength([], cantPaquetesNum, "");

    setProductos((prev) => [
      ...prev,
      {
        ...productoEncontrado,
        productoId: id,

        // ✅ lo principal: PAQUETES
        cantidad: String(cantPaquetesNum),
        cantidadPaquetes: String(cantPaquetesNum),

        // ✅ NUEVO
        unidadesPorPaquete: String(unidNum),
        cantidadTotalUnidades: String(totalUnidades),

        subida: "0",
        descuento: "0",
        precioCompra: String(Number(productoEncontrado.precio ?? 0)),

        // ✅ precio venta editable
        precioVenta: String(Number(productoEncontrado.precioVenta ?? 0)),

        // compat
        codigoBarrasIngreso: productoEncontrado.codigoBarrasIngreso ?? "",
        fechaVencimiento: productoEncontrado.fechaVencimiento ?? "",

        // ✅ paquetes
        paquetes: paquetesSafe,
      },
    ]);

    setMensajeProducto({ tipo: "ok", texto: `✅ Producto agregado: ${productoEncontrado.nombre}` });

    setProductoQuery("");
    setIsProdOpen(false);
    setProdActiveIndex(-1);
  };

  // =========================
  // Producto creado desde modal => abrir formulario paquetes
  // =========================
  const onProductoCreado = (created) => {
    const id_producto = created?.id_producto ?? created?.id ?? created?.ID ?? null;

    const mapped = {
      ...created,
      id_producto,
      productoId: String(id_producto ?? created?.id_detalle_producto ?? created?.id ?? ""),
      codigo: created?.codigo != null ? String(created.codigo) : "",
      nombre: created?.nombre ?? created?.productos?.nombre ?? "",
      precio: Number(created?.precio ?? created?.precio_compra ?? created?.costo ?? 0) || 0,
      precioVenta:
        Number(
          created?.precio_venta ??
            created?.precioVenta ??
            created?.precio_publico ??
            created?.precio_lista ??
            created?.valor_venta ??
            0
        ) || 0,
      stock: getStock(created),
      codigoBarras: getCodigoBarras(created),
    };

    setIsProductModalOpen(false);
    abrirModalPaquetesProducto(mapped);
  };

  // =========================
  // Cerrar dropdown al click afuera
  // =========================
  useEffect(() => {
    const onDocClick = (e) => {
      if (provWrapRef.current && !provWrapRef.current.contains(e.target)) {
        setIsProvOpen(false);
        setProvActiveIndex(-1);
      }
      if (prodWrapRef.current && !prodWrapRef.current.contains(e.target)) {
        setIsProdOpen(false);
        setProdActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // =========================
  // Teclas proveedor
  // =========================
  const onProveedorKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsProvOpen(false);
      setProvActiveIndex(-1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsProvOpen(true);
      setProvActiveIndex((prev) => Math.min(prev + 1, proveedoresFiltrados.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setProvActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      if (isProvOpen && provActiveIndex >= 0 && proveedoresFiltrados[provActiveIndex]) {
        e.preventDefault();
        seleccionarProveedor(proveedoresFiltrados[provActiveIndex]);
        return;
      }

      const val = proveedorQuery.trim();
      if (!val) return;

      const exacto = proveedoresDB.find((p) => p.nit === val);
      if (exacto) seleccionarProveedor(exacto);
      else {
        setMensajeProveedor({
          tipo: "error",
          texto: "❌ Proveedor no encontrado. Selecciónalo de la lista o créalo.",
        });

        // ✅ Swal igual a ventas (opcional)
        Swal.fire({
          icon: "error",
          title: "Proveedor no encontrado",
          text: "Selecciónalo de la lista o créalo.",
          confirmButtonColor: "#16a34a",
        });
      }
    }
  };

  // =========================
  // Teclas producto
  // =========================
  const onProductoKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsProdOpen(false);
      setProdActiveIndex(-1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsProdOpen(true);
      setProdActiveIndex((prev) => Math.min(prev + 1, productosFiltrados.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setProdActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();

      if (isProdOpen && prodActiveIndex >= 0 && productosFiltrados[prodActiveIndex]) {
        abrirModalPaquetesProducto(productosFiltrados[prodActiveIndex]);
        return;
      }

      if (productosFiltrados.length > 0) abrirModalPaquetesProducto(productosFiltrados[0]);
      else {
        setMensajeProducto({
          tipo: "error",
          texto: "❌ Producto no encontrado. Selecciónalo de la lista o regístralo.",
        });

        // ✅ Swal igual a ventas (opcional)
        Swal.fire({
          icon: "error",
          title: "Producto no encontrado",
          text: "Selecciónalo de la lista o regístralo.",
          confirmButtonColor: "#16a34a",
        });
      }
    }
  };

  // =========================
  // ✅ Generar número de factura: 001..999 (solo UI local)
  // =========================
  const generarNumeroFactura = () => {
    const facturas = JSON.parse(localStorage.getItem("facturas")) || [];

    const ultimoNumero = facturas.length
      ? Math.max(...facturas.map((f) => Number(f.num_factura || 0)))
      : 0;

    const siguiente = ultimoNumero + 1;

    if (siguiente > 999) {
      // ✅ Swal igual a ventas
      Swal.fire({
        icon: "warning",
        title: "Cuidado",
        text: "Se alcanzó el límite de numeración de facturas (999).",
        confirmButtonColor: "#16a34a",
      });

      setMensajeComprobante({
        tipo: "error",
        texto: "⚠️ Se alcanzó el límite de numeración de facturas (999)",
      });
      return null;
    }

    return String(siguiente).padStart(3, "0");
  };

  // =========================
  // ✅ Comprobante (validación + alerta estilo ventas)
  // =========================
  const validarComprobante = async (file) => {
    if (!file) {
      await Swal.fire({
        icon: "warning",
        title: "Cuidado",
        text: "Debe subir el comprobante original de la compra.",
        confirmButtonColor: "#16a34a",
      });

      setMensajeComprobante({
        tipo: "error",
        texto: "⚠️ Debe subir el comprobante original de la compra",
      });
      return false;
    }

    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (!allowed.includes(file.type)) {
      await Swal.fire({
        icon: "warning",
        title: "Formato no válido",
        text: "Sube PDF o imagen (JPG/PNG/WebP).",
        confirmButtonColor: "#16a34a",
      });

      setMensajeComprobante({
        tipo: "error",
        texto: "⚠️ Formato no válido. Sube PDF o imagen (JPG/PNG/WebP).",
      });
      return false;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      await Swal.fire({
        icon: "warning",
        title: "Archivo muy grande",
        text: "Máximo 5MB.",
        confirmButtonColor: "#16a34a",
      });

      setMensajeComprobante({
        tipo: "error",
        texto: "⚠️ El archivo es muy grande. Máximo 5MB.",
      });
      return false;
    }

    setMensajeComprobante({
      tipo: "ok",
      texto: `✅ Comprobante cargado: ${file.name}`,
    });
    return true;
  };

  const handleComprobanteUpload = async (e) => {
    const file = e.target.files?.[0] || null;
    setComprobante(file);
    await validarComprobante(file);
  };

  // =========================
  // ✅ Finalizar compra (FRONT) con Swal (igual a ventas)
  // =========================
  const handleFinalizarCompra = async () => {
    if (isRegistrandoCompra) return;

    setMensajeComprobante(null);

    if (!proveedor) {
      await Swal.fire({
        icon: "warning",
        title: "Cuidado",
        text: "Debe seleccionar un proveedor.",
        confirmButtonColor: "#16a34a",
      });
      setMensajeProveedor({ tipo: "error", texto: "⚠️ Debe seleccionar un proveedor" });
      return;
    }

    if (productos.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Cuidado",
        text: "Debe agregar al menos un producto.",
        confirmButtonColor: "#16a34a",
      });
      setMensajeProducto({ tipo: "error", texto: "⚠️ Debe agregar al menos un producto" });
      return;
    }

    // ✅ VALIDAR: cada producto debe tener paquetes y unid/paq
    for (const p of productos) {
      const cantPaquetes = Number(p.cantidadPaquetes ?? p.cantidad ?? 0);
      const unid = Number(p.unidadesPorPaquete ?? 0);
      const packs = Array.isArray(p.paquetes) ? p.paquetes : [];

      if (!cantPaquetes || cantPaquetes <= 0) {
        await Swal.fire({
          icon: "warning",
          title: "Cuidado",
          text: `Revisa "${p.nombre}": faltan paquetes.`,
          confirmButtonColor: "#16a34a",
        });
        setMensajeProducto({ tipo: "error", texto: `⚠️ Revisa "${p.nombre}": faltan paquetes.` });
        return;
      }
      if (!unid || unid <= 0) {
        await Swal.fire({
          icon: "warning",
          title: "Cuidado",
          text: `Revisa "${p.nombre}": faltan unidades por paquete.`,
          confirmButtonColor: "#16a34a",
        });
        setMensajeProducto({
          tipo: "error",
          texto: `⚠️ Revisa "${p.nombre}": faltan unidades por paquete.`,
        });
        return;
      }
      if (packs.length !== cantPaquetes) {
        await Swal.fire({
          icon: "warning",
          title: "Cuidado",
          text: `Revisa "${p.nombre}": la lista de paquetes no coincide con la cantidad.`,
          confirmButtonColor: "#16a34a",
        });
        setMensajeProducto({
          tipo: "error",
          texto: `⚠️ Revisa "${p.nombre}": la lista de paquetes no coincide con la cantidad.`,
        });
        return;
      }

    }

    // ✅ comprobante debe ser válido
    if (!(await validarComprobante(comprobante))) return;

    const num = generarNumeroFactura();
    if (!num) return;
    setNumFactura(num);

    // ✅ payload JSON (sin enviar el file aquí; el file va en FormData aparte)
    const payload = {
      fecha_compra: fechaFactura.toISOString(),
      id_proveedor: Number(proveedor.id_proveedor ?? proveedor.id),

      comprobante: comprobante
        ? {
            url: null,
            nombre: comprobante.name,
            mime: comprobante.type,
            size: comprobante.size,
          }
        : null,

      items: productos.map((p) => {
        const cantPaquetes = Number(p.cantidadPaquetes ?? p.cantidad ?? 0);
        const unid = Number(p.unidadesPorPaquete ?? 0);
        const totalUnid = cantPaquetes * unid;

        return {
          id_producto: Number(p.id_producto ?? p.productoId),

          // ✅ paquetes
          cantidad: cantPaquetes,

          // ✅ NUEVO
          cantidad_paquetes: cantPaquetes,
          unidades_por_paquete: unid,
          cantidad_total_unidades: totalUnid,

          precio_unitario: Number(p.precioCompra),
          precio_venta: Number(p.precioVenta ?? 0),
          iva_porcentaje: Number(p.subida ?? 0),
          icu_porcentaje: Number(p.descuento ?? 0),

          // ✅ lista paquetes
          paquetes: Array.isArray(p.paquetes)
            ? p.paquetes.map((x) => ({
                codigoBarrasIngreso: String(x.codigoBarrasIngreso || "").trim(),
                fechaVencimiento: x.fechaVencimiento ? x.fechaVencimiento : null,
              }))
            : [],

          // ✅ compat
          codigo_barras_producto_compra: String(p.codigoBarrasIngreso ?? "").trim(),
          fecha_vencimiento: p.fechaVencimiento ? p.fechaVencimiento : null,
        };
      }),
    };

    setIsRegistrandoCompra(true);

    // ✅ Swal loading igual a ventas
    Swal.fire({
      title: "Registrando compra...",
      text: "Por favor espera",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      if (comprobante) formData.append("comprobante", comprobante);

      const resp = await fetch("http://localhost:3000/kajamart/api/purchase", {
        method: "POST",
        body: formData,
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        const msg = data?.message || data?.error || "Error al registrar la compra (backend).";
        Swal.close();

        await Swal.fire({
          icon: "error",
          title: "No se pudo registrar",
          text: msg,
          confirmButtonColor: "#16a34a",
        });

        setMensajeComprobante({ tipo: "error", texto: `❌ ${msg}` });
        return;
      }

      Swal.close();

      // ✅ Swal success igual a ventas
      Swal.fire({
        icon: "success",
        title: "Compra registrada",
        text: "✅ La compra se registró correctamente.",
        timer: 1200,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        timerProgressBar: true,
      });

      setMensajeComprobante({
        tipo: "ok",
        texto: "✅ Compra registrada correctamente en el sistema",
      });

      const facturasGuardadas = JSON.parse(localStorage.getItem("facturas")) || [];
      facturasGuardadas.push({
        num_factura: num,
        fecha_registro: fechaFactura.toISOString(),
        valor_factura: total,
        id_compra: data?.compra?.id_compra ?? null,
      });
      localStorage.setItem("facturas", JSON.stringify(facturasGuardadas));

      navigate("/app/purchases");
    } catch (err) {
      Swal.close();

      await Swal.fire({
        icon: "error",
        title: "No se pudo registrar",
        text: "No se pudo conectar con el servidor. Revisa que el backend esté corriendo.",
        confirmButtonColor: "#16a34a",
      });

      setMensajeComprobante({
        tipo: "error",
        texto: "❌ No se pudo conectar con el servidor. Revisa que el backend esté corriendo.",
      });
    } finally {
      setIsRegistrandoCompra(false);
    }
  };

  // =========================
  // Errores de carga
  // =========================
  if (isSuppliersError) {
    const msg =
      suppliersError?.response?.data?.message ||
      suppliersError?.message ||
      "Error al cargar proveedores.";
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-600 text-center">{msg}</p>
      </div>
    );
  }

  if (isProductsError) {
    const msg =
      productsError?.response?.data?.message ||
      productsError?.message ||
      "Error al cargar productos.";
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-600 text-center">{msg}</p>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="relative z-10 min-h-screen flex flex-col p-6">
      {/* ✅ Overrides SOLO desde este archivo */}
      <style>{`
        .purchase-modal-open .z-\\[55\\] { z-index: 9999 !important; }
        .purchase-modal-open aside,
        .purchase-modal-open #sidebar,
        .purchase-modal-open .sidebar,
        .purchase-modal-open [data-sidebar] {
          opacity: 1 !important;
          pointer-events: none !important;
          z-index: 0 !important;
        }
        .purchase-supplier-open .z-\\[55\\] {
          padding-top: 10px !important;
          align-items: flex-start !important;
        }
        @media (min-width: 640px) {
          .purchase-supplier-open .z-\\[55\\] { padding-top: 14px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-semibold">Registro de Compras</h2>
        <p className="text-sm text-gray-500 mt-1">
          Completa la información para registrar una nueva compra
        </p>

        {numFactura && (
          <p className="mt-2 text-sm">
            N° Factura generado:{" "}
            <span className="font-bold text-green-700">{numFactura}</span>
          </p>
        )}
      </div>

      {/* Buscar proveedor */}
      <div className="mb-4 relative" ref={provWrapRef}>
        <label className="block text-sm text-gray-600 mb-1">Buscar Proveedor</label>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={proveedorQuery}
            onChange={(e) => {
              const val = e.target.value;
              setProveedorQuery(val);
              setIsProvOpen(true);

              if (!val.trim()) {
                setProveedor(null);
                setMensajeProveedor(null);
                setIsProvOpen(false);
                return;
              }

              const exacto = proveedoresDB.find((p) => p.nit === val.trim());
              if (exacto) seleccionarProveedor(exacto);
              else {
                setProveedor(null);
                setMensajeProveedor({
                  tipo: "error",
                  texto: "❌ Proveedor no encontrado. Selecciónalo de la lista o créalo.",
                });
              }
            }}
            onFocus={() => {
              if (proveedorQuery.trim()) setIsProvOpen(true);
            }}
            onKeyDown={onProveedorKeyDown}
            placeholder={isSuppliersLoading ? "Cargando proveedores..." : "Ingrese NIT o nombre"}
            disabled={isSuppliersLoading || isRegistrandoCompra}
            className="flex-1 border rounded px-3 py-2 bg-white text-black disabled:opacity-60"
          />

          {mensajeProveedor?.tipo === "error" && (
            <button
              onClick={() => {
                prevSupplierIdsRef.current = new Set(
                  proveedoresDB.map((p) => String(p.id_proveedor ?? p.nit ?? ""))
                );
                pendingAutoSelectSupplierRef.current = true;
                window.scrollTo({ top: 0, behavior: "auto" });
                setIsSupplierModalOpen(true);
              }}
              disabled={isRegistrandoCompra}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
              type="button"
            >
              Registrar Proveedor
            </button>
          )}
        </div>

        {isProvOpen && proveedoresFiltrados.length > 0 && !proveedor && (
          <div className="absolute z-20 mt-2 w-full bg-white border rounded shadow overflow-hidden">
            {proveedoresFiltrados.map((p, idx) => (
              <button
                key={p.id_proveedor ?? p.nit ?? idx}
                type="button"
                onMouseEnter={() => setProvActiveIndex(idx)}
                onClick={() => seleccionarProveedor(p)}
                className={`w-full text-left px-3 py-2 ${
                  idx === provActiveIndex ? "bg-gray-100" : "hover:bg-gray-100"
                }`}
              >
                <span className="font-medium text-gray-900">{p.nombre}</span>{" "}
                <span className="text-gray-500 text-sm">({p.nit})</span>
              </button>
            ))}
          </div>
        )}

        {mensajeProveedor && (
          <p
            className={`mt-1 text-sm ${
              mensajeProveedor.tipo === "ok" ? "text-green-600" : "text-red-600"
            }`}
          >
            {mensajeProveedor.texto}
          </p>
        )}
      </div>

      {/* Buscar producto */}
      <div className="mb-4 relative" ref={prodWrapRef}>
        <label className="block text-sm text-gray-600 mb-1">Buscar Producto</label>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={productoQuery}
            onChange={(e) => {
              const val = e.target.value;
              setProductoQuery(val);
              setIsProdOpen(true);

              if (!val.trim()) {
                setMensajeProducto(null);
                setIsProdOpen(false);
                setProdActiveIndex(-1);
                return;
              }

              const q = normalizeText(val);
              const hay = productosDB.some((p) => {
                const match =
                  normalizeText(p.codigo).includes(q) ||
                  normalizeText(p.nombre).includes(q) ||
                  normalizeText(p.codigoBarras).includes(q);
                if (!match) return false;
                const id = getProductoId(p);
                if (!id) return true;
                return !selectedProductIds.has(String(id));
              });

              if (!hay) {
                setMensajeProducto({
                  tipo: "error",
                  texto: "❌ Producto no encontrado. Selecciónalo de la lista o regístralo.",
                });
              } else {
                setMensajeProducto(null);
              }

              setProdActiveIndex(-1);
            }}
            onFocus={() => {
              if (productoQuery.trim()) setIsProdOpen(true);
            }}
            onKeyDown={onProductoKeyDown}
            placeholder={isProductsLoading ? "Cargando productos..." : "Ingrese código, barras o nombre"}
            disabled={isProductsLoading || isRegistrandoCompra}
            className="flex-1 border rounded px-3 py-2 bg-white text-black disabled:opacity-60"
          />

          {mensajeProducto?.tipo === "error" && (
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "auto" });
                setIsProductModalOpen(true);
              }}
              disabled={isRegistrandoCompra}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
              type="button"
            >
              Registrar Producto
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isProdOpen && productosFiltrados.length > 0 && (
          <div className="absolute z-20 mt-2 w-full bg-white border rounded shadow overflow-hidden max-h-56 overflow-auto">
            {productosFiltrados.slice(0, 7).map((p, idx) => {
              const stock = Number(p.stock ?? 0);
              const sinStock = stock <= 0;
              const codigoMostrar = p.codigoBarras || p.codigo || "N/A";

              return (
                <div
                  key={String(getProductoId(p) || codigoMostrar || idx)}
                  onMouseEnter={() => setProdActiveIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    abrirModalPaquetesProducto(p);
                  }}
                  className={`px-3 py-2 text-black ${
                    idx === prodActiveIndex ? "bg-green-50" : "hover:bg-green-50"
                  } cursor-pointer`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>{p.nombre}</div>

                    <span
                      className={`text-[11px] px-2 py-[2px] rounded-full font-semibold ${
                        sinStock ? "bg-red-100 text-red-700" : "bg-green-50 text-green-700"
                      }`}
                    >
                      Stock: {stock}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">Código: {codigoMostrar}</div>
                </div>
              );
            })}
          </div>
        )}

        {mensajeProducto && (
          <p
            className={`mt-1 text-sm ${
              mensajeProducto.tipo === "ok" ? "text-green-600" : "text-red-600"
            }`}
          >
            {mensajeProducto.texto}
          </p>
        )}
      </div>

      {/* Tabla productos */}
      <table className="w-full border-collapse border border-gray-300 mb-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">Nombre</th>
            <th className="border px-3 py-2">Stock</th>
            <th className="border px-3 py-2">Cantidad</th>
            <th className="border px-3 py-2">Iva %</th>
            <th className="border px-3 py-2">Icu %</th>
            <th className="border px-3 py-2">Precio Compra</th>
            <th className="border px-3 py-2">Precio Venta</th>
            <th className="border px-3 py-2">Subtotal</th>
            <th className="border px-3 py-2">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center text-gray-400 py-4">
                No hay productos agregados
              </td>
            </tr>
          ) : (
            productos.map((prod, i) => {
              return (
              <tr key={`${prod.productoId ?? getProductoId(prod)}-${i}`}>
                <td className="border px-3 py-2 text-black">{prod.nombre}</td>

                <td className="border px-3 py-2 text-center text-black">
                  {Number(prod.stock ?? 0)}
                </td>

                {/* ✅ Cantidad principal = PAQUETES */}
                <td className="border px-3 py-2 text-center text-black">
                  <div className="leading-tight">
                    <div className="font-semibold">
                      {Number(prod.cantidadPaquetes ?? prod.cantidad ?? 0)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Number(prod.unidadesPorPaquete ?? 0)} unid/paq
                    </div>
                  </div>
                </td>

                <td className="border px-3 py-2 text-center">
                  <div className="inline-flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={prod.subida}
                      onChange={(e) => {
                        const nueva = [...productos];
                        nueva[i].subida = e.target.value;
                        setProductos(nueva);
                      }}
                      onBlur={() => {
                        const nueva = [...productos];
                        if (nueva[i].subida === "") nueva[i].subida = "0";
                        setProductos(nueva);
                      }}
                      inputMode="decimal"
                      disabled={isRegistrandoCompra}
                      className={
                        "w-16 border rounded-l px-2 py-1 text-center bg-white text-black disabled:opacity-60" +
                        noSpinNumber
                      }
                      style={{ MozAppearance: "textfield" }}
                    />
                    <span className="border border-l-0 rounded-r px-2 py-1 bg-gray-50 text-gray-700">
                      %
                    </span>
                  </div>
                </td>

                <td className="border px-3 py-2 text-center">
                  <div className="inline-flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={prod.descuento}
                      onChange={(e) => {
                        const nueva = [...productos];
                        nueva[i].descuento = e.target.value;
                        setProductos(nueva);
                      }}
                      onBlur={() => {
                        const nueva = [...productos];
                        if (nueva[i].descuento === "") nueva[i].descuento = "0";
                        setProductos(nueva);
                      }}
                      inputMode="decimal"
                      disabled={isRegistrandoCompra}
                      className={
                        "w-16 border rounded-l px-2 py-1 text-center bg-white text-black disabled:opacity-60" +
                        noSpinNumber
                      }
                      style={{ MozAppearance: "textfield" }}
                    />
                    <span className="border border-l-0 rounded-r px-2 py-1 bg-gray-50 text-gray-700">
                      %
                    </span>
                  </div>
                </td>

                <td className="border px-3 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={prod.precioCompra}
                    onChange={(e) => {
                      const nueva = [...productos];
                      nueva[i].precioCompra = e.target.value;
                      setProductos(nueva);
                    }}
                    onBlur={() => {
                      const nueva = [...productos];
                      if (nueva[i].precioCompra === "") nueva[i].precioCompra = "0";
                      setProductos(nueva);
                    }}
                    disabled={isRegistrandoCompra}
                    className="w-24 border rounded px-2 py-1 text-center bg-white text-black disabled:opacity-60"
                  />
                </td>

                <td className="border px-3 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={prod.precioVenta}
                    onChange={(e) => {
                      const nueva = [...productos];
                      nueva[i].precioVenta = e.target.value;
                      setProductos(nueva);
                    }}
                    onBlur={() => {
                      const nueva = [...productos];
                      if (nueva[i].precioVenta === "") nueva[i].precioVenta = "0";
                      setProductos(nueva);
                    }}
                    disabled={isRegistrandoCompra}
                    className="w-24 border rounded px-2 py-1 text-center bg-white text-black disabled:opacity-60"
                  />
                </td>

                <td className="border px-3 py-2 text-center text-black">
                  ${calcularSubtotal(prod).toLocaleString("es-CO")}
                </td>

                <td className="border px-3 py-2">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => abrirPackEditDesdeTabla(prod, i)}
                      title="Ver / editar paquetes"
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-60"
                      type="button"
                      disabled={isRegistrandoCompra}
                    >
                      <FiEdit size={18} />
                    </button>

                    <button
                      onClick={() => setProductos(productos.filter((_, idx) => idx !== i))}
                      title="Eliminar"
                      className="text-red-600 hover:text-red-800 disabled:opacity-60"
                      type="button"
                      disabled={isRegistrandoCompra}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
            })
          )}
        </tbody>
      </table>

      {/* Comprobante + total */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">Subir comprobante original</label>

          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleComprobanteUpload}
            disabled={isRegistrandoCompra}
          />

          {mensajeComprobante && (
            <p
              className={`mt-1 text-sm ${
                mensajeComprobante.tipo === "ok"
                  ? "text-green-600"
                  : mensajeComprobante.tipo === "info"
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {mensajeComprobante.texto}
            </p>
          )}
        </div>

        <div className="text-right bg-gray-100 px-4 py-2 rounded shadow-md">
          <p className="text-sm text-gray-600">Total a pagar</p>
          <p className="text-2xl font-bold text-green-700">${total.toLocaleString("es-CO")}</p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={() => navigate("/app/purchases")}
          className="px-4 py-2 rounded bg-gray-500 text-white disabled:opacity-60"
          type="button"
          disabled={isRegistrandoCompra}
        >
          Cancelar
        </button>

        <button
          onClick={handleFinalizarCompra}
          disabled={isRegistrandoCompra}
          className={`px-4 py-2 rounded text-white ${
            isRegistrandoCompra ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
          type="button"
        >
          {isRegistrandoCompra ? "Registrando..." : "Finalizar Compra"}
        </button>
      </div>

      {/* =========================
          MODAL PAQUETES (AGREGAR)
         ========================= */}
      {isPackModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">Datos del producto</h3>
            <p className="text-sm text-gray-500 mb-3">
              Completa la información antes de agregarlo a la compra
            </p>

            {/* Paquetes + Unid/paq */}
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">Cantidad</label>

              <div className="grid grid-cols-2 gap-2">
                {/* Paquetes */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Paquetes</label>
                  <input
                    type="number"
                    min="0"
                    value={packForm.cantidad}
                    onChange={(e) => {
                      const raw = e.target.value;

                      setPackForm((prev) => {
                        if (raw === "") return { ...prev, cantidad: "", paquetes: [], selectedIndex: 0 };

                        const n = Math.max(0, Math.floor(Number(raw || 0)));

                        const fallbackBarcode =
                          productoPackPendiente?.codigoBarras ??
                          getCodigoBarras(productoPackPendiente) ??
                          "";

                        const paquetes = syncPaquetesLength(prev.paquetes, n, fallbackBarcode);
                        const sel = Math.max(
                          0,
                          Math.min(prev.selectedIndex, Math.max(0, paquetes.length - 1))
                        );

                        return { ...prev, cantidad: String(n), paquetes, selectedIndex: sel };
                      });

                      setPackErrors({});
                    }}
                    onBlur={() => {
                      setPackTouched((t) => ({ ...t, cantidad: true }));
                      const normalized = {
                        ...packForm,
                        cantidad: packForm.cantidad === "" ? "0" : packForm.cantidad,
                        unidadesPorPaquete:
                          packForm.unidadesPorPaquete === "" ? "0" : packForm.unidadesPorPaquete,
                      };
                      setPackErrors(computePackErrors(normalized));
                    }}
                    className={`w-full border rounded px-3 py-2 bg-white text-black outline-none ${
                      packTouched.cantidad && packErrors.cantidad ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {packTouched.cantidad && packErrors.cantidad && (
                    <p className="mt-1 text-xs text-red-600">{packErrors.cantidad}</p>
                  )}
                </div>

                {/* Unid/paq */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Unid/paquete</label>
                  <input
                    type="number"
                    min="0"
                    value={packForm.unidadesPorPaquete}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setPackForm((prev) => {
                        if (raw === "") return { ...prev, unidadesPorPaquete: "" };
                        const n = Math.max(0, Math.floor(Number(raw || 0)));
                        return { ...prev, unidadesPorPaquete: String(n) };
                      });
                      setPackErrors({});
                    }}
                    onBlur={() => {
                      setPackTouched((t) => ({ ...t, unidadesPorPaquete: true }));
                      const normalized = {
                        ...packForm,
                        cantidad: packForm.cantidad === "" ? "0" : packForm.cantidad,
                        unidadesPorPaquete:
                          packForm.unidadesPorPaquete === "" ? "0" : packForm.unidadesPorPaquete,
                      };
                      setPackErrors(computePackErrors(normalized));
                    }}
                    className={`w-full border rounded px-3 py-2 bg-white text-black outline-none ${
                      packTouched.unidadesPorPaquete && packErrors.unidadesPorPaquete
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {packTouched.unidadesPorPaquete && packErrors.unidadesPorPaquete && (
                    <p className="mt-1 text-xs text-red-600">{packErrors.unidadesPorPaquete}</p>
                  )}
                </div>
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Total unidades (informativo): <b>{getTotalUnidadesFromForm(packForm)}</b>
              </p>
            </div>

            {/* Códigos de barras */}
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm text-gray-600 mb-1">Códigos de barras</label>
                <span className="text-xs text-gray-500">
                  Editando:{" "}
                  <b>Paquete {packForm.paquetes.length ? packForm.selectedIndex + 1 : 0}</b> de{" "}
                  <b>{packForm.paquetes.length}</b>
                </span>
              </div>

              <select
                value={packForm.selectedIndex}
                onChange={(e) => onSelectPaquete(e.target.value)}
                disabled={packForm.paquetes.length === 0}
                className="w-full border rounded px-3 py-2 bg-white text-black mb-2 disabled:opacity-60"
              >
                {packForm.paquetes.map((p, idx) => (
                  <option key={`sel-add-${idx}`} value={idx}>
                    {makePackLabel(p, idx)}
                  </option>
                ))}
              </select>

              <input
                type="text"
                inputMode="numeric"
                maxLength={13}
                disabled={packForm.paquetes.length === 0}
                value={packForm.paquetes?.[packForm.selectedIndex]?.codigoBarrasIngreso || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 13);

                  setPackForm((prev) => {
                    const paquetes = [...prev.paquetes];
                    if (!paquetes.length) return prev;
                    paquetes[prev.selectedIndex] = {
                      ...paquetes[prev.selectedIndex],
                      codigoBarrasIngreso: value,
                    };
                    return { ...prev, paquetes };
                  });
                }}
                onBlur={() => {
                  const key = `${packForm.selectedIndex}.codigoBarrasIngreso`;
                  setPackTouched((t) => ({ ...t, [key]: true }));
                  const normalized = {
                    ...packForm,
                    cantidad: packForm.cantidad === "" ? "0" : packForm.cantidad,
                    unidadesPorPaquete:
                      packForm.unidadesPorPaquete === "" ? "0" : packForm.unidadesPorPaquete,
                  };
                  setPackErrors(computePackErrors(normalized));
                }}
                className={`w-full border rounded px-3 py-2 bg-white text-black outline-none disabled:opacity-60 ${
                  packTouched[`${packForm.selectedIndex}.codigoBarrasIngreso`] &&
                  packErrors[`${packForm.selectedIndex}.codigoBarrasIngreso`]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder={
                  packForm.paquetes.length ? "Ej: 7701234567890" : "Primero ingresa cantidad de paquetes"
                }
              />

              {packTouched[`${packForm.selectedIndex}.codigoBarrasIngreso`] &&
                packErrors[`${packForm.selectedIndex}.codigoBarrasIngreso`] && (
                  <p className="mt-1 text-xs text-red-600">
                    {packErrors[`${packForm.selectedIndex}.codigoBarrasIngreso`]}
                  </p>
                )}

              {(packErrors.req || packErrors.dup) && (
                <p className="mt-2 text-xs text-red-600">{packErrors.req || packErrors.dup}</p>
              )}
            </div>

            {/* Fecha vencimiento */}
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">
                Fecha de vencimiento <span className="text-xs text-gray-400">(opcional)</span>
              </label>
              <input
                type="date"
                min={minExpiryDateStr}
                disabled={packForm.paquetes.length === 0}
                value={packForm.paquetes?.[packForm.selectedIndex]?.fechaVencimiento || ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setPackForm((prev) => {
                    const paquetes = [...prev.paquetes];
                    if (!paquetes.length) return prev;
                    paquetes[prev.selectedIndex] = {
                      ...paquetes[prev.selectedIndex],
                      fechaVencimiento: v,
                    };
                    return { ...prev, paquetes };
                  });
                }}
                onBlur={() => {
                  const key = `${packForm.selectedIndex}.fechaVencimiento`;
                  setPackTouched((t) => ({ ...t, [key]: true }));
                  const normalized = {
                    ...packForm,
                    cantidad: packForm.cantidad === "" ? "0" : packForm.cantidad,
                    unidadesPorPaquete:
                      packForm.unidadesPorPaquete === "" ? "0" : packForm.unidadesPorPaquete,
                  };
                  setPackErrors(computePackErrors(normalized));
                }}
                className={`w-full border rounded px-3 py-2 bg-white text-black outline-none disabled:opacity-60 ${
                  packTouched[`${packForm.selectedIndex}.fechaVencimiento`] &&
                  packErrors[`${packForm.selectedIndex}.fechaVencimiento`]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {packTouched[`${packForm.selectedIndex}.fechaVencimiento`] &&
                packErrors[`${packForm.selectedIndex}.fechaVencimiento`] && (
                  <p className="mt-1 text-xs text-red-600">
                    {packErrors[`${packForm.selectedIndex}.fechaVencimiento`]}
                  </p>
                )}
              <p className="mt-1 text-[11px] text-gray-400">
                Permitido desde: <b>{minExpiryDateStr}</b>
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelarModalPaquetes}
                className="px-4 py-2 rounded bg-gray-500 text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarModalPaquetesYAgregar}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          MODAL PAQUETES (EDITAR)
         ========================= */}
      {isPackEditOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">Editar datos del producto</h3>
            <p className="text-sm text-gray-500 mb-3">
              Ajusta paquetes, unid/paq, códigos y vencimiento
            </p>

            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">Cantidad</label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Paquetes</label>
                  <input
                    type="number"
                    min="0"
                    value={packForm.cantidad}
                    onChange={(e) => {
                      const raw = e.target.value;

                      setPackForm((prev) => {
                        if (raw === "") return { ...prev, cantidad: "", paquetes: [], selectedIndex: 0 };

                        const n = Math.max(0, Math.floor(Number(raw || 0)));
                        const paquetes = syncPaquetesLength(prev.paquetes, n, "");
                        const sel = Math.max(
                          0,
                          Math.min(prev.selectedIndex, Math.max(0, paquetes.length - 1))
                        );
                        return { ...prev, cantidad: String(n), paquetes, selectedIndex: sel };
                      });

                      setPackErrors({});
                    }}
                    onBlur={() => {
                      setPackTouched((t) => ({ ...t, cantidad: true }));
                      const normalized = {
                        ...packForm,
                        cantidad: packForm.cantidad === "" ? "0" : packForm.cantidad,
                        unidadesPorPaquete:
                          packForm.unidadesPorPaquete === "" ? "0" : packForm.unidadesPorPaquete,
                      };
                      setPackErrors(computePackErrors(normalized));
                    }}
                    className={`w-full border rounded px-3 py-2 bg-white text-black outline-none ${
                      packTouched.cantidad && packErrors.cantidad ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {packTouched.cantidad && packErrors.cantidad && (
                    <p className="mt-1 text-xs text-red-600">{packErrors.cantidad}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Unid/paquete</label>
                  <input
                    type="number"
                    min="0"
                    value={packForm.unidadesPorPaquete}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setPackForm((prev) => {
                        if (raw === "") return { ...prev, unidadesPorPaquete: "" };
                        const n = Math.max(0, Math.floor(Number(raw || 0)));
                        return { ...prev, unidadesPorPaquete: String(n) };
                      });
                      setPackErrors({});
                    }}
                    onBlur={() => {
                      setPackTouched((t) => ({ ...t, unidadesPorPaquete: true }));
                      const normalized = {
                        ...packForm,
                        cantidad: packForm.cantidad === "" ? "0" : packForm.cantidad,
                        unidadesPorPaquete:
                          packForm.unidadesPorPaquete === "" ? "0" : packForm.unidadesPorPaquete,
                      };
                      setPackErrors(computePackErrors(normalized));
                    }}
                    className={`w-full border rounded px-3 py-2 bg-white text-black outline-none ${
                      packTouched.unidadesPorPaquete && packErrors.unidadesPorPaquete
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {packTouched.unidadesPorPaquete && packErrors.unidadesPorPaquete && (
                    <p className="mt-1 text-xs text-red-600">{packErrors.unidadesPorPaquete}</p>
                  )}
                </div>
              </div>

              <p className="mt-1 text-xs text-gray-500">
                Total unidades (informativo): <b>{getTotalUnidadesFromForm(packForm)}</b>
              </p>
            </div>

            {/* Códigos de barras */}
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm text-gray-600 mb-1">Códigos de barras</label>
                <span className="text-xs text-gray-500">
                  Editando:{" "}
                  <b>Paquete {packForm.paquetes.length ? packForm.selectedIndex + 1 : 0}</b> de{" "}
                  <b>{packForm.paquetes.length}</b>
                </span>
              </div>

              <select
                value={packForm.selectedIndex}
                onChange={(e) => onSelectPaquete(e.target.value)}
                disabled={packForm.paquetes.length === 0}
                className="w-full border rounded px-3 py-2 bg-white text-black mb-2 disabled:opacity-60"
              >
                {packForm.paquetes.map((p, idx) => (
                  <option key={`sel-edit-${idx}`} value={idx}>
                    {makePackLabel(p, idx)}
                  </option>
                ))}
              </select>

              <input
                type="text"
                inputMode="numeric"
                maxLength={13}
                disabled={packForm.paquetes.length === 0}
                value={packForm.paquetes?.[packForm.selectedIndex]?.codigoBarrasIngreso || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 13);

                  setPackForm((prev) => {
                    const paquetes = [...prev.paquetes];
                    if (!paquetes.length) return prev;
                    paquetes[prev.selectedIndex] = {
                      ...paquetes[prev.selectedIndex],
                      codigoBarrasIngreso: value,
                    };
                    return { ...prev, paquetes };
                  });
                }}
                onBlur={() => {
                  const key = `${packForm.selectedIndex}.codigoBarrasIngreso`;
                  setPackTouched((t) => ({ ...t, [key]: true }));
                  const normalized = {
                    ...packForm,
                    cantidad: packForm.cantidad === "" ? "0" : packForm.cantidad,
                    unidadesPorPaquete:
                      packForm.unidadesPorPaquete === "" ? "0" : packForm.unidadesPorPaquete,
                  };
                  setPackErrors(computePackErrors(normalized));
                }}
                className={`w-full border rounded px-3 py-2 bg-white text-black outline-none disabled:opacity-60 ${
                  packTouched[`${packForm.selectedIndex}.codigoBarrasIngreso`] &&
                  packErrors[`${packForm.selectedIndex}.codigoBarrasIngreso`]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              {(packErrors.req || packErrors.dup) && (
                <p className="mt-2 text-xs text-red-600">{packErrors.req || packErrors.dup}</p>
              )}
            </div>

            {/* Fecha vencimiento */}
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">
                Fecha de vencimiento <span className="text-xs text-gray-400">(opcional)</span>
              </label>
              <input
                type="date"
                min={minExpiryDateStr}
                disabled={packForm.paquetes.length === 0}
                value={packForm.paquetes?.[packForm.selectedIndex]?.fechaVencimiento || ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setPackForm((prev) => {
                    const paquetes = [...prev.paquetes];
                    if (!paquetes.length) return prev;
                    paquetes[prev.selectedIndex] = {
                      ...paquetes[prev.selectedIndex],
                      fechaVencimiento: v,
                    };
                    return { ...prev, paquetes };
                  });
                }}
                onBlur={() => {
                  const key = `${packForm.selectedIndex}.fechaVencimiento`;
                  setPackTouched((t) => ({ ...t, [key]: true }));
                  const normalized = {
                    ...packForm,
                    cantidad: packForm.cantidad === "" ? "0" : packForm.cantidad,
                    unidadesPorPaquete:
                      packForm.unidadesPorPaquete === "" ? "0" : packForm.unidadesPorPaquete,
                  };
                  setPackErrors(computePackErrors(normalized));
                }}
                className={`w-full border rounded px-3 py-2 bg-white text-black outline-none disabled:opacity-60 ${
                  packTouched[`${packForm.selectedIndex}.fechaVencimiento`] &&
                  packErrors[`${packForm.selectedIndex}.fechaVencimiento`]
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Permitido desde: <b>{minExpiryDateStr}</b>
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelarPackEdit}
                className="px-4 py-2 rounded bg-gray-500 text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarPackEdit}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          MODALES
         ========================= */}
      <ProductRegisterModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onCreated={onProductoCreado}
      />

      {isSupplierModalOpen && (
        <div className="purchase-supplier-open">
          <SuplliersRegisterModal
            isOpen={isSupplierModalOpen}
            onClose={() => setIsSupplierModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
