import React from "react";
import{
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
} from "./shared/buttons.jsx";
import Footer from './components/footerComponent'; // Importamos el componente Footer
// import './App.css'
import Sidebar from './shared/sidebar.jsx';
export default function App() {
  return (

    <>
    <Sidebar />
    {/* <ViewButton />
    <Footer />
    <EditButton />
    <DeleteButton />
    <CancelButton />
    <SaveButton />
    <CloseButton />
    <DeleteTextButton />
    <EditTextButton />
    <ExportExcelButton />
    <ExportPDFButton /> */}
    </>
  )
}
