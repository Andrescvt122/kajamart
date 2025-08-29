<<<<<<< HEAD
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
=======

import React from "react";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  CancelButton,
  SaveButton,
  CloseButton,
  DeleteTextButton,
  EditTextButton,
  ExportExcelButton,
  ExportPDFButton

import './App.css'
import Sidebar from './shared/sidebar.jsx'

function App() {

} from "./shared/buttons";

export default function App() {
  return (

    <>
    <Sidebar />
    </>
  )
}
  );
>>>>>>> 38339dc86a217011c4b612532c60de3cee37adab
}
