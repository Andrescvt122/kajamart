import { Routes, Route, Link } from 'react-router-dom'
import IndexSuppliers from './features/suppliers/indexSuppliers.jsx'
import Sidebar from './shared/sidebar.jsx'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Sidebar/>} />
        <Route path="/suppliers" element={<IndexSuppliers />} />
      </Routes>
    </>
  )
}