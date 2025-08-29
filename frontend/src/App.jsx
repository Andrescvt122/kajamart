import { Routes, Route, Link } from 'react-router-dom'
import IndexSuppliers from './features/suppliers/indexSuppliers.jsx'

export default function App() {
  return (
    <>
      

      <Routes>
        <Route path="/" element={<h1>Bienvenido a YarcestaHot 🚀</h1>} />
        <Route path="/suppliers" element={<IndexSuppliers />} />
      </Routes>
    </>
  )
}
