import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import IndexClientReturns from "../indexClientReturns.jsx";

const mockHasPermission = jest.fn();
const mockFetchPage = jest.fn();
const mockAnnulReturnClient = jest.fn();
const mockSearchHook = jest.fn(() => ({ data: [], loading: false, error: null }));
const mockExportReturnClientsExcel = jest.fn();
const mockExportReturnClientsPdf = jest.fn();

jest.mock("../helpers/exportToPdf", () => ({
  exportClientReturnsToPDF: jest.fn(),
}));

jest.mock("../helpers/exportToXls", () => ({
  exportClientReturnsToExcel: jest.fn(),
}));

jest.mock("framer-motion", () => {
  const React = require("react");
  const createMotionComponent = (tag) =>
    React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(tag, { ref, ...props }, children),
    );

  return {
    AnimatePresence: ({ children }) =>
      React.createElement(React.Fragment, null, children),
    motion: new Proxy(
      {},
      {
        get: (_, tag) => createMotionComponent(tag),
      },
    ),
  };
});

jest.mock("../../../../context/useAtuh.jsx", () => ({
  useAuth: () => ({
    hasPermission: mockHasPermission,
    payload: { uid: 1 },
  }),
}));

jest.mock(
  "../../../../shared/components/hooks/returnClients/useFetchReturnClients.jsx",
  () => ({
    useFetchReturnClients: () => ({
      fetchPage: mockFetchPage,
      pagesCache: {
        1: [
          {
            idReturn: 1,
            idSale: 101,
            dateReturn: "10/03/2026",
            dateISO: "2026-03-10",
            createdAt: "2026-03-10",
            client: "Juan Perez",
            isActive: true,
            productsReturned: [
              {
                idProduct: 1,
                name: "Producto A",
                quantity: 2,
                totalValue: 20000,
                reason: "Defectuoso",
              },
            ],
            productsDelivered: [],
          },
        ],
      },
      meta: { limit: 6, nextCursor: null },
      loading: false,
      error: null,
      reset: jest.fn(),
      getTotalPages: () => 1,
      getLoadedCount: () => 1,
    }),
  }),
);

jest.mock(
  "../../../../shared/components/hooks/returnClients/useSearchReturnClients",
  () => ({
    useSearchReturnClients: (...args) => mockSearchHook(...args),
  }),
);

jest.mock(
  "../../../../shared/components/hooks/returnClients/useExportReturnClients",
  () => ({
    useExportReturnClients: () => ({
      exportReturnClientsExcel: mockExportReturnClientsExcel,
      exportReturnClientsPdf: mockExportReturnClientsPdf,
      loading: false,
    }),
  }),
);

jest.mock(
  "../../../../shared/components/hooks/returnClients/useAnnulReturnClient.js",
  () => ({
    useAnnulReturnClient: () => ({
      annulReturnClient: mockAnnulReturnClient,
      loading: false,
    }),
  }),
);

jest.mock(
  "../../../../shared/components/hooks/useAnnulmentWindow.js",
  () => ({
    useAnnulmentWindow: () => ({
      getAnnulmentMeta: () => ({ isDisabled: false }),
    }),
  }),
);

jest.mock("../../../../shared/components/paginator.jsx", () => () => (
  <div>Paginador</div>
));

jest.mock("../modals/registerClientReturn/returnSaleComponent.jsx", () => () => (
  <div>Modal registro</div>
));

jest.mock("../modals/detailsClientReturn/detailsClientReturn.jsx", () => () => (
  <div>Modal detalles</div>
));

jest.mock("../../../../shared/components/StatusFilterDropdown.jsx", () => () => (
  <div>Filtro estado</div>
));

jest.mock("../ReturnClientHelpVideos", () => () => <div>Panel ayuda</div>);

jest.mock("../../../../shared/components/buttons.jsx", () => ({
  ExportExcelButton: ({ children, event }) => (
    <button onClick={event}>{children}</button>
  ),
  ExportPDFButton: ({ children, event }) => (
    <button onClick={event}>{children}</button>
  ),
  ViewDetailsButton: ({ event }) => (
    <button onClick={event}>Ver detalles</button>
  ),
}));

describe("PermissionsUI", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchHook.mockReturnValue({ data: [], loading: false, error: null });
  });

  test("debe mostrar el botón registrar nueva devolución si tiene permiso", () => {
    mockHasPermission.mockImplementation((permiso) => {
      if (permiso === "Crear devolucion clientes") return true;
      if (permiso === "Anular devolucion cliente") return true;
      return false;
    });

    render(<IndexClientReturns />);

    expect(
      screen.getByRole("button", { name: "Registrar nueva devolución" })
    ).toBeInTheDocument();
  });

  test("debe ocultar el botón registrar nueva devolución si no tiene permiso", () => {
    mockHasPermission.mockReturnValue(false);

    render(<IndexClientReturns />);

    expect(
      screen.queryByRole("button", { name: "Registrar nueva devolución" })
    ).not.toBeInTheDocument();
  });

  test("debe deshabilitar el switch si no tiene permiso para anular", () => {
    mockHasPermission.mockImplementation((permiso) => {
      if (permiso === "Crear devolucion clientes") return true;
      if (permiso === "Anular devolucion cliente") return false;
      return false;
    });

    render(<IndexClientReturns />);

    expect(screen.getByRole("switch")).toBeDisabled();
  });
});
