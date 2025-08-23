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

} from "./shared/buttons";

export default function App() {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="flex gap-4">
        <ViewButton />
        <EditButton />
        <DeleteButton />
      </div>

      <div className="flex gap-4">
        <CancelButton />
        <SaveButton />
        <DeleteTextButton />
        <EditTextButton />
      </div>

      <div className="mt-4">
        <CloseButton />
      </div>
      <div className="flex gap-4">
        <ExportExcelButton />
        <ExportPDFButton />
    </div>
    </div>
  );
}
