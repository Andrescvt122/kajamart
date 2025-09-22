// App.jsx
import { Routes, Route } from "react-router-dom";
import { PrimeReactProvider } from 'primereact/api';
import { Button } from "primereact/button";
import RoutesAdmin from "./routes.jsx";


export default function App() {
  return (
    <>
    <PrimeReactProvider>
    <RoutesAdmin />
    </PrimeReactProvider>
    </>
  );
}
