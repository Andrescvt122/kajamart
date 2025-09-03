// App.jsx
import { Routes, Route } from "react-router-dom";
import RoutesAdmin from "./routes.jsx";

// 1. Importa los layouts
import MainLayout from "/src/layouts/MainLayout.jsx";
import AuthLayout from "/src/layouts/AuthLayout.jsx";
import Sidebar from "./shared/sidebar.jsx";

export default function App() {
  return (
    <>
    <RoutesAdmin />
    </>
  );
}
