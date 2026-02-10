// IndexRegisterPurchase.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductRegisterModal from "../products/productRegisterModal";
import SuplliersRegisterModal from "../suppliers/SuplliersRegisterModal";

// ✅ Iconos (ver / eliminar)
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

  // ✅ Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // ✅ Modal datos extra antes de agregar a la tabla
  const [isExtraProdModalOpen, setIsExtraProdModalOpen] = useState(false);
  const [productoPendiente, setProductoPendiente] = useState(null);
  const [extraProdForm, setExtraProdForm] = useState({
    codigoBarrasIngreso: "",
    // ✅ sigue siendo "marca" internamente para no romper tu data
    marca: "", // (UI: Nombre del producto)
    lote: "",
    fechaVencimiento: "",
  });

  // ✅ Validaciones TIEMPO REAL (modal datos extra)
  // (Se muestran SOLO después de tocar el campo)
  const [extraProdErrors, setExtraProdErrors] = useState({
    codigoBarrasIngreso: "",
    marca: "",
    lote: "",
    fechaVencimiento: "",
  });

  // ✅ Touched (para NO mostrar errores al abrir)
  const [extraTouched, setExtraTouched] = useState({
    codigoBarrasIngreso: false,
    marca: false,
    lote: false,
    fechaVencimiento: false,
  });

  // ✅ Modal "Ver detalles" (EDITABLE, solo nuevos datos)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [productoDetalles, setProductoDetalles] = useState(null);
  const [detalleIndex, setDetalleIndex] = useState(null);
  const [detalleEdit, setDetalleEdit] = useState({
    codigoBarrasIngreso: "",
    // ✅ sigue siendo "marca" internamente para no romper tu data
    marca: "", // (UI: Nombre del producto)
    lote: "",
    fechaVencimiento: "",
  });

  // ✅ Validaciones TIEMPO REAL (modal ver/editar)
  // (Se muestran SOLO después de tocar el campo)
  const [detalleErrors, setDetalleErrors] = useState({
    codigoBarrasIngreso: "",
    marca: "",
    lote: "",
    fechaVencimiento: "",
  });

  // ✅ Touched (para NO mostrar errores al abrir)
  const [detalleTouched, setDetalleTouched] = useState({
    codigoBarrasIngreso: false,
    marca: false,
    lote: false,
    fechaVencimiento: false,
  });

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
    isProductModalOpen ||
    isSupplierModalOpen ||
    isExtraProdModalOpen ||
    isViewDetailsOpen;

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
  // ✅ Validación por campo (TIEMPO REAL)
  // 1) codigoBarrasIngreso: numérico, 13 dígitos, obligatorio
  // 2) marca (UI: Nombre del producto): obligatoria
  // 3) lote: alfanumérico (sin espacios/símbolos), obligatorio
  // 4) fechaVencimiento: NO obligatoria; si existe, >= hoy+4
  // =========================
  const validateOne = (field, form) => {
    const v = String(form?.[field] ?? "").trim();

    if (field === "codigoBarrasIngreso") {
      if (!v) return "El código de barras es obligatorio.";
      if (!/^\d+$/.test(v)) return "El código de barras debe ser solo numérico.";
      if (v.length !== 13) return "Debe tener exactamente 13 dígitos.";
      return "";
    }

    // ✅ ahora es "Nombre del producto" en UI
    if (field === "marca") {
      if (!v) return "El nombre del producto es obligatorio.";
      return "";
    }

    if (field === "lote") {
      if (!v) return "El lote es obligatorio.";
      if (!/^[a-zA-Z0-9]+$/.test(v))
        return "Debe ser alfanumérico (sin espacios ni caracteres especiales).";
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
    marca: validateOne("marca", form),
    lote: validateOne("lote", form),
    fechaVencimiento: validateOne("fechaVencimiento", form),
  });

  const hasErrors = (errs) =>
    Object.values(errs).some((msg) => String(msg || "").trim().length > 0);

  // ✅ Botones deshabilitados según validación REAL (aunque no muestre errores todavía)
  const extraDisabled = useMemo(() => hasErrors(computeErrors(extraProdForm)), [extraProdForm]);
  const detalleDisabled = useMemo(() => hasErrors(computeErrors(detalleEdit)), [detalleEdit]);

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
      .filter(
        (p) => normalizeText(p.nit).includes(q) || normalizeText(p.nombre).includes(q)
      )
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
  // Selección proveedor / producto
  // =========================
  const seleccionarProveedor = (prov) => {
    setProveedor(prov);
    setProveedorQuery(`${prov.nombre} (${prov.nit})`);
    setMensajeProveedor({
      tipo: "ok",
      texto: `✅ Proveedor seleccionado: ${prov.nombre}`,
    });
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
  // Cálculos
  // =========================
  const calcularSubtotal = (prod) => {
    const cantidad = Number(prod.cantidad || 0);
    const precioCompra = Number(prod.precioCompra || 0);

    const ivaPct = Number(prod.subida || 0);
    const icuPct = Number(prod.descuento || 0);

    const base = precioCompra * cantidad;
    const iva = (base * ivaPct) / 100;
    const icu = (base * icuPct) / 100;

    return base + iva + icu;
  };

  const total = useMemo(
    () => productos.reduce((acc, p) => acc + calcularSubtotal(p), 0),
    [productos]
  );

  // =========================
  // ✅ Ver detalles (EDITABLE) - SOLO nuevos datos
  // =========================
  const verDetallesProducto = (producto, index) => {
    setProductoDetalles(producto);
    setDetalleIndex(index);

    const initial = {
      codigoBarrasIngreso: producto?.codigoBarrasIngreso ?? "",
      marca: producto?.marca ?? "",
      lote: producto?.lote ?? "",
      fechaVencimiento: producto?.fechaVencimiento ?? "",
    };

    setDetalleEdit(initial);

    // ✅ NO mostrar errores al abrir
    setDetalleErrors({
      codigoBarrasIngreso: "",
      marca: "",
      lote: "",
      fechaVencimiento: "",
    });
    setDetalleTouched({
      codigoBarrasIngreso: false,
      marca: false,
      lote: false,
      fechaVencimiento: false,
    });

    setIsViewDetailsOpen(true);
  };

  const guardarCambiosDetalles = () => {
    if (detalleIndex == null) return;

    // ✅ forzar mostrar errores si intentan guardar
    setDetalleTouched({
      codigoBarrasIngreso: true,
      marca: true,
      lote: true,
      fechaVencimiento: true,
    });

    const errs = computeErrors(detalleEdit);
    setDetalleErrors(errs);
    if (hasErrors(errs)) return;

    setProductos((prev) => {
      const copia = [...prev];
      copia[detalleIndex] = {
        ...copia[detalleIndex],
        codigoBarrasIngreso: detalleEdit.codigoBarrasIngreso,
        marca: detalleEdit.marca,
        lote: detalleEdit.lote,
        fechaVencimiento: detalleEdit.fechaVencimiento,
      };
      return copia;
    });

    setProductoDetalles((prev) =>
      prev
        ? {
            ...prev,
            codigoBarrasIngreso: detalleEdit.codigoBarrasIngreso,
            marca: detalleEdit.marca,
            lote: detalleEdit.lote,
            fechaVencimiento: detalleEdit.fechaVencimiento,
          }
        : prev
    );

    setIsViewDetailsOpen(false);
  };

  // =========================
  // ✅ Modal datos extra antes de agregar
  // =========================
  const abrirModalDatosExtra = (productoEncontrado) => {
    setProductoPendiente(productoEncontrado);

    const prefillBarcode =
      productoEncontrado?.codigoBarras ?? getCodigoBarras(productoEncontrado) ?? "";

    const initial = {
      codigoBarrasIngreso: String(prefillBarcode || ""),
      marca: "",
      lote: "",
      fechaVencimiento: "",
    };

    setExtraProdForm(initial);

    // ✅ NO mostrar errores al abrir
    setExtraProdErrors({
      codigoBarrasIngreso: "",
      marca: "",
      lote: "",
      fechaVencimiento: "",
    });
    setExtraTouched({
      codigoBarrasIngreso: false,
      marca: false,
      lote: false,
      fechaVencimiento: false,
    });

    setIsExtraProdModalOpen(true);
  };

  const confirmarDatosExtraYAgregar = () => {
    if (!productoPendiente) return;

    // ✅ forzar mostrar errores si intentan agregar
    setExtraTouched({
      codigoBarrasIngreso: true,
      marca: true,
      lote: true,
      fechaVencimiento: true,
    });

    const errs = computeErrors(extraProdForm);
    setExtraProdErrors(errs);
    if (hasErrors(errs)) return;

    const enriched = {
      ...productoPendiente,
      codigoBarrasIngreso: extraProdForm.codigoBarrasIngreso.trim(),
      marca: extraProdForm.marca.trim(), // (UI: nombre)
      lote: extraProdForm.lote.trim(),
      fechaVencimiento: extraProdForm.fechaVencimiento, // puede ser ""
    };

    setIsExtraProdModalOpen(false);
    setProductoPendiente(null);

    agregarProducto(enriched);
  };

  const cancelarDatosExtra = () => {
    setIsExtraProdModalOpen(false);
    setProductoPendiente(null);
    setExtraProdErrors({
      codigoBarrasIngreso: "",
      marca: "",
      lote: "",
      fechaVencimiento: "",
    });
    setExtraTouched({
      codigoBarrasIngreso: false,
      marca: false,
      lote: false,
      fechaVencimiento: false,
    });
  };

  // =========================
  // Agregar producto (guarda nuevos campos)
  // =========================
  const agregarProducto = (productoEncontrado) => {
    const id = String(
      productoEncontrado?.id_producto ??
        productoEncontrado?.id ??
        getProductoId(productoEncontrado)
    );

    if (id && selectedProductIds.has(String(id))) {
      setMensajeProducto({
        tipo: "error",
        texto: "⚠️ Este producto ya fue agregado.",
      });
      setProductoQuery("");
      setIsProdOpen(false);
      setProdActiveIndex(-1);
      return;
    }

    setProductos((prev) => [
      ...prev,
      {
        ...productoEncontrado,
        productoId: id,
        cantidad: "1",
        subida: "0",
        descuento: "0",
        precioCompra: String(Number(productoEncontrado.precio ?? 0)),
        precioVenta: Number(productoEncontrado.precioVenta ?? 0),

        // ✅ nuevos campos
        codigoBarrasIngreso: productoEncontrado.codigoBarrasIngreso ?? "",
        marca: productoEncontrado.marca ?? "", // (UI: nombre)
        lote: productoEncontrado.lote ?? "",
        fechaVencimiento: productoEncontrado.fechaVencimiento ?? "",
      },
    ]);

    setMensajeProducto({
      tipo: "ok",
      texto: `✅ Producto agregado: ${productoEncontrado.nombre}`,
    });

    setProductoQuery("");
    setIsProdOpen(false);
    setProdActiveIndex(-1);
  };

  // =========================
  // Producto creado desde modal => pedir datos extra
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
    abrirModalDatosExtra(mapped);
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
      setProvActiveIndex((prev) =>
        Math.min(prev + 1, proveedoresFiltrados.length - 1)
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setProvActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      if (
        isProvOpen &&
        provActiveIndex >= 0 &&
        proveedoresFiltrados[provActiveIndex]
      ) {
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
      setProdActiveIndex((prev) =>
        Math.min(prev + 1, productosFiltrados.length - 1)
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setProdActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();

      if (
        isProdOpen &&
        prodActiveIndex >= 0 &&
        productosFiltrados[prodActiveIndex]
      ) {
        abrirModalDatosExtra(productosFiltrados[prodActiveIndex]);
        return;
      }

      if (productosFiltrados.length > 0) abrirModalDatosExtra(productosFiltrados[0]);
      else {
        setMensajeProducto({
          tipo: "error",
          texto:
            "❌ Producto no encontrado. Selecciónalo de la lista o regístralo.",
        });
      }
    }
  };

  // =========================
  // ✅ Generar número de factura: 001..999
  // =========================
  const generarNumeroFactura = () => {
    const facturas = JSON.parse(localStorage.getItem("facturas")) || [];

    const ultimoNumero = facturas.length
      ? Math.max(...facturas.map((f) => Number(f.num_factura || 0)))
      : 0;

    const siguiente = ultimoNumero + 1;

    if (siguiente > 999) {
      setMensajeComprobante({
        tipo: "error",
        texto: "⚠️ Se alcanzó el límite de numeración de facturas (999)",
      });
      return null;
    }

    return String(siguiente).padStart(3, "0");
  };

  // =========================
  // ✅ Generar ID compra consecutivo: 1..n
  // =========================
  const generarIdCompra = () => {
    const compras = JSON.parse(localStorage.getItem("compras")) || [];

    const ultimoId = compras.length
      ? Math.max(...compras.map((c) => Number(c.id || 0)))
      : 0;

    return ultimoId + 1;
  };

  // =========================
  // ✅ Comprobante (validación + alerta estilo)
  // =========================
  const validarComprobante = (file) => {
    if (!file) {
      setMensajeComprobante({
        tipo: "error",
        texto: "⚠️ Debe subir el comprobante original de la compra",
      });
      return false;
    }

    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!allowed.includes(file.type)) {
      setMensajeComprobante({
        tipo: "error",
        texto: "⚠️ Formato no válido. Sube PDF o imagen (JPG/PNG/WebP).",
      });
      return false;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
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

  const handleComprobanteUpload = (e) => {
    const file = e.target.files?.[0] || null;
    setComprobante(file);
    validarComprobante(file);
  };

  // =========================
  // ✅ Finalizar compra
  // =========================
  const handleFinalizarCompra = () => {
    setMensajeComprobante(null);

    if (!proveedor) {
      setMensajeProveedor({ tipo: "error", texto: "⚠️ Debe seleccionar un proveedor" });
      return;
    }

    if (productos.length === 0) {
      setMensajeProducto({ tipo: "error", texto: "⚠️ Debe agregar al menos un producto" });
      return;
    }

    // ✅ validar que todos los productos cumplen reglas
    for (const p of productos) {
      const errs = computeErrors({
        codigoBarrasIngreso: p.codigoBarrasIngreso,
        marca: p.marca,
        lote: p.lote,
        fechaVencimiento: p.fechaVencimiento,
      });
      if (hasErrors(errs)) {
        setMensajeProducto({
          tipo: "error",
          texto: `⚠️ Revisa los detalles del producto "${p.nombre}". Hay datos inválidos.`,
        });
        return;
      }
    }

    if (!validarComprobante(comprobante)) return;

    const num = generarNumeroFactura();
    if (!num) return;
    setNumFactura(num);

    const idCompra = generarIdCompra();

    const ivaTotal = productos.reduce(
      (acc, p) =>
        acc + (Number(p.precioCompra) * Number(p.cantidad) * Number(p.subida)) / 100,
      0
    );

    const icuTotal = productos.reduce(
      (acc, p) =>
        acc +
        (Number(p.precioCompra) * Number(p.cantidad) * Number(p.descuento)) / 100,
      0
    );

    const facturaId = Date.now();

    const factura = {
      id_factura: facturaId,
      num_factura: num,
      fecha_registro: fechaFactura.toISOString(),
      valor_factura: total,
      iva: ivaTotal,
      icu: icuTotal,
      comprobante_pago: comprobante.name,
      id_compra: idCompra,
      detalles: productos.map((p) => ({
        id_detalle_producto: p.id_detalle_producto ?? p.productoId,
        id_producto: p.id_producto ?? p.productoId,
        cantidad: Number(p.cantidad),
        precio_unitario: Number(p.precioCompra),
        subtotal: calcularSubtotal(p),
        iva_aplicado: Number(p.subida),
        icu_aplicado: Number(p.descuento),
        lote: p.lote,
        marca: p.marca, // (UI: nombre del producto)
        fecha_vencimiento: p.fechaVencimiento,
        codigo_barras: p.codigoBarrasIngreso,
      })),
    };

    const facturasGuardadas = JSON.parse(localStorage.getItem("facturas")) || [];
    facturasGuardadas.push(factura);
    localStorage.setItem("facturas", JSON.stringify(facturasGuardadas));

    const compra = {
      id: idCompra,
      facturaId,
      numero_factura: num,
      fecha: fechaFactura.toISOString(),
      proveedor: {
        id_proveedor: proveedor.id_proveedor ?? proveedor.id ?? null,
        nombre: proveedor.nombre ?? "—",
        nit: proveedor.nit ?? "—",
      },
      total,
      estado: "Completada",
      comprobante: { name: comprobante.name, type: comprobante.type },
      productos: productos.map((p) => ({
        productoId: p.productoId ?? p.id_producto ?? p.id ?? null,
        nombre: p.nombre ?? "—",
        cantidad: Number(p.cantidad),
        precioCompra: Number(p.precioCompra),
        subida: Number(p.subida),
        descuento: Number(p.descuento),
        subtotal: calcularSubtotal(p),
        codigoBarrasIngreso: p.codigoBarrasIngreso,
        marca: p.marca, // (UI: nombre del producto)
        lote: p.lote,
        fechaVencimiento: p.fechaVencimiento,
      })),
    };

    const comprasGuardadas = JSON.parse(localStorage.getItem("compras")) || [];
    comprasGuardadas.push(compra);
    localStorage.setItem("compras", JSON.stringify(comprasGuardadas));

    navigate("/app/purchases");
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
                  texto:
                    "❌ Proveedor no encontrado. Selecciónalo de la lista o créalo.",
                });
              }
            }}
            onFocus={() => {
              if (proveedorQuery.trim()) setIsProvOpen(true);
            }}
            onKeyDown={onProveedorKeyDown}
            placeholder={
              isSuppliersLoading ? "Cargando proveedores..." : "Ingrese NIT o nombre"
            }
            disabled={isSuppliersLoading}
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
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
                  texto:
                    "❌ Producto no encontrado. Selecciónalo de la lista o regístralo.",
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
            placeholder={
              isProductsLoading
                ? "Cargando productos..."
                : "Ingrese código, barras o nombre"
            }
            disabled={isProductsLoading}
            className="flex-1 border rounded px-3 py-2 bg-white text-black disabled:opacity-60"
          />

          {mensajeProducto?.tipo === "error" && (
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "auto" });
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
                    abrirModalDatosExtra(p);
                  }}
                  className={`px-3 py-2 text-black ${
                    idx === prodActiveIndex ? "bg-green-50" : "hover:bg-green-50"
                  } cursor-pointer`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>{p.nombre}</div>

                    <span
                      className={`text-[11px] px-2 py-[2px] rounded-full font-semibold ${
                        sinStock
                          ? "bg-red-100 text-red-700"
                          : "bg-green-50 text-green-700"
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
            productos.map((prod, i) => (
              <tr key={`${prod.productoId ?? getProductoId(prod)}-${i}`}>
                <td className="border px-3 py-2 text-black">{prod.nombre}</td>

                <td className="border px-3 py-2 text-center text-black">
                  {Number(prod.stock ?? 0)}
                </td>

                <td className="border px-3 py-2 text-center">
                  <input
                    type="number"
                    min="1"
                    value={prod.cantidad}
                    onChange={(e) => {
                      const nueva = [...productos];
                      nueva[i].cantidad = e.target.value;
                      setProductos(nueva);
                    }}
                    onBlur={() => {
                      const nueva = [...productos];
                      const v = nueva[i].cantidad;
                      const n = Number(v);
                      nueva[i].cantidad =
                        v === "" || !Number.isFinite(n) || n < 1
                          ? "1"
                          : String(Math.floor(n));
                      setProductos(nueva);
                    }}
                    className="w-16 border rounded px-2 py-1 text-center bg-white text-black"
                  />
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
                      className={
                        "w-16 border rounded-l px-2 py-1 text-center bg-white text-black" +
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
                      className={
                        "w-16 border rounded-l px-2 py-1 text-center bg-white text-black" +
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
                    className="w-24 border rounded px-2 py-1 text-center bg-white text-black"
                  />
                </td>

                <td className="border px-3 py-2 text-center text-black">
                  ${Number(prod.precioVenta ?? 0).toLocaleString("es-CO")}
                </td>

                <td className="border px-3 py-2 text-center text-black">
                  ${calcularSubtotal(prod).toLocaleString("es-CO")}
                </td>

                <td className="border px-3 py-2">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => verDetallesProducto(prod, i)}
                      title="Ver / editar detalles"
                      className="text-blue-600 hover:text-blue-800"
                      type="button"
                    >
                      <FiEdit size={18} />
                    </button>

                    <button
                      onClick={() =>
                        setProductos(productos.filter((_, idx) => idx !== i))
                      }
                      title="Eliminar"
                      className="text-red-600 hover:text-red-800"
                      type="button"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Comprobante + total */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">
            Subir comprobante original
          </label>

          <input type="file" accept="image/*,application/pdf" onChange={handleComprobanteUpload} />

          {mensajeComprobante && (
            <p
              className={`mt-1 text-sm ${
                mensajeComprobante.tipo === "ok" ? "text-green-600" : "text-red-600"
              }`}
            >
              {mensajeComprobante.texto}
            </p>
          )}
        </div>

        <div className="text-right bg-gray-100 px-4 py-2 rounded shadow-md">
          <p className="text-sm text-gray-600">Total a pagar</p>
          <p className="text-2xl font-bold text-green-700">
            ${total.toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={() => navigate("/app/purchases")}
          className="px-4 py-2 rounded bg-gray-500 text-white"
          type="button"
        >
          Cancelar
        </button>
        <button
          onClick={handleFinalizarCompra}
          className="px-4 py-2 rounded bg-green-600 text-white"
          type="button"
        >
          Finalizar Compra
        </button>
      </div>

      {/* =========================
          MODAL DATOS EXTRA ANTES DE AGREGAR
         ========================= */}
      {isExtraProdModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">Datos del producto</h3>
            <p className="text-sm text-gray-500 mb-3">
              Completa la información antes de agregarlo a la compra
            </p>

            <div className="space-y-3">
              {/* Código de barras */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Código de barras
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={13}
                  value={extraProdForm.codigoBarrasIngreso}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 13);
                    const next = { ...extraProdForm, codigoBarrasIngreso: value };
                    setExtraProdForm(next);

                    if (extraTouched.codigoBarrasIngreso) {
                      setExtraProdErrors((prev) => ({
                        ...prev,
                        codigoBarrasIngreso: validateOne("codigoBarrasIngreso", next),
                      }));
                    }
                  }}
                  onBlur={() => {
                    setExtraTouched((t) => ({ ...t, codigoBarrasIngreso: true }));
                    setExtraProdErrors((prev) => ({
                      ...prev,
                      codigoBarrasIngreso: validateOne("codigoBarrasIngreso", extraProdForm),
                    }));
                  }}
                  className={`w-full border rounded px-3 py-2 bg-white text-black outline-none ${
                    extraTouched.codigoBarrasIngreso && extraProdErrors.codigoBarrasIngreso
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Ej: 7701234567890"
                />
                {extraTouched.codigoBarrasIngreso && extraProdErrors.codigoBarrasIngreso && (
                  <p className="mt-1 text-xs text-red-600">
                    {extraProdErrors.codigoBarrasIngreso}
                  </p>
                )}
              </div>

              {/* ✅ Nombre del producto (ANTES era Marca) */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  value={extraProdForm.marca}
                  onChange={(e) => {
                    const next = { ...extraProdForm, marca: e.target.value };
                    setExtraProdForm(next);

                    if (extraTouched.marca) {
                      setExtraProdErrors((prev) => ({
                        ...prev,
                        marca: validateOne("marca", next),
                      }));
                    }
                  }}
                  onBlur={() => {
                    setExtraTouched((t) => ({ ...t, marca: true }));
                    setExtraProdErrors((prev) => ({
                      ...prev,
                      marca: validateOne("marca", extraProdForm),
                    }));
                  }}
                  className={`w-full border rounded px-3 py-2 bg-white text-black outline-none ${
                    extraTouched.marca && extraProdErrors.marca
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Ej: Colgate Triple Acción"
                />
                {extraTouched.marca && extraProdErrors.marca && (
                  <p className="mt-1 text-xs text-red-600">{extraProdErrors.marca}</p>
                )}
              </div>

              {/* Lote */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Lote</label>
                <input
                  type="text"
                  value={extraProdForm.lote}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, "");
                    const next = { ...extraProdForm, lote: value };
                    setExtraProdForm(next);

                    if (extraTouched.lote) {
                      setExtraProdErrors((prev) => ({
                        ...prev,
                        lote: validateOne("lote", next),
                      }));
                    }
                  }}
                  onBlur={() => {
                    setExtraTouched((t) => ({ ...t, lote: true }));
                    setExtraProdErrors((prev) => ({
                      ...prev,
                      lote: validateOne("lote", extraProdForm),
                    }));
                  }}
                  className={`w-full border rounded px-3 py-2 bg-white text-black outline-none ${
                    extraTouched.lote && extraProdErrors.lote
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Ej: LOTE001"
                />
                {extraTouched.lote && extraProdErrors.lote && (
                  <p className="mt-1 text-xs text-red-600">{extraProdErrors.lote}</p>
                )}
              </div>

              {/* Fecha vencimiento */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Fecha de vencimiento{" "}
                  <span className="text-xs text-gray-400">(opcional)</span>
                </label>
                <input
                  type="date"
                  min={minExpiryDateStr}
                  value={extraProdForm.fechaVencimiento}
                  onChange={(e) => {
                    const next = { ...extraProdForm, fechaVencimiento: e.target.value };
                    setExtraProdForm(next);

                    if (extraTouched.fechaVencimiento) {
                      setExtraProdErrors((prev) => ({
                        ...prev,
                        fechaVencimiento: validateOne("fechaVencimiento", next),
                      }));
                    }
                  }}
                  onBlur={() => {
                    setExtraTouched((t) => ({ ...t, fechaVencimiento: true }));
                    setExtraProdErrors((prev) => ({
                      ...prev,
                      fechaVencimiento: validateOne("fechaVencimiento", extraProdForm),
                    }));
                  }}
                  className={`w-full border rounded px-3 py-2 bg-white text-black outline-none ${
                    extraTouched.fechaVencimiento && extraProdErrors.fechaVencimiento
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {extraTouched.fechaVencimiento && extraProdErrors.fechaVencimiento && (
                  <p className="mt-1 text-xs text-red-600">
                    {extraProdErrors.fechaVencimiento}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-gray-400">
                  Permitido desde: <b>{minExpiryDateStr}</b>
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelarDatosExtra}
                className="px-4 py-2 rounded bg-gray-500 text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarDatosExtraYAgregar}
                disabled={extraDisabled}
                className={`px-4 py-2 rounded text-white ${
                  extraDisabled
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          MODAL VER / EDITAR DETALLES
         ========================= */}
      {isViewDetailsOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalles del producto
                </h3>
                <p className="text-xs text-gray-500">
                  Edita la información adicional ingresada
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsViewDetailsOpen(false)}
                className="px-2 py-1 rounded hover:bg-gray-200 text-gray-600"
                title="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              {/* Código de barras */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Código de barras
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={13}
                  value={detalleEdit.codigoBarrasIngreso}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 13);
                    const next = { ...detalleEdit, codigoBarrasIngreso: value };
                    setDetalleEdit(next);

                    if (detalleTouched.codigoBarrasIngreso) {
                      setDetalleErrors((prev) => ({
                        ...prev,
                        codigoBarrasIngreso: validateOne("codigoBarrasIngreso", next),
                      }));
                    }
                  }}
                  onBlur={() => {
                    setDetalleTouched((t) => ({ ...t, codigoBarrasIngreso: true }));
                    setDetalleErrors((prev) => ({
                      ...prev,
                      codigoBarrasIngreso: validateOne("codigoBarrasIngreso", detalleEdit),
                    }));
                  }}
                  className={`w-full border rounded px-3 py-2 bg-white text-black outline-none ${
                    detalleTouched.codigoBarrasIngreso && detalleErrors.codigoBarrasIngreso
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {detalleTouched.codigoBarrasIngreso && detalleErrors.codigoBarrasIngreso && (
                  <p className="mt-1 text-xs text-red-600">
                    {detalleErrors.codigoBarrasIngreso}
                  </p>
                )}
              </div>

              {/* ✅ Nombre del producto (ANTES era Marca) */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  value={detalleEdit.marca}
                  onChange={(e) => {
                    const next = { ...detalleEdit, marca: e.target.value };
                    setDetalleEdit(next);

                    if (detalleTouched.marca) {
                      setDetalleErrors((prev) => ({
                        ...prev,
                        marca: validateOne("marca", next),
                      }));
                    }
                  }}
                  onBlur={() => {
                    setDetalleTouched((t) => ({ ...t, marca: true }));
                    setDetalleErrors((prev) => ({
                      ...prev,
                      marca: validateOne("marca", detalleEdit),
                    }));
                  }}
                  className={`w-full border rounded px-3 py-2 bg-white text-black outline-none ${
                    detalleTouched.marca && detalleErrors.marca
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Ej: Colgate Triple Acción"
                />
                {detalleTouched.marca && detalleErrors.marca && (
                  <p className="mt-1 text-xs text-red-600">{detalleErrors.marca}</p>
                )}
              </div>

              {/* Lote */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Lote</label>
                <input
                  type="text"
                  value={detalleEdit.lote}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, "");
                    const next = { ...detalleEdit, lote: value };
                    setDetalleEdit(next);

                    if (detalleTouched.lote) {
                      setDetalleErrors((prev) => ({
                        ...prev,
                        lote: validateOne("lote", next),
                      }));
                    }
                  }}
                  onBlur={() => {
                    setDetalleTouched((t) => ({ ...t, lote: true }));
                    setDetalleErrors((prev) => ({
                      ...prev,
                      lote: validateOne("lote", detalleEdit),
                    }));
                  }}
                  className={`w-full border rounded px-3 py-2 bg-white text-black outline-none ${
                    detalleTouched.lote && detalleErrors.lote ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {detalleTouched.lote && detalleErrors.lote && (
                  <p className="mt-1 text-xs text-red-600">{detalleErrors.lote}</p>
                )}
              </div>

              {/* Fecha vencimiento */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Fecha de vencimiento{" "}
                  <span className="text-xs text-gray-400">(opcional)</span>
                </label>
                <input
                  type="date"
                  min={minExpiryDateStr}
                  value={detalleEdit.fechaVencimiento}
                  onChange={(e) => {
                    const next = { ...detalleEdit, fechaVencimiento: e.target.value };
                    setDetalleEdit(next);

                    if (detalleTouched.fechaVencimiento) {
                      setDetalleErrors((prev) => ({
                        ...prev,
                        fechaVencimiento: validateOne("fechaVencimiento", next),
                      }));
                    }
                  }}
                  onBlur={() => {
                    setDetalleTouched((t) => ({ ...t, fechaVencimiento: true }));
                    setDetalleErrors((prev) => ({
                      ...prev,
                      fechaVencimiento: validateOne("fechaVencimiento", detalleEdit),
                    }));
                  }}
                  className={`w-full border rounded px-3 py-2 bg-white text-black outline-none ${
                    detalleTouched.fechaVencimiento && detalleErrors.fechaVencimiento
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {detalleTouched.fechaVencimiento && detalleErrors.fechaVencimiento && (
                  <p className="mt-1 text-xs text-red-600">
                    {detalleErrors.fechaVencimiento}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-gray-400">
                  Permitido desde: <b>{minExpiryDateStr}</b>
                </p>
              </div>
            </div>

            <div className="px-5 py-4 border-t bg-white flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsViewDetailsOpen(false)}
                className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={guardarCambiosDetalles}
                disabled={detalleDisabled}
                className={`px-4 py-2 rounded text-white ${
                  detalleDisabled
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Guardar cambios
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
