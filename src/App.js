import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardEstoque from "./DashBoard_Estoque_Devolução";
import DashboardReversa from "./Dashboard_Produtividade_Reversa";
import DashboardVenlot from "./DashBoard_Entrada_Saída_VenLot";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* URL principal abre o Estoque */}
        <Route path="/dev" element={<DashboardEstoque />} />

        {/* URL com /reversa no final abre a Reversa */}
        <Route path="/rev" element={<DashboardReversa />} />

        {/* URL principal abre o Estoque */}
        <Route path="/ven" element={<DashboardVenlot />} />
      </Routes>
    </BrowserRouter>
  );
}
